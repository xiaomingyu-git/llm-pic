# Vue 3 常用模式指南

## 核心原则

提供Vue 3开发中最常用的模式和最佳实践，帮助开发者快速构建高质量、可维护的应用。

## 表单处理模式

### 响应式表单模式

```vue
<!-- UserForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    :label-width="labelWidth"
    :disabled="disabled"
    @submit.prevent="handleSubmit"
  >
    <!-- 基础信息 -->
    <el-form-item label="用户名" prop="username">
      <el-input
        v-model="formData.username"
        placeholder="请输入用户名"
        clearable
        @blur="validateField('username')"
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

    <!-- 密码字段（仅在新增时显示） -->
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
      >
        <el-option
          v-for="role in availableRoles"
          :key="role.id"
          :label="role.displayName"
          :value="role.id"
        />
      </el-select>
    </el-form-item>

    <!-- 状态切换 -->
    <el-form-item label="状态" prop="status">
      <el-switch
        v-model="formData.status"
        active-value="active"
        inactive-value="inactive"
        active-text="启用"
        inactive-text="禁用"
      />
    </el-form-item>

    <!-- 操作按钮 -->
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { User, UserFormData, UserRole } from '@/types/user'
import { userFormRules } from '@/types/user'

interface Props {
  initialData?: Partial<User>
  loading?: boolean
  disabled?: boolean
  labelWidth?: string
}

interface Emits {
  submit: [data: UserFormData]
  cancel: []
  reset: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  labelWidth: '100px'
})

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<UserFormData>({
  username: '',
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  roleIds: []
})

// 可用角色列表
const availableRoles = ref<UserRole[]>([])

// 计算属性
const isEdit = computed(() => !!props.initialData?.id)

// 表单验证规则
const formRules = computed((): FormRules<UserFormData> => {
  const rules = { ...userFormRules }
  
  // 编辑模式下移除密码验证
  if (isEdit.value) {
    delete rules.password
    delete rules.confirmPassword
  }
  
  // 自定义确认密码验证
  if (!isEdit.value) {
    rules.confirmPassword = [
      {
        required: true,
        message: '请再次输入密码',
        trigger: 'blur'
      },
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
    ]
  }
  
  return rules as FormRules<UserFormData>
})

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
      roleIds: props.initialData.roles?.map(role => role.id) || []
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
    roleIds: []
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const isValid = await formRef.value.validate()
    if (!isValid) return
    
    emit('submit', { ...formData })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置处理
const handleReset = () => {
  resetForm()
  emit('reset')
}

// 取消处理
const handleCancel = () => {
  emit('cancel')
}

// 验证单个字段
const validateField = (prop: keyof UserFormData) => {
  formRef.value?.validateField(prop)
}

// 监听初始数据变化
watch(
  () => props.initialData,
  () => {
    initFormData()
  },
  { immediate: true, deep: true }
)

// 暴露方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  validateField,
  getFormData: () => ({ ...formData }),
  setFormData: (data: Partial<UserFormData>) => {
    Object.assign(formData, data)
  }
})
</script>
```

### 表单验证Composable

