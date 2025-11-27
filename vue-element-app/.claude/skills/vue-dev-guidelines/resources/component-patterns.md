# Vue 3 组件模式指南

## 🎯 目的

本指南提供Vue 3组件创建的最佳实践，包括单文件组件结构、组合式API使用、Props/Emits定义、生命周期管理和组件通信模式。

---

## 📋 单文件组件(SFC)结构

### ✅ 推荐结构

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Component } from 'vue'
import { ElButton, ElCard } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// Props 和 Emits 定义
interface Props {
  title: string
  description?: string
  loading?: boolean
}

interface Emits {
  (e: 'update', value: string): void
  (e: 'submit', data: any): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  loading: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const count = ref(0)
const isDisabled = computed(() => props.loading)

// 方法
const handleClick = () => {
  emit('click', count.value)
}

const handleSubmit = async (data: any) => {
  emit('submit', data)
}

// 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div class="custom-component">
    <el-card>
      <template #header>
        <h3>{{ props.title }}</h3>
      </template>
      
      <div class="component-content">
        <p v-if="props.description">{{ props.description }}</p>
        
        <el-button 
          :loading="props.loading"
          :disabled="isDisabled"
          type="primary"
          :icon="Plus"
          @click="handleClick"
        >
          点击我
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.custom-component {
  padding: 16px;
}

.component-content {
  margin-top: 16px;
}
</style>
```

### ❌ 避免的反模式

```vue
<!-- ❌ 错误：混合选项式API和组合式API -->
<script>
import { ref } from 'vue'

export default {
  name: 'BadComponent',
  props: {
    title: String
  },
  setup() {
    // ❌ 使用选项式API应该使用defineProps
    return {
      count: ref(0)
    }
  }
}
</script>
```

---

## 🔧 Props 和 Emits

### 🔹 定义Props

```vue
<script setup lang="ts">
import type { PropType } from 'vue'

// 基础类型
interface Props {
  // 必需属性
  userId: number
  name: string
  
  // 可选属性
  age?: number
  status?: 'active' | 'inactive' | 'banned'
  
  // 复杂对象类型
  config?: {
    theme: string
    settings: Record<string, any>
  }
  
  // 数组类型
  tags?: string[]
  
  // 函数类型
  onSubmit?: (data: FormData) => void
  
