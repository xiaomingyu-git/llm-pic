<template>
    <div class="yj-table">
        <el-card class="table-card">
            <!-- Query Section -->
            <template #header>
                <div class="table-header">
                    <h3>{{ props.title }}</h3>
                    <div class="query-section">
                        <el-form :model="queryParams" :inline="true" class="query-form" @submit.prevent="handleSearch">
                            <el-form-item label="搜索：">
                                <el-input v-model="queryParams.keyword" placeholder="请输入关键词" clearable
                                    :prefix-icon="Search" @keyup.enter="handleSearch" @clear="handleSearch" />
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="handleSearch" :loading="loading">
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                    查询
                                </el-button>
                                <el-button @click="handleReset">
                                    <el-icon>
                                        <Refresh />
                                    </el-icon>
                                    重置
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </template>

            <!-- Table Section -->
            <div class="table-content">
                <el-table v-loading="loading" :data="tableData" :stripe="props.stripe" :border="props.border"
                    :height="props.height" :max-height="props.maxHeight" :empty-text="props.emptyText"
                    :style="{ width: '100%' }">
                    <!-- Dynamic columns -->
                    <template v-for="column in props.columns" :key="column.prop">
                        <el-table-column :prop="column.prop" :label="column.label" :width="column.width"
                            :min-width="column.minWidth" :fixed="column.fixed" :sortable="column.sortable"
                            :align="column.align || 'left'"
                            :show-overflow-tooltip="column.showOverflowTooltip !== false">
                            <template #default="{ row, column: col, $index }">
                                <slot :name="`cell-${column.prop}`" :row="row" :column="col" :index="$index">
                                    {{ getCellValue(row, column.prop) }}
                                </slot>
                            </template>
                        </el-table-column>
                    </template>

                    <!-- Action Column -->
                    <el-table-column v-if="props.showActions" label="操作" :width="props.actionWidth"
                        :fixed="props.actionFixed" align="center">
                        <template #default="{ row, $index }">
                            <slot name="actions" :row="row" :index="$index">
                                <el-button v-if="props.showEdit" type="primary" size="small" text
                                    @click="handleEdit(row, $index)">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    编辑
                                </el-button>
                                <el-button v-if="props.showDelete" type="danger" size="small" text
                                    @click="handleDelete(row, $index)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    删除
                                </el-button>
                            </slot>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- Pagination Section -->
                <div v-if="props.pagination" class="pagination-section">
                    <el-pagination v-model:current-page="paginationState.page"
                        v-model:page-size="paginationState.pageSize" :page-sizes="paginationState.pageSizes"
                        :total="paginationState.total" :layout="paginationState.layout"
                        :background="paginationState.background" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" />
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
    ElTable,
    ElTableColumn,
    ElPagination,
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElIcon,
    ElMessageBox,
} from 'element-plus';
import { Search, Refresh, Edit, Delete } from '@element-plus/icons-vue';
import type { TableColumnCtx } from 'element-plus';

// Props interface
interface TableColumn {
    prop: string;
    label: string;
    width?: number | string;
    minWidth?: number | string;
    fixed?: boolean | 'left' | 'right';
    sortable?: boolean | 'custom';
    align?: 'left' | 'center' | 'right';
    showOverflowTooltip?: boolean;
    formatter?: (
        row: any,
        column: TableColumnCtx<any>,
        cellValue: any,
        index: number
    ) => string;
}

interface PaginationConfig {
    page: number;
    pageSize: number;
    total: number;
    pageSizes?: number[];
    layout?: string;
    background?: boolean;
}

interface QueryParams {
    keyword: string;
    [key: string]: any;
}

interface Props {
    title?: string;
    columns: TableColumn[];
    data?: any[];
    loading?: boolean;
    stripe?: boolean;
    border?: boolean;
    height?: string | number;
    maxHeight?: string | number;
    emptyText?: string;
    pagination?: boolean;
    paginationConfig?: Partial<PaginationConfig>;
    showActions?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    actionWidth?: number | string;
    actionFixed?: boolean | 'left' | 'right';
    searchPlaceholder?: string;
    autoLoad?: boolean;
}

