# Claude 集成指南

**给 Claude Code：** 当用户要求你将此展示仓库中的组件集成到他们的项目时，请仔细遵循这些说明。

---

## 概述

这个仓库是一个 Claude Code 基础设施组件的**参考库**，提供了开发工作流程的完整解决方案集合。它包含：

### 🎯 核心功能模块

**技能开发系统 (Skills)**
- **backend-dev-guidelines** - 后端开发最佳实践，涵盖 Express/Prisma/Node.js 架构
- **frontend-dev-guidelines** - 前端开发指南，专注于 React + MUI v7 现代化开发
- **vue-dev-guidelines** - Vue 3 + TypeScript + Element Plus 开发指南
- **route-tester** - API 路由测试工具，支持 JWT cookie 认证验证
- **error-tracking** - Sentry v8 错误监控集成方案
- **skill-developer** - 元技能，教授如何创建和管理自定义 Claude Code 技能

**自动化钩子 (Hooks)**
- **skill-activation-prompt** - 智能技能推荐，根据用户提示自动建议相关技能
- **post-tool-use-tracker** - 文件变更追踪，优化上下文管理和性能
- **tsc-check** - TypeScript 编译检查，适合单体仓库的构建验证

**专业代理 (Agents)**
- **code-architecture-reviewer** - 代码架构审查专家，确保最佳实践和系统集成
- **general-purpose** - 通用研究代理，处理复杂多步骤任务
- **refactor-planner** - 代码重构规划器，分析和制定重构策略
- **frontend-error-fixer** - 前端错误诊断和修复专家
- **documentation-architect** - 文档生成和管理工具

**实用工具 (Commands)**
- **dev-docs** - 开发文档战略规划工具
- **route-research-for-testing** - 路由映射和测试工具

用户会要求你帮助他们将特定部分集成到他们的项目中。你的角色是：

1. **提出澄清问题**了解他们的项目结构和技术栈
2. **复制适当的文件**并确保依赖正确安装
3. **为他们的设置自定义配置**
4. **验证集成**是否正常工作并提供测试指导

**关键原则：** 在假设项目结构之前总是先询问。适用于一个项目的方法不适用于另一个项目。

---

## 📋 参考库功能详解

这个参考库提供了完整的 Claude Code 开发生态系统，包含四个核心组件类别：

### 🛠️ 技能系统 (Skills)

技能是具备特定领域专业知识的自动化助手，能够根据文件类型和关键词自动激活：

| 技能名称 | 功能描述 | 技术要求 | 适用场景 |
|---------|---------|---------|---------|
| **backend-dev-guidelines** | 后端开发架构指导，涵盖分层架构、错误处理、性能优化、测试策略 | Node.js/Express/Prisma/TypeScript | RESTful API 开发、微服务架构 |
| **frontend-dev-guidelines** | 现代前端开发最佳实践，组件设计、状态管理、性能优化 | React 18+/MUI v7/TanStack Query/TypeScript | React 应用开发、单页应用 |
| **vue-dev-guidelines** | Vue 3 + TypeScript + Element Plus 开发指南，Composition API 最佳实践 | Vue 3/TypeScript/Element Plus | Vue 应用开发、现代化前端项目 |
| **route-tester** | API 路由功能验证，认证测试、数据流验证 | JWT cookie 认证（框架无关） | API 开发测试、调试认证问题 |
| **error-tracking** | Sentry v8 错误监控集成、性能追踪、错误报告 | Sentry（支持大多数后端框架） | 生产环境错误监控、性能分析 |
| **skill-developer** | 元技能：教授如何创建、管理和优化自定义 Claude Code 技能 | 无技术要求 | 技能开发、工作流程定制 |

### ⚡ 自动化钩子 (Hooks)

钩子是在特定事件时自动执行的脚本，提供自动化工作流程：

| 钩子名称 | 触发时机 | 功能描述 | 自定义需求 |
|---------|---------|---------|-----------|
| **skill-activation-prompt** | 用户提交提示时 | 智能分析用户意图，推荐相关技能 | 无，开箱即用 |
| **post-tool-use-tracker** | 文件编辑操作后 | 跟踪文件变更，优化上下文管理 | 无，自动适应项目结构 |
| **tsc-check** | 会话结束前 | TypeScript 编译检查，验证代码质量 | 需要配置服务路径（单体仓库） |

### 🤖 专业代理 (Agents)

代理是独立的专家系统，提供专业领域的深度分析和解决方案：

| 代理名称 | 专业领域 | 核心能力 | 典型使用场景 |
|---------|---------|---------|-------------|
| **code-architecture-reviewer** | 代码架构审查 | 最佳实践验证、系统集成检查、代码质量评估 | 代码审查、重构前分析、技术债务评估 |
| **general-purpose** | 通用研究 | 复杂问题研究、多步骤任务执行、信息搜集 | 技术调研、问题排查、方案设计 |
| **refactor-planner** | 重构规划 | 代码结构分析、重构策略制定、风险评估 | 大规模重构、代码优化、架构升级 |
| **frontend-error-fixer** | 前端错误诊断 | TypeScript 错误修复、运行时错误调试、性能问题解决 | 前端开发错误处理、构建问题排查 |
| **documentation-architect** | 文档工程 | 技术文档生成、API 文档编写、架构图设计 | 项目文档化、知识管理、技术传承 |

