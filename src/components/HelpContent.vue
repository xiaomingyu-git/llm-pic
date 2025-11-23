<template>
  <div class="help-content">
    <!-- 快速开始 -->
    <div class="help-section">
      <h3>
        <el-icon><Magic /></el-icon>
        快速开始
      </h3>
      <div class="step-list">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>配置LLM连接</h4>
            <p>
              在应用顶部配置您的LLM API地址和密钥，支持OpenAI API格式的服务。
            </p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>测试连接</h4>
            <p>
              点击"测试连接"按钮确保配置正确，连接成功后状态会显示为"已连接"。
            </p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>输入架构描述</h4>
            <p>在描述框中用自然语言描述您想要生成的系统架构。</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>生成图表</h4>
            <p>点击"生成架构图"按钮，等待AI生成并显示架构图。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能特性 -->
    <div class="help-section">
      <h3>
        <el-icon><Star /></el-icon>
        功能特性
      </h3>
      <el-row :gutter="20">
        <el-col :span="12" :xs="24">
          <div class="feature-card">
            <h4>🎨 多种图表格式</h4>
            <p>支持Mermaid和PlantUML两种主流图表格式，满足不同需求。</p>
          </div>
        </el-col>
        <el-col :span="12" :xs="24">
          <div class="feature-card">
            <h4>🎯 智能生成</h4>
            <p>AI自动理解您的描述，生成专业的架构图表。</p>
          </div>
        </el-col>
        <el-col :span="12" :xs="24">
          <div class="feature-card">
            <h4>💾 本地存储</h4>
            <p>配置和历史记录自动保存，下次使用无需重新配置。</p>
          </div>
        </el-col>
        <el-col :span="12" :xs="24">
          <div class="feature-card">
            <h4>🔄 实时预览</h4>
            <p>生成过程中实时显示进度，完成后立即预览效果。</p>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 使用技巧 -->
    <div class="help-section">
      <h3>
        <el-icon><Lightbulb /></el-icon>
        使用技巧
      </h3>
      <div class="tips-list">
        <div class="tip-item">
          <el-icon class="tip-icon"><CaretRight /></el-icon>
          <div class="tip-content">
            <strong>描述越详细越好：</strong
            >包含系统的组件、数据流向、技术栈等信息，能生成更准确的图表。
          </div>
        </div>
        <div class="tip-item">
          <el-icon class="tip-icon"><CaretRight /></el-icon>
          <div class="tip-content">
            <strong>使用标准术语：</strong
            >如"前端"、"后端"、"数据库"、"API网关"等，有助于AI更好地理解。
          </div>
        </div>
        <div class="tip-item">
          <el-icon class="tip-icon"><CaretRight /></el-icon>
          <div class="tip-content">
            <strong>指定图表类型：</strong
            >如需要特定类型的图表，可以在描述中明确指出。
          </div>
        </div>
        <div class="tip-item">
          <el-icon class="tip-icon"><CaretRight /></el-icon>
          <div class="tip-content">
            <strong>利用预设模板：</strong
            >使用输入建议中的模板，快速生成常见架构模式。
          </div>
        </div>
      </div>
    </div>

    <!-- 示例描述 -->
    <div class="help-section">
      <h3>
        <el-icon><Document /></el-icon>
        示例描述
      </h3>
      <div class="examples">
        <div class="example-item">
          <h4>微服务架构</h4>
          <div class="example-code">
            创建一个微服务架构，包含API网关、用户服务、订单服务、支付服务、通知服务，使用Redis作为缓存，RabbitMQ作为消息队列，PostgreSQL作为主数据库。
          </div>
          <el-button size="small" @click="useExample('微服务架构示例')">
            使用此示例
          </el-button>
        </div>
        <div class="example-item">
          <h4>Web应用</h4>
          <div class="example-code">
            设计一个三层Web应用架构，前端使用Vue.js，后端使用Node.js +
            Express，数据库使用MongoDB，Nginx作为反向代理，支持水平扩展。
          </div>
          <el-button size="small" @click="useExample('Web应用架构示例')">
            使用此示例
          </el-button>
        </div>
        <div class="example-item">
          <h4>大数据平台</h4>
          <div class="example-code">
            构建大数据处理平台，包含数据采集层、数据存储层(HDFS)、数据处理层(Spark)、数据服务层，以及数据可视化前端。
          </div>
          <el-button size="small" @click="useExample('大数据平台示例')">
            使用此示例
          </el-button>
        </div>
      </div>
    </div>

    <!-- 快捷键 -->
    <div class="help-section">
      <h3>
        <el-icon><Keyboard /></el-icon>
        快捷键
      </h3>
      <el-table :data="shortcutData" style="width: 100%" size="small">
        <el-table-column prop="key" label="快捷键" width="200" />
        <el-table-column prop="description" label="功能" />
      </el-table>
    </div>

    <!-- 常见问题 -->
    <div class="help-section">
      <h3>
        <el-icon><QuestionFilled /></el-icon>
        常见问题
      </h3>
      <el-collapse>
        <el-collapse-item title="连接测试失败怎么办？" name="1">
          <div class="faq-content">
            <p>请检查以下几点：</p>
            <ul>
              <li>API地址是否正确，确保以http://或https://开头</li>
              <li>API密钥是否有效，没有过期</li>
              <li>网络连接是否正常</li>
              <li>防火墙是否阻止了连接</li>
            </ul>
          </div>
        </el-collapse-item>
        <el-collapse-item title="生成的图表不准确怎么办？" name="2">
          <div class="faq-content">
            <p>可以尝试以下方法改进：</p>
            <ul>
              <li>提供更详细的描述，包含具体的技术组件</li>
              <li>明确指出系统的层级和数据流向</li>
              <li>使用更专业的术语描述架构</li>
              <li>分步骤描述复杂的系统</li>
            </ul>
          </div>
        </el-collapse-item>
        <el-collapse-item title="如何保存和管理图表？" name="3">
          <div class="faq-content">
            <p>当前版本支持：</p>
            <ul>
              <li>复制图表代码到剪贴板</li>
              <li>导出为SVG、PNG等图片格式</li>
              <li>配置和历史记录自动保存在本地</li>
              <li>后续版本将添加项目管理功能</li>
            </ul>
          </div>
        </el-collapse-item>
        <el-collapse-item title="支持哪些LLM服务？" name="4">
          <div class="faq-content">
            <p>理论上支持所有兼容OpenAI API格式的服务，包括：</p>
            <ul>
              <li>OpenAI GPT系列</li>
              <li>Azure OpenAI</li>
              <li>国内厂商的兼容服务（如百度文心一言、阿里通义千问等）</li>
              <li>自部署的开源模型服务</li>
            </ul>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 联系支持 -->
    <div class="help-section">
      <h3>
        <el-icon><Service /></el-icon>
        联系支持
      </h3>
      <div class="support-info">
        <p>如果您遇到问题或有改进建议，可以通过以下方式联系我们：</p>
        <div class="contact-methods">
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>邮箱：support@example.com</span>
          </div>
          <div class="contact-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>在线客服：工作日 9:00-18:00</span>
          </div>
          <div class="contact-item">
            <el-icon><Position /></el-icon>
            <span>GitHub：github.com/example/architecture-generator</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Magic,
  Star,
  Lightbulb,
  Document,
  Keyboard,
  QuestionFilled,
  Service,
  CaretRight,
  Message,
  ChatDotRound,
  Position,
} from '@element-plus/icons-vue';

