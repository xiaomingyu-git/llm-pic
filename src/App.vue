<template>
  <div id="app">
    <el-container>
      <!-- 应用头部 -->
      <el-header>
        <div class="header-content">
          <div class="header-left">
            <h1>LLM 架构图生成器</h1>
            <el-tag size="small" type="info">v1.0.0</el-tag>
          </div>
          <div class="header-right">
            <el-button
              text
              @click="showHelp = true"
              :icon="QuestionFilled"
            >
              帮助
            </el-button>
            <el-button
              text
              @click="showSettings = true"
              :icon="Setting"
            >
              设置
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main>
        <div class="content-wrapper">
          <!-- LLM 配置区域 -->
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

                <el-form-item label="选择模型" v-if="availableModels.length > 0">
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
                        <div class="model-name">{{ model.display_name || model.id }}</div>
                        <div class="model-info">
                          <el-tag size="small" :type="getModelTagType(model.id)">
                            {{ getModelCategory(model) }}
                          </el-tag>
                          <span class="model-id">{{ model.id }}</span>
                        </div>
                      </div>
                    </el-option>
                  </el-select>
                  <div class="model-help" v-if="!selectedModel && availableModels.length > 0">
                    <el-icon><InfoFilled /></el-icon>
                    <span>请选择一个模型用于生成架构图</span>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="testConnection"
                    :loading="testingConnection"
                    :disabled="!isFormValid"
                  >
                    测试连接
                  </el-button>
                  <el-button @click="saveConfig">保存配置</el-button>
                  <el-button
                    type="info"
                    @click="getModels"
                    :loading="loadingModels"
                    :disabled="!isFormValid"
                  >
                    {{ loadingModels ? '获取中...' : '获取模型列表' }}
                  </el-button>
                  <el-button
                    v-if="availableModels.length > 0"
                    type="success"
                    @click="refreshModels"
                    :loading="loadingModels"
                    :disabled="!isFormValid"
                    size="small"
                  >
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>

          <!-- 格式选择区域 -->
          <div class="format-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>选择图表格式</span>
                </div>
              </template>

              <el-radio-group v-model="selectedFormat" @change="onFormatChange">
                <el-radio-button label="mermaid">Mermaid 图表</el-radio-button>
                <el-radio-button label="xml">XML 架构图</el-radio-button>
              </el-radio-group>
            </el-card>
          </div>

          <!-- 图表生成组件区域 -->
          <div class="diagram-component-section">
            <!-- Mermaid 组件 -->
            <MermaidDiagram
              v-show="selectedFormat === 'mermaid'"
              :config="config"
              :selected-model="selectedModel"
              :is-form-valid="isFormValid"
            />

            <!-- XML 组件 -->
            <XMLDiagram
              v-show="selectedFormat === 'xml'"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Setting, Refresh, InfoFilled } from '@element-plus/icons-vue'
import ConnectionStatus from './components/ConnectionStatus.vue'
import MermaidDiagram from './components/MermaidDiagram.vue'
import XMLDiagram from './components/XMLDiagram.vue'
import { StorageService } from './services/storage'

// 响应式数据
interface LLMConfig {
  url: string
  apiKey: string
  model?: string
}

const config = reactive<LLMConfig>({
  url: '',
  apiKey: '',
  model: ''
})

const connectionStatus = ref<'disconnected' | 'testing' | 'connected' | 'error'>('disconnected')
const connectionError = ref('')
const lastConnectionTime = ref<Date | null>(null)
const connectionDetails = ref<any>(null)
const testingConnection = ref(false)
const loadingModels = ref(false)

// 格式选择
const selectedFormat = ref<'mermaid' | 'xml'>('mermaid')

const showHelp = ref(false)
const showSettings = ref(false)

// 模型相关数据
const availableModels = ref<Array<{
  id: string
  display_name?: string
  object: string
  created: number
  owned_by: string
}>>([])
const selectedModel = ref('')

// 表单验证
const isFormValid = ref(false)

const validateForm = () => {
  isFormValid.value = config.url.trim() !== '' && config.apiKey.trim() !== ''
}

// 不加载配置（页面数据仅临时使用）
const loadConfig = () => {
  // 不加载任何保存的数据，所有配置都需要用户重新输入
  console.log('配置未加载（仅使用页面临时数据）')
}

const saveConfig = () => {
  try {
    StorageService.saveConfiguration(config)
    ElMessage.info('配置仅在当前页面有效')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.info('配置仅在当前页面有效')
  }
}

// 连接状态处理方法
const handleConnectionStatusChange = (status: 'disconnected' | 'testing' | 'connected' | 'error') => {
  connectionStatus.value = status
  testingConnection.value = status === 'testing'
}

const handleConnectionDetails = (details: any) => {
  connectionDetails.value = details
}

const handleConnectionError = (message: string) => {
  connectionError.value = message
}

