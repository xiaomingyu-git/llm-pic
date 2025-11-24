<template>
  <div class="xml-diagram">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>XML 架构图生成</span>
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
            生成 XML 架构图
          </el-button>
          <el-button @click="clearDiagram">清空</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表显示区域 -->
    <el-card v-if="diagramCode">
      <template #header>
        <div class="card-header">
          <span>XML 架构图</span>
          <div>
            <el-button
              size="small"
              @click="toggleFullscreen"
              v-if="activeTab === 'diagram'"
            >
              <el-icon>
                <FullScreen />
              </el-icon>
              {{ isFullscreen ? '退出全屏' : '全屏显示' }}
            </el-button>
            <el-button size="small" @click="copyCode">
              <el-icon>
                <CopyDocument />
              </el-icon>
              复制代码
            </el-button>
          </div>
        </div>
      </template>

      <!-- Tab容器 -->
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="图表视图" name="diagram">
          <div class="diagram-container" :class="{ fullscreen: isFullscreen }">
            <div ref="diagramContainer" class="diagram-content"></div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="代码编辑" name="code">
          <div class="code-editor-container">
            <div class="editor-header">
              <span>XML 代码编辑器</span>
              <el-button
                size="small"
                type="primary"
                @click="applyChanges"
                :disabled="codeLoading"
              >
                <el-icon>
                  <Refresh />
                </el-icon>
                {{ codeLoading ? '渲染中...' : '应用更改' }}
              </el-button>
            </div>
            <div class="code-editor-wrapper">
              <el-input
                v-model="editableCode"
                type="textarea"
                :rows="20"
                placeholder="在这里编辑 XML 代码..."
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
              <el-button size="small" type="warning" @click="formatCode">
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
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue';

import { CopyDocument, Refresh, FullScreen } from '@element-plus/icons-vue';
import { xmlDiagramService } from '../services/xmlDiagramService';

interface DiagramInput {
  description: string;
}

interface Props {
  config: {
    url: string;
    apiKey: string;
    model?: string;
  };
  selectedModel: string;
  isFormValid: boolean;
}

const props = defineProps<Props>();

const input = reactive<DiagramInput>({
  description: '',
});

const generating = ref(false);
const diagramCode = ref('');
const diagramContainer = ref<HTMLElement>();
const isFullscreen = ref(false);
const activeTab = ref('diagram');
const editableCode = ref('');
const originalCode = ref('');
const codeLoading = ref(false);

const generateDiagram = async () => {
  if (!input.description.trim()) {
    ElMessage.warning('请输入架构描述');
    return;
  }

  if (!props.isFormValid) {
    ElMessage.warning('请先配置API连接信息');
    return;
  }

  if (!props.selectedModel) {
    ElMessage.warning('请先选择一个模型');
    return;
  }

  generating.value = true;

  try {
    const prompt = `请根据以下描述生成一个系统架构图的XML代码。要求：
1. 使用XML格式定义架构图
2. 包含components（组件）和connections（连接）部分
3. 每个组件需要定义id、label、x、y坐标、宽度、高度和类型
4. 连接关系需要定义from、to节点和可选的label
5. 使用合适的布局，确保组件位置合理
6. 只返回XML代码，不要其他解释

架构描述：${input.description}

请生成对应的XML架构图代码：`;

    const response = await fetch(`${props.config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${props.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: props.selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(
        `LLM API请求失败: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    if (
      result.choices &&
      result.choices.length > 0 &&
      result.choices[0].message
    ) {
      const content = result.choices[0].message.content || '';

      if (result.choices[0].message.reasoning_content) {
        console.log(
          'XML模型思考过程:',
          result.choices[0].message.reasoning_content
        );
      }

      let finalCode = content.trim();

      // 清理XML代码块标记
      if (finalCode.includes('```xml')) {
        finalCode = finalCode
          .replace(/```xml\s*/g, '')
          .replace(/```\s*$/g, '')
          .trim();
      } else if (finalCode.includes('```')) {
        finalCode = finalCode
          .replace(/```\s*/g, '')
          .replace(/```\s*$/g, '')
          .trim();
      }

      diagramCode.value = finalCode;

      // 同步代码到编辑器
      editableCode.value = finalCode;
      originalCode.value = finalCode;

      // 切换到图表视图
      activeTab.value = 'diagram';

      await renderDiagram();
      ElMessage.success(
        `XML架构图生成成功 (模型: ${result.model || 'unknown'}, 耗时: ${result.usage?.total_tokens || 0} tokens)`
      );
    } else {
      throw new Error('LLM API返回格式错误');
    }
  } catch (error) {
    console.error('生成XML架构图失败:', error);

    let errorMessage = '生成失败，请重试';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接';
      } else if (error.message.includes('401')) {
        errorMessage = 'API密钥无效，请检查配置';
      } else if (error.message.includes('404')) {
        errorMessage = 'API地址不正确，请检查配置';
      } else if (error.message.includes('429')) {
        errorMessage = '请求过于频繁，请稍后重试';
      } else if (error.message.includes('500')) {
        errorMessage = '服务器错误，请稍后重试';
      } else {
        errorMessage = error.message;
      }
    }

    ElMessage.error(errorMessage);
  } finally {
    generating.value = false;
  }
};

