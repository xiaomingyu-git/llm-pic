# Vue 3 性能优化指南

## 核心原则

通过组件懒加载、虚拟滚动、代码分割、缓存策略等技术手段，优化应用的加载速度、运行时性能和用户体验。

## 组件性能优化

### 组件懒加载

```typescript
// 路由级别的懒加载
const routes = [
  {
    path: '/users',
    component: () => import('@/views/UsersPage.vue')
  }
]

// 组件级别的懒加载
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 异步组件
const LazyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorMessage,
  delay: 200,
  timeout: 10000
})

// 带预加载的异步组件
const LazyComponentWithPreload = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  onError(error) {
    console.error('组件加载失败:', error)
  },
  suspensible: false
})
</script>

<template>
  <Suspense>
    <template #default>
      <LazyComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

### 组件缓存优化

```vue
<!-- 使用keep-alive缓存组件 -->
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedComponents" :max="10">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 需要缓存的组件名称列表
const cachedComponents = ref(['HomePage', 'UserList', 'ProductList'])

// 动态控制缓存
const shouldCache = computed(() => {
  return route.meta?.keepAlive !== false
})
</script>
```

### 减少不必要的响应式

```typescript
// 使用shallowRef减少深度响应式
import { shallowRef, triggerRef } from 'vue'

// 大型数据对象使用shallowRef
const largeData = shallowRef({
  users: [], // 数千条用户数据
  products: [], // 大量产品数据
  settings: {}
})

// 更新时手动触发
const updateUsers = (newUsers: User[]) => {
  largeData.value.users = newUsers
  triggerRef(largeData) // 手动触发更新
}

// 使用markRaw标记不需要响应式的对象
import { markRaw } from 'vue'

const staticConfig = markRaw({
  apiUrl: 'https://api.example.com',
  version: '1.0.0',
  features: ['feature1', 'feature2']
})

// 使用readonly防止意外修改
import { readonly } from 'vue'

const config = readonly(staticConfig)
```

### 组件卸载清理

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { eventBus } from '@/utils/eventBus'

// 定时器清理
const timer = ref<NodeJS.Timeout>()

onMounted(() => {
  timer.value = setInterval(() => {
    console.log('定时任务执行')
  }, 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// 事件监听清理
const handleResize = () => {
  console.log('窗口大小变化')
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  eventBus.on('data-update', handleDataUpdate)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  eventBus.off('data-update', handleDataUpdate)
})

// 请求取消
import { ref } from 'vue'
import axios from 'axios'

const abortController = ref<AbortController>()

const fetchData = async () => {
  // 取消之前的请求
  if (abortController.value) {
    abortController.value.abort()
  }

  abortController.value = new AbortController()

  try {
    const response = await axios.get('/api/data', {
      signal: abortController.value.signal
    })
    return response.data
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('请求失败:', error)
    }
  }
}

onUnmounted(() => {
  if (abortController.value) {
    abortController.value.abort()
  }
})
</script>
```

## 列表性能优化

### 虚拟滚动

```vue
<!-- LargeList.vue -->
<template>
  <div class="virtual-list-container" ref="containerRef" @scroll="handleScroll">
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }">
      <div class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          class="virtual-list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" :index="item.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
  overscan?: number // 预渲染项目数
}

const props = withDefaults(defineProps<Props>(), {
  overscan: 5
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(props.containerHeight)

// 计算总高度
const totalHeight = computed(() => props.items.length * props.itemHeight)

// 计算可见区域的起始和结束索引
const startIndex = computed(() => 
  Math.floor(scrollTop.value / props.itemHeight)
)

const endIndex = computed(() => 
  Math.min(
    startIndex.value + Math.ceil(containerHeight.value / props.itemHeight) + props.overscan,
    props.items.length - 1
  )
)

// 计算偏移量
const offsetY = computed(() => startIndex.value * props.itemHeight)

// 可见项目
const visibleItems = computed(() => 
  props.items.slice(startIndex.value, endIndex.value + 1).map((item, index) => ({
    ...item,
    index: startIndex.value + index
  }))
)

// 滚动处理
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

// 更新容器高度
const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

onMounted(() => {
  nextTick(() => {
    updateContainerHeight()
    window.addEventListener('resize', updateContainerHeight)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
})
</script>

<style lang="scss" scoped>
.virtual-list-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.virtual-list-phantom {
  position: relative;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-list-item {
  box-sizing: border-box;
}
</style>
```

