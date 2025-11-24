// Vue 3 + Element Plus PropType 类型修复
// 解决 "Type 'string' is not assignable to type '{ readonly type: PropType<string>... }" 错误

import type { PropType } from 'vue';

// 扩展 PropType 使其与字符串类型兼容
declare module '@vue/runtime-core' {
  interface PropOptions<T = any> {
    type?: PropType<T> | (new () => T) | (() => PropType<T> | (new () => T)) | true | null;
    required?: boolean;
    default?: T | (() => T) | null | undefined;
    validator?(value: unknown): boolean;
    __epPropKey?: boolean;
  }
}

// 全局修复 Element Plus 类型
declare module 'element-plus' {
  // 修复 ElButton 组件类型
  interface ElButtonProps {
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default' | PropType<string>;
    size?: 'large' | 'default' | 'small' | PropType<string>;
    disabled?: boolean | PropType<boolean>;
    loading?: boolean | PropType<boolean>;
    plain?: boolean | PropType<boolean>;
    round?: boolean | PropType<boolean>;
    circle?: boolean | PropType<boolean>;
    [key: string]: unknown;
  }

  // 修复 ElTable 组件类型
  interface ElTableProps {
    data?: any[] | PropType<any[]>;
    stripe?: boolean | PropType<boolean>;
    border?: boolean | PropType<boolean>;
    height?: string | number | PropType<string | number>;
    maxHeight?: string | number | PropType<string | number>;
    emptyText?: string | PropType<string>;
    style?: string | Record<string, any>;
    [key: string]: unknown;
  }

  // 修复 ElFormItem 组件类型
  interface ElFormItemProps {
    required?: boolean | PropType<boolean>;
    error?: string | PropType<string>;
    validateStatus?: 'success' | 'warning' | 'error' | 'validating' | PropType<string>;
    style?: string | Record<string, any>;
    [key: string]: unknown;
  }

  // 修复 ElInput 组件类型
  interface ElInputProps {
    type?: string | PropType<string>;
    modelValue?: string | number | PropType<string | number>;
    placeholder?: string | PropType<string>;
    disabled?: boolean | PropType<boolean>;
    style?: string | Record<string, any>;
    [key: string]: unknown;
  }

  // 修复 ElSelect 组件类型
  interface ElSelectProps {
    modelValue?: any | PropType<any>;
    placeholder?: string | PropType<string>;
    disabled?: boolean | PropType<boolean>;
    style?: string | Record<string, any>;
    [key: string]: unknown;
  }
}

// 修复 Vue 全局组件类型
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    ElButton: any;
    ElTable: any;
    ElFormItem: any;
    ElInput: any;
    ElSelect: any;
  }
}

// 导出修复后的类型
export type FixedPropType<T> = PropType<T> | T;

// 辅助函数来创建兼容的 props 定义
export function createPropType<T>(type: PropType<T> | T): PropType<T> {
  return type as PropType<T>;
}

export { };
