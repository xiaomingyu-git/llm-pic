# Vue 3 Component Patterns

## Core Component Structure

### Single File Component (SFC) Template

```vue
<template>
  <div class="component-name">
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ElButton } from 'element-plus';
import type { ComponentProps } from '@/types';

// Props & Emits
interface Props {
  title: string;
  data?: ComponentProps;
}

interface Emits {
  (e: 'update', value: string): void;
  (e: 'submit', data: ComponentProps): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Component logic here
</script>

<style scoped>
.component-name {
  /* Component styles */
}
</style>
```

## Composition API Patterns

### Reactive Data Patterns

#### Primitive Values - ref()
```typescript
// ✅ Use ref for primitive values
const count = ref<number>(0);
const title = ref<string>('');
const isVisible = ref<boolean>(true);

// Access with .value
count.value += 1;
title.value = 'New Title';
```

#### Objects - reactive()
```typescript
// ✅ Use reactive for objects
const user = reactive<User>({
  id: 1,
  name: 'John',
  email: 'john@example.com'
});

// Direct access (no .value needed)
user.name = 'Jane';
```

#### Computed Properties
```typescript
const fullName = computed(() => {
  return `${user.firstName} ${user.lastName}`;
});

const isAdult = computed(() => {
  return user.age >= 18;
});
```

### Props and Emits Patterns

#### Type-Safe Props
```typescript
interface Props {
  // Required props
  id: number;
  title: string;
  
  // Optional props
  description?: string;
  readonly?: boolean;
  
  // Complex props
  user: User;
  onSubmit: (data: FormData) => void;
}

const props = defineProps<Props>();
```

#### Type-Safe Emits
```typescript
interface Emits {
  // Update event (v-model pattern)
  (e: 'update:modelValue', value: string): void;
  
  // Action events
  (e: 'save', data: SaveData): void;
  (e: 'delete', id: number): void;
  
  // Custom events
  (e: 'custom-event', payload: { type: string; data: any }): void;
}

const emit = defineEmits<Emits>();

// Usage
emit('update:modelValue', 'new value');
emit('save', { name: 'John', age: 30 });
```

### Watcher Patterns

#### Basic Watch
```typescript
watch(() => props.userId, (newId, oldId) => {
  console.log(`User ID changed from ${oldId} to ${newId}`);
  loadUserData(newId);
});
```

#### Multiple Sources
```typescript
watch(
  [() => props.userId, () => props.type],
  ([newUserId, newType], [oldUserId, oldType]) => {
    console.log('Multiple dependencies changed');
  }
);
```

#### Deep Watch for Objects
```typescript
watch(
  () => user.value,
  (newUser, oldUser) => {
    console.log('User object changed');
  },
  { deep: true }
);
```

#### Immediate Watch
```typescript
watch(
  () => props.data,
  (newData) => {
    processData(newData);
  },
  { immediate: true }
);
```

## Element Plus Integration Patterns

### Component Registration
```vue
<script setup lang="ts">
// Individual imports (tree-shaking friendly)
import { ElButton, ElCard, ElForm, ElInput } from 'element-plus';
import { Plus, Delete, Edit } from '@element-plus/icons-vue';

// OR global registration (in main.ts)
// app.use(ElButton)
</script>

<template>
  <el-card>
    <el-button type="primary" :icon="Plus">添加</el-button>
    <el-button type="danger" :icon="Delete">删除</el-button>
    <el-button type="warning" :icon="Edit">编辑</el-button>
  </el-card>
</template>
```

### Form Patterns
```vue
<template>
  <el-form 
    :model="form" 
    :rules="rules" 
    ref="formRef"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="姓名" prop="name">
      <el-input v-model="form.name" placeholder="请输入姓名" />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" type="email" />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

const formRef = ref<FormInstance>();

const form = reactive({
  name: '',
  email: ''
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
});

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('Form submitted:', form);
      // Submit logic here
    }
  });
};

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};
</script>
```

