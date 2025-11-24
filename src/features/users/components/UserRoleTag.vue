<template>
  <el-tag
    :type="roleTagType"
    :effect="effect"
    :size="size"
    :class="customClass"
  >
    <el-icon v-if="showIcon" class="role-icon">
      <component :is="roleIcon" />
    </el-icon>
    {{ roleLabel }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElTag, ElIcon } from 'element-plus';
import { UserFilled, Avatar, Lock } from '@element-plus/icons-vue';
import type { UserRole } from '../types';

interface Props {
  role: UserRole;
  size?: 'large' | 'default' | 'small';
  effect?: 'dark' | 'light' | 'plain';
  showIcon?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  effect: 'light',
  showIcon: false,
  customClass: '',
});

const roleLabel = computed((): string => {
  const labels = {
    admin: '管理员',
    user: '普通用户',
    moderator: '协管员',
  };
  return labels[props.role] || props.role;
});

const roleTagType = computed(
  (): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const types = {
      admin: 'danger',
      user: 'primary',
      moderator: 'warning',
    };
    return types[props.role] || 'info';
  }
);

const roleIcon = computed(() => {
  const icons = {
    admin: Lock,
    user: UserFilled,
    moderator: Avatar,
  };
  return icons[props.role] || UserFilled;
});
</script>

<style scoped>
.el-tag {
  font-weight: 500;
}

.role-icon {
  margin-right: 4px;
  font-size: 14px;
}
</style>
