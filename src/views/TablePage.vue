<template>
  <div class="table-page">
    <YjTable
      ref="tableRef"
      title="用户数据管理"
      :columns="tableColumns"
      :loading="loading"
      :data="tableData"
      :pagination-config="paginationConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @edit="handleEdit"
      @delete="handleDelete"
      @refresh="handleRefresh"
    >
      <!-- Custom cell slots -->
      <template #cell-status="{ row }">
        <UserStatusTag :status="row.status" size="small" />
      </template>

      <template #cell-role="{ row }">
        <UserRoleTag :role="row.role" size="small" :show-icon="true" />
      </template>

      <template #cell-createdAt="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>

      <!-- Custom actions slot -->
      <template #actions="{ row, index }">
        <UserActions
          :user="row"
          :index="index"
          @edit="handleEdit"
          @view="handleView"
          @delete="handleDelete"
        />
      </template>
    </YjTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import YjTable from '@/components/YjTable.vue';
import UserStatusTag from '@/features/users/components/UserStatusTag.vue';
import UserRoleTag from '@/features/users/components/UserRoleTag.vue';
import UserActions from '@/features/users/components/UserActions.vue';
import { useUserManagement } from '@/features/users/composables/useUserManagement';
import { formatDate } from '@/features/users/utils/helpers';

// Use user management composable
const {
  loading,
  tableData,
  paginationConfig,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  handleRefresh,
  handleEdit,
  handleView,
  handleDelete,
  initialize,
} = useUserManagement();

// Table ref for accessing YjTable methods
const tableRef = ref();

// Table columns configuration
const tableColumns = [
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: true,
    align: 'center' as const,
  },
  {
    prop: 'name',
    label: '姓名',
    minWidth: 120,
    sortable: true,
    showOverflowTooltip: true,
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 180,
    showOverflowTooltip: true,
  },
  {
    prop: 'phone',
    label: '电话',
    minWidth: 140,
    showOverflowTooltip: true,
  },
  {
    prop: 'role',
    label: '角色',
    width: 120,
    align: 'center' as const,
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    align: 'center' as const,
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 160,
    sortable: true,
  },
];

// Lifecycle
onMounted(() => {
  initialize();
});
</script>

<style scoped>
.table-page {
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}
</style>
