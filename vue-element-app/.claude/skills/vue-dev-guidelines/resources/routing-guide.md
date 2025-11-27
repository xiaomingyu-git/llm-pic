# Vue 3 路由指南

## 核心原则

使用Vue Router 4实现单页应用的路由管理，结合TypeScript确保类型安全，支持嵌套路由、路由守卫和懒加载。

## 路由配置结构

### 基础路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由记录
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomePage.vue'),
        meta: {
          title: '首页',
          requiresAuth: false,
          keepAlive: true
        }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/UsersPage.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          roles: ['admin', 'manager']
        }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/ProductsPage.vue'),
        meta: {
          title: '产品管理',
          requiresAuth: true,
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginPage.vue'),
        meta: {
          title: '登录',
          requiresAuth: false,
          guestOnly: true
        }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterPage.vue'),
        meta: {
          title: '注册',
          requiresAuth: false,
          guestOnly: true
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: {
      title: '个人资料',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
```

### 路由类型定义

```typescript
// src/types/router.ts

// 扩展路由元信息
export interface RouteMetaExtended {
  title?: string
  requiresAuth?: boolean
  guestOnly?: boolean
  roles?: string[]
  permissions?: string[]
  keepAlive?: boolean
  layout?: string
  icon?: string
  hidden?: boolean
  breadcrumb?: boolean
  affix?: boolean
  noCache?: boolean
}

// 扩展路由记录
export interface ExtendedRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  meta?: RouteMetaExtended
  children?: ExtendedRouteRecordRaw[]
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  email: string
  roles: string[]
  permissions: string[]
}

// 路由守卫上下文
export interface RouteGuardContext {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  next: NavigationGuardNext
  authStore?: {
    isAuthenticated: boolean
    user: UserInfo | null
    checkAuth: () => Promise<boolean>
  }
}
```

## 路由守卫系统

### 全局前置守卫

```typescript
// src/router/guards/index.ts
import type { RouteGuardContext } from '@/types/router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

// 权限检查
const checkPermission = (roles: string[], permissions: string[]): boolean => {
  const authStore = useAuthStore()
  
  if (!authStore.user) return false
  
  // 检查角色权限
  if (roles.length > 0) {
    const hasRole = roles.some(role => authStore.user?.roles.includes(role))
    if (!hasRole) return false
  }
  
  // 检查具体权限
  if (permissions.length > 0) {
    const hasPermission = permissions.some(permission => 
      authStore.user?.permissions.includes(permission)
    )
    if (!hasPermission) return false
  }
  
  return true
}

// 白名单路由
const whiteList = ['/auth/login', '/auth/register', '/404', '/403']

export const setupRouterGuards = (router: Router) => {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // 设置页面标题
    document.title = to.meta?.title ? `${to.meta.title} - Vue Admin` : 'Vue Admin'
    
    // 检查是否需要认证
    const requiresAuth = to.meta?.requiresAuth !== false
    const guestOnly = to.meta?.guestOnly === true
    
    // 白名单直接通过
    if (whiteList.includes(to.path)) {
      next()
      return
    }
    
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      if (requiresAuth) {
        ElMessage.warning('请先登录')
        next({ path: '/auth/login', query: { redirect: to.fullPath } })
        return
      }
    } else {
      // 已登录用户访问游客页面
      if (guestOnly) {
        next({ path: '/' })
        return
      }
    }
    
    // 检查权限
    const roles = to.meta?.roles || []
    const permissions = to.meta?.permissions || []
    
    if (roles.length > 0 || permissions.length > 0) {
      if (!checkPermission(roles, permissions)) {
        ElMessage.error('权限不足')
        next({ path: '/403' })
        return
      }
    }
    
    next()
  })
  
  // 全局后置守卫
  router.afterEach((to, from) => {
    // 路由切换后的处理
    console.log(`路由切换: ${from.path} -> ${to.path}`)
    
    // 可以在这里添加页面访问统计等逻辑
  })
  
  // 全局错误守卫
  router.onError((error) => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败，请重试')
  })
}
```

### 路由守卫使用

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupRouterGuards } from './router/guards'

const app = createApp(App)

// 安装路由
app.use(router)

// 设置路由守卫
setupRouterGuards(router)

app.mount('#app')
```