```typescript
// src/composables/useFormValidation.ts
import { ref, reactive, type Ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface UseFormValidationOptions<T extends Record<string, any>> {
  initialData?: T
  rules?: FormRules<T>
  onSubmit?: (data: T) => Promise<void>
  onReset?: () => void
  onCancel?: () => void
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T> = {}
) {
  const { initialData, rules, onSubmit, onReset, onCancel } = options

  // 表单引用
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive<T>({ ...initialData } as T)

  // 加载状态
  const loading = ref(false)
  const errors = ref<Record<string, string[]>>({})

  // 验证表单
  const validate = async (): Promise<boolean> => {
    if (!formRef.value) return false
    
    try {
      const isValid = await formRef.value.validate()
      errors.value = {}
      return isValid
    } catch (error) {
      console.error('表单验证失败:', error)
      return false
    }
  }

  // 验证单个字段
  const validateField = async (field: keyof T): Promise<boolean> => {
    if (!formRef.value) return false
    
    try {
      await formRef.value.validateField(field as string)
      // 清除该字段的错误
      if (errors.value[field as string]) {
        delete errors.value[field as string]
      }
      return true
    } catch (error) {
      return false
    }
  }

  // 重置表单
  const resetForm = () => {
    Object.assign(formData, { ...initialData } as T)
    formRef.value?.resetFields()
    errors.value = {}
    onReset?.()
  }

  // 提交表单
  const submit = async (): Promise<void> => {
    const isValid = await validate()
    if (!isValid || !onSubmit) return
    
    try {
      loading.value = true
      await onSubmit({ ...formData })
    } catch (error) {
      console.error('表单提交失败:', error)
      // 处理服务器返回的错误
      if (error.response?.data?.errors) {
        errors.value = error.response.data.errors
      }
    } finally {
      loading.value = false
    }
  }

  // 取消操作
  const cancel = () => {
    onCancel?.()
  }

  // 设置字段错误
  const setFieldError = (field: keyof T, message: string) => {
    if (!errors.value[field as string]) {
      errors.value[field as string] = []
    }
    errors.value[field as string].push(message)
  }

  // 清除字段错误
  const clearFieldError = (field: keyof T) => {
    delete errors.value[field as string]
  }

  // 清除所有错误
  const clearErrors = () => {
    errors.value = {}
  }

  // 获取字段错误信息
  const getFieldError = (field: keyof T): string[] => {
    return errors.value[field as string] || []
  }

  // 检查字段是否有错误
  const hasFieldError = (field: keyof T): boolean => {
    return getFieldError(field).length > 0
  }

  return {
    // Refs
    formRef,
    formData,
    loading,
    errors,
    
    // Methods
    validate,
    validateField,
    resetForm,
    submit,
    cancel,
    setFieldError,
    clearFieldError,
    clearErrors,
    getFieldError,
    hasFieldError
  }
}
```

## 数据展示模式

### 表格组件模式

