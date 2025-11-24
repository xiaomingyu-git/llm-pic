<template>
  <div class="user-actions" :class="{ 'user-actions--compact': compact }">
    <el-button
      type="primary"
      :size="buttonSize"
      text
      :class="['action-btn', 'action-btn--edit']"
      @click="handleEdit"
    >
      <el-icon><Edit /></el-icon>
      <span v-if="showText">编辑</span>
    </el-button>

    <el-button
      type="success"
      :size="buttonSize"
      text
      :class="['action-btn', 'action-btn--view']"
      @click="handleView"
    >
      <el-icon><View /></el-icon>
      <span v-if="showText">查看</span>
    </el-button>

    <el-button
      type="danger"
      :size="buttonSize"
      text
      :class="['action-btn', 'action-btn--delete']"
      @click="handleDelete"
      :disabled="loading"
    >
      <el-icon><Delete /></el-icon>
      <span v-if="showText">删除</span>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElButton, ElIcon } from 'element-plus';
import { Edit, Delete, View } from '@element-plus/icons-vue';
import type { User } from '../types';

interface Props {
  user: User;
  index: number;
  size?: 'large' | 'default' | 'small';
  compact?: boolean;
  showText?: boolean;
  loading?: boolean;
}

interface Emits {
  (e: 'edit', user: User, index: number): void;
  (e: 'view', user: User): void;
  (e: 'delete', user: User, index: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  compact: false,
  showText: true,
  loading: false,
});

const emit = defineEmits<Emits>();

const buttonSize = computed(() => (props.compact ? 'small' : props.size));

const handleEdit = () => {
  emit('edit', props.user, props.index);
};

const handleView = () => {
  emit('view', props.user);
};

const handleDelete = () => {
  emit('delete', props.user, props.index);
};
</script>

<style scoped>
.user-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.user-actions--compact {
  gap: 2px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: var(--el-color-primary-light-9);
  transform: translateY(-1px);
}

.action-btn--edit:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.action-btn--view:hover {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.action-btn--delete:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.action-btn .el-icon {
  font-size: 14px;
}

.user-actions--compact .action-btn {
  padding: 2px 6px;
  min-height: 24px;
}

.user-actions--compact .action-btn .el-icon {
  font-size: 12px;
}

.user-actions--compact .action-btn span {
  display: none;
}
</style>