// Emits
interface Emits {
  (e: 'close'): void;
  (e: 'use-example', example: string): void;
}

const emit = defineEmits<Emits>();

// 快捷键数据
const shortcutData = ref([
  { key: 'Ctrl + K', description: '快速聚焦到输入框' },
  { key: 'Ctrl + Enter', description: '生成架构图（输入框中）' },
  { key: 'Ctrl + N', description: '清空当前图表' },
  { key: 'Ctrl + S', description: '下载图表代码' },
  { key: 'Ctrl + C', description: '复制图表代码' },
  { key: 'Ctrl + Z', description: '撤销操作' },
  { key: 'Ctrl + Y', description: '重做操作' },
  { key: 'F1', description: '显示帮助' },
  { key: 'Escape', description: '关闭对话框' },
]);

// 示例文本
const exampleTexts: Record<string, string> = {
  微服务架构示例:
    '创建一个微服务架构，包含API网关、用户服务、订单服务、支付服务、通知服务，使用Redis作为缓存，RabbitMQ作为消息队列，PostgreSQL作为主数据库。',
  Web应用架构示例:
    '设计一个三层Web应用架构，前端使用Vue.js，后端使用Node.js + Express，数据库使用MongoDB，Nginx作为反向代理，支持水平扩展。',
  大数据平台示例:
    '构建大数据处理平台，包含数据采集层、数据存储层(HDFS)、数据处理层(Spark)、数据服务层，以及数据可视化前端。',
};

// 方法
const useExample = (exampleKey: string) => {
  const text = exampleTexts[exampleKey];
  if (text) {
    emit('use-example', text);
    emit('close');
    ElMessage.success('示例已应用到输入框');
  }
};
</script>

<style scoped>
.help-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 8px;
}

.help-section {
  margin-bottom: 32px;
}

.help-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

/* 快速开始步骤 */
.step-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
}

.step-content p {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

/* 功能特性卡片 */
.feature-card {
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  height: 100%;
}

.feature-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
}

.feature-card p {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

/* 使用技巧 */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.tip-icon {
  color: var(--el-color-warning);
  margin-top: 2px;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
  line-height: 1.5;
}

.tip-content strong {
  color: var(--el-text-color-primary);
}

/* 示例描述 */
.examples {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.example-item {
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.example-item h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-color-primary);
}

.example-code {
  background-color: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 常见问题 */
.faq-content {
  line-height: 1.6;
}

.faq-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.faq-content li {
  margin-bottom: 4px;
}

/* 联系支持 */
.support-info p {
  margin-bottom: 16px;
  line-height: 1.5;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

.contact-item .el-icon {
  color: var(--el-color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-content {
    padding: 0;
  }

  .help-section {
    margin-bottom: 24px;
  }

  .help-section h3 {
    font-size: 16px;
  }

  .step-item {
    gap: 12px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .feature-card {
    padding: 12px;
  }

  .example-item {
    padding: 12px;
  }

  .example-code {
    font-size: 11px;
    padding: 8px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .example-code {
    background-color: var(--el-fill-color-darker);
    color: var(--el-text-color-primary);
  }
}

/* 滚动条样式 */
.help-content::-webkit-scrollbar {
  width: 6px;
}

.help-content::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 3px;
}

.help-content::-webkit-scrollbar-thumb {
  background: var(--el-fill-color-dark);
  border-radius: 3px;
}

.help-content::-webkit-scrollbar-thumb:hover {
  background: var(--el-fill-color-darker);
}
</style>
