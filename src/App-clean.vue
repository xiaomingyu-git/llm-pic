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
                        <el-button text @click="showHelp = true" :icon="QuestionFilled">
                            帮助
                        </el-button>
                        <el-button text @click="showSettings = true" :icon="Setting">
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
                                    <ConnectionStatus :config="config" :status="connectionStatus"
                                        :last-connection-time="lastConnectionTime" :error-message="connectionError"
                                        @status-change="handleConnectionStatusChange"
                                        @connection-details="handleConnectionDetails" @error="handleConnectionError" />
                                </div>
                            </template>

                            <el-form :model="config" label-width="80px">
                                <el-form-item label="API URL">
                                    <el-input v-model="config.url"
                                        placeholder="输入LLM API地址，如: https://api.openai.com/v1" @blur="validateForm" />
                                </el-form-item>

                                <el-form-item label="API Key">
                                    <el-input v-model="config.apiKey" type="password" placeholder="输入API密钥"
                                        show-password @blur="validateForm" />
                                </el-form-item>

                                <el-form-item label="选择模型" v-if="availableModels.length > 0">
                                    <el-select v-model="selectedModel" placeholder="请选择模型" clearable filterable
                                        @change="handleModelChange" style="width: 100%">
                                        <el-option v-for="model in availableModels" :key="model.id"
                                            :label="model.display_name || model.id" :value="model.id">
                                            <div class="model-option">
                                                <div class="model-name">
                                                    {{ model.display_name || model.id }}
                                                </div>
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
                                        <el-icon>
                                            <InfoFilled />
                                        </el-icon>
                                        <span>请选择一个模型用于生成架构图</span>
                                    </div>
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" @click="testConnection" :loading="testingConnection"
                                        :disabled="!isFormValid">
                                        测试连接
                                    </el-button>
                                    <el-button @click="saveConfig">保存配置</el-button>
                                    <el-button type="info" @click="getModels" :loading="loadingModels"
                                        :disabled="!isFormValid">
                                        {{ loadingModels ? '获取中...' : '获取模型列表' }}
                                    </el-button>
                                    <el-button v-if="availableModels.length > 0" type="success" @click="refreshModels"
                                        :loading="loadingModels" :disabled="!isFormValid" size="small">
                                        <el-icon>
                                            <Refresh />
                                        </el-icon>
                                        刷新
                                    </el-button>
                                </el-form-item>
                            </el-form>
                        </el-card>
                    </div>

                    <!-- Mermaid架构图生成区域 -->
                    <div class="diagram-section">
                        <el-card>
                            <template #header>
                                <div class="card-header">
                                    <span>Mermaid 架构图生成</span>
                                    <el-tag size="small" type="primary">推荐</el-tag>
                                </div>
                            </template>

                            <el-form :model="mermaidInput" label-width="80px">
                                <el-form-item label="描述">
                                    <el-input v-model="mermaidInput.description" type="textarea" :rows="4"
                                        placeholder="描述您想要生成的系统架构，例如：创建一个包含前端、后端和数据库的Web应用程序" maxlength="500"
                                        show-word-limit />
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" @click="generateMermaidDiagram"
                                        :loading="generatingMermaid"
                                        :disabled="!mermaidInput.description.trim() || !isFormValid">
                                        生成 Mermaid 架构图
                                    </el-button>
                                    <el-button @click="clearMermaidDiagram">清空</el-button>
                                </el-form-item>
                            </el-form>
                        </el-card>
                    </div>

                    <!-- Mermaid图表显示区域 -->
                    <div class="display-section" v-if="mermaidCode">
                        <el-card>
                            <template #header>
                                <div class="card-header">
                                    <span>生成的 Mermaid 架构图</span>
                                    <div>
                                        <el-button size="small" @click="toggleMermaidFullscreen">
                                            <el-icon>
                                                <FullScreen />
                                            </el-icon>
                                            {{ isMermaidFullscreen ? '退出全屏' : '全屏显示' }}
                                        </el-button>
                                        <el-button size="small" @click="copyMermaidCode">
                                            <el-icon>
                                                <CopyDocument />
                                            </el-icon>
                                            复制代码
                                        </el-button>
                                    </div>
                                </div>
                            </template>

                            <!-- Tab容器 -->
                            <el-tabs v-model="mermaidActiveTab" type="border-card">
                                <el-tab-pane label="图表视图" name="diagram">
                                    <div class="diagram-container" :class="{ fullscreen: isMermaidFullscreen }">
                                        <div ref="mermaidContainer" class="diagram-content"></div>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="代码编辑" name="code">
                                    <div class="code-editor-container">
                                        <div class="editor-header">
                                            <span>Mermaid 代码编辑器</span>
                                            <el-button size="small" type="primary" @click="applyMermaidChanges"
                                                :disabled="mermaidCodeLoading">
                                                <el-icon>
                                                    <Refresh />
                                                </el-icon>
                                                {{ mermaidCodeLoading ? '渲染中...' : '应用更改' }}
                                            </el-button>
                                        </div>
                                        <div class="code-editor-wrapper">
                                            <el-input v-model="editableMermaidCode" type="textarea" :rows="20"
                                                placeholder="在这里编辑 Mermaid 代码..." class="code-editor" />
                                        </div>
                                        <div class="editor-footer">
                                            <el-button size="small" @click="resetMermaidCode"
                                                :disabled="originalMermaidCode === editableMermaidCode">
                                                重置为原始代码
                                            </el-button>
                                            <el-button size="small" type="warning" @click="formatMermaidCode">
                                                格式化代码
                                            </el-button>
                                        </div>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </el-card>
                    </div>

                    <!-- XML架构图生成区域 -->
                    <div class="diagram-section">
                        <el-card>
                            <template #header>
                                <div class="card-header">
                                    <span>XML 架构图生成</span>
                                    <el-tag size="small" type="success">高级</el-tag>
                                </div>
                            </template>

                            <el-form :model="xmlInput" label-width="80px">
                                <el-form-item label="描述">
                                    <el-input v-model="xmlInput.description" type="textarea" :rows="4"
                                        placeholder="描述您想要生成的系统架构，XML格式支持精确的布局控制" maxlength="500" show-word-limit />
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="success" @click="generateXMLDiagram" :loading="generatingXML"
                                        :disabled="!xmlInput.description.trim() || !isFormValid">
                                        生成 XML 架构图
                                    </el-button>
                                    <el-button @click="clearXMLDiagram">清空</el-button>
                                </el-form-item>
                            </el-form>
                        </el-card>
                    </div>

                    <!-- XML图表显示区域 -->
                    <div class="display-section" v-if="xmlCode">
                        <el-card>
                            <template #header>
                                <div class="card-header">
                                    <span>生成的 XML 架构图</span>
                                    <div>
                                        <el-button size="small" @click="toggleXMLFullscreen">
                                            <el-icon>
                                                <FullScreen />
                                            </el-icon>
                                            {{ isXMLFullscreen ? '退出全屏' : '全屏显示' }}
                                        </el-button>
                                        <el-button size="small" @click="copyXMLCode">
                                            <el-icon>
                                                <CopyDocument />
                                            </el-icon>
                                            复制代码
                                        </el-button>
                                    </div>
                                </div>
                            </template>

                            <!-- Tab容器 -->
                            <el-tabs v-model="xmlActiveTab" type="border-card">
                                <el-tab-pane label="图表视图" name="diagram">
                                    <div class="diagram-container" :class="{ fullscreen: isXMLFullscreen }">
                                        <div ref="xmlContainer" class="diagram-content"></div>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="代码编辑" name="code">
                                    <div class="code-editor-container">
                                        <div class="editor-header">
                                            <span>XML 代码编辑器</span>
                                            <el-button size="small" type="primary" @click="applyXMLChanges"
                                                :disabled="xmlCodeLoading">
                                                <el-icon>
                                                    <Refresh />
                                                </el-icon>
                                                {{ xmlCodeLoading ? '渲染中...' : '应用更改' }}
                                            </el-button>
                                        </div>
                                        <div class="code-editor-wrapper">
                                            <el-input v-model="editableXMLCode" type="textarea" :rows="20"
                                                placeholder="在这里编辑 XML 代码..." class="code-editor" />
                                        </div>
                                        <div class="editor-footer">
                                            <el-button size="small" @click="resetXMLCode"
                                                :disabled="originalXMLCode === editableXMLCode">
                                                重置为原始代码
                                            </el-button>
                                            <el-button size="small" type="warning" @click="formatXMLCode">
                                                格式化代码
                                            </el-button>
                                        </div>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </el-card>
                    </div>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
    CopyDocument,
    QuestionFilled,
    Setting,
    Refresh,
    InfoFilled,
    FullScreen,
} from '@element-plus/icons-vue';
import mermaid from 'mermaid';
import ConnectionStatus from './components/ConnectionStatus.vue';
import { StorageService } from './services/storage';
import { XMLDiagramService } from './services/xmlDiagramService';

