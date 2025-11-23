# Vue 3 Complete Examples

## Complete Feature Example: User Management

### File Structure
```
features/users/
├── components/
│   ├── UserList.vue
│   ├── UserForm.vue
│   └── UserCard.vue
├── composables/
│   └── useUsers.ts
├── services/
│   └── userService.ts
├── types/
│   └── user.types.ts
└── index.ts
```

### Type Definitions
```typescript
// features/users/types/user.types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: 'admin' | 'user';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  age: number;
  role: 'admin' | 'user';
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  age?: number;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface UserFilters {
  search: string;
  role: 'all' | 'admin' | 'user';
  status: 'all' | 'active' | 'inactive';
}
```

### Service Layer
```typescript
// features/users/services/userService.ts
import axios from 'axios';
import type { User, UserCreateRequest, UserUpdateRequest, UserFilters } from '../types/user.types';

const API_BASE = '/api/users';

export const userService = {
  // Get all users with filters
  async getAll(filters?: UserFilters): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role !== 'all') params.append('role', filters.role);
    if (filters?.status !== 'all') params.append('status', filters.status);

    const response = await axios.get<User[]>(`${API_BASE}?${params}`);
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
  },

  // Toggle user status
  async toggleStatus(id: number): Promise<User> {
    const response = await axios.patch<User>(`${API_BASE}/${id}/toggle-status`);
    return response.data;
  }
};
```

### Composable
```typescript
// features/users/composables/useUsers.ts
import { ref, reactive, computed, watch } from 'vue';
import { userService } from '../services/userService';
import type { User, UserCreateRequest, UserUpdateRequest, UserFilters } from '../types/user.types';

export function useUsers() {
  // State
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Filters
  const filters = reactive<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  });

  // Form state
  const userForm = reactive<UserCreateRequest>({
    name: '',
    email: '',
    age: 0,
    role: 'user'
  });

  // Dialog states
  const showCreateDialog = ref(false);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);

  // Computed properties
  const filteredUsers = computed(() => {
    let filtered = users.value;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }

    return filtered;
  });

  const userCount = computed(() => users.value.length);
  const activeUserCount = computed(() => users.value.filter(u => u.isActive).length);

  // Methods
  const loadUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
      users.value = await userService.getAll(filters);
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
      showCreateDialog.value = false;
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

  const updateUser = async (id: number, updates: UserUpdateRequest) => {
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
      showEditDialog.value = false;
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
      showDeleteDialog.value = false;
    } catch (err) {
      error.value = 'Failed to delete user';
      console.error('Delete user error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleUserStatus = async (id: number) => {
    try {
      const updatedUser = await userService.toggleStatus(id);
      const index = users.value.findIndex(u => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
    } catch (err) {
      error.value = 'Failed to toggle user status';
      console.error('Toggle status error:', err);
    }
  };

  const selectUser = (user: User) => {
    selectedUser.value = user;
  };

  const openCreateDialog = () => {
    resetForm();
    showCreateDialog.value = true;
  };

  const openEditDialog = (user: User) => {
    selectedUser.value = user;
    Object.assign(userForm, {
      name: user.name,
      email: user.email,
      age: user.age,
      role: user.role
    });
    showEditDialog.value = true;
  };

  const openDeleteDialog = (user: User) => {
    selectedUser.value = user;
    showDeleteDialog.value = true;
  };

  const resetForm = () => {
    Object.assign(userForm, {
      name: '',
      email: '',
      age: 0,
      role: 'user'
    });
  };

  const resetFilters = () => {
    Object.assign(filters, {
      search: '',
      role: 'all',
      status: 'all'
    });
  };

  // Watch filters for automatic reload
  watch([() => filters.search, () => filters.role, () => filters.status], 
    () => loadUsers(),
    { deep: true }
  );

  return {
    // State
    users,
    selectedUser,
    filteredUsers,
    loading,
    error,
    filters,
    userForm,
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    
    // Computed
    userCount,
    activeUserCount,
    
    // Methods
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    selectUser,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    resetForm,
    resetFilters
  };
}
```

