# Vue 3 完整示例指南

## 核心原则

通过完整的项目示例，展示Vue 3 + TypeScript + Element Plus的实际应用，涵盖常见的业务场景和最佳实践。

## 用户管理系统示例

### 完整的用户管理页面

```vue
<!-- src/views/UsersPage.vue -->
<template>
  <div class="users-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">用户管理</h1>
        <p class="page-description">管理系统中的所有用户账户</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新增用户
        </el-button>
        <el-button :icon="Download" @click="handleExport">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <div class="search-section">
      <SearchForm
        :fields="searchFields"
        v-model="searchParams"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <DataTable
        ref="tableRef"
        :data="users"
        :columns="tableColumns"
        :loading="loading"
        :pagination="pagination"
        selectable
        show-index
        @selection-change="handleSelectionChange"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @refresh="refreshData"
      >
        <template #toolbar>
          <el-button
            type="danger"
            :disabled="selectedUsers.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedUsers.length }})
          </el-button>
        </template>

        <!-- 头像列 -->
        <template #cell-avatar="{ row }">
          <el-avatar :src="row.avatar" :size="40">
            {{ row.firstName.charAt(0) }}{{ row.lastName.charAt(0) }}
          </el-avatar>
        </template>

        <!-- 状态列 -->
        <template #cell-status="{ row }">
          <el-tag
            :type="getStatusType(row.status)"
            @click="toggleUserStatus(row)"
          >
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>

        <!-- 角色列 -->
        <template #cell-roles="{ row }">
          <el-tag
            v-for="role in row.roles"
            :key="role.id"
            size="small"
            class="mr-1"
          >
            {{ role.displayName }}
          </el-tag>
        </template>

        <!-- 操作列 -->
        <template #cell-actions="{ row, index }">
          <el-button size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button size="small" type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            size="small"
            type="warning"
            @click="handleResetPassword(row)"
          >
            重置密码
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(row, index)"
          >
            删除
          </el-button>
        </template>
      </DataTable>
    </div>

    <!-- 用户表单对话框 -->
    <BaseDialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
      :loading="formLoading"
      @confirm="handleFormSubmit"
      @cancel="handleFormCancel"
    >
      <UserForm
        ref="userFormRef"
        :initial-data="currentUser"
        :loading="formLoading"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </BaseDialog>

    <!-- 用户详情对话框 -->
    <BaseDialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="800px"
      :show-default-footer="false"
    >
      <UserDetail :user="currentUser" @edit="handleEditFromDetail" />
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download } from '@element-plus/icons-vue'
import type { User, UserFormData, UserSearchParams } from '@/types/user'
import type { PaginationParams } from '@/types/common'
import DataTable from '@/components/DataTable.vue'
import SearchForm from '@/components/SearchForm.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import UserForm from '@/components/UserForm.vue'
import UserDetail from '@/components/UserDetail.vue'
import { useUsers } from '@/features/users/composables/useUsers'
import { useDialog } from '@/composables/useDialog'

// 用户管理composable
const {
  users,
  loading,
  pagination,
  selectedUsers,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword
} = useUsers()

// 表格引用
const tableRef = ref()

// 对话框状态
const formDialog = useDialog<User>()
const detailDialog = useDialog<User>()

// 计算属性
const formDialogVisible = computed(() => formDialog.visible)
const detailDialogVisible = computed(() => detailDialog.visible)
const formLoading = computed(() => formDialog.loading)
const currentUser = computed(() => formDialog.data || detailDialog.data)
const isEdit = computed(() => !!formDialog.data?.id)

// 搜索参数
const searchParams = ref<UserSearchParams>({})

// 搜索字段配置
const searchFields = [
  {
    prop: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '用户名、邮箱、手机号'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  },
  {
    prop: 'dateRange',
    label: '创建时间',
    type: 'dateRange'
  }
]

// 表格列配置
const tableColumns = [
  {
    prop: 'avatar',
    label: '头像',
    width: 80,
    align: 'center'
  },
  {
    prop: 'username',
    label: '用户名',
    width: 120,
    sortable: true
  },
  {
    prop: 'fullName',
    label: '姓名',
    width: 120
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 180
  },
  {
    prop: 'phone',
    label: '手机号',
    width: 130
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    type: 'status'
  },
  {
    prop: 'roles',
    label: '角色',
    minWidth: 150
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 160,
    sortable: true,
    formatter: (row) => formatDate(row.createdAt)
  },
  {
    prop: 'actions',
    label: '操作',
    width: 280,
    fixed: 'right'
  }
]

// 页面初始化
onMounted(() => {
  loadUsers()
})

// 加载用户数据
const loadUsers = async () => {
  const params: UserSearchParams & PaginationParams = {
    ...searchParams.value,
    page: pagination.value.current,
    pageSize: pagination.value.pageSize
  }
  await fetchUsers(params)
}

// 搜索处理
const handleSearch = (params: UserSearchParams) => {
  searchParams.value = params
  pagination.value.current = 1
  loadUsers()
}

// 重置搜索
const handleReset = () => {
  searchParams.value = {}
  pagination.value.current = 1
  loadUsers()
}

// 刷新数据
const refreshData = () => {
  loadUsers()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.current = 1
  loadUsers()
}

const handleCurrentChange = (current: number) => {
  pagination.value.current = current
  loadUsers()
}

// 选择变化处理
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 新增用户
const handleCreate = () => {
  formDialog.open()
}

// 编辑用户
const handleEdit = (user: User) => {
  formDialog.open(user)
}

// 从详情页编辑
const handleEditFromDetail = (user: User) => {
  detailDialog.close()
  formDialog.open(user)
}

// 查看用户详情
const handleView = (user: User) => {
  detailDialog.open(user)
}

// 表单提交处理
const handleFormSubmit = async (formData: UserFormData) => {
  try {
    formDialog.setLoading(true)

    if (isEdit.value) {
      await updateUser(currentUser.value!.id, formData)
      ElMessage.success('用户更新成功')
    } else {
      await createUser(formData)
      ElMessage.success('用户创建成功')
    }

    formDialog.close()
    refreshData()
  } catch (error) {
    console.error('表单提交失败:', error)
  } finally {
    formDialog.setLoading(false)
  }
}

// 表单取消处理
const handleFormCancel = () => {
  formDialog.close()
}

// 删除用户
const handleDelete = async (user: User, index: number) => {
  const confirmed = await ElMessageBox.confirm(
    `确定要删除用户 "${user.fullName}" 吗？`,
    '确认删除',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  )

  if (confirmed) {
    try {
      await deleteUser(user.id)
      ElMessage.success('用户删除成功')
      refreshData()
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) return

  const confirmed = await ElMessageBox.confirm(
    `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
    '批量删除',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  )

  if (confirmed) {
    try {
      const promises = selectedUsers.value.map(user => deleteUser(user.id))
      await Promise.all(promises)
      
      ElMessage.success(`成功删除 ${selectedUsers.value.length} 个用户`)
      refreshData()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }
}

