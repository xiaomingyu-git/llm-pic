<template>
  <div class="diagram-code">
    <!-- 代码编辑器头部 -->
    <div class="code-header">
      <div class="header-left">
        <el-tag :type="getLanguageTagType(language)" size="small">
          <el-icon>
            <Document />
          </el-icon>
          {{ getLanguageLabel(language) }}
        </el-tag>
        <span class="code-info">{{ getCodeInfo() }}</span>
      </div>

      <div class="header-right">
        <el-button-group size="small">
          <el-button @click="copyCode" :disabled="!code">
            <el-icon>
              <CopyDocument />
            </el-icon>
            复制
          </el-button>
          <el-button @click="downloadCode" :disabled="!code">
            <el-icon>
              <Download />
            </el-icon>
            下载
          </el-button>
          <el-button @click="toggleFullscreen" type="text">
            <el-icon>
              <FullScreen v-if="!isFullscreen" />
              <Aim v-else />
            </el-icon>
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </el-button>
          <el-button @click="$emit('close')" type="text">
            <el-icon>
              <Close />
            </el-icon>
            关闭
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="code-editor-container" :class="{ fullscreen: isFullscreen }">
      <div class="sidebar">
        <!-- 工具栏 -->
        <div class="toolbar">
          <el-tooltip content="格式化代码" placement="right">
            <el-button
              @click="formatCode"
              size="small"
              circle
              :disabled="!code"
            >
              <el-icon>
                <EditPen />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="清空代码" placement="right">
            <el-button
              @click="clearCode"
              size="small"
              circle
              type="danger"
              :disabled="!code"
            >
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-divider />

          <!-- 主题切换 -->
          <div class="theme-selector">
            <el-select
              v-model="selectedTheme"
              size="small"
              placeholder="主题"
              @change="handleThemeChange"
            >
              <el-option label="亮色" value="light" />
              <el-option label="暗色" value="dark" />
              <el-option label="高对比" value="high-contrast" />
            </el-select>
          </div>

          <el-divider />

          <!-- 字体大小 -->
          <div class="font-controls">
            <el-button @click="decreaseFontSize" size="small" circle>
              <el-icon>
                <ZoomOut />
              </el-icon>
            </el-button>
            <span class="font-size">{{ fontSize }}px</span>
            <el-button @click="increaseFontSize" size="small" circle>
              <el-icon>
                <ZoomIn />
              </el-icon>
            </el-button>
          </div>
        </div>

        <!-- 代码信息 -->
        <div class="code-stats" v-if="code">
          <h4>代码统计</h4>
          <div class="stat-item">
            <span>行数:</span>
            <span>{{ lineCount }}</span>
          </div>
          <div class="stat-item">
            <span>字符:</span>
            <span>{{ characterCount }}</span>
          </div>
          <div class="stat-item">
            <span>大小:</span>
            <span>{{ formatFileSize(code.length) }}</span>
          </div>
        </div>
      </div>

      <!-- 代码编辑器 -->
      <div class="editor-main">
        <div class="line-numbers" ref="lineNumbers">
          <div
            v-for="n in lineCount"
            :key="n"
            class="line-number"
            :class="{ 'current-line': n === currentLine }"
          >
            {{ n }}
          </div>
        </div>

        <textarea
          ref="codeEditor"
          v-model="editableCode"
          class="code-editor"
          :style="{
            fontSize: fontSize + 'px',
            fontFamily: selectedFont,
            lineHeight: lineHeight + 'px',
          }"
          spellcheck="false"
          @scroll="syncLineNumbers"
          @keydown="handleKeyDown"
          @input="handleInput"
          @click="updateCurrentLine"
          @keyup="updateCurrentLine"
          placeholder="图表代码将显示在这里..."
        />

        <!-- 语法高亮覆盖层 -->
        <div
          ref="syntaxHighlight"
          class="syntax-highlight"
          v-html="highlightedCode"
          :style="{
            fontSize: fontSize + 'px',
            fontFamily: selectedFont,
            lineHeight: lineHeight + 'px',
          }"
          @click="focusEditor"
        />
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span>{{ currentLine }}:{{ currentColumn }}</span>
        <el-divider direction="vertical" />
        <span>{{ getLanguageLabel(language) }}</span>
        <el-divider direction="vertical" />
        <span>UTF-8</span>
      </div>

      <div class="status-right">
        <el-button
          @click="toggleWordWrap"
          size="small"
          type="text"
          :class="{ active: wordWrap }"
        >
          <el-icon>
            <Sort />
          </el-icon>
          自动换行
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