### Table Patterns
```vue
<template>
  <el-table :data="tableData" stripe style="width: 100%">
    <el-table-column prop="date" label="日期" width="180" />
    <el-table-column prop="name" label="姓名" width="180" />
    <el-table-column prop="address" label="地址" />
    <el-table-column label="操作" width="180">
      <template #default="{ row }">
        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface TableRow {
  date: string;
  name: string;
  address: string;
}

const tableData = ref<TableRow[]>([
  {
    date: '2016-05-02',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1518 弄'
  }
  // ... more data
]);

const handleEdit = (row: TableRow) => {
  console.log('Edit:', row);
};

const handleDelete = (row: TableRow) => {
  console.log('Delete:', row);
};
</script>
```

## Lifecycle Hooks

### Common Lifecycle Patterns
```typescript
import { onMounted, onUnmounted, onUpdated } from 'vue';

// Component mounted
onMounted(() => {
  console.log('Component mounted');
  // Initial data loading
  loadData();
});

// Component unmounted
onUnmounted(() => {
  console.log('Component unmounted');
  // Cleanup
  cleanup();
});

// Component updated
onUpdated(() => {
  console.log('Component updated');
});
```

### Async Data Loading
```typescript
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await fetchData();
    // Process data
  } catch (err) {
    error.value = 'Failed to load data';
    console.error('Data loading error:', err);
  } finally {
    loading.value = false;
  }
});
```

## Component Communication

### Parent to Child (Props)
```vue
<!-- Parent.vue -->
<template>
  <ChildComponent 
    :title="pageTitle"
    :user="currentUser"
    @update="handleUpdate"
  />
</template>

<!-- Child.vue -->
<script setup lang="ts">
interface Props {
  title: string;
  user: User;
}

const props = defineProps<Props>();
</script>
```

### Child to Parent (Emits)
```vue
<!-- Child.vue -->
<script setup lang="ts">
interface Emits {
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}

const emit = defineEmits<Emits>();

const handleAction = () => {
  emit('update', 'new value');
  emit('delete', 123);
};
</script>
```

### v-model Pattern
```vue
<!-- CustomInput.vue -->
<template>
  <el-input 
    :model-value="modelValue"
    @input="handleInput"
    placeholder="Enter text..."
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleInput = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<!-- Usage -->
<template>
  <CustomInput v-model="inputValue" />
</template>
```

## Slots Patterns

### Default Slot
```vue
<!-- CardComponent.vue -->
<template>
  <div class="card">
    <div class="card-header" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<!-- Usage -->
<CardComponent>
  <template #header>
    <h2>Card Title</h2>
  </template>
  <p>Card content goes here.</p>
</CardComponent>
```

### Scoped Slots
```vue
<!-- ListComponent.vue -->
<template>
  <div class="list">
    <div v-for="item in items" :key="item.id" class="list-item">
      <slot :item="item" :index="item.id">
        {{ item.name }}
      </slot>
    </div>
  </div>
</template>

<!-- Usage -->
<ListComponent :items="users">
  <template #default="{ item, index }">
    <div>
      <strong>{{ index }}: {{ item.name }}</strong>
      <span>{{ item.email }}</span>
    </div>
  </template>
</ListComponent>
```

## Best Practices

### Do's
- ✅ Use `<script setup lang="ts">` syntax
- ✅ Define props and emits with TypeScript interfaces
- ✅ Use `ref()` for primitives, `reactive()` for objects
- ✅ Use `computed()` for derived data
- ✅ Use `watch()` for side effects
- ✅ Use scoped styles
- ✅ Import Element Plus components individually
- ✅ Handle loading and error states

### Don'ts
- ❌ Mix Options API with Composition API
- ❌ Use `this` in setup script
- ❌ Forget to use `.value` with refs
- ❌ Ignore TypeScript types
- ❌ Use global styles without scoping
- ❌ Forget to cleanup in `onUnmounted`

## Component Naming Conventions

- Use PascalCase for component names: `UserCard.vue`
- Use kebab-case in templates: `<user-card>`
- Use descriptive names: `UserProfileForm.vue` not `Form.vue`
- Group related components in folders: `users/UserCard.vue`