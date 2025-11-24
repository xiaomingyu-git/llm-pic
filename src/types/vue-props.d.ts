// Vue 3 + Element Plus Props 类型修复
// 解决 PropType 在 exactOptionalPropertyTypes 模式下的类型错误

import type { PropType as VuePropType } from 'vue';

// 重新导出 PropType 类型
export type PropType<T> = VuePropType<T>;

// 通用 Props 类型
export interface BaseProps {
  class?: string;
  style?: string | Record<string, any>;
}

// Element Plus 组件Props兼容性类型
export interface ElComponentProps extends BaseProps {
  [key: string]: unknown;
}

// 修复后的 defineProps 类型辅助函数
export function definePropsType<T>(type: PropType<T>) {
  return type as PropType<T>;
}

// 修复组件 props 类型
export interface ComponentProps {
  // 基础属性
  class?: string;
  style?: string | Record<string, any>;

  // Element Plus 通用属性
  disabled?: boolean;
  loading?: boolean;

  // 类型安全的辅助函数
  [key: string]: unknown;
}