import {
  Document,
  CopyDocument,
  Download,
  FullScreen,
  Aim,
  Close,
  EditPen,
  Delete,
  ZoomIn,
  ZoomOut,
  Sort,
} from '@element-plus/icons-vue';
import { copyToClipboard } from '../../../services/copyService';

// Props
interface Props {
  code?: string;
  language?: 'mermaid' | 'plantuml' | 'auto';
  readonly?: boolean;
  theme?: string;
}

// Emits
interface Emits {
  (e: 'copy'): void;
  (e: 'close'): void;
  (e: 'code-change', code: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: 'auto',
  readonly: false,
  theme: 'light',
});

const emit = defineEmits<Emits>();

// 响应式数据
const editableCode = ref(props.code);
const selectedTheme = ref(props.theme);
const selectedFont = ref("'Monaco', 'Menlo', 'Ubuntu Mono', monospace");
const fontSize = ref(14);
const lineHeight = ref(20);
const isFullscreen = ref(false);
const wordWrap = ref(false);
const currentLine = ref(1);
const currentColumn = ref(1);

// 模板引用
const codeEditor = ref<HTMLTextAreaElement>();
const lineNumbers = ref<HTMLElement>();
const syntaxHighlight = ref<HTMLElement>();

// 计算属性
const lineCount = computed(() => {
  return editableCode.value ? editableCode.value.split('\n').length : 1;
});

const characterCount = computed(() => {
  return editableCode.value ? editableCode.value.length : 0;
});

const detectedLanguage = computed(() => {
  if (props.language !== 'auto') return props.language;

  // 自动检测语言
  if (!editableCode.value) return 'mermaid';

  const code = editableCode.value.toLowerCase().trim();
  if (code.includes('@startuml') || code.includes('@enduml')) {
    return 'plantuml';
  }
  return 'mermaid';
});

const highlightedCode = computed(() => {
  return highlightCode(
    editableCode.value,
    detectedLanguage.value,
    selectedTheme.value
  );
});

// 方法
const getLanguageLabel = (lang: string): string => {
  const labels: Record<string, string> = {
    mermaid: 'Mermaid',
    plantuml: 'PlantUML',
    auto: '自动检测',
  };
  return labels[lang] || lang;
};

const getLanguageTagType = (lang: string): string => {
  const types: Record<string, string> = {
    mermaid: 'success',
    plantuml: 'warning',
    auto: 'info',
  };
  return types[lang] || 'info';
};

const getCodeInfo = (): string => {
  if (!editableCode.value) return '空文件';
  const lines = lineCount.value;
  const chars = characterCount.value;
  return `${lines} 行, ${chars} 字符`;
};

