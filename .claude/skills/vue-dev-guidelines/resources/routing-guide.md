# Vue 3 Routing with Vue Router

## Basic Router Setup

### Router Configuration
```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### Route Guards
```typescript
// src/router/guards.ts
import type { Router } from 'vue-router';

export const setupGuards = (router: Router) => {
  // Global before guard
  router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('authToken');
    
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  });

  // Global after guard
  router.afterEach((to, from) => {
    document.title = to.meta.title as string || 'My App';
  });
};
```

## Route Patterns

### Nested Routes
```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/users',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'UserList',
        component: () => import('@/features/users/components/UserList.vue')
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('@/features/users/components/UserDetail.vue'),
        props: true
      },
      {
        path: ':id/edit',
        name: 'UserEdit',
        component: () => import('@/features/users/components/UserEdit.vue'),
        props: true
      }
    ]
  }
];
```

### Dynamic Routes
```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/posts/:slug',
    name: 'PostDetail',
    component: () => import('@/features/posts/components/PostDetail.vue'),
    props: (route) => ({
      slug: route.params.slug,
      preview: route.query.preview === 'true'
    })
  }
];
```

### Route with Meta Information
```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
      roles: ['admin', 'user'],
      keepAlive: true
    }
  }
];
```

## Navigation in Components

### Using Router Composables
```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

// Navigate programmatically
const goToUsers = () => {
  router.push('/users');
};

// Navigate with parameters
const goToUser = (userId: number) => {
  router.push({
    name: 'UserDetail',
    params: { id: userId }
  });
};

// Navigate with query parameters
const searchUsers = (query: string) => {
  router.push({
    path: '/users',
    query: { search: query }
  });
};

// Current route information
const currentPath = computed(() => route.path);
const currentParams = computed(() => route.params);
const currentQuery = computed(() => route.query);
const isUsersPage = computed(() => route.name === 'UserList');
</script>

<template>
  <div>
    <el-button @click="goToUsers">用户列表</el-button>
    <el-button @click="goToUser(123)">用户详情</el-button>
    <el-button @click="searchUsers('john')">搜索用户</el-button>
    
    <p>当前路径: {{ currentPath }}</p>
    <p>当前参数: {{ currentParams }}</p>
    <p>当前查询: {{ currentQuery }}</p>
  </div>
</template>
```

### Navigation Guards in Components
```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { ref } from 'vue';

const formData = ref({});
const isDirty = ref(false);

// Route leave guard
onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    const answer = confirm('您有未保存的更改，确定要离开吗？');
    next(answer);
  } else {
    next();
  }
});

// Route update guard (for dynamic routes)
onBeforeRouteUpdate(async (to, from, next) => {
  if (to.params.id !== from.params.id) {
    await loadUserData(to.params.id as string);
  }
  next();
});

const loadUserData = async (userId: string) => {
  // Load user data logic
};
</script>
```

## Layout Components

### Layout Structure
```vue
<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="app-layout">
    <AppHeader />
    
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <keep-alive :include="cachedComponents">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

const route = useRoute();

const cachedComponents = computed(() => {
  return route.matched
    .filter(record => record.meta.keepAlive)
    .map(record => record.name);
});
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

## Route-Based Code Splitting

### Lazy Loaded Routes
```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/features/users/components/UserList.vue')
      },
      {
        path: 'posts',
        name: 'Posts',
        component: () => import('@/features/posts/components/PostList.vue')
      }
    ]
  }
];
```

### Prefetching Routes
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// Prefetch route data
const prefetchUserData = () => {
  import('@/features/users/composables/useUsers');
};

// Prefetch on hover
const handleUserLinkHover = () => {
  prefetchUserData();
};
</script>

<template>
  <router-link 
    to="/users" 
    @mouseenter="handleUserLinkHover"
  >
    用户管理
  </router-link>
</template>
```

## Route Parameters and Query

### Working with Parameters
```vue
<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUsers } from '@/features/users/composables/useUsers';

const route = useRoute();
const router = useRouter();
const { loadUsers } = useUsers();

// Route parameters
const userId = computed(() => route.params.id as string);
const postId = computed(() => route.params.postId as string);

// Query parameters
const page = computed(() => parseInt(route.query.page as string) || 1);
const search = computed(() => route.query.search as string || '');
const filters = computed(() => ({
  status: route.query.status || 'all',
  category: route.query.category || 'all'
}));

// Watch for parameter changes
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadUserData(newId);
  }
});

// Update URL without navigation
const updateFilters = (newFilters: any) => {
  router.replace({
    query: {
      ...route.query,
      ...newFilters
    }
  });
};
</script>
```

## Advanced Routing Patterns

### Dynamic Route Generation
```typescript
// src/router/dynamicRoutes.ts
export const generateUserRoutes = (): RouteRecordRaw[] => {
  return [
    {
      path: '/users',
      component: () => import('@/layouts/UserLayout.vue'),
      children: [
        {
          path: '',
          name: 'UserList',
          component: () => import('@/features/users/components/UserList.vue'),
          meta: { title: '用户列表' }
        },
        {
          path: 'create',
          name: 'UserCreate',
          component: () => import('@/features/users/components/UserForm.vue'),
          meta: { title: '创建用户' }
        },
        {
          path: ':id',
          name: 'UserDetail',
          component: () => import('@/features/users/components/UserDetail.vue'),
          props: true,
          meta: { title: '用户详情' }
        }
      ]
    }
  ];
};
```

### Navigation Duplicates Prevention
```typescript
// utils/router.ts
import { useRouter } from 'vue-router';

export const useNavigation = () => {
  const router = useRouter();

  const navigateTo = async (to: string | any) => {
    try {
      await router.push(to);
    } catch (error) {
      // Handle navigation duplicates
      if (error.name !== 'NavigationDuplicated') {
        console.error('Navigation error:', error);
      }
    }
  };

  return { navigateTo };
};
```

## Error Handling

### 404 Route Handling
```typescript
const routes: RouteRecordRaw[] = [
  // ... other routes
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
];
```

### Route Error Component
```vue
<!-- src/views/NotFound.vue -->
<template>
  <div class="not-found">
    <el-result
      icon="warning"
      title="404"
      sub-title="抱歉，您访问的页面不存在"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>
```

## Best Practices

### Do's
- ✅ Use lazy loading for routes
- ✅ Implement proper route guards for authentication
- ✅ Add meta information for routes
- ✅ Use layout components for consistent structure
- ✅ Handle navigation errors gracefully
- ✅ Implement 404 handling
- ✅ Use TypeScript for route definitions
- ✅ Add proper transition effects

### Don'ts
- ❌ Hardcode navigation paths throughout components
- ❌ Forget to handle route parameter changes
- ❌ Ignore route meta information
- ❌ Create deeply nested routes without proper structure
- ❌ Skip authentication guards
- ❌ Forget 404 handling
- ❌ Use synchronous imports for large components
- ❌ Ignore TypeScript types for routes

This routing guide provides comprehensive patterns for implementing robust navigation in Vue 3 applications.