```vue
<!-- DataTable.vue -->
<template>
  <div class="data-table">
    <!-- 工具栏 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-button
          v-if="showCreate"
          type="primary"
          :icon="Plus"
          @click="handleCreate"
        >
          {{ createText }}
        </el-button>
        
        <el-button
          v-if="showRefresh"
          :icon="Refresh"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <slot name="toolbar" />
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="data"
      :loading="loading"
      :stripe="stripe"
      :border="border"
      :size="size"
      :height="height"
      :max-height="maxHeight"
      :show-header="showHeader"
      :highlight-current-row="highlightCurrentRow"
      :row-key="rowKey"
      :default-sort="defaultSort"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        :selectable="isRowSelectable"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        :index="indexMethod"
      />

      <!-- 数据列 -->
      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :align="column.align || 'left'"
          :show-overflow-tooltip="column.showOverflowTooltip !== false"
          :formatter="column.formatter"
          :class-name="column.className"
          :label-class-name="column.labelClassName"
        >
          <template #default="{ row, column: col, $index }">
            <!-- 自定义插槽 -->
            <slot
              v-if="$slots[`cell-${column.prop}`]"
              :name="`cell-${column.prop}`"
              :row="row"
              :column="col"
              :index="$index"
            />
            <!-- 状态标签 -->
            <template v-else-if="column.type === 'status'">
              <el-tag
                :type="getStatusType(row[column.prop])"
                :size="column.tagSize || 'default'"
              >
                {{ getStatusText(row[column.prop]) }}
              </el-tag>
            </template>
            <!-- 图片 -->
            <template v-else-if="column.type === 'image'">
              <el-image
                :src="row[column.prop]"
                :preview-src-list="[row[column.prop]]"
                fit="cover"
                style="width: 40px; height: 40px;"
              />
            </template>
            <!-- 操作按钮 -->
            <template v-else-if="column.type === 'actions'">
              <el-button
                v-for="action in getVisibleActions(row, $index)"
                :key="action.key"
                :type="action.type || 'primary'"
                :size="action.size || 'small'"
                :icon="action.icon"
                :disabled="action.disabled"
                :loading="action.loading"
                @click.stop="action.onClick(row, $index)"
              >
                {{ action.label }}
              </el-button>
            </template>
            <!-- 默认文本 -->
            <template v-else>
              {{ formatCellValue(row, column) }}
            </template>
          </template>
        </el-table-column>
      </template>

      <!-- 空状态 -->
      <template #empty>
        <slot name="empty">
          <el-empty :description="emptyText" />
        </slot>
      </template>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :background="background"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { TableColumnCtx } from 'element-plus'

interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: any, column: TableColumnCtx, cellValue: any) => string
  className?: string
  labelClassName?: string
  type?: 'status' | 'image' | 'actions'
  tagSize?: 'large' | 'default' | 'small'
  statusMap?: Record<string, { type: string; text: string }>
  actions?: Array<{
    key: string
    label: string
    type?: string
    size?: string
    icon?: any
    disabled?: boolean | ((row: any, index: number) => boolean)
    hidden?: boolean | ((row: any, index: number) => boolean)
    onClick: (row: any, index: number) => void
  }>
}

interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  stripe?: boolean
  border?: boolean
  size?: 'large' | 'default' | 'small'
  height?: string | number
  maxHeight?: string | number
  showHeader?: boolean
  highlightCurrentRow?: boolean
  rowKey?: string | ((row: any) => string)
  defaultSort?: { prop: string; order: 'ascending' | 'descending' }
  selectable?: boolean
  showIndex?: boolean
  showCreate?: boolean
  showRefresh?: boolean
  createText?: string
  emptyText?: string
  showPagination?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
  }
  pageSizes?: number[]
  paginationLayout?: string
  background?: boolean
}

interface Emits {
  'selection-change': [selection: any[]]
  'sort-change': [sort: { column: any; prop: string; order: string }]
  'row-click': [row: any, column: any, event: Event]
  'size-change': [size: number]
  'current-change': [current: number]
  create: []
  refresh: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stripe: true,
  border: false,
  size: 'default',
  showHeader: true,
  highlightCurrentRow: true,
  selectable: false,
  showIndex: false,
  showCreate: true,
  showRefresh: true,
  createText: '新增',
  emptyText: '暂无数据',
  showPagination: true,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  background: true
})

const emit = defineEmits<Emits>()

const tableRef = ref()

// 计算属性
const currentPagination = computed(() => props.pagination || {
  current: 1,
  pageSize: 10,
  total: 0
})

// 方法
const indexMethod = (index: number) => {
  return (currentPagination.value.current - 1) * currentPagination.value.pageSize + index + 1
}

const isRowSelectable = (row: any, index: number) => {
  return true
}

const getVisibleActions = (row: any, index: number) => {
  const actions = props.columns
    .filter(column => column.type === 'actions')
    .flatMap(column => column.actions || [])
  
  return actions.filter(action => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(row, index)
    }
    return !action.hidden
  })
}

const getStatusType = (value: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    pending: 'warning',
    error: 'danger'
  }
  return statusMap[value] || 'info'
}

const getStatusText = (value: string) => {
  const textMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    pending: '待处理',
    error: '错误'
  }
  return textMap[value] || value
}

const formatCellValue = (row: any, column: TableColumn) => {
  const value = row[column.prop]
  
  if (column.formatter) {
    return column.formatter(row, column as any, value)
  }
  
  if (value === null || value === undefined) {
    return '-'
  }
  
  return value
}

// 事件处理
const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSortChange = (sort: any) => {
  emit('sort-change', sort)
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (current: number) => {
  emit('current-change', current)
}

const handleCreate = () => {
  emit('create')
}

const handleRefresh = () => {
  emit('refresh')
}

// 暴露方法
defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => 
    tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order)
})
</script>

<style lang="scss" scoped>
.data-table {
  .table-toolbar {
    @include flex-between;
    margin-bottom: $spacing-md;
    padding: $spacing-md 0;
    
    .toolbar-left {
      @include flex-center;
      gap: $spacing-sm;
    }
    
    .toolbar-right {
      @include flex-center;
      gap: $spacing-sm;
    }
  }
  
  .table-pagination {
    margin-top: $spacing-md;
    @include flex-center;
  }
}
</style>
```

### 搜索过滤模式

