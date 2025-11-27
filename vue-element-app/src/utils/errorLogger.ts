/**
 * 本地错误记录工具
 * 用于 Vue 应用的错误跟踪和性能监控
 */

// Vue 组件实例类型定义
interface VueComponentInstance {
  $options?: {
    name?: string
  }
}

export interface ErrorRecord {
  id: string
  timestamp: string
  type: 'javascript' | 'vue' | 'network' | 'performance' | 'user'
  message: string
  source?: string | undefined
  component?: string | undefined
  userAgent?: string | undefined
  url?: string | undefined
  userId?: string | undefined
  data?: unknown
}

export interface PerformanceRecord {
  id: string
  timestamp: string
  metric: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  context?: string | undefined
}

class ErrorLogger {
  private errors: ErrorRecord[] = []
  private performance: PerformanceRecord[] = []
  private maxErrors = 1000
  private maxPerformance = 500

  constructor() {
    this.loadFromStorage()
  }

  /**
   * 记录错误
   */
  logError(error: ErrorRecord): void {
    this.errors.push({
      ...error,
      id: error.id || this.generateId(),
      timestamp: error.timestamp || new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    this.saveToStorage()
    console.error('[ErrorLogger]', error)
  }

  /**
   * 记录 JavaScript 错误
   */
  logJavaScriptError(error: Error, source?: string): void {
    this.logError({
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'javascript',
      message: error.message,
      source: source || error.stack,
      data: {
        name: error.name,
        stack: error.stack
      }
    })
  }

  /**
   * 记录 Vue 错误
   */
  logVueError(error: unknown, instance: VueComponentInstance | null | undefined, info: string): void {
    const errorObj = error as Error
    this.logError({
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'vue',
      message: errorObj.message || String(error),
      component: instance?.$options?.name || 'Unknown',
      source: info,
      data: {
        error,
        info
      }
    })
  }

  /**
   * 记录网络错误
   */
  logNetworkError(url: string, status: number, message: string): void {
    this.logError({
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: 'network',
      message: `Network error: ${status} - ${message}`,
      source: url,
      data: {
        url,
        status
      }
    })
  }

  /**
   * 记录性能指标
   */
  logPerformance(metric: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms', context?: string): void {
    const record: PerformanceRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      metric,
      value,
      unit,
      context
    }

    this.performance.push(record)

    // 限制性能记录数量
    if (this.performance.length > this.maxPerformance) {
      this.performance = this.performance.slice(-this.maxPerformance)
    }

    this.saveToStorage()
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number
    byType: Record<string, number>
    recent: ErrorRecord[]
  } {
    const byType: Record<string, number> = {}

    this.errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1
    })

    return {
      total: this.errors.length,
      byType,
      recent: this.errors.slice(-10)
    }
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorRecord[] {
    return [...this.errors]
  }

  /**
   * 获取性能数据
   */
  getPerformanceData(): PerformanceRecord[] {
    return [...this.performance]
  }

  /**
   * 清除所有日志
   */
  clearAll(): void {
    this.errors = []
    this.performance = []
    this.saveToStorage()
  }

  /**
   * 导出错误报告
   */
  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      errors: this.errors,
      performance: this.performance,
      stats: this.getErrorStats()
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * 生成唯一ID
   */
  public generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    try {
      const errors = localStorage.getItem('vue-app-errors')
      const performance = localStorage.getItem('vue-app-performance')

      if (errors) {
        this.errors = JSON.parse(errors)
      }

      if (performance) {
        this.performance = JSON.parse(performance)
      }
    } catch (error) {
      console.warn('[ErrorLogger] Failed to load from storage:', error)
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('vue-app-errors', JSON.stringify(this.errors))
      localStorage.setItem('vue-app-performance', JSON.stringify(this.performance))
    } catch (error) {
      console.warn('[ErrorLogger] Failed to save to storage:', error)
    }
  }
}

// 创建全局实例
export const errorLogger = new ErrorLogger()

// 全局错误处理
if (typeof window !== 'undefined') {
  // JavaScript 错误
  window.addEventListener('error', (event) => {
    errorLogger.logJavaScriptError(event.error, event.filename)
  })

  // Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError({
      id: errorLogger.generateId(),
      timestamp: new Date().toISOString(),
      type: 'javascript',
      message: 'Unhandled Promise Rejection',
      source: event.reason?.stack || String(event.reason),
      data: { reason: event.reason }
    })
  })

  // 性能监控
  if ('performance' in window) {
    // 页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          // 使用现代 API - startTime 而不是已弃用的 navigationStart
          errorLogger.logPerformance('page-load', navigation.loadEventEnd - navigation.startTime, 'ms')
          errorLogger.logPerformance('dom-interactive', navigation.domInteractive - navigation.startTime, 'ms')
        }
      }, 0)
    })
  }
}

// Vue 错误插件
export const VueErrorPlugin = {
  install(app: { config: { errorHandler: (error: unknown, instance: VueComponentInstance | null | undefined, info: string) => void } }) {
    app.config.errorHandler = (error: unknown, instance: VueComponentInstance | null | undefined, info: string) => {
      errorLogger.logVueError(error, instance, info)
    }
  }
}

export default errorLogger
