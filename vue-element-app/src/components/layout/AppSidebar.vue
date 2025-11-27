<template>
  <div class="app-sidebar">
    <!-- Logo 区域 -->
    <div class="sidebar-logo" :class="{ 'logo-collapsed': menuStore.isCollapsed }">
      <router-link to="/" class="logo-link">
        <img src="/favicon.ico" alt="Logo" class="logo-icon" v-if="!menuStore.isCollapsed" />
        <img src="/favicon.ico" alt="Logo" class="logo-icon-small" v-else />
        <h1 v-show="!menuStore.isCollapsed" class="logo-title">
          Vue App
        </h1>
      </router-link>
    </div>

    <!-- 导航菜单 -->
    <el-menu :default-active="activeKey" :collapse="menuStore.isCollapsed" :unique-opened="true"
      background-color="var(--el-menu-bg-color)" text-color="var(--el-menu-text-color)"
      active-text-color="var(--el-menu-active-color)" class="sidebar-menu" router>
      <template v-for="item in visibleMenuItems" :key="item.key">
        <!-- 有子菜单的项目 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.key">
          <template #title>
            <el-icon v-if="item.icon">
              <component :is="getMenuItemIcon(item.icon)" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>

          <el-menu-item v-for="child in item.children" :key="child.key" :index="(child.path ?? undefined) as string"
            :class="{ 'menu-item-hidden': child.hidden }">
            <el-icon v-if="child.icon">
              <component :is="getMenuItemIcon(child.icon)" />
            </el-icon>
            <template #title>
              <span>{{ child.title }}</span>
              <el-badge v-if="child.badge" :value="child.badge" class="menu-badge" />
            </template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 没有子菜单的项目 -->
        <el-menu-item v-else :index="(item.path ?? undefined) as string" :class="{ 'menu-item-hidden': item.hidden }">
          <el-icon v-if="item.icon">
            <component :is="getMenuItemIcon(item.icon)" />
          </el-icon>
          <template #title>
            <span>{{ item.title }}</span>
            <el-badge v-if="item.badge" :value="item.badge" class="menu-badge" />
          </template>
        </el-menu-item>
      </template>
    </el-menu>

    <!-- 折叠按钮 -->
    <div class="sidebar-footer">
      <el-button :icon="(menuStore.isCollapsed ? Expand : Fold)" circle size="small" @click="menuStore.toggleSidebar"
        class="collapse-btn" :title="menuStore.isCollapsed ? '展开菜单' : '收起菜单'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElSubMenu, ElIcon, ElButton, ElBadge } from 'element-plus'
import { Expand, Fold } from '@element-plus/icons-vue'
import { useMenuStore } from '@/stores/menu'
import { menuConfig, getVisibleMenuItems, getMenuItemIcon } from '@/config/menu'

// Router
const route = useRoute()

// Store
const menuStore = useMenuStore()

// Reactive Data
const activeKey = ref('')

// Computed
const visibleMenuItems = computed(() => {
  return getVisibleMenuItems(menuConfig)
})

// Methods
const updateActiveMenu = () => {
  // 根据当前路由设置活跃菜单
  const currentPath = route.path
  activeKey.value = currentPath

  // 更新store中的活跃菜单
  const menuKey = route.name as string || 'home'
  menuStore.setActiveMenu(menuKey)
}

// Watchers
watch(
  () => route.path,
  () => {
    updateActiveMenu()
  },
  { immediate: true }
)

watch(
  () => menuStore.isCollapsed,
  (collapsed) => {
    // 当菜单状态改变时，可以添加一些副作用
    console.log('Menu collapsed state:', collapsed)
  }
)

// Lifecycle
onMounted(() => {
  updateActiveMenu()
  menuStore.initializeMenu()
})
</script>

<style scoped>
.app-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-menu-bg-color);
}

/* Logo 区域 */
.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  transition: all 0.3s ease;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--el-text-color-primary);
  transition: all 0.3s ease;
}

.logo-link:hover {
  color: var(--el-color-primary);
}

.logo-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border-radius: 6px;
}

.logo-icon-small {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.logo-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s ease;
}

.logo-collapsed {
  justify-content: center;
  padding: 0;
}

.logo-collapsed .logo-title {
  display: none;
}

/* 菜单区域 */
.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

/* 菜单项样式 */
.menu-item-hidden {
  display: none !important;
}

.menu-badge {
  margin-left: 8px;
}

/* 菜单项悬停效果 */
.sidebar-menu :deep(.el-menu-item) {
  border-radius: 6px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--el-menu-hover-bg-color);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-menu-active-bg-color);
  color: var(--el-menu-active-color);
}

/* 子菜单样式 */
.sidebar-menu :deep(.el-sub-menu) {
  margin: 4px 8px;
  border-radius: 6px;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--el-menu-hover-bg-color);
}

/* 折叠状态样式 */
.sidebar-menu.el-menu--collapse :deep(.el-sub-menu__title) {
  padding-left: 20px !important;
}

/* 底部折叠按钮 */
.sidebar-footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-top: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

.collapse-btn {
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  transform: scale(1.05);
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-darker);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-border-color-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-logo {
    height: 50px;
    padding: 0 12px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    margin-right: 10px;
  }

  .logo-title {
    font-size: 16px;
  }

  .sidebar-footer {
    height: 50px;
    padding: 0 12px;
  }
}
</style>
