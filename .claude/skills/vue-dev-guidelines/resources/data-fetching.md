# Vue 3 Data Fetching & Reactivity

## Core Reactivity Patterns

### Primitive Values with ref()
```typescript
import { ref } from 'vue';

// Primitive reactive values
const count = ref<number>(0);
const title = ref<string>('');
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);

// Access with .value
count.value += 1;
title.value = 'New Title';
```

### Objects with reactive()
```typescript
import { reactive } from 'vue';

// Reactive objects
const user = reactive<User>({
  id: 1,
  name: 'John',
  email: 'john@example.com',
  profile: {
    age: 30,
    avatar: ''
  }
});

// Direct access (no .value needed)
user.name = 'Jane';
user.profile.age = 31;
```

### Computed Properties
```typescript
import { computed } from 'vue';

const fullName = computed(() => {
  return `${user.firstName} ${user.lastName}`;
});

const isAdult = computed(() => {
  return user.age >= 18;
});

// Read-only computed
const userSummary = computed(() => ({
  name: user.name,
  email: user.email,
  id: user.id
}));
```

## API Service Layer

### Service Structure
```typescript
// features/users/services/userService.ts
import axios from 'axios';
import type { User, UserCreateRequest, UserUpdateRequest } from '@/types';

const API_BASE = '/api/users';

export const userService = {
  // Get all users
  async getAll(): Promise<User[]> {
    const response = await axios.get<User[]>(API_BASE);
    return response.data;
  },

  // Get user by ID
  async getById(id: number): Promise<User> {
    const response = await axios.get<User>(`${API_BASE}/${id}`);
    return response.data;
  },

  // Create new user
  async create(userData: UserCreateRequest): Promise<User> {
    const response = await axios.post<User>(API_BASE, userData);
    return response.data;
  },

  // Update user
  async update(id: number, userData: UserUpdateRequest): Promise<User> {
    const response = await axios.put<User>(`${API_BASE}/${id}`, userData);
    return response.data;
  },

  // Delete user
  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE}/${id}`);
  }
};
```

### Composables for API Logic

### Basic Data Fetching Composable
```typescript
// composables/useApiData.ts
import { ref, computed } from 'vue';

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
      console.error('API Error:', err);
    } finally {
      loading.value = false;
    }
  };

  const isReady = computed(() => !loading.value && !error.value);
  const hasData = computed(() => data.value !== null);

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

### User Management Composable
```typescript
// features/users/composables/useUsers.ts
import { ref, reactive, computed } from 'vue';
import { userService } from '../services/userService';
import type { User, UserCreateRequest } from '@/types';

export function useUsers() {
  // State
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Form state
  const userForm = reactive<UserCreateRequest>({
    name: '',
    email: '',
    age: 0
  });

  // Computed properties
  const userCount = computed(() => users.value.length);
  const activeUsers = computed(() => 
    users.value.filter(user => user.isActive)
  );

  // Methods
  const loadUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
      users.value = await userService.getAll();
    } catch (err) {
      error.value = 'Failed to load users';
      console.error('Load users error:', err);
    } finally {
      loading.value = false;
    }
  };

  const createUser = async () => {
    loading.value = true;
    error.value = null;

    try {
      const newUser = await userService.create(userForm);
      users.value.push(newUser);
      resetForm();
      return newUser;
    } catch (err) {
      error.value = 'Failed to create user';
      console.error('Create user error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: number, updates: Partial<User>) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedUser = await userService.update(id, updates);
      const index = users.value.findIndex(u => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      if (selectedUser.value?.id === id) {
        selectedUser.value = updatedUser;
      }
      return updatedUser;
    } catch (err) {
      error.value = 'Failed to update user';
      console.error('Update user error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      await userService.delete(id);
      users.value = users.value.filter(u => u.id !== id);
      if (selectedUser.value?.id === id) {
        selectedUser.value = null;
      }
    } catch (err) {
      error.value = 'Failed to delete user';
      console.error('Delete user error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const selectUser = (user: User) => {
    selectedUser.value = user;
  };

  const resetForm = () => {
    Object.assign(userForm, {
      name: '',
      email: '',
      age: 0
    });
  };

  return {
    // State
    users,
    selectedUser,
    loading,
    error,
    userForm,
    
    // Computed
    userCount,
    activeUsers,
    
    // Methods
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    selectUser,
    resetForm
  };
}
```

## Advanced Patterns

