# Vue 3 数据获取指南

## 核心原则

使用Composition API和TypeScript实现类型安全的数据获取，结合Element Plus的加载状态管理。

## API服务设计

### 基础API服务结构

```typescript
// src/services/api.ts
import axios, { type AxiosResponse, type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

export interface ApiResponse<T = any> {
  data: T
  message: string
  success: boolean
  code: number
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current: number
    pageSize: number
    total: number
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    if (!data.success) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default api
```

### 业务API服务

```typescript
// src/features/users/services/userService.ts
import api from '@/services/api'
import type { User, UserFilters, CreateUserRequest, UpdateUserRequest } from '../types'

export const userService = {
  // 获取用户列表
  async getUsers(params?: UserFilters & PaginationParams) {
    const response = await api.get<PaginatedResponse<User>>('/users', { params })
    return response.data
  },

  // 获取用户详情
  async getUser(id: number) {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  // 创建用户
  async createUser(data: CreateUserRequest) {
    const response = await api.post<ApiResponse<User>>('/users', data)
    return response.data
  },

  // 更新用户
  async updateUser(id: number, data: UpdateUserRequest) {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  },

  // 删除用户
  async deleteUser(id: number) {
    const response = await api.delete<ApiResponse>(`/users/${id}`)
    return response.data
  }
}
```

## Composables数据管理模式

### 基础数据获取Composable

```typescript
// src/composables/useApi.ts
import { ref, type Ref } from 'vue'
import type { ApiResponse } from '@/services/api'

export interface UseApiOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError } = options
  
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiCall()
      data.value = response.data
      onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      error.value = errorObj
      onError?.(errorObj)
      throw errorObj
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return {
    data: data as Ref<T | null>,
    loading,
    error,
    execute,
    refresh: execute
  }
}
```

### 列表数据管理Composable

```typescript
// src/composables/usePagination.ts
import { ref, computed, watch, type Ref } from 'vue'
import { useApi } from './useApi'
import type { PaginatedResponse, PaginationParams } from '@/services/api'

export interface UsePaginationOptions<T, P extends PaginationParams> {
  apiCall: (params: P) => Promise<PaginatedResponse<T>>
  defaultParams?: Partial<P>
  immediate?: boolean
}

export function usePagination<T, P extends PaginationParams>(
  options: UsePaginationOptions<T, P>
) {
  const { apiCall, defaultParams = {}, immediate = true } = options

  // 分页参数
  const params = ref<P>({
    page: 1,
    pageSize: 10,
    ...defaultParams
  } as P)

  // 数据获取
  const { data, loading, error, execute } = useApi(
    () => apiCall(params.value),
    { immediate }
  )

  // 计算属性
  const list = computed(() => data.value?.data || [])
  const pagination = computed(() => data.value?.pagination)
  const total = computed(() => pagination.value?.total || 0)

  // 方法
  const refresh = () => execute()
  
  const setPage = (page: number) => {
    params.value.page = page
  }

  const setPageSize = (pageSize: number) => {
    params.value.pageSize = pageSize
    params.value.page = 1
  }

  const updateParams = (newParams: Partial<P>) => {
    Object.assign(params.value, newParams)
  }

  // 监听参数变化自动刷新
  watch(
    params,
    () => {
      if (immediate) {
        refresh()
      }
    },
    { deep: true }
  )

  return {
    list: list as Ref<T[]>,
    loading,
    error,
    pagination,
    total,
    params,
    refresh,
    setPage,
    setPageSize,
    updateParams
  }
}
```

### 业务特定Composable

```typescript
// src/features/users/composables/useUsers.ts
import { computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import { userService } from '../services/userService'
import type { User, UserFilters } from '../types'

export function useUsers(filters?: UserFilters) {
  const {
    list,
    loading,
    error,
    pagination,
    total,
    params,
    refresh,
    setPage,
    setPageSize,
    updateParams
  } = usePagination({
    apiCall: userService.getUsers,
    defaultParams: filters || {}
  })

  // 计算属性
  const activeUsers = computed(() => 
    list.value.filter(user => user.status === 'active')
  )

  const userStats = computed(() => ({
    total: list.value.length,
    active: activeUsers.value.length,
    inactive: list.value.length - activeUsers.value.length
  }))

  // 方法
  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      await userService.createUser(userData)
      refresh()
      return true
    } catch {
      return false
    }
  }

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      await userService.updateUser(id, userData)
      refresh()
      return true
    } catch {
      return false
    }
  }

  const deleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id)
      refresh()
      return true
    } catch {
      return false
    }
  }

  return {
    list,
    loading,
    error,
    pagination,
    total,
    params,
    activeUsers,
    userStats,
    refresh,
    setPage,
    setPageSize,
    updateParams,
    createUser,
    updateUser,
    deleteUser
  }
}
```

## 组件中的使用模式

### 基础使用

