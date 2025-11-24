<template>
  <div id="app">
    <el-container>
      <!-- Navigation Header -->
      <el-header>
        <div class="header-content">
          <div class="header-left">
            <h1>LLM 架构图生成器</h1>
            <el-tag size="small" type="info">v1.0.0</el-tag>
          </div>
          <div class="header-right">
            <el-button
              type="primary"
              @click="goToTable"
              :icon="Document"
            >
              数据表格
            </el-button>
            <YjButton
              variant="ghost"
              @click="showHelp = true"
              :icon="QuestionFilled"
            >
              帮助
            </YjButton>
            <YjButton
              variant="ghost"
              @click="showSettings = true"
              :icon="Setting"
            >
              设置
            </YjButton>
          </div>
        </div>
      </el-header>

      <!-- Main Content Area -->
      <el-main>
        <div class="content-wrapper">
          <!-- LLM Configuration Section -->
          <div class="config-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>LLM 配置</span>
                  <ConnectionStatus
                    :config="config"
                    :status="connectionStatus"
                    :last-connection-time="lastConnectionTime"
                    :error-message="connectionError"
                    @status-change="handleConnectionStatusChange"
                    @connection-details="handleConnectionDetails"
                    @error="handleConnectionError"
                  />
                </div>
              </template>

              <el-form :model="config" label-width="80px">
                <el-form-item label="API URL">
                  <el-input
                    v-model="config.url"
                    placeholder="输入LLM API地址，如: https://api.openai.com/v1"
                    @blur="validateForm"
                  />
                </el-form-item>

                <el-form-item label="API Key">
                  <el-input
                    v-model="config.apiKey"
                    type="password"
                    placeholder="输入API密钥"
                    show-password
                    @blur="validateForm"
                  />
                </el-form-item>

                <el-form-item
                  label="选择模型"
                  v-if="availableModels.length > 0"
                >
                  <el-select
                    v-model="selectedModel"
                    placeholder="请选择模型"
                    clearable
                    filterable
                    @change="handleModelChange"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="model in availableModels"
                      :key="model.id"
                      :label="model.display_name || model.id"
                      :value="model.id"
                    >
                      <div class="model-option">
                        <div class="model-name">
                          {{ model.display_name || model.id }}
                        </div>
                        <div class="model-info">
                          <el-tag
                            size="small"
                            :type="getModelTagType(model.id)"
                          >
                            {{ getModelCategory(model) }}
                          </el-tag>
                          <span class="model-id">{{ model.id }}</span>
                        </div>
                      </div>
                    </el-option>
                  </el-select>
                  <div
                    class="model-help"
                    v-if="!selectedModel && availableModels.length > 0"
                  >
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                    <span>请选择一个模型用于生成架构图</span>
                  </div>
                </el-form-item>

                <el-form-item>
                  <YjButton
                    type="primary"
                    @click="testConnection"
                    :loading="testingConnection"
                    :disabled="!isFormValid"
                  >
                    测试连接
                  </YjButton>
                  <YjButton @click="saveConfig">保存配置</YjButton>
                  <YjButton
                    type="info"
                    @click="getModels"
                    :loading="loadingModels"
                    :disabled="!isFormValid"
                  >
                    {{ loadingModels ? '获取中...' : '获取模型列表' }}
                  </YjButton>
                  <YjButton
                    v-if="availableModels.length > 0"
                    type="success"
                    @click="refreshModels"
                    :loading="loadingModels"
                    :disabled="!isFormValid"
                    size="small"
                  >
                    <el-icon>
                      <Refresh />
                    </el-icon>
                    刷新
                  </YjButton>
                </el-form-item>
              </el-form>
            </el-card>
          </div>

          <!-- Format Selection Section -->
          <div class="format-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>选择图表格式</span>
                </div>
              </template>

              <div class="format-buttons">
                <YjButton
                  variant="outline"
                  :class="{ 'is-active': selectedFormat === 'mermaid' }"
                  @click="onFormatChange('mermaid')"
                >
                  Mermaid 图表
                </YjButton>
                <YjButton
                  variant="outline"
                  :class="{ 'is-active': selectedFormat === 'xml' }"
                  @click="onFormatChange('xml')"
                >
                  XML 架构图
                </YjButton>
              </div>
            </el-card>
          </div>

          <!-- Diagram Generation Component Section -->
          <div class="diagram-component-section">
            <!-- Mermaid Diagram Component -->
            <MermaidDiagram
              v-if="selectedFormat === 'mermaid'"
              :config="config"
              :selected-model="selectedModel"
              :is-form-valid="isFormValid"
            />

            <!-- XML Architecture Diagram Component -->
            <XMLDiagram
              v-else-if="selectedFormat === 'xml'"
              :config="config"
              :selected-model="selectedModel"
              :is-form-valid="isFormValid"
            />
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  QuestionFilled,
  Setting,
  Refresh,
  InfoFilled,
  Document,
} from '@element-plus/icons-vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import MermaidDiagram from '../components/MermaidDiagram.vue';
import XMLDiagram from '../components/XMLDiagram.vue';
import YjButton from '../components/YjButton.vue';
import type { ConnectionDetails } from '../types';

