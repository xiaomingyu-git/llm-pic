<template>
  <div id="app">
    <el-container>
      <!-- Navigation Header -->
      <el-header>
        <div class="header-content">
          <div class="header-left">
            <h1>LLM 架构图生成器</h1>
            <el-tag size="small" type="info">v1.0.0</el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="goToTable"> 数据表格 </el-button>
          </div>
        </div>
      </el-header>

      <!-- Main Content Area -->
      <el-main>
        <div class="content-wrapper">
          <!-- LLM Configuration Section -->
          <div class="config-section">
            <LLMConfig
              :connection-status="connectionStatus"
              :is-form-valid="isFormValid"
              @connection-status-change="handleConnectionStatusChange"
              @config-saved="handleConnectionDetails"
            />
          </div>

          <!-- Format Selection Section -->
          <div class="format-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>选择图表格式</span>
                </div>
              </template>

              <div class="format-buttons">
                <el-button
                  :type="selectedFormat === 'mermaid' ? 'primary' : 'default'"
                  @click="onFormatChange('mermaid')"
                >
                  Mermaid 图表
                </el-button>
                <el-button
                  :type="selectedFormat === 'xml' ? 'primary' : 'default'"
                  @click="onFormatChange('xml')"
                >
                  XML 架构图
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- Diagram Generation Component Section -->
          <div class="diagram-component-section">
            <!-- Mermaid Diagram Component -->
            <MermaidDiagram
              v-if="selectedFormat === 'mermaid'"
              :config="config"
              :selected-model="selectedModel"
              :is-form-valid="isFormValid"
            />

            <!-- XML Architecture Diagram Component -->
            <XMLDiagram
              v-else-if="selectedFormat === 'xml'"
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

// 导入功能组件
import { LLMConfig } from '../features/llm';
import { MermaidDiagram, XMLDiagram } from '../features/diagram';

const router = useRouter();

// Reactive data
interface LLMConfigType {
  url: string;
  apiKey: string;
  model?: string;
}

const config = reactive<LLMConfigType>({
  url: '',
  apiKey: '',
  model: '',
});

// Format selection
const selectedFormat = ref<'mermaid' | 'xml'>('xml');
const selectedModel = ref('');
const isFormValid = ref(false);
const connectionStatus = ref<
  'disconnected' | 'testing' | 'connected' | 'error'
>('disconnected');

// Navigation
const goToTable = () => {
  router.push('/table');
};

// Connection status handling methods
const handleConnectionStatusChange = (
  status: 'disconnected' | 'testing' | 'connected' | 'error'
) => {
  connectionStatus.value = status;
  console.log('Connection status changed:', status);
};

const handleConnectionDetails = (details: any) => {
  if (details && details.url) {
    config.url = details.url;
    config.apiKey = details.apiKey;
    if (details.model) {
      selectedModel.value = details.model;
      config.model = details.model;
    }
    isFormValid.value = !!(config.url.trim() && config.apiKey.trim());
  }
  console.log('Connection details:', details);
};

// Format switching handler
const onFormatChange = (format: 'mermaid' | 'xml') => {
  selectedFormat.value = format;
  console.log(`切换到 ${format} 格式`);
};
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.config-section,
.format-section,
.diagram-component-section {
  width: 100%;
}

/* Format selection styles */
.format-buttons {
  display: flex;
  gap: 16px;
}

.format-buttons .el-button {
  flex: 1;
}

/* Responsive optimization */
@media (max-width: 768px) {
  .el-main {
    padding: 0 10px 10px;
  }

  .content-wrapper {
    gap: 10px;
  }
}
</style>
