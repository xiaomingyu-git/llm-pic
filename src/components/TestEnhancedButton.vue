<template>
  <div class="test-enhanced-button">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <h3>Enhanced Vue Dev Guidelines Test</h3>
          <el-tag type="success">Context7 MCP Integrated</el-tag>
        </div>
      </template>

      <div class="button-demo-section">
        <h4>Latest Element Plus Button Features (v2.3.4+)</h4>

        <!-- Using latest attributes from Context7 documentation -->
        <div class="button-group">
          <el-button type="primary" :icon="Star" @click="handleClick">
            Primary Button
          </el-button>

          <!-- New text button style (v2.2.0) -->
          <el-button type="text" :icon="Edit" @click="handleClick">
            Text Button
          </el-button>

          <!-- New link button style (v2.2.1) -->
          <el-button type="primary" link :icon="Link" @click="handleClick">
            Link Button
          </el-button>
        </div>

        <!-- Custom color with dark mode support (latest feature) -->
        <div class="button-group">
          <el-button color="#626aef" :dark="isDarkMode" @click="handleClick">
            Custom Color
          </el-button>

          <el-button
            color="#626aef"
            :dark="isDarkMode"
            plain
            @click="handleClick"
          >
            Plain Custom
          </el-button>
        </div>

        <!-- Using new tag attribute (v2.3.4) -->
        <div class="button-group">
          <el-button tag="div" role="button" tabindex="0">
            Div Button
          </el-button>

          <el-button
            type="primary"
            tag="a"
            href="https://element-plus.org"
            target="_blank"
          >
            Link to Docs
          </el-button>
        </div>

        <!-- Loading states -->
        <div class="button-group">
          <el-button
            type="primary"
            :loading="isLoading"
            @click="handleAsyncClick"
          >
            Async Operation
          </el-button>

          <el-button
            type="success"
            :loading="isLoading"
            loading-icon="Loading"
            @click="handleAsyncClick"
          >
            Custom Loading
          </el-button>
        </div>
      </div>

      <div class="info-section">
        <el-alert
          title="Context7 MCP Integration Active"
          type="info"
          :closable="false"
        >
          <template #default>
            <p>
              This component was created using the enhanced vue-dev-guidelines
              skill with Context7 MCP integration.
            </p>
            <p>
              Latest Element Plus documentation was automatically fetched to
              ensure current best practices.
            </p>
            <el-button type="text" @click="showDocs = !showDocs">
              {{ showDocs ? 'Hide' : 'Show' }} Documentation Features
            </el-button>
          </template>
        </el-alert>

        <el-collapse v-model="activeNames">
          <el-collapse-item
            title="Latest Element Plus Features Used"
            name="features"
          >
            <ul>
              <li><code>text</code> attribute (v2.2.0) - Text style buttons</li>
              <li><code>link</code> attribute (v2.2.1) - Link style buttons</li>
              <li>
                <code>bg</code> attribute (v2.2.0) - Text button background
              </li>
              <li>
                <code>tag</code> attribute (v2.3.4) - Custom HTML element tags
              </li>
              <li>
                <code>color</code> attribute with <code>dark</code> prop -
                Custom colors with dark mode
              </li>
              <li>
                <code>loading-icon</code> attribute - Custom loading icons
              </li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  ElButton,
  ElCard,
  ElTag,
  ElAlert,
  ElCollapse,
  ElCollapseItem,
} from 'element-plus';
import { Star, Edit, Link } from '@element-plus/icons-vue';

// Props interface
interface Props {
  theme?: 'light' | 'dark';
}

// Emits interface
interface Emits {
  (e: 'button-click', type: string): void;
  (e: 'async-complete', success: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
});

const emit = defineEmits<Emits>();

// Reactive data
const isLoading = ref(false);
const showDocs = ref(false);
const activeNames = ref<string[]>(['features']);
const clickCount = ref(0);
const buttonHistory = ref<string[]>([]);

// Computed
const isDarkMode = computed((): boolean => props.theme === 'dark');
const _hasClickHistory = computed(
  (): boolean => buttonHistory.value.length > 0
);
const _lastClickType = computed((): string =>
  buttonHistory.value.length > 0
    ? buttonHistory.value[buttonHistory.value.length - 1]
    : 'none'
);

// Methods
const handleClick = (event: MouseEvent, type: string = 'default'): void => {
  clickCount.value++;
  buttonHistory.value.push(type);

  // Keep only last 10 clicks
  if (buttonHistory.value.length > 10) {
    buttonHistory.value = buttonHistory.value.slice(-10);
  }

  // Add history to activeNames if not already there
  if (!activeNames.value.includes('history')) {
    activeNames.value.push('history');
  }

  emit('button-click', type);
  console.log(`Button clicked: ${type} (Total: ${clickCount.value})`);
};

const handleAsyncClick = async (): Promise<void> => {
  isLoading.value = true;
  try {
    // Simulate async operation
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    emit('async-complete', true);
    console.log('Async operation completed successfully');
  } catch (error) {
    emit('async-complete', false);
    console.error(
      'Async operation failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  } finally {
    isLoading.value = false;
  }
};

// Watchers
watch(clickCount, (newCount, _oldCount) => {
  if (newCount > 0 && newCount % 5 === 0) {
    console.log(`Milestone: ${newCount} buttons clicked!`);
  }
});

// Lifecycle
onMounted(() => {
  console.log('TestEnhancedButton component mounted');
});
</script>

<style scoped>
.test-enhanced-button {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.button-demo-section {
  margin: 20px 0;
}

.button-demo-section h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.button-group:last-child {
  margin-bottom: 0;
}

.info-section {
  margin-top: 20px;
}

.info-section ul {
  margin: 0;
  padding-left: 20px;
}

.info-section li {
  margin: 8px 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.info-section code {
  background-color: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
