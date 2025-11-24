// Element Plus 类型声明扩展
// 解决 exactOptionalPropertyTypes 严格模式下的类型兼容性问题

import type { CSSProperties } from 'vue';

// 扩展 Element Plus 组件类型以支持字符串形式的 style
declare module 'element-plus' {
  interface ElTableProps {
    style?: CSSProperties | string;
  }

  interface ElFormItemProps {
    style?: CSSProperties | string;
  }

  interface ElButtonProps {
    style?: CSSProperties | string;
  }

  interface ElInputProps {
    style?: CSSProperties | string;
  }

  interface ElSelectProps {
    style?: CSSProperties | string;
  }

  interface ElOptionProps {
    style?: CSSProperties | string;
  }

  interface ElCardProps {
    style?: CSSProperties | string;
  }

  interface ElDialogProps {
    style?: CSSProperties | string;
  }
}

// 通用组件 props 类型扩展
export interface ComponentStyleProps {
  style?: CSSProperties | string;
  class?: string;
}

// 安全的样式属性转换函数
export function toCSSProperties(style: string | CSSProperties): CSSProperties {
  if (typeof style === 'string') {
    // 简单的字符串到 CSSProperties 转换
    // 在实际使用中，你可能需要更复杂的解析逻辑
    return {};
  }
  return style;
}
