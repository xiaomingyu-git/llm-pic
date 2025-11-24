# Button 组件

基于 Element Plus 的 Vue 3 Button 组件，提供多种样式变体和完整的 TypeScript 支持。

## 特性

- 🎨 完整的 Element Plus 主题支持
- 📱 响应式设计
- 🔒 完整的 TypeScript 类型支持
- 💫 多种视觉变体（outline、ghost、link）
- ⚡ 高性能，支持加载状态
- ♿ 无障碍访问支持

## 安装和使用

```vue
<script setup lang="ts">
import Button from '@/components/Button.vue';
</script>

<template>
  <Button @click="handleClick">点击我</Button>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 按钮类型 | `string` | `primary`/`success`/`warning`/`danger`/`info`/`text`/`default` | default |
| size | 按钮尺寸 | `string` | `large`/`default`/`small` | default |
| disabled | 是否禁用 | `boolean` | — | false |
| loading | 是否加载中 | `boolean` | — | false |
| icon | 图标组件 | `object` | — | — |
| plain | 是否朴素按钮 | `boolean` | — | false |
| round | 是否圆角按钮 | `boolean` | — | false |
| circle | 是否圆形按钮 | `boolean` | — | false |
| autofocus | 是否默认聚焦 | `boolean` | — | false |
| native-type | 原生 type 属性 | `string` | `button`/`submit`/`reset` | button |
| variant | 视觉变体 | `string` | `default`/`outline`/`ghost`/`link` | default |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击按钮时触发 | `event: MouseEvent` |

## 示例

### 基础用法

```vue
<template>
  <div class="demo-section">
    <Button @click="handleClick">默认按钮</Button>
    <Button type="primary" @click="handleClick">主要按钮</Button>
    <Button type="success" @click="handleClick">成功按钮</Button>
    <Button type="warning" @click="handleClick">警告按钮</Button>
    <Button type="danger" @click="handleClick">危险按钮</Button>
  </div>
</template>
```

### 不同尺寸

```vue
<template>
  <div class="demo-section">
    <Button size="large">大型按钮</Button>
    <Button>默认按钮</Button>
    <Button size="small">小型按钮</Button>
  </div>
</template>
```

### 视觉变体

```vue
<template>
  <div class="demo-section">
    <div class="variant-group">
      <Button variant="outline">Outline按钮</Button>
      <Button type="primary" variant="outline">Primary Outline</Button>
    </div>
    
    <div class="variant-group">
      <Button variant="ghost">Ghost按钮</Button>
      <Button type="success" variant="ghost">Success Ghost</Button>
    </div>
    
    <div class="variant-group">
      <Button variant="link">链接样式</Button>
      <Button type="warning" variant="link">Warning链接</Button>
    </div>
  </div>
</template>

<style scoped>
.variant-group {
  margin-bottom: 12px;
}
</style>
```

### 带图标

```vue
<template>
  <div class="demo-section">
    <Button :icon="Plus" @click="handleAdd">添加</Button>
    <Button :icon="Edit" type="primary">编辑</Button>
    <Button :icon="Delete" type="danger">删除</Button>
    <Button :icon="Download" type="success" circle />
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Delete, Download } from '@element-plus/icons-vue';
</script>
```

### 加载和禁用状态

```vue
<template>
  <div class="demo-section">
    <Button loading>加载中...</Button>
    <Button disabled>禁用状态</Button>
    <Button type="primary" :loading="isLoading" @click="handleSubmit">
      {{ isLoading ? '提交中...' : '提交' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
  } finally {
    isLoading.value = false;
  }
};
</script>
```

### 圆角和圆形

```vue
<template>
  <div class="demo-section">
    <Button round>圆角按钮</Button>
    <Button type="primary" round>主要圆角</Button>
    <Button circle>圆</Button>
    <Button type="success" :icon="Check" circle />
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';
</script>
```

### 表单提交

```vue
<template>
  <div class="demo-section">
    <Button native-type="submit" type="primary">提交表单</Button>
    <Button native-type="reset">重置</Button>
    <Button native-type="button" @click="handleCancel">取消</Button>
  </div>