```vue
<!-- SearchForm.vue -->
<template>
  <div class="search-form">
    <el-form
      ref="formRef"
      :model="searchData"
      :inline="true"
      :label-width="labelWidth"
      @submit.prevent="handleSearch"
    >
      <!-- 动态生成搜索字段 -->
      <el-form-item
        v-for="field in searchFields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
      >
        <!-- 输入框 -->
        <el-input
          v-if="field.type === 'input'"
          v-model="searchData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          clearable
          style="width: 200px;"
          @keyup.enter="handleSearch"
        />
        
        <!-- 选择器 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="searchData[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          clearable
          style="width: 150px;"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        
        <!-- 日期范围选择器 -->
        <el-date-picker
          v-else-if="field.type === 'dateRange'"
          v-model="searchData[field.prop]"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 240px;"
        />
        
        <!-- 日期时间范围选择器 -->
        <el-date-picker
          v-else-if="field.type === 'dateTimeRange'"
          v-model="searchData[field.prop]"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 360px;"
        />
        
        <!-- 数字范围 -->
        <div v-else-if="field.type === 'numberRange'" class="number-range">
          <el-input-number
            v-model="searchData[`${field.prop}_min`]"
            :placeholder="field.minPlaceholder || '最小值'"
            :min="field.min"
            :max="field.max"
            style="width: 100px;"
          />
          <span class="separator">-</span>
          <el-input-number
            v-model="searchData[`${field.prop}_max`]"
            :placeholder="field.maxPlaceholder || '最大值'"
            :min="field.min"
            :max="field.max"
            style="width: 100px;"
          />
        </div>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button :icon="Refresh" @click="handleReset">
          重置
        </el-button>
        
        <!-- 展开/收起按钮 -->
        <el-button
          v-if="searchFields.length > showFieldCount"
          type="text"
          @click="toggleExpanded"
        >
          {{ expanded ? '收起' : '展开' }}
          <el-icon class="ml-1">
            <ArrowUp v-if="expanded" />
            <ArrowDown v-else />
          </el-icon>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Search, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface SearchField {
  prop: string
  label: string
  type: 'input' | 'select' | 'dateRange' | 'dateTimeRange' | 'numberRange'
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  minPlaceholder?: string
  maxPlaceholder?: string
}

interface Props {
  fields: SearchField[]
  modelValue?: Record<string, any>
  showFieldCount?: number
  labelWidth?: string
}

interface Emits {
  'update:modelValue': [value: Record<string, any>]
  search: [params: Record<string, any>]
  reset: []
}

const props = withDefaults(defineProps<Props>(), {
  showFieldCount: 3,
  labelWidth: '80px'
})

const emit = defineEmits<Emits>()

const formRef = ref()
const expanded = ref(false)

// 搜索数据
const searchData = reactive<Record<string, any>>({})

// 显示的字段
const visibleFields = computed(() => {
  if (expanded.value) {
    return props.fields
  }
  return props.fields.slice(0, props.showFieldCount)
})

// 初始化搜索数据
const initSearchData = () => {
  props.fields.forEach(field => {
    if (props.modelValue && props.modelValue[field.prop] !== undefined) {
      searchData[field.prop] = props.modelValue[field.prop]
    } else {
      // 设置默认值
      switch (field.type) {
        case 'select':
        case 'input':
          searchData[field.prop] = ''
          break
        case 'dateRange':
        case 'dateTimeRange':
          searchData[field.prop] = []
          break
        case 'numberRange':
          searchData[`${field.prop}_min`] = null
          searchData[`${field.prop}_max`] = null
          break
      }
    }
  })
}

// 搜索处理
const handleSearch = () => {
  const params = { ...searchData }
  
  // 处理数字范围
  props.fields.forEach(field => {
    if (field.type === 'numberRange') {
      const minValue = params[`${field.prop}_min`]
      const maxValue = params[`${field.prop}_max`]
      
      delete params[`${field.prop}_min`]
      delete params[`${field.prop}_max`]
      
      if (minValue !== null && maxValue !== null) {
        params[field.prop] = [minValue, maxValue]
      }
    }
  })
  
  // 移除空值
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null || 
        (Array.isArray(params[key]) && params[key].length === 0)) {
      delete params[key]
    }
  })
  
  emit('update:modelValue', params)
  emit('search', params)
}

// 重置处理
const handleReset = () => {
  initSearchData()
  emit('update:modelValue', {})
  emit('reset')
}

// 切换展开状态
const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(searchData, newValue)
    }
  },
  { deep: true }
)

// 监听字段变化
watch(
  () => props.fields,
  () => {
    initSearchData()
  },
  { immediate: true, deep: true }
)

// 暴露方法
defineExpose({
  search: handleSearch,
  reset: handleReset,
  getSearchData: () => ({ ...searchData }),
  setSearchData: (data: Record<string, any>) => {
    Object.assign(searchData, data)
  }
})
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: $spacing-md;
  padding: $spacing-md;
  background: white;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;

  .number-range {
    @include flex-center;
    gap: $spacing-xs;

    .separator {
      color: $text-color-secondary;
    }
  }
}
</style>
```

