/**
 * LLM Feature Types
 * LLM功能相关类型定义
 */

export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  url: string;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface LLMRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  context?: string;
}

export interface LLMResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: Date;
  responseTime?: number;
}

export interface LLMConfig {
  providers: LLMProvider[];
  activeProvider: string;
  defaultSettings: Partial<LLMRequest>;
}

export interface LLMConfiguration {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'azure' | 'custom';
  baseUrl: string;
  url: string;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface ConnectionStatus {
  connected: boolean;
  provider: string;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

export interface LLMStreamChunk {
  id: string;
  content: string;
  done: boolean;
  error?: string;
}

export type LLMProviderType = 'openai' | 'anthropic' | 'azure' | 'custom';

export interface LLMProviderConfig {
  type: LLMProviderType;
  id: string;
  name: string;
  baseUrl: string;
  authentication: {
    type: 'api-key' | 'bearer' | 'basic';
    key?: string;
    token?: string;
    username?: string;
    password?: string;
  };
  models: string[];
  defaultModel?: string;
  capabilities: {
    chat: boolean;
    completion: boolean;
    embedding: boolean;
    streaming: boolean;
  };
}

// API 相关类型 - 从全局类型导入统一的 ApiResponse
export type { ApiResponse, ApiErrorInfo } from '../../../types';

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface LLMRequestParams {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  context?: string;
  messages?: Array<{ role: string; content: string }>;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}
