<template>
  <div class="connection-status">
    <el-tag v-if="status === 'connected'" type="success" effect="plain">
      <el-icon>
        <CircleCheck />
      </el-icon>
      已连接
    </el-tag>
    <el-tag v-else-if="status === 'testing'" type="warning" effect="plain">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      测试中
    </el-tag>
    <el-tag v-else-if="status === 'error'" type="danger" effect="plain">
      <el-icon>
        <CircleClose />
      </el-icon>
      连接失败
    </el-tag>
    <el-tag v-else type="info" effect="plain">
      <el-icon>
        <Connection />
      </el-icon>
      未连接
    </el-tag>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">
      <el-tooltip :content="errorMessage" placement="top">
        <el-icon class="error-icon">
          <Warning />
        </el-icon>
      </el-tooltip>
    </div>

    <!-- 连接详情 -->
    <div v-if="connectionDetails" class="connection-details">
      <div class="detail-item">
        <span class="label">模型:</span>
        <span class="value">{{ connectionDetails.model || '未知' }}</span>
      </div>
      <div class="detail-item">
        <span class="label">延迟:</span>
        <span class="value">{{ connectionDetails.latency }}ms</span>
      </div>
    </div>

    <!-- 最后连接时间 -->
    <div v-if="lastConnectionTime" class="last-connection">
      <el-tooltip :content="formatFullTime(lastConnectionTime)" placement="top">
        <span class="time-text"
          >最后连接: {{ formatRelativeTime(lastConnectionTime) }}</span
        >
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import {
  CircleCheck,
  Loading,
  Connection,
  CircleClose,
  Warning,
} from '@element-plus/icons-vue';
import { llmService } from '../services/llmService';
import type { LLMConfiguration, ConnectionDetails } from '../types';

// Props
interface Props {
  config: LLMConfiguration;
  status?: 'disconnected' | 'testing' | 'connected' | 'error';
  lastConnectionTime?: Date;
  errorMessage?: string;
  autoTest?: boolean;
}

// Emits
interface Emits {
  (
    e: 'status-change',
    status: 'disconnected' | 'testing' | 'connected' | 'error'
  ): void;
  (e: 'connection-details', details: ConnectionDetails): void;
  (e: 'error', message: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'disconnected',
  autoTest: false,
});

const emit = defineEmits<Emits>();

// 响应式数据
const currentStatus = ref(props.status);
const currentError = ref(props.errorMessage);
const lastConnectionTime = ref(props.lastConnectionTime);
const connectionDetails = ref<ConnectionDetails | null>(null);

// statusIcon 计算属性暂时未使用，但保留供将来使用
// const statusIcon = computed(() => {
//   switch (currentStatus.value) {
//     case 'connected':
//       return 'CircleCheck';
//     case 'testing':
//       return 'Loading';
//     case 'error':
//       return 'CircleClose';
//     default:
//       return 'Connection';
//   }
// });