```vue
<!-- UserList.vue -->
<template>
  <div>
    <!-- 搜索和过滤 -->
    <el-form :model="filters" inline>
      <el-form-item label="搜索">
        <el-input
          v-model="filters.keyword"
          placeholder="请输入用户名"
          clearable
          @change="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="filters.status"
          placeholder="请选择状态"
          clearable
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="活跃" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      :data="list"
      :loading="loading"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '活跃' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination?.current"
      v-model:page-size="pagination?.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="setPage"
      @size-change="setPageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUsers } from '../composables/useUsers'
import type { UserFilters } from '../types'

// 过滤条件
const filters = reactive<UserFilters>({
  keyword: '',
  status: ''
})

// 使用用户管理composable
const {
  list,
  loading,
  pagination,
  total,
  refresh,
  setPage,
  setPageSize,
  updateParams,
  deleteUser
} = useUsers(filters)

// 事件处理
const handleSearch = () => {
  updateParams(filters)
}

const handleEdit = (user: User) => {
  // 编辑逻辑
  console.log('编辑用户:', user)
}

const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning'
    })
    
    const success = await deleteUser(user.id)
    if (success) {
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消或删除失败
  }
}
</script>
```

## 高级数据获取模式

### 缓存管理

```typescript
// src/composables/useCache.ts
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl = 300000) {
  const getCachedData = () => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    return null
  }

  const setCachedData = (data: T) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  const invalidateCache = (pattern?: string) => {
    if (pattern) {
      for (const [key] of cache.entries()) {
        if (key.includes(pattern)) {
          cache.delete(key)
        }
      }
    } else {
      cache.clear()
    }
  }

  return {
    getCachedData,
    setCachedData,
    invalidateCache
  }
}
```

### 乐观更新

```typescript
// src/composables/useOptimisticUpdate.ts
import { ref } from 'vue'

export function useOptimisticUpdate<T>(
  updateFn: (id: number, data: Partial<T>) => Promise<T>,
  rollbackFn?: () => void
) {
  const optimisticData = ref<T | null>(null)
  const isUpdating = ref(false)

  const update = async (id: number, data: Partial<T>, currentData: T) => {
    optimisticData.value = { ...currentData, ...data }
    isUpdating.value = true

    try {
      const result = await updateFn(id, data)
      optimisticData.value = null
      return result
    } catch (error) {
      // 回滚
      optimisticData.value = null
      rollbackFn?.()
      throw error
    } finally {
      isUpdating.value = false
    }
  }

  return {
    optimisticData,
    isUpdating,
    update
  }
}
```

## 错误处理策略

### 统一错误处理

```typescript
// src/utils/errorHandler.ts
import { ElMessage, ElMessageBox } from 'element-plus'

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError(error.message)
  }

  return new ApiError('未知错误')
}

export function showErrorToast(error: ApiError) {
  ElMessage.error(error.message)
}

export async function showErrorConfirm(error: ApiError) {
  await ElMessageBox.alert(error.message, '错误', {
    type: 'error'
  })
}
```

### 重试机制

```typescript
// src/composables/useRetry.ts
export function useRetry(
  maxAttempts = 3,
  delay = 1000
) {
  const attempt = ref(0)
  const isRetrying = ref(false)

  const retry = async <T>(
    fn: () => Promise<T>,
    shouldRetry?: (error: any) => boolean
  ): Promise<T> => {
    attempt.value = 0

    while (attempt.value < maxAttempts) {
      try {
        const result = await fn()
        attempt.value = 0
        return result
      } catch (error) {
        attempt.value++
        
        if (attempt.value >= maxAttempts || (shouldRetry && !shouldRetry(error))) {
          throw error
        }

        isRetrying.value = true
        await new Promise(resolve => setTimeout(resolve, delay * attempt.value))
        isRetrying.value = false
      }
    }

    throw new Error('重试次数已达上限')
  }

  return {
    attempt,
    isRetrying,
    retry
  }
}
```

## 性能优化

### 请求防抖

```typescript
// src/composables/useDebounce.ts
import { ref, watch } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay = 300) {
  const debouncedValue = ref<T>(value.value)

  watch(
    value,
    (newValue) => {
      const timer = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)

      return () => clearTimeout(timer)
    },
    { immediate: true }
  )

  return debouncedValue
}
```

### 请求取消

```typescript
// src/composables/useAbortController.ts
export function useAbortController() {
  let abortController: AbortController | null = null

  const createRequest = async <T>(requestFn: (signal: AbortSignal) => Promise<T>) => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    
    try {
      const result = await requestFn(abortController.signal)
      abortController = null
      return result
    } catch (error) {
      abortController = null
      if (error.name !== 'AbortError') {
        throw error
      }
    }
  }

  const cancel = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  return {
    createRequest,
    cancel
  }
}
```

## 最佳实践

### 1. 类型安全
- 为所有API响应定义明确的类型
- 使用TypeScript泛型确保类型推导
- 避免使用any类型

### 2. 错误处理
- 统一的错误处理策略
- 用户友好的错误提示
- 优雅的降级处理

### 3. 加载状态
- 明确的加载状态指示
- 骨架屏提升用户体验
- 防止重复请求

### 4. 缓存策略
- 合理的数据缓存
- 缓存失效机制
- 内存管理

### 5. 性能优化
- 请求防抖和节流
- 请求取消
- 分页和虚拟滚动

### 6. 代码组织
- 按功能模块组织
- 可复用的composables
- 清晰的文件结构