### Pagination Composable
```typescript
// composables/usePagination.ts
import { ref, computed, watch } from 'vue';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  total?: number;
}

export function usePagination<T>(
  fetcher: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: PaginationOptions = {}
) {
  const page = ref(options.page || 1);
  const pageSize = ref(options.pageSize || 10);
  const total = ref(options.total || 0);
  const data = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value));
  const hasNextPage = computed(() => page.value < totalPages.value);
  const hasPrevPage = computed(() => page.value > 1);

  // Methods
  const loadPage = async (pageNum: number = page.value) => {
    if (pageNum < 1 || pageNum > totalPages.value) return;

    loading.value = true;
    error.value = null;

    try {
      const result = await fetcher(pageNum, pageSize.value);
      data.value = result.data;
      total.value = result.total;
      page.value = pageNum;
    } catch (err) {
      error.value = 'Failed to load page';
      console.error('Pagination error:', err);
    } finally {
      loading.value = false;
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) {
      loadPage(page.value + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage.value) {
      loadPage(page.value - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    loadPage(pageNum);
  };

  const setPageSize = (newSize: number) => {
    pageSize.value = newSize;
    page.value = 1; // Reset to first page
    loadPage();
  };

  // Initial load
  loadPage();

  return {
    // State
    data,
    page,
    pageSize,
    total,
    loading,
    error,
    
    // Computed
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Methods
    loadPage,
    nextPage,
    prevPage,
    goToPage,
    setPageSize
  };
}
```

### Search and Filter Composable
```typescript
// composables/useSearch.ts
import { ref, computed, watch } from 'vue';

export function useSearch<T>(
  items: Ref<T[]>,
  searchFn: (item: T, query: string) => boolean
) {
  const searchQuery = ref('');
  const searchResults = ref<T[]>([]);

  const filteredItems = computed(() => {
    if (!searchQuery.value.trim()) {
      return items.value;
    }
    
    return items.value.filter(item => 
      searchFn(item, searchQuery.value.toLowerCase())
    );
  });

  // Debounced search
  const debouncedSearch = ref('');
  let searchTimeout: NodeJS.Timeout;

  watch(searchQuery, (newQuery) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      debouncedSearch.value = newQuery;
    }, 300); // 300ms debounce
  });

  watch([items, debouncedSearch], ([newItems, newQuery]) => {
    if (!newQuery.trim()) {
      searchResults.value = newItems;
    } else {
      searchResults.value = newItems.filter(item => 
        searchFn(item, newQuery.toLowerCase())
      );
    }
  });

  const clearSearch = () => {
    searchQuery.value = '';
    debouncedSearch.value = '';
  };

  return {
    searchQuery,
    searchResults,
    filteredItems,
    clearSearch
  };
}

// Usage example
const users = ref<User[]>([]);
const { searchQuery, searchResults, clearSearch } = useSearch(users, (user, query) => 
  user.name.toLowerCase().includes(query) || 
  user.email.toLowerCase().includes(query)
);
```

## Error Handling Patterns

### Global Error Handler
```typescript
// utils/errorHandler.ts
import { ElMessage, ElNotification } from 'element-plus';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = {
  handle(error: unknown) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          ElMessage.error('请求参数错误');
          break;
        case 401:
          ElMessage.error('未授权，请重新登录');
          // Redirect to login
          break;
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(error.message || '未知错误');
      }
    } else if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('发生未知错误');
    }

    console.error('Error handled:', error);
  },

  notify(message: string, type: 'success' | 'warning' | 'info' = 'info') {
    ElNotification({
      title: type === 'success' ? '成功' : '提示',
      message,
      type
    });
  }
};
```

### Enhanced Service with Error Handling
```typescript
// services/baseService.ts
import axios from 'axios';
import { ApiError, errorHandler } from '@/utils/errorHandler';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      throw new ApiError(
        data.message || 'API Error',
        status,
        data.code
      );
    } else if (error.request) {
      throw new ApiError('Network Error');
    } else {
      throw new ApiError('Request Error');
    }
  }
);

export { apiClient };
```

## Real-time Data

### WebSocket Composable
```typescript
// composables/useWebSocket.ts
import { ref, onUnmounted } from 'vue';

export function useWebSocket(url: string) {
  const socket = ref<WebSocket | null>(null);
  const connected = ref(false);
  const data = ref<any>(null);
  const error = ref<string | null>(null);

  const connect = () => {
    try {
      socket.value = new WebSocket(url);
      
      socket.value.onopen = () => {
        connected.value = true;
        error.value = null;
        console.log('WebSocket connected');
      };
      
      socket.value.onmessage = (event) => {
        try {
          data.value = JSON.parse(event.data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      socket.value.onclose = () => {
        connected.value = false;
        console.log('WebSocket disconnected');
      };
      
      socket.value.onerror = (err) => {
        error.value = 'WebSocket error';
        console.error('WebSocket error:', err);
      };
    } catch (err) {
      error.value = 'Failed to connect WebSocket';
      console.error('WebSocket connection error:', err);
    }
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
  };

  const send = (message: any) => {
    if (socket.value && connected.value) {
      socket.value.send(JSON.stringify(message));
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect();
  });

  return {
    connected,
    data,
    error,
    connect,
    disconnect,
    send
  };
}
```

## Best Practices

### Do's
- ✅ Use composables for reusable logic
- ✅ Handle loading and error states
- ✅ Use TypeScript interfaces for API responses
- ✅ Implement proper error handling
- ✅ Use computed properties for derived data
- ✅ Debounce search input
- ✅ Cleanup resources in `onUnmounted`

### Don'ts
- ❌ Ignore error states
- ❌ Mix API logic with component logic
- ❌ Forget to handle loading states
- ❌ Use any types for API responses
- ❌ Make API calls without proper error handling
- ❌ Leave connections open without cleanup