// 重置密码
const handleResetPassword = async (user: User) => {
  const confirmed = await ElMessageBox.confirm(
    `确定要重置用户 "${user.fullName}" 的密码吗？`,
    '重置密码',
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  )

  if (confirmed) {
    try {
      await resetUserPassword(user.id)
      ElMessage.success('密码重置成功，新密码已发送到用户邮箱')
    } catch (error) {
      console.error('重置密码失败:', error)
    }
  }
}

// 切换用户状态
const toggleUserStatus = async (user: User) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    await updateUser(user.id, { status: newStatus })
    
    ElMessage.success(
      newStatus === 'active' ? '用户已启用' : '用户已禁用'
    )
    refreshData()
  } catch (error) {
    console.error('切换用户状态失败:', error)
  }
}

// 导出数据
const handleExport = async () => {
  try {
    // 调用导出API
    // await exportUsers(searchParams.value)
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('数据导出失败:', error)
  }
}

// 工具函数
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    pending: 'warning'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    pending: '待激活'
  }
  return textMap[status] || status
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.users-page {
  padding: $spacing-lg;
  background: $background-color-lighter;
  min-height: 100vh;
}

.page-header {
  @include flex-between;
  margin-bottom: $spacing-lg;
  padding: $spacing-lg;
  background: white;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;

  .header-left {
    .page-title {
      margin: 0 0 $spacing-xs 0;
      font-size: $font-size-extra-large;
      font-weight: $font-weight-primary;
      color: $text-color-primary;
    }

    .page-description {
      margin: 0;
      font-size: $font-size-base;
      color: $text-color-secondary;
    }
  }

  .header-right {
    @include flex-center;
    gap: $spacing-sm;
  }
}

