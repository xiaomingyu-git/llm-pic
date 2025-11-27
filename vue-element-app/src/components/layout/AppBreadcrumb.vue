<template>
  <div class="app-breadcrumb">
    <el-breadcrumb separator="/" class="breadcrumb-nav">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="item.key">
        <router-link v-if="index < breadcrumbItems.length - 1" :to="item.path ?? '/'" custom v-slot="{ navigate }">
          <span @click="navigate" class="breadcrumb-link">
            <el-icon v-if="item.icon && showIcons" class="breadcrumb-icon">
              <component :is="getMenuItemIcon(item.icon)" />
            </el-icon>
            <span class="breadcrumb-title">{{ item.title }}</span>
          </span>
        </router-link>
        <span v-else class="breadcrumb-current">
          <el-icon v-if="item.icon && showIcons" class="breadcrumb-icon">
            <component :is="getMenuItemIcon(item.icon)" />
          </el-icon>
          <span class="breadcrumb-title">{{ item.title }}</span>
        </span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElBreadcrumb, ElBreadcrumbItem, ElIcon } from 'element-plus'
import { getBreadcrumbItems, getMenuItemIcon } from '@/config/menu'

// 定义面包屑项接口
interface BreadcrumbItem {
  key: string
  title: string
  path?: string | undefined
  icon?: string
}

// Router
const route = useRoute()

// Reactive Data
const breadcrumbItems = ref<BreadcrumbItem[]>([])
const showIcons = ref(false)

// Computed
const currentPath = computed(() => route.path)

// Methods
const updateBreadcrumb = () => {
  const path = currentPath.value

  // 默认首页
  const items: BreadcrumbItem[] = [
    {
      key: 'home',
      title: '首页',
      path: '/',
      icon: 'HomeFilled'
    }
  ]

  // 根据路径获取面包屑配置
  const pathItems = getBreadcrumbItems(path)

  if (pathItems.length > 0) {
    // 过滤掉首页（避免重复）
    const filteredItems = pathItems.filter(item => item.key !== 'home')
    items.push(...filteredItems)
  } else {
    // 如果没有找到对应的菜单项，使用当前路由信息
    if (path !== '/') {
      items.push({
        key: 'current',
        title: getPageTitle(path),
        path: undefined // 当前页面不可点击
      })
    }
  }

  breadcrumbItems.value = items
}

const getPageTitle = (path: string): string => {
  // 路径到标题的映射
  const pathTitleMap: Record<string, string> = {
    '/': '首页',
    '/about': '关于',
    '/users': '用户管理',
    '/table': '图表展示',
    '/profile': '个人信息',
    '/settings': '系统设置'
  }

  return pathTitleMap[path] || '未知页面'
}

// 根据屏幕宽度决定是否显示图标
const checkScreenWidth = () => {
  showIcons.value = window.innerWidth > 768
}

// Watchers
watch(
  () => route.path,
  () => {
    updateBreadcrumb()
  },
  { immediate: true }
)

// 监听窗口大小变化
window.addEventListener('resize', checkScreenWidth)

// Lifecycle
onMounted(() => {
  updateBreadcrumb()
  checkScreenWidth()
})
</script>

<style scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb-nav {
  flex: 1;
}

.breadcrumb-nav :deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

.breadcrumb-nav :deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-regular);
  font-size: 14px;
  transition: color 0.3s ease;
}

.breadcrumb-nav :deep(.el-breadcrumb__inner:hover) {
  color: var(--el-color-primary);
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--el-text-color-primary);
  font-weight: 500;
  cursor: default;
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner:hover) {
  color: var(--el-text-color-primary);
}

.breadcrumb-icon {
  font-size: 14px;
  margin-right: 2px;
}

.breadcrumb-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .breadcrumb-title {
    max-width: 80px;
  }

  .breadcrumb-nav :deep(.el-breadcrumb__inner) {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .breadcrumb-title {
    max-width: 60px;
  }

  .breadcrumb-nav :deep(.el-breadcrumb__inner) {
    font-size: 12px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .breadcrumb-nav :deep(.el-breadcrumb__inner) {
    color: var(--el-text-color-regular);
  }

  .breadcrumb-nav :deep(.el-breadcrumb__inner:hover) {
    color: var(--el-color-primary-light-3);
  }

  .breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: var(--el-text-color-primary);
  }
}
</style>
