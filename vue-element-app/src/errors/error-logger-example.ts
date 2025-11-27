/**
 * 本地错误日志工具示例
 * 用于在没有 Sentry 的情况下进行错误跟踪
 */

export interface ErrorLog {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string | undefined
  component?: string | undefined
  userAgent?: string | undefined
  url?: string | undefined
  userId?: string | undefined
  additionalData?: Record<string, unknown> | undefined
}

export interface PerformanceLog {
  id: string
  timestamp: string
  metric: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  component?: string
  route?: string
}

class LocalErrorLogger {
  private errors: ErrorLog[] = []
  private performance: PerformanceLog[] = []

  logError(error: Error | ErrorLog, additionalData?: Record<string, unknown>): void {
    const errorLog: ErrorLog = typeof error === 'string'
      ? {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: 'error',
        message: error,
        ...additionalData
      }
      : {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: 'error',
        message: error.message,
        stack: error.stack,
        ...additionalData
      }

    this.errors.push(errorLog)
    this.persistErrors()
    console.error('[LocalErrorLogger]', errorLog)
  }

  logPerformance(metric: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms', additionalData?: Record<string, unknown>): void {
    const perfLog: PerformanceLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      metric,
      value,
      unit,
      ...additionalData
    }

    this.performance.push(perfLog)
    this.persistPerformance()
  }

  getErrors(): ErrorLog[] {
    return [...this.errors]
  }

  getPerformance(): PerformanceLog[] {
    return [...this.performance]
  }

  clearErrors(): void {
    this.errors = []
    this.persistErrors()
  }

  clearPerformance(): void {
    this.performance = []
    this.persistPerformance()
  }

  private persistErrors(): void {
    try {
      localStorage.setItem('vue-app-errors', JSON.stringify(this.errors))
    } catch (e) {
      console.warn('[LocalErrorLogger] 无法保存错误日志到 localStorage', e)
    }
  }

  private persistPerformance(): void {
    try {
      localStorage.setItem('vue-app-performance', JSON.stringify(this.performance))
    } catch (e) {
      console.warn('[LocalErrorLogger] 无法保存性能日志到 localStorage', e)
    }
  }

  loadFromStorage(): void {
    try {
      const storedErrors = localStorage.getItem('vue-app-errors')
      const storedPerformance = localStorage.getItem('vue-app-performance')

      if (storedErrors) {
        this.errors = JSON.parse(storedErrors)
      }

      if (storedPerformance) {
        this.performance = JSON.parse(storedPerformance)
      }
    } catch (e) {
      console.warn('[LocalErrorLogger] 无法从 localStorage 加载日志', e)
    }
  }
}

export const errorLogger = new LocalErrorLogger()
errorLogger.loadFromStorage()

// Vue 组件实例类型定义
interface VueComponentInstance {
  $options?: {
    name?: string
  }
}

// Vue 错误处理器
export const createVueErrorHandler = (logger: LocalErrorLogger) => {
  return (error: Error, instance: VueComponentInstance | null | undefined, info: string) => {
    logger.logError(error, {
      component: instance?.$options?.name || 'Unknown',
      info,
      lifecycle: 'Vue Error Handler'
    })
  }
}

// 性能监控装饰器
export const measurePerformance = (metricName: string) => {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: unknown[]) {
      const start = performance.now()
      const result = originalMethod.apply(this, args)
      const end = performance.now()

      errorLogger.logPerformance(
        `${metricName}-${propertyKey}`,
        end - start,
        'ms',
        { component: (target as new () => unknown).constructor.name }
      )

      return result
    }

    return descriptor
  }
}