### UserList Component
```vue
<!-- features/users/components/UserList.vue -->
<template>
  <div class="user-list">
    <!-- Filters -->
    <el-card class="filters-card">
      <template #header>
        <div class="filters-header">
          <h3>用户列表</h3>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>
      
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="filters.search"
            placeholder="搜索用户..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        
        <el-col :span="6">
          <el-select v-model="filters.role" placeholder="角色">
            <el-option label="全部" value="all" />
            <el-option label="管理员" value="admin" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-col>
        
        <el-col :span="6">
          <el-select v-model="filters.status" placeholder="状态">
            <el-option label="全部" value="all" />
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
        </el-col>
        
        <el-col :span="4">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- User Table -->
    <el-card>
      <el-table 
        :data="filteredUsers" 
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="age" label="年龄" width="80" />
        
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              size="small" 
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              @click="toggleUserStatus(row.id)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="openDeleteDialog(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <div class="table-footer">
          <span>共 {{ filteredUsers.length }} 个用户</span>
        </div>
      </template>
    </el-card>

    <!-- Create/Edit Dialog -->
    <UserForm
      v-model:visible="showCreateDialog || showEditDialog"
      :user="selectedUser"
      :is-edit="showEditDialog"
      @submit="handleSubmit"
      @cancel="resetForm"
    />

    <!-- Delete Confirmation -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除用户 "{{ selectedUser?.name }}" 吗？</p>
      
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">
          删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { 
  ElButton, ElCard, ElCol, ElDialog, ElIcon, ElInput, 
  ElOption, ElRow, ElSelect, ElTable, ElTableColumn, ElTag
} from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import { useUsers } from '../composables/useUsers';
import UserForm from './UserForm.vue';

const {
  users,
  filteredUsers,
  loading,
  error,
  filters,
  selectedUser,
  showCreateDialog,
  showEditDialog,
  showDeleteDialog,
  loadUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  openCreateDialog,
  openEditDialog,
  openDeleteDialog,
  resetForm,
  resetFilters
} = useUsers();

// Methods
const handleSubmit = async (userData: any) => {
  try {
    if (showEditDialog.value && selectedUser.value) {
      await updateUser(selectedUser.value.id, userData);
    } else {
      await createUser(userData);
    }
  } catch (err) {
    // Error handling in composable
  }
};

const confirmDelete = async () => {
  if (selectedUser.value) {
    try {
      await deleteUser(selectedUser.value.id);
    } catch (err) {
      // Error handling in composable
    }
  }
};

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.filters-card {
  margin-bottom: 20px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-footer {
  text-align: right;
  color: var(--el-text-color-secondary);
}
</style>
```

### UserForm Component
```vue
<!-- features/users/components/UserForm.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑用户' : '添加用户'"
    width="500px"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input 
          v-model="form.email" 
          type="email"
          placeholder="请输入邮箱" 
        />
      </el-form-item>
      
      <el-form-item label="年龄" prop="age">
        <el-input-number 
          v-model="form.age" 
          :min="1"
          :max="120"
          placeholder="请输入年龄"
        />
      </el-form-item>
      
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option label="用户" value="user" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button 
        type="primary" 
        :loading="loading"
        @click="handleSubmit"
      >
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import {
  ElButton, ElDialog, ElForm, ElFormItem, ElInput, 
  ElInputNumber, ElOption, ElSelect
} from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { User } from '../types/user.types';

interface Props {
  visible: boolean;
  user?: User | null;
  isEdit?: boolean;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
});

const emit = defineEmits<Emits>();

// Refs
const formRef = ref<FormInstance>();
const loading = ref(false);

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// Form data
const form = reactive({
  name: '',
  email: '',
  age: 0,
  role: 'user' as 'user' | 'admin'
});

// Validation rules
const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 120, message: '年龄必须在 1-120 之间', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

// Watch for user changes (edit mode)
watch(() => props.user, (newUser) => {
  if (newUser && props.isEdit) {
    Object.assign(form, {
      name: newUser.name,
      email: newUser.email,
      age: newUser.age,
      role: newUser.role
    });
  }
}, { immediate: true });

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    emit('submit', { ...form });
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

const handleCancel = () => {
  emit('cancel');
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// Reset form when dialog opens/closes
watch(() => props.visible, (visible) => {
  if (!visible && formRef.value) {
    formRef.value.resetFields();
  }
});
</script>
```

### Feature Index
```typescript
// features/users/index.ts
export { default as UserList } from './components/UserList.vue';
export { default as UserForm } from './components/UserForm.vue';

export { useUsers } from './composables/useUsers';
export { userService } from './services/userService';

export * from './types/user.types';
```

This complete example demonstrates a full-featured user management system following Vue 3 best practices with proper file organization, TypeScript integration, and Element Plus components.