### 🔧 实用工具 (Commands)

斜杠命令提供快速访问的实用功能：

| 命令名称 | 功能描述 | 输出结果 | 适用场景 |
|---------|---------|---------|---------|
| **/dev-docs** | 开发文档战略规划 | 结构化任务分解、实施路线图 | 项目规划、技术方案设计 |
| **/route-research-for-testing** | 路由测试映射 | 路由列表、测试计划、执行指导 | API 测试、质量保证 |

---

## 🔍 技术栈兼容性检查

**关键：** 在集成技能之前，验证用户的技术栈是否匹配技能要求。

### 前端技能

**frontend-dev-guidelines 需要：**
- React (18+)
- MUI v7
- TanStack Query
- TanStack Router
- TypeScript

**集成前询问：**
"你使用 React 和 MUI v7 吗？"

**如果不：**
```
frontend-dev-guidelines 技能专门为 React + MUI v7 设计。我可以：
1. 帮你使用此作为模板为 [他们的技术栈] 创建类似的技能
2. 提取框架无关的模式（文件组织、性能等）
3. 如果不相关则跳过此技能

你更喜欢哪种？
```

**vue-dev-guidelines 需要：**
- Vue 3
- TypeScript
- Element Plus
- Composition API

**集成前询问：**
"你使用 Vue 3 和 Element Plus 吗？"

**如果不：**
```
vue-dev-guidelines 技能专门为 Vue 3 + Element Plus 设计。我可以：
1. 帮你使用此作为模板为 [你的Vue组件库] 创建类似的技能
2. 提取框架无关的模式（文件组织、性能等）
3. 如果不相关则跳过此技能

你更喜欢哪种？
```

### 后端技能

**backend-dev-guidelines 需要：**
- Node.js/Express
- TypeScript
- Prisma ORM
- Sentry

**集成前询问：**
"你使用 Express 和 Prisma 的 Node.js 吗？"

**如果不：**
```
backend-dev-guidelines 技能是为 Express/Prisma 设计的。我可以：
1. 帮你使用此作为模板为 [他们的技术栈] 创建类似的指导原则
2. 提取架构模式（分层架构适用于任何框架）
3. 跳过此技能

你更喜欢哪种？
```

### 🔧 技术无关的组件

这些组件适用于任何技术栈，无需考虑技术栈兼容性：

**通用技能：**
- ✅ **skill-developer** - 元技能，教授技能开发，无任何技术要求
- ✅ **route-tester** - 路由测试，只需要 JWT cookie 认证（框架无关）
- ✅ **error-tracking** - 错误监控，Sentry 支持大多数后端技术栈

**通用钩子：**
- ✅ **skill-activation-prompt** - 智能技能推荐，完全通用，开箱即用
- ✅ **post-tool-use-tracker** - 文件变更追踪，自动适应任何项目结构

**通用代理：**
- ✅ **general-purpose** - 通用研究和问题解决代理
- ✅ **documentation-architect** - 文档生成，技术栈无关
- ✅ **refactor-planner** - 重构规划，适用于任何代码库
- ✅ **code-architecture-reviewer** - 代码架构审查，适用于多种编程语言

**通用命令：**
- ✅ **/dev-docs** - 文档战略规划，适用于任何项目类型
- ✅ **/dev-docs-update** - 文档更新，适用于已有文档的项目

这些组件可以作为任何项目的基础集成，无需担心技术栈冲突。

---

## 通用集成模式

当用户说：**"将 [组件] 添加到我的项目"**

1. 识别组件类型（技能/钩子/代理/命令）
2. **检查技术栈兼容性**（对于前端/后端技能）
3. 询问他们的项目结构
4. 复制文件或为他们的技术栈适配
5. 为他们的设置自定义
6. 验证集成
7. 提供后续步骤

---

## 集成技能

### 逐步过程

**当用户请求技能时**（例如，"添加 backend-dev-guidelines"）：

#### 1. 了解他们的项目

**询问这些问题：**
- "你的项目结构是什么？单应用、单体仓库还是多服务？"
- "你的 [后端/前端] 代码位于哪里？"
- "你使用什么框架/技术？"

#### 2. 复制技能

```bash
cp -r /path/to/showcase/.claude/skills/[技能名称] \\
      $CLAUDE_PROJECT_DIR/.claude/skills/
```

#### 3. 处理 skill-rules.json

**检查是否存在：**
```bash
ls $CLAUDE_PROJECT_DIR/.claude/skills/skill-rules.json
```

**如果否（不存在）：**
- 从展示复制模板
- 移除用户不需要的技能
- 为他们的项目自定义

