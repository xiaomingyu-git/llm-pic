export interface ErrorInfo {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  category: 'component' | 'api' | 'performance' | 'validation' | 'network' | 'runtime'
  message: string
  stack?: string
  component?: string
  route?: string
  userId?: string
  sessionId?: string
  context: Record<string, any>
  userAgent?: string
  resolved: boolean
  resolvedAt?: string
  resolution?: string
  frequency?: number
}

export interface ErrorSummary {
  total: number
  byLevel: Record<ErrorInfo['level'], number>
  byCategory: Record<ErrorInfo['category'], number>
  byComponent: Record<string, number>
  recentErrors: ErrorInfo[]
  topErrors: Array<{
    error: ErrorInfo
    count: number
  }>
  trends: {
    daily: Array<{ date: string; count: number }>
    hourly: Array<{ hour: number; count: number }>
  }
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

export interface PerformanceMetric {
  id: string
  timestamp: string
  componentName: string
  metricType: 'render' | 'api' | 'navigation' | 'user-interaction'
  value: number
  unit: 'ms' | 'bytes' | 'count'
  threshold?: number
  exceeded: boolean
}

export interface ErrorPattern {
  id: string
  pattern: string
  category: ErrorInfo['category']
  frequency: number
  severity: ErrorInfo['level']
  suggestedFix: string
  examples: string[]
}