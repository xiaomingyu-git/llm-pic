/// <reference types="vite/client" />

// TypeScript 5.0+ compatibility for older versions
type NoInfer<T> = [T][T extends any ? 0 : never]

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