**如果是（存在）：**
- 读取他们当前的 skill-rules.json
- 添加新技能条目
- 小心合并以避免破坏现有技能

#### 4. 自定义路径模式

**关键：** 更新 skill-rules.json 中的 `pathPatterns` 以匹配他们的结构：

**示例 - 用户有单体仓库：**
```json
{
  "backend-dev-guidelines": {
    "fileTriggers": {
      "pathPatterns": [
        "packages/api/src/**/*.ts",
        "packages/server/src/**/*.ts",
        "apps/backend/**/*.ts"
      ]
    }
  }
}
```

**示例 - 用户有单个后端：**
```json
{
  "backend-dev-guidelines": {
    "fileTriggers": {
      "pathPatterns": [
        "src/**/*.ts",
        "backend/**/*.ts"
      ]
    }
  }
}
```

**安全通用模式**（不确定时）：
```json
{
  "pathPatterns": [
    "**/*.ts",          // 所有 TypeScript 文件
    "src/**/*.ts",      // 常见的 src 目录
    "backend/**/*.ts"   // 常见的后端目录
  ]
}
```

#### 5. 验证集成

```bash
# 检查技能是否复制
ls -la $CLAUDE_PROJECT_DIR/.claude/skills/[技能名称]

# 验证 skill-rules.json 语法
cat $CLAUDE_PROJECT_DIR/.claude/skills/skill-rules.json | jq .
```

**告诉用户：** "尝试编辑 [他们的后端路径] 中的文件 - 技能应该会激活。"

---

### 技能特定说明

#### backend-dev-guidelines
- **技术要求：** Node.js/Express, Prisma, TypeScript, Sentry
- **询问：** "你使用 Express 和 Prisma 吗？" "你的后端代码在哪里？"
- **如果不同技术栈：** 提供使用此模板进行适配
- **自定义：** pathPatterns
- **示例路径：** `api/`, `server/`, `backend/`, `services/*/src/`
- **适配提示：** 架构模式（Routes→Controllers→Services）适用于大多数框架

#### frontend-dev-guidelines
- **技术要求：** React 18+, MUI v7, TanStack Query/Router, TypeScript
- **询问：** "你使用 React 和 MUI v7 吗？" "你的前端代码在哪里？"
- **如果不同技术栈：** 提供创建适配版本（Vue, Angular 等）
- **自定义：** pathPatterns + 所有框架特定示例
- **示例路径：** `frontend/`, `client/`, `web/`, `apps/web/src/`
- **适配提示：** 文件组织和性能模式可转移，组件代码不行

#### route-tester
- **技术要求：** 基于 JWT cookie 的身份验证（框架无关）
- **询问：** "你使用基于 JWT cookie 的身份验证吗？"
- **如果不：** "此技能专为 JWT cookies 设计。想要我为 [他们的身份验证类型] 适配或跳过它？"
- **自定义：** 服务 URL，身份验证模式
- **适用于：** 使用 JWT cookies 的任何后端框架

#### error-tracking
- **技术要求：** Sentry（适用于大多数后端）
- **询问：** "你使用 Sentry 吗？" "你的后端代码在哪里？"
- **如果没有 Sentry：** "想要用此作为 [他们的错误跟踪] 的模板吗？"
- **自定义：** pathPatterns
- **适配提示：** 错误跟踪理念适用于其他工具（Rollbar, Bugsnag 等）

#### skill-developer
- **技术要求：** 无！
- **按原样复制** - 元技能，完全通用，教授任何技术栈的技能创建

---

## 为不同技术栈适配技能

当用户的技术栈与技能要求不同时，你有几个选择：

### 选项 1：适配现有技能（推荐）

**使用时机：** 用户想要类似的指导原则但用于不同的技术

**过程：**
1. **复制技能作为起点：**
   ```bash
   cp -r showcase/.claude/skills/frontend-dev-guidelines \\
         $CLAUDE_PROJECT_DIR/.claude/skills/vue-dev-guidelines
   ```

2. **识别需要更改的内容：**
   - 框架特定代码示例（React → Vue）
   - 库 API（MUI → Vuetify/PrimeVue）
   - 导入语句
   - 组件模式

3. **保留可转移的内容：**
   - 文件组织原则
   - 性能优化策略
   - TypeScript 标准
   - 通用最佳实践

4. **系统地替换示例：**
   - 询问用户他们的技术栈中的等效模式
   - 将代码示例更新到他们的框架
   - 保持整体结构和部分

5. **更新技能名称和触发器：**
   - 适当重命名技能
   - 为他们的技术栈更新 skill-rules.json 触发器
   - 测试激活

**示例 - 为 Vue 适配 frontend-dev-guidelines：**
```
我将基于 React 技能结构创建 vue-dev-guidelines：
- 将 React.FC → Vue defineComponent
- 将 useSuspenseQuery → Vue 组合式 API
- 将 MUI 组件 → [他们的组件库]
- 保留：文件组织、性能模式、TypeScript 指导原则

这需要几分钟。听起来不错吗？
```