## 嵌套路由配置

### 多级嵌套路由

```typescript
// src/router/modules/admin.ts
import type { ExtendedRouteRecordRaw } from '@/types/router'

const adminRoutes: ExtendedRouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: {
      title: '管理员',
      requiresAuth: true,
      roles: ['admin'],
      icon: 'admin'
    },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardPage.vue'),
        meta: {
          title: '仪表板',
          affix: true
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/UserListPage.vue'),
        meta: {
          title: '用户管理'
        },
        children: [
          {
            path: ':id',
            name: 'AdminUserDetail',
            component: () => import('@/views/admin/users/UserDetailPage.vue'),
            meta: {
              title: '用户详情',
              hidden: true
            }
          },
          {
            path: ':id/edit',
            name: 'AdminUserEdit',
            component: () => import('@/views/admin/users/UserEditPage.vue'),
            meta: {
              title: '编辑用户',
              hidden: true
            }
          }
        ]
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SettingsPage.vue'),
        meta: {
          title: '系统设置'
        },
        children: [
          {
            path: '',
            redirect: '/admin/settings/basic'
          },
          {
            path: 'basic',
            name: 'AdminSettingsBasic',
            component: () => import('@/views/admin/settings/BasicSettingsPage.vue'),
            meta: {
              title: '基础设置'
            }
          },
          {
            path: 'security',
            name: 'AdminSettingsSecurity',
            component: () => import('@/views/admin/settings/SecuritySettingsPage.vue'),
            meta: {
              title: '安全设置'
            }
          }
        ]
      }
    ]
  }
]

export default adminRoutes
```

### 路由模块化

```typescript
// src/router/modules/index.ts
import adminRoutes from './admin'
import userRoutes from './user'
import productRoutes from './product'

export const routeModules = [
  adminRoutes,
  userRoutes,
  productRoutes
]
```

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routeModules } from './modules'

// 基础路由
const baseRoutes: RouteRecordRaw[] = [
  // ... 基础路由配置
]

// 合并所有路由
const routes = [
  ...baseRoutes,
  ...routeModules.flat()
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

## 动态路由

### 基于用户权限的动态路由

```typescript
// src/router/dynamic.ts
import type { RouteRecordRaw } from 'vue-router'
import type { UserInfo } from '@/types/router'
import { ElMessage } from 'element-plus'

// 动态路由配置
const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/UserListPage.vue'),
        meta: { title: '用户管理', roles: ['admin', 'manager'] }
      },
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('@/views/admin/roles/RoleListPage.vue'),
        meta: { title: '角色管理', roles: ['admin'] }
      },
      {
        path: 'permissions',
        name: 'AdminPermissions',
        component: () => import('@/views/admin/permissions/PermissionListPage.vue'),
        meta: { title: '权限管理', roles: ['admin'] }
      }
    ]
  }
]

// 过滤有权限的路由
const filterRoutesByPermission = (
  routes: RouteRecordRaw[], 
  user: UserInfo
): RouteRecordRaw[] => {
  return routes.filter(route => {
    const meta = route.meta as any
    
    // 检查角色权限
    if (meta?.roles && meta.roles.length > 0) {
      const hasRole = meta.roles.some((role: string) => user.roles.includes(role))
      if (!hasRole) return false
    }
    
    // 检查具体权限
    if (meta?.permissions && meta.permissions.length > 0) {
      const hasPermission = meta.permissions.some((permission: string) => 
        user.permissions.includes(permission)
      )
      if (!hasPermission) return false
    }
    
    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      route.children = filterRoutesByPermission(route.children, user)
    }
    
    return true
  })
}

// 添加动态路由
export const addDynamicRoutes = (user: UserInfo, router: any) => {
  const filteredRoutes = filterRoutesByPermission(dynamicRoutes, user)
  
  filteredRoutes.forEach(route => {
    router.addRoute(route)
  })
  
  // 添加404路由到最后
  router.addRoute({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue')
  })
}

// 重置路由
export const resetRouter = (router: any) => {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: [] // 只保留基础路由
  })
  
  router.matcher = newRouter.matcher
}
```

### 动态路由使用

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { addDynamicRoutes, resetRouter } from '@/router/dynamic'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref<UserInfo | null>(null)
  const isAuthenticated = ref(false)
  
  const login = async (credentials: LoginCredentials) => {
    try {
      // 登录逻辑...
      const userInfo = await authService.login(credentials)
      
      user.value = userInfo
      isAuthenticated.value = true
      
      // 重置并添加动态路由
      resetRouter(router)
      addDynamicRoutes(userInfo, router)
      
      // 跳转到首页或重定向页面
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/')
      
    } catch (error) {
      throw error
    }
  }
  
  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    
    // 重置路由
    resetRouter(router)
    
    // 跳转到登录页
    router.push('/auth/login')
  }
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  }
})
```

## 路由组件和Composables

### 路由Composable

```typescript
// src/composables/useRouter.ts
import { useRouter as useVueRouter, useRoute as useVueRoute } from 'vue-router'
import { computed } from 'vue'

