<template>
  <div class="mermaid-diagram">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Mermaid 架构图生成</span>
        </div>
      </template>

      <el-form :model="input" label-width="80px">
        <el-form-item label="描述">
          <el-input
            v-model="input.description"
            type="textarea"
            :rows="4"
            placeholder="描述您想要生成的系统架构，例如：创建一个包含前端、后端和数据库的Web应用程序"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="generateDiagram"
            :loading="generating"
            :disabled="!input.description.trim() || !isFormValid"
          >
            生成 Mermaid 架构图
          </el-button>
          <el-button @click="clearDiagram">清空</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表显示区域 -->
    <el-card v-if="diagramCode">
      <template #header>
        <div class="card-header">
          <span>Mermaid 架构图</span>
          <div>
            <el-button
              size="small"
              @click="toggleFullscreen"
              v-if="activeTab === 'diagram'"
            >
              <el-icon><FullScreen /></el-icon>
              {{ isFullscreen ? '退出全屏' : '全屏显示' }}
            </el-button>
            <el-button size="small" @click="copyCode">
              <el-icon><CopyDocument /></el-icon>
              复制代码
            </el-button>
          </div>
        </div>
      </template>

      <!-- Tab容器 -->
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="图表视图" name="diagram">
          <div class="diagram-container" :class="{ 'fullscreen': isFullscreen }">
            <div ref="diagramContainer" class="diagram-content"></div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="代码编辑" name="code">
          <div class="code-editor-container">
            <div class="editor-header">
              <span>Mermaid 代码编辑器</span>
              <el-button
                size="small"
                type="primary"
                @click="applyChanges"
                :disabled="codeLoading"
              >
                <el-icon><Refresh /></el-icon>
                {{ codeLoading ? '渲染中...' : '应用更改' }}
              </el-button>
            </div>
            <div class="code-editor-wrapper">
              <el-input
                v-model="editableCode"
                type="textarea"
                :rows="20"
                placeholder="在这里编辑 Mermaid 代码..."
                class="code-editor"
                @input="onCodeChange"
              />
            </div>
            <div class="editor-footer">
              <el-button
                size="small"
                @click="resetCode"
                :disabled="originalCode === editableCode"
              >
                重置为原始代码
              </el-button>
              <el-button
                size="small"
                type="warning"
                @click="formatCode"
              >
                格式化代码
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Refresh, FullScreen } from '@element-plus/icons-vue'
import mermaid from 'mermaid'

interface DiagramInput {
  description: string
}

interface Props {
  config: {
    url: string
    apiKey: string
    model?: string
  }
  selectedModel: string
  isFormValid: boolean
}

const props = defineProps<Props>()

const input = reactive<DiagramInput>({
  description: ''
})

const generating = ref(false)
const diagramCode = ref('')
const diagramContainer = ref<HTMLElement>()
const isFullscreen = ref(false)
const activeTab = ref('diagram')
const editableCode = ref('')
const originalCode = ref('')
const codeLoading = ref(false)

// 配置Mermaid
const initMermaid = () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeVariables: {
      primaryColor: '#e1f5fe',
      primaryTextColor: '#01579b',
      primaryBorderColor: '#01579b',
      lineColor: '#333',
      secondaryColor: '#f3e5f5',
      tertiaryColor: '#e8f5e9'
    },
    securityLevel: 'loose',
    fontFamily: 'monospace',
    fontSize: 16,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    }
  })
}

onMounted(() => {
  initMermaid()
})

const generateDiagram = async () => {
  if (!input.description.trim()) {
    ElMessage.warning('请输入架构描述')
    return
  }

  if (!props.isFormValid) {
    ElMessage.warning('请先配置API连接信息')
    return
  }

  if (!props.selectedModel) {
    ElMessage.warning('请先选择一个模型')
    return
  }

  generating.value = true

  try {
    const prompt = `请根据以下描述生成一个系统架构图的Mermaid代码。要求：
1. 使用Mermaid语法生成graph TD图
2. 包含主要组件和它们之间的关系
3. 使用合适的颜色和样式
4. 代码要简洁明了
5. 只返回Mermaid代码，不要其他解释

架构描述：${input.description}

请生成对应的Mermaid架构图代码：`

    const response = await fetch(`${props.config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${props.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: props.selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
      signal: AbortSignal.timeout(60000)
    })

    if (!response.ok) {
      throw new Error(`LLM API请求失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      let content = result.choices[0].message.content || ''

      if (result.choices[0].message.reasoning_content) {
        console.log('Mermaid模型思考过程:', result.choices[0].message.reasoning_content)
      }

      let finalCode = content.trim()

      // 清理Mermaid代码块标记
      if (finalCode.includes('```mermaid')) {
        finalCode = finalCode.replace(/```mermaid\s*/g, '').replace(/```\s*$/g, '').trim()
      } else if (finalCode.includes('```')) {
        finalCode = finalCode.replace(/```\s*/g, '').replace(/```\s*$/g, '').trim()
      }

      // 验证Mermaid代码
      const validStarts = ['graph', 'flowchart', 'sequence', 'gantt', 'class', 'state', 'pie', 'journey', 'gitgraph', 'er', 'mindmap']
      const startsWithValidKeyword = validStarts.some(keyword =>
        finalCode.toLowerCase().startsWith(keyword.toLowerCase())
      )

      if (!startsWithValidKeyword) {
        console.warn('Mermaid代码可能不有效，但尝试渲染')
      }

      diagramCode.value = finalCode

      // 同步代码到编辑器
      editableCode.value = finalCode
      originalCode.value = finalCode

      // 切换到图表视图
      activeTab.value = 'diagram'

      await renderDiagram()
      ElMessage.success(`Mermaid架构图生成成功 (模型: ${result.model || 'unknown'}, 耗时: ${result.usage?.total_tokens || 0} tokens)`)
    } else {
      throw new Error('LLM API返回格式错误')
    }
  } catch (error) {
    console.error('生成Mermaid架构图失败:', error)

    let errorMessage = '生成失败，请重试'
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接'
      } else if (error.message.includes('401')) {
        errorMessage = 'API密钥无效，请检查配置'
      } else if (error.message.includes('404')) {
        errorMessage = 'API地址不正确，请检查配置'
      } else if (error.message.includes('429')) {
        errorMessage = '请求过于频繁，请稍后重试'
      } else if (error.message.includes('500')) {
        errorMessage = '服务器错误，请稍后重试'
      } else {
        errorMessage = error.message
      }
    }

    ElMessage.error(errorMessage)
  } finally {
    generating.value = false
  }
}