const copyCode = async () => {
  try {
    const success = await copyToClipboard(editableCode.value);
    if (success) {
      emit('copy');
      ElMessage.success('代码已复制到剪贴板');
    } else {
      ElMessage.error('复制失败');
    }
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

const downloadCode = () => {
  if (!editableCode.value) return;

  const extension = detectedLanguage.value === 'plantuml' ? 'puml' : 'mmd';
  const filename = `diagram_${Date.now()}.${extension}`;

  const blob = new Blob([editableCode.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  ElMessage.success(`文件 ${filename} 已下载`);
};

const formatCode = () => {
  // 基本的代码格式化
  if (!editableCode.value) return;

  try {
    let formatted = editableCode.value;

    // 移除多余的空行
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // 移除行尾空格
    formatted = formatted.replace(/[ \t]+$/gm, '');

    // 确保文件结尾有换行
    if (!formatted.endsWith('\n')) {
      formatted += '\n';
    }

    editableCode.value = formatted;
    ElMessage.success('代码已格式化');
  } catch (error) {
    ElMessage.error('格式化失败');
  }
};

const clearCode = () => {
  editableCode.value = '';
  ElMessage.info('代码已清空');
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const toggleWordWrap = () => {
  wordWrap.value = !wordWrap.value;
};

const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2;
    lineHeight.value += 2;
  }
};

const decreaseFontSize = () => {
  if (fontSize.value > 10) {
    fontSize.value -= 2;
    lineHeight.value -= 2;
  }
};

const handleThemeChange = (theme: string) => {
  selectedTheme.value = theme;
};

const syncLineNumbers = () => {
  if (lineNumbers.value && codeEditor.value) {
    lineNumbers.value.scrollTop = codeEditor.value.scrollTop;
  }
};

const updateCurrentLine = () => {
  if (!codeEditor.value) return;

  const text = codeEditor.value.value;
  const position = codeEditor.value.selectionStart;

  const lines = text.substring(0, position).split('\n');
  currentLine.value = lines.length;
  currentColumn.value = lines[lines.length - 1].length + 1;
};

const focusEditor = () => {
  codeEditor.value?.focus();
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  editableCode.value = target.value;
  emit('code-change', target.value);
  updateCurrentLine();
  syncLineNumbers();
};

const handleKeyDown = (event: KeyboardEvent) => {
  // Tab 键处理
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = codeEditor.value?.selectionStart || 0;
    const end = codeEditor.value?.selectionEnd || 0;
    const value = editableCode.value;

    editableCode.value =
      value.substring(0, start) + '  ' + value.substring(end);

    nextTick(() => {
      codeEditor.value?.setSelectionRange(start + 2, start + 2);
    });
  }

  // Ctrl+S 保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    downloadCode();
  }

  // Ctrl+A 全选
  if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    event.preventDefault();
    codeEditor.value?.select();
  }
};

const highlightCode = (
  code: string,
  language: string,
  _theme: string
): string => {
  if (!code) return '';

  // 简单的语法高亮实现
  let highlighted = escapeHtml(code);

  // 关键字高亮
  const keywords = {
    mermaid: [
      'graph',
      'flowchart',
      'subgraph',
      'end',
      'linkStyle',
      'classDef',
      'class',
      'click',
      'callback',
      'hypertext',
      'loadjavascript',
      'init',
      'config',
    ],
    plantuml: [
      '@startuml',
      '@enduml',
      'component',
      'interface',
      'package',
      'node',
      'database',
      'actor',
      'usecase',
      'class',
      'object',
      'sequence',
      'state',
    ],
  };

  const langKeywords =
    keywords[language as keyof typeof keywords] || keywords.mermaid;

  // 高亮关键字
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    highlighted = highlighted.replace(
      regex,
      `<span class="keyword">${keyword}</span>`
    );
  });

  // 高亮字符串
  highlighted = highlighted.replace(
    /"([^"]*)"/g,
    '<span class="string">"$1"</span>'
  );
  highlighted = highlighted.replace(
    /'([^']*)'/g,
    '<span class="string">\'$1\'</span>'
  );

  // 高亮注释
  highlighted = highlighted.replace(
    /(%%.*$)/gm,
    '<span class="comment">$1</span>'
  );
  highlighted = highlighted.replace(
    /(<!--.*?-->)/gs,
    '<span class="comment">$1</span>'
  );
  highlighted = highlighted.replace(
    /('(?:.|\n)*?')/gm,
    '<span class="comment">$1</span>'
  );

  // 高亮箭头和连接符
  highlighted = highlighted.replace(
    /(-->|<--|<-->\.\.|...)/g,
    '<span class="arrow">$1</span>'
  );

  // 处理换行
  highlighted = highlighted.replace(/\n/g, '\n');

  return highlighted;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// 监听代码变化
