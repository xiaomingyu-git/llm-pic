<template>
    <el-card>
        <template #header>
            <div class="card-header">
                <span>生成的架构图</span>
                <div class="header-actions">
                    <el-button-group>
                        <el-button size="small" @click="viewCode" :disabled="!diagramCode">
                            <el-icon>
                                <View />
                            </el-icon>
                            查看代码
                        </el-button>
                        <el-button size="small" @click="copyDiagramCode" :disabled="!diagramCode">
                            <el-icon>
                                <CopyDocument />
                            </el-icon>
                            复制代码
                        </el-button>
                        <el-dropdown @command="exportDiagram" trigger="click">
                            <el-button size="small" :disabled="!diagramCode">
                                <el-icon>
                                    <Download />
                                </el-icon>
                                导出
                                <el-icon class="el-icon--right">
                                    <ArrowDown />
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="svg">导出为SVG</el-dropdown-item>
                                    <el-dropdown-item command="png">导出为PNG</el-dropdown-item>
                                    <el-dropdown-item command="pdf">导出为PDF</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </el-button-group>
                </div>
            </div>
        </template>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-container">
            <el-icon class="loading-icon" size="32">
                <Loading />
            </el-icon>
            <p class="loading-text">正在生成架构图...</p>
            <el-progress :percentage="loadingProgress" :status="loadingStatus"
                :style="{ width: '300px', marginTop: '16px' }" />
        </div>

        <!-- 图表显示区域 -->
        <div v-else-if="diagramCode && !hasError" class="diagram-container">
            <div class="diagram-wrapper">
                <div ref="diagramContainer" class="diagram-content"></div>

                <!-- 图表信息 -->
                <div class="diagram-info">
                    <el-descriptions :column="2" size="small" border>
                        <el-descriptions-item label="图表类型">
                            <el-tag size="small">{{ diagramType }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="生成时间">
                            {{ formatTime(generatedAt) }}
                        </el-descriptions-item>
                        <el-descriptions-item label="代码行数">
                            {{ diagramCode.split('\n').length }} 行
                        </el-descriptions-item>
                        <el-descriptions-item label="字符数">
                            {{ diagramCode.length }} 字符
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="hasError" class="error-container">
            <el-result icon="error" title="图表渲染失败" :sub-title="errorMessage">
                <template #extra>
                    <el-button @click="retryRender">重试</el-button>
                    <el-button type="primary" @click="regenerateDiagram">重新生成</el-button>
                </template>
            </el-result>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
            <el-empty description="还没有生成架构图" :image-size="200">
                <template #image>
                    <el-icon size="200" color="var(--el-color-info-light-5)">
                        <Picture />
                    </el-icon>
                </template>
            </el-empty>
        </div>

        <!-- 代码查看对话框 -->
        <el-dialog v-model="showCodeDialog" title="图表代码" width="80%" :fullscreen="isMobile">
            <DiagramCode :code="diagramCode" :language="diagramType" @copy="copyDiagramCode"
                @close="showCodeDialog = false" />
        </el-dialog>
    </el-card>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import {
    View,
    CopyDocument,
    Download,
    ArrowDown,
    Picture,
    Loading,
} from '@element-plus/icons-vue';
import mermaid from 'mermaid';
import DiagramCode from './DiagramCode.vue';
import { copyToClipboard } from '../../../services/copyService';

// 类型定义
interface Props {
    diagramCode?: string;
    isLoading?: boolean;
    hasError?: boolean;
    errorMessage?: string;
    loadingProgress?: number;
    generatedAt?: Date;
    diagramType?: 'mermaid' | 'plantuml';
}

// Emits
interface Emits {
    (e: 'copy-success'): void;
    (e: 'copy-failure'): void;
    (e: 'retry-render'): void;
    (e: 'regenerate-diagram'): void;
}

const props = withDefaults(defineProps<Props>(), {
    diagramCode: '',
    isLoading: false,
    hasError: false,
    errorMessage: '',
    loadingProgress: 0,
    generatedAt: () => new Date(),
    diagramType: 'mermaid',
});

const emit = defineEmits<Emits>();

// 响应式数据
const diagramContainer = ref<HTMLElement>();
const showCodeDialog = ref(false);

// 计算属性
const loadingStatus = computed(() => {
    if (props.loadingProgress >= 100) return 'success';
    if (props.loadingProgress > 0) return '';
    return undefined;
});

const isMobile = computed(() => {
    return window.innerWidth <= 768;
});

// 初始化Mermaid
const initMermaid = () => {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
    });
};