// 配置Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeVariables: {
        primaryColor: '#e1f5fe',
        primaryTextColor: '#01579b',
        primaryBorderColor: '#01579b',
        lineColor: '#333',
        secondaryColor: '#f3e5f5',
        tertiaryColor: '#e8f5e9',
    },
    securityLevel: 'loose',
    fontFamily: 'monospace',
    fontSize: 16,
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
    },
});

// 响应式数据
interface LLMConfig {
    url: string;
    apiKey: string;
    model?: string;
}

interface DiagramInput {
    description: string;
}

const config = reactive<LLMConfig>({
    url: '',
    apiKey: '',
    model: '',
});

// Mermaid输入
const mermaidInput = reactive<DiagramInput>({
    description: '',
});

// XML输入
const xmlInput = reactive<DiagramInput>({
    description: '',
});

const connectionStatus = ref<
    'disconnected' | 'testing' | 'connected' | 'error'
>('disconnected');
const connectionError = ref('');
const lastConnectionTime = ref<Date | null>(null);
const connectionDetails = ref<any>(null);
const testingConnection = ref(false);
const loadingModels = ref(false);

// Mermaid相关数据
const generatingMermaid = ref(false);
const mermaidCode = ref('');
const mermaidContainer = ref<HTMLElement>();
const isMermaidFullscreen = ref(false);
const mermaidActiveTab = ref('diagram');
const editableMermaidCode = ref('');
const originalMermaidCode = ref('');
const mermaidCodeLoading = ref(false);