</template>
```

## 最佳实践

### 1. 类型安全

```vue
<script setup lang="ts">
import type { ButtonProps } from 'element-plus';

interface ButtonAction {
  id: string;
  label: string;
  type: ButtonProps['type'];
  action: () => void;
  disabled?: boolean;
}

const actions: ButtonAction[] = [
  {
    id: 'save',
    label: '保存',
    type: 'primary',
    action: handleSave,
  },
  {
    id: 'cancel',
    label: '取消',
    type: 'default',
    action: handleCancel,
  },
];
</script>

<template>
  <div class="actions">
    <Button
      v-for="action in actions"
      :key="action.id"
      :type="action.type"
      :disabled="action.disabled"
      @click="action.action"
    >
      {{ action.label }}
    </Button>
  </div>
</template>
```

### 2. 条件渲染

```vue
<template>
  <div class="conditional-buttons">
    <Button
      v-if="!isLoggedIn"
      type="primary"
      @click="handleLogin"
    >
      登录
    </Button>
    
    <template v-else>
      <Button
        v-if="hasEditPermission"
        :icon="Edit"
        @click="handleEdit"
      >
        编辑
      </Button>
      <Button
        v-if="hasDeletePermission"
        type="danger"
        :icon="Delete"
        @click="handleDelete"
      >
        删除
      </Button>
    </template>
  </div>
</template>
```

### 3. 响应式设计

```vue
<template>
  <div class="responsive-buttons">
    <!-- 桌面端显示文字按钮 -->
    <Button
      v-if="!isMobile"
      type="primary"
      :icon="Save"
    >
      保存文档
    </Button>
    
    <!-- 移动端只显示图标 -->
    <Button
      v-else
      type="primary"
      :icon="Save"
      circle
      @click="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Save } from '@element-plus/icons-vue';

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>
```

## 自定义样式

可以通过 CSS 变量自定义按钮样式：

```vue
<style scoped>
.custom-styled-button {
  --el-button-bg-color: #6366f1;
  --el-button-border-color: #6366f1;
  --el-button-hover-bg-color: #4f46e5;
  --el-button-hover-border-color: #4f46e5;
  --el-button-active-bg-color: #4338ca;
  --el-button-active-border-color: #4338ca;
  
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
}
</style>

<template>
  <Button class="custom-styled-button">自定义按钮</Button>
</template>
```

## 测试

```vue
<script setup lang="ts">
// 测试事件处理
const testButtonClick = (event: MouseEvent) => {
  console.log('Button clicked:', event);
  // 可以根据event的不同属性进行测试
};

// 测试加载状态
const testLoadingState = () => {
  console.log('Button loading state tested');
};
</script>

<template>
  <div class="test-buttons">
    <Button @click="testButtonClick">测试点击事件</Button>
    <Button :loading="true" @click="testLoadingState">测试加载状态</Button>
  </div>
</template>
```

## 与其他组件集成

### 与表单集成

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    
    <el-form-item>
      <Button native-type="submit" type="primary">登录</Button>
      <Button native-type="reset">重置</Button>
    </el-form-item>
  </el-form>
</template>
```

### 与对话框集成

```vue
<template>
  <div class="dialog-actions">
    <Button @click="handleCancel">取消</Button>
    <Button type="primary" @click="handleConfirm">确认</Button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

const handleCancel = () => {
  emit('cancel');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>
```

## 无障碍访问

组件支持完整的无障碍访问特性：

- 自动获得键盘焦点
- 支持 `Enter` 和 `Space` 键激活
- 提供适当的 ARIA 属性
- 支持屏幕阅读器

```vue
<template>
  <Button
    aria-label="删除用户"
    type="danger"
    @click="handleDelete"
  >
    删除
  </Button>
</template>
```