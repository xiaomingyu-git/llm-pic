<template>
  <el-button
    :class="buttonClass"
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
interface Props {
  /** Button type */
  type?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'text'
    | 'default';
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

interface Emits {
  /** Triggered when button is clicked */
  (e: 'click', event: MouseEvent): void;
}

// Props and Emits
const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  disabled: false,
  loading: false,
  plain: false,
  round: false,
  circle: false,
  autofocus: false,
  nativeType: 'button',
  variant: 'default',
});

const emit = defineEmits<Emits>();

// Computed
const buttonClass = computed(() => {
  const classes = ['custom-button'];

  if (props.variant && props.variant !== 'default') {
    classes.push(`custom-button--${props.variant}`);
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
.custom-button {
  transition: all 0.3s ease;
  border-radius: var(--el-border-radius-base);
  font-weight: 500;
}

/* Variant styles */
.custom-button--outline {
  background-color: transparent !important;
  border-width: 2px;
}

.custom-button--outline.el-button--primary {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.custom-button--outline.el-button--primary:hover {
  background-color: var(--el-color-primary) !important;
  color: #fff;
}

.custom-button--ghost {
  background-color: transparent !important;
  border-color: transparent !important;
}

.custom-button--ghost.el-button--primary {
  color: var(--el-color-primary);
}

.custom-button--ghost.el-button--primary:hover {
  background-color: var(--el-color-primary-light-9) !important;
}

.custom-button--link {
  background-color: transparent !important;
  border: none !important;
  color: var(--el-color-primary);
  text-decoration: none;
  padding: 0;
  height: auto;
  line-height: 1.5;
}

.custom-button--link:hover {
  text-decoration: underline;
  background-color: transparent !important;
}

/* Size adjustments for variant */
.custom-button--link.el-button--large {
  font-size: var(--el-font-size-base);
}

.custom-button--link.el-button--small {
  font-size: var(--el-font-size-extra-small);
}
</style>