  // 只读属性
  readonly?: boolean
}

// 使用运行时默认值
const props = withDefaults(defineProps<Props>(), {
  age: 18,
  status: 'active',
  tags: [],
  readonly: false
})

// 或者使用PropType（更复杂的情况）
const props = defineProps({
  complexObject: {
    type: Object as PropType<object>,
    required: true,
    default: () => ({})
  }
})
</script>
```

### 🔹 定义Emits

```vue
<script setup lang="ts">
// 简单Emits
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()

// 复杂Emits
interface ComplexEmits {
  (e: 'data-change', data: any, isValid: boolean): void
  (e: 'error', error: Error, context: string): void
  (e: 'success', message?: string): void
}

const emit = defineEmits<ComplexEmits>()

// 使用emit
const updateValue = (newValue: string) => {
  emit('update', newValue)
}

const handleError = (error: Error, context: string) => {
  emit('error', error, context)
}
</script>
```

---

## 📊 响应式数据模式

### 🔹 使用 ref

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 基本类型
const count = ref(0)
const message = ref('Hello Vue 3')
const isVisible = ref(true)

// 对象类型
const user = ref({
  id: 1,
  name: 'John',
  email: 'john@example.com'
})

// 数组类型
const items = ref<string[]>(['item1', 'item2'])
const numbers = ref<number[]>([1, 2, 3])

// 条件类型
const isActive = ref(true)

// 响应式更新
const increment = () => {
  count.value++
  message.value = `Count is now ${count.value}`
}
</script>
```

### 🔹 使用 reactive

```vue
<script setup lang="ts">
import { reactive } from 'vue'

interface User {
  id: number
  name: string
  email: string
  profile: {
    avatar: string
    bio: string
  }
}

// 嵌始化reactive对象
const user = reactive<User>({
  id: 1,
  name: 'John',
  email: 'john@example.com',
  profile: {
    avatar: '',
    bio: ''
  }
})

// 响应式更新
const updateProfile = (avatar: string, bio: string) => {
  user.profile.avatar = avatar
  user.profile.bio = bio
}

// 🚨 错误：不要直接赋值整个reactive对象
// user = { ...user, id: 2 } // ❌ 这样会失去响应性
user.id = 2 // ✅ 正确
</script>
```

### 🔹 使用 computed

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')
const age = ref(25)

// 简单计算属性
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// 带缓存的计算属性
const isAdult = computed(() => age.value >= 18)

// 条件计算属性
const userStatus = computed(() => {
  if (age.value < 13) return 'child'
  if (age.value < 18) return 'teenager'
  return 'adult'
})

// 只读计算属性
const formattedAge = computed(() => `${age.value}岁`)
</script>
```

---

## 🔍 组件通信模式

### 🔹 Props传递

```vue
<!-- 父组件 -->
<template>
  <ChildComponent 
    :user="user" 
    :loading="isLoading"
    @submit="handleSubmit" 
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import ChildComponent from './ChildComponent.vue'

const user = ref({ name: 'John', age: 25 })
const isLoading = ref(false)

const handleSubmit = (data: any) => {
  console.log('Form submitted:', data)
}

const handleClose = () => {
  console.log('Modal closed')
}
</script>
```

### 🔹 Emits事件

```vue
<!-- 子组件 -->
<script setup lang="ts">
interface Props {
  title: string
  content: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: (data: FormData) => void
  cancel: () => void
}>()

const handleFormSubmit = (event: Event) => {
  emit('submit', { title: props.title, timestamp: Date.now() })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleFormSubmit">
    <h3>{{ props.title }}</h3>
    <p>{{ props.content }}</p>
    <button type="submit">提交</button>
    <button type="button" @click="handleCancel">取消</button>
  </form>
</template>
```

### 🔹 Provide/Inject

```vue
<!-- 父组件 -->
<template>
  <ChildComponent>
    <template #header>
      <h1>应用标题</h1>
    </template>
  </ChildComponent>
</template>

<!-- 子组件 -->
<template>
  <div class="child-component">
    <header class="header">
      <slot name="header"></slot>
      <nav>
        <slot name="navigation"></slot>
      </nav>
    </header>
    
    <main>
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
// 使用inject
const theme = inject('theme', 'light')
const config = inject('config', () => ({}))
</script>

<!-- 祖先组件 -->
<script setup lang="ts">
import { provide, ref } from 'vue'

const theme = ref('light')
const config = ref({ apiBase: 'https://api.example.com' })

provide('theme', theme)
provide('config', config)
</script>
```

---

## 🔄 生命周期钩子

### 🔸 组合式API钩子

```vue
<script setup lang="ts">
import { 
  ref, 
  onMounted, 
  onUnmounted, 
  onUpdated, 
  onBeforeMount,
  onBeforeUnmount 
} from 'vue'

const data = ref(null)
const timer = ref<number | null>(null)

// 组件挂载后
onMounted(() => {
  console.log('Component mounted')
  loadInitialData()
})

// 组件更新后
onUpdated(() => {
  console.log('Component updated')
})

// 组件卸载前
onBeforeUnmount(() => {
  console.log('Component will unmount')
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// 组件卸载后
onUnmounted(() => {
  console.log('Component unmounted')
})

const loadInitialData = async () => {
  // 加载初始数据
  data.value = await fetchInitialData()
}

const fetchInitialData = async () => {
  // 模拟API调用
  return { id: 1, name: 'Initial Data' }
}
</script>
```

### 🎯 异步组件

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const posts = ref([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    
    // 异步数据获取
    const response = await fetch('https://api.example.com/posts')
    posts.value = await response.json()
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误: {{ error }}</div>
  <div v-else>
    <div v-for="post in posts" :key="post.id">
      <h3>{{ post.title }}</h3>
      <p>{{ post.content }}</p>
    </div>
  </div>
</template>
```

---

## 🎨 组件设计模式

### 🔹 受控组件模式

```vue
<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  message?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认对话框',
  message: '确定要执行此操作吗？'
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleConfirm = () => {
  visible.value = false
  // 执行确认操作
}

const handleCancel = () => {
  visible.value = false
}
</script>

<template>
  <el-dialog 
    v-model="visible" 
    :title="props.title"
    width="30%"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <p>{{ props.message }}</p>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>
```

### 🔹 展槽模式

```vue
<script setup lang="ts">
interface Props {
  title: string
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<{
  close: (): void
  action: (action: string): void
}>()

const handleClose = () => {
  emit('close')
}

const handleAction = (action: string) => {
  emit('action', action)
}
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ props.title }}</h3>
        <div class="header-actions" v-if="props.showActions">
          <slot name="actions" :close="handleClose" :action="handleAction" />
        </div>
      </div>
    </template>
    
    <div class="card-content">
      <slot>默认内容</slot>
      
      <!-- 具名插槽 -->
      <div class="extra-info">
        <slot name="extra">额外信息</slot>
      </div>
      
      <!-- 作用域插槽 -->
      <slot name="footer" :loading="false">
        <div class="footer-actions">
          <el-button @click="handleAction('cancel')">取消</el-button>
          <el-button type="primary" @click="handleAction('confirm')">确认</el-button>
        </div>
      </slot>
    </div>
  </el-card>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  margin-top: 16px;
}

.extra-info {
  margin: 16px 0;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
```

---

## 📚 最佳实践

### ✅ 推荐做法

1. **类型安全**：总是为props和emits定义明确的接口
2. **组合式API**：优先使用`<script setup>`语法
3. **响应式优先**：使用`ref`而不是`reactive`，除非确实需要
4. **计算属性**：使用`computed`而不是方法处理派生数据
5. **生命周期**：只在必要时使用生命周期钩子
6. **样式隔离**：使用`scoped`样式避免样式污染
7. **组件拆分**：保持组件单一职责

### ❌ 避免做法

1. **混合API**：不要在组合式API中使用选项式API模式
2. **过度使用reactive**：对于简单值使用`ref`即可
3. **忽略类型**：所有数据都应有明确的类型定义
4. **副作用混乱**：将副作用逻辑放在专门的函数中
5. **深度watch**：避免监听深层对象变化
6. **样式全局**：避免使用全局样式影响其他组件

这些模式将帮助您创建高质量、可维护的Vue 3组件！