// 渲染图表
const renderDiagram = async () => {
    if (!diagramContainer.value || !props.diagramCode) return;

    try {
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 200));

        const graphId = `diagram-${Date.now()}`;
        const result = await mermaid.render(graphId, props.diagramCode);

        diagramContainer.value.innerHTML = result.svg || result;

        // 添加交互功能
        addInteractivity();
    } catch (error) {
        console.error('图表渲染失败:', error);
        emit('retry-render');
    }
};

// 添加交互功能
const addInteractivity = () => {
    if (!diagramContainer.value) return;

    const svg = diagramContainer.value.querySelector('svg');
    if (!svg) return;

    // 添加缩放功能
    svg.style.cursor = 'move';
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const startPan = (e: MouseEvent) => {
        isPanning = true;
        startX = e.pageX - (svg.parentElement?.offsetLeft || 0);
        startY = e.pageY - (svg.parentElement?.offsetTop || 0);
        scrollLeft = (svg.parentElement as HTMLElement)?.scrollLeft || 0;
        scrollTop = (svg.parentElement as HTMLElement)?.scrollTop || 0;
    };

    const pan = (e: MouseEvent) => {
        if (!isPanning) return;
        e.preventDefault();
        const x = e.pageX - (svg.parentElement?.offsetLeft || 0);
        const y = e.pageY - (svg.parentElement?.offsetTop || 0);
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        const container = svg.parentElement as HTMLElement;
        if (container) {
            container.scrollLeft = scrollLeft - walkX;
            container.scrollTop = scrollTop - walkY;
        }
    };

    const stopPan = () => {
        isPanning = false;
    };

    svg.addEventListener('mousedown', startPan);
    svg.addEventListener('mousemove', pan);
    svg.addEventListener('mouseup', stopPan);
    svg.addEventListener('mouseleave', stopPan);
};

// 查看代码
const viewCode = () => {
    showCodeDialog.value = true;
};

// 复制图表代码
const copyDiagramCode = async () => {
    try {
        const success = await copyToClipboard(props.diagramCode);
        if (success) {
            emit('copy-success');
            ElMessage.success('代码已复制到剪贴板');
        } else {
            emit('copy-failure');
            ElMessage.error('复制失败');
        }
    } catch (error) {
        emit('copy-failure');
        ElMessage.error('复制失败');
    }
};

// 导出图表
const exportDiagram = async (format: 'svg' | 'png' | 'pdf') => {
    if (!diagramContainer.value) return;

    try {
        const svg = diagramContainer.value.querySelector('svg');
        if (!svg) {
            ElMessage.error('无法找到图表');
            return;
        }

        switch (format) {
            case 'svg':
                await exportAsSVG(svg);
                break;
            case 'png':
                await exportAsPNG(svg);
                break;
            case 'pdf':
                await exportAsPDF(svg);
                break;
        }
    } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error(`导出${format.toUpperCase()}失败`);
    }
};

// 导出为SVG
const exportAsSVG = (svg: SVGElement) => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    a.click();

    URL.revokeObjectURL(url);
    ElMessage.success('SVG文件已导出');
};

// 导出为PNG
const exportAsPNG = async (svg: SVGElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);

    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `diagram-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                ElMessage.success('PNG文件已导出');
            }
        }, 'image/png');
    };

    img.src =
        'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
};

// 导出为PDF
const exportAsPDF = async (_svg: SVGElement) => {
    // 这里可以使用jsPDF等库来实现PDF导出
    ElMessage.info('PDF导出功能开发中...');
};

// 重试渲染
const retryRender = () => {
    emit('retry-render');
    renderDiagram();
};

// 重新生成图表
const regenerateDiagram = () => {
    emit('regenerate-diagram');
};

// 格式化时间
const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN');
};

// 监听图表代码变化
watch(
    () => props.diagramCode,
    () => {
        if (props.diagramCode && !props.hasError) {
            renderDiagram();
        }
    },
    { immediate: true }
);

// 初始化
initMermaid();
</script>

<style scoped>
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    gap: 8px;
}

.diagram-container {
    width: 100%;
    min-height: 400px;
}

.diagram-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.diagram-content {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    background-color: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    padding: 20px;
    overflow: auto;
    max-height: 600px;
}

.diagram-content :deep(svg) {
    max-width: 100%;
    height: auto;
    transition: transform 0.2s ease;
}

.diagram-info {
    margin-top: 16px;
}

.loading-container,
.empty-container,
.error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    text-align: center;
}

.loading-text {
    margin-top: 16px;
    font-size: 16px;
    color: var(--el-text-color-regular);
}

@media (max-width: 768px) {
    .card-header {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }

    .header-actions {
        justify-content: center;
    }

    .el-button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .diagram-info :deep(.el-descriptions) {
        --el-descriptions-table-border: 1px solid var(--el-border-color-light);
    }

    .el-descriptions :deep(.el-descriptions__cell) {
        padding: 8px 12px;
    }
}
</style>