// 扩展路由push方法
export const useRouter = () => {
  const router = useVueRouter()
  
  const pushWithQuery = (path: string, query?: Record<string, any>) => {
    return router.push({
      path,
      query: {
        ...router.currentRoute.value.query,
        ...query
      }
    })
  }
  
  const replaceWithQuery = (path: string, query?: Record<string, any>) => {
    return router.replace({
      path,
      query: {
        ...router.currentRoute.value.query,
        ...query
      }
    })
  }
  
  return {
    ...router,
    pushWithQuery,
    replaceWithQuery
  }
}

// 扩展路由信息
export const useRoute = () => {
  const route = useVueRoute()
  
  // 当前路由meta信息
  const meta = computed(() => route.meta as any)
  
  // 是否为移动端路由
  const isMobile = computed(() => {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent)
  })
  
  // 面包屑导航
  const breadcrumb = computed(() => {
    const matched = route.matched.filter(item => item.meta && item.meta.title)
    return matched.map(item => ({
      title: item.meta.title,
      path: item.path
    }))
  })
  
  return {
    ...route,
    meta,
    isMobile,
    breadcrumb
  }
}
```

### 路由权限检查Composable

```typescript
// src/composables/usePermission.ts
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from './useRouter'

export const usePermission = () => {
  const authStore = useAuthStore()
  const route = useRoute()
  
  // 检查是否有指定角色
  const hasRole = (roles: string | string[]) => {
    if (!authStore.user) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.some(role => authStore.user!.roles.includes(role))
  }
  
  // 检查是否有指定权限
  const hasPermission = (permissions: string | string[]) => {
    if (!authStore.user) return false
    
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
    return permissionArray.some(permission => 
      authStore.user!.permissions.includes(permission)
    )
  }
  
  // 检查是否可以访问当前路由
  const canAccessRoute = computed(() => {
    const meta = route.meta
    
    // 检查是否需要认证
    if (meta.requiresAuth && !authStore.isAuthenticated) {
      return false
    }
    
    // 检查角色权限
    if (meta.roles && meta.roles.length > 0) {
      if (!hasRole(meta.roles)) return false
    }
    
    // 检查具体权限
    if (meta.permissions && meta.permissions.length > 0) {
      if (!hasPermission(meta.permissions)) return false
    }
    
    return true
  })
  
  return {
    hasRole,
    hasPermission,
    canAccessRoute
  }
}
```

### 路由缓存Composable

```typescript
// src/composables/useRouteCache.ts
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export const useRouteCache = () => {
  const route = useRoute()
  const cachedRoutes = ref<string[]>([])
  
  // 添加缓存路由
  const addCachedRoute = (name: string) => {
    if (!cachedRoutes.value.includes(name)) {
      cachedRoutes.value.push(name)
    }
  }
  
  // 移除缓存路由
  const removeCachedRoute = (name: string) => {
    const index = cachedRoutes.value.indexOf(name)
    if (index > -1) {
      cachedRoutes.value.splice(index, 1)
    }
  }
  
  // 清空缓存路由
  const clearCachedRoutes = () => {
    cachedRoutes.value = []
  }
  
  // 监听路由变化
  watch(
    () => route.name,
    (newName) => {
      if (route.meta?.keepAlive && newName) {
        addCachedRoute(newName as string)
      }
    },
    { immediate: true }
  )
  
  return {
    cachedRoutes,
    addCachedRoute,
    removeCachedRoute,
    clearCachedRoutes
  }
}
```

## 路由过渡动画

### 路由过渡组件

```vue
<!-- src/components/RouterTransition.vue -->
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      mode="out-in"
      @before-enter="handleBeforeEnter"
      @after-enter="handleAfterEnter"
    >
      <keep-alive :include="cachedRoutes">
        <component
          :is="Component"
          :key="route.path"
          class="route-component"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteCache } from '@/composables/useRouteCache'

