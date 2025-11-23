import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { LLMConfiguration, LLMResponse, ApiResponse } from '../types'

// 扩展AxiosRequestConfig以包含metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }

  interface AxiosResponse {
    metadata?: {
      duration: number
    }
  }
}

export class ApiService {
  private static instance: ApiService
  private axiosInstance: AxiosInstance
  private requestInterceptors: Array<(config: AxiosRequestConfig) => AxiosRequestConfig> = []
  private responseInterceptors: Array<(response: AxiosResponse) => AxiosResponse> = []

  private constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 添加请求时间戳
        config.metadata = { startTime: Date.now() }

        // 应用自定义请求拦截器
        let finalConfig = config as any
        for (const interceptor of this.requestInterceptors) {
          finalConfig = interceptor(finalConfig)
        }
        return finalConfig
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // 计算请求时间
        if (response.config.metadata) {
          const duration = Date.now() - response.config.metadata.startTime
          response.metadata = { duration }
        }

        // 应用自定义响应拦截器
        return this.responseInterceptors.reduce((acc, interceptor) => interceptor(acc), response)
      },
      (error: AxiosError) => {
        return this.handleError(error)
      }
    )
  }

  private async handleError(error: AxiosError): Promise<never> {
    const enhancedError = {
      ...error,
      timestamp: new Date(),
      requestUrl: error.config?.url,
      requestMethod: error.config?.method?.toUpperCase(),
      responseTime: error.config?.metadata ?
        Date.now() - error.config.metadata.startTime : undefined
    }

    // 处理不同类型的错误
    if (error.code === 'ECONNABORTED') {
      throw new ApiError('请求超时，请检查网络连接', 'TIMEOUT', enhancedError)
    } else if (error.response) {
      const status = error.response.status
      const message = this.getErrorMessage(status, error.response.data)
      throw new ApiError(message, status.toString(), enhancedError)
    } else if (error.request) {
      throw new ApiError('网络连接失败，请检查网络设置', 'NETWORK_ERROR', enhancedError)
    } else {
      throw new ApiError('请求配置错误', 'CONFIG_ERROR', enhancedError)
    }
  }

  private getErrorMessage(status: number, data: any): string {
    switch (status) {
      case 400:
        return data?.message || '请求参数错误'
      case 401:
        return 'API密钥无效或已过期'
      case 403:
        return '访问被拒绝，请检查权限'
      case 404:
        return 'API端点不存在'
      case 429:
        return '请求频率过高，请稍后重试'
      case 500:
        return '服务器内部错误'
      case 502:
        return '网关错误'
      case 503:
        return '服务暂时不可用'
      default:
        return data?.message || `请求失败 (${status})`
    }
  }

  // 更新基础配置
  updateConfig(config: LLMConfiguration): void {
    if (config.url) {
      this.axiosInstance.defaults.baseURL = config.url
    }

    if (config.apiKey) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`
    }
  }

  // 清除配置
  clearConfig(): void {
    delete this.axiosInstance.defaults.baseURL
    delete this.axiosInstance.defaults.headers.common['Authorization']
  }

  // 测试连接
  async testConnection(): Promise<{ success: boolean; message: string; responseTime: number }> {
    try {
      const response = await this.axiosInstance.get('/health')
      return {
        success: true,
        message: '连接成功',
        responseTime: response.metadata?.duration || 0
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          message: error.message,
          responseTime: error.responseTime || 0
        }
      }
      return {
        success: false,
        message: '连接测试失败',
        responseTime: 0
      }
    }
  }

  // 生成图表
  async generateDiagram(prompt: string, options: {
    model?: string
    maxTokens?: number
    temperature?: number
  } = {}): Promise<LLMResponse> {
    const requestBody = {
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个架构图生成专家。请根据用户的描述生成标准的Mermaid格式架构图代码。只返回代码，不要包含其他说明。'
        },
        {
          role: 'user',
          content: `请生成以下架构的Mermaid图：${prompt}`
        }
      ],
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
    }

    const response = await this.axiosInstance.post<LLMResponse>('/chat/completions', requestBody)
    return response.data
  }

  // 通用GET请求
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, config)
    return {
      success: true,
      data: response.data
    }
  }

  // 通用POST请求
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, config)
    return {
      success: true,
      data: response.data
    }
  }

  // 添加自定义拦截器
  addRequestInterceptor(interceptor: (config: AxiosRequestConfig) => AxiosRequestConfig): void {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: (response: AxiosResponse) => AxiosResponse): void {
    this.responseInterceptors.push(interceptor)
  }

  // 获取当前配置
  getConfig(): LLMConfiguration {
    return {
      url: this.axiosInstance.defaults.baseURL || '',
      apiKey: (this.axiosInstance.defaults.headers.common['Authorization'] as string)?.replace('Bearer ', '') || ''
    }
  }
}

// 自定义错误类
export class ApiError extends Error {
  public readonly code: string
  public readonly originalError: any

  constructor(message: string, code: string, originalError?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.originalError = originalError
  }

  get responseTime(): number | undefined {
    return this.originalError?.responseTime
  }

  get requestUrl(): string | undefined {
    return this.originalError?.requestUrl
  }

  get requestMethod(): string | undefined {
    return this.originalError?.requestMethod
  }

  get timestamp(): Date {
    return this.originalError?.timestamp || new Date()
  }
}

// 导出单例实例
export const apiService = ApiService.getInstance()

// 导出axios实例用于更灵活的请求
export const apiClient = ApiService.getInstance() as any