// XML相关数据
const generatingXML = ref(false);
const xmlCode = ref('');
const xmlContainer = ref<HTMLElement>();
const isXMLFullscreen = ref(false);
const xmlActiveTab = ref('diagram');
const editableXMLCode = ref('');
const originalXMLCode = ref('');
const xmlCodeLoading = ref(false);

const showHelp = ref(false);
const showSettings = ref(false);

// 模型相关数据
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

// 表单验证
const isFormValid = ref(false);

const validateForm = () => {
    isFormValid.value = config.url.trim() !== '' && config.apiKey.trim() !== '';
};

// 不加载配置（页面数据仅临时使用）
const loadConfig = () => {
    console.log('配置未加载（仅使用页面临时数据）');
};

const saveConfig = () => {
    try {
        StorageService.saveConfiguration(config);
        ElMessage.info('配置仅在当前页面有效');
    } catch (error) {
        console.error('保存配置失败:', error);
        ElMessage.info('配置仅在当前页面有效');
    }
};

// 连接状态处理方法
const handleConnectionStatusChange = (
    status: 'disconnected' | 'testing' | 'connected' | 'error'
) => {
    connectionStatus.value = status;
    testingConnection.value = status === 'testing';
};

const handleConnectionDetails = (details: any) => {
    connectionDetails.value = details;
};

const handleConnectionError = (message: string) => {
    connectionError.value = message;
};

// 测试连接
const testConnection = async () => {
    if (!isFormValid.value) {
        ElMessage.warning('请填写完整的配置信息');
        return;
    }

    try {
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
    } catch (error) {
        connectionStatus.value = 'error';
        connectionError.value =
            error instanceof Error ? error.message : '连接测试失败';
        ElMessage.error('连接测试失败，请检查配置');
    } finally {
        testingConnection.value = false;
    }
};

