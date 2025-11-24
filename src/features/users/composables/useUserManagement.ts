/**
 * User Management Composable
 * 用户管理相关的组合式函数
 */

import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { userService } from '../services/userService';
import type {
  User,
  SearchParams,
  PaginationConfig,
  UserActions,
} from '../types';

export function useUserManagement() {
  // 响应式数据
  const loading = ref(false);
  const tableData = ref<User[]>([]);
  const searchParams = reactive<SearchParams>({
    keyword: '',
    role: '',
    status: '',
  });

  const paginationConfig = reactive<PaginationConfig>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 计算属性
  const hasData = computed(() => tableData.value.length > 0);
  const isSearching = computed(
    () => searchParams.keyword || searchParams.role || searchParams.status
  );

  // 方法
  const loadData = async () => {
    loading.value = true;
    try {
      const response = await userService.getUsers(
        searchParams,
        paginationConfig
      );

      if (response.success) {
        tableData.value = response.data;
        paginationConfig.total = response.total;
        ElMessage.success(response.message);
      } else {
        ElMessage.error(response.message);
        tableData.value = [];
        paginationConfig.total = 0;
      }
    } catch (error: unknown) {
      const errorMessage = '数据加载失败';
      ElMessage.error(errorMessage);
      console.error('Load data error:', error);
      tableData.value = [];
      paginationConfig.total = 0;
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = (params: { keyword: string }) => {
    searchParams.keyword = params.keyword;
    paginationConfig.page = 1;
    loadData();
  };

  const handleReset = () => {
    searchParams.keyword = '';
    searchParams.role = '';
    searchParams.status = '';
    paginationConfig.page = 1;
    loadData();
  };

  const handlePageChange = (page: number) => {
    paginationConfig.page = page;
    loadData();
  };

  const handleSizeChange = (size: number) => {
    paginationConfig.pageSize = size;
    paginationConfig.page = 1;
    loadData();
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleEdit = (user: User, _index: number) => {
    ElMessage.info(`编辑用户: ${user.name} (ID: ${user.id})`);
    // TODO: 实现编辑功能，比如打开编辑对话框
  };

  const handleView = (user: User) => {
    ElMessage.info(`查看用户详情: ${user.name} (ID: ${user.id})`);
    // TODO: 实现查看功能，比如打开详情对话框
  };

  const handleDelete = async (user: User, _index: number) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除用户 "${user.name}" 吗？此操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );

      loading.value = true;
      const response = await userService.deleteUser(user.id);

      if (response.success) {
        ElMessage.success(response.message);
        await loadData();
      } else {
        ElMessage.error(response.message);
      }
    } catch (error: unknown) {
      // 用户取消删除或其他错误
      if (error !== 'cancel') {
        console.error('Delete user error:', error);
      }
    } finally {
      loading.value = false;
    }
  };

  const handleBatchDelete = async (userIds: number[]) => {
    if (userIds.length === 0) {
      ElMessage.warning('请选择要删除的用户');
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${userIds.length} 个用户吗？此操作不可恢复。`,
        '批量删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );

      loading.value = true;
      const response = await userService.deleteUsers(userIds);

      if (response.success) {
        ElMessage.success(response.message);
        await loadData();
      } else {
        ElMessage.error(response.message);
      }
    } catch (error: unknown) {
      if (error !== 'cancel') {
        console.error('Batch delete error:', error);
      }
    } finally {
      loading.value = false;
    }
  };

  // 用户操作处理器
  const userActions: UserActions = {
    onEdit: handleEdit,
    onView: handleView,
    onDelete: handleDelete,
  };

  // 监听搜索参数变化
  watch(
    [
      () => searchParams.keyword,
      () => searchParams.role,
      () => searchParams.status,
    ],
    () => {
      paginationConfig.page = 1;
    },
    { deep: true }
  );

  // 初始化数据
  const initialize = () => {
    loadData();
  };

  return {
    // 状态
    loading,
    tableData,
    searchParams,
    paginationConfig,
    hasData,
    isSearching,

    // 方法
    loadData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleRefresh,
    handleEdit,
    handleView,
    handleDelete,
    handleBatchDelete,
    userActions,
    initialize,
  };
}
