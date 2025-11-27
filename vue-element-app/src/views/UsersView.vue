<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElMessage,
  ElMessageBox,
  ElButton,
  ElButtonGroup,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElTag,
  ElAvatar,
  ElLink,
  ElTooltip,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElSpace,
  ElRow,
  ElCol
} from 'element-plus'
import {
  Plus,
  Search,
  Delete,
  Edit,
  View,
  MoreFilled
} from '@element-plus/icons-vue'

// Vue 3 组合式API模式
// 类型定义
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  status: 'active' | 'inactive' | 'banned'
  avatar?: string
  createdAt: string
}

interface PaginationState {
  currentPage: number
  pageSize: number
  total: number
}

type FilterType = 'all' | 'active' | 'inactive'

interface DropdownAction {
  action: string
  user: User
}

// Router
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const selectedUsers = ref<User[]>([])
const activeFilter = ref<FilterType>('all')
const pagination = ref<PaginationState>({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 🔥 关键：使用类型安全的对象初始化
const users = ref<User[]>([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-20'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-02-01'
  }
])

// 计算属性 - 类型安全的派生数据
const filteredUsers = computed(() => {
  let result = users.value

  // 🔥 关键：使用明确的条件分支而不是复杂逻辑
  if (activeFilter.value !== 'all') {
    result = result.filter(user => user.status === activeFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  return result
})

const displayUsers = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredUsers.value.slice(start, end)
})

// 🔥 关键：使用空值合并操作符
const totalUsers = computed(() => pagination.value.total ?? filteredUsers.value.length)

// 🔥 关键：类型安全的映射配置
const roleConfig = {
  admin: { text: '管理员', type: 'danger' as const },
  user: { text: '用户', type: 'primary' as const },
  moderator: { text: '版主', type: 'warning' as const }
}

const statusConfig = {
  active: { text: '活跃', type: 'success' as const },
  inactive: { text: '禁用', type: 'danger' as const },
  banned: { text: '封禁', type: 'warning' as const }
}

// Methods
const addUser = () => {
  router.push('/users/create')
  ElMessage.info('跳转到新增用户页面')
}

const editUser = (user: User) => {
  router.push(`/users/${user.id}/edit`)
  ElMessage.info(`编辑用户: ${user.name}`)
}

const viewUser = (user: User) => {
  router.push(`/users/${user.id}`)
  ElMessage.info(`查看用户: ${user.name}`)
}

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确认删除用户 "${user.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true
      }
    )

    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
      ElMessage.success(`用户 "${user.name}" 已删除`)
    }
  } catch {
    ElMessage.info('已取消删除操作')
  }
}

const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.info('请输入搜索关键词')
    return
  }

  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success(`找到 ${filteredUsers.value.length} 个用户`)
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  pagination.value.currentPage = 1
}

const setFilter = (filter: FilterType) => {
  activeFilter.value = filter
  pagination.value.currentPage = 1
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const deleteIds = selectedUsers.value.map(u => u.id)
    users.value = users.value.filter(u => !deleteIds.includes(u.id))
    selectedUsers.value = []

    ElMessage.success(`成功删除 ${deleteIds.length} 个用户`)
  } catch {
    ElMessage.info('已取消批量删除操作')
  }
}

const handleMoreAction = async ({ action, user }: DropdownAction) => {
  switch (action) {
    case 'view':
      viewUser(user)
      break
    case 'edit':
      editUser(user)
      break
    case 'delete':
      await deleteUser(user)
      break
    case 'reset-password':
      await resetPassword(user)
      break
    case 'toggle-status':
      await toggleUserStatus(user)
      break
    default:
      ElMessage.warning('未知操作')
  }
}

const resetPassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确认重置用户 "${user.name}" 的密码吗？`,
      '重置密码',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success(`用户 "${user.name}" 的密码已重置`)
  } catch {
    ElMessage.info('已取消重置密码')
  }
}

const toggleUserStatus = async (user: User) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const statusText = newStatus === 'active' ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确认${statusText}用户 "${user.name}" 吗？`,
      `${statusText}用户`,
      {
        confirmButtonText: `确认${statusText}`,
        cancelButtonText: '取消',
        type: newStatus === 'active' ? 'success' : 'warning'
      }
    )

    user.status = newStatus
    ElMessage.success(`用户 "${user.name}" 已${statusText}`)
  } catch {
    ElMessage.info(`已取消${statusText}操作`)
  }
}

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('zh-CN')
  } catch {
    return '无效日期'
  }
}