// 获取模型列表
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
            console.log(
                '可用模型:',
                models.map((m) => m.id)
            );
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

// 刷新模型列表
const refreshModels = async () => {
    await getModels();
};

// 处理模型选择变化
const handleModelChange = (modelId: string) => {
    config.model = modelId;
    saveConfig();

    if (modelId) {
        const model = availableModels.value.find((m) => m.id === modelId);
        ElMessage.success(`已选择模型: ${model?.display_name || modelId}`);
    }
};

// 动态模型分类和排序
const getModelCategory = (model: any): string => {
    if (model.owned_by) {
        return model.owned_by;
    }

    const modelId = model.id || '';

    // 智谱AI模型
    if (modelId.includes('glm')) return '智谱AI';

    // OpenAI模型
    if (modelId.includes('gpt')) return 'OpenAI';

    // Claude模型
    if (modelId.includes('claude')) return 'Anthropic';

    // 其他常见模型
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

    // 智谱AI模型优先级
    if (modelId.includes('glm-4.6')) return 1;
    if (modelId.includes('glm-4.5-air')) return 2;
    if (modelId.includes('glm-4.5')) return 3;
    if (modelId.includes('glm-4')) return 4;
    if (modelId.includes('glm-3')) return 5;

    // OpenAI模型优先级
    if (modelId.includes('gpt-4')) return 10;
    if (modelId.includes('gpt-3.5')) return 11;

    // Claude模型优先级
    if (modelId.includes('claude-3')) return 20;

    // 其他模型按字母顺序
    return 99;
};

// 获取模型标签类型
const getModelTagType = (modelId: string): "primary" | "success" | "warning" | "info" | "danger" => {
    if (modelId.includes('gpt-4')) return 'danger';
    if (modelId.includes('gpt-3.5') || modelId.includes('claude'))
        return 'warning';
    if (modelId.includes('llama') || modelId.includes('qwen')) return 'success';
    return 'info';
};

// 生成Mermaid架构图
const generateMermaidDiagram = async () => {
    if (!mermaidInput.description.trim()) {
        ElMessage.warning('请输入架构描述');
        return;
    }

    if (!isFormValid.value) {
        ElMessage.warning('请先配置API连接信息');
        return;
    }

    if (!selectedModel.value) {
        ElMessage.warning('请先选择一个模型');
        return;
    }

    generatingMermaid.value = true;

    try {
        const prompt = `请根据以下描述生成一个系统架构图的Mermaid代码。要求：
1. 使用Mermaid语法生成graph TD图
2. 包含主要组件和它们之间的关系
3. 使用合适的颜色和样式
4. 代码要简洁明了
5. 只返回Mermaid代码，不要其他解释

架构描述：${mermaidInput.description}

请生成对应的Mermaid架构图代码：`;

        const response = await fetch(`${config.url}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: selectedModel.value,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
            signal: AbortSignal.timeout(60000), // 60秒超时
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
                    'Mermaid模型思考过程:',
                    result.choices[0].message.reasoning_content
                );
            }

            let finalCode = content.trim();

            // 清理Mermaid代码块标记
            if (finalCode.includes('```mermaid')) {
                finalCode = finalCode
                    .replace(/```mermaid\s*/g, '')
                    .replace(/```\s*$/g, '')
                    .trim();
            } else if (finalCode.includes('```')) {
                finalCode = finalCode
                    .replace(/```\s*/g, '')
                    .replace(/```\s*$/g, '')
                    .trim();
            }

            mermaidCode.value = finalCode;

            // 同步代码到编辑器
            editableMermaidCode.value = finalCode;
            originalMermaidCode.value = finalCode;

            mermaidActiveTab.value = 'diagram';

            await renderMermaidDiagram();
            ElMessage.success(
                `Mermaid架构图生成成功 (模型: ${result.model || 'unknown'}, 耗时: ${result.usage?.total_tokens || 0} tokens)`
            );
        } else {
            throw new Error('LLM API返回格式错误');
        }
    } catch (error) {
        console.error('生成Mermaid架构图失败:', error);

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
        generatingMermaid.value = false;
    }
};

