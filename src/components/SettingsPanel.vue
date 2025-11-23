<template>
    <div class="settings-panel">
        <!-- 通用设置 -->
        <div class="settings-section">
            <h3>
                <el-icon>
                    <Setting />
                </el-icon>
                通用设置
            </h3>

            <div class="setting-item">
                <div class="setting-label">
                    <label>语言</label>
                    <span class="setting-desc">选择界面显示语言</span>
                </div>
                <el-select v-model="localSettings.language" @change="handleSettingChange">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                    <el-option label="繁體中文" value="zh-TW" />
                </el-select>
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>主题</label>
                    <span class="setting-desc">选择界面主题风格</span>
                </div>
                <el-select v-model="localSettings.theme" @change="handleSettingChange">
                    <el-option label="跟随系统" value="auto" />
                    <el-option label="浅色" value="light" />
                    <el-option label="深色" value="dark" />
                    <el-option label="高对比度" value="high-contrast" />
                </el-select>
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>字体大小</label>
                    <span class="setting-desc">调整界面文字大小</span>
                </div>
                <el-slider v-model="localSettings.fontSize" :min="12" :max="20" :step="1" show-stops show-input
                    @change="handleSettingChange" />
            </div>
        </div>

        <!-- 编辑器设置 -->
        <div class="settings-section">
            <h3>
                <el-icon>
                    <Edit />
                </el-icon>
                编辑器设置
            </h3>

            <div class="setting-item">
                <div class="setting-label">
                    <label>默认图表格式</label>
                    <span class="setting-desc">选择默认的图表生成格式</span>
                </div>
                <el-select v-model="localSettings.defaultDiagramFormat" @change="handleSettingChange">
                    <el-option label="Mermaid" value="mermaid" />
                    <el-option label="PlantUML" value="plantuml" />
                </el-select>
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>代码字体</label>
                    <span class="setting-desc">代码编辑器使用的字体</span>
                </div>
                <el-select v-model="localSettings.codeFont" @change="handleSettingChange">
                    <el-option label="Monaco" value="'Monaco', 'Menlo', 'Ubuntu Mono', monospace" />
                    <el-option label="Fira Code" value="'Fira Code', 'Consolas', monospace" />
                    <el-option label="JetBrains Mono" value="'JetBrains Mono', 'Consolas', monospace" />
                    <el-option label="Source Code Pro" value="'Source Code Pro', 'Consolas', monospace" />
                </el-select>
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>自动换行</label>
                    <span class="setting-desc">长行代码是否自动换行显示</span>
                </div>
                <el-switch v-model="localSettings.wordWrap" @change="handleSettingChange" />
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>显示行号</label>
                    <span class="setting-desc">代码编辑器是否显示行号</span>
                </div>
                <el-switch v-model="localSettings.showLineNumbers" @change="handleSettingChange" />
            </div>
        </div>

        <!-- 生成设置 -->
        <div class="settings-section">
            <h3>
                <el-icon>
                    <Tools />
                </el-icon>
                生成设置
            </h3>

            <div class="setting-item">
                <div class="setting-label">
                    <label>自动保存</label>
                    <span class="setting-desc">自动保存配置和图表历史</span>
                </div>
                <el-switch v-model="localSettings.autoSave" @change="handleSettingChange" />
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>超时时间</label>
                    <span class="setting-desc">图表生成的最大等待时间（秒）</span>
                </div>
                <el-input-number v-model="localSettings.timeout" :min="10" :max="300" :step="10"
                    @change="handleSettingChange" />
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>最大Token数</label>
                    <span class="setting-desc">单次生成请求的最大Token限制</span>
                </div>
                <el-input-number v-model="localSettings.maxTokens" :min="100" :max="4000" :step="100"
                    @change="handleSettingChange" />
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>历史记录数量</label>
                    <span class="setting-desc">保留的图表历史记录数量</span>
                </div>
                <el-input-number v-model="localSettings.historyLimit" :min="10" :max="200" :step="10"
                    @change="handleSettingChange" />
            </div>
        </div>

        <!-- 高级设置 -->
        <div class="settings-section">
            <h3>
                <el-icon>
                    <Tools />
                </el-icon>
                高级设置
            </h3>

            <div class="setting-item">
                <div class="setting-label">
                    <label>启用快捷键</label>
                    <span class="setting-desc">是否启用键盘快捷键</span>
                </div>
                <el-switch v-model="localSettings.shortcuts" @change="handleSettingChange" />
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>显示通知</label>
                    <span class="setting-desc">是否显示操作成功/失败通知</span>
                </div>
                <el-switch v-model="localSettings.notifications" @change="handleSettingChange" />
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>调试模式</label>
                    <span class="setting-desc">开启后会在控制台输出详细日志</span>
                </div>
                <el-switch v-model="localSettings.debugMode" @change="handleSettingChange" />
            </div>

            <div class="setting-item">
                <div class="setting-label">
                    <label>代理设置</label>
                    <span class="setting-desc">网络请求的代理服务器地址</span>
                </div>
                <el-input v-model="localSettings.proxy" placeholder="http://proxy.example.com:8080"
                    @blur="handleSettingChange" />
            </div>
        </div>

        <!-- 快捷键设置 -->
        <div class="settings-section" v-if="localSettings.shortcuts">
            <h3>
                <el-icon>
                    <Setting />
                </el-icon>
                快捷键设置
            </h3>

            <el-table :data="shortcutsData" :style="{ width: '100%' }" size="small">
                <el-table-column prop="action" label="功能" />
                <el-table-column prop="shortcut" label="快捷键" width="200">
                    <template #default="scope">
                        <el-input v-model="scope.row.shortcut" size="small" @blur="handleShortcutChange(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
            </el-table>
        </div>

        <!-- 重置按钮 -->
        <div class="settings-actions">
            <el-button @click="resetToDefaults">
                <el-icon>
                    <RefreshLeft />
                </el-icon>
                恢复默认设置
            </el-button>
            <el-button @click="exportSettings">
                <el-icon>
                    <Download />
                </el-icon>
                导出设置
            </el-button>
            <el-button @click="importSettings">
                <el-icon>
                    <Upload />
                </el-icon>
                导入设置
            </el-button>
            <el-button type="danger" @click="clearAllData">
                <el-icon>
                    <Delete />
                </el-icon>
                清除所有数据
            </el-button>
        </div>

        <!-- 隐藏的文件输入 -->
        <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileImport" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    Setting,
    Edit,
    Tools,
    RefreshLeft,
    Download,
    Upload,
    Delete,
} from '@element-plus/icons-vue';
import { StorageService } from '../services/storage';

