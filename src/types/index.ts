export interface ConnectionDetails {
  url: string;
  responseTime?: number;
  statusCode?: number;
  statusText?: string;
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// 重新导出功能模块的类型以避免重复定义
export type { LLMConfiguration } from '../features/llm/types';
export type { LLMResponse } from '../features/llm/types';
export type { DiagramGenerationOptions } from '../features/diagram/types';
export type {
  XMLNode,
  XMLEdge,
  XMLDiagramData,
} from '../features/diagram/types';
export type {
  MockElement,
  MockDocument,
  MockDOMParser,
} from '../features/diagram/types';

// 保留全局通用类型
export interface ApiErrorInfo {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

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
}