interface Props {
  transition?: 'fade' | 'slide' | 'zoom'
}

const props = withDefaults(defineProps<Props>(), {
  transition: 'fade'
})

const route = useRoute()
const { cachedRoutes } = useRouteCache()

const transitionName = ref(`route-${props.transition}`)

// 监听路由变化设置过渡效果
watch(
  () => route.path,
  (toPath, fromPath) => {
    const toDepth = toPath.split('/').length
    const fromDepth = fromPath.split('/').length
    
    // 根据路由层级设置滑动方向
    if (props.transition === 'slide') {
      transitionName.value = toDepth < fromDepth ? 'route-slide-right' : 'route-slide-left'
    } else {
      transitionName.value = `route-${props.transition}`
    }
  }
)

const handleBeforeEnter = () => {
  // 过渡开始前的处理
  document.body.style.overflow = 'hidden'
}

const handleAfterEnter = () => {
  // 过渡结束后的处理
  document.body.style.overflow = ''
}
</script>

<style lang="scss" scoped>
.route-component {
  width: 100%;
  height: 100%;
}

// 淡入淡出
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.3s ease;
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}

// 左滑进入
.route-slide-left-enter-active,
.route-slide-left-leave-active {
  transition: all 0.3s ease;
}

.route-slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.route-slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

// 右滑进入
.route-slide-right-enter-active,
.route-slide-right-leave-active {
  transition: all 0.3s ease;
}

.route-slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.route-slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// 缩放
.route-zoom-enter-active,
.route-zoom-leave-active {
  transition: all 0.3s ease;
}

.route-zoom-enter-from,
.route-zoom-leave-to {
  transform: scale(0.9);
  opacity: 0;
}
</style>
```

## 路由错误处理

### 错误页面组件

```vue
<!-- src/views/NotFoundPage.vue -->
<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <div class="error-description">
        抱歉，您访问的页面不存在或已被移除
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
        <el-button @click="goBack">
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.not-found-page {
  @include flex-center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.not-found-content {
  text-align: center;
  padding: $spacing-xl;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: $spacing-md;
  opacity: 0.8;
}

.error-message {
  font-size: $font-size-extra-large;
  margin-bottom: $spacing-sm;
}

.error-description {
  font-size: $font-size-base;
  margin-bottom: $spacing-xl;
  opacity: 0.9;
}

.error-actions {
  @include flex-center;
  gap: $spacing-md;
}
</style>
```

## 最佳实践

### 1. 路由设计
- 保持路由结构清晰和层次化
- 使用有意义的路由名称和路径
- 合理配置路由元信息

### 2. 权限控制
- 在路由守卫中统一处理权限验证
- 基于角色的权限控制(RBAC)
- 提供友好的权限不足提示

### 3. 性能优化
- 使用路由懒加载减少初始包大小
- 合理使用keep-alive缓存组件
- 避免深层嵌套路由

### 4. 用户体验
- 提供路由过渡动画
- 处理路由加载状态
- 支持浏览器前进后退

### 5. 错误处理
- 提供友好的错误页面
- 处理路由加载失败的情况
- 记录路由错误信息

### 6. SEO优化
- 配置合适的页面标题
- 添加meta标签
- 支持服务端渲染(SSR)