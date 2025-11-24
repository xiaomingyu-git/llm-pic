// Volar + Vue 3 类型修复
// 解决 String 与 PropType 类型兼容性问题

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // 添加全局属性类型
  }

  // 修复 PropType 类型兼容性
  interface PropOptions<_T = any> {
    type?: any;
    required?: boolean;
    default?: any;
    validator?(value: any): boolean;
  }
}

// 全局 Vue 类型
declare global {
  const __VUE_OPTIONS_API__: boolean;
  const __VUE_PROD_DEVTOOLS__: boolean;
  const __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: boolean;
}