// 公共方法
const testApiConnection = async (
  config?: LLMConfiguration
): Promise<boolean> => {
  const testConfig = config || props.config;

  if (!testConfig.url || !testConfig.apiKey) {
    const errorMsg = '缺少必要的配置信息';
    handleError(errorMsg);
    return false;
  }

  try {
    setStatus('testing');
    clearError();

    const result = await llmService.testConnection(testConfig);

    if (result.success) {
      setStatus('connected');
      updateConnectionDetails({
        model: result.model,
        latency: result.latency || 0,
        version: result.version,
      });

      ElMessage.success('连接测试成功');
      emit('connection-details', connectionDetails.value!);
      return true;
    } else {
      const errorMsg = result.message || '连接测试失败';
      handleError(errorMsg);
      return false;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '连接测试失败';
    handleError(errorMsg);
    return false;
  }
};

// 获取模型列表
const fetchAvailableModels = async (
  config?: LLMConfiguration
): Promise<string[]> => {
  const testConfig = config || props.config;

  if (!testConfig.url || !testConfig.apiKey) {
    return [];
  }

  try {
    // 这里可以调用获取模型列表的API
    const response = await fetch(`${testConfig.url}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // OpenAI API格式
    if (data.data && Array.isArray(data.data)) {
      return data.data
        .map((model: any) => model.id)
        .filter(
          (id: string) =>
            id.includes('gpt') || id.includes('claude') || id.includes('llama')
        );
    }

    return [];
  } catch (error) {
    console.warn('获取模型列表失败:', error);
    return [];
  }
};

// 验证API端点
const validateApiEndpoint = async (
  config: LLMConfiguration
): Promise<boolean> => {
  try {
    // 直接使用配置的URL，不验证格式
    const url = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;

    // 测试基础连接
    const testResponse = await fetch(`${url}/models`, {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    return testResponse.status === 200 || testResponse.status === 405; // 405 Method Not Allowed 也是正常的
  } catch {
    return false;
  }
};

// 获取API信息
const getApiInfo = async (
  config: LLMConfiguration
): Promise<ConnectionDetails | null> => {
  try {
    const response = await fetch(`${config.url}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();

      // 尝试从响应中获取信息
      const details: ConnectionDetails = {
        latency: 0,
        organization: data.organization || undefined,
      };

      // 如果有模型信息，获取第一个作为默认模型
      if (data.data && data.data.length > 0) {
        details.model = data.data[0].id;
      }

      return details;
    }
  } catch (error) {
    console.warn('获取API信息失败:', error);
  }

  return null;
};

// 私有方法
const setStatus = (
  status: 'disconnected' | 'testing' | 'connected' | 'error'
) => {
  currentStatus.value = status;
  emit('status-change', status);

  if (status === 'connected') {
    lastConnectionTime.value = new Date();
  }
};

const setError = (message: string) => {
  currentError.value = message;
  emit('error', message);
};

const clearError = () => {
  currentError.value = '';
};

const handleError = (message: string) => {
  setStatus('error');
  setError(message);
  ElMessage.error(message);
};

const updateConnectionDetails = (details: Partial<ConnectionDetails>) => {
  connectionDetails.value = { ...connectionDetails.value, ...details };
};

// 时间格式化方法
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return '刚刚';
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString();
  }
};

const formatFullTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 暴露方法供父组件调用
defineExpose({
  testConnection: testApiConnection,
  getModels: fetchAvailableModels,
  validateEndpoint: validateApiEndpoint,
  getApiInfo,
  status: currentStatus,
  error: currentError,
  details: connectionDetails,
});
</script>

<style scoped>
.connection-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.error-message {
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.error-icon {
  color: var(--el-color-danger);
  font-size: 14px;
  cursor: help;
}

.connection-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  padding: 4px 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid var(--el-border-color-lighter);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.detail-item .label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.detail-item .value {
  color: var(--el-text-color-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.last-connection {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.time-text {
  cursor: help;
  white-space: nowrap;
}

.el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-icon {
  font-size: 14px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 状态标签颜色优化 */
.el-tag--success {
  --el-tag-bg-color: var(--el-color-success-light-9);
  --el-tag-border-color: var(--el-color-success-light-7);
  --el-tag-text-color: var(--el-color-success);
}

.el-tag--danger {
  --el-tag-bg-color: var(--el-color-danger-light-9);
  --el-tag-border-color: var(--el-color-danger-light-7);
  --el-tag-text-color: var(--el-color-danger);
}

.el-tag--warning {
  --el-tag-bg-color: var(--el-color-warning-light-9);
  --el-tag-border-color: var(--el-color-warning-light-7);
  --el-tag-text-color: var(--el-color-warning);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .connection-status {
    align-items: flex-start;
  }

  .connection-details {
    align-items: flex-start;
    min-width: auto;
  }

  .detail-item {
    justify-content: space-between;
  }

  .last-connection {
    text-align: left;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .connection-details {
    background-color: var(--el-fill-color-darker);
    border-color: var(--el-border-color);
  }
}

/* 悬停效果 */
.connection-details:hover {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
}

/* 动画效果 */
.connection-details {
  transition: all 0.2s ease;
}

.error-icon {
  transition: transform 0.2s ease;
}

.error-icon:hover {
  transform: scale(1.1);
}
</style>
