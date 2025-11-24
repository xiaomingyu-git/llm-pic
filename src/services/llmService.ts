import { apiClient } from './api';
import type { LLMConfiguration } from '../types';

// 连接测试响应接口
interface ConnectionTestResponse {
  success: boolean;
  message: string;
  latency?: number;
  model?: string;
  version?: string;
}

// API错误类型
export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// API错误类
export class APIError extends Error {
  public readonly type: APIErrorType;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(
    type: APIErrorType,
    message: string,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class LLMService {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30秒
  private static readonly TEST_TIMEOUT = 10000; // 10秒

  /**
   * 测试LLM连接
   */
  static async testConnection(
    config: LLMConfiguration
  ): Promise<ConnectionTestResponse> {
    const startTime = Date.now();

    try {
      // 验证配置
      this.validateConfiguration(config);

      // 发送测试请求
      const response = await apiClient.post(
        `${config.url}/chat/completions`,
        {
          model: 'gpt-3.5-turbo', // 默认模型
          messages: [
            {
              role: 'user',
              content:
                "Hello, this is a connection test. Please respond with 'OK'.",
            },
          ],
          max_tokens: 10,
          temperature: 0,
        },
        {
          timeout: this.TEST_TIMEOUT,
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const latency = Date.now() - startTime;

      // 验证响应
      if (
        response.data &&
        response.data.choices &&
        response.data.choices.length > 0
      ) {
        return {
          success: true,
          message: '连接测试成功',
          latency,
          model: response.data.model,
          version: response.data.version || 'unknown',
        };
      } else {
        throw new APIError(
          APIErrorType.SERVER_ERROR,
          '响应格式不正确',
          response.status,
          response.data
        );
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;

      return {
        success: false,
        message: this.parseErrorMessage(error),
        latency,
      };
    }
  }

  /**
   * 获取可用模型列表
   */
  static async getAvailableModels(config: LLMConfiguration): Promise<string[]> {
    try {
      this.validateConfiguration(config);

      const response = await apiClient.get(`${config.url}/models`, {
        timeout: this.DEFAULT_TIMEOUT,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.data) {
        return response.data.data.map((model: any) => model.id);
      }

      return [];
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw this.parseAPIError(error);
    }
  }

  /**
   * 发送聊天请求
   */
  static async sendChatMessage(
    config: LLMConfiguration,
    message: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    } = {}
  ): Promise<any> {
    try {
      this.validateConfiguration(config);

      // 优先使用配置中的模型，然后是选项中的模型，最后是默认值
      const selectedModel = config.model || options.model || 'gpt-3.5-turbo';

      const payload = {
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        stream: options.stream || false,
      };

      const response = await apiClient.post(
        `${config.url}/chat/completions`,
        payload,
        {
          timeout: this.DEFAULT_TIMEOUT,
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('发送聊天消息失败:', error);
      throw this.parseAPIError(error);
    }
  }

  /**
   * 验证配置
   */
  private static validateConfiguration(config: LLMConfiguration): void {
    if (!config.url || !config.url.trim()) {
      throw new APIError(APIErrorType.VALIDATION_ERROR, 'API URL不能为空');
    }

    if (!config.apiKey || !config.apiKey.trim()) {
      throw new APIError(APIErrorType.VALIDATION_ERROR, 'API Key不能为空');
    }

    // 移除URL格式验证 - 允许任何字符串作为URL
  }

  /**
   * 解析API错误
   */
  private static parseAPIError(error: any): APIError {
    if (error.response) {
      // 服务器响应错误
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new APIError(
            APIErrorType.AUTHENTICATION_ERROR,
            'API Key无效或已过期',
            status,
            data
          );
        case 429:
          return new APIError(
            APIErrorType.RATE_LIMIT_ERROR,
            'API调用频率超限，请稍后重试',
            status,
            data
          );
        case 500:
        case 502:
        case 503:
          return new APIError(
            APIErrorType.SERVER_ERROR,
            '服务器暂时不可用，请稍后重试',
            status,
            data
          );
        case 400:
          return new APIError(
            APIErrorType.VALIDATION_ERROR,
            data?.error?.message || '请求参数不正确',
            status,
            data
          );
        default:
          return new APIError(
            APIErrorType.UNKNOWN_ERROR,
            data?.error?.message || `请求失败 (${status})`,
            status,
            data
          );
      }
    } else if (error.request) {
      // 网络错误
      if (error.code === 'ECONNABORTED') {
        return new APIError(
          APIErrorType.TIMEOUT_ERROR,
          '请求超时，请检查网络连接'
        );
      }
      return new APIError(
        APIErrorType.NETWORK_ERROR,
        '网络连接失败，请检查网络设置'
      );
    } else {
      // 其他错误
      return new APIError(
        APIErrorType.UNKNOWN_ERROR,
        error.message || '未知错误'
      );
    }
  }

  /**
   * 解析错误消息用于显示
   */
  private static parseErrorMessage(error: any): string {
    const apiError = this.parseAPIError(error);

    switch (apiError.type) {
      case APIErrorType.AUTHENTICATION_ERROR:
        return '认证失败：API Key无效';
      case APIErrorType.RATE_LIMIT_ERROR:
        return '请求频率超限，请稍后重试';
      case APIErrorType.SERVER_ERROR:
        return '服务器错误，请稍后重试';
      case APIErrorType.TIMEOUT_ERROR:
        return '连接超时，请检查网络';
      case APIErrorType.NETWORK_ERROR:
        return '网络连接失败';
      case APIErrorType.VALIDATION_ERROR:
        return apiError.message;
      default:
        return '连接测试失败';
    }
  }

  /**
   * 检查API密钥格式
   */
  static validateAPIKey(apiKey: string): boolean {
    // 基本的API Key格式检查
    return Boolean(apiKey && apiKey.trim().length >= 20);
  }

  /**
   * 检查URL格式
   */
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * 获取API健康状态
   */
  static async getHealthStatus(config: LLMConfiguration): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;
    message: string;
  }> {
    try {
      const start = Date.now();
      await this.testConnection(config);
      const latency = Date.now() - start;

      return {
        status: latency < 2000 ? 'healthy' : 'degraded',
        latency,
        message: 'API服务正常',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'API服务不可用',
      };
    }
  }
}

// 导出测试连接的简化函数
export const testConnection = LLMService.testConnection;
export const getAvailableModels = LLMService.getAvailableModels;
export const sendChatMessage = LLMService.sendChatMessage;