### 选项 2：提取框架无关模式

**使用时机：** 技术栈非常不同，但核心原则适用

**过程：**
1. 通读现有技能
2. 识别框架无关的模式：
   - 分层架构（后端）
   - 文件组织策略
   - 性能优化原则
   - 测试策略
   - 错误处理理念

3. 仅使用这些模式创建新技能
4. 用户稍后可以添加框架特定示例

**示例：**
```
backend-dev-guidelines 使用 Express，但分层架构
（Routes → Controllers → Services → Repositories）也适用于 Django。

我可以创建一个包含以下内容的技能：
- 分层架构模式
- 关注点分离原则
- 错误处理最佳实践
- 测试策略

然后你可以在建立模式时添加 Django 特定示例。
```

### 选项 3：仅用作参考

**使用时机：** 差异太大无法适配，但用户想要灵感

**过程：**
1. 用户浏览现有技能
2. 帮助他们从头创建新技能
3. 使用现有技能的结构作为模板
4. 遵循模块化模式（主要 + 资源文件）

### 什么通常可以跨技术栈转移

**架构与组织：**
- ✅ 分层架构（Routes/Controllers/Services 模式）
- ✅ 关注点分离
- ✅ 文件组织策略（features/ 模式）
- ✅ 渐进式披露（主要 + 资源文件）
- ✅ 数据访问的存储库模式

**开发实践：**
- ✅ 错误处理理念
- ✅ 输入验证的重要性
- ✅ 测试策略
- ✅ 性能优化原则
- ✅ TypeScript 最佳实践

**框架特定代码：**
- ❌ React hooks → 不要转移到 Vue/Angular
- ❌ MUI 组件 → 不同的组件库
- ❌ Prisma 查询 → 不同的 ORM 语法
- ❌ Express 中间件 → 不同的框架模式
- ❌ 路由实现 → 框架特定

### 何时推荐适配 vs 跳过

**推荐适配如果：**
- 用户想要他们的技术栈的类似指导原则
- 核心模式适用（分层架构等）
- 用户有时间帮助提供框架特定示例

**推荐跳过如果：**
- 技术栈完全不同
- 用户不需要那些模式
- 适配会花费太长时间
- 用户更喜欢从头创建

---

## 集成钩子

### 必需钩子（总是可以安全复制）

#### skill-activation-prompt (UserPromptSubmit)

**目的：** 基于用户提示自动建议技能

**集成（无需自定义）：**

```bash
# 复制两个文件
cp showcase/.claude/hooks/skill-activation-prompt.sh \\
   $CLAUDE_PROJECT_DIR/.claude/hooks/
cp showcase/.claude/hooks/skill-activation-prompt.ts \\
   $CLAUDE_PROJECT_DIR/.claude/hooks/

# 使其可执行
chmod +x $CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh

# 如果需要安装依赖
if [ -f "showcase/.claude/hooks/package.json" ]; then
  cp showcase/.claude/hooks/package.json \\
     $CLAUDE_PROJECT_DIR/.claude/hooks/
  cd $CLAUDE_PROJECT_DIR/.claude/hooks && npm install
fi
```

**添加到 settings.json：**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh"
          }
        ]
      }
    ]
  }
}
```

**此钩子完全通用** - 适用于任何地方，无需自定义！

#### post-tool-use-tracker (PostToolUse)

**目的：** 跟踪文件变更用于上下文管理

**集成（无需自定义）：**

```bash
# 复制文件
cp showcase/.claude/hooks/post-tool-use-tracker.sh \\
   $CLAUDE_PROJECT_DIR/.claude/hooks/

# 使其可执行
chmod +x $CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-use-tracker.sh
```

**添加到 settings.json：**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/post-tool-use-tracker.sh"
          }
        ]
      }
    ]
  }
}
```

**此钩子完全通用** - 自动检测项目结构！

---

### 可选钩子（需要大量自定义）

#### tsc-check.sh 和 trigger-build-resolver.sh (停止钩子)

⚠️ **警告：** 这些钩子为特定的多服务单体仓库结构配置。

**集成前询问：**
1. "你有包含多个 TypeScript 服务的单体仓库吗？"
2. "你的服务目录名称是什么？"
3. "你的 tsconfig.json 文件位于哪里？"

**对于简单项目（单服务）：**
- **推荐跳过**这些钩子
- 对于单服务项目它们过于复杂
- 用户可以手动运行 `tsc --noEmit`

**对于复杂项目（多服务单体仓库）：**

1. 复制文件
2. **必须编辑** tsc-check.sh - 找到这个部分：
```bash
case "$repo" in
    email|exports|form|frontend|projects|uploads|users|utilities|events|database)
        echo "$repo"
        return 0
        ;;
esac
```

3. 用用户的实际服务名称替换：
```bash
case "$repo" in
    api|web|auth|payments|notifications)  # ← 用户的服务
        echo "$repo"
        return 0
        ;;
esac
```

