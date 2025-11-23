# Vue 3 File Organization

## Project Structure

### Root Directory Structure
```
your-project/
├── src/
│   ├── assets/           # Static assets (images, fonts)
│   ├── components/       # Reusable components
│   ├── composables/      # Vue composables
│   ├── features/         # Feature modules
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── public/               # Public assets
├── tests/                # Test files
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Feature-Based Organization

### Feature Module Structure
```
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.vue
│   │   ├── RegisterForm.vue
│   │   └── UserProfile.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   └── useAuthValidation.ts
│   ├── services/
│   │   └── authService.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── authHelpers.ts
│   └── index.ts
├── users/
│   ├── components/
│   │   ├── UserList.vue
│   │   ├── UserCard.vue
│   │   └── UserForm.vue
│   ├── composables/
│   │   ├── useUsers.ts
│   │   └── useUserFilters.ts
│   ├── services/
│   │   └── userService.ts
│   ├── types/
│   │   ├── user.types.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── userHelpers.ts
│   └── index.ts
└── posts/
    ├── components/
    ├── composables/
    ├── services/
    ├── types/
    ├── utils/
    └── index.ts
```

### Feature Index Files

#### features/auth/index.ts
```typescript
// Public exports for auth feature
export { default as LoginForm } from './components/LoginForm.vue';
export { default as RegisterForm } from './components/RegisterForm.vue';
export { default as UserProfile } from './components/UserProfile.vue';

export { useAuth } from './composables/useAuth';
export { useAuthValidation } from './composables/useAuthValidation';

export { authService } from './services/authService';

export * from './types/auth.types';

export * from './utils/authHelpers';
```

## Component Organization

### Reusable Components Structure
```
components/
├── ui/                    # Basic UI components
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseModal.vue
│   ├── BaseCard.vue
│   └── index.ts
├── layout/               # Layout components
│   ├── AppHeader.vue
│   ├── AppSidebar.vue
│   ├── AppFooter.vue
│   └── index.ts
├── common/               # Common business components
│   ├── LoadingSpinner.vue
│   ├── ErrorBoundary.vue
│   ├── ConfirmDialog.vue
│   └── index.ts
└── charts/               # Chart components
    ├── LineChart.vue
    ├── BarChart.vue
    └── index.ts
```

### Component Index Files

#### components/ui/index.ts
```typescript
export { default as BaseButton } from './BaseButton.vue';
export { default as BaseInput } from './BaseInput.vue';
export { default as BaseModal } from './BaseModal.vue';
export { default as BaseCard } from './BaseCard.vue';
```

## Composables Organization

### Composables Structure
```
composables/
├── api/                  # API-related composables
│   ├── useApiData.ts
│   ├── useApiPagination.ts
│   └── index.ts
├── ui/                   # UI-related composables
│   ├── useModal.ts
│   ├── useToast.ts
│   └── index.ts
├── auth/                 # Auth composables
│   ├── useAuth.ts
│   └── index.ts
└── utils/                # Utility composables
    ├── useDebounce.ts
    ├── useLocalStorage.ts
    └── index.ts
```

### Composable Examples

#### composables/api/useApiData.ts
```typescript
import { ref } from 'vue';

export function useApiData<T>(fetcher: () => Promise<T>) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async () => {
    loading.value = true;
    error.value = null;

    try {
      data.value = await fetcher();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, execute };
}
```

## Type Definitions

### Types Structure
```
types/
├── api/                   # API response types
│   ├── auth.types.ts
│   ├── user.types.ts
│   └── index.ts
├── ui/                    # UI component types
│   ├── component.types.ts
│   └── index.ts
├── global/                # Global types
│   ├── common.types.ts
│   └── index.ts
└── index.ts               # Main type exports
```

### Type Definition Examples

#### types/auth/auth.types.ts
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

#### types/ui/component.types.ts
```typescript
export interface BaseButtonProps {
  type?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'large' | 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: number;
  sortable?: boolean;
}
```

## Utils Organization

### Utils Structure
```
utils/
├── api/                   # API utilities
│   ├── apiClient.ts
│   ├── errorHandler.ts
│   └── index.ts
├── format/                # Formatting utilities
│   ├── date.ts
│   ├── currency.ts
│   └── index.ts
├── validation/            # Validation utilities
│   ├── rules.ts
│   └── index.ts
└── helpers/               # General helpers
    ├── storage.ts
    ├── constants.ts
    └── index.ts
```

### Utility Examples

#### utils/api/apiClient.ts
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

## Import Path Configuration

### Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@features': resolve(__dirname, 'src/features'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@router': resolve(__dirname, 'src/router'),
    }
  }
});
```

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@composables/*": ["src/composables/*"],
      "@features/*": ["src/features/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@stores/*": ["src/stores/*"],
      "@router/*": ["src/router/*"]
    }
  }
}
```

## Naming Conventions

### Files
- **Components**: PascalCase (UserCard.vue, BaseButton.vue)
- **Composables**: camelCase with 'use' prefix (useAuth.ts, useApiData.ts)
- **Services**: camelCase with feature name (userService.ts, authService.ts)
- **Types**: camelCase with .types suffix (user.types.ts, auth.types.ts)
- **Utils**: camelCase (date.ts, validation.ts)

### Directories
- **Features**: lowercase, plural (users, posts, auth)
- **Components**: camelCase (ui, layout, common)
- **Types**: lowercase (api, ui, global)

## Best Practices

### Do's
- ✅ Group related files together in features
- ✅ Use index.ts files for clean exports
- ✅ Keep components focused and single-purpose
- ✅ Create reusable composables
- ✅ Separate business logic from UI logic
- ✅ Use absolute imports with path aliases
- ✅ Type everything with TypeScript

### Don'ts
- ❌ Put all components in one directory
- ❌ Mix UI and business logic in components
- ❌ Create deeply nested component structures
- ❌ Use relative imports for deep directories
- ❌ Forget to create index.ts for modules
- ❌ Ignore type definitions

## Example Import Patterns

### Importing Components
```vue
<script setup lang="ts">
// ✅ Good: Use absolute paths with aliases
import BaseButton from '@components/ui/BaseButton.vue';
import UserCard from '@features/users/components/UserCard.vue';

// ❌ Bad: Use relative imports for deep paths
import BaseButton from '../../../../components/ui/BaseButton.vue';
</script>
```

### Importing Composables
```typescript
// ✅ Good: Feature-specific composable
import { useUsers } from '@features/users/composables/useUsers';

// ✅ Good: Global composable
import { useApiData } from '@composables/api/useApiData';

// ❌ Bad: Importing from feature in another feature
import { useAuth } from '@features/auth/composables/useAuth';
```

### Importing Types
```typescript
// ✅ Good: Import types from types directory
import type { User, LoginRequest } from '@types/auth';

// ✅ Good: Import feature types
import type { UserPost } from '@features/posts/types';

// ❌ Bad: Define types inline
interface User {
  // ...type definition
}
```

This organization pattern ensures scalability, maintainability, and clear separation of concerns in your Vue 3 application.