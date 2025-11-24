---
name: vue-dev-guidelines
description: Vue 3 + TypeScript + Element Plus development guidelines. Modern patterns including Composition API, reactive data, proper component structure, TypeScript best practices, Element Plus integration, performance optimization, file organization, and **Context7 MCP integration for real-time documentation fetching**. Use when creating Vue components, pages, features, data fetching, styling, routing, or working with Vue 3 code.
---

# Vue 3 Development Guidelines

## Purpose

Comprehensive guide for modern Vue 3 development with TypeScript and Element Plus, emphasizing Composition API, reactive data patterns, proper component architecture, and performance optimization.

## When to Use This Skill

- Creating new Vue components or pages
- Building new features with Vue 3
- Setting up reactive data with Composition API
- Integrating Element Plus components
- Working with Vue Router
- Styling Vue components
- Performance optimization
- Organizing Vue code
- TypeScript best practices for Vue

---

## Quick Start

### New Component Checklist

Creating a Vue component? Follow this checklist:

- [ ] Use `<script setup lang="ts">` syntax
- [ ] Define props with `defineProps<T>()` with TypeScript interface
- [ ] Define emits with `defineEmits<T>()`
- [ ] Use `ref<T>()` for primitive reactive data
- [ ] Use `reactive<T>()` for object reactive data
- [ ] Use `computed<T>()` for derived data
- [ ] Use `watch()` and `watchEffect()` for side effects
- [ ] Import Element Plus components as needed
- [ ] Use scoped styles with CSS variables
- [ ] Follow single-file component structure
- [ ] 🔥 **CRITICAL: Object index access uses explicit `Record<Type, ReturnType>` types**
- [ ] 🔥 **CRITICAL: Use nullish coalescing `??` instead of logical OR `||` for fallbacks**
- [ ] 🔥 **CRITICAL: All computed properties with object access are type-safe**
- [ ] **🔥 CRITICAL: Run `npx tsc --noEmit` - fix ALL TypeScript errors**
- [ ] **🔥 CRITICAL: Run `npx eslint "src/**/*.{ts,vue}" --fix` - fix ALL ESLint errors**
- [ ] **🔥 CRITICAL: Repeat until both checks show ZERO errors**

### New Feature Checklist

Creating a feature? Set up this structure:

- [ ] Create `features/{feature-name}/` directory
- [ ] Create subdirectories: `components/`, `composables/`, `types/`, `utils/`
- [ ] Create TypeScript interfaces in `types/`
- [ ] Create composables in `composables/`
- [ ] Create feature components in `components/`
- [ ] Create utility functions in `utils/`
- [ ] Export public API from feature `index.ts`

---

## Context7 MCP Integration

This skill automatically integrates with Context7 MCP to fetch the latest Element Plus documentation when creating or modifying components. This ensures you're always using the most current APIs and best practices.

### Automatic Documentation Access

When working with Element Plus components, this skill will:
- Fetch the latest component documentation from Context7
- Provide up-to-date API references and examples
- Include recent deprecation warnings and new features
- Suggest modern alternatives to outdated patterns

### How It Works

1. **Component Creation**: When creating new Vue components with Element Plus, Context7 automatically retrieves the latest documentation
2. **Component Modification**: When modifying existing Element Plus components, current best practices are fetched
3. **Real-time Updates**: Documentation is fetched in real-time, ensuring you have the most current information

### Example Usage

```vue
<!-- This skill will automatically fetch latest ElButton docs -->
<template>
  <el-button 
    type="primary" 
    :icon="Plus"
    @click="handleAdd"
  >
    <!-- Uses latest Element Plus API and patterns -->
    添加
  </el-button>
</template>
```

---

## Common Imports Cheatsheet

```vue
<script setup lang="ts">
// Vue 3 Composition API
import { ref, reactive, computed, watch, onMounted } from 'vue';

// Vue Router
import { useRouter, useRoute } from 'vue-router';

// Element Plus Components (latest docs fetched via Context7)
import { ElButton, ElCard, ElForm, ElInput } from 'element-plus';

// Element Plus Icons (latest docs fetched via Context7)
import { Plus, Delete, Edit } from '@element-plus/icons-vue';

// Project Components
import BaseButton from '@/components/ui/BaseButton.vue';

// Composables
import { useAuth } from '@/composables/useAuth';

// Types
import type { User, ApiResponse } from '@/types';

// Props and Emits
interface Props {
  userId: number;
  title: string;
}

interface Emits {
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>
```

---

## Topic Guides

### 🎨 Component Patterns

**Modern Vue 3 components use:**
- `<script setup lang="ts">` syntax
- Composition API over Options API
- `defineProps<T>()` and `defineEmits<T>()` for type safety
- `ref<T>()`, `reactive<T>()`, `computed<T>()` for reactivity
- Proper TypeScript interfaces for props and emits

**Key Concepts:**
- Single File Components (SFC) structure
- Scoped styles with CSS variables
- Element Plus integration
- Reactive data patterns
- Component composition with composables