.search-section {
  margin-bottom: $spacing-lg;
}

.table-section {
  background: white;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;
  overflow: hidden;
}

.mr-1 {
  margin-right: $spacing-xs;
}
</style>
```

### 用户表单组件

```vue
<!-- src/components/UserForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    @submit.prevent="handleSubmit"
  >
    <!-- 基础信息 -->
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="formData.username"
        placeholder="请输入用户名"
        :disabled="isEdit"
        clearable
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="formData.email"
        type="email"
        placeholder="请输入邮箱"
        clearable
      />
    </el-form-item>

    <el-form-item label="手机号" prop="phone">
      <el-input
        v-model="formData.phone"
        placeholder="请输入手机号"
        clearable
      />
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="姓" prop="firstName">
          <el-input
            v-model="formData.firstName"
            placeholder="请输入姓"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="名" prop="lastName">
          <el-input
            v-model="formData.lastName"
            placeholder="请输入名"
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 密码字段（仅新增时显示） -->
    <template v-if="!isEdit">
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
          clearable
        />
      </el-form-item>
    </template>

    <!-- 角色选择 -->
    <el-form-item label="角色" prop="roleIds">
      <el-select
        v-model="formData.roleIds"
        placeholder="请选择角色"
        multiple
        clearable
        style="width: 100%"
      >
        <el-option
          v-for="role in availableRoles"
          :key="role.id"
          :label="role.displayName"
          :value="role.id"
        />
      </el-select>
    </el-form-item>

    <!-- 头像上传 -->
    <el-form-item label="头像">
      <el-upload
        class="avatar-uploader"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
        :on-success="handleAvatarSuccess"
        action="/api/upload"
      >
        <img v-if="formData.avatar" :src="formData.avatar" class="avatar">
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
    </el-form-item>

    <!-- 备注 -->
    <el-form-item label="备注">
      <el-input
        v-model="formData.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注信息"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import type { User, UserFormData, UserRole } from '@/types/user'

interface Props {
  initialData?: Partial<User>
  loading?: boolean
}

interface Emits {
  submit: [data: UserFormData]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const availableRoles = ref<UserRole[]>([])

// 表单数据
const formData = reactive<UserFormData>({
  username: '',
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  roleIds: [],
  avatar: '',
  remark: ''
})

// 计算属性
const isEdit = computed(() => !!props.initialData?.id)

// 表单验证规则
const formRules = computed((): FormRules<UserFormData> => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  firstName: [
    { required: true, message: '请输入姓', trigger: 'blur' },
    { min: 1, max: 10, message: '姓长度在 1 到 10 个字符', trigger: 'blur' }
  ],
  lastName: [
    { required: true, message: '请输入名', trigger: 'blur' },
    { min: 1, max: 10, message: '名长度在 1 到 10 个字符', trigger: 'blur' }
  ],
  password: [
    { 
      required: true, 
      message: '请输入密码', 
      trigger: 'blur' 
    },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, 
      message: '密码必须包含大小写字母和数字', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个角色', trigger: 'change' }
  ]
}))