4. 在添加到 settings.json 之前手动测试：
```bash
./.claude/hooks/tsc-check.sh
```

**重要：** 如果此钩子失败，它将阻止停止事件。仅在你确定它适用于他们的设置时才添加。

---

## 集成代理

**代理是独立的** - 最容易集成！

### 标准代理集成

```bash
# 复制代理文件
cp showcase/.claude/agents/[代理名称].md \\
   $CLAUDE_PROJECT_DIR/.claude/agents/
```

**就是这样！** 代理立即工作，无需配置。

### 检查硬编码路径

一些代理可能引用路径。**复制前，读取代理文件并检查：**

- `~/git/old-project/` → 应该是 `$CLAUDE_PROJECT_DIR` 或 `.`
- `/root/git/project/` → 应该是 `$CLAUDE_PROJECT_DIR` 或 `.`
- 硬编码的截图路径 → 询问用户他们想要截图保存在哪里

**如果找到，更新它们：**
```bash
sed -i 's|~/git/old-project/|.|g' $CLAUDE_PROJECT_DIR/.claude/agents/[代理].md
sed -i 's|/root/git/.*PROJECT.*DIR|$CLAUDE_PROJECT_DIR|g' \\
    $CLAUDE_PROJECT_DIR/.claude/agents/[代理].md
```

### 代理特定说明

**auth-route-tester / auth-route-debugger：**
- 需要用户项目中的基于 JWT cookie 的身份验证
- 询问："你使用 JWT cookies 进行身份验证吗？"
- 如果不："这些代理适用于 JWT cookie 身份验证。跳过它们还是要我适配？"

**frontend-error-fixer：**
- 可能引用截图路径
- 询问："截图应该保存在哪里？"

**所有其他代理：**
- 按原样复制，它们完全通用

---

## 集成斜杠命令

```bash
# 复制命令文件
cp showcase/.claude/commands/[命令].md \\
   $CLAUDE_PROJECT_DIR/.claude/commands/
```

### 自定义路径

命令可能引用开发文档路径。**检查并更新：**

**dev-docs 和 dev-docs-update：**
- 查找 `dev/active/` 路径引用
- 询问："你想要开发文档存储在哪里？"
- 更新命令文件中的路径

**route-research-for-testing：**
- 可能引用服务路径
- 询问他们的 API 结构

---

## 通用模式和最佳实践

### 模式：询问项目结构

**不要假设：**
- ❌ "我将为你的 blog-api 服务添加这个"
- ❌ "为你的前端目录配置"

**要询问：**
- ✅ "你的项目结构是什么？单体仓库还是单应用？"
- ✅ "你的后端代码位于哪里？"
- ✅ "你使用工作空间还是有多个服务？"

### 模式：自定义 skill-rules.json

**用户有带工作空间的单体仓库：**
```json
{
  "pathPatterns": [
    "packages/*/src/**/*.ts",
    "apps/*/src/**/*.tsx"
  ]
}
```

**用户有 Nx 单体仓库：**
```json
{
  "pathPatterns": [
    "apps/api/src/**/*.ts",
    "libs/*/src/**/*.ts"
  ]
}
```

**用户有简单结构：**
```json
{
  "pathPatterns": [
    "src/**/*.ts",
    "backend/**/*.ts"
  ]
}
```

### 模式：settings.json 集成

**绝不要直接复制展示的 settings.json！**

相反，**提取和合并**他们需要的部分：

1. 读取他们现有的 settings.json
2. 添加他们想要的钩子配置
3. 保留他们现有的配置