**[📖 Complete Guide: resources/component-patterns.md](resources/component-patterns.md)**

---

### 📊 Data Fetching & Reactivity

**PRIMARY PATTERN: Reactive State Management**
- Use `ref<T>()` for primitive values
- Use `reactive<T>()` for objects
- Use `computed<T>()` for derived data
- Use `watch()` and `watchEffect()` for side effects

**API Service Layer:**
- Create `features/{feature}/services/` directory
- Use `axios` or `fetch` for HTTP requests
- Centralized methods per feature
- Type-safe API responses

**[📖 Complete Guide: resources/data-fetching.md](resources/data-fetching.md)**

---

### 📁 File Organization

**features/ vs components/:**
- `features/`: Domain-specific (users, posts, auth)
- `components/`: Truly reusable (BaseButton, BaseModal)

**Feature Subdirectories:**
```
features/
  my-feature/
    components/   # Feature components
    composables/  # Vue composables
    types/        # TypeScript types
    utils/        # Utility functions
    services/     # API services
    index.ts      # Public exports
```

**[📖 Complete Guide: resources/file-organization.md](resources/file-organization.md)**

---

### 🎨 Styling & Element Plus

**Primary Method:**
- Scoped styles with `<style scoped>`
- CSS variables for theming
- Element Plus design tokens
- Responsive design with CSS Grid/Flexbox

**Element Plus Integration:**
```vue
<template>
  <el-button 
    type="primary" 
    :icon="Plus"
    @click="handleAdd"
  >
    添加
  </el-button>
</template>

<style scoped>
.custom-button {
  --el-button-bg-color: var(--el-color-primary);
  --el-button-border-color: var(--el-color-primary);
}
</style>
```

**[📖 Complete Guide: resources/styling-guide.md](resources/styling-guide.md)**

---

### 🛣️ Routing with Vue Router

**Vue Router 4 with Composition API:**
- Use `useRouter()` and `useRoute()` composables
- Route-based code splitting
- Route guards with `beforeEach`
- Lazy loading for components

**Example:**
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: () => import('@/features/users/components/UserDetail.vue'),
    props: true
  }
];

// In component
const router = useRouter();
const route = useRoute();
const userId = computed(() => route.params.id as string);
```

**[📖 Complete Guide: resources/routing-guide.md](resources/routing-guide.md)**

---

### ⚡ Performance Optimization

**Optimization Patterns:**
- `shallowRef()` and `shallowReactive()` for large objects
- `computed()` with caching for expensive operations
- `v-memo` for expensive template sections
- Lazy loading routes and components
- Virtual scrolling for large lists

**Memory Management:**
- Cleanup in `onUnmounted()`
- Proper watchers cleanup
- Avoid memory leaks in composables

**[📖 Complete Guide: resources/performance.md](resources/performance.md)**

---

### 🔍 TypeScript & ESLint Validation Workflow

**CRITICAL STEP: Complete validation before component completion**

After writing any Vue component, you MUST follow this workflow until both TypeScript and ESLint show no errors:

#### Step 1: TypeScript Type Checking
```bash
# Check TypeScript compilation errors
npx tsc --noEmit

# Or use project's type check script if available
npm run type-check
```

#### Step 2: ESLint Code Quality Check
```bash
# Check ESLint rules and formatting
npx eslint "src/**/*.{ts,vue}"

# Check specific component
npx eslint src/components/YourComponent.vue
```

#### Step 3: Auto-fix ESLint Issues
```bash
# Auto-fix fixable ESLint issues
npx eslint "src/**/*.{ts,vue}" --fix

# Fix specific component
npx eslint src/components/YourComponent.vue --fix
```

#### Step 4: Iterative Error Resolution
Repeat until both checks pass completely:
```bash
# Run both checks together
npm run check  # if configured
# OR
npx tsc --noEmit && npx eslint "src/**/*.{ts,vue}"
```

#### Common Error Fixes:

**TypeScript Errors:**
- Missing imports: Add proper imports
- Type mismatches: Use proper TypeScript types
- Element Plus types: `import type { FormInstance } from 'element-plus'`
- Props/Emits: Define proper interfaces

**ESLint Errors:**
- Unused variables: Prefix with `_` (underscore)
- Missing imports: Add missing dependencies
- Formatting: Use `--fix` to auto-resolve
- Vue rules: Follow Vue 3 Composition API patterns

#### Validation Success Criteria:
✅ `npx tsc --noEmit` runs with NO output (no errors)  
✅ `npx eslint "src/**/*.{ts,vue}"` shows NO errors  
✅ Component compiles and renders without console errors  
✅ All imports resolve correctly  

**Only when ALL checks pass completely is the component considered complete.**

**[📖 Complete Guide: resources/typescript-standards.md](resources/typescript-standards.md)**

---

### 📘 TypeScript Integration

**Standards:**
- Strict mode enabled
- Type-safe props and emits
- Interface definitions for all data structures
- Type imports with `import type`
- Generic composables

**Component Typing:**
```typescript
interface Props {
  user: User;
  readonly?: boolean;
}

