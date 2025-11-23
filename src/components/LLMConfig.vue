<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>LLM 配置</span>
        <ConnectionStatus :status="connectionStatus" />
      </div>
    </template>

    <el-form :model="config" :rules="formRules" ref="formRef" label-width="80px">
      <el-form-item label="API URL" prop="url">
        <el-input
          v-model="config.url"
          placeholder="输入LLM API地址"
          @blur="validateForm"
        />
      </el-form-item>

      <el-form-item label="API Key" prop="apiKey">
        <el-input
          v-model="config.apiKey"
          type="password"
          placeholder="输入API密钥"
          show-password
          @blur="validateForm"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="handleTestConnection"
          :loading="testingConnection"
          :disabled="!isFormValid"
        >
          测试连接
        </el-button>
        <el-button @click="handleSaveConfig">保存配置</el-button>
        <el-button @click="handleResetConfig">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import ConnectionStatus from './ConnectionStatus.vue'
import { validateApiKey } from '../utils/validation'
import { saveConfiguration, loadConfiguration } from '../services/storage'
import { testConnection } from '../services/llmService'

// 类型定义
interface LLMConfig {
  url: string
  apiKey: string
}

// Props
interface Props {
  connectionStatus: 'disconnected' | 'testing' | 'connected'
}

// Emits
interface Emits {
  (e: 'connection-status-change', status: 'disconnected' | 'testing' | 'connected'): void
  (e: 'config-saved', config: LLMConfig): void
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emits>()

// 响应式数据
const config = reactive<LLMConfig>({
  url: '',
  apiKey: ''
})

const testingConnection = ref(false)
const formRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  url: [
    { required: true, message: '请输入API URL', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API Key', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: Function) => {
      if (value && !validateApiKey(value)) {
        callback(new Error('API Key格式不正确'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 计算属性
const isFormValid = computed(() => {
  return config.url.trim() !== '' && config.apiKey.trim() !== ''
})

// 方法
const validateForm = async () => {
  if (formRef.value) {
    await formRef.value.validate()
  }
}

const loadConfig = () => {
  try {
    const saved = loadConfiguration()
    if (saved) {
      Object.assign(config, saved)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.warning('加载本地配置失败')
  }
}

const handleSaveConfig = async () => {
  try {
    await validateForm()
    saveConfiguration(config)
    emit('config-saved', { ...config })
    ElMessage.success('配置已保存')
  } catch (error) {
    ElMessage.error('配置保存失败')
  }
}

const handleResetConfig = () => {
  config.url = ''
  config.apiKey = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  ElMessage.info('配置已重置')
}

const handleTestConnection = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }

  testingConnection.value = true
  emit('connection-status-change', 'testing')

  try {
    await validateForm()
    const success = await testConnection(config)

    if (success) {
      emit('connection-status-change', 'connected')
      ElMessage.success('连接测试成功')
      // 连接成功后自动保存配置
      handleSaveConfig()
    } else {
      emit('connection-status-change', 'disconnected')
      ElMessage.error('连接测试失败，请检查配置')
    }
  } catch (error) {
    emit('connection-status-change', 'disconnected')
    console.error('连接测试错误:', error)
    ElMessage.error('连接测试出错，请重试')
  } finally {
    testingConnection.value = false
  }
}

// 监听配置变化，自动保存
watch(
  () => config,
  (newConfig) => {
    if (newConfig.url || newConfig.apiKey) {
      // 防抖保存
      setTimeout(() => {
        if (newConfig.url || newConfig.apiKey) {
          saveConfiguration(newConfig)
        }
      }, 1000)
    }
  },
  { deep: true }
)

// 组件初始化
loadConfig()
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  max-width: 500px;
}
</style>
