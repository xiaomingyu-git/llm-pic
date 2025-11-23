# Vue 3 Performance Optimization

## Reactive Performance

### Using ref vs reactive
```typescript
import { ref, reactive, shallowRef, shallowReactive } from 'vue';

// ✅ Use ref for primitive values
const count = ref(0);
const title = ref('');

// ✅ Use reactive for objects
const user = reactive({
  name: '',
  email: '',
  profile: {
    avatar: ''
  }
});

// ✅ Use shallowRef for large objects that don't need deep reactivity
const largeData = shallowRef<LargeDataType>(null);

// ✅ Use shallowReactive for top-level reactivity only
const config = shallowReactive({
  settings: { /* large nested object */ },
  metadata: { /* large nested object */ }
});
```

### Computed Properties Optimization
```typescript
import { computed } from 'vue';

// ✅ Memoize expensive calculations
const expensiveResult = computed(() => {
  // Complex calculation that should be cached
  return largeArray.filter(item => {
    return complexFilter(item);
  }).map(item => {
    return expensiveTransform(item);
  });
});

// ✅ Computed with getter and setter
const searchQuery = computed({
  get: () => filters.search,
  set: (value) => {
    filters.search = value.toLowerCase().trim();
  }
});
```

### Watchers Optimization
```typescript
import { watch, watchEffect } from 'vue';

// ✅ Watch specific properties instead of entire objects
watch(
  () => props.userId,
  (newId) => {
    loadUserData(newId);
  }
);

// ✅ Use flush: 'post' for DOM updates
watch(
  () => data.value,
  (newData) => {
    updateChart(newData);
  },
  { flush: 'post' }
);

// ✅ Use watchEffect for simple reactive effects
watchEffect(() => {
  document.title = `User: ${user.value.name}`;
});

// ❌ Avoid deep watching large objects
watch(
  largeObject,
  () => {
    // This will be expensive
  },
  { deep: true } // Avoid this for large objects
);
```

## Component Performance

### Lazy Loading Components
```vue
<script setup lang="ts">
// ✅ Lazy load heavy components
const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'));
const DataGrid = defineAsyncComponent(() => import('./DataGrid.vue'));

// ✅ With loading and error handling
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./ExpensiveComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
});
</script>
```

### Component Memoization
```vue
<script setup lang="ts">
import { computed } from 'vue';

// ✅ Memoize computed properties
const filteredItems = computed(() => {
  return items.value.filter(item => item.active);
});

// ✅ Use functional components for simple rendering
const SimpleItem = (props: { item: Item }) => {
  return h('div', { class: 'item' }, props.item.name);
};
</script>
```

### Virtual Scrolling
```vue
<template>
  <!-- For large lists, use virtual scrolling -->
  <el-virtual-list
    :data="largeItemList"
    :height="400"
    :item-size="50"
    #default="{ item, index }"
  >
    <div class="list-item">
      {{ item.name }} - {{ item.description }}
    </div>
  </el-virtual-list>
</template>
```

## Template Performance

### v-memo for Expensive Templates
```vue
<template>
  <!-- ✅ Memoize expensive template sections -->
  <div v-memo="[user.id, user.name]">
    <ExpensiveComponent :user="user" />
    <ComplexChart :data="user.analytics" />
  </div>
  
  <!-- ✅ Memoize list items when data doesn't change often -->
  <div
    v-for="item in staticItems"
    :key="item.id"
    v-memo="[item.id]"
  >
    {{ item.name }}
  </div>
</template>
```

### Conditional Rendering
```vue
<template>
  <!-- ✅ Use v-show for frequent toggling -->
  <div v-show="isVisible">
    Content that toggles frequently
  </div>
  
  <!-- ✅ Use v-if for expensive components that are conditionally rendered -->
  <ExpensiveComponent v-if="shouldLoad" />
  
  <!-- ✅ Avoid unnecessary re-renders with key optimization -->
  <UserList
    :users="users"
    :key="users.length"
  />
</template>
```

## Memory Management

### Cleanup in onUnmounted
```vue
<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

let intervalId: NodeJS.Timeout;
let eventSource: EventSource;

const data = ref([]);

// Setup
const setupData = () => {
  intervalId = setInterval(() => {
    // Periodic data update
  }, 5000);
  
  eventSource = new EventSource('/api/stream');
  eventSource.addEventListener('message', handleStreamData);
};

const handleStreamData = (event: MessageEvent) => {
  data.value.push(JSON.parse(event.data));
};

// ✅ Always cleanup resources
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  if (eventSource) {
    eventSource.close();
    eventSource.removeEventListener('message', handleStreamData);
  }
});

setupData();
</script>
```