**示例合并：**
```json
{
  // ... 他们现有的配置 ...
  "hooks": {
    // ... 他们现有的钩子 ...
    "UserPromptSubmit": [  // ← 添加此部分
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 验证清单

集成后，**验证这些项目：**

```bash
# 1. 钩子是可执行的
ls -la $CLAUDE_PROJECT_DIR/.claude/hooks/*.sh
# 应该显示：-rwxr-xr-x

# 2. skill-rules.json 是有效的 JSON
cat $CLAUDE_PROJECT_DIR/.claude/skills/skill-rules.json | jq .
# 应该解析没有错误

# 3. 安装了钩子依赖（如果是 TypeScript 钩子）
ls $CLAUDE_PROJECT_DIR/.claude/hooks/node_modules/
# 如果 package.json 存在应该显示包

# 4. Settings.json 是有效的 JSON
cat $CLAUDE_PROJECT_DIR/.claude/settings.json | jq .
# 应该解析没有错误
```

**然后要求用户测试：**
- "尝试编辑 [相关路径] 中的文件 - 技能应该激活"
- "尝试问我关于 [主题] 的问题 - 我应该建议该技能"

---

## 要避免的常见错误

### ❌ 不要：按原样复制 settings.json
**原因：** 停止钩子引用不存在的服务
**要做：** 仅提取 UserPromptSubmit 和 PostToolUse 部分

### ❌ 不要：保留示例服务名称
**原因：** 用户没有 blog-api, auth-service 等
**要做：** 询问他们的实际结构并更新

### ❌ 不要：跳过使钩子可执行
**原因：** 没有执行权限钩子无法运行
**要做：** 复制后总是 `chmod +x`

### ❌ 不要：假设单体仓库结构
**原因：** 大多数项目是单服务
**要做：** 先询问，然后自定义

### ❌ 不要：一次添加所有技能
**原因：** 压倒性且可能不都相关
**要做：** 询问哪些技能与他们的工作相关

### ❌ 不要：不测试就复制停止钩子
**原因：** 如果失败它们会阻止停止事件
**要做：** 先手动测试，仅在正常工作时才添加

---

## 💬 真实场景集成对话

### 🚀 场景 1：全栈开发者 - 完整开发生态搭建

**用户：** "我刚开始一个新的全栈项目，想要设置完整的开发工作流程。你们仓库中有什么推荐？"

**Claude 应该回应：**
```
我推荐为你设置一个完整的开发生态系统！根据你的需求，我会分阶段集成：

**阶段 1：基础自动化（立即生效）**
- skill-activation-prompt：智能技能推荐
- post-tool-use-tracker：文件变更追踪
- skill-developer：教你创建自定义技能

**阶段 2：开发指导**
- backend-dev-guidelines：后端架构最佳实践
- frontend-dev-guidelines：前端现代化开发

**阶段 3：质量保证**
- code-architecture-reviewer：代码架构审查
- error-tracking：生产环境错误监控

在开始之前，让我了解几个关键问题：
1. 你使用什么技术栈？（前端框架、后端框架）
2. 项目结构是怎样的？（单体应用还是单体仓库）
3. 你已经配置了错误监控吗？

这样我可以为你定制最适合的组合。总集成时间大约20-30分钟。
```

### 🏢 场景 2：企业级项目 - 单体仓库集成

**用户：** "我们是一个大型企业项目，使用Nx单体仓库，有微服务架构。需要哪些组件？"

**Claude 应该回应：**
```
对于大型单体仓库项目，我推荐以下企业级组合：

**🔧 必需组件：**
- **skill-activation-prompt** + **post-tool-use-tracker**（自动化基础）
- **tsc-check**（针对多服务TypeScript编译检查）
- **code-architecture-reviewer**（确保代码质量一致）

**🎯 业务组件：**
- **backend-dev-guidelines**（服务间API设计最佳实践）
- **error-tracking**（跨服务错误追踪）
- **refactor-planner**（大规模重构规划）

**需要了解的信息：**
1. 你们的服务名称列表是什么？（用于tsc-check配置）
2. 每个服务使用什么技术栈？
3. 现有的错误监控方案是什么？
4. TypeScript配置是统一还是各服务独立？

这样可以确保钩子正确识别你们的服务结构。
```

### 🎨 场景 3：前端团队 - React专业开发

**用户：** "我们团队专门做React开发，想要提升代码质量和开发效率"

**Claude 应该回应：**
```
对于React专业开发，我推荐前端专家组合：

**🎯 核心技能：**
- **frontend-dev-guidelines**（React 18+ + MUI v7最佳实践）
- **code-architecture-reviewer**（React组件架构审查）
- **frontend-error-fixer**（快速错误诊断和修复）

**⚡ 自动化：**
- **skill-activation-prompt**（上下文感知的React模式推荐）
- **post-tool-use-tracker**（组件文件变更追踪）

**📚 文档化：**
- **documentation-architect**（组件库文档自动生成）

**集成前确认：**
1. 你们使用MUI v7吗？还是其他组件库？
2. 使用什么状态管理？（Redux, Zustand, Context等）
3. 团队规模多大？需要组件库文档吗？
4. 现有的测试策略是什么？

如果你们不使用MUI v7，我可以基于React最佳实践创建适配版本。
```

### 🎨 场景 4：Vue开发团队 - 现代化Vue 3开发

**用户：** "我们团队专注Vue开发，刚迁移到Vue 3 + TypeScript + Element Plus"

**Claude 应该回应：**
```
对于Vue 3专业开发，我推荐Vue专家组合：

**🎯 核心技能：**
- **vue-dev-guidelines**（Vue 3 + Composition API + Element Plus最佳实践）
- **code-architecture-reviewer**（Vue组件架构审查）
- **frontend-error-fixer**（Vue快速错误诊断和修复）

**⚡ 自动化：**
- **skill-activation-prompt**（上下文感知的Vue模式推荐）
- **post-tool-use-tracker**（.vue文件变更追踪）

**📚 文档化：**
- **documentation-architect**（Vue组件库文档自动生成）

**集成前确认：**
1. 你们使用Element Plus吗？还是其他Vue组件库？
2. 使用什么状态管理？（Pinia, Vuex等）
3. 团队规模多大？需要组件库文档吗？
4. 现有的测试策略是什么？（Vitest, Cypress等）

如果你们使用不同的组件库，我可以基于Vue最佳实践创建适配版本。
```

### 🔍 场景 5：技术栈不匹配 - 智能适配

**用户：** "我看到你们主要是React/Express栈，但我们使用Vue + Django，有什么可以用的？"

**Claude 应该回应：**
```
很好的问题！虽然我们的技术栈示例是React/Express，但大部分核心组件都是技术栈无关的：

**✅ 直接可用（无需修改）：**
- **skill-developer**：教你创建Vue/Django专用技能
- **skill-activation-prompt**：智能技能推荐
- **post-tool-use-tracker**：文件变更追踪
- **general-purpose代理**：通用研究和问题解决
- **documentation-architect**：Vue/Django项目文档

**🔧 适配后可用：**
- **backend-guidelines** → 改为Django最佳实践
- **frontend-guidelines** → 改为Vue 3 + Composition API
- **error-tracking**：Sentry对Django完美支持

**🎯 我建议的方案：**
1. 先安装通用组件（5分钟）
2. 然后我基于你们的Vue/Django技术栈创建适配版本
3. 这样你们就有了完整的Vue/Django开发指南

想要我开始这个适配过程吗？大约需要15-20分钟。
```

**用户：** "单应用，代码在 src/api/ 中，是的我们使用 Express"

**Claude 应该：**
1. 复制技能目录
2. 使用 pathPattern 更新 skill-rules.json: `"src/api/**/*.ts"`
3. 验证复制正确
4. 回应：
```
✅ 已添加 backend-dev-guidelines 技能！

配置：
- 技能在编辑 src/api/ 中的文件时触发
- 由关键词如 "controller"、"service"、"route"、"API" 激活

尝试：编辑 src/api/ 中的文件，你应该看到技能建议。
```

