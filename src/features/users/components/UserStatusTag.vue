<template>
  <el-tag
    :type="statusTagType"
    :effect="effect"
    :size="size"
    :class="customClass"
  >
    {{ statusLabel }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElTag } from 'element-plus';
import type { UserStatus } from '../types';

interface Props {
  status: UserStatus;
  size?: 'large' | 'default' | 'small';
  effect?: 'dark' | 'light' | 'plain';
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  effect: 'light',
  customClass: '',
});

const statusLabel = computed((): string => {
  const labels = {
    active: '启用',
    inactive: '禁用',
  };
  return labels[props.status] || props.status;
});

const statusTagType = computed(
  (): 'success' | 'danger' | 'info' | 'warning' | 'primary' => {
    const types: Record<UserStatus, 'success' | 'danger'> = {
      active: 'success',
      inactive: 'danger',
    };
    return types[props.status] ?? 'info';
  }
);
</script>

<style scoped>
.el-tag {
  font-weight: 500;
}
</style>
