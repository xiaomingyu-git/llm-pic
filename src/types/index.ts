// LLM配置接口
export interface LLMConfiguration {
  url: string;
  apiKey: string;
  model?: string;
  status?: 'disconnected' | 'testing' | 'connected';
  lastConnected?: Date;
}

// 图表请求接口
export interface DiagramRequest {
  id: string;
  input: string;
  output?: string;
  format?: 'mermaid' | 'plantuml';
  metadata: {
    createdAt: Date;
    processingTime?: number;
    llmModel?: string;
    tokensUsed?: number;
  };
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  responseTime?: number;
  timestamp?: Date;
}

// API错误接口
export interface ApiErrorInfo {
  code: string;
  message: string;
  timestamp: Date;
  requestUrl?: string;
  requestMethod?: string;
  responseTime?: number;
  originalError?: any;
}

// 请求配置接口
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  baseURL?: string;
  headers?: Record<string, string>;
}

// LLM请求参数接口
export interface LLMRequestParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

// LLM API响应接口
export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

// 连接测试结果
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime: number;
  model?: string;
  latency?: number;
  version?: string;
  organization?: string;
}

// 连接详情接口
export interface ConnectionDetails {
  model?: string;
  latency: number;
  version?: string;
  organization?: string;
}

// DOM解析器接口（用于XML解析）
export interface MockElement {
  getAttribute: (attr: string) => string | null;
  textContent: string | null;
  nodeType?: number;
  querySelector: (selector: string) => MockElement | null;
  querySelectorAll: (selector: string) => MockElement[];
}

export interface MockDocument {
  querySelector: (selector: string) => MockElement | null;
  querySelectorAll: (selector: string) => MockElement[];
}

export interface MockDOMParser {
  new (): {
    parseFromString: (str: string, mimeType: string) => MockDocument;
  };
}

// 图表生成选项
export interface DiagramGenerationOptions {
  format: 'mermaid' | 'plantuml' | 'xml';
  theme: 'default' | 'dark' | 'forest' | 'neutral';
  direction: 'TB' | 'TD' | 'BT' | 'RL' | 'LR';
  includeDetails: boolean;
  useColors: boolean;
  addIcons: boolean;
  generateCode: boolean;
  customStyles: string;
  timeout: number;
  maxTokens?: number;
}

// XML架构图接口
export interface XMLDiagramOption {
  format: 'xml';
  style?: 'plantuml' | 'graphml' | 'drawio' | 'custom';
  width?: number;
  height?: number;
  backgroundColor?: string;
  nodeColor?: string;
  textColor?: string;
  edgeColor?: string;
}

export interface XMLNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  type?:
    | 'rectangle'
    | 'rounded'
    | 'circle'
    | 'diamond'
    | 'database'
    | 'server'
    | 'client';
  color?: string;
}

export interface XMLEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'arrow' | 'line' | 'dashed';
  color?: string;
}

export interface XMLDiagramData {
  nodes: XMLNode[];
  edges: XMLEdge[];
  metadata?: {
    width?: number;
    height?: number;
    theme?: string;
  };
}

// 应用状态接口
export interface AppState {
  config: LLMConfiguration;
  currentDiagram: DiagramRequest | null;
  loading: {
    testing: boolean;
    generating: boolean;
  };
  error: string | null;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// 组件Props接口
export interface LLMConfigProps {
  config: LLMConfiguration;
  onConfigChange: (config: LLMConfiguration) => void;
  onTestConnection: () => Promise<void>;
  loading: boolean;
}

export interface DiagramInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

export interface DiagramDisplayProps {
  diagramCode: string;
  onCopy: () => void;
  loading: boolean;
}

// 事件类型
export type AppEvent =
  | { type: 'CONFIG_UPDATED'; payload: LLMConfiguration }
  | { type: 'CONNECTION_TESTED'; payload: ConnectionTestResult }
  | { type: 'DIAGRAM_GENERATED'; payload: DiagramRequest }
  | { type: 'ERROR_OCCURRED'; payload: AppError }
  | { type: 'ERROR_CLEARED' };
