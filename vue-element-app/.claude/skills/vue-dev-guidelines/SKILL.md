---
name: vue-dev-guidelines
description: Vue 3 + TypeScript + Element Plus 开发指南。现代模式包括组合式API、响应式数据、合理的组件结构、TypeScript最佳实践、Element Plus集成、性能优化、文件组织，以及**Context7 MCP集成用于实时文档获取**。在创建Vue组件、页面、功能、数据获取、样式、路由或处理Vue 3代码时使用。
---

# Vue 3 开发指南

## 🎯 目的

现代Vue 3开发的综合指南，结合TypeScript和Element Plus，强调组合式API、响应式数据模式、合理的组件架构和性能优化。

## ⚡ 使用时机

- 创建新的Vue组件或页面
- 使用Vue 3构建新功能
- 使用组合式API设置响应式数据
- 集成Element Plus组件
- 处理Vue Router
- Vue组件样式设计
- 性能优化
- Vue代码组织
- Vue的TypeScript最佳实践

---

## 🚀 快速开始

### 📋 新组件检查清单

创建Vue组件？遵循此检查清单：

- [ ] 使用 `<script setup lang="ts">` 语法
- [ ] 使用TypeScript接口通过 `defineProps<T>()` 定义props
- [ ] 使用 `defineEmits<T>()` 定义emits
- [ ] 使用 `ref<T>()` 处理基本响应式数据
- [ ] 使用 `reactive<T>()` 处理对象响应式数据
- [ ] 使用 `computed<T>()` 处理派生数据
- [ ] 使用 `watch()` 和 `watchEffect()` 处理副作用
- [ ] 按需导入Element Plus组件
- [ ] 使用带CSS变量的作用域样式
- [ ] 遵循单文件组件结构
- [ ] 🔥 **关键：对象索引访问使用明确的 `Record<Type, ReturnType>` 类型**
- [ ] 🔥 **关键：使用空值合并 `??` 而不是逻辑或 `||` 作为后备值**
- [ ] 🔥 **关键：所有带对象访问的计算属性都是类型安全的**
- [ ] 🚫 **严格禁止：开发时严禁使用 `any` 类型，必须使用明确的类型定义**
- [ ] **🔥 关键：运行 `npm run type-check` - 修复所有TypeScript错误**
- [ ] **🔥 关键：运行 `npx eslint "src/**/*.{ts,vue}" --fix` - 修复所有ESLint错误**
- [ ] **🔥 关键：重复直到两项检查都显示零错误**

### 📁 新功能检查清单

创建功能？设置此结构：

- [ ] 创建 `features/{feature-name}/` 目录
- [ ] 创建子目录：`components/`、`composables/`、`types/`、`utils/`
- [ ] 在 `types/` 中创建TypeScript接口
- [ ] 在 `composables/` 中创建组合式函数
- [ ] 在 `components/` 中创建功能组件
- [ ] 在 `utils/` 中创建实用函数
- [ ] 从功能 `index.ts` 导出公共API

---

## 📚 资源文件导航

### 📖 详细指南文档

| 主题 | 资源文件 | 描述 |
|------|----------|------|
| **组件模式** | [component-patterns.md](resources/component-patterns.md) | Vue 3组件创建和结构 |
| **数据获取** | [data-fetching.md](resources/data-fetching.md) | API服务和异步数据处理 |
| **文件组织** | [file-organization.md](resources/file-organization.md) | 项目结构和模块化 |
| **样式指南** | [styling-guide.md](resources/styling-guide.md) | Element Plus样式最佳实践 |
| **路由配置** | [routing-guide.md](resources/routing-guide.md) | Vue Router 4配置和使用 |
| **性能优化** | [performance.md](resources/performance.md) | Vue 3性能优化技巧 |
| **TypeScript规范** | [typescript-standards.md](resources/typescript-standards.md) | TypeScript类型安全实践 |
| **常见模式** | [common-patterns.md](resources/common-patterns.md) | Vue 3开发常见模式 |
| **完整示例** | [complete-examples.md](resources/complete-examples.md) | 实际项目案例和模板 |