### 示例 2：设置钩子

**用户：** "设置技能激活钩子"

**Claude 应该回应：**
```
我将设置技能自动激活系统。这需要两个钩子：
1. skill-activation-prompt - 基于你的提示建议技能
2. post-tool-use-tracker - 跟踪文件变更

你已经有 .claude/settings.json 文件，还是我应该创建一个？
```

**用户：** "我已经有 settings.json"

**Claude 应该：**
1. 读取他们的 settings.json
2. 复制两个钩子文件
3. 在 hooks 目录中运行 npm install
4. 将钩子配置添加到他们的 settings.json（保留现有配置）
5. 使钩子可执行
6. 回应：
```
✅ 技能激活钩子已安装！

我做了什么：
- 复制了 skill-activation-prompt 钩子
- 复制了 post-tool-use-tracker 钩子
- 安装了依赖
- 添加到你的 settings.json

测试：问我"帮助后端开发"我应该建议
backend-dev-guidelines 技能。
```

### 示例 3：添加代理

**用户：** "添加 code-architecture-reviewer 代理"

**Claude 应该：**
```
code-architecture-reviewer 代理审查代码的架构问题
和最佳实践。此代理独立工作，无需配置。

我现在将它复制到你的 .claude/agents/ 目录。
```

**然后：**
1. 复制代理文件
2. 回应：
```
✅ 已添加 code-architecture-reviewer 代理！

使用 Task 工具运行：
- subagent_type: "code-architecture-reviewer"
- prompt: 要审查的代码描述

代理将审查你的代码并提供架构反馈。
```

### 示例 4：技术栈不匹配

**用户：** "将 frontend-dev-guidelines 技能添加到我的 Vue 项目"

**Claude 应该：**
```
我看到你使用 Vue。frontend-dev-guidelines 技能专门
为 React + MUI v7 设计。我有几个选择：

选项 1（推荐）：我可以使用 React 技能作为模板创建 vue-dev-guidelines 技能。我将适配：
- Vue（Composition API, defineComponent）的组件模式
- 将 MUI 示例替换为你的组件库
- 适配 Vue 模式的数据获取
- 保留：文件组织、性能原则、TypeScript 标准

选项 2：仅提取框架无关模式（文件组织、性能、测试）而不包含 React 特定代码。

选项 3：跳过它并帮你从头创建 Vue 指导原则。

你更喜欢哪种？
```

**用户：** "选项 1 听起来不错，我使用 Vuetify"

**Claude 应该：**
1. 将 frontend-dev-guidelines 复制为 vue-dev-guidelines
2. 逐个查看每个资源文件
3. 将 React 模式替换为 Vue Composition API
4. 将 MUI 组件替换为 Vuetify
5. 为 Vue 特定触发器（.vue 文件）更新 skill-rules.json
6. 回应：
```
✅ 已为 Vue 3 + Vuetify 适配的 vue-dev-guidelines 技能！

我更改了什么：
- React.FC 组件 → Vue defineComponent
- MUI v7 示例 → Vuetify 组件
- TanStack Query → 你的数据获取方法
- 文件模式 → .vue 文件

我保留了什么：
- 文件组织（features/ 模式）
- 性能优化策略
- TypeScript 标准
- 加载/错误状态原则

尝试编辑 .vue 文件 - 技能应该激活。
```