### 虚拟滚动使用示例

```vue
<!-- UserList.vue -->
<template>
  <div class="user-list-page">
    <VirtualList
      :items="users"
      :item-height="60"
      :container-height="600"
      :overscan="3"
    >
      <template #default="{ item, index }">
        <div class="user-item">
          <el-avatar :src="item.avatar" :size="40" />
          <div class="user-info">
            <div class="user-name">{{ item.name }}</div>
            <div class="user-email">{{ item.email }}</div>
          </div>
          <div class="user-actions">
            <el-button size="small" @click="editUser(item)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteUser(item)">
              删除
            </el-button>
          </div>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VirtualList from '@/components/VirtualList.vue'
import { useUsers } from '@/composables/useUsers'

const { users, loading } = useUsers()

const editUser = (user: User) => {
  // 编辑用户逻辑
}

const deleteUser = (user: User) => {
  // 删除用户逻辑
}
</script>
```

## 数据获取优化

### 请求缓存和去重

```typescript
// composables/useCache.ts
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
  promise?: Promise<T>
}

class RequestCache {
  private cache = new Map<string, CacheItem<any>>()
  private pendingRequests = new Map<string, Promise<any>>()

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 5 * 60 * 1000 // 5分钟缓存
  ): Promise<T> {
    // 检查缓存
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.expiry) {
      return cached.data
    }

    // 检查是否有相同的请求正在进行
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending
    }

    // 发起新请求
    const promise = fetcher()
    this.pendingRequests.set(key, promise)

    try {
      const data = await promise
      
      // 缓存结果
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        expiry: ttl
      })
      
      return data
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  clearExpired() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp >= item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export const requestCache = new RequestCache()

// 定期清理过期缓存
setInterval(() => {
  requestCache.clearExpired()
}, 60 * 1000) // 每分钟清理一次
```

### 优化的数据获取Composable

```typescript
// composables/useOptimizedFetch.ts
import { ref, computed } from 'vue'
import { requestCache } from './useCache'

export function useOptimizedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    immediate?: boolean
    cacheTTL?: number
    refetchOnWindowFocus?: boolean
  } = {}
) {
  const {
    immediate = true,
    cacheTTL = 5 * 60 * 1000,
    refetchOnWindowFocus = false
  } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await requestCache.get(key, fetcher, cacheTTL)
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw err
    } finally {
      loading.value = false
    }
  }

  // 窗口聚焦时重新获取
  const handleFocus = () => {
    if (refetchOnWindowFocus && !loading.value) {
      execute()
    }
  }

  // 初始加载
  if (immediate) {
    execute()
  }

  // 注册焦点事件
  if (typeof window !== 'undefined' && refetchOnWindowFocus) {
    window.addEventListener('focus', handleFocus)
    
    onUnmounted(() => {
      window.removeEventListener('focus', handleFocus)
    })
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

### 分页数据优化

```typescript
// composables/useInfiniteScroll.ts
export function useInfiniteScroll<T>(
  fetcher: (page: number, pageSize: number) => Promise<T[]>,
  options: {
    pageSize?: number
    threshold?: number
    initialPage?: number
  } = {}
) {
  const {
    pageSize = 20,
    threshold = 100, // 距离底部多少像素时触发加载
    initialPage = 1
  } = options

  const items = ref<T[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(initialPage)
  const error = ref<Error | null>(null)

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    error.value = null

    try {
      const newItems = await fetcher(currentPage.value, pageSize)
      
      if (newItems.length < pageSize) {
        hasMore.value = false
      }
      
      items.value.push(...newItems)
      currentPage.value++
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Load failed')
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    items.value = []
    currentPage.value = initialPage
    hasMore.value = true
    loading.value = false
    error.value = null
  }

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}
```

## 图片和资源优化

### 图片懒加载

```vue
<!-- LazyImage.vue -->
<template>
  <div class="lazy-image" :style="{ width, height }">
    <img
      v-if="loaded"
      :src="src"
      :alt="alt"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
    />
    <div v-else-if="error" class="image-error">
      <slot name="error">
        <div class="error-placeholder">
          <i class="el-icon-picture-outline"></i>
          <span>加载失败</span>
        </div>
      </slot>
    </div>
    <div v-else class="image-placeholder">
      <slot name="placeholder">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="image" style="width: 100%; height: 100%" />
          </template>
        </el-skeleton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string
  alt?: string
  width?: string
  height?: string
  threshold?: number
  imageClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  width: '100%',
  height: 'auto',
  threshold: 100
})