const router = useRouter();

// Reactive data
interface LLMConfig {
  url: string;
  apiKey: string;
  model?: string;
}

const config = reactive<LLMConfig>({
  url: '',
  apiKey: '',
  model: '',
});

const connectionStatus = ref<
  'disconnected' | 'testing' | 'connected' | 'error'
>('disconnected');
const connectionError = ref('');
const lastConnectionTime = ref<Date | null>(null);
const connectionDetails = ref<ConnectionDetails | null>(null);
const testingConnection = ref(false);
const loadingModels = ref(false);

// Format selection
const selectedFormat = ref<'mermaid' | 'xml'>('mermaid');

const showHelp = ref(false);
const showSettings = ref(false);

// Model related data
const availableModels = ref<
  Array<{
    id: string;
    display_name?: string;
    object: string;
    created: number;
    owned_by: string;
  }>
>([]);
const selectedModel = ref('');

// Form validation
const isFormValid = ref(false);

// Navigation
const goToTable = () => {
  router.push('/table');
};

const validateForm = () => {
  isFormValid.value = config.url.trim() !== '' && config.apiKey.trim() !== '';
};

const loadConfig = () => {
  console.log('配置未加载（仅使用页面临时数据）');
};

const saveConfig = () => {
  try {
    console.log('配置未保存（页面临时数据）');
    ElMessage.info('配置仅在当前页面有效');
  } catch (error) {
    console.error('保存配置失败:', error);
    ElMessage.info('配置仅在当前页面有效');
  }
};

// Connection status handling methods
const handleConnectionStatusChange = (
  status: 'disconnected' | 'testing' | 'connected' | 'error'
) => {
  connectionStatus.value = status;
  testingConnection.value = status === 'testing';
};

const handleConnectionDetails = (details: ConnectionDetails) => {
  connectionDetails.value = details;
};

const handleConnectionError = (message: string) => {
  connectionError.value = message;
};

// Test connection
const testConnection = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息');
    return;
  }

  try {
    // Use ConnectionStatus component's test method
    const connectionStatusEl = document.querySelector('.connection-status');
    if (connectionStatusEl && (connectionStatusEl as any).testConnection) {
      const success = await (connectionStatusEl as any).testConnection();
      if (success) {
        saveConfig();
      }
    } else {
      // Backup test method
      testingConnection.value = true;
      connectionStatus.value = 'testing';

      const response = await fetch(`${config.url}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        connectionStatus.value = 'connected';
        lastConnectionTime.value = new Date();
        ElMessage.success('连接测试成功');
        saveConfig();
      } else {
        throw new Error(`API请求失败: ${response.status}`);
      }
    }
  } catch (error) {
    connectionStatus.value = 'error';
    connectionError.value =
      error instanceof Error ? error.message : '连接测试失败';
    ElMessage.error('连接测试失败，请检查配置');
  } finally {
    testingConnection.value = false;
  }
};

// Get model list
const getModels = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息');
    return;
  }

  loadingModels.value = true;

  try {
    const response = await fetch(`${config.url}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && Array.isArray(data.data)) {
      const models = data.data.sort((a: any, b: any) => {
        const aPriority = getModelPriority(a);
        const bPriority = getModelPriority(b);
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        return a.id.localeCompare(b.id);
      });

      availableModels.value = models;

      if (!selectedModel.value && models.length > 0) {
        const recommendedModel =
          models.find((m) => m.id.includes('gpt-4')) ||
          models.find((m) => m.id.includes('gpt-3.5')) ||
          models[0];
        selectedModel.value = recommendedModel.id;
        handleModelChange(selectedModel.value);
      }

      ElMessage.success(`成功获取 ${models.length} 个可用模型`);
    } else {
      ElMessage.warning('API响应格式不正确');
    }
  } catch (error) {
    console.error('获取模型列表失败:', error);
    ElMessage.error('获取模型列表失败');
  } finally {
    loadingModels.value = false;
  }
};

