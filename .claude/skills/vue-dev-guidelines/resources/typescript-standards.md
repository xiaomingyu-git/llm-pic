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
- **Strict Mode**: Currently disabled (`"strict": false`)
- **Type Checking**: Relaxed settings for rapid development
- **Module Resolution**: Bundler mode for Vite
- **Target**: ES2022 for modern features
- **Path Alias**: Simple `@/*` mapping to `src/*`

**Recommended Enhancements:**
```json
// For production readiness, consider enabling:
{
  "strict": true,              // Enable strict type checking
  "noUnusedLocals": true,      // Check for unused locals
  "noUnusedParameters": true,  // Check for unused parameters
  "noImplicitReturns": true,   // Check for implicit returns
  "exactOptionalPropertyTypes": true  // More precise optional types
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
      '@/components': resolve(__dirname, 'src/components'),
      '@/composables': resolve(__dirname, 'src/composables'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils')
    }
  }
});
```

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
```typescript
// src/types/common.types.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  code?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: number | string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// src/types/user.types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'moderator';

export interface UserCreateRequest {
  name: string;
  email: string;
  age: number;
  role: UserRole;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  age?: number;
  role?: UserRole;
  isActive?: boolean;
}

// src/types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
```

### Composables Typing
```typescript
// src/composables/useApiData.ts
import { ref, computed } from 'vue';

export function useApiData<T>(
  fetcher: () => Promise<T>,
  options: {
    immediate?: boolean;
    cache?: boolean;
  } = {}
) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { immediate = true, cache = false } = options;

  const execute = async (): Promise<T | null> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await fetcher();
      data.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
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
    hasData
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

## Element Plus Typing

### Form Typing
```vue
<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const formRef = ref<FormInstance>();
const form = reactive<LoginForm>({
  email: '',
  password: '',
  rememberMe: false
});

const rules = reactive<FormRules<LoginForm>>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
});

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // Submit logic
    }
  });
};
</script>
```

### Table Typing
```vue
<script setup lang="ts">
import type { TableColumnCtx } from 'element-plus';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const tableColumns: TableColumnCtx<User>[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 80
  },
  {
    prop: 'name',
    label: '姓名',
    width: 120
  },
  {
    prop: 'email',
    label: '邮箱'
  },
  {
    prop: 'role',
    label: '角色',
    width: 100
  },
  {
    label: '操作',
    width: 200,
    formatter: (row, column, cellValue, index) => {
      // Custom formatting logic
      return cellValue;
    }
  }
];
</script>
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

### Generic Service Typing
```typescript
// src/services/baseService.ts
import { apiClient } from '@/utils/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types';

export abstract class BaseService<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  protected abstract baseUrl: string;

  async getAll(params?: any): Promise<T[]> {
    const response = await apiClient.get<ApiResponse<T[]>>(this.baseUrl, { params });
    return response.data.data;
  }

  async getById(id: number | string): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async create(data: CreateT): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: number | string, data: UpdateT): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getPaginated(params: any): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<PaginatedResponse<T>>(`${this.baseUrl}/paginated`, { params });
    return response.data;
  }
}

// Usage
class UserService extends BaseService<User, UserCreateRequest, UserUpdateRequest> {
  protected baseUrl = '/users';
  
  async getByEmail(email: string): Promise<User | null> {
    const users = await this.getAll({ email });
    return users[0] || null;
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

## Best Practices (Project-Adjusted)

### Do's (Current Project Configuration)
- ✅ Use interface over type for object shapes
- ✅ Use type imports for type-only imports  
- ✅ Type props and emits with interfaces
- ✅ Use generic types for reusable components
- ✅ Create type guards for runtime type checking
- ✅ Use utility types for type transformations
- ✅ Provide proper return types for functions
- ✅ Leverage ES2022 features for modern syntax
- ✅ Use `@/*` path aliases for cleaner imports

### Recommended for Production
- 🔄 Consider enabling strict mode gradually
- 🔄 Enable `noUnusedLocals` and `noUnusedParameters`
- 🔄 Add `exactOptionalPropertyTypes` for better optional type handling

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

### Progressive Enhancement
- [ ] [Optional] Enable strict mode when ready
- [ ] [Optional] Enable unused variable checks
- [ ] [Optional] Add more strict type checking rules
- [ ] [Optional] Configure more specific path aliases if needed

This TypeScript standards guide provides comprehensive patterns for type-safe Vue 3 development.