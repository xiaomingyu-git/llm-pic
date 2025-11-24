<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>LLM 配置</span>
        <ConnectionStatus :config="config" :status="connectionStatus" />
      </div>
    </template>

    <el-form
      :model="config"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
    >
      <el-form-item label="API URL" prop="url">
        <el-input
          v-model="config.url"
          placeholder="输入LLM API地址"
          @blur="validateForm"
        />
      </el-form-item>

      <el-form-item label="API Key" prop="apiKey">
        <el-input
          v-model="config.apiKey"
          type="password"
          placeholder="输入API密钥"
          show-password
          @blur="validateForm"
        />
      </el-form-item>

      <el-form-item label="模型">
        <el-select
          v-model="config.model"
          placeholder="选择模型"
          :loading="loadingModels"
          :disabled="!isFormValid"
          filterable
          clearable
        >
          <el-option
            v-for="model in availableModels"
            :key="model"
            :label="model"
            :value="model"
          />
        </el-select>
        <el-button
          v-if="connectionStatus === 'connected'"
          @click="handleRefreshModels"
          size="small"
          type="text"
          :loading="loadingModels"
        >
          刷新模型
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="handleTestConnection"
          :loading="testingConnection"
          :disabled="!isFormValid"
        >
          测试连接
        </el-button>
        <el-button @click="handleSaveConfig">保存配置</el-button>
        <el-button @click="handleResetConfig">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';

import ConnectionStatus from './ConnectionStatus.vue';
import { ValidationService } from '../utils/validation';
import { llmService } from '../services/llmService';

// 类型定义
interface LLMConfig {
  url: string;
  apiKey: string;
  model?: string;
}

// Props
interface Props {
  connectionStatus: 'disconnected' | 'testing' | 'connected';
  externalFormValid?: boolean;
}

// Emits
interface Emits {
  (
    e: 'connection-status-change',
    status: 'disconnected' | 'testing' | 'connected'
  ): void;
  (e: 'config-saved', config: LLMConfig): void;
}

const _props = withDefaults(defineProps<Props>(), {
  externalFormValid: false,
});
const emit = defineEmits<Emits>();

// 响应式数据
const config = reactive<LLMConfig>({
  url: '',
  apiKey: '',
});

const testingConnection = ref(false);
const loadingModels = ref(false);
const availableModels = ref<string[]>([]);
const formRef = ref<FormInstance>();

// 表单验证规则
const formRules = {
  url: [{ required: true, message: '请输入API URL', trigger: 'blur' }],
  apiKey: [
    { required: true, message: '请输入API Key', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value && !ValidationService.isValidApiKey(value)) {
          callback(new Error('API Key格式不正确'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// 计算属性
const isFormValid = computed(() => {
  return config.url.trim() !== '' && config.apiKey.trim() !== '';
});

// 方法
const validateForm = async () => {
  if (formRef.value) {
    await formRef.value.validate();
  }
};

const loadModels = async () => {
  if (!_props.externalFormValid || _props.connectionStatus !== 'connected') {
    availableModels.value = [];
    return;
  }

  loadingModels.value = true;
  try {
    const models = await llmService.getAvailableModels(config);
    availableModels.value = models;

    // 如果当前模型不在列表中，清空选择
    if (config.model && !models.includes(config.model)) {
      config.model = '';
    }
  } catch (error) {
    console.error('获取模型列表失败:', error);
    ElMessage.warning('获取模型列表失败');
    availableModels.value = [];
  } finally {
    loadingModels.value = false;
  }
};

const handleRefreshModels = async () => {
  await loadModels();
};

const loadConfig = () => {
  // 不加载任何配置，使用默认值
  console.log('使用默认配置（页面临时数据）');
};

const handleSaveConfig = async () => {
  try {
    await validateForm();
    // 不保存配置，只显示消息
    emit('config-saved', { ...config });
    ElMessage.success('配置已保存（页面临时数据）');
  } catch (error) {
    ElMessage.error('配置保存失败');
  }
};

const handleResetConfig = () => {
  config.url = '';
  config.apiKey = '';
  if (formRef.value) {
    formRef.value.clearValidate();
  }
  ElMessage.info('配置已重置');
};

const handleTestConnection = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请填写完整的配置信息');
    return;
  }

  testingConnection.value = true;
  emit('connection-status-change', 'testing');

  try {
    await validateForm();
    const success = await llmService.testConnection(config);

    if (success) {
      emit('connection-status-change', 'connected');
      ElMessage.success('连接测试成功');
      // 连接成功后自动保存配置
      handleSaveConfig();
    } else {
      emit('connection-status-change', 'disconnected');
      ElMessage.error('连接测试失败，请检查配置');
    }
  } catch (error) {
    emit('connection-status-change', 'disconnected');
    console.error('连接测试错误:', error);
    ElMessage.error('连接测试出错，请重试');
  } finally {
    testingConnection.value = false;
  }
};

// 配置变化监听器已移除 - 不需要自动保存功能

// 监听连接状态变化，连接成功时自动加载模型
watch(
  () => _props.connectionStatus,
  (newStatus) => {
    if (newStatus === 'connected') {
      loadModels();
    } else if (newStatus === 'disconnected') {
      availableModels.value = [];
    }
  }
);

// 组件初始化
loadConfig();
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  max-width: 500px;
}
</style>
