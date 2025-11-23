import type { AppError } from '../types'

// 错误代码常量
export const ERROR_CODES = {
  // 网络相关错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',

  // 配置相关错误
  INVALID_CONFIG: 'INVALID_CONFIG',
  MISSING_CONFIG: 'MISSING_CONFIG',
  CONFIG_LOAD_FAILED: 'CONFIG_LOAD_FAILED',
  CONFIG_SAVE_FAILED: 'CONFIG_SAVE_FAILED',

  // API相关错误
  API_ERROR: 'API_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',

  // 图表生成相关错误
  DIAGRAM_GENERATION_FAILED: 'DIAGRAM_GENERATION_FAILED',
  INVALID_DIAGRAM_INPUT: 'INVALID_DIAGRAM_INPUT',
  DIAGRAM_RENDER_FAILED: 'DIAGRAM_RENDER_FAILED',

  // 存储相关错误
  STORAGE_ERROR: 'STORAGE_ERROR',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_NOT_AVAILABLE: 'STORAGE_NOT_AVAILABLE',

  // 用户输入错误
  INVALID_INPUT: 'INVALID_INPUT',
  INPUT_TOO_LONG: 'INPUT_TOO_LONG',
  INPUT_TOO_SHORT: 'INPUT_TOO_SHORT',

  // 系统错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
  FEATURE_NOT_SUPPORTED: 'FEATURE_NOT_SUPPORTED'
} as const

// 错误类型映射
const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.TIMEOUT_ERROR]: '请求超时，请稍后重试',
  [ERROR_CODES.CONNECTION_FAILED]: '无法连接到服务器，请检查配置',

  [ERROR_CODES.INVALID_CONFIG]: '配置信息无效，请检查设置',
  [ERROR_CODES.MISSING_CONFIG]: '缺少必要配置，请完善设置',
  [ERROR_CODES.CONFIG_LOAD_FAILED]: '加载配置失败，请重试',
  [ERROR_CODES.CONFIG_SAVE_FAILED]: '保存配置失败，请重试',

  [ERROR_CODES.API_ERROR]: 'API调用失败，请稍后重试',
  [ERROR_CODES.UNAUTHORIZED]: '认证失败，请检查API密钥',
  [ERROR_CODES.FORBIDDEN]: '访问被拒绝，请检查权限',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: '请求频率过高，请稍后重试',
  [ERROR_CODES.API_QUOTA_EXCEEDED]: 'API配额已用完，请检查账户状态',

  [ERROR_CODES.DIAGRAM_GENERATION_FAILED]: '图表生成失败，请重试',
  [ERROR_CODES.INVALID_DIAGRAM_INPUT]: '输入描述无效，请提供更详细的描述',
  [ERROR_CODES.DIAGRAM_RENDER_FAILED]: '图表渲染失败，请检查输入格式',

  [ERROR_CODES.STORAGE_ERROR]: '数据存储失败',
  [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: '存储空间不足，请清理历史数据',
  [ERROR_CODES.STORAGE_NOT_AVAILABLE]: '本地存储不可用',

  [ERROR_CODES.INVALID_INPUT]: '输入无效',
  [ERROR_CODES.INPUT_TOO_LONG]: '输入内容过长，请简化描述',
  [ERROR_CODES.INPUT_TOO_SHORT]: '输入内容过短，请提供更详细的描述',

  [ERROR_CODES.UNKNOWN_ERROR]: '未知错误，请重试',
  [ERROR_CODES.INITIALIZATION_FAILED]: '应用初始化失败',
  [ERROR_CODES.FEATURE_NOT_SUPPORTED]: '当前浏览器不支持此功能'
} as const

// 自定义错误类
export class AppException extends Error {
  public readonly code: string
  public readonly userMessage: string
  public readonly technicalDetails?: any
  public readonly timestamp: Date
  public readonly recoverable: boolean
  public readonly suggestions: string[]