// Props
interface Props {
    settings: Record<string, any>;
}

// Emits
interface Emits {
    (e: 'settings-change', settings: Record<string, any>): void;
    (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const localSettings = reactive({ ...props.settings });
const fileInput = ref<HTMLInputElement>();

// 快捷键数据
const shortcutsData = ref([
    {
        action: '生成图表',
        shortcut: 'Ctrl+Enter',
        description: '在输入框中生成架构图',
        key: 'generate',
    },
    {
        action: '复制代码',
        shortcut: 'Ctrl+C',
        description: '复制图表代码到剪贴板',
        key: 'copy',
    },
    {
        action: '清空内容',
        shortcut: 'Ctrl+N',
        description: '清空当前图表',
        key: 'clear',
    },
    {
        action: '快速聚焦',
        shortcut: 'Ctrl+K',
        description: '快速聚焦到输入框',
        key: 'focus',
    },
    {
        action: '显示帮助',
        shortcut: 'F1',
        description: '显示帮助对话框',
        key: 'help',
    },
]);

// 默认设置
const defaultSettings = {
    language: 'zh-CN',
    theme: 'auto',
    fontSize: 14,
    autoSave: true,
    shortcuts: true,
    notifications: true,
    debugMode: false,
    wordWrap: false,
    showLineNumbers: true,
    codeFont: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    defaultDiagramFormat: 'mermaid',
    timeout: 60,
    maxTokens: 2000,
    historyLimit: 50,
    proxy: '',
};

// 监听设置变化
watch(
    () => props.settings,
    (newSettings) => {
        Object.assign(localSettings, newSettings);
    },
    { deep: true }
);

// 方法
const handleSettingChange = () => {
    emit('settings-change', { ...localSettings });
};

const handleShortcutChange = (row: any) => {
    // 这里可以添加快捷键验证逻辑
    console.log('快捷键变化:', row.key, row.shortcut);
};

const resetToDefaults = async () => {
    try {
        await ElMessageBox.confirm(
            '确定要恢复所有设置为默认值吗？此操作不可撤销。',
            '确认重置',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        Object.assign(localSettings, defaultSettings);
        emit('settings-change', { ...localSettings });
        ElMessage.success('设置已恢复为默认值');
    } catch {
        // 用户取消
    }
};

const exportSettings = () => {
    try {
        const settingsData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            settings: localSettings,
            shortcuts: shortcutsData.value,
        };

        const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
            type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `architecture-generator-settings-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
        ElMessage.success('设置已导出');
    } catch (error) {
        ElMessage.error('导出设置失败');
    }
};

const importSettings = () => {
    fileInput.value?.click();
};

const handleFileImport = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);

            if (data.settings) {
                Object.assign(localSettings, data.settings);
            }

            if (data.shortcuts) {
                shortcutsData.value = data.shortcuts;
            }

            emit('settings-change', { ...localSettings });
            ElMessage.success('设置导入成功');
        } catch (error) {
            ElMessage.error('设置文件格式不正确');
        }
    };

    reader.readAsText(file);

    // 清除文件选择
    target.value = '';
};

const clearAllData = async () => {
    try {
        await ElMessageBox.confirm(
            '确定要清除所有数据吗？这将删除配置、历史记录和所有本地存储的数据。此操作不可撤销。',
            '确认清除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error',
            }
        );

        StorageService.clearAllData();
        Object.assign(localSettings, defaultSettings);
        emit('settings-change', { ...localSettings });
        ElMessage.success('所有数据已清除');
    } catch {
        // 用户取消
    }
};
</script>

<style scoped>
.settings-panel {
    max-height: 70vh;
    overflow-y: auto;
    padding: 0 8px;
}

.settings-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.settings-section:last-child {
    border-bottom: none;
}

.settings-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-color-primary);
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 20px;
}

.setting-label {
    flex: 1;
    min-width: 0;
}

.setting-label label {
    display: block;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
}

.setting-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
}

.settings-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .settings-panel {
        padding: 0;
    }

    .setting-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .settings-actions {
        flex-direction: column;
    }

    .settings-actions .el-button {
        width: 100%;
    }
}

/* 滚动条样式 */
.settings-panel::-webkit-scrollbar {
    width: 6px;
}

.settings-panel::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 3px;
}

.settings-panel::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-dark);
    border-radius: 3px;
}

.settings-panel::-webkit-scrollbar-thumb:hover {
    background: var(--el-fill-color-darker);
}

/* 表格样式调整 */
:deep(.el-table) {
    --el-table-border-color: var(--el-border-color-lighter);
}

:deep(.el-table th) {
    background-color: var(--el-bg-color-page);
}
</style>
