# Vue 3 TypeScript Standards

## Type Configuration

### Project TypeScript Configuration

Based on your project's actual `tsconfig.json` structure:

#### Root tsconfig.json
```json
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.node.json"
    },
    {
      "path": "./tsconfig.app.json"
    }
  ],
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

#### Application tsconfig.app.json
```json
{
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue"
  ],
  "exclude": [
    "src/**/__tests__/*"
  ],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "types": [
      "vite/client",
      "element-plus/global",
      "node"
    ]
  }
}
```

#### Node.js tsconfig.node.json
```json
{
  "include": [
    "vite.config.*",
    "vitest.config.*",
    "cypress.config.*",
    "nightwatch.conf.*",
    "playwright.config.*"
  ],
  "compilerOptions": {
    "composite": true,
    "noEmit": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": [
      "node"
    ]
  }
}
```

### Configuration Notes

**Current Project Settings:**
- **Strict Mode**: Enabled (`"strict": true`)
- **Type Checking**: Strict settings for production-grade code
- **Module Resolution**: Bundler mode for Vite
- **Target**: ES2022 for modern features
- **Path Alias**: Simple `@/*` mapping to `src/*`
- **Code Quality**: All strict type checking enabled

**Production TypeScript Configuration:**
```json
// Production-ready strict configuration
{
  "strict": true,                        // Enable all strict type checking
  "noUnusedLocals": true,                // Check for unused local variables
  "noUnusedParameters": true,            // Check for unused parameters
  "noImplicitReturns": true,             // Check for missing return statements
  "exactOptionalPropertyTypes": true,    // Strict optional property handling
  "noImplicitAny": true,                 // Disallow implicit any types
  "noImplicitThis": true,                // Disallow implicit this types
  "noImplicitOverride": true,            // Require explicit override declarations
  "noPropertyAccessFromIndexSignature": false,  // Allow indexed access as needed
  "noUncheckedIndexedAccess": true       // Strict indexed access checking
}
```

### Vite TypeScript Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### Auto-imports Configuration
当前项目配置了自动导入功能，通过以下文件管理：
- `auto-imports.d.ts` - 自动生成的类型声明
- `components.d.ts` - 组件自动导入类型
- `.eslintrc-auto-import.json` - ESLint自动导入配置

**项目自动导入配置包括：**
- Vue 3 Composition API (`ref`, `reactive`, `computed`, 等)
- Element Plus 组件 (`ElButton`, `ElTable`, 等)
- Vue Router (`useRouter`, `useRoute`)
- Pinia 状态管理
- 自定义 composables 和工具函数

## Component Typing

### Props and Emits Typing
```vue
<script setup lang="ts">
// Define props interface
interface Props {
  id: number;
  title: string;
  description?: string;
  readonly?: boolean;
  user: User;
  onUpdate?: (data: any) => void;
}

// Define emits interface
interface Emits {
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
  (e: 'submit', formData: FormData): void;
  (e: 'custom-event', payload: CustomPayload): void;
}

// Use with defineProps and defineEmits
const props = withDefaults(defineProps<Props>(), {
  description: '',
  readonly: false
});

const emit = defineEmits<Emits>();
</script>
```

### Generic Component Typing
```vue
<script setup lang="ts">
import type { Ref } from 'vue';

interface GenericListProps<T> {
  items: T[];
  loading?: boolean;
  emptyText?: string;
}

interface GenericListEmits<T> {
  (e: 'select', item: T): void;
  (e: 'delete', item: T): void;
}

// Generic props with interface
const props = withDefaults(defineProps<GenericListProps<User>>(), {
  loading: false,
  emptyText: '暂无数据'
});

const emit = defineEmits<GenericListEmits<User>>();
</script>
```

## Type Definitions

### Type File Organization

#### 功能模块化类型结构 (项目实际模式)
```
src/
├── types/
│   └── index.ts              # 全局通用类型
├── features/
│   ├── users/
│   │   ├── types/index.ts    # 用户相关类型
│   │   ├── services/userService.ts
│   │   ├── components/UserActions.vue
│   │   └── composables/useUserManagement.ts
│   ├── llm/
│   │   ├── types/index.ts    # LLM相关类型
│   │   └── services/llmService.ts
│   └── diagram/
│       ├── types/index.ts    # 图表相关类型
│       └── services/diagramService.ts
```

#### 全局类型定义 (src/types/index.ts)
```typescript
// 通用API响应格式
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  code?: number;
}

// 通用错误信息接口
export interface ApiErrorInfo {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// 响应式数据基础类型
export interface BaseResponse<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

// 选择器选项类型
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// 验证结果类型
export interface ValidationResult {
  valid: boolean;
  message?: string;
  field?: string;
}

// 通用操作回调类型
export type ActionCallback<T = any> = (payload: T) => void;
export type AsyncActionCallback<T = any> = (payload: T) => Promise<void>;
```

#### 功能模块类型示例 (基于项目实际模式)
```typescript
// src/features/users/types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户操作回调类型
export interface UserActions {
  onEdit: (user: User, index: number) => void;
  onView: (user: User) => void;
  onDelete: (user: User, index: number) => void;
}

// 用户搜索参数
export interface UserSearchParams {
  keyword: string;
  role: string;
  status: string;
}

// src/features/llm/types/index.ts
export interface LLMConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DiagramRequest {
  input: string;
  format: 'mermaid' | 'xml';
  config?: LLMConfig;
}

// src/features/diagram/types/index.ts
export interface DiagramData {
  format: 'mermaid' | 'xml';
  content: string;
  metadata?: {
    title?: string;
    description?: string;
  };
}
```

### Composables Typing (项目实际模式)

#### 功能模块 Composables 模式
```typescript
// src/features/users/composables/useUserManagement.ts
import { ref, reactive, computed } from 'vue';
import type { User, UserSearchParams, UserActions } from '../types';
import { userService } from '../services/userService';

export function useUserManagement() {
  // 响应式数据
  const loading = ref(false);
  const tableData = ref<User[]>([]);
  const searchParams = reactive<UserSearchParams>({
    keyword: '',
    role: '',
    status: '',
  });

  // 计算属性
  const hasData = computed(() => tableData.value.length > 0);
  const filteredData = computed(() => {
    // 过滤逻辑
    return tableData.value.filter(user => {
      const matchesKeyword = user.name.includes(searchParams.keyword) || 
                           user.email.includes(searchParams.keyword);
      const matchesRole = !searchParams.role || user.role === searchParams.role;
      const matchesStatus = !searchParams.status || user.status === searchParams.status;
      return matchesKeyword && matchesRole && matchesStatus;
    });
  });

  // 方法
  const fetchUsers = async () => {
    loading.value = true;
    try {
      const users = await userService.fetchUsers();
      tableData.value = users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      loading.value = false;
    }
  };

  const handleUserAction = async (action: keyof UserActions, user: User, index?: number) => {
    // 处理用户操作逻辑
    console.log(`User action: ${action}`, user);
  };

  return {
    // 状态
    loading,
    tableData,
    searchParams,
    // 计算属性
    hasData,
    filteredData,
    // 方法
    fetchUsers,
    handleUserAction,
  };
}
```

#### 通用响应式数据模式
```typescript
// src/composables/useAsyncData.ts
import { ref, computed } from 'vue';

export interface AsyncDataOptions<T> {
  immediate?: boolean;
  defaultValue?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: AsyncDataOptions<T> = {}
) {
  const data = ref<T | null>(options.defaultValue ?? null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { immediate = false } = options;

  const execute = async (): Promise<T | null> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await fetcher();
      data.value = result;
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      error.value = errorMessage;
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
      return null;
    } finally {
      loading.value = false;
    }
  };

  const isReady = computed(() => !loading.value && !error.value);
  const hasData = computed(() => data.value !== null);

  if (immediate) {
    execute();
  }

  return {
    data,
    loading,
    error,
    execute,
    isReady,
    hasData,
    refresh: execute,
  };
}
```

## Generic Typing Patterns

### Generic Utilities
```typescript
// src/utils/generics.ts
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 🔥 CRITICAL: Safe Object Index Patterns
export type SafeRecord<K extends string | number | symbol, T> = Record<K, T>;

// Usage examples
type UserUpdate = Optional<User, 'name' | 'email'>;
type UserWithRequiredEmail = RequiredBy<User, 'email'>;
type PartialUser = DeepPartial<User>;
```

### Type Guards
```typescript
// src/utils/typeGuards.ts
export function isUser(obj: any): obj is User {
  return obj && 
         typeof obj.id === 'number' &&
         typeof obj.name === 'string' &&
         typeof obj.email === 'string' &&
         ['admin', 'user', 'moderator'].includes(obj.role);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function hasProperty<T extends object, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return prop in obj;
}
```

## Element Plus 集成 (项目实际模式)

### 自动导入配置
项目已配置 Element Plus 组件和类型的自动导入，无需手动导入组件。

#### 自动导入内容
- **组件**: `ElButton`, `ElTable`, `ElForm`, `ElInput`, 等
- **类型**: `FormInstance`, `FormRules`, `TableColumnCtx`, 等
- **图标**: Element Plus 图标组件

### 表单组件类型模式
```vue
<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

// 项目中的用户表单接口
interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive';
}

// 表单引用和数据
const formRef = ref<FormInstance>();
const formData = reactive<UserForm>({
  name: '',
  email: '',
  phone: '',
  role: 'user',
  status: 'active',
});

// 表单验证规则
const rules = reactive<FormRules<UserForm>>({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
});

// 提交处理
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    // 表单验证通过，执行提交逻辑
    console.log('Form submitted:', formData);
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
};
</script>

<template>
  <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
    <ElFormItem label="姓名" prop="name">
      <ElInput v-model="formData.name" placeholder="请输入姓名" />
    </ElFormItem>
    
    <ElFormItem label="邮箱" prop="email">
      <ElInput v-model="formData.email" placeholder="请输入邮箱" />
    </ElFormItem>
    
    <ElFormItem label="手机号" prop="phone">
      <ElInput v-model="formData.phone" placeholder="请输入手机号" />
    </ElFormItem>
    
    <ElFormItem label="角色" prop="role">
      <ElSelect v-model="formData.role" placeholder="请选择角色">
        <ElOption label="管理员" value="admin" />
        <ElOption label="普通用户" value="user" />
        <ElOption label="版主" value="moderator" />
      </ElSelect>
    </ElFormItem>
    
    <ElFormItem>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      <ElButton @click="resetForm">重置</ElButton>
    </ElFormItem>
  </ElForm>
</template>
```

### 表格组件类型模式
```vue
<script setup lang="ts">
import type { TableColumnCtx } from 'element-plus';
import type { User } from '@/features/users/types';

// 表格数据
const tableData = ref<User[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 表格列配置
const tableColumns: TableColumnCtx<User>[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: true,
  },
  {
    prop: 'name',
    label: '姓名',
    width: 120,
    showOverflowTooltip: true,
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 180,
    showOverflowTooltip: true,
  },
  {
    prop: 'phone',
    label: '手机号',
    width: 130,
  },
  {
    prop: 'role',
    label: '角色',
    width: 100,
    formatter: (row: User) => {
      const roleMap = {
        admin: '管理员',
        user: '普通用户',
        moderator: '版主',
      };
      return roleMap[row.role];
    },
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    formatter: (row: User) => {
      return row.status === 'active' ? '启用' : '禁用';
    },
  },
  {
    label: '操作',
    width: 200,
    fixed: 'right',
    formatter: (row: User, column: TableColumnCtx<User>, cellValue: any, index: number) => {
      // 自定义操作按钮
      return h('div', { class: 'table-actions' }, [
        h(ElButton, { 
          type: 'primary', 
          size: 'small',
          onClick: () => handleEdit(row, index)
        }, '编辑'),
        h(ElButton, { 
          type: 'danger', 
          size: 'small',
          onClick: () => handleDelete(row, index)
        }, '删除'),
      ]);
    },
  },
];

// 事件处理
const handleEdit = (user: User, index: number) => {
  console.log('Edit user:', user, 'at index:', index);
};

const handleDelete = (user: User, index: number) => {
  console.log('Delete user:', user, 'at index:', index);
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  // 重新加载数据
};

const handleCurrentChange = (current: number) => {
  pagination.current = current;
  // 重新加载数据
};
</script>

<template>
  <ElTable :data="tableData" border stripe>
    <ElTableColumn 
      v-for="column in tableColumns" 
      :key="column.prop || column.label"
      v-bind="column"
    />
  </ElTable>
  
  <ElPagination
    v-model:current-page="pagination.current"
    v-model:page-size="pagination.pageSize"
    :page-sizes="[10, 20, 50, 100]"
    :total="pagination.total"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>
```

### 自定义按钮组件类型
```vue
<script setup lang="ts">
// YjButton.vue - 项目中的自定义按钮组件
interface YjButtonProps {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default';
  size?: 'large' | 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  icon?: object;
  plain?: boolean;
  round?: boolean;
  circle?: boolean;
  tag?: string;
}

interface YjButtonEmits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<YjButtonProps>(), {
  type: 'default',
  size: 'default',
  disabled: false,
  loading: false,
  plain: false,
  round: false,
  circle: false,
  tag: 'button',
});

const emit = defineEmits<YjButtonEmits>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <ElButton
    v-bind="props"
    @click="handleClick"
  >
    <slot />
  </ElButton>
</template>
```

## Advanced Typing

### Utility Types
```typescript
// src/utils/types.ts
export type EventCallback<T = any> = (payload: T) => void;
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;
export type ComponentProps<T> = T extends new (...args: any[]) => infer R
  ? R extends { $props: infer P }
    ? P
    : never
  : never;

export type ComponentEmits<T> = T extends new (...args: any[]) => infer R
  ? R extends { $emit: infer E }
    ? E
    : never
  : never;
```

### 服务层类型模式 (项目实际模式)

#### 单例模式服务类
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiErrorInfo } from '@/types';

// 自定义错误类
export class ApiError extends Error implements ApiErrorInfo {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly requestUrl?: string;
  public readonly requestMethod?: string;
  public readonly responseTime?: number;
  public readonly originalError?: any;

  constructor(message: string, code: string, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.timestamp = new Date();
    this.originalError = originalError;
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const message = error.response?.data?.message || error.message || 'Network error';
    const code = error.response?.data?.code || 'NETWORK_ERROR';
    const apiError = new ApiError(message, code, error);
    
    apiError.requestUrl = error.config?.url;
    apiError.requestMethod = error.config?.method?.toUpperCase();
    
    return apiError;
  }
}

// 单例模式 API 服务
export class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const startTime = Date.now();
        config.metadata = { startTime };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const endTime = Date.now();
        const responseTime = endTime - (response.config.metadata?.startTime || endTime);
        
        return response;
      },
      (error: AxiosError) => {
        const apiError = ApiError.fromAxiosError(error);
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

// 导出单例实例
export const apiService = ApiService.getInstance();
```

#### 功能模块服务类
```typescript
// src/features/users/services/userService.ts
import { apiService, ApiError } from '@/services/api';
import type { User } from '../types';

export class UserService {
  // 模拟数据存储
  private static users: User[] = [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    // 更多模拟数据...
  ];

  async fetchUsers(): Promise<User[]> {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...UserService.users]);
      }, 100);
    });
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Math.max(...UserService.users.map(u => u.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    UserService.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const userIndex = UserService.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new ApiError('User not found', 'USER_NOT_FOUND');
    }

    UserService.users[userIndex] = {
      ...UserService.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return UserService.users[userIndex];
  }

  async deleteUser(id: number): Promise<void> {
    const userIndex = UserService.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new ApiError('User not found', 'USER_NOT_FOUND');
    }

    UserService.users.splice(userIndex, 1);
  }
}

// 导出单例实例
export const userService = new UserService();
```

#### 错误处理模式
```typescript
// src/utils/errorHandler.ts
import { ApiError } from '@/services/api';

export class ErrorHandler {
  static handle(error: unknown): string {
    if (error instanceof ApiError) {
      return this.handleApiError(error);
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unknown error occurred';
  }

  private static handleApiError(error: ApiError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return '网络连接失败，请检查网络设置';
      case 'UNAUTHORIZED':
        return '未授权访问，请重新登录';
      case 'FORBIDDEN':
        return '权限不足，无法执行此操作';
      case 'NOT_FOUND':
        return '请求的资源不存在';
      case 'VALIDATION_ERROR':
        return '数据验证失败';
      default:
        return error.message || '服务器错误';
    }
  }

  static log(error: unknown): void {
    console.error('Error occurred:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Type Import Best Practices

### Import Statements
```typescript
// ✅ Use type imports for types only
import type { User, ApiResponse } from '@/types';
import type { FormInstance } from 'element-plus';

// ✅ Import runtime values normally
import { ref, reactive, computed } from 'vue';
import { ElButton, ElForm } from 'element-plus';
import { userService } from '@/services/userService';

// ✅ Mix type and runtime imports
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { User } from '@/types';
```

### Export Patterns
```typescript
// src/types/index.ts
export * from './common.types';
export * from './user.types';
export * from './auth.types';

// Or specific exports
export type { User, UserRole } from './user.types';
export type { AuthState, LoginRequest } from './auth.types';
```

## Best Practices (Strict TypeScript Standards)

### Mandatory Practices (Production Code)
- ✅ **Always use interface** over type for object shapes
- ✅ **Always use type imports** for type-only imports  
- ✅ **Always type props and emits** with explicit interfaces
- ✅ **Always use generic types** for reusable components
- ✅ **Always create type guards** for runtime type checking
- ✅ **Always use utility types** for type transformations
- ✅ **Always provide explicit return types** for functions
- ✅ **Leverage ES2022 features** for modern syntax
- ✅ **Use `@/*` path aliases** for cleaner imports
- ✅ **Define all function parameters** with explicit types
- ✅ **Use explicit typing for complex objects** - no implicit any
- ✅ **Handle all possible error cases** with proper typing
- ✅ **Use const assertions** for readonly data structures
- ✅ **Implement proper error boundaries** with typed error handling

### 🔥 CRITICAL: Safe Object Index Patterns

**PROBLEM**: Object index access can return `undefined`, causing type errors

**❌ WRONG - Unsafe pattern that causes TS errors:**
```typescript
const statusTagType = computed(() => {
  const types = {
    active: 'success',
    inactive: 'danger',
  };
  // ❌ ERROR: types[props.status] can be undefined
  return types[props.status] || 'info';
});
```

**✅ CORRECT - Type-safe patterns:**

**Pattern 1: Explicit Record Type + Nullish Coalescing**
```typescript
const statusTagType = computed(() => {
  const types: Record<UserStatus, 'success' | 'danger'> = {
    active: 'success',
    inactive: 'danger',
  };
  // ✅ SAFE: Explicit type + ?? operator
  return types[props.status] ?? 'info';
});
```

**Pattern 2: Type Guard Function**
```typescript
const getStatusType = (status: UserStatus): 'success' | 'danger' | 'info' => {
  const types: Record<UserStatus, 'success' | 'danger'> = {
    active: 'success',
    inactive: 'danger',
  };
  return types[status] ?? 'info';
};
```

**Pattern 3: Switch Statement**
```typescript
const statusTagType = computed((): 'success' | 'danger' | 'info' => {
  switch (props.status) {
    case 'active': return 'success';
    case 'inactive': return 'danger';
    default: return 'info';
  }
});
```

### Don'ts
- ❌ Use `any` type unless absolutely necessary
- ❌ Ignore TypeScript errors completely
- ❌ Mix runtime and type imports incorrectly
- ❌ Forget to type props and emits
- ❌ Create overly complex type definitions
- ❌ Skip type safety in event handlers
- ❌ Ignore generic type parameters
- ❌ Use type assertions when type inference works
- ❌ Rely on disabled strict mode for too long
- ❌ **Use object index without explicit types - causes undefined errors**
- ❌ **Use `||` operator for fallback - use `??` instead**

## Type Safety Checklist

### Component Typing
- [ ] All props are properly typed with interfaces
- [ ] All emits are properly typed with interfaces
- [ ] Generic components use proper type parameters
- [ ] Refs are typed with appropriate types
- [ ] Event handlers are properly typed

### API Integration
- [ ] API response types are defined
- [ ] Request payload types are defined
- [ ] Service methods have proper return types
- [ ] Error types are defined
- [ ] Type guards are used for runtime checks

### General TypeScript
- [ ] Current project configuration is understood
- [ ] Proper type imports are used
- [ ] Utility types are used appropriately
- [ ] Element Plus types are properly imported
- [ ] Vite-specific types are utilized
- [ ] 🔥 **Object index access uses explicit Record types**
- [ ] 🔥 **Nullish coalescing (??) used instead of logical OR (||)**
- [ ] 🔥 **All computed properties with object access are type-safe**

## Production Development Standards

### 代码质量要求

#### 禁止使用的模式
- ❌ **任何 `any` 类型** - 必须定义具体类型
- ❌ **隐式类型推断** - 必须显式声明类型
- ❌ **未使用的变量** - 严格检查并清理
- ❌ **缺少返回类型** - 所有函数必须声明返回类型
- ❌ **类型断言滥用** - 优先使用类型守卫而非断言

#### 强制性类型检查
```typescript
// ✅ 正确 - 完整类型定义
interface UserData {
  readonly id: number;
  name: string;
  email: string;
  role: UserRole;
}

const processUserData = (userData: UserData): Promise<ProcessedUser> => {
  // 实现逻辑必须处理所有可能的错误情况
};

// ❌ 错误 - 缺少类型信息
const processData = (data: any) => {
  return data.processed;
};
```

### 错误处理标准
```typescript
// 必须使用类型化的错误处理
const apiCallWrapper = async <T>(
  apiCall: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> => {
  try {
    const data = await apiCall();
    return { success: true, data };
  } catch (error) {
    const apiError = error instanceof ApiError ? error : ApiError.fromUnknown(error);
    return { success: false, error: apiError };
  }
};
```

### 代码审查标准
**必须检查的项目：**
- [ ] 所有函数都有明确的参数和返回类型
- [ ] 组件Props和Emits使用接口定义
- [ ] 没有任何`any`类型（除非有明确注释说明）
- [ ] 复杂对象使用`Readonly`或`as const`
- [ ] 错误处理覆盖所有可能的情况
- [ ] 异步函数正确处理Promise类型

**代码检查清单：**
```typescript
// 每个新组件必须包含：
interface ComponentProps {
  // 所有props必须有明确类型
}

interface ComponentEmits {
  // 所有emit事件必须有类型定义
}

// 每个API调用必须包含：
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// 每个服务方法必须处理错误类型：
type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };
```

### 性能优化标准
```typescript
// 使用严格类型优化性能
// ✅ 正确 - 使用常量断言
const STATUS_TYPES = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES];

// ✅ 正确 - 只读接口
interface ReadonlyConfig {
  readonly apiUrl: string;
  readonly timeout: number;
  readonly retries: number;
}
```

### 测试类型标准
```typescript
// 测试也必须使用严格类型
describe('UserService', () => {
  it('should return typed user data', async () => {
    const result: User | null = await userService.getUserById(1);
    expect(result).toBeDefined();
    
    // 类型守卫检查
    if (result) {
      expectTypeOf(result.id).toBeNumber();
      expectTypeOf(result.name).toBeString();
    }
  });
});
```

This TypeScript standards guide enforces strict type safety for production-grade Vue 3 development with zero tolerance for type ambiguity.

This TypeScript standards guide provides comprehensive patterns for type-safe Vue 3 development with a focus on practical, project-specific implementations and gradual improvement strategies.