interface Emits {
  (e: 'update', user: User): void;
  (e: 'delete', id: number): void;
}
```

---

### 🔧 Common Patterns

**Covered Topics:**
- Form handling with Element Plus
- Table/DataGrid patterns
- Modal/Dialog management
- Authentication composables
- State management with Pinia
- Error handling patterns

**[📖 Complete Guide: resources/common-patterns.md](resources/common-patterns.md)**

---

### 📚 Complete Examples

**Full working examples:**
- Modern Vue 3 component with all patterns
- Complete feature structure
- Composables for reusability
- Element Plus integration
- Form handling and validation
- API service integration

**[📖 Complete Guide: resources/complete-examples.md](resources/complete-examples.md)**

---

## Navigation Guide

| Need to... | Read this resource |
|------------|-------------------|
| Create a component | [component-patterns.md](resources/component-patterns.md) |
| Manage reactive data | [data-fetching.md](resources/data-fetching.md) |
| Organize files/folders | [file-organization.md](resources/file-organization.md) |
| Style with Element Plus | [styling-guide.md](resources/styling-guide.md) |
| Set up routing | [routing-guide.md](resources/routing-guide.md) |
| Optimize performance | [performance.md](resources/performance.md) |
| TypeScript integration | [typescript-standards.md](resources/typescript-standards.md) |
| **🔥 Validate & Fix TS/ES Errors** | **[TypeScript & ESLint Validation Workflow](#--typescript--eslint-validation-workflow)** |
| Common patterns | [common-patterns.md](resources/common-patterns.md) |
| See full examples | [complete-examples.md](resources/complete-examples.md) |

---

## Core Principles

1. **Composition API First**: Use `<script setup>` and Composition API
2. **Type Safety**: TypeScript interfaces for props, emits, and data
3. **Reactive Patterns**: `ref()`, `reactive()`, `computed()` for state
4. **Element Plus Integration**: Consistent design system
5. **Composable Logic**: Reusable logic with composables
6. **Scoped Styles**: Component-specific styling
7. **Performance Awareness**: Lazy loading and optimization
8. **Clean Architecture**: Organized feature structure

---

## Quick Reference: File Structure

```
src/
  features/
    my-feature/
      components/
        MyFeature.vue         # Main component
        SubComponent.vue      # Related components
      composables/
        useMyFeature.ts       # Feature logic
        useMyFeatureApi.ts    # API logic
      types/
        index.ts              # TypeScript types
        api.ts                # API types
      utils/
        helpers.ts            # Utility functions
      services/
        myFeatureApi.ts       # API service
      index.ts                # Public exports

  components/
    ui/
      BaseButton.vue         # Reusable UI
      BaseModal.vue
    common/
      LoadingSpinner.vue      # Common components

  composables/
    useAuth.ts               # Global composables
    useApi.ts

  router/
    index.ts                 # Router configuration
  types/
    index.ts                 # Global types
```

---

## Modern Component Template (Quick Copy)

```vue
<template>
  <div class="my-component">
    <el-card class="card">
      <template #header>
        <div class="card-header">
          <h3>{{ props.title }}</h3>
          <el-button 
            type="primary" 
            :icon="Plus"
            @click="handleAdd"
          >
            添加
          </el-button>
        </div>
      </template>
      
      <div class="content">
        <p>{{ processedData }}</p>
        <el-button @click="handleUpdate">更新</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElButton, ElCard } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { User } from '@/types';

// Props & Emits
interface Props {
  userId: number;
  title: string;
}

interface Emits {
  (e: 'update', user: User): void;
  (e: 'add'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Reactive Data
const userData = ref<User | null>(null);
const loading = ref(false);

// Computed
const processedData = computed(() => {
  return userData.value ? `${userData.value.name} - ${userData.value.email}` : '';
});

// 🔥 CRITICAL: Type-safe computed with object access example
const statusType = computed((): 'success' | 'danger' | 'info' => {
  const statusMap: Record<User['status'], 'success' | 'danger'> = {
    active: 'success',
    inactive: 'danger',
  };
  return statusMap[userData.value?.status || 'inactive'] ?? 'info';
});

// Methods
const handleAdd = () => {
  emit('add');
};

const handleUpdate = () => {
  if (userData.value) {
    emit('update', userData.value);
  }
};

// Watchers
watch(() => props.userId, async (newId) => {
  if (newId) {
    await loadUser(newId);
  }
}, { immediate: true });

// Lifecycle
const loadUser = async (id: number) => {
  loading.value = true;
  try {
    // API call logic here
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.my-component {
  padding: 16px;
}

.card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  margin-top: 16px;
}
</style>
```

For complete examples, see [resources/complete-examples.md](resources/complete-examples.md)

---

## Related Skills

- **error-tracking**: Error tracking for Vue applications
- **backend-dev-guidelines**: Backend API patterns that Vue frontend consumes

---

**Skill Status**: Complete Vue 3 + TypeScript + Element Plus development guide