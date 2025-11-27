# Vue 3 项目文件组织指南

## 目录结构原则

基于功能模块的分层架构，确保代码的可维护性和可扩展性。

## 推荐的项目结构

```
src/
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   ├── icons/             # 图标资源
│   └── styles/            # 全局样式
├── components/            # 通用组件
│   ├── common/           # 基础组件
│   ├── business/         # 业务组件
│   └── index.ts          # 组件导出
├── features/             # 功能模块
│   ├── module-name/      # 具体功能模块
│   │   ├── components/   # 模块组件
│   │   ├── composables/  # 模块composables
│   │   ├── services/     # 模块服务
│   │   ├── types/        # 模块类型
│   │   ├── utils/        # 模块工具
│   │   └── index.ts      # 模块导出
├── layouts/              # 布局组件
├── pages/ or views/      # 页面组件
├── router/               # 路由配置
├── stores/               # 状态管理
├── services/             # 全局服务
├── utils/                # 工具函数
├── types/                # 全局类型
├── composables/          # 全局composables
└── main.ts              # 应用入口
```

## 功能模块详细结构

### 完整的模块结构示例

```
features/
├── users/                     # 用户管理模块
│   ├── components/           # 用户相关组件
│   │   ├── UserList.vue      # 用户列表组件
│   │   ├── UserForm.vue      # 用户表单组件
│   │   ├── UserDetail.vue    # 用户详情组件
│   │   ├── UserSearch.vue    # 用户搜索组件
│   │   └── index.ts          # 组件导出
│   ├── composables/          # 用户相关composables
│   │   ├── useUsers.ts       # 用户数据管理
│   │   ├── useUserForm.ts    # 用户表单管理
│   │   └── useUserFilters.ts # 用户过滤管理
│   ├── services/             # 用户相关服务
│   │   ├── userService.ts    # 用户API服务
│   │   └── index.ts          # 服务导出
│   ├── types/                # 用户相关类型
│   │   ├── user.ts           # 用户类型定义
│   │   ├── api.ts            # API响应类型
│   │   └── index.ts          # 类型导出
│   ├── utils/                # 用户相关工具
│   │   ├── validation.ts     # 验证工具
│   │   ├── formatters.ts     # 格式化工具
│   │   └── index.ts          # 工具导出
│   └── index.ts              # 模块统一导出
└── products/                 # 产品管理模块
    └── ...                   # 类似结构
```

### 模块导出文件示例

#### types/index.ts

```typescript
// features/users/types/index.ts
export type * from './user'
export type * from './api'

// 重新导出常用类型
export type { User, UserStatus, UserRole } from './user'
export type { CreateUserRequest, UpdateUserRequest } from './user'
export type { UserListResponse, UserResponse } from './api'
```

#### components/index.ts

```typescript
// features/users/components/index.ts
export { default as UserList } from './UserList.vue'
export { default as UserForm } from './UserForm.vue'
export { default as UserDetail } from './UserDetail.vue'
export { default as UserSearch } from './UserSearch.vue'
```

#### services/index.ts

```typescript
// features/users/services/index.ts
export { userService } from './userService'
export type * from '../types'
```

#### 模块统一导出

```typescript
// features/users/index.ts
// 组件
export * from './components'

// Composables
export * from './composables'

// 服务
export * from './services'

// 类型
export * from './types'

// 工具
export * from './utils'

// 默认导出主要功能
export { useUsers } from './composables/useUsers'
```

## 组件命名规范

### 文件命名

```
components/
├── common/                   # 通用基础组件
│   ├── BaseButton.vue       # 基础按钮
│   ├── BaseInput.vue        # 基础输入框
│   ├── BaseModal.vue        # 基础模态框
│   ├── LoadingSpinner.vue   # 加载动画
│   └── ErrorMessage.vue     # 错误信息
├── business/                # 业务组件
│   ├── UserCard.vue         # 用户卡片
│   ├── ProductTable.vue     # 产品表格
│   ├── OrderForm.vue        # 订单表单
│   └── StatusBadge.vue      # 状态徽章
└── forms/                   # 表单组件
    ├── UserForm.vue         # 用户表单
    ├── ProductForm.vue      # 产品表单
    └── SearchForm.vue       # 搜索表单
```