### Avoid Memory Leaks
```vue
<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

const data = ref([]);

// ✅ Watch cleanup
const stopWatcher = watch(
  () => props.id,
  (newId) => {
    loadData(newId);
  }
);

// ✅ Event listener cleanup
const handleClick = () => {
  // Handle click
};

document.addEventListener('click', handleClick);

onUnmounted(() => {
  stopWatcher(); // Stop watcher
  document.removeEventListener('click', handleClick); // Remove event listener
});
</script>
```

## Network Performance

### API Optimization
```typescript
// composables/useApi.ts
import { ref } from 'vue';

export function useOptimizedApi<T>(fetcher: () => Promise<T>) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastFetchTime = ref(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const execute = async (force = false) => {
    const now = Date.now();
    
    // ✅ Return cached data if fresh
    if (!force && data.value && (now - lastFetchTime.value) < CACHE_DURATION) {
      return data.value;
    }

    loading.value = true;
    error.value = null;

    try {
      data.value = await fetcher();
      lastFetchTime.value = now;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }

    return data.value;
  };

  return { data, loading, error, execute };
}
```

### Debounced Search
```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDebounce } from '@/composables/useDebounce';

const searchQuery = ref('');
const results = ref([]);

// ✅ Debounced search
const debouncedQuery = useDebounce(searchQuery, 300);

watch(debouncedQuery, async (newQuery) => {
  if (newQuery.trim()) {
    results.value = await searchApi(newQuery);
  } else {
    results.value = [];
  }
});
</script>
```

## Bundle Optimization

### Dynamic Imports
```typescript
// ✅ Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/users',
    component: () => import('@/views/Users.vue')
  }
];

// ✅ Component-based lazy loading
const ModalComponent = defineAsyncComponent(() => 
  import('@/components/ModalComponent.vue')
);
```

### Tree Shaking
```typescript
// ✅ Import specific components
import { ElButton, ElInput } from 'element-plus';

// ✅ Import specific utilities
import { format, parseISO } from 'date-fns';

// ❌ Avoid importing entire libraries
// import * as ElementPlus from 'element-plus';
// import * as DateFns from 'date-fns';
```

## Performance Monitoring

### Performance Composable
```typescript
// composables/usePerformance.ts
export function usePerformance() {
  const measure = (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  };

  const measureAsync = async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  };

  return { measure, measureAsync };
}

// Usage
const { measureAsync } = usePerformance();

const loadUsers = async () => {
  await measureAsync('loadUsers', async () => {
    users.value = await userService.getAll();
  });
};
```

## Best Practices Summary

### Do's
- ✅ Use `shallowRef` and `shallowReactive` for large objects
- ✅ Memoize expensive computed properties
- ✅ Lazy load heavy components and routes
- ✅ Use virtual scrolling for large lists
- ✅ Debounce user input like search
- ✅ Cleanup resources in `onUnmounted`
- ✅ Use `v-memo` for expensive template sections
- ✅ Implement proper caching strategies

### Don'ts
- ❌ Create unnecessary reactivity with deep objects
- ❌ Watch entire objects when you only need specific properties
- ❌ Forget to cleanup event listeners and timers
- ❌ Load everything upfront - use code splitting
- ❌ Ignore memory management in long-lived components
- ❌ Make API calls without debouncing user input
- ❌ Use v-for with complex objects without keys
- ❌ Create unnecessary watchers

## Performance Checklist

### Component Performance
- [ ] Use `shallowRef` for large immutable objects
- [ ] Implement proper cleanup in `onUnmounted`
- [ ] Lazy load heavy components
- [ ] Use virtual scrolling for large lists
- [ ] Memoize expensive computed properties

### Rendering Performance
- [ ] Use `v-memo` for expensive template sections
- [ ] Prefer `v-show` over `v-if` for frequent toggling
- [ ] Add proper keys to `v-for` lists
- [ ] Avoid unnecessary watchers
- [ ] Use functional components for simple rendering

### Network Performance
- [ ] Implement API caching
- [ ] Debounce user input
- [ ] Use route-based code splitting
- [ ] Optimize bundle size with tree shaking
- [ ] Implement proper error handling

This performance guide provides comprehensive strategies for optimizing Vue 3 applications.