## 对话框模式

### 通用对话框组件

```vue
<!-- BaseDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :top="top"
    :modal="modal"
    :modal-append-to-body="modalAppendToBody"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :custom-class="customClass"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :destroy-on-close="destroyOnClose"
  >
    <!-- 对话框内容 -->
    <div class="dialog-content" :style="{ maxHeight: contentMaxHeight }">
      <slot />
    </div>

    <!-- 自定义底部 -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>

    <!-- 默认底部按钮 -->
    <template v-else-if="showDefaultFooter" #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">
          {{ cancelText }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="disabled"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  fullscreen?: boolean
  top?: string
  modal?: boolean
  modalAppendToBody?: boolean
  appendToBody?: boolean
  lockScroll?: boolean
  customClass?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean
  showDefaultFooter?: boolean
  confirmText?: string
  cancelText?: string
  loading?: boolean
  disabled?: boolean
  contentMaxHeight?: string
}

interface Emits {
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  closed: []
  opened: []
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '50%',
  fullscreen: false,
  top: '15vh',
  modal: true,
  modalAppendToBody: true,
  appendToBody: true,
  lockScroll: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  showClose: true,
  destroyOnClose: false,
  showDefaultFooter: true,
  confirmText: '确定',
  cancelText: '取消',
  loading: false,
  disabled: false,
  contentMaxHeight: '60vh'
})

const emit = defineEmits<Emits>()

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 关闭前的处理
const handleBeforeClose = (done: () => void) => {
  if (props.loading) {
    return // 加载中不允许关闭
  }
  handleCancel()
  done()
}

// 确认按钮处理
const handleConfirm = () => {
  emit('confirm')
}

// 取消按钮处理
const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

// 监听对话框状态
watch(visible, (newValue) => {
  if (newValue) {
    emit('opened')
  } else {
    emit('closed')
  }
})
</script>

<style lang="scss" scoped>
.dialog-content {
  overflow-y: auto;
  padding-right: $spacing-xs; // 预留滚动条空间
}

.dialog-footer {
  @include flex-end;
  gap: $spacing-sm;
}
</style>
```

### 对话框管理Composable

```typescript
// src/composables/useDialog.ts
import { ref, type Ref } from 'vue'

export interface UseDialogOptions {
  title?: string
  width?: string | number
  confirmText?: string
  cancelText?: string
  showDefaultFooter?: boolean
  closeOnClickModal?: boolean
}

export function useDialog<T = any>(options: UseDialogOptions = {}) {
  const visible = ref(false)
  const loading = ref(false)
  const data = ref<T | null>(null)
  const resolve = ref<(value: any) => void>()
  const reject = ref<(reason?: any) => void>()

  // 打开对话框
  const open = (initialData?: T): Promise<any> => {
    return new Promise((res, rej) => {
      data.value = initialData || null
      visible.value = true
      resolve.value = res
      reject.value = rej
    })
  }

  // 关闭对话框
  const close = () => {
    visible.value = false
    data.value = null
    loading.value = false
  }

  // 确认操作
  const confirm = async (action?: () => Promise<any>) => {
    if (!resolve.value) return

    try {
      loading.value = true
      
      let result
      if (action) {
        result = await action()
      }
      
      resolve.value(result)
      close()
    } catch (error) {
      if (reject.value) {
        reject.value(error)
      }
    } finally {
      loading.value = false
    }
  }

  // 取消操作
  const cancel = () => {
    if (reject.value) {
      reject.value(new Error('User cancelled'))
    }
    close()
  }

  // 设置加载状态
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  // 更新数据
  const updateData = (newData: T) => {
    data.value = newData
  }

  return {
    // Refs
    visible: visible as Ref<boolean>,
    loading: loading as Ref<boolean>,
    data: data as Ref<T | null>,
    
    // Options
    ...options,
    
    // Methods
    open,
    close,
    confirm,
    cancel,
    setLoading,
    updateData
  }
}

// 确认对话框
export const useConfirmDialog = () => {
  const confirm = (
    message: string,
    title = '确认',
    options: {
      type?: 'warning' | 'info' | 'success' | 'error'
      confirmButtonText?: string
      cancelButtonText?: string
    } = {}
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      ElMessageBox.confirm(message, title, {
        confirmButtonText: options.confirmButtonText || '确定',
        cancelButtonText: options.cancelButtonText || '取消',
        type: options.type || 'warning'
      })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  return { confirm }
}
```

