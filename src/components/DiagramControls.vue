<template>
    <div class="diagram-controls">
        <!-- 主要控制按钮 -->
        <div class="main-controls">
            <el-button type="primary" size="large" @click="handleGenerate" :loading="isGenerating"
                :disabled="!canGenerate">
                <el-icon v-if="!isGenerating">
                    <Magic />
                </el-icon>
                {{ isGenerating ? '生成中...' : '生成架构图' }}
            </el-button>

            <el-button @click="handleClear" :disabled="!hasDiagram">
                <el-icon>
                    <Delete />
                </el-icon>
                清空图表
            </el-button>
        </div>

        <!-- 图表格式选择 -->
        <div class="format-controls">
            <el-select v-model="selectedFormat" placeholder="选择图表格式" @change="handleFormatChange"
                :disabled="isGenerating">
                <el-option v-for="format in diagramFormats" :key="format.value" :label="format.label"
                    :value="format.value">
                    <div class="format-option">
                        <el-icon>
                            <component :is="format.icon" />
                        </el-icon>
                        <span>{{ format.label }}</span>
                        <el-tag size="small" type="info">{{ format.description }}</el-tag>
                    </div>
                </el-option>
            </el-select>
        </div>

        <!-- 高级选项 -->
        <div class="advanced-controls" v-if="showAdvanced">
            <el-collapse v-model="activeCollapse">
                <el-collapse-item title="高级选项" name="advanced">
                    <div class="advanced-options">
                        <!-- 图表主题 -->
                        <div class="option-group">
                            <label>图表主题:</label>
                            <el-radio-group v-model="selectedTheme" @change="handleThemeChange">
                                <el-radio-button label="default">默认</el-radio-button>
                                <el-radio-button label="dark">暗色</el-radio-button>
                                <el-radio-button label="forest">森林</el-radio-button>
                                <el-radio-button label="neutral">中性</el-radio-button>
                            </el-radio-group>
                        </div>

                        <!-- 布局方向 -->
                        <div class="option-group" v-if="selectedFormat === 'mermaid'">
                            <label>布局方向:</label>
                            <el-radio-group v-model="selectedDirection" @change="handleDirectionChange">
                                <el-radio-button label="TB">从上到下</el-radio-button>
                                <el-radio-button label="TD">从上到下</el-radio-button>
                                <el-radio-button label="BT">从下到上</el-radio-button>
                                <el-radio-button label="RL">从右到左</el-radio-button>
                                <el-radio-button label="LR">从左到右</el-radio-button>
                            </el-radio-group>
                        </div>

                        <!-- 生成选项 -->
                        <div class="option-group">
                            <el-checkbox v-model="options.includeDetails" @change="handleOptionChange">
                                包含详细说明
                            </el-checkbox>
                            <el-checkbox v-model="options.useColors" @change="handleOptionChange">
                                使用彩色标记
                            </el-checkbox>
                            <el-checkbox v-model="options.addIcons" @change="handleOptionChange">
                                添加图标标识
                            </el-checkbox>
                            <el-checkbox v-model="options.generateCode" @change="handleOptionChange">
                                同时生成代码注释
                            </el-checkbox>
                        </div>

                        <!-- 自定义样式 -->
                        <div class="option-group">
                            <label>自定义样式:</label>
                            <el-input v-model="customStyles" type="textarea" :rows="3" placeholder="输入自定义CSS样式..."
                                @blur="handleStyleChange" />
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
            <el-button text @click="showAdvanced = !showAdvanced" :icon="showAdvanced ? 'Hide' : 'View'">
                {{ showAdvanced ? '隐藏' : '显示' }}高级选项
            </el-button>

            <el-divider direction="vertical" />

            <el-button text @click="handlePreview" :disabled="!hasDiagram">
                <el-icon>
                    <View />
                </el-icon>
                预览
            </el-button>

            <el-button text @click="handleUndo" :disabled="!canUndo">
                <el-icon>
                    <RefreshLeft />
                </el-icon>
                撤销
            </el-button>

            <el-button text @click="handleRedo" :disabled="!canRedo">
                <el-icon>
                    <RefreshRight />
                </el-icon>
                重做
            </el-button>
        </div>

        <!-- 状态信息 -->
        <div class="status-info" v-if="statusInfo">
            <el-alert :type="statusInfo.type" :title="statusInfo.title" :description="statusInfo.description" show-icon
                :closable="false" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import {
    Delete,
    View,
    RefreshLeft,
    RefreshRight,
} from '@element-plus/icons-vue';

// 类型定义
interface DiagramFormat {
    value: 'mermaid' | 'plantuml';
    label: string;
    icon: string;
    description: string;
}

interface GenerateOptions {
    includeDetails: boolean;
    useColors: boolean;
    addIcons: boolean;
    generateCode: boolean;
}

interface StatusInfo {
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    description?: string;
}

// Props
interface Props {
    isGenerating?: boolean;
    hasDiagram?: boolean;
    canGenerate?: boolean;
    currentFormat?: 'mermaid' | 'plantuml';
}