const loaded = ref(false)
const error = ref(false)
const shouldLoad = ref(false)

const imageRef = ref<HTMLElement>()
const observer = ref<IntersectionObserver>()

const handleLoad = () => {
  loaded.value = true
}

const handleError = () => {
  error.value = true
}

onMounted(() => {
  if ('IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            shouldLoad.value = true
            observer.value?.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: `${props.threshold}px`
      }
    )

    if (imageRef.value) {
      observer.value.observe(imageRef.value)
    }
  } else {
    // 降级处理
    shouldLoad.value = true
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style lang="scss" scoped>
.lazy-image {
  display: inline-block;
  overflow: hidden;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s;
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  @include flex-center;
  background: $background-color-base;
}

.error-placeholder {
  @include flex-center(column);
  gap: $spacing-xs;
  color: $text-color-secondary;
}
</style>
```

### Web Workers使用

```typescript
// workers/dataProcessor.worker.ts
self.onmessage = function(event) {
  const { type, data } = event.data

  switch (type) {
    case 'PROCESS_LARGE_DATA':
      // 处理大量数据
      const processedData = data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }))
      
      self.postMessage({
        type: 'PROCESS_LARGE_DATA_RESULT',
        data: processedData
      })
      break

    case 'CALCULATE_STATISTICS':
      // 计算统计数据
      const stats = {
        total: data.length,
        average: data.reduce((sum: number, item: any) => sum + item.value, 0) / data.length,
        max: Math.max(...data.map((item: any) => item.value)),
        min: Math.min(...data.map((item: any) => item.value))
      }
      
      self.postMessage({
        type: 'CALCULATE_STATISTICS_RESULT',
        data: stats
      })
      break
  }
}

// 在Vue组件中使用
<script setup lang="ts">
const worker = ref<Worker>()

onMounted(() => {
  // 创建Web Worker
  worker.value = new Worker(new URL('../workers/dataProcessor.worker.ts', import.meta.url), {
    type: 'module'
  })

  worker.value.onmessage = (event) => {
    const { type, data } = event.data

    switch (type) {
      case 'PROCESS_LARGE_DATA_RESULT':
        console.log('数据处理完成:', data)
        break
      case 'CALCULATE_STATISTICS_RESULT':
        console.log('统计结果:', data)
        break
    }
  }
})

onUnmounted(() => {
  worker.value?.terminate()
})