## 加载和状态模式

### 全屏加载组件

```vue
<!-- LoadingOverlay.vue -->
<template>
  <div v-if="visible" class="loading-overlay">
    <div class="loading-backdrop" />
    <div class="loading-content">
      <el-icon class="loading-icon" :size="size">
        <Loading />
      </el-icon>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  text?: string
  size?: number
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  @include flex-center;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.loading-content {
  position: relative;
  @include flex-center(column);
  gap: $spacing-md;
  padding: $spacing-xl;
  background: white;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-dark;
}

.loading-icon {
  animation: spin 1s linear infinite;
  color: $primary-color;
}

.loading-text {
  margin: 0;
  font-size: $font-size-base;
  color: $text-color-regular;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

### 状态管理Composable

```typescript
// src/composables/useAsyncState.ts
import { ref, type Ref } from 'vue'

export interface UseAsyncStateOptions<T, E = Error> {
  immediate?: boolean
  resetOnExecute?: boolean
  shallow?: boolean
  delay?: number
  onSuccess?: (data: T) => void
  onError?: (error: E) => void
}

export interface UseAsyncStateReturn<T, E = Error> {
  state: 'idle' | 'pending' | 'success' | 'error'
  data: Ref<T | null>
  error: Ref<E | null>
  loading: Ref<boolean>
  execute: () => Promise<T>
  reset: () => void
}

export function useAsyncState<T, E = Error>(
  promise: () => Promise<T>,
  options: UseAsyncStateOptions<T, E> = {}
): UseAsyncStateReturn<T, E> {
  const {
    immediate = false,
    resetOnExecute = true,
    delay = 0,
    onSuccess,
    onError
  } = options

  const state = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const data = ref<T | null>(null)
  const error = ref<E | null>(null)
  const loading = ref(false)

  const execute = async (): Promise<T> => {
    if (resetOnExecute) {
      reset()
    }

    state.value = 'pending'
    loading.value = true

    try {
      // 延迟执行
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const result = await promise()
      
      data.value = result
      error.value = null
      state.value = 'success'
      
      onSuccess?.(result)
      
      return result
    } catch (err) {
      const errorObj = err as E
      error.value = errorObj
      data.value = null
      state.value = 'error'
      
      onError?.(errorObj)
      
      throw errorObj
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    state.value = 'idle'
    data.value = null
    error.value = null
    loading.value = false
  }

  if (immediate) {
    execute()
  }

  return {
    state: state as Ref<'idle' | 'pending' | 'success' | 'error'>,
    data: data as Ref<T | null>,
    error: error as Ref<E | null>,
    loading: loading as Ref<boolean>,
    execute,
    reset
  }
}
```

## 最佳实践

### 1. 组件设计
- 保持组件的单一职责
- 使用props进行数据传递
- 使用emits进行事件通信
- 合理使用插槽(slot)

### 2. 状态管理
- 使用响应式数据
- 避免直接修改props
- 使用计算属性优化性能
- 合理使用watch和watchEffect

### 3. 错误处理
- 提供友好的错误提示
- 使用try-catch处理异步错误
- 实现错误边界组件
- 记录错误日志

### 4. 性能优化
- 使用v-show和v-if的合适场景
- 合理使用key属性
- 避免不必要的组件重渲染
- 使用懒加载和代码分割

### 5. 代码复用
- 提取可复用的composables
- 创建通用组件
- 使用高阶组件模式
- 保持代码的DRY原则

### 6. 用户体验
- 提供加载状态指示
- 实现防抖和节流
- 合理使用过渡动画
- 支持键盘导航