watch(
  () => props.code,
  (newCode) => {
    editableCode.value = newCode || '';
  }
);

// 监听语言变化
watch(detectedLanguage, () => {
  // 语言变化时重新渲染高亮
  nextTick(() => {
    if (syntaxHighlight.value) {
      syntaxHighlight.value.innerHTML = highlightedCode.value;
    }
  });
});

// 快捷键处理
const handleGlobalKeyDown = (event: KeyboardEvent) => {
  // Escape 退出全屏
  if (event.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>

<style scoped>
.diagram-code {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.code-editor-container {
  display: flex;
  height: 500px;
  overflow: hidden;
}

.code-editor-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-selector {
  width: 100%;
}

.font-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.font-size {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.code-stats {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: auto;
}

.code-stats h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.stat-item span:first-child {
  color: var(--el-text-color-secondary);
}

.stat-item span:last-child {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.editor-main {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.line-numbers {
  width: 50px;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
  padding: 12px 0;
  text-align: center;
  overflow: hidden;
  user-select: none;
}

.line-number {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-family: monospace;
}

.line-number.current-line {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: bold;
}

.code-editor {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 12px 16px;
  background-color: transparent;
  color: transparent;
  caret-color: var(--el-color-primary);
  white-space: pre;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 20px;
}

.syntax-highlight {
  position: absolute;
  top: 0;
  left: 51px;
  right: 0;
  bottom: 0;
  padding: 12px 16px;
  background-color: transparent;
  pointer-events: none;
  white-space: pre;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 20px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-right .el-button.active {
  color: var(--el-color-primary);
}

/* 语法高亮样式 */
:deep(.keyword) {
  color: #0066cc;
  font-weight: bold;
}

:deep(.string) {
  color: #009900;
}

:deep(.comment) {
  color: #999999;
  font-style: italic;
}

:deep(.arrow) {
  color: #cc6600;
  font-weight: bold;
}

/* 深色主题 */
.diagram-code[data-theme='dark'] {
  --el-bg-color: #1e1e1e;
  --el-bg-color-page: #252526;
  --el-border-color: #3e3e42;
  --el-border-color-light: #3e3e42;
  --el-text-color-primary: #cccccc;
  --el-text-color-secondary: #969696;
  --el-text-color-placeholder: #6e6e6e;
}

.diagram-code[data-theme='dark'] :deep(.keyword) {
  color: #569cd6;
}

.diagram-code[data-theme='dark'] :deep(.string) {
  color: #ce9178;
}

.diagram-code[data-theme='dark'] :deep(.comment) {
  color: #6a9955;
}

.diagram-code[data-theme='dark'] :deep(.arrow) {
  color: #d4d4d4;
}

/* 高对比度主题 */
.diagram-code[data-theme='high-contrast'] {
  --el-bg-color: #ffffff;
  --el-bg-color-page: #f8f8f8;
  --el-border-color: #000000;
  --el-border-color-light: #666666;
  --el-text-color-primary: #000000;
  --el-text-color-secondary: #333333;
  --el-text-color-placeholder: #666666;
}

.diagram-code[data-theme='high-contrast'] :deep(.keyword) {
  color: #0000ff;
  font-weight: bold;
}

.diagram-code[data-theme='high-contrast'] :deep(.string) {
  color: #008000;
}

.diagram-code[data-theme='high-contrast'] :deep(.comment) {
  color: #808080;
  font-style: italic;
}

.diagram-code[data-theme='high-contrast'] :deep(.arrow) {
  color: #ff0000;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .code-editor-container {
    height: 400px;
  }

  .sidebar {
    width: 60px;
    padding: 8px;
  }

  .toolbar :deep(.el-select) {
    width: 100%;
  }

  .code-stats {
    display: none;
  }

  .header-left .code-info {
    display: none;
  }

  .status-bar .status-left span:not(:first-child) {
    display: none;
  }
}
</style>