const renderDiagram = async () => {
  if (!diagramCode.value) {
    console.warn('没有XML代码需要渲染');
    return;
  }

  // 等待DOM更新
  await nextTick();

  // 确保容器元素存在
  if (!diagramContainer.value) {
    console.error('XML图表容器不存在');
    return;
  }

  try {
    // 延迟一小段时间确保容器完全渲染
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log('开始渲染XML图表');
    console.log('XML代码:', diagramCode.value);

    // 解析XML
    const diagram = xmlDiagramService.parseXML(diagramCode.value);

    // 渲染为HTML
    const html = xmlDiagramService.renderToHTML(diagram);

    // 设置HTML内容
    diagramContainer.value.innerHTML = html;

    console.log('XML图表渲染成功');
  } catch (error) {
    console.error('XML图表渲染失败:', error);

    // 提供更友好的错误信息
    let errorMessage = 'XML图表渲染失败';
    if (error instanceof Error) {
      if (error.message.includes('XML解析错误')) {
        errorMessage = 'XML格式不正确，请检查语法';
      } else {
        errorMessage = `XML图表渲染失败: ${error.message}`;
      }
    }

    ElMessage.error(errorMessage);
  }
};

const clearDiagram = () => {
  input.description = '';
  diagramCode.value = '';
  editableCode.value = '';
  originalCode.value = '';
  activeTab.value = 'diagram';
  if (diagramContainer.value) {
    diagramContainer.value.innerHTML = '';
  }
};

const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value;

  if (isFullscreen.value) {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await renderDiagram();
  }
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(diagramCode.value);
    ElMessage.success('XML代码已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

const onCodeChange = () => {
  // 代码变化时的处理
};

const applyChanges = async () => {
  if (!editableCode.value.trim()) {
    ElMessage.warning('请输入有效的 XML 代码');
    return;
  }

  codeLoading.value = true;

  try {
    diagramCode.value = editableCode.value;

    activeTab.value = 'diagram';

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 200));

    await renderDiagram();

    ElMessage.success('XML代码已应用，图表已更新');
  } catch (error) {
    console.error('应用XML代码更改失败:', error);
    ElMessage.error(
      `应用代码失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  } finally {
    codeLoading.value = false;
  }
};

const resetCode = () => {
  editableCode.value = originalCode.value;
  ElMessage.info('XML代码已重置为原始版本');
};

const formatCode = () => {
  try {
    let formatted = editableCode.value;

    // 基本的XML格式化
    formatted = formatted.replace(/></g, '>\n  </');
    formatted = formatted.replace(/<([^>/]+)\/>/g, '<$1/>');

    editableCode.value = formatted;
    ElMessage.success('XML代码已格式化');
  } catch (error) {
    ElMessage.warning('XML代码格式化失败');
  }
};

// ESC键退出全屏
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.xml-diagram {
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

/* XML图表样式 */
.diagram-content :deep(.xml-diagram-render) {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.diagram-content :deep(.xml-node) {
  position: absolute;
  background: #ffffff;
  border: 2px solid #409eff;
  border-radius: 8px;
  padding: 10px;
  min-width: 80px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  z-index: 1;
}

.diagram-content :deep(.xml-node.database) {
  background: #e1f3d8;
  border-color: #67c23a;
}

.diagram-content :deep(.xml-node.server) {
  background: #fdf6ec;
  border-color: #e6a23c;
}

.diagram-content :deep(.xml-node.client) {
  background: #f4f4f5;
  border-color: #909399;
}

.diagram-content :deep(.xml-connection) {
  position: absolute;
  stroke: #409eff;
  stroke-width: 2;
  fill: none;
  z-index: 0;
}

.diagram-content :deep(.xml-connection-label) {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
  transform: translate(-50%, -50%);
  z-index: 2;
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
  .xml-diagram {
    gap: 10px;
  }
}
</style>