// 初始化表单数据
const initFormData = () => {
  if (props.initialData) {
    Object.assign(formData, {
      username: props.initialData.username || '',
      email: props.initialData.email || '',
      phone: props.initialData.phone || '',
      firstName: props.initialData.firstName || '',
      lastName: props.initialData.lastName || '',
      password: '',
      confirmPassword: '',
      roleIds: props.initialData.roles?.map(role => role.id) || [],
      avatar: props.initialData.avatar || '',
      remark: props.initialData.remark || ''
    })
  } else {
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    roleIds: [],
    avatar: '',
    remark: ''
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  const isValid = await formRef.value.validate()
  if (isValid) {
    emit('submit', { ...formData })
  }
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 头像上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  formData.avatar = response.data.url
  ElMessage.success('头像上传成功')
}

// 加载可用角色
const loadAvailableRoles = async () => {
  try {
    const response = await roleService.getRoles()
    availableRoles.value = response.data
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 监听初始数据变化
watch(
  () => props.initialData,
  () => {
    initFormData()
  },
  { immediate: true, deep: true }
)

// 初始化
loadAvailableRoles()

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  getFormData: () => ({ ...formData })
})
</script>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}
</style>
```

## 仪表板示例

### 完整的仪表板页面

```vue
<!-- src/views/DashboardPage.vue -->
<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <StatCard
            title="总用户数"
            :value="stats.totalUsers"
            :trend="stats.userTrend"
            icon="user"
            color="primary"
          />
        </el-col>
        <el-col :span="6">
          <StatCard
            title="活跃用户"
            :value="stats.activeUsers"
            :trend="stats.activeTrend"
            icon="user-active"
            color="success"
          />
        </el-col>
        <el-col :span="6">
          <StatCard
            title="今日订单"
            :value="stats.todayOrders"
            :trend="stats.orderTrend"
            icon="order"
            color="warning"
          />
        </el-col>
        <el-col :span="6">
          <StatCard
            title="总收入"
            :value="stats.totalRevenue"
            :trend="stats.revenueTrend"
            icon="revenue"
            color="danger"
            format="currency"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 用户增长趋势 -->
        <el-col :span="12">
          <ChartCard title="用户增长趋势">
            <div ref="userGrowthChartRef" class="chart-container"></div>
          </ChartCard>
        </el-col>

        <!-- 订单统计 -->
        <el-col :span="12">
          <ChartCard title="订单统计">
            <div ref="orderChartRef" class="chart-container"></div>
          </ChartCard>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格区域 -->
    <div class="tables-section">
      <el-row :gutter="20">
        <!-- 最新用户 -->
        <el-col :span="12">
          <TableCard
            title="最新用户"
            :data="recentUsers"
            :columns="userColumns"
            :loading="usersLoading"
          />
        </el-col>

        <!-- 最新订单 -->
        <el-col :span="12">
          <TableCard
            title="最新订单"
            :data="recentOrders"
            :columns="orderColumns"
            :loading="ordersLoading"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 活动日志 -->
    <div class="logs-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>活动日志</span>
            <el-button type="text" @click="viewAllLogs">查看全部</el-button>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="log in activityLogs"
            :key="log.id"
            :timestamp="formatDate(log.timestamp)"
            :type="log.type"
          >
            <div class="log-content">
              <span class="log-user">{{ log.user }}</span>
              <span class="log-action">{{ log.action }}</span>
              <span class="log-target">{{ log.target }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import StatCard from '@/components/StatCard.vue'
import ChartCard from '@/components/ChartCard.vue'
import TableCard from '@/components/TableCard.vue'
import { useDashboard } from '@/composables/useDashboard'
import { formatDate } from '@/utils/format'

const router = useRouter()

// 仪表板数据
const {
  stats,
  recentUsers,
  recentOrders,
  activityLogs,
  usersLoading,
  ordersLoading,
  loadDashboardData
} = useDashboard()

// 图表引用
const userGrowthChartRef = ref<HTMLElement>()
const orderChartRef = ref<HTMLElement>()

// 用户表格列
const userColumns = [
  { prop: 'avatar', label: '头像', type: 'avatar', width: 60 },
  { prop: 'fullName', label: '姓名', width: 100 },
  { prop: 'email', label: '邮箱', minWidth: 150 },
  { prop: 'createdAt', label: '注册时间', width: 120, formatter: (row) => formatDate(row.createdAt) }
]

// 订单表格列
const orderColumns = [
  { prop: 'id', label: '订单号', width: 120 },
  { prop: 'user', label: '用户', width: 100 },
  { prop: 'amount', label: '金额', width: 80, formatter: (row) => `¥${row.amount}` },
  { prop: 'status', label: '状态', width: 80, type: 'status' },
  { prop: 'createdAt', label: '创建时间', width: 120, formatter: (row) => formatDate(row.createdAt) }
]

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initUserGrowthChart()
    initOrderChart()
  })
}

