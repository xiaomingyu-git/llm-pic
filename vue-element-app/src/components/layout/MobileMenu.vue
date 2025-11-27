<template>
  <!-- 移动端抽屉菜单 -->
  <el-drawer v-model="visible" direction="ltr" size="280px" class="mobile-menu-drawer" :with-header="false"
    :show-close="false" destroy-on-close>
    <div class="mobile-menu">
      <!-- Logo 区域 -->
      <div class="mobile-logo">
        <router-link to="/" @click="closeMenu">
          <img src="/favicon.ico" alt="Logo" class="mobile-logo-icon" />
          <span class="mobile-logo-title">Vue App</span>
        </router-link>
        <el-button :icon="Close" circle size="small" @click="closeMenu" class="close-btn" />
      </div>

      <!-- 移动端菜单 -->
      <div class="mobile-menu-content">
        <template v-for="item in visibleMenuItems" :key="item.key">
          <!-- 有子菜单的项目 -->
          <el-collapse v-if="item.children && item.children.length > 0" class="mobile-menu-group">
            <el-collapse-item :name="item.key">
              <template #title>
                <div class="mobile-menu-item-title">
                  <el-icon v-if="item.icon">
                    <component :is="getMenuItemIcon(item.icon)" />
                  </el-icon>
                  <span>{{ item.title }}</span>
                  <el-badge v-if="item.badge" :value="item.badge" class="mobile-menu-badge" />
                </div>
              </template>

              <div class="mobile-submenu">
                <div v-for="child in item.children.filter(child => !child.hidden)" :key="child.key"
                  class="mobile-submenu-item" @click="navigateTo(child.path)">
                  <el-icon v-if="child.icon">
                    <component :is="getMenuItemIcon(child.icon)" />
                  </el-icon>
                  <span>{{ child.title }}</span>
                  <el-badge v-if="child.badge" :value="child.badge" class="mobile-menu-badge" />
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>

          <!-- 没有子菜单的项目 -->
          <div v-else class="mobile-menu-item" @click="navigateTo(item.path)">
            <el-icon v-if="item.icon">
              <component :is="getMenuItemIcon(item.icon)" />
            </el-icon>
            <span>{{ item.title }}</span>
            <el-badge v-if="item.badge" :value="item.badge" class="mobile-menu-badge" />
          </div>
        </template>
      </div>

      <!-- 用户信息区域 -->
      <div class="mobile-user-section">
        <div class="mobile-user-info">
          <el-avatar :size="40" :icon="UserFilled" />
          <div class="mobile-user-details">
            <div class="mobile-username">管理员</div>
            <div class="mobile-user-role">超级管理员</div>
          </div>
        </div>

        <div class="mobile-user-actions">
          <el-button size="small" @click="handleProfile">
            <el-icon>
              <User />
            </el-icon>
            个人资料
          </el-button>
          <el-button size="small" type="danger" @click="handleLogout">
            <el-icon>
              <SwitchButton />
            </el-icon>
            退出
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ElDrawer,
  ElButton,
  ElAvatar,
  ElIcon,
  ElBadge,
  ElCollapse,
  ElCollapseItem,
  ElMessage
} from 'element-plus'
import {
  Close,
  UserFilled,
  User,
  SwitchButton
} from '@element-plus/icons-vue'
import { getVisibleMenuItems, getMenuItemIcon } from '@/config/menu'

// Props & Emits
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Router
const router = useRouter()
const route = useRoute()

// Reactive Data
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})



// Computed
const visibleMenuItems = computed(() => {
  return getVisibleMenuItems()
})

// Methods
const closeMenu = () => {
  visible.value = false
}

const navigateTo = (path?: string) => {
  if (path && path !== route.path) {
    router.push(path)
  }
  closeMenu()
}

const handleProfile = () => {
  ElMessage({
    message: '打开个人资料',
    type: 'info'
  })
  // router.push('/profile')
  closeMenu()
}

const handleLogout = () => {
  ElMessage({
    message: '已退出登录',
    type: 'success'
  })
  // 这里可以添加实际的登出逻辑
  closeMenu()
}

// 监听全局的移动端菜单切换事件
window.addEventListener('toggle-mobile-menu', () => {
  visible.value = true
})

// 监听路由变化，自动关闭菜单
watch(
  () => route.path,
  () => {
    if (visible.value) {
      closeMenu()
    }
  }
)

// 监听窗口大小变化，桌面端自动关闭
const handleResize = () => {
  if (window.innerWidth >= 768 && visible.value) {
    closeMenu()
  }
}

window.addEventListener('resize', handleResize)
</script>

<style scoped>
.mobile-menu-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.mobile-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
}

/* Logo 区域 */
.mobile-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

.mobile-logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--el-text-color-primary);
  gap: 12px;
}

.mobile-logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.mobile-logo-title {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  color: var(--el-text-color-regular);
}

/* 菜单内容 */
.mobile-menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.mobile-menu-group {
  border: none;
  background-color: transparent;
}

.mobile-menu-group :deep(.el-collapse-item__header) {
  background-color: transparent;
  border: none;
  padding: 0;
  height: auto;
  line-height: normal;
}

.mobile-menu-group :deep(.el-collapse-item__content) {
  padding: 0;
  border: none;
}

.mobile-menu-item-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  border-radius: 0;
  transition: all 0.3s ease;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.mobile-menu-item:hover,
.mobile-menu-item-title:hover {
  background-color: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.mobile-menu-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-left: 3px solid var(--el-color-primary);
}

.mobile-menu-badge {
  margin-left: auto;
}

/* 子菜单 */
.mobile-submenu {
  background-color: var(--el-fill-color-extra-light);
}

.mobile-submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 10px 52px;
  color: var(--el-text-color-regular);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-submenu-item:hover {
  background-color: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

/* 用户信息区域 */
.mobile-user-section {
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-page);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.mobile-user-details {
  flex: 1;
}

.mobile-username {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.mobile-user-role {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.mobile-user-actions {
  display: flex;
  gap: 8px;
}

.mobile-user-actions .el-button {
  flex: 1;
  height: 32px;
}

/* 滚动条样式 */
.mobile-menu-content::-webkit-scrollbar {
  width: 4px;
}

.mobile-menu-content::-webkit-scrollbar-track {
  background: transparent;
}

.mobile-menu-content::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-darker);
  border-radius: 2px;
}

.mobile-menu-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-border-color-dark);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .mobile-menu-drawer {
    --el-drawer-size: 240px;
  }

  .mobile-logo {
    padding: 12px 16px;
  }

  .mobile-logo-icon {
    width: 28px;
    height: 28px;
  }

  .mobile-logo-title {
    font-size: 16px;
  }

  .mobile-menu-item,
  .mobile-menu-item-title,
  .mobile-submenu-item {
    padding: 10px 16px;
    font-size: 14px;
  }

  .mobile-submenu-item {
    padding-left: 48px;
  }

  .mobile-user-section {
    padding: 12px 16px;
  }
}
</style>
