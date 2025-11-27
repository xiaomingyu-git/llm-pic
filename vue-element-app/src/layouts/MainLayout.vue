<template>
  <div class="main-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="layout-sidebar" :class="{ 'sidebar-collapsed': menuStore.isCollapsed }">
        <AppSidebar />
      </el-aside>

      <!-- 主内容区域 -->
      <el-container class="main-container">
        <!-- 顶部导航栏 -->
        <el-header class="layout-header">
          <AppHeader />
        </el-header>

        <!-- 面包屑导航 -->
        <div class="breadcrumb-container" v-if="showBreadcrumb">
          <AppBreadcrumb />
        </div>

        <!-- 主要内容 -->
        <el-main class="layout-main">
          <div class="main-content">
            <router-view v-slot="{ Component, route }">
              <transition name="fade-transform" mode="out-in">
                <component :is="Component" :key="route.path" />
              </transition>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 移动端菜单 -->
    <MobileMenu v-model="mobileMenuVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElContainer, ElAside, ElHeader, ElMain } from 'element-plus'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import MobileMenu from '@/components/layout/MobileMenu.vue'
import { useMenuStore } from '@/stores/menu'

// Store
const menuStore = useMenuStore()

// Reactive Data
const showBreadcrumb = ref(true)
const mobileMenuVisible = ref(false)
const windowWidth = ref(window.innerWidth)

// Computed
const sidebarWidth = computed(() => {
  if (windowWidth.value < 768) {
    return '0px' // 移动端隐藏侧边栏
  }
  return menuStore.isCollapsed ? '64px' : '220px'
})

// Methods
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// Events
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // 初始化
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.layout-container {
  height: 100%;
  margin: 0;
  padding: 0;
}

.layout-sidebar {
  background-color: var(--el-menu-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s ease;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.layout-sidebar.sidebar-collapsed {
  width: 64px;
}

.main-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.layout-header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin: 0;
}

.breadcrumb-container {
  background-color: var(--el-bg-color-page);
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin: 0;
}

.layout-main {
  background-color: var(--el-bg-color-page);
  padding: 0;
  margin: 0;
  overflow: auto;
}

.main-content {
  padding: 20px;
  margin: 0;
  min-height: calc(100vh - 60px - 33px);
  /* 减去header和breadcrumb高度 */
  width: 100%;
  overflow-x: hidden;
}

/* 路由过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .breadcrumb-container {
    padding: 6px 12px;
  }

  .main-content {
    min-height: calc(100vh - 60px - 30px);
  }
}

@media (max-width: 480px) {
  .breadcrumb-container {
    padding: 4px 8px;
  }

  .main-content {
    min-height: calc(100vh - 60px - 28px);
  }
}
</style>
