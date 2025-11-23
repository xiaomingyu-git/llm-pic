# Vue 3 Common Patterns

## Form Patterns

### Basic Form with Validation
```vue
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="form.username"
        placeholder="请输入用户名"
        clearable
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="form.email"
        type="email"
        placeholder="请输入邮箱"
        clearable
      />
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        show-password
        clearable
      />
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="form.confirmPassword"
        type="password"
        placeholder="请确认密码"
        show-password
        clearable
      />
    </el-form-item>

    <el-form-item label="角色" prop="role">
      <el-select v-model="form.role" placeholder="请选择角色">
        <el-option label="管理员" value="admin" />
        <el-option label="用户" value="user" />
      </el-select>
    </el-form-item>

    <el-form-item label="状态" prop="isActive">
      <el-switch v-model="form.isActive" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        提交
      </el-button>
      <el-button @click="resetForm">重置</el-button>
      <el-button type="info" @click="fillSampleData">填充示例</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  isActive: boolean;
}

// Form ref
const formRef = ref<FormInstance>();
const loading = ref(false);

// Form data
const form = reactive<FormData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  isActive: true
});

// Validation rules
const rules: FormRules<FormData> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;
    
    // Submit logic here
    console.log('Form submitted:', form);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('提交成功！');
  } catch (error) {
    console.error('Validation failed:', error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

const fillSampleData = () => {
  Object.assign(form, {
    username: 'john_doe',
    email: 'john@example.com',
    password: '123456',
    confirmPassword: '123456',
    role: 'user',
    isActive: true
  });
};
</script>
```

## Modal/Dialog Patterns

### Basic Modal
```vue
<!-- components/ConfirmDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="400px"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <el-icon class="warning-icon"><WarningFilled /></el-icon>
      <p>{{ message }}</p>
    </div>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  message: '您确定要执行此操作吗？',
  confirmText: '确认',
  cancelText: '取消',
  type: 'warning'
});

const emit = defineEmits<Emits>();

const loading = ref(false);

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const handleClose = () => {
  emit('cancel');
};

const handleConfirm = async () => {
  loading.value = true;
  try {
    await emit('confirm');
  } finally {
    loading.value = false;
    visible.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
  visible.value = false;
};
</script>

<style scoped>
.dialog-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.warning-icon {
  font-size: 24px;
  color: var(--el-color-warning);
}
</style>
```

### Modal Composable
```typescript
// composables/useModal.ts
import { ref } from 'vue';

interface ModalOptions {
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function useModal() {
  const modalVisible = ref(false);
  const modalOptions = ref<ModalOptions>({});

  const showModal = (options: ModalOptions = {}) => {
    modalOptions.value = {
      title: '提示',
      message: '',
      type: 'info',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      ...options
    };
    modalVisible.value = true;
  };

  const hideModal = () => {
    modalVisible.value = false;
  };

  const confirm = (): Promise<boolean> => {
    return new Promise((resolve) => {
      showModal({
        message: '确定要执行此操作吗？',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  return {
    modalVisible,
    modalOptions,
    showModal,
    hideModal,
    confirm
  };
}
```

## Table Patterns

### Data Table with Actions
```vue
<template>
  <div class="data-table">
    <!-- Table Header -->
    <div class="table-header">
      <div class="header-left">
        <h3>用户列表</h3>
        <span class="total-count">共 {{ tableData.length }} 条记录</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchText"
          placeholder="搜索用户..."
          clearable
          style="width: 200px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>
    </div>

    <!-- Table -->
    <el-table
      :data="filteredData"
      v-loading="loading"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" sortable />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '活跃' : '非活跃' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
          <el-dropdown @command="handleCommand($event, row)">
            <el-button size="small">
              更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="view">查看详情</el-dropdown-item>
                <el-dropdown-item command="reset">重置密码</el-dropdown-item>
                <el-dropdown-item command="toggle" divided>
                  {{ row.status === 'active' ? '禁用' : '启用' }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- Table Footer -->
    <div class="table-footer">
      <div class="footer-left">
        <el-button
          size="small"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
      <div class="footer-right">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, ArrowDown } from '@element-plus/icons-vue';
import type { User } from '@/types';

// State
const loading = ref(false);
const searchText = ref('');
const tableData = ref<User[]>([]);
const selectedRows = ref<User[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

// Computed
const filteredData = computed(() => {
  if (!searchText.value) return tableData.value;
  
  return tableData.value.filter(item => 
    item.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    item.email.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// Methods
const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection;
};

const handleAdd = () => {
  // Add user logic
  console.log('Add user');
};

const handleEdit = (row: User) => {
  // Edit user logic
  console.log('Edit user:', row);
};

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // Delete logic here
    ElMessage.success('删除成功');
  } catch {
    // User cancelled
  }
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // Batch delete logic here
    ElMessage.success('批量删除成功');
  } catch {
    // User cancelled
  }
};

const handleCommand = async (command: string, row: User) => {
  switch (command) {
    case 'view':
      console.log('View user:', row);
      break;
    case 'reset':
      console.log('Reset password:', row);
      break;
    case 'toggle':
      console.log('Toggle status:', row);
      break;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadData();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  loadData();
};

const getRoleTagType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'danger',
    moderator: 'warning',
    user: 'primary'
  };
  return types[role] || 'info';
};

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '管理员',
    moderator: '版主',
    user: '用户'
  };
  return texts[role] || role;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

const loadData = async () => {
  loading.value = true;
  try {
    // Load data logic
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.total-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
```

