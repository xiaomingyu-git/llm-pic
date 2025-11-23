<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>架构图生成</span>
        <el-tag v-if="isValidInput" type="success" size="small">
          <el-icon><CircleCheck /></el-icon>
          输入有效
        </el-tag>
      </div>
    </template>

    <el-form :model="inputData" :rules="formRules" ref="formRef" label-width="80px">
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="inputData.description"
          type="textarea"
          :rows="4"
          placeholder="描述您想要生成的系统架构，例如：创建一个包含前端、后端和数据库的Web应用程序"
          maxlength="500"
          show-word-limit
          @input="handleInput"
          @keydown.ctrl.enter="handleSubmit"
          @keydown.meta.enter="handleSubmit"
          resize="vertical"
        />

        <!-- 输入建议 -->
        <div class="input-suggestions" v-if="showSuggestions">
          <div class="suggestions-header">
            <span>常用架构示例：</span>
            <el-button
              type="text"
              size="small"
              @click="showSuggestions = false"
            >
              隐藏
            </el-button>
          </div>
          <div class="suggestion-list">
            <el-tag
              v-for="suggestion in suggestions"
              :key="suggestion.title"
              @click="applySuggestion(suggestion.text)"
              class="suggestion-tag"
            >
              {{ suggestion.title }}
            </el-tag>
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="isGenerating"
          :disabled="!isValidInput"
        >
          <el-icon v-if="!isGenerating"><Magic /></el-icon>
          生成架构图
        </el-button>
        <el-button @click="handleClear">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        <el-button
          type="text"
          @click="showSuggestions = !showSuggestions"
          :icon="showSuggestions ? 'Hide' : 'View'"
        >
          {{ showSuggestions ? '隐藏' : '显示' }}建议
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { CircleCheck, Magic, Delete } from '@element-plus/icons-vue'

// 类型定义
interface InputData {
  description: string
}

interface Suggestion {
  title: string
  text: string
}

// Props
interface Props {
  isGenerating?: boolean
  isConnected?: boolean
}

// Emits
interface Emits {
  (e: 'generate-diagram', description: string): void
  (e: 'clear-diagram'): void
}

const props = withDefaults(defineProps<Props>(), {
  isGenerating: false,
  isConnected: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const inputData = reactive<InputData>({
  description: ''
})

const showSuggestions = ref(false)
const formRef = ref<FormInstance>()

// 输入建议数据
const suggestions: Suggestion[] = [
  {
    title: 'Web应用',
    text: '创建一个三层Web应用架构，包括前端React应用、后端Node.js API服务器、PostgreSQL数据库，以及Nginx反向代理'
  },
  {
    title: '微服务',
    text: '设计微服务架构，包含API网关、用户服务、订单服务、支付服务、通知服务，以及Redis缓存和消息队列'
  },
  {
    title: '电商平台',
    text: '电商平台架构，前端Vue应用、用户认证服务、商品服务、订单服务、库存服务、支付系统、搜索系统'
  },
  {
    title: '数据分析',
    text: '大数据分析平台，包含数据采集、ETL处理、数据仓库Hadoop、分析引擎Spark、可视化仪表盘'
  },
  {
    title: '容器化',
    text: 'Kubernetes集群部署的应用，包含前端容器、后端容器、数据库容器、负载均衡器和自动伸缩'
  }
]

// 表单验证规则
const formRules = {
  description: [
    { required: true, message: '请输入架构描述', trigger: 'blur' },
    { min: 10, message: '描述至少需要10个字符', trigger: 'blur' }
  ]
}

// 计算属性
const isValidInput = computed(() => {
  return inputData.description.trim().length >= 10
})

// 方法
const handleInput = () => {
  // 实时验证
  if (formRef.value) {
    formRef.value.validateField('description')
  }
}

const handleSubmit = async () => {
  if (!isValidInput.value) {
    ElMessage.warning('请输入有效的架构描述（至少10个字符）')
    return
  }

  if (!props.isConnected) {
    ElMessage.warning('请先配置并连接LLM服务')
    return
  }

  try {
    await formRef.value?.validate()
    emit('generate-diagram', inputData.description.trim())
  } catch (error) {
    ElMessage.error('输入验证失败')
  }
}

const handleClear = () => {
  inputData.description = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  emit('clear-diagram')
  ElMessage.info('已清空输入')
}

const applySuggestion = (text: string) => {
  inputData.description = text
  showSuggestions.value = false
  handleInput()
  ElMessage.success('已应用建议模板')
}

// 键盘快捷键支持
const handleKeyboardShortcut = (event: KeyboardEvent) => {
  // Ctrl+Enter 或 Cmd+Enter 提交
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  }

  // Escape 清空
  if (event.key === 'Escape') {
    event.preventDefault()
    handleClear()
  }
}

// 监听键盘事件
watch(
  () => inputData.description,
  () => {
    // 输入时添加键盘事件监听
    document.addEventListener('keydown', handleKeyboardShortcut)
  },
  { immediate: true }
)

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcut)
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-suggestions {
  margin-top: 8px;
  padding: 12px;
  background-color: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-form {
  max-width: 600px;
}

.el-input :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .suggestion-list {
    flex-direction: column;
  }

  .suggestion-tag {
    width: 100%;
    justify-content: center;
  }
}
</style>