const renderDiagram = async () => {
  if (!diagramCode.value) {
    console.warn('没有Mermaid代码需要渲染')
    return
  }

  // 等待DOM更新
  await nextTick()

  // 确保容器元素存在
  if (!diagramContainer.value) {
    console.error('Mermaid图表容器不存在')
    return
  }

  try {
    // 延迟一小段时间确保容器完全渲染
    await new Promise(resolve => setTimeout(resolve, 100))

    // 清空容器
    diagramContainer.value.innerHTML = ''

    // 生成唯一ID避免冲突
    const graphId = `mermaid-graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log('开始渲染Mermaid图表:', graphId)
    console.log('Mermaid代码:', diagramCode.value)

    // 渲染图表
    const { svg } = await mermaid.render(graphId, diagramCode.value)

    // 设置SVG内容
    diagramContainer.value.innerHTML = svg

    console.log('Mermaid图表渲染成功')
  } catch (error) {
    console.error('Mermaid图表渲染失败:', error)

    // 提供更友好的错误信息
    let errorMessage = 'Mermaid图表渲染失败'
    if (error instanceof Error) {
      if (error.message.includes('Syntax error')) {
        errorMessage = 'Mermaid语法错误，请检查代码格式'
      } else if (error.message.includes('No diagram type detected')) {
        errorMessage = '未检测到图表类型，请确保代码以graph、flowchart等开头'
      } else {
        errorMessage = `Mermaid图表渲染失败: ${error.message}`
      }
    }

    ElMessage.error(errorMessage)
  }
}

const clearDiagram = () => {
  input.description = ''
  diagramCode.value = ''
  editableCode.value = ''
  originalCode.value = ''
  activeTab.value = 'diagram'
  if (diagramContainer.value) {
    diagramContainer.value.innerHTML = ''
  }
}

const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))
    await renderDiagram()
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(diagramCode.value)
    ElMessage.success('Mermaid代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const onCodeChange = () => {
  // 代码变化时的处理
}

const applyChanges = async () => {
  if (!editableCode.value.trim()) {
    ElMessage.warning('请输入有效的 Mermaid 代码')
    return
  }

  codeLoading.value = true

  try {
    diagramCode.value = editableCode.value

    activeTab.value = 'diagram'

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))

    await renderDiagram()

    ElMessage.success('Mermaid代码已应用，图表已更新')
  } catch (error) {
    console.error('应用Mermaid代码更改失败:', error)
    ElMessage.error(`应用代码失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    codeLoading.value = false
  }
}

const resetCode = () => {
  editableCode.value = originalCode.value
  ElMessage.info('Mermaid代码已重置为原始版本')
}

const formatCode = () => {
  try {
    let formatted = editableCode.value

    // 移除多余的空行
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n')

    // 确保每个节点定义在新行
    formatted = formatted.replace(/(\w+)\[/g, '\n$1[').trim()

    // 确保箭头关系在新行
    formatted = formatted.replace(/-->|-->/g, '\n    -->')

    editableCode.value = formatted
    ElMessage.success('Mermaid代码已格式化')
  } catch (error) {
    ElMessage.warning('Mermaid代码格式化失败')
  }
}

// ESC键退出全屏
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.mermaid-diagram {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diagram-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.diagram-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.diagram-content {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.diagram-container.fullscreen .diagram-content {
  max-width: none;
  max-height: none;
}

.diagram-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* 代码编辑器样式 */
.code-editor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.code-editor-wrapper {
  flex: 1;
  min-height: 400px;
}

.code-editor :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 400px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 16px;
}

.code-editor :deep(.el-textarea__inner):focus {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #e4e7ed;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 12px 16px;
}

/* Tab样式优化 */
:deep(.el-tabs__content) {
  padding: 20px 0;
}

:deep(.el-tab-pane) {
  min-height: 400px;
}

@media (max-width: 768px) {
  .mermaid-diagram {
    gap: 10px;
  }
}
</style>