  constructor(
    code: keyof typeof ERROR_CODES,
    message?: string,
    technicalDetails?: any,
    recoverable: boolean = true,
    suggestions: string[] = []
  ) {
    const defaultMessage = ERROR_MESSAGES[ERROR_CODES[code]] || message || '未知错误'
    super(defaultMessage)

    this.name = 'AppException'
    this.code = ERROR_CODES[code]
    this.userMessage = defaultMessage
    this.technicalDetails = technicalDetails
    this.timestamp = new Date()
    this.recoverable = recoverable
    this.suggestions = suggestions
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.userMessage,
      details: this.technicalDetails,
      timestamp: this.timestamp
    }
  }

  // 静态工厂方法
  static networkError(details?: any): AppException {
    return new AppException(
      'NETWORK_ERROR',
      undefined,
      details,
      true,
      ['检查网络连接', '确认服务器地址正确', '稍后重试']
    )
  }

  static configError(message?: string, details?: any): AppException {
    return new AppException(
      'INVALID_CONFIG',
      message,
      details,
      true,
      ['检查配置信息', '确认API密钥有效', '验证服务器地址']
    )
  }

  static apiError(message?: string, statusCode?: number, details?: any): AppException {
    let code: keyof typeof ERROR_CODES = 'API_ERROR'

    if (statusCode === 401) code = 'UNAUTHORIZED'
    else if (statusCode === 403) code = 'FORBIDDEN'
    else if (statusCode === 429) code = 'RATE_LIMIT_EXCEEDED'

    return new AppException(
      code,
      message,
      details,
      statusCode !== 401,
      statusCode === 401 ?
        ['检查API密钥', '确认账户状态', '重新生成密钥'] :
        ['稍后重试', '检查配额限制', '联系支持']
    )
  }

  static diagramError(message?: string, details?: any): AppException {
    return new AppException(
      'DIAGRAM_GENERATION_FAILED',
      message,
      details,
      true,
      ['简化输入描述', '检查网络连接', '尝试不同的表述方式']
    )
  }

  static storageError(message?: string, details?: any): AppException {
    return new AppException(
      'STORAGE_ERROR',
      message,
      details,
      true,
      ['清理浏览器数据', '检查存储权限', '使用无痕模式重试']
    )
  }
}

// 错误处理工具类
export class ErrorHandler {
  private static errorHistory: AppException[] = []
  private static maxHistorySize = 100

  // 处理错误
  static handle(error: unknown, context?: string): AppException {
    let appException: AppException

    if (error instanceof AppException) {
      appException = error
    } else if (error instanceof Error) {
      appException = new AppException(
        'UNKNOWN_ERROR',
        error.message,
        { originalError: error, context }
      )
    } else {
      appException = new AppException(
        'UNKNOWN_ERROR',
        '未知错误',
        { originalError: error, context }
      )
    }

    // 记录错误
    this.recordError(appException)

    // 发送到错误报告服务（可选）
    this.reportError(appException)

    return appException
  }

  // 记录错误
  private static recordError(error: AppException): void {
    this.errorHistory.unshift(error)

    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }

    // 控制台输出
    console.error('应用错误:', {
      code: error.code,
      message: error.userMessage,
      timestamp: error.timestamp,
      details: error.technicalDetails
    })
  }

  // 错误报告（可以集成第三方服务）
  private static reportError(_error: AppException): void {
    // 这里可以集成Sentry、LogRocket等错误监控服务
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      // 发送错误到监控服务
      // errorReportingService.captureException(error)
    }
  }

  // 获取错误历史
  static getErrorHistory(): AppException[] {
    return [...this.errorHistory]
  }

  // 清除错误历史
  static clearErrorHistory(): void {
    this.errorHistory = []
  }

  // 获取用户友好的错误信息
  static getUserMessage(error: AppException): string {
    return `${error.userMessage}${error.suggestions.length > 0 ? '\n\n建议：\n' + error.suggestions.map(s => `• ${s}`).join('\n') : ''}`
  }

  // 检查错误是否可恢复
  static isRecoverable(error: AppException): boolean {
    return error.recoverable
  }

  // 获取重试建议
  static getRetryStrategy(error: AppException): {
    shouldRetry: boolean
    maxRetries: number
    delay: number
    backoffMultiplier: number
  } {
    switch (error.code) {
      case ERROR_CODES.NETWORK_ERROR:
      case ERROR_CODES.TIMEOUT_ERROR:
        return { shouldRetry: true, maxRetries: 3, delay: 1000, backoffMultiplier: 2 }

      case ERROR_CODES.RATE_LIMIT_EXCEEDED:
        return { shouldRetry: true, maxRetries: 2, delay: 5000, backoffMultiplier: 1 }

      case ERROR_CODES.UNAUTHORIZED:
      case ERROR_CODES.FORBIDDEN:
        return { shouldRetry: false, maxRetries: 0, delay: 0, backoffMultiplier: 1 }

      default:
        return { shouldRetry: true, maxRetries: 1, delay: 2000, backoffMultiplier: 1 }
    }
  }
}

// 重试机制
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    _error: AppException,
    maxRetries: number = 3,
    delay: number = 1000,
    backoffMultiplier: number = 2
  ): Promise<T> {
    let lastError: AppException

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (err) {
        lastError = ErrorHandler.handle(err)

        if (attempt === maxRetries || !ErrorHandler.isRecoverable(lastError)) {
          throw lastError
        }

        const waitTime = delay * Math.pow(backoffMultiplier, attempt)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    throw lastError!
  }
}

// 导出便捷方法
export const handleError = ErrorHandler.handle
export const getUserErrorMessage = ErrorHandler.getUserMessage