// 生成XML架构图
const generateXMLDiagram = async () => {
    if (!xmlInput.description.trim()) {
        ElMessage.warning('请输入架构描述');
        return;
    }

    if (!isFormValid.value) {
        ElMessage.warning('请先配置API连接信息');
        return;
    }

    if (!selectedModel.value) {
        ElMessage.warning('请先选择一个模型');
        return;
    }

    generatingXML.value = true;

    try {
        const prompt = `请根据以下描述生成一个系统架构图的XML代码。要求：
1. 使用XML格式定义架构图
2. 包含components（组件）和connections（连接）部分
3. 每个组件需要定义id、label、x、y坐标、宽度、高度和类型
4. 连接关系需要定义from、to节点和可选的label
5. 使用合适的布局，确保组件位置合理
6. 只返回XML代码，不要其他解释

架构描述：${xmlInput.description}

请生成对应的XML架构图代码：`;

        const response = await fetch(`${config.url}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: selectedModel.value,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
            signal: AbortSignal.timeout(60000), // 60秒超时
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

            xmlCode.value = finalCode;

            // 同步代码到编辑器
            editableXMLCode.value = finalCode;
            originalXMLCode.value = finalCode;

            xmlActiveTab.value = 'diagram';

            await renderXMLDiagramToHTML();
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
        generatingXML.value = false;
    }
};

// 渲染Mermaid图表的函数
const renderMermaidDiagram = async () => {
    if (!mermaidCode.value) {
        console.warn('没有Mermaid代码需要渲染');
        return;
    }

    await nextTick();

    if (!mermaidContainer.value) {
        console.error('Mermaid图表容器不存在');
        return;
    }

    try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        mermaidContainer.value.innerHTML = '';

        const graphId = `mermaid-graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log('开始渲染Mermaid图表:', graphId);

        const { svg } = await mermaid.render(graphId, mermaidCode.value);

        mermaidContainer.value.innerHTML = svg;

        console.log('Mermaid图表渲染成功');
    } catch (error) {
        console.error('Mermaid图表渲染失败:', error);

        let errorMessage = 'Mermaid图表渲染失败';
        if (error instanceof Error) {
            if (error.message.includes('Syntax error')) {
                errorMessage = 'Mermaid语法错误，请检查代码格式';
            } else if (error.message.includes('No diagram type detected')) {
                errorMessage = '未检测到图表类型，请确保代码以graph、flowchart等开头';
            } else {
                errorMessage = `Mermaid图表渲染失败: ${error.message}`;
            }
        }

        ElMessage.error(errorMessage);
    }
};

// 渲染XML图表的函数
const renderXMLDiagramToHTML = async () => {
    if (!xmlCode.value) {
        console.warn('没有XML代码需要渲染');
        return;
    }

    await nextTick();

    if (!xmlContainer.value) {
        console.error('XML图表容器不存在');
        return;
    }

    try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log('开始渲染XML图表');
        console.log('XML代码:', xmlCode.value);

        const diagram = XMLDiagramService.parseXML(xmlCode.value);

        const html = XMLDiagramService.renderToHTML(diagram);

        xmlContainer.value.innerHTML = html;

        console.log('XML图表渲染成功');
    } catch (error) {
        console.error('XML图表渲染失败:', error);

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

// 清空Mermaid图表
const clearMermaidDiagram = () => {
    mermaidInput.description = '';
    mermaidCode.value = '';
    editableMermaidCode.value = '';
    originalMermaidCode.value = '';
    mermaidActiveTab.value = 'diagram';
    if (mermaidContainer.value) {
        mermaidContainer.value.innerHTML = '';
    }
};

const clearXMLDiagram = () => {
    xmlInput.description = '';
    xmlCode.value = '';
    editableXMLCode.value = '';
    originalXMLCode.value = '';
    xmlActiveTab.value = 'diagram';
    if (xmlContainer.value) {
        xmlContainer.value.innerHTML = '';
    }
};

// Mermaid全屏切换
const toggleMermaidFullscreen = async () => {
    isMermaidFullscreen.value = !isMermaidFullscreen.value;

    if (isMermaidFullscreen.value) {
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));
        await renderMermaidDiagram();
    }
};

