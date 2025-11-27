<template>
  <div class="app-header">
    <div class="header-left">
      <!-- 移动端菜单按钮 -->
      <el-button :icon="Menu" circle size="small" @click="toggleMobileMenu" class="mobile-menu-btn"
        v-if="menuStore.isMobile" />

      <!-- 面包屑折叠按钮 -->
      <el-button :icon="Fold" circle size="small" @click="menuStore.toggleSidebar" class="sidebar-toggle-btn" v-else
        :title="menuStore.isCollapsed ? '展开侧边栏' : '收起侧边栏'" />
    </div>

    <div class="header-center">
      <AppBreadcrumb />
    </div>

    <div class="header-right">
      <!-- 搜索框 -->
      <el-input v-model="searchQuery" placeholder="搜索..." :prefix-icon="Search" class="header-search" clearable
        @keyup.enter="handleSearch" v-if="!isMobile" />

      <!-- 通知 -->
      <el-badge :value="3" :max="99" class="notification-badge">
        <el-button :icon="Bell" circle class="header-btn" />
      </el-badge>

      <!-- 用户菜单 -->
      <el-dropdown @command="handleUserCommand" class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="32" :icon="UserFilled" />
          <span v-if="!isMobile" class="username">管理员</span>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon>
                <User />
              </el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon>
                <Setting />
              </el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ElButton,
  ElInput,
  ElBadge,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElAvatar,
  ElIcon,
  ElMessage
} from 'element-plus'
import {
  Menu,
  Fold,
  Search,
  Bell,
  UserFilled,
  User,
  ArrowDown,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { useMenuStore } from '@/stores/menu'
import AppBreadcrumb from './AppBreadcrumb.vue'

// Router
// const router = useRouter() // 暂时注释

// Store
const menuStore = useMenuStore()

// Reactive Data
const searchQuery = ref('')

// Computed
const isMobile = computed(() => menuStore.isMobile)

// Methods
const toggleMobileMenu = () => {
  // 触发移动端菜单显示
  const event = new CustomEvent('toggle-mobile-menu')
  window.dispatchEvent(event)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    ElMessage({
      message: `搜索: ${searchQuery.value}`,
      type: 'info'
    })
    // 这里可以添加实际的搜索逻辑
  }
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage({
        message: '打开个人资料',
        type: 'info'
      })
      // router.push('/profile')
      break
    case 'settings':
      ElMessage({
        message: '打开系统设置',
        type: 'info'
      })
      // router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
    default:
      break
  }
}

const handleLogout = () => {
  ElMessage({
    message: '已退出登录',
    type: 'success'
  })
  // 这里可以添加实际的登出逻辑
  // localStorage.removeItem('token')
  // router.push('/login')
}
</script>

<style scoped>
.app-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  color: var(--el-text-color-primary);
}

.sidebar-toggle-btn {
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
}

.sidebar-toggle-btn:hover {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-search {
  width: 240px;
}

.header-search :deep(.el-input__inner) {
  border-radius: 20px;
}

.notification-badge {
  cursor: pointer;
}

.header-btn {
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
}

.header-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: var(--el-fill-color-light);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.dropdown-icon {
  font-size: 12px;
  color: var(--el-text-color-regular);
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-search {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }

  .header-center {
    max-width: none;
    margin: 0 16px;
  }

  .header-right {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 12px;
  }

  .header-left {
    gap: 8px;
  }

  .header-center {
    margin: 0 12px;
  }

  .header-right {
    gap: 8px;
  }

  .user-info {
    gap: 6px;
    padding: 4px 6px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .header-btn:hover {
    background-color: var(--el-color-primary-light-8);
  }

  .user-info:hover {
    background-color: var(--el-fill-color-dark);
  }
}
</style>
