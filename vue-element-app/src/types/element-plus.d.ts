// Element Plus 类型声明
interface ElementPlusLocale {
  name: string;
  el: Record<string, string>;
  [key: string]: unknown;
}

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const locale: ElementPlusLocale;
  export default locale;
}

declare module 'element-plus/dist/locale/*' {
  const locale: ElementPlusLocale;
  export default locale;
}