const processData = (largeData: any[]) => {
  worker.value?.postMessage({
    type: 'PROCESS_LARGE_DATA',
    data: largeData
  })
}
</script>
```

## 内存优化

### 避免内存泄漏

```typescript
// composables/useMemoryLeakPrevention.ts
export function useMemoryLeakPrevention() {
  const timers = ref<NodeJS.Timeout[]>([])
  const observers = ref<IntersectionObserver[]>()
  const eventListeners = ref<Array<{
    target: EventTarget
    type: string
    listener: EventListener
    options?: boolean | AddEventListenerOptions
  }>>([])

  // 添加定时器
  const addTimer = (timer: NodeJS.Timeout) => {
    timers.value.push(timer)
  }

  // 添加观察者
  const addObserver = (observer: IntersectionObserver) => {
    if (!observers.value) {
      observers.value = []
    }
    observers.value.push(observer)
  }

  // 添加事件监听器
  const addEventListener = (
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options)
    eventListeners.value.push({ target, type, listener, options })
  }

  // 清理所有资源
  const cleanup = () => {
    // 清理定时器
    timers.value.forEach(timer => clearTimeout(timer))
    timers.value = []

    // 清理观察者
    observers.value?.forEach(observer => observer.disconnect())
    observers.value = []

    // 清理事件监听器
    eventListeners.value.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options)
    })
    eventListeners.value = []
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    addTimer,
    addObserver,
    addEventListener,
    cleanup
  }
}
```

### 对象池模式

```typescript
// utils/objectPool.ts
class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize = 100
  ) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  release(obj: T) {
    if (this.pool.length < this.maxSize) {
      this.resetFn?.(obj)
      this.pool.push(obj)
    }
  }

  clear() {
    this.pool = []
  }

  size() {
    return this.pool.length
  }
}

// 使用示例
const arrayPool = new ObjectPool<Array<any>>(
  () => [],
  (arr) => arr.length = 0
)

// 获取数组
const arr = arrayPool.acquire()
arr.push(1, 2, 3)

// 使用完成后归还
arrayPool.release(arr)
```

## 监控和分析

### 性能监控

```typescript
// utils/performance.ts
export class PerformanceMonitor {
  private marks = new Map<string, number>()
  private measures = new Map<string, number[]>()

  mark(name: string) {
    this.marks.set(name, performance.now())
  }

  measure(name: string, startMark: string, endMark?: string) {
    const startTime = this.marks.get(startMark)
    const endTime = endMark ? this.marks.get(endMark) : performance.now()

    if (startTime !== undefined) {
      const duration = endTime! - startTime
      const measures = this.measures.get(name) || []
      measures.push(duration)
      this.measures.set(name, measures)
      
      return duration
    }

    return 0
  }

  getStats(name: string) {
    const measures = this.measures.get(name) || []
    
    if (measures.length === 0) return null

    return {
      count: measures.length,
      average: measures.reduce((sum, val) => sum + val, 0) / measures.length,
      min: Math.min(...measures),
      max: Math.max(...measures),
      total: measures.reduce((sum, val) => sum + val, 0)
    }
  }

  clear() {
    this.marks.clear()
    this.measures.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()
```

### 内存使用监控

```typescript
// utils/memoryMonitor.ts
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    }
  }
  return null
}

export function startMemoryMonitoring(interval = 5000) {
  const memoryHistory: Array<{ timestamp: number; usage: any }> = []
  
  const monitor = setInterval(() => {
    const usage = getMemoryUsage()
    if (usage) {
      memoryHistory.push({
        timestamp: Date.now(),
        usage
      })
      
      // 保持最近100条记录
      if (memoryHistory.length > 100) {
        memoryHistory.shift()
      }
    }
  }, interval)

  const stop = () => {
    clearInterval(monitor)
  }

  return {
    memoryHistory,
    stop
  }
}
```

## 最佳实践

### 1. 组件优化
- 使用v-show代替v-if（频繁切换场景）
- 合理使用v-once（静态内容）
- 避免不必要的响应式
- 及时清理事件监听器和定时器

### 2. 列表优化
- 使用虚拟滚动处理大列表
- 合理设置key值
- 避免在模板中使用复杂计算

### 3. 数据获取
- 实现请求缓存和去重
- 使用分页和懒加载
- 合理设置请求超时

### 4. 资源加载
- 图片懒加载
- 代码分割和懒加载
- 使用CDN加速静态资源

### 5. 内存管理
- 避免内存泄漏
- 使用对象池复用对象
- 及时清理不再使用的引用

### 6. 性能监控
- 监控关键指标
- 定期进行性能分析
- 持续优化性能瓶颈