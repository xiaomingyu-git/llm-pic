# Vue 3 Styling Guide with Element Plus

## CSS Variables & Theming

### Element Plus Theme Variables
```vue
<template>
  <el-button class="custom-button" type="primary">
    自定义按钮
  </el-button>
</template>

<style scoped>
.custom-button {
  /* Override Element Plus variables */
  --el-button-bg-color: #409eff;
  --el-button-border-color: #409eff;
  --el-button-hover-bg-color: #66b1ff;
  --el-button-hover-border-color: #66b1ff;
  --el-button-active-bg-color: #337ecc;
  --el-button-active-border-color: #337ecc;
  
  /* Custom styles */
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}
</style>
```

### Global Theme Configuration
```typescript
// src/styles/theme.ts
import type { App } from 'vue';
import { ElMessage } from 'element-plus';

export const setupTheme = (app: App) => {
  // Global CSS variables
  const root = document.documentElement;
  root.style.setProperty('--app-primary-color', '#409eff');
  root.style.setProperty('--app-success-color', '#67c23a');
  root.style.setProperty('--app-warning-color', '#e6a23c');
  root.style.setProperty('--app-danger-color', '#f56c6c');
  
  // Element Plus theme customization
  app.config.globalProperties.$ELEMENT = {
    size: 'default',
    zIndex: 3000
  };
};
```

## Scoped Styles

### Component Scoped Styling
```vue
<template>
  <div class="user-card">
    <div class="user-avatar">
      <img :src="user.avatar" :alt="user.name" />
    </div>
    <div class="user-info">
      <h3 class="user-name">{{ user.name }}</h3>
      <p class="user-email">{{ user.email }}</p>
    </div>
    <div class="user-actions">
      <el-button size="small" type="primary">编辑</el-button>
      <el-button size="small" type="danger">删除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types';

interface Props {
  user: User;
}

const props = defineProps<Props>();
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
  transition: all 0.3s ease;
}

.user-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  border: 2px solid var(--el-border-color);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  margin-right: 16px;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-email {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.user-actions {
  display: flex;
  gap: 8px;
}
</style>
```

## Responsive Design

### CSS Grid and Flexbox
```vue
<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <!-- Navigation content -->
      </nav>
    </aside>
    
    <main class="main-content">
      <header class="content-header">
        <h1>Dashboard</h1>
      </header>
      
      <div class="content-grid">
        <div class="grid-item item-1">Card 1</div>
        <div class="grid-item item-2">Card 2</div>
        <div class="grid-item item-3">Card 3</div>
        <div class="grid-item item-4">Card 4</div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

.main-content {
  padding: 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.grid-item {
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  min-height: 200px;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }
  
  .content-grid {
    gap: 10px;
  }
}
</style>
```

## Element Plus Customization

### Custom Components
```vue
<template>
  <div class="custom-form">
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="用户名" prop="username">
        <el-input 
          v-model="form.username" 
          placeholder="请输入用户名"
          class="custom-input"
        />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="form.password" 
          type="password"
          placeholder="请输入密码"
          class="custom-input"
          show-password
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.custom-input {
  --el-input-border-radius: 8px;
  --el-input-border-color: #dcdfe6;
  --el-input-focus-border-color: #409eff;
  --el-input-hover-border-color: #c0c4cc;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: var(--el-input-border-radius);
  box-shadow: 0 0 0 1px var(--el-input-border-color) inset;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
}

.custom-input :deep(.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
}
</style>
```

### Dark Mode Support
```vue
<template>
  <div class="theme-switcher">
    <el-switch
      v-model="isDark"
      @change="toggleTheme"
      active-text="深色"
      inactive-text="浅色"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDark = ref(false);

const toggleTheme = (dark: boolean) => {
  const root = document.documentElement;
  
  if (dark) {
    root.classList.add('dark');
    root.style.setProperty('--el-bg-color', '#1a1a1a');
    root.style.setProperty('--el-bg-color-page', '#141414');
    root.style.setProperty('--el-text-color-primary', '#ffffff');
    root.style.setProperty('--el-text-color-regular', '#b0b0b0');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--el-bg-color', '#ffffff');
    root.style.setProperty('--el-bg-color-page', '#f5f7fa');
    root.style.setProperty('--el-text-color-primary', '#303133');
    root.style.setProperty('--el-text-color-regular', '#606266');
  }
  
  localStorage.setItem('theme', dark ? 'dark' : 'light');
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  isDark.value = savedTheme === 'dark';
  toggleTheme(isDark.value);
});
</script>
```

## Animation and Transitions

### Vue Transitions
```vue
<template>
  <div class="animated-list">
    <transition-group name="list" tag="div">
      <div
        v-for="item in items"
        :key="item.id"
        class="list-item"
      >
        {{ item.name }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.list-item {
  padding: 12px;
  margin: 4px 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Hover animations */
.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
```

### Loading Animations
```vue
<template>
  <div class="loading-container" v-if="loading">
    <div class="loading-spinner"></div>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--el-border-color-light);
  border-top: 4px solid var(--el-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

## Utility Classes

### CSS Utilities
```css
/* src/styles/utilities.css */

/* Spacing */
.m-0 { margin: 0; }
.m-1 { margin: 4px; }
.m-2 { margin: 8px; }
.m-3 { margin: 12px; }
.m-4 { margin: 16px; }

.p-0 { padding: 0; }
.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-3 { padding: 12px; }
.p-4 { padding: 16px; }

/* Layout */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Text */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-bold { font-weight: 600; }
.font-normal { font-weight: 400; }

/* Display */
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }

/* Border */
.border { border: 1px solid var(--el-border-color-light); }
.border-0 { border: none; }
.border-radius { border-radius: 4px; }
.border-radius-lg { border-radius: 8px; }
```

## Best Practices

### Do's
- ✅ Use scoped styles for component-specific styling
- ✅ Use CSS variables for theming
- ✅ Implement responsive design with media queries
- ✅ Use Element Plus design tokens
- ✅ Add transitions for smooth interactions
- ✅ Follow consistent spacing and typography
- ✅ Use semantic HTML elements

### Don'ts
- ❌ Use global styles without proper namespacing
- ❌ Hardcode colors and values
- ❌ Ignore accessibility concerns
- ❌ Use !important unnecessarily
- ❌ Mix inline styles with scoped styles
- ❌ Forget to test on different screen sizes

## Performance Tips

### Efficient Styling
```vue
<style scoped>
/* ✅ Good: Use efficient selectors */
.component-name {
  /* styles */
}

/* ❌ Bad: Deep selectors are expensive */
.parent .child .deep .nested {
  /* styles */
}

/* ✅ Good: Use CSS variables */
.button-primary {
  background: var(--primary-color);
}

/* ❌ Bad: Repeat the same values */
.button-primary {
  background: #409eff;
}
.button-secondary {
  background: #409eff;
}
</style>
```

This styling guide provides comprehensive patterns for creating beautiful, responsive Vue 3 applications with Element Plus.