const refreshModels = async () => {
  await getModels();
};

const handleModelChange = (modelId: string) => {
  config.model = modelId;
  saveConfig();

  if (modelId) {
    const model = availableModels.value.find((m) => m.id === modelId);
    ElMessage.success(`已选择模型: ${model?.display_name || modelId}`);
  }
};

// Format switching handler
const onFormatChange = (format: 'mermaid' | 'xml') => {
  try {
    if (format !== 'mermaid' && format !== 'xml') {
      console.error('无效的格式:', format);
      ElMessage.error('无效的图表格式');
      return;
    }

    selectedFormat.value = format;
    ElMessage.success(`已切换到 ${format} 格式`);

    setTimeout(() => {
      console.log('延迟验证 - 当前 selectedFormat:', selectedFormat.value);
    }, 100);
  } catch (error) {
    console.error('格式切换过程中发生错误:', error);
    ElMessage.error('格式切换失败');
  }
};

const getModelCategory = (model: any): string => {
  if (model.owned_by) {
    return model.owned_by;
  }

  const modelId = model.id || '';

  if (modelId.includes('glm')) return '智谱AI';
  if (modelId.includes('gpt')) return 'OpenAI';
  if (modelId.includes('claude')) return 'Anthropic';
  if (modelId.includes('gemini')) return 'Google';
  if (modelId.includes('llama')) return 'Meta';
  if (modelId.includes('mistral')) return 'Mistral';
  if (modelId.includes('qwen')) return 'Alibaba';
  if (modelId.includes('yi')) return '01 AI';
  if (modelId.includes('deepseek')) return 'DeepSeek';
  if (modelId.includes('moonshot')) return 'Moonshot';

  return '其他';
};

const getModelPriority = (model: any): number => {
  const modelId = model.id || '';

  if (modelId.includes('glm-4.6')) return 1;
  if (modelId.includes('glm-4.5-air')) return 2;
  if (modelId.includes('glm-4.5')) return 3;
  if (modelId.includes('glm-4')) return 4;
  if (modelId.includes('glm-3')) return 5;
  if (modelId.includes('gpt-4')) return 10;
  if (modelId.includes('gpt-3.5')) return 11;
  if (modelId.includes('claude-3')) return 20;

  return 99;
};

const getModelTagType = (
  modelId: string
): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  if (modelId.includes('gpt-4')) return 'danger';
  if (modelId.includes('gpt-3.5') || modelId.includes('claude'))
    return 'warning';
  if (modelId.includes('llama') || modelId.includes('qwen')) return 'success';
  return 'info';
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}

.el-header {
  background-color: #409eff;
  color: white;
  text-align: center;
  line-height: 60px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.el-main {
  padding: 0 20px 20px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-section,
.format-section,
.diagram-component-section {
  width: 100%;
}

/* Format selection styles */
.format-buttons {
  display: flex;
  gap: 16px;
}

.format-buttons .yj-button {
  flex: 1;
}

.format-buttons .yj-button.is-active {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
  color: white;
}

.format-buttons .yj-button:not(.is-active) {
  background-color: transparent;
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.format-buttons .yj-button:not(.is-active):hover {
  background-color: var(--el-color-primary-light-9) !important;
}

/* Model selection related styles */
.model-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.model-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.model-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.model-help {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-info);
}

.model-help .el-icon {
  font-size: 14px;
}

/* Responsive optimization */
@media (max-width: 768px) {
  .el-main {
    padding: 0 10px 10px;
  }

  .content-wrapper {
    gap: 10px;
  }
}
</style>