### 组件内部结构

```vue
<!-- components/common/BaseButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <LoadingSpinner v-if="loading" :size="16" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
// 1. 导入
import { computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import type { ButtonSize, ButtonType } from './types'

// 2. Props定义
interface Props {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  block: false
})

// 3. Emits定义
interface Emits {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

// 4. 组合式API
const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.type}`,
  `base-button--${props.size}`,
  {
    'base-button--block': props.block,
    'base-button--loading': props.loading
  }
])

// 5. 方法
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  /* 组件样式 */
}
</style>
```

## 类型定义组织

### 类型文件结构

```
types/
├── api.ts                   # API相关类型
├── common.ts               # 通用类型
├── components.ts           # 组件props/emits类型
├── router.ts               # 路由相关类型
├── store.ts                # 状态管理类型
└── index.ts                # 类型统一导出
```

### 类型定义示例

```typescript
// types/api.ts

// 基础API响应类型
export interface ApiResponse<T = any> {
  data: T
  message: string
  success: boolean
  code: number
}

// 分页相关类型
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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo
}

// 错误类型
export interface ApiError {
  code: number
  message: string
  details?: any
}
```

```typescript
// types/common.ts

// 通用状态类型
export type Status = 'active' | 'inactive' | 'pending'
export type Gender = 'male' | 'female' | 'other'

// 通用时间类型
export type DateString = string // YYYY-MM-DD
export type DateTimeString = string // YYYY-MM-DD HH:mm:ss

// 通用ID类型
export type ID = number | string

// 选择器选项类型
export interface SelectOption<T = any> {
  label: string
  value: T
  disabled?: boolean
}

// 表格列类型
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
}
```

```typescript
// types/components.ts

// 按钮组件类型
export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type ButtonSize = 'small' | 'medium' | 'large'

// 表格组件类型
export interface TableConfig<T = any> {
  data: T[]
  columns: TableColumn[]
  loading?: boolean
  stripe?: boolean
  border?: boolean
  size?: 'small' | 'medium' | 'large'
}

// 表单组件类型
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | ['blur', 'change']
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}

export interface FormConfig {
  rules?: Record<string, FormRule | FormRule[]>
  labelWidth?: string
  inline?: boolean
  disabled?: boolean
}
```

## Composables组织

### 按功能分组

```
composables/
├── api/                     # API相关composables
│   ├── useApi.ts           # 基础API调用
│   ├── usePagination.ts    # 分页数据管理
│   └── useCache.ts         # 缓存管理
├── form/                    # 表单相关composables
│   ├── useForm.ts          # 基础表单管理
│   ├── useValidation.ts    # 表单验证
│   └── useField.ts         # 字段管理
├── ui/                      # UI相关composables
│   ├── useLoading.ts       # 加载状态
│   ├── useModal.ts         # 模态框管理
│   └── useTable.ts         # 表格管理
└── index.ts                 # 统一导出
```

### composable命名规范

```typescript
// composables/api/useApi.ts
export function useApi<T>() { /* API调用逻辑 */ }

// composables/form/useForm.ts
export function useForm<T extends Record<string, any>>() { /* 表单逻辑 */ }

// composables/ui/useModal.ts
export function useModal<T = any>() { /* 模态框逻辑 */ }
```

## 服务层组织

### 服务文件结构

```
services/
├── api.ts                   # 基础API配置
├── auth.ts                  # 认证服务
├── upload.ts                # 文件上传服务
├── cache.ts                 # 缓存服务
└── index.ts                 # 服务统一导出
```

### 服务层实现

```typescript
// services/api.ts
import axios, { type AxiosInstance } from 'axios'

class ApiService {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000
    })
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
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
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error) => Promise.reject(error)
    )
  }

  get<T = any>(url: string, params?: any) {
    return this.instance.get<T>(url, { params })
  }

  post<T = any>(url: string, data?: any) {
    return this.instance.post<T>(url, data)
  }

  put<T = any>(url: string, data?: any) {
    return this.instance.put<T>(url, data)
  }

  delete<T = any>(url: string) {
    return this.instance.delete<T>(url)
  }
}