### 🎯 Context7 MCP 集成

此技能自动与Context7 MCP集成，提供：

- 📖 **实时文档获取**：自动获取最新的Element Plus文档
- 🔍 **API参考**：最新组件API和最佳实践
- ⚠️ **弃用警告**：包含最近的API变更通知
- 💡 **替代方案**：过时模式的现代替代方案

---

## 🔧 常用导入速查表

### Vue 3 核心导入
```vue
<script setup lang="ts">
// Vue 3 组合式API
import { ref, reactive, computed, watch, onMounted } from 'vue';

// Vue Router
import { useRouter, useRoute } from 'vue-router';

// Element Plus 组件
import { ElButton, ElCard, ElForm, ElInput } from 'element-plus';

// Element Plus 图标
import { Plus, Delete, Edit } from '@element-plus/icons-vue';

// 项目组件
import BaseButton from '@/components/ui/BaseButton.vue';

// 组合式函数
import { useAuth } from '@/composables/useAuth';

// 类型
import type { User, ApiResponse } from '@/types';

// Props 和 Emits
interface Props {
  userId: number;
  title: string;
}

interface Emits {
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ✅ 正确的类型定义示例
// ❌ 错误：使用 any
const userData: any = {}

// ✅ 正确：使用明确的接口类型
interface User {
  id: number;
  name: string;
  email: string;
}

const userData: User = {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com'
}

// ✅ 正确：使用泛型类型
const items = ref<User[]>([])
const loading = ref<boolean>(false)
const pagination = ref<{
  page: number;
  pageSize: number;
  total: number;
}>({
  page: 1,
  pageSize: 10,
  total: 0
})
</script>
```

### 🔍 验证工作流

**Vue专属验证步骤：**
1. **类型检查**：`npm run type-check`
2. **ESLint检查**：`npx eslint "src/**/*.{vue,ts}" --fix`
3. **构建测试**：`npm run build`
4. **组件渲染**：浏览器控制台验证
5. **热重载**：开发模式正常工作

---

## 🏗️ 项目结构参考

### 当前项目结构
```
src/
  features/
    diagram/           # 图表功能模块
    llm/              # LLM集成模块
  components/           # 可重用组件
    Button.vue
    TestEnhancedButton.vue
    YjButton.vue
    YjTable.vue
  views/               # 页面组件
    HomePage.vue
    TablePage.vue
    UsersView.vue
  router/             # 路由配置
    index.ts
  App.vue             # 根组件
  main.ts             # 应用入口
```

### 推荐扩展结构
```
src/
  features/
    {feature-name}/
      components/    # 功能组件
      composables/    # 组合式函数
      types/          # 类型定义
      utils/          # 工具函数
      services/       # API服务
      index.ts        # 公共导出
  
  components/
    ui/              # UI组件
      BaseButton.vue
      BaseModal.vue
    common/          # 通用组件
      LoadingSpinner.vue
  
  composables/       # 全局组合式函数
    useApi.ts
    useAuth.ts
  
  types/              # 全局类型
    index.ts
    api.ts
  
  utils/              # 全局工具
    helpers.ts
    validators.ts
```

---

## 🔗 核心原则

1. **组合式API优先**：使用 `<script setup>` 和组合式API
2. **类型安全**：为props、emits和数据使用TypeScript接口
3. **严格类型约束**：🚫 **开发时严禁使用 `any` 类型，必须使用明确的类型定义**
4. **响应式模式**：使用 `ref()`、`reactive()`、`computed()` 进行状态管理
5. **Element Plus集成**：一致的设计系统
6. **可组合逻辑**：使用组合式函数的可重用逻辑
7. **作用域样式**：组件特定样式
8. **性能意识**：懒加载和优化
9. **清晰架构**：有组织的功能结构

---

## 🔗 相关技能

- **error-tracking**: Vue应用程序的错误跟踪
- **frontend-error-fixer**: Vue前端错误诊断和修复
- **typescript-error-resolver**: TypeScript错误解决
- **skill-developer**: 技能开发和管理系统

---

**技能状态**：完整的Vue 3 + TypeScript + Element Plus开发指南