// Emits interface
interface Emits {
    (e: 'search', params: QueryParams): void;
    (e: 'reset'): void;
    (e: 'page-change', page: number): void;
    (e: 'size-change', size: number): void;
    (e: 'edit', row: any, index: number): void;
    (e: 'delete', row: any, index: number): void;
    (e: 'refresh'): void;
}

const props = withDefaults(defineProps<Props>(), {
    title: '数据表格',
    data: () => [],
    loading: false,
    stripe: true,
    border: true,
    emptyText: '暂无数据',
    pagination: true,
    showActions: true,
    showEdit: true,
    showDelete: true,
    actionWidth: 150,
    actionFixed: 'right',
    searchPlaceholder: '请输入关键词',
    autoLoad: true,
});

const emit = defineEmits<Emits>();

// Reactive data
const tableData = ref<any[]>([]);
const queryParams = ref<QueryParams>({
    keyword: '',
});

const paginationState = ref<PaginationConfig>({
    page: 1,
    pageSize: 10,
    total: 0,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
});

// Methods
const getCellValue = (row: any, prop: string): string => {
    const value = row[prop];
    if (value === null || value === undefined) {
        return '-';
    }

    // Find column formatter
    const column = props.columns.find((col) => col.prop === prop);
    if (column?.formatter) {
        return column.formatter(
            row,
            { property: prop } as TableColumnCtx<any>,
            value,
            0
        );
    }

    return String(value);
};

const handleSearch = () => {
    paginationState.value.page = 1;
    emit('search', { ...queryParams.value });
};

const handleReset = () => {
    queryParams.value.keyword = '';
    paginationState.value.page = 1;
    emit('reset');
};

const handleSizeChange = (size: number) => {
    paginationState.value.pageSize = size;
    paginationState.value.page = 1;
    emit('size-change', size);
    emit('refresh');
};

const handleCurrentChange = (page: number) => {
    paginationState.value.page = page;
    emit('page-change', page);
    emit('refresh');
};

const handleEdit = (row: any, index: number) => {
    emit('edit', row, index);
};

const handleDelete = async (row: any, index: number) => {
    try {
        await ElMessageBox.confirm(`确定要删除这条数据吗？`, '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        });

        emit('delete', row, index);
    } catch {
        // User cancelled
    }
};

const updateTableData = (data: any[], total?: number) => {
    tableData.value = data;
    if (total !== undefined) {
        paginationState.value.total = total;
    }
};

const updatePagination = (config: Partial<PaginationConfig>) => {
    paginationState.value = { ...paginationState.value, ...config };
};

const updateQueryParams = (params: Partial<QueryParams>) => {
    queryParams.value = { ...queryParams.value, ...params };
};

// Watchers
watch(
    () => props.data,
    (newData) => {
        if (newData) {
            tableData.value = newData;
        }
    },
    { immediate: true }
);

watch(
    () => props.paginationConfig,
    (newConfig) => {
        if (newConfig) {
            paginationState.value = { ...paginationState.value, ...newConfig };
        }
    },
    { deep: true, immediate: true }
);

// Lifecycle
onMounted(() => {
    if (props.autoLoad) {
        emit('refresh');
    }
});

// Expose methods
defineExpose({
    updateTableData,
    updatePagination,
    updateQueryParams,
    refresh: () => emit('refresh'),
});
</script>

<style scoped>
.yj-table {
    width: 100%;
}

.table-card {
    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
        }

        .query-section {
            flex: 1;
            display: flex;
            justify-content: flex-end;

            .query-form {
                display: flex;
                align-items: center;
                gap: 16px;
                margin: 0;

                .el-form-item {
                    margin-bottom: 0;
                }
            }
        }
    }
}

.table-content {
    .pagination-section {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--el-border-color-lighter);
    }
}

/* Responsive design */
@media (max-width: 768px) {
    .table-header {
        flex-direction: column;
        align-items: stretch;

        .query-section {
            justify-content: stretch;
        }
    }

    .query-form {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .pagination-section {
        justify-content: center;

        :deep(.el-pagination) {
            justify-content: center;
        }
    }
}
</style>