// 🔥 关键：安全的辅助函数
const getRoleConfig = (role: User['role']) => {
  return roleConfig[role] ?? { text: '未知', type: 'info' as const }
}

const getStatusConfig = (status: User['status']) => {
  return statusConfig[status] ?? { text: '未知', type: 'info' as const }
}

// 生命周期
onMounted(() => {
  pagination.value.total = users.value.length
})

// 🔥 关键：副作用监听
watchEffect(() => {
  pagination.value.total = filteredUsers.value.length
})
</script>

<template>
  <div class="users-page">
    <!-- 页面标题和操作区域 -->
    <el-card>
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <h2>用户管理</h2>
            <el-tag type="info" size="large">
              共 {{ totalUsers }} 个用户
            </el-tag>
          </div>
          <el-space>
            <el-button v-if="selectedUsers.length > 0" type="warning" :icon="Delete" @click="handleBatchDelete">
              批量删除 ({{ selectedUsers.length }})
            </el-button>
            <el-button type="primary" :icon="Plus" @click="addUser">
              新增用户
            </el-button>
          </el-space>
        </div>
      </template>

      <!-- 搜索和筛选区域 -->
      <el-form :model="{}" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="搜索">
              <el-input v-model="searchQuery" placeholder="请输入用户名或邮箱搜索" :prefix-icon="Search" clearable
                @keyup.enter="searchUsers" @clear="clearSearch">
                <template #append>
                  <el-button :icon="Search" @click="searchUsers" :loading="loading">
                    搜索
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="筛选">
              <el-button-group>
                <el-button :type="activeFilter === 'all' ? 'primary' : 'default'" @click="setFilter('all')">
                  全部
                </el-button>
                <el-button :type="activeFilter === 'active' ? 'success' : 'default'" @click="setFilter('active')">
                  活跃
                </el-button>
                <el-button :type="activeFilter === 'inactive' ? 'danger' : 'default'" @click="setFilter('inactive')">
                  禁用
                </el-button>
              </el-button-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 用户表格 -->
    <el-card>
      <el-table :data="displayUsers" :loading="loading" stripe @selection-change="handleSelectionChange"
        empty-text="暂无用户数据" :style="{ width: '100%' }" table-layout="auto">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="70" sortable />

        <el-table-column prop="name" label="姓名" min-width="120" sortable>
          <template #default="{ row }">
            <el-space>
              <el-avatar :size="32" :src="row.avatar">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <span>{{ row.name }}</span>
            </el-space>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="邮箱" min-width="180" sortable>
          <template #default="{ row }">
            <el-link :href="`mailto:${row.email}`" type="primary" :underline="false">
              {{ row.email }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="role" label="角色" width="90" sortable>
          <template #default="{ row }">
            <el-tag :type="getRoleConfig(row.role).type">
              {{ getRoleConfig(row.role).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="90" sortable>
          <template #default="{ row }">
            <el-tag :type="getStatusConfig(row.status).type">
              {{ getStatusConfig(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="110" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-tooltip content="查看详情" placement="top">
                <el-button type="info" size="small" circle :icon="View" @click="viewUser(row)" />
              </el-tooltip>

              <el-tooltip content="编辑用户" placement="top">
                <el-button type="primary" size="small" circle :icon="Edit" @click="editUser(row)" />
              </el-tooltip>

              <el-dropdown trigger="click" @command="(action) => handleMoreAction({ action, user: row })">
                <el-button size="small" circle :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">
                      查看详情
                    </el-dropdown-item>
                    <el-dropdown-item command="edit">
                      编辑用户
                    </el-dropdown-item>
                    <el-dropdown-item command="reset-password">
                      重置密码
                    </el-dropdown-item>
                    <el-dropdown-item command="toggle-status">
                      {{ row.status === 'active' ? '禁用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <span style="color: var(--el-color-danger)">删除用户</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :total="totalUsers" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" background
        style="margin-top: 20px; justify-content: center;" />
    </el-card>
  </div>
</template>

<style scoped>
/* ✅ 最小化自定义CSS，仅用于基本布局 */
.users-page {
  padding: var(--el-padding-large);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--el-gap-base);
}

.header-left h2 {
  margin: 0;
  font-size: var(--el-font-size-extra-large);
  font-weight: var(--el-font-weight-primary);
}

/* ✅ 使用Element Plus的内置响应式功能 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--el-gap-base);
    align-items: stretch;
  }

  .header-left {
    justify-content: center;
  }
}
</style>