// XML全屏切换
const toggleXMLFullscreen = async () => {
    isXMLFullscreen.value = !isXMLFullscreen.value;

    if (isXMLFullscreen.value) {
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));
        await renderXMLDiagramToHTML();
    }
};

// 复制Mermaid代码
const copyMermaidCode = async () => {
    try {
        await navigator.clipboard.writeText(mermaidCode.value);
        ElMessage.success('Mermaid代码已复制到剪贴板');
    } catch (error) {
        ElMessage.error('复制失败');
    }
};

// 复制XML代码
const copyXMLCode = async () => {
    try {
        await navigator.clipboard.writeText(xmlCode.value);
        ElMessage.success('XML代码已复制到剪贴板');
    } catch (error) {
        ElMessage.error('复制失败');
    }
};

// 应用Mermaid代码更改
const applyMermaidChanges = async () => {
    if (!editableMermaidCode.value.trim()) {
        ElMessage.warning('请输入有效的 Mermaid 代码');
        return;
    }

    mermaidCodeLoading.value = true;

    try {
        mermaidCode.value = editableMermaidCode.value;

        mermaidActiveTab.value = 'diagram';

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await renderMermaidDiagram();

        ElMessage.success('Mermaid代码已应用，图表已更新');
    } catch (error) {
        console.error('应用Mermaid代码更改失败:', error);
        ElMessage.error(
            `应用代码失败: ${error instanceof Error ? error.message : '未知错误'}`
        );
    } finally {
        mermaidCodeLoading.value = false;
    }
};

// 应用XML代码更改
const applyXMLChanges = async () => {
    if (!editableXMLCode.value.trim()) {
        ElMessage.warning('请输入有效的 XML 代码');
        return;
    }

    xmlCodeLoading.value = true;

    try {
        xmlCode.value = editableXMLCode.value;

        xmlActiveTab.value = 'diagram';

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));

        await renderXMLDiagramToHTML();

        ElMessage.success('XML代码已应用，图表已更新');
    } catch (error) {
        console.error('应用XML代码更改失败:', error);
        ElMessage.error(
            `应用代码失败: ${error instanceof Error ? error.message : '未知错误'}`
        );
    } finally {
        xmlCodeLoading.value = false;
    }
};

// 重置Mermaid代码
const resetMermaidCode = () => {
    editableMermaidCode.value = originalMermaidCode.value;
    ElMessage.info('Mermaid代码已重置为原始版本');
};

// 重置XML代码
const resetXMLCode = () => {
    editableXMLCode.value = originalXMLCode.value;
    ElMessage.info('XML代码已重置为原始版本');
};

// 格式化Mermaid代码
const formatMermaidCode = () => {
    try {
        let formatted = editableMermaidCode.value;

        // 移除多余的空行
        formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');

        // 确保每个节点定义在新行
        formatted = formatted.replace(/(\w+)\[/g, '\n$1[').trim();

        // 确保箭头关系在新行
        formatted = formatted.replace(/-->|-->/g, '\n    -->');

        editableMermaidCode.value = formatted;
        ElMessage.success('Mermaid代码已格式化');
    } catch (error) {
        ElMessage.warning('Mermaid代码格式化失败');
    }
};

// 格式化XML代码
const formatXMLCode = () => {
    try {
        let formatted = editableXMLCode.value;

        // 基本的XML格式化
        formatted = formatted.replace(/></g, '>\n  </');
        formatted = formatted.replace(/<([^>/]+)\/>/g, '<$1/>');

        editableXMLCode.value = formatted;
        ElMessage.success('XML代码已格式化');
    } catch (error) {
        ElMessage.warning('XML代码格式化失败');
    }
};

// ESC键退出全屏
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        if (isMermaidFullscreen.value) {
            isMermaidFullscreen.value = false;
        }
        if (isXMLFullscreen.value) {
            isXMLFullscreen.value = false;
        }
    }
};

// 组件挂载
onMounted(() => {
    loadConfig();

    document.addEventListener('keydown', handleKeydown);
});

// 组件卸载时清理事件监听
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
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
.diagram-section,
.display-section {
    width: 100%;
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
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
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