export const apiService = new ApiService()
```

## 工具函数组织

### 工具函数分类

```
utils/
├── format.ts               # 格式化工具
├── validation.ts           # 验证工具
├── storage.ts              # 存储工具
├── date.ts                 # 日期工具
├── string.ts               # 字符串工具
├── array.ts                # 数组工具
├── object.ts               # 对象工具
├── dom.ts                  # DOM操作工具
└── index.ts                # 统一导出
```

### 工具函数示例

```typescript
// utils/format.ts

// 金额格式化
export function formatCurrency(amount: number, currency = '¥'): string {
  return `${currency}${amount.toFixed(2)}`
}

// 手机号格式化
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}
```

```typescript
// utils/validation.ts

// 邮箱验证
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 手机号验证
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 身份证验证
export function isValidIdCard(idCard: string): boolean {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

// 密码强度验证
export function checkPasswordStrength(password: string): {
  score: number
  message: string
} {
  let score = 0
  
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels = ['很弱', '弱', '中等', '强', '很强']
  return {
    score,
    message: levels[score - 1] || '很弱'
  }
}
```

## 样式文件组织

### 样式文件结构

```
assets/styles/
├── index.scss              # 样式入口文件
├── variables.scss          # 样式变量
├── mixins.scss             # 样式混入
├── reset.scss              # 样式重置
├── common.scss             # 通用样式
├── components.scss         # 组件样式
├── layouts.scss            # 布局样式
└── themes/                 # 主题样式
    ├── light.scss
    └── dark.scss
```

### 样式组织示例

```scss
// assets/styles/variables.scss

// 颜色变量
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

// 字体变量
$font-family-primary: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
$font-size-base: 14px;
$font-size-small: 12px;
$font-size-large: 16px;

// 间距变量
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 圆角变量
$border-radius-base: 4px;
$border-radius-small: 2px;
$border-radius-large: 8px;

// 阴影变量
$box-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
$box-shadow-dark: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.12);
```

## 配置文件组织

### 环境配置

```
config/
├── index.ts                # 配置入口
├── development.ts          # 开发环境配置
├── production.ts           # 生产环境配置
└── test.ts                 # 测试环境配置
```

```typescript
// config/index.ts
import type { AppConfig } from './types'
import developmentConfig from './development'
import productionConfig from './production'
import testConfig from './test'

const configs: Record<string, AppConfig> = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig
}

const env = import.meta.env.MODE || 'development'

export default configs[env]
```

## 文件导入导出规范

### 导入顺序规范

```typescript
// 1. Vue相关导入
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. 第三方库导入
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 3. 项目内部导入
//    - 类型导入
import type { User, ApiResponse } from '@/types'
//    - 服务导入
import { userService } from '@/services'
//    - Composables导入
import { useUsers } from '@/composables'
//    - 组件导入
import UserCard from '@/components/UserCard.vue'
//    - 工具函数导入
import { formatDate } from '@/utils'

// 4. 相对路径导入
import './styles.css'
```

### 导出规范

```typescript
// 使用命名导出而非默认导出
export const API_BASE_URL = 'https://api.example.com'
export const TIMEOUT = 10000

// 工具函数使用命名导出
export function formatDate(date: Date): string { /* ... */ }
export function validateEmail(email: string): boolean { /* ... */ }

// 类型使用export type导出
export type User = {
  id: number
  name: string
  email: string
}

// 在index.ts中统一导出
export * from './api'
export * from './utils'
export * from './types'
```

## 最佳实践

### 1. 目录命名
- 使用kebab-case命名目录
- 按功能模块组织，不按技术类型组织
- 避免过深的嵌套结构

### 2. 文件命名
- 组件文件使用PascalCase命名
- 工具文件使用camelCase命名
- 类型文件与业务文件同名但后缀为.types

### 3. 导入导出
- 统一使用index.ts作为模块入口
- 避免循环依赖
- 使用明确的导入路径

### 4. 类型定义
- 类型文件与业务逻辑分离
- 避免使用any类型
- 为所有接口提供完整的类型定义

### 5. 代码组织
- 按功能而非技术分层
- 保持单一职责原则
- 相关文件就近放置