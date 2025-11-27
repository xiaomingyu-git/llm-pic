# Vue 3 TypeScript 标准指南

## 核心原则

严格遵循TypeScript最佳实践，确保类型安全，提高代码质量和开发效率。与ESLint规则配合，实现零错误编码。

## TypeScript 配置

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    // 基础配置
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    // 模块解析
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    // JSX支持
    "jsx": "preserve",

    // 严格类型检查
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // 额外检查
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,

    // 路径映射
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/views/*": ["src/views/*"],
      "@/stores/*": ["src/stores/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/assets/*": ["src/assets/*"]
    },

    // 类型声明
    "types": ["vite/client", "element-plus/global"],
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },

  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],

  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 环境类型声明

```typescript
// src/types/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
  readonly VITE_ENABLE_MOCK: boolean
  readonly VITE_MOCK_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 全局属性扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string
    $filters: {
      formatDate: (date: string | Date) => string
      formatCurrency: (amount: number) => string
    }
  }
}

// 第三方库类型扩展
declare module 'element-plus' {
  export interface ElMessage {
    success: (message: string) => void
    warning: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
  }
}
```

## 类型定义规范

### 基础类型定义

```typescript
// src/types/common.ts

// 基础数据类型
export type ID = number | string
export type Timestamp = number
export type DateString = string // YYYY-MM-DD
export type DateTimeString = string // YYYY-MM-DD HH:mm:ss

// 状态类型
export type Status = 'active' | 'inactive' | 'pending' | 'archived'
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 分页类型
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationInfo {
  current: number
  pageSize: number
  total: number
  totalPages: number
}

// 排序类型
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

// 过滤类型
export interface FilterParams {
  keyword?: string
  status?: Status
  dateRange?: [DateString, DateString]
  [key: string]: any
}

// 通用API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp?: Timestamp
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[]
  pagination: PaginationInfo
}

// 错误类型
export interface ApiError {
  code: number
  message: string
  details?: Record<string, any>
  stack?: string
}

// 选择器选项类型
export interface SelectOption<T = any> {
  label: string
  value: T
  disabled?: boolean
  children?: SelectOption<T>[]
}

// 表格列类型
export interface TableColumn<T = any> {
  prop: keyof T
  label: string
  width?: string | number
  minWidth?: string | number
  sortable?: boolean
  fixed?: boolean | 'left' | 'right'
  formatter?: (row: T, column: TableColumn<T>, cellValue: any) => string
}
```

### 业务类型定义

```typescript
// src/types/user.ts
import type { ID, Status, Timestamp } from './common'

// 用户基础信息
export interface User {
  id: ID
  username: string
  email: string
  phone?: string
  avatar?: string
  firstName: string
  lastName: string
  fullName: string
  status: Status
  roles: UserRole[]
  permissions: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt?: Timestamp
}

// 用户角色
export interface UserRole {
  id: ID
  name: string
  displayName: string
  description?: string
  permissions: Permission[]
}

// 权限
export interface Permission {
  id: ID
  name: string
  displayName: string
  resource: string
  action: string
}

// 用户相关请求类型
export interface CreateUserRequest {
  username: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  roleIds: ID[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  avatar?: string
  status?: Status
  roleIds?: ID[]
}

export interface UserSearchParams {
  keyword?: string
  status?: Status
  roleId?: ID
  dateRange?: [DateString, DateString]
}

// 用户表单类型
export interface UserFormData {
  username: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  roleIds: ID[]
}

// 用户验证规则
export interface UserFormRules {
  username: Array<{
    required: boolean
    message: string
    trigger: 'blur' | 'change'
    min?: number
    max?: number
    pattern?: RegExp
    validator?: (rule: any, value: string, callback: Function) => void
  }>
  email: Array<{
    required: boolean
    message: string
    trigger: 'blur' | 'change'
    type: 'email'
  }>
  phone: Array<{
    required: boolean
    message: string
    trigger: 'blur' | 'change'
    pattern?: RegExp
  }>
  firstName: Array<{
    required: boolean
    message: string
    trigger: 'blur' | 'change'
    min: number
    max: number
  }>
  lastName: Array<{
    required: boolean
    message: string
    trigger: 'blur' | 'change'
    min: number
    max: number
  }>
  password: Array<{
    required: boolean
    message: string
    trigger: 'blur' | 'change'
    min: number
    pattern?: RegExp
  }>
  confirmPassword: Array<{
    required: boolean
    message: string
    trigger: 'blur' | 'change'
    validator: (rule: any, value: string, callback: Function) => void
  }>
  roleIds: Array<{
    required: boolean
    message: string
    trigger: 'change'
    type: 'array'
    min: number
  }>
}
```

## Vue组件类型定义

### Props类型定义

```vue
<!-- UserCard.vue -->
<script setup lang="ts">
import type { PropType } from 'vue'
import type { User, Status } from '@/types/user'

// Props接口定义
interface Props {
  user: User
  compact?: boolean
  showActions?: boolean
  status?: Status
  editable?: boolean
  deletable?: boolean
  loading?: boolean
}

// 使用defineProps定义Props
const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showActions: true,
  editable: true,
  deletable: true,
  loading: false
})

// 复杂Prop类型的定义方式
const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true
  },
  status: {
    type: String as PropType<Status>,
    default: 'active',
    validator: (value: Status) => ['active', 'inactive', 'pending'].includes(value)
  },
  tags: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  onUpdate: {
    type: Function as PropType<(user: User) => void>,
    required: false
  }
})

// Props的类型推导
type UserCardProps = typeof props
</script>
```

### Emits类型定义

```vue
<script setup lang="ts">
import type { User } from '@/types/user'

// Emits接口定义
interface Emits {
  'update:user': [user: User]
  'delete-user': [id: User['id']]
  'status-change': [id: User['id'], status: User['status']]
  'click': [event: MouseEvent]
  'custom-event': [payload: { data: any; meta?: Record<string, any> }]
}

// 使用defineEmits定义Emits
const emit = defineEmits<Emits>()

// 使用emit
const handleUpdate = (user: User) => {
  emit('update:user', user)
}

const handleDelete = (id: User['id']) => {
  emit('delete-user', id)
}

const handleStatusChange = (id: User['id'], status: User['status']) => {
  emit('status-change', id, status)
}
</script>
```

### 组件Ref类型定义

```vue
<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'

// 组件ref类型
interface UserFormExpose {
  validate: () => Promise<boolean>
  resetFields: () => void
  getFormData: () => UserFormData
  setFormData: (data: Partial<UserFormData>) => void
}

const userFormRef = ref<ComponentPublicInstance & UserFormExpose>()

// DOM元素ref类型
const inputRef = ref<HTMLInputElement>()
const containerRef = ref<HTMLElement>()

// 使用ref
const validateForm = async () => {
  if (userFormRef.value) {
    const isValid = await userFormRef.value.validate()
    return isValid
  }
  return false
}

const focusInput = () => {
  inputRef.value?.focus()
}
</script>
```

## Composables类型定义

### 基础Composable类型

```typescript
// src/composables/useApi.ts
import { ref, type Ref } from 'vue'
import type { ApiResponse, ApiError } from '@/types/common'

// 通用API状态类型
export interface ApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<ApiError | null>
}

// 请求选项类型
export interface UseApiOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: ApiError) => void | Promise<void>
  retry?: number
  retryDelay?: number
}

// API返回类型
export interface UseApiReturn<T> extends ApiState<T> {
  execute: () => Promise<T>
  refresh: () => Promise<T>
  reset: () => void
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { immediate = false, onSuccess, onError, retry = 0, retryDelay = 1000 } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const execute = async (): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiCall()
      data.value = response.data
      await onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const apiError: ApiError = {
        code: 500,
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err
      }
      error.value = apiError
      await onError?.(apiError)
      throw apiError
    } finally {
      loading.value = false
    }
  }

  const refresh = () => execute()
  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  if (immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset
  }
}
```

### 业务Composable类型

```typescript
// src/features/users/composables/useUsers.ts
import type { Ref } from 'vue'
import type { User, UserSearchParams, CreateUserRequest, UpdateUserRequest } from '../types'
import type { PaginationParams, PaginatedResponse } from '@/types/common'
import { useApi } from '@/composables/useApi'

// 用户管理状态类型
export interface UsersState {
  users: Ref<User[]>
  loading: Ref<boolean>
  error: Ref<ApiError | null>
  pagination: Ref<PaginationInfo>
  total: Ref<number>
}

// 用户管理操作类型
export interface UsersActions {
  fetchUsers: (params?: UserSearchParams & PaginationParams) => Promise<void>
  createUser: (data: CreateUserRequest) => Promise<User>
  updateUser: (id: User['id'], data: UpdateUserRequest) => Promise<User>
  deleteUser: (id: User['id']) => Promise<void>
  refreshUsers: () => Promise<void>
  resetState: () => void
}

// 用户管理Composable返回类型
export type UseUsersReturn = UsersState & UsersActions

export function useUsers(): UseUsersReturn {
  // 状态定义
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  const pagination = ref<PaginationInfo>({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  const total = ref(0)

  // API调用
  const fetchUsersApi = (params?: UserSearchParams & PaginationParams) => {
    return userService.getUsers(params)
  }

  const { execute: fetchUsers } = useApi(
    () => fetchUsersApi(),
    {
      immediate: false,
      onSuccess: (response: PaginatedResponse<User>) => {
        users.value = response.data
        pagination.value = response.pagination
        total.value = response.pagination.total
      }
    }
  )

  // 操作方法
  const createUser = async (data: CreateUserRequest): Promise<User> => {
    const response = await userService.createUser(data)
    await refreshUsers()
    return response.data
  }

  const updateUser = async (id: User['id'], data: UpdateUserRequest): Promise<User> => {
    const response = await userService.updateUser(id, data)
    await refreshUsers()
    return response.data
  }

  const deleteUser = async (id: User['id']): Promise<void> => {
    await userService.deleteUser(id)
    await refreshUsers()
  }

  const refreshUsers = async () => {
    await fetchUsers()
  }

  const resetState = () => {
    users.value = []
    loading.value = false
    error.value = null
    pagination.value = {
      current: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
    total.value = 0
  }

  return {
    users,
    loading,
    error,
    pagination,
    total,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
    resetState
  }
}
```

## Store类型定义

### Pinia Store类型

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import type { User, UserFormData } from '@/types/user'
import type { ApiState } from '@/composables/useApi'

// 用户Store状态类型
export interface UserStoreState {
  currentUser: User | null
  isAuthenticated: boolean
  permissions: string[]
  profile: ApiState<User>
}

// 用户Store操作类型
export interface UserStoreActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<UserFormData>) => Promise<void>
  fetchProfile: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

// 用户Store类型
export type UserStore = UserStoreState & UserStoreActions

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const permissions = ref<string[]>([])
  
  const profile = useApi(() => userService.getProfile())

  // 计算属性
  const isAdmin = computed(() => 
    currentUser.value?.roles.some(role => role.name === 'admin') ?? false
  )

  // 操作
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials)
      currentUser.value = response.user
      isAuthenticated.value = true
      permissions.value = response.user.permissions
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    permissions.value = []
    authService.logout()
  }

  const updateProfile = async (data: Partial<UserFormData>) => {
    if (!currentUser.value) return
    
    const updatedUser = await userService.updateProfile(currentUser.value.id, data)
    currentUser.value = updatedUser.data
  }

  const fetchProfile = async () => {
    await profile.execute()
    if (profile.data.value) {
      currentUser.value = profile.data.value
      isAuthenticated.value = true
      permissions.value = profile.data.value.permissions
    }
  }

  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission)
  }

  const hasRole = (role: string) => {
    return currentUser.value?.roles.some(r => r.name === role) ?? false
  }

  return {
    // 状态
    currentUser,
    isAuthenticated,
    permissions,
    profile,
    
    // 计算属性
    isAdmin,
    
    // 操作
    login,
    logout,
    updateProfile,
    fetchProfile,
    hasPermission,
    hasRole
  }
})
```

## 工具类型定义

### 通用工具类型

```typescript
// src/types/utils.ts

// 深度Partial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 深度Readonly
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// 选择性必需
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// 选择性可选
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 提取数组元素类型
export type ArrayElement<T> = T extends (infer U)[] ? U : never

// 提取Promise返回类型
export type PromiseType<T> = T extends Promise<infer U> ? U : never

// 函数参数类型
export type FuncParams<T> = T extends (...args: infer P) => any ? P : never

// 函数返回类型
export type FuncReturn<T> = T extends (...args: any) => infer R ? R : never

// 构造函数参数类型
export type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never

// 联合类型转交叉类型
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

// 驼峰转下划线
export type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Lowercase<T> ? '' : '_'}${Lowercase<T>}${CamelToSnake<U>}`
  : S

// 下划线转驼峰
export type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S
```

### Element Plus类型扩展

```typescript
// src/types/element-plus.ts
import type { FormRules, FormItemProp } from 'element-plus'

// 扩展表单规则类型
export type ExtendedFormRules<T extends Record<string, any>> = {
  [K in keyof T]: Array<{
    required?: boolean
    message?: string
    trigger?: 'blur' | 'change' | ['blur', 'change']
    min?: number
    max?: number
    len?: number
    pattern?: RegExp
    validator?: (rule: any, value: T[K], callback: (error?: string) => void) => void
    asyncValidator?: (
      rule: any,
      value: T[K],
      callback: (error?: string) => void
    ) => void | Promise<void>
  }>
}

// 扩展表格列类型
export type ExtendedTableColumn<T = any> = {
  prop: keyof T
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  sortMethod?: (a: T, b: T) => number
  sortBy?: keyof T | ((row: T) => any)
  resizable?: boolean
  formatter?: (row: T, column: ExtendedTableColumn<T>, cellValue: any, index: number) => string
  className?: string | ((params: { row: T; rowIndex: number }) => string)
  labelClassName?: string | ((params: { column: ExtendedTableColumn<T>; columnIndex: number }) => string)
  renderHeader?: (params: { column: ExtendedTableColumn<T>; $index: number }) => VNode
  children?: ExtendedTableColumn<T>[]
}

// 表格操作类型
export interface TableAction<T = any> {
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  disabled?: boolean | ((row: T, index: number) => boolean)
  hidden?: boolean | ((row: T, index: number) => boolean)
  onClick: (row: T, index: number) => void
}
```

## 最佳实践

### 1. 类型定义原则
- 优先使用interface而不是type
- 为所有API响应定义明确的类型
- 避免使用any类型，使用unknown代替
- 合理使用泛型提高类型复用性

### 2. 组件类型安全
- 为Props和Emits定义明确的接口
- 使用类型推导减少重复类型声明
- 为组件ref定义暴露类型
- 避免在模板中使用隐式any类型

### 3. 工具类型使用
- 善用TypeScript内置工具类型
- 创建项目特定的工具类型
- 合理使用条件类型和映射类型
- 保持类型定义的简洁性

### 4. 错误处理
- 为异步操作定义错误类型
- 使用类型守卫函数进行类型检查
- 为API错误提供详细的类型信息
- 在catch块中正确处理类型

### 5. 性能考虑
- 避免过度复杂的类型定义
- 合理使用类型别名和接口
- 注意类型推导的性能影响
- 在必要时使用类型断言

### 6. 代码规范
- 遵循TypeScript官方编码规范
- 与ESLint规则保持一致
- 保持类型命名的一致性
- 为复杂类型添加注释说明