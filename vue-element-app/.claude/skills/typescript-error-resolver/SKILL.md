---
name: typescript-error-resolver
description: Automatically fix TypeScript compilation errors. Use this skill when TypeScript checking fails with compilation errors, type mismatches, or strict mode violations. ALL ERRORS MUST BE FIXED - no exceptions.

# TypeScript 错误修复技能

## 目的
自动修复 TypeScript 编译错误，确保代码符合严格模式要求。

## 使用时机
- TypeScript 编译失败
- 类型不匹配错误
- 严格模式违反
- Vue 3 + TypeScript 类型错误
- ESLint TypeScript 规则错误

## 🚨 关键规则
- **ALL ERRORS MUST BE CAPTURED** - 不允许任何错误
- 严格模式类型检查
- 遵循 Vue 3 类型安全
- 不使用 `any` 类型

## 核心能力
- TypeScript 类型错误修复
- Vue 3 组件类型安全
- Element Plus 组件类型
- 严格模式兼容性
- 类型定义优化

---

## 修复策略

### 1. 类型错误分类
- **未定义类型**：添加正确的类型定义
- **类型不匹配**：修正类型声明
- **严格模式错误**：符合严格检查
- **Vue 组件错误**：props/emits 类型
- **泛型错误**：正确的泛型使用

### 2. Vue 3 特殊处理
```typescript
// 正确的组件类型
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: string]
  close: []
}>()
```

### 3. Element Plus 类型安全
```typescript
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()
```

## 最佳实践

### 类型定义原则
- 明确的接口定义
- 避免 `any` 和 `unknown`
- 使用类型守卫
- 正确的泛型约束

### Vue 3 类型安全
- 使用 `defineProps<T>()`
- 使用 `defineEmits<T>()`
- 响应式数据类型安全
- 组件实例类型正确

### 严格模式遵守
- `strict: true` 配置
- `noUnusedLocals: true`
- `noImplicitAny: true`
- 完整的类型覆盖