// 用户增长趋势图
const initUserGrowthChart = () => {
  if (!userGrowthChartRef.value) return

  const chart = echarts.init(userGrowthChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增用户', '活跃用户']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        stack: 'Total',
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '活跃用户',
        type: 'line',
        stack: 'Total',
        data: [220, 182, 191, 234, 290, 330, 310]
      }
    ]
  }

  chart.setOption(option)
  
  // 响应式处理
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 订单统计图
const initOrderChart = () => {
  if (!orderChartRef.value) return

  const chart = echarts.init(orderChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '订单类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '普通订单' },
          { value: 735, name: '团购订单' },
          { value: 580, name: '秒杀订单' },
          { value: 484, name: '预售订单' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)
  
  // 响应式处理
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 查看全部日志
const viewAllLogs = () => {
  router.push('/activity-logs')
}

// 页面初始化
onMounted(async () => {
  await loadDashboardData()
  initCharts()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: $spacing-lg;
  background: $background-color-lighter;
  min-height: 100vh;
}

.stats-section {
  margin-bottom: $spacing-lg;
}

.charts-section {
  margin-bottom: $spacing-lg;
  
  .chart-container {
    height: 300px;
    width: 100%;
  }
}

.tables-section {
  margin-bottom: $spacing-lg;
}

.logs-section {
  .card-header {
    @include flex-between;
    
    span {
      font-weight: $font-weight-primary;
    }
  }
  
  .log-content {
    .log-user {
      font-weight: $font-weight-primary;
      color: $primary-color;
      margin-right: $spacing-xs;
    }
    
    .log-action {
      color: $text-color-regular;
      margin-right: $spacing-xs;
    }
    
    .log-target {
      color: $text-color-secondary;
    }
  }
}
</style>
```

## 最佳实践示例

### 组件组合模式

```vue
<!-- src/components/FormBuilder.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :label-width="labelWidth"
    @submit.prevent="handleSubmit"
  >
    <el-form-item
      v-for="field in formFields"
      :key="field.name"
      :label="field.label"
      :prop="field.name"
    >
      <!-- 输入框组件 -->
      <el-input
        v-if="field.type === 'input'"
        v-model="formData[field.name]"
        v-bind="field.props"
      />
      
      <!-- 选择器组件 -->
      <el-select
        v-else-if="field.type === 'select'"
        v-model="formData[field.name]"
        v-bind="field.props"
      >
        <el-option
          v-for="option in field.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      
      <!-- 日期选择器 -->
      <el-date-picker
        v-else-if="field.type === 'date'"
        v-model="formData[field.name]"
        v-bind="field.props"
      />
      
      <!-- 自定义组件 -->
      <component
        v-else-if="field.component"
        :is="field.component"
        v-model="formData[field.name]"
        v-bind="field.props"
      />
    </el-form-item>
    
    <!-- 表单按钮 -->
    <el-form-item v-if="showButtons">
      <slot name="buttons">
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ submitText }}
        </el-button>
        <el-button @click="handleReset">{{ resetText }}</el-button>
      </slot>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

interface FormField {
  name: string
  label: string
  type: 'input' | 'select' | 'date' | 'custom'
  component?: any
  props?: Record<string, any>
  options?: Array<{ label: string; value: any }>
  rules?: any[]
}

interface Props {
  fields: FormField[]
  modelValue?: Record<string, any>
  labelWidth?: string
  loading?: boolean
  showButtons?: boolean
  submitText?: string
  resetText?: string
}

interface Emits {
  'update:modelValue': [value: Record<string, any>]
  submit: [data: Record<string, any>]
  reset: []
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '100px',
  loading: false,
  showButtons: true,
  submitText: '提交',
  resetText: '重置'
})

const emit = defineEmits<Emits>()

const formRef = ref()
const formData = reactive<Record<string, any>>({})

// 计算表单规则
const formRules = computed(() => {
  const rules: Record<string, any[]> = {}
  props.fields.forEach(field => {
    if (field.rules) {
      rules[field.name] = field.rules
    }
  })
  return rules
})

// 初始化表单数据
const initFormData = () => {
  props.fields.forEach(field => {
    if (props.modelValue && props.modelValue[field.name] !== undefined) {
      formData[field.name] = props.modelValue[field.name]
    } else {
      formData[field.name] = ''
    }
  })
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  const isValid = await formRef.value.validate()
  if (isValid) {
    emit('submit', { ...formData })
  }
}

// 表单重置
const handleReset = () => {
  initFormData()
  formRef.value?.resetFields()
  emit('reset')
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(formData, newValue)
    }
  },
  { deep: true }
)

// 监听字段变化，实时更新modelValue
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', { ...newValue })
  },
  { deep: true }
)

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  getFormData: () => ({ ...formData })
})

// 初始化
initFormData()
</script>
```

这些完整示例展示了Vue 3在实际项目中的应用，包括：

1. **用户管理系统** - 完整的CRUD操作、搜索过滤、批量处理
2. **仪表板系统** - 数据可视化、统计图表、实时数据
3. **组件设计模式** - 可复用的通用组件、表单构建器

每个示例都遵循了Vue 3 + TypeScript + Element Plus的最佳实践，展示了现代前端开发的完整流程。