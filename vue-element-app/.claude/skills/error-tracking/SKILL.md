---
name: error-tracking
description: 本地错误跟踪和管理系统。将错误信息存储到本地文件，提供错误分析和修复建议。适用于Vue项目的错误处理、性能监控和问题追踪。ALL ERRORS MUST BE CAPTURED - no exceptions.

# 本地错误跟踪技能

## 目的
为Vue项目提供本地错误跟踪和管理系统，无需依赖外部服务。将错误信息存储在本地文件中，便于分析、追踪和修复。

## 使用时机
- 添加错误处理到代码
- 创建新的组件或页面
- API错误处理优化
- 错误边界实现
- 性能监控需求
- 代码调试和问题追踪

## 🚨 关键规则
- **ALL ERRORS MUST BE CAPTURED** - 不允许任何错误遗漏
- 错误信息必须包含足够的上下文
- 按严重程度分类错误
- 定期分析错误模式
- 提供修复建议

---

## 本地错误存储结构

### 1. 错误日志目录
```
src/
├── errors/
│   ├── error-log.json          # 主错误日志
│   ├── error-summary.json       # 错误统计
│   ├── error-patterns.json      # 错误模式分析
│   └── session-errors/         # 按会话分组
│       ├── session-2024-01-01.json
│       └── ...
├── utils/
│   └── errorLogger.ts         # 错误记录工具
└── types/
    └── error.types.ts          # 错误类型定义
```

### 2. 错误信息格式
```typescript
interface ErrorInfo {
  id: string                    // 唯一错误ID
  timestamp: string             // 错误时间戳
  level: 'error' | 'warning' | 'info'   // 错误级别
  category: string               // 错误类别
  message: string               // 错误消息
  stack?: string                 // 堆栈信息
  component?: string            // 组件名称
  route?: string               // 路由路径
  userId?: string               // 用户ID
  sessionId?: string            // 会话ID
  context: Record<string, any>  // 上下文信息
  userAgent?: string           // 浏览器信息
  resolved: boolean             // 是否已解决
  resolvedAt?: string           // 解决时间
  resolution?: string          // 解决方法
}
```

## 实现方案

### 1. 错误记录工具
```typescript
// src/utils/errorLogger.ts
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorLogPath = 'src/errors/error-log.json';
  
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }
  
  log(error: ErrorInfo): void {
    const errors = this.getErrorLog();
    errors.push(error);
    this.saveErrorLog(errors);
    this.updateSummary();
  }
}
```

### 2. Vue 错误边界组件
```vue
<!-- src/components/ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <el-alert
      :title="errorMessage"
      type="error"
      :description="errorContext"
      show-icon
      :closable="true"
      @close="clearError"
    >
      <template #default>
        <el-button @click="reportError">报告错误</el-button>
      </template>
    </el-alert>
  </div>
  <slot v-else />
</template>
```

### 3. API 错误处理中间件
```typescript
// src/utils/apiErrorMiddleware.ts
export const apiErrorMiddleware = (config: AxiosConfig) => {
  config.interceptors.response.use(
    (response) => response,
    (error) => {
      ErrorLogger.getInstance().log({
        id: generateErrorId(),
        timestamp: new Date().toISOString(),
        level: 'error',
        category: 'api',
        message: error.message,
        stack: error.stack,
        component: 'api-middleware',
        context: {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status
        },
        resolved: false
      });
      return Promise.reject(error);
    }
  );
};
```

### 4. 性能监控
```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  static trackRenderTime(componentName: string, renderTime: number): void {
    if (renderTime > 100) { // 超过100ms的渲染时间记录为警告
      ErrorLogger.getInstance().log({
        id: generateErrorId(),
        timestamp: new Date().toISOString(),
        level: 'warning',
        category: 'performance',
        message: `Slow render detected: ${componentName} took ${renderTime}ms`,
        component: componentName,
        context: { renderTime },
        resolved: false
      });
    }
  }
}
```

## 错误分析功能

### 1. 错误统计
- 按级别分类统计
- 按组件分组统计
- 趋势分析
- 热点识别

### 2. 错误模式识别
- 重复错误检测
- 错误聚类分析
- 根本原因分析

### 3. 修复建议
- 基于错误类型提供解决方案
- 推荐最佳实践
- 链接到相关文档

## 使用方法

### 1. 在组件中使用
```vue
<script setup lang="ts">
import { ErrorLogger } from '@/utils/errorLogger';

const logger = ErrorLogger.getInstance();

const handleAsyncOperation = async () => {
  try {
    await someAsyncOperation();
  } catch (error) {
    logger.log({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'component',
      message: error.message,
      stack: error.stack,
      component: 'MyComponent',
      context: { action: 'asyncOperation' },
      resolved: false
    });
  }
};
</script>
```

### 2. 技能激活时
当 `error-tracking` 技能激活时，会：
1. 分析现有错误日志
2. 识别错误模式
3. 提供修复建议
4. 生成错误报告

## 最佳实践

### 1. 错误上下文
- 总是包含足够的上下文信息
- 记录用户操作步骤
- 保存相关的数据和状态

### 2. 错误分类
- 使用清晰的分类标准
- 按严重程度标记
- 便于后续分析

### 3. 错误解决
- 记录解决方法和步骤
- 标记解决时间
- 便于团队学习

### 4. 隐私保护
- 不记录敏感的个人信息
- 脱敏用户数据
- 注意文件权限

## 调试工具

### 1. 错误查看器
- 实时错误日志查看
- 错误过滤和搜索
- 错误导出功能

### 2. 统计仪表板
- 错误趋势图表
- 组件错误排名
- 修复进度跟踪

### 3. 自动修复建议
- 基于模式的自动建议
- 代码片段生成
- 最佳实践推荐