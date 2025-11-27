<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useMenuStore } from '@/stores/menu'

// Store
const menuStore = useMenuStore()

// Lifecycle
onMounted(() => {
  // 初始化菜单状态
  menuStore.initializeMenu()

  // 检查屏幕尺寸
  menuStore.checkMobile()

  // 监听窗口大小变化
  window.addEventListener('resize', menuStore.checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', menuStore.checkMobile)
})
</script>

<template>
  <MainLayout />
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  overflow: hidden;
  margin: 0;
  padding: 0;
  position: relative;
}

/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}

::-webkit-scrollbar-corner {
  background: var(--el-fill-color-lighter);
}

/* 响应式断点变量 */
:root {
  --breakpoint-xs: 480px;
  --breakpoint-sm: 768px;
  --breakpoint-md: 992px;
  --breakpoint-lg: 1200px;
  --breakpoint-xl: 1920px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  body {
    touch-action: manipulation;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  :root {
    --el-border-color: #000;
    --el-text-color-primary: #000;
    --el-bg-color: #fff;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 打印样式 */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    font-size: 12pt;
    line-height: 1.4;
  }

  .el-header,
  .el-aside,
  .el-footer {
    display: none !important;
  }

  .el-main {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
