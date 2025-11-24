<template>
  <el-button
    :class="yjButtonClass"
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    :plain="plain"
    :round="round"
    :circle="circle"
    :autofocus="autofocus"
    :native-type="nativeType"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElButton } from 'element-plus';

// TypeScript Interfaces
export interface YjButtonProps {
  /** Button type */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default';
  /** Button size */
  size?: 'large' | 'default' | 'small';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether to show loading state */
  loading?: boolean;
  /** Button icon (Element Plus icon component) */
  icon?: object;
  /** Whether button is plain */
  plain?: boolean;
  /** Whether button has rounded corners */
  round?: boolean;
  /** Whether button is circular */
  circle?: boolean;
  /** Whether button auto gets focus */
  autofocus?: boolean;
  /** Native button type */
  nativeType?: 'button' | 'submit' | 'reset';
  /** Button variant for custom styling */
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export interface YjButtonEmits {
  /** Triggered when button is clicked */
  (e: 'click', event: MouseEvent): void;
}

// Props and Emits
const props = withDefaults(defineProps<YjButtonProps>(), {
  type: 'default',
  size: 'default',
  disabled: false,
  loading: false,
  plain: false,
  round: false,
  circle: false,
  autofocus: false,
  nativeType: 'button',
  variant: 'default'
});

const emit = defineEmits<YjButtonEmits>();

// Computed
const yjButtonClass = computed(() => {
  const classes = ['yj-button'];

  if (props.variant && props.variant !== 'default') {
    classes.push(`yj-button--${props.variant}`);
  }

  return classes;
});

// Methods
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.yj-button {
  transition: all 0.3s ease;
  border-radius: var(--el-border-radius-base);
  font-weight: 500;
}

/* Variant styles */
.yj-button--outline {
  background-color: transparent !important;
  border-width: 2px;
}

.yj-button--outline.el-button--primary {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.yj-button--outline.el-button--primary:hover {
  background-color: var(--el-color-primary) !important;
  color: #fff;
}

.yj-button--outline.el-button--success {
  color: var(--el-color-success);
  border-color: var(--el-color-success);
}

.yj-button--outline.el-button--success:hover {
  background-color: var(--el-color-success) !important;
  color: #fff;
}

.yj-button--outline.el-button--warning {
  color: var(--el-color-warning);
  border-color: var(--el-color-warning);
}

.yj-button--outline.el-button--warning:hover {
  background-color: var(--el-color-warning) !important;
  color: #fff;
}

.yj-button--outline.el-button--danger {
  color: var(--el-color-danger);
  border-color: var(--el-color-danger);
}

.yj-button--outline.el-button--danger:hover {
  background-color: var(--el-color-danger) !important;
  color: #fff;
}

.yj-button--ghost {
  background-color: transparent !important;
  border-color: transparent !important;
}

.yj-button--ghost.el-button--primary {
  color: var(--el-color-primary);
}

.yj-button--ghost.el-button--primary:hover {
  background-color: var(--el-color-primary-light-9) !important;
}

.yj-button--ghost.el-button--success {
  color: var(--el-color-success);
}

.yj-button--ghost.el-button--success:hover {
  background-color: var(--el-color-success-light-9) !important;
}

.yj-button--ghost.el-button--warning {
  color: var(--el-color-warning);
}

.yj-button--ghost.el-button--warning:hover {
  background-color: var(--el-color-warning-light-9) !important;
}

.yj-button--ghost.el-button--danger {
  color: var(--el-color-danger);
}

.yj-button--ghost.el-button--danger:hover {
  background-color: var(--el-color-danger-light-9) !important;
}

.yj-button--link {
  background-color: transparent !important;
  border: none !important;
  color: var(--el-color-primary);
  text-decoration: none;
  padding: 0;
  height: auto;
  line-height: 1.5;
}

.yj-button--link:hover {
  text-decoration: underline;
  background-color: transparent !important;
}

.yj-button--link.el-button--success {
  color: var(--el-color-success);
}

.yj-button--link.el-button--warning {
  color: var(--el-color-warning);
}

.yj-button--link.el-button--danger {
  color: var(--el-color-danger);
}

/* Size adjustments for variant */
.yj-button--link.el-button--large {
  font-size: var(--el-font-size-base);
}

.yj-button--link.el-button--small {
  font-size: var(--el-font-size-extra-small);
}

/* YJ Button specific enhancements */
.yj-button {
  font-family: var(--el-font-family);
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.yj-button:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.yj-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

/* Disabled state */
.yj-button:disabled {
  box-shadow: none !important;
  transform: none !important;
}

/* Loading state */
.yj-button.is-loading {
  box-shadow: none !important;
  transform: none !important;
}

/* Custom brand colors */
.yj-button--brand {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.yj-button--brand:hover {
  background: linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%);
}

/* Responsive design */
@media (max-width: 768px) {
  .yj-button {
    font-size: 14px;
    padding: 8px 16px;
  }

  .yj-button.el-button--large {
    font-size: 16px;
    padding: 12px 24px;
  }

  .yj-button.el-button--small {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