---

## 📊 快速参考表

### 🔧 组件集成复杂度评估

| 组件类别 | 组件名称 | 技术要求 | 自定义复杂度 | 集成时间 | 询问的关键问题 |
|---------|---------|---------|-------------|---------|---------------|
| **🛠️ 技能** | **skill-developer** | 无技术要求 | 🟢 无需自定义 | 1分钟 | 按原样复制即可 |
| | **backend-dev-guidelines** | Express/Prisma/TypeScript | 🟡 中等自定义 | 5-10分钟 | "使用Express/Prisma？" "后端代码路径？" |
| | **frontend-dev-guidelines** | React/MUI v7/TanStack | 🟠 高度自定义 | 10-20分钟 | "使用React/MUI v7？" "前端框架？" |
| | **vue-dev-guidelines** | Vue 3/Element Plus/TS | 🟠 高度自定义 | 10-20分钟 | "使用Vue 3 + Element Plus？" "TypeScript？" |
| | **route-tester** | JWT cookie认证 | 🟡 认证配置 | 5分钟 | "使用JWT cookie认证？" "API路径？" |
| | **error-tracking** | Sentry | 🟡 路径配置 | 3-5分钟 | "使用Sentry？" "后端代码路径？" |
| **⚡ 钩子** | **skill-activation-prompt** | 无 | 🟢 开箱即用 | 2分钟 | 无需特殊配置 |
| | **post-tool-use-tracker** | 无 | 🟢 自动适应 | 2分钟 | 无需特殊配置 |
| | **tsc-check** | TypeScript | 🔴 高度复杂 | 15-30分钟 | "单体仓库结构？" "服务列表？" |
| **🤖 代理** | **通用代理** | 无 | 🟢 最少配置 | 1-2分钟 | "截图保存路径？" |
| | **专用代理** | 特定技术栈 | 🟡 技术适配 | 5-10分钟 | "技术栈匹配？" |
| **🔧 命令** | **文档命令** | 无 | 🟡 路径配置 | 3分钟 | "文档存储位置？" |

### 🎯 推荐集成策略

**🟢 新手友好组合（推荐起点）**
```
skill-developer + skill-activation-prompt + post-tool-use-tracker
```
- 总集成时间：5分钟
- 零技术栈要求
- 立即提升开发效率

**🟡 后端开发组合**
```
backend-dev-guidelines + error-tracking + route-tester
```
- 总集成时间：15-20分钟
- 技术栈：Node.js/Express
- 完整的后端开发生态

**🟠 前端开发组合**

**React 选项：**
```
frontend-dev-guidelines + code-architecture-reviewer
```
- 总集成时间：20-30分钟
- 技术栈：React + MUI v7
- 现代前端开发最佳实践

**Vue 3 选项：**
```
vue-dev-guidelines + code-architecture-reviewer
```
- 总集成时间：20-30分钟
- 技术栈：Vue 3 + Element Plus + TypeScript
- 现代Vue开发最佳实践

### ⚠️ 何时推荐跳过或替代方案

| 组件 | 跳过条件 | 推荐替代方案 |
|-----|---------|-------------|
| **tsc-check hooks** | • 单服务项目<br>• 不同构建工具<br>• 简单项目结构 | 使用编辑器内置的类型检查<br>手动运行 `tsc --noEmit` |
| **frontend-dev-guidelines/vue-dev-guidelines** | • 使用Angular/Svelte/其他框架<br>• 不使用MUI/Element Plus<br>• 传统前端项目 | 使用适配方案创建新的技术栈专用技能<br>提取通用模式和最佳实践 |
| **route-tester** | • 不使用JWT认证<br>• 使用session认证<br>• 无认证系统 | 适配为认证测试框架<br>跳过，手动测试API |
| **auth专用代理** | • 不使用cookie认证<br>• 使用OAuth/JWT token<br>• 外部认证服务 | 使用通用代理进行认证调试<br>创建适配版本 |
| **error-tracking** | • 不使用Sentry<br>• 使用其他监控工具<br>• 小型项目 | 适配为其他监控工具<br>跳过，使用简单的console.error |

---

## 给 Claude 的最终提示

**当用户说"添加所有内容"时：**
- 从必需品开始：skill-activation 钩子 + 1-2 个相关技能
- 不要用所有 5 个技能 + 10 个代理压倒他们
- 询问他们实际需要什么

**当某些东西不工作时：**
- 检查验证清单
- 验证路径匹配他们的结构
- 手动测试钩子
- 检查 JSON 语法错误

**当用户不确定时：**
- 推荐从仅 skill-activation 钩子开始
- 添加后端或前端技能（无论他们使用哪个）
- 稍后根据需要添加更多

**总是解释你在做什么：**
- 显示你正在运行的命令
- 解释你为什么要问问题
- 集成后提供清晰的后续步骤

---

**记住：** 这是一个参考库，而不是工作应用程序。你的工作是帮助用户为他们的特定项目结构挑选和适配组件。