// 测试连接
const testConnection = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }

  try {
    // 使用 ConnectionStatus 组件的测试方法
    const connectionStatusEl = document.querySelector('.connection-status')
    if (connectionStatusEl && (connectionStatusEl as any).testConnection) {
      const success = await (connectionStatusEl as any).testConnection()
      if (success) {
        saveConfig()
      }
    } else {
      // 备用测试方法
      testingConnection.value = true
      connectionStatus.value = 'testing'

      const response = await fetch(`${config.url}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        connectionStatus.value = 'connected'
        lastConnectionTime.value = new Date()
        ElMessage.success('连接测试成功')
        saveConfig()
      } else {
        throw new Error(`API请求失败: ${response.status}`)
      }
    }
  } catch (error) {
    connectionStatus.value = 'error'
    connectionError.value = error instanceof Error ? error.message : '连接测试失败'
    ElMessage.error('连接测试失败，请检查配置')
  } finally {
    testingConnection.value = false
  }
}

// 获取模型列表
const getModels = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }

  loadingModels.value = true

  try {
    const response = await fetch(`${config.url}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.status}`)
    }

    const data = await response.json()

    if (data.data && Array.isArray(data.data)) {
      // 直接使用返回的模型列表，不做任何过滤
      const models = data.data
        .sort((a: any, b: any) => {
          // 使用新的模型优先级排序
          const aPriority = getModelPriority(a)
          const bPriority = getModelPriority(b)
          if (aPriority !== bPriority) {
            return aPriority - bPriority
          }
          // 如果优先级相同，按ID字母排序
          return a.id.localeCompare(b.id)
        })

      availableModels.value = models

      // 自动选择一个推荐模型
      if (!selectedModel.value && models.length > 0) {
        const recommendedModel = models.find(m => m.id.includes('gpt-4')) || models.find(m => m.id.includes('gpt-3.5')) || models[0]
        selectedModel.value = recommendedModel.id
        handleModelChange(selectedModel.value)
      }

      ElMessage.success(`成功获取 ${models.length} 个可用模型`)
      console.log('可用模型:', models.map(m => m.id))
    } else {
      ElMessage.warning('API响应格式不正确')
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
    ElMessage.error('获取模型列表失败')
  } finally {
    loadingModels.value = false
  }
}

// 刷新模型列表
const refreshModels = async () => {
  await getModels()
}

// 处理模型选择变化
const handleModelChange = (modelId: string) => {
  config.model = modelId
  saveConfig()

  if (modelId) {
    const model = availableModels.value.find(m => m.id === modelId)
    ElMessage.success(`已选择模型: ${model?.display_name || modelId}`)
  }
}

// 格式切换处理
const onFormatChange = (format: 'mermaid' | 'xml') => {
  console.log(`切换到 ${format} 格式`)
}

// 动态模型分类和排序 - 基于API返回的内容
const getModelCategory = (model: any): string => {
  // 优先使用API返回的owned_by字段
  if (model.owned_by) {
    return model.owned_by
  }

  const modelId = model.id || ''

  // 智谱AI模型
  if (modelId.includes('glm')) return '智谱AI'

  // OpenAI模型
  if (modelId.includes('gpt')) return 'OpenAI'

  // Claude模型
  if (modelId.includes('claude')) return 'Anthropic'

  // 其他常见模型
  if (modelId.includes('gemini')) return 'Google'
  if (modelId.includes('llama')) return 'Meta'
  if (modelId.includes('mistral')) return 'Mistral'
  if (modelId.includes('qwen')) return 'Alibaba'
  if (modelId.includes('yi')) return '01 AI'
  if (modelId.includes('deepseek')) return 'DeepSeek'
  if (modelId.includes('moonshot')) return 'Moonshot'

  return '其他'
}

const getModelPriority = (model: any): number => {
  const modelId = model.id || ''

  // 智谱AI模型优先级（基于您提供的例子）
  if (modelId.includes('glm-4.6')) return 1
  if (modelId.includes('glm-4.5-air')) return 2
  if (modelId.includes('glm-4.5')) return 3
  if (modelId.includes('glm-4')) return 4
  if (modelId.includes('glm-3')) return 5

  // OpenAI模型优先级
  if (modelId.includes('gpt-4')) return 10
  if (modelId.includes('gpt-3.5')) return 11

  // Claude模型优先级
  if (modelId.includes('claude-3')) return 20

  // 其他模型按字母顺序
  return 99
}

// 获取模型标签类型
const getModelTagType = (modelId: string): string => {
  if (modelId.includes('gpt-4')) return 'danger'
  if (modelId.includes('gpt-3.5') || modelId.includes('claude')) return 'warning'
  if (modelId.includes('llama') || modelId.includes('qwen')) return 'success'
  return 'info'
}

// 组件挂载
onMounted(() => {
  loadConfig()
})
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

/* 格式选择样式 */
:deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.el-radio-button) {
  margin-right: 0;
}

/* 模型选择相关样式 */
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

/* 下拉选项自定义样式 */
:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 8px 12px;
  line-height: 1.4;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--el-color-primary-light-9);
}

/* 按钮组优化 */
.el-form-item :deep(.el-button-group) {
  display: flex;
  gap: 8px;
}

.el-form-item :deep(.el-button-group .el-button) {
  margin-left: 0;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .el-main {
    padding: 0 10px 10px;
  }

  .content-wrapper {
    gap: 10px;
  }

  :deep(.el-radio-group) {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 640px) {
  .model-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .el-form-item :deep(.el-button-group) {
    flex-wrap: wrap;
  }

  .el-form-item :deep(.el-button) {
    flex: 1;
    min-width: 100px;
  }
}
</style>