// Emits
interface Emits {
    (
        e: 'generate-diagram',
        options: { format: string; options: GenerateOptions }
    ): void;
    (e: 'clear-diagram'): void;
    (e: 'format-change', format: string): void;
    (e: 'theme-change', theme: string): void;
    (e: 'direction-change', direction: string): void;
    (e: 'options-change', options: GenerateOptions): void;
    (e: 'style-change', styles: string): void;
    (e: 'preview'): void;
    (e: 'undo'): void;
    (e: 'redo'): void;
}

const props = withDefaults(defineProps<Props>(), {
    isGenerating: false,
    hasDiagram: false,
    canGenerate: false,
    currentFormat: 'mermaid',
});

const emit = defineEmits<Emits>();

// 响应式数据
const selectedFormat = ref(props.currentFormat);
const selectedTheme = ref('default');
const selectedDirection = ref('TB');
const showAdvanced = ref(false);
const activeCollapse = ref<string[]>([]);
const customStyles = ref('');
const canUndo = ref(false);
const canRedo = ref(false);
const statusInfo = ref<StatusInfo | null>(null);

const options = reactive<GenerateOptions>({
    includeDetails: true,
    useColors: true,
    addIcons: false,
    generateCode: false,
});

// 图表格式选项
const diagramFormats: DiagramFormat[] = [
    {
        value: 'mermaid',
        label: 'Mermaid',
        icon: 'Document',
        description: '推荐的图表格式',
    },
    {
        value: 'plantuml',
        label: 'PlantUML',
        icon: 'Picture',
        description: '功能强大的UML工具',
    },
];

// formatIcon 计算属性暂时未使用，但保留供将来使用
// const formatIcon = computed(() => {
//   const format = diagramFormats.find((f) => f.value === selectedFormat.value);
//   return format?.icon || 'Document';
// });

// 方法
const handleGenerate = () => {
    if (!props.canGenerate) {
        ElMessage.warning('请先输入有效的架构描述');
        return;
    }

    const generateOptions = {
        format: selectedFormat.value,
        options: { ...options },
        theme: selectedTheme.value,
        direction: selectedDirection.value,
        customStyles: customStyles.value,
    };

    emit('generate-diagram', generateOptions);
    showStatus('info', '开始生成架构图...', '正在调用LLM服务生成图表');
};

const handleClear = () => {
    emit('clear-diagram');
    showStatus('info', '已清空图表');
};

const handleFormatChange = (format: string) => {
    emit('format-change', format);
    showStatus('success', `已切换到${format}格式`);
};

const handleThemeChange = (theme: string) => {
    emit('theme-change', theme);
    showStatus('success', `已应用${theme}主题`);
};

const handleDirectionChange = (direction: string) => {
    emit('direction-change', direction);
    showStatus('success', `布局方向已设置为${getDirectionLabel(direction)}`);
};

const handleOptionChange = () => {
    emit('options-change', { ...options });
};

const handleStyleChange = () => {
    emit('style-change', customStyles.value);
    if (customStyles.value.trim()) {
        showStatus('success', '自定义样式已应用');
    }
};

const handlePreview = () => {
    emit('preview');
};

const handleUndo = () => {
    emit('undo');
    canUndo.value = false;
    canRedo.value = true;
};

const handleRedo = () => {
    emit('redo');
    canUndo.value = true;
    canRedo.value = false;
};

const getDirectionLabel = (direction: string): string => {
    const labels: Record<string, string> = {
        TB: '从上到下',
        TD: '从上到下',
        BT: '从下到上',
        RL: '从右到左',
        LR: '从左到右',
    };
    return labels[direction] || direction;
};

const showStatus = (
    type: StatusInfo['type'],
    title: string,
    description?: string
) => {
    statusInfo.value = { type, title, description };

    // 3秒后自动清除状态信息
    setTimeout(() => {
        if (statusInfo.value?.title === title) {
            statusInfo.value = null;
        }
    }, 3000);
};

// 键盘快捷键
const handleKeyboardShortcut = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                handleGenerate();
                break;
            case 'z':
                if (event.shiftKey) {
                    event.preventDefault();
                    handleRedo();
                } else {
                    event.preventDefault();
                    handleUndo();
                }
                break;
        }
    }

    if (event.key === 'Delete' && props.hasDiagram) {
        event.preventDefault();
        handleClear();
    }
};

// 添加键盘事件监听
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyboardShortcut);
});
</script>

<style scoped>
.diagram-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background-color: var(--el-bg-color-page);
    border-radius: 6px;
    border: 1px solid var(--el-border-color-light);
}

.main-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.format-controls {
    display: flex;
    justify-content: center;
}

.format-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.format-option .el-tag {
    margin-left: auto;
}

.advanced-controls {
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 16px;
}

.advanced-options {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.option-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.option-group>label {
    font-weight: 500;
    color: var(--el-text-color-primary);
    font-size: 14px;
}

.quick-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 12px;
}

.status-info {
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .diagram-controls {
        padding: 12px;
        gap: 12px;
    }

    .main-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .el-button {
        width: 100%;
    }

    .quick-actions {
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .quick-actions .el-divider {
        display: none;
    }

    .format-option {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }

    .format-option .el-tag {
        margin-left: 0;
        margin-top: 4px;
    }

    .advanced-options .el-radio-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .advanced-options .el-radio-button {
        width: 100%;
    }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
    .diagram-controls {
        background-color: var(--el-bg-color-overlay);
        border-color: var(--el-border-color);
    }
}
</style>