## Authentication Patterns

### Auth Composable
```typescript
// composables/useAuth.ts
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';

export function useAuth() {
  const router = useRouter();
  
  const user = ref(null);
  const token = ref(localStorage.getItem('authToken'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || 'guest');

  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);
      
      user.value = response.user;
      token.value = response.token;
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      await router.push('/dashboard');
      
      return response;
    } catch (err) {
      error.value = '登录失败，请检查用户名和密码';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      await router.push('/login');
    }
  };

  const refreshToken = async () => {
    if (!token.value) return;

    try {
      const response = await authService.refreshToken();
      token.value = response.token;
      localStorage.setItem('authToken', response.token);
    } catch (err) {
      await logout();
    }
  };

  const checkAuth = () => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
      return true;
    }
    
    return false;
  };

  const hasRole = (roles: string | string[]) => {
    const targetRoles = Array.isArray(roles) ? roles : [roles];
    return targetRoles.includes(userRole.value);
  };

  const hasPermission = (permission: string) => {
    return user.value?.permissions?.includes(permission) || false;
  };

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userRole,
    
    // Methods
    login,
    logout,
    refreshToken,
    checkAuth,
    hasRole,
    hasPermission
  };
}
```

## Error Handling Patterns

### Error Boundary Component
```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <el-result
      icon="error"
      title="出现错误"
      :sub-title="errorMessage"
    >
      <template #extra>
        <el-button type="primary" @click="retry">
          重试
        </el-button>
        <el-button @click="goHome">
          返回首页
        </el-button>
      </template>
    </el-result>
    
    <el-collapse v-if="showDetails" class="error-details">
      <el-collapse-item title="错误详情" name="details">
        <pre>{{ errorStack }}</pre>
      </el-collapse-item>
    </el-collapse>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const error = ref<Error | null>(null);
const showDetails = ref(false);

const errorMessage = computed(() => {
  if (!error.value) return '';
  
  if (error.value.message.includes('Network Error')) {
    return '网络连接失败，请检查网络连接';
  }
  
  if (error.value.message.includes('404')) {
    return '请求的资源不存在';
  }
  
  if (error.value.message.includes('403')) {
    return '您没有权限访问此资源';
  }
  
  return error.value.message || '发生未知错误';
});

const errorStack = computed(() => {
  return error.value?.stack || 'No stack trace available';
});

onErrorCaptured((err) => {
  error.value = err;
  console.error('Error captured:', err);
  return false;
});

const retry = () => {
  error.value = null;
};

const goHome = () => {
  router.push('/');
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<style scoped>
.error-boundary {
  padding: 40px 20px;
}

.error-details {
  margin-top: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.error-details pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
```

## Best Practices

### Do's
- ✅ Use proper TypeScript interfaces for all data
- ✅ Implement loading and error states
- ✅ Use composables for reusable logic
- ✅ Handle form validation properly
- ✅ Add confirmation dialogs for destructive actions
- ✅ Implement proper error boundaries
- ✅ Use Element Plus components consistently
- ✅ Add proper accessibility attributes

### Don'ts
- ❌ Ignore error handling
- ❌ Skip loading states
- ❌ Hardcode UI text
- ❌ Forget to cleanup event listeners
- ❌ Use any types without proper justification
- ❌ Skip form validation
- ❌ Mix business logic with presentation
- ❌ Ignore accessibility concerns

These common patterns provide a solid foundation for building consistent and maintainable Vue 3 applications.