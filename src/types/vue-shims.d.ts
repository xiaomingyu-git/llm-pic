// Vue 3 + TypeScript + Element Plus 类型声明
// 解决 exactOptionalPropertyTypes 模式下的类型兼容性问题

import type { PropType } from 'vue';

// Vue 3 defineProps 类型扩展
declare module '@vue/runtime-core' {
  interface PropOptions<T = any> {
    type?: PropType<T> | true | null;
    required?: boolean;
    default?: T | (() => T) | null | undefined;
    validator?(value: unknown): boolean;
    __epPropKey?: boolean;
  }

  interface PropType<T> {
    new(): T;
    __propKey?: boolean;
  }
}

// Element Plus 组件属性类型兼容性
declare module 'element-plus' {
  // 修复 PropType 相关的类型问题
  export interface ComponentPropsBase {
    [key: string]: any;
  }

  // ElButton 类型修复
  interface ElButtonProps {
    type?: string | PropType<string>;
    size?: string | PropType<string>;
    disabled?: boolean | PropType<boolean>;
    loading?: boolean | PropType<boolean>;
  }

  // ElTable 类型修复
  interface ElTableProps {
    data?: any[] | PropType<any[]>;
    stripe?: boolean | PropType<boolean>;
    border?: boolean | PropType<boolean>;
    height?: string | number | PropType<string | number>;
    maxHeight?: string | number | PropType<string | number>;
    emptyText?: string | PropType<string>;
    style?: string | Record<string, any>;
  }

  // ElFormItem 类型修复
  interface ElFormItemProps {
    required?: boolean | PropType<boolean>;
    error?: string | PropType<string>;
    validateStatus?: string | PropType<string>;
    style?: string | Record<string, any>;
  }
}

// 全局属性类型扩展
declare global {
  interface Window {
    __VUE_DEVTOOLS_TOAST__?: any;
  }
}

export { };
