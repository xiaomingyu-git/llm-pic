# Claude Code 基础设施展示

**经过生产测试的 Claude Code 基础设施精选参考库。**

源于 6 个月真实世界使用管理复杂的 TypeScript 微服务项目，此展示提供了解决"技能不能自动激活"问题并扩展 Claude Code 用于企业开发的模式和系统。

> **这不是一个可工作的应用程序** - 它是一个参考库。将你需要的内容复制到你自己的项目中。

---

## 里面有什么

**经过生产测试的基础设施用于：**
- ✅ **通过钩子自动激活技能**
- ✅ **模块化技能模式**（500行规则与渐进式披露）
- ✅ **用于复杂任务的专业代理**
- ✅ **在上下文重置后幸存的开发文档系统**
- ✅ **使用通用博客域的综合示例**

**构建时间投入：** 6 个月的迭代
**集成到你的项目时间：** 15-30 分钟

---

## 快速开始 - 选择你的路径

### 🤖 使用 Claude Code 进行集成？

**Claude：** 阅读 [`CLAUDE_INTEGRATION_GUIDE_CN.md`](CLAUDE_INTEGRATION_GUIDE_CN.md) 获取针对 AI 辅助设置的逐步集成说明。

### 🎯 我想要技能自动激活

**突破性功能：** 在你需要时实际激活的技能。

**你需要什么：**
1. skill-activation 钩子（2个文件）
2. 一两个与你的工作相关的技能
3. 15 分钟

**👉 [设置指南：.claude/hooks/README.md](.claude/hooks/README.md)**

### 📚 我想要添加一个技能

浏览 [技能目录](.claude/skills/) 并复制你需要的内容。

**可用技能：**
- **backend-dev-guidelines** - Node.js/Express/TypeScript 模式
- **frontend-dev-guidelines** - React/TypeScript/MUI v7 模式
- **skill-developer** - 用于创建技能的元技能
- **route-tester** - 测试经过身份验证的 API 路由
- **error-tracking** - Sentry 集成模式

**👉 [技能指南：.claude/skills/README.md](.claude/skills/README.md)**

### 🤖 我想要专业代理

10 个用于复杂任务的经过生产测试的代理：
- 代码架构审查
- 重构协助
- 文档生成
- 错误调试
- 以及更多...

**👉 [代理指南：.claude/agents/README.md](.claude/agents/README.md)**

---

## 这有什么不同？

### 自动激活突破

**问题：** Claude Code 技能就只是待在那里。你必须记住使用它们。

**解决方案：** UserPromptSubmit 钩子：
- 分析你的提示
- 检查文件上下文
- 自动建议相关技能
- 通过 `skill-rules.json` 配置工作

**结果：** 技能在你需要时激活，而不是在你记得时激活。

### 经过生产测试的模式

这些不是理论示例 - 它们提取自：
- ✅ 生产环境中的 6 个微服务
- ✅ 50,000+ 行 TypeScript 代码
- ✅ 带有复杂数据网格的 React 前端
- ✅ 复杂的工作流引擎
- ✅ 6 个月的日常 Claude Code 使用

这些模式有效是因为它们解决了真实的问题。

### 模块化技能（500行规则）

大型技能会达到上下文限制。解决方案：

```
skill-name/
  SKILL.md                  # <500 行，高级指南
  resources/
    topic-1.md              # 每个 <500 行
    topic-2.md
    topic-3.md
```

**渐进式披露：** Claude 首先加载主要技能，仅在需要时加载资源。

---

## 仓库结构

```
.claude/
├── skills/                 # 5 个生产技能
│   ├── backend-dev-guidelines/  (12 个资源文件)
│   ├── frontend-dev-guidelines/ (11 个资源文件)
│   ├── skill-developer/         (7 个资源文件)
│   ├── route-tester/
│   ├── error-tracking/
│   └── skill-rules.json    # 技能激活配置
├── hooks/                  # 6 个用于自动化的钩子
│   ├── skill-activation-prompt.*  (必需)
│   ├── post-tool-use-tracker.sh   (必需)
│   ├── tsc-check.sh        (可选，需要自定义)
│   └── trigger-build-resolver.sh  (可选)
├── agents/                 # 10 个专业代理
│   ├── code-architecture-reviewer.md
│   ├── refactor-planner.md
│   ├── frontend-error-fixer.md
│   └── ... 7 个更多
└── commands/               # 3 个斜杠命令
    ├── dev-docs.md
    └── ...

dev/
└── active/                 # 开发文档模式示例
    └── public-infrastructure-repo/
```

---

## 组件目录

### 🎨 技能 (5个)

| 技能 | 行数 | 目的 | 最适用于 |
|-------|-------|---------|----------|
| [**skill-developer**](.claude/skills/skill-developer/) | 426 | 创建和管理技能 | 元开发 |
| [**backend-dev-guidelines**](.claude/skills/backend-dev-guidelines/) | 304 | Express/Prisma/Sentry 模式 | 后端 API |
| [**frontend-dev-guidelines**](.claude/skills/frontend-dev-guidelines/) | 398 | React/MUI v7/TypeScript | React 前端 |
| [**route-tester**](.claude/skills/route-tester/) | 389 | 测试经过身份验证的路由 | API 测试 |
| [**error-tracking**](.claude/skills/error-tracking/) | ~250 | Sentry 集成 | 错误监控 |

**所有技能遵循模块化模式** - 主文件 + 用于渐进式披露的资源文件。

**👉 [如何集成技能 →](.claude/skills/README.md)**

### 🪝 钩子 (6个)

| 钩子 | 类型 | 必需？ | 自定义 |
|------|------|-----------|---------------|
| skill-activation-prompt | UserPromptSubmit | ✅ 是 | ✅ 无需 |
| post-tool-use-tracker | PostToolUse | ✅ 是 | ✅ 无需 |
| tsc-check | Stop | ⚠️ 可选 | ⚠️ 重型 - 仅单体仓库 |
| trigger-build-resolver | Stop | ⚠️ 可选 | ⚠️ 重型 - 仅单体仓库 |
| error-handling-reminder | Stop | ⚠️ 可选 | ⚠️ 中等 |
| stop-build-check-enhanced | Stop | ⚠️ 可选 | ⚠️ 中等 |

**从两个必需钩子开始** - 它们启用技能自动激活且开箱即用。

**👉 [钩子设置指南 →](.claude/hooks/README.md)**

### 🤖 代理 (10个)

**独立 - 只需复制并使用！**

| 代理 | 目的 |
|-------|---------|
| code-architecture-reviewer | 审查代码的架构一致性 |
| code-refactor-master | 计划和执行重构 |
| documentation-architect | 生成综合文档 |
| frontend-error-fixer | 调试前端错误 |
| plan-reviewer | 审查开发计划 |
| refactor-planner | 创建重构策略 |
| web-research-specialist | 在线研究技术问题 |
| auth-route-tester | 测试经过身份验证的端点 |
| auth-route-debugger | 调试身份验证问题 |
| auto-error-resolver | 自动修复 TypeScript 错误 |

**👉 [代理工作原理 →](.claude/agents/README.md)**

### 💬 斜杠命令 (3个)

| 命令 | 目的 |
|---------|---------|
| /dev-docs | 创建结构化的开发文档 |
| /dev-docs-update | 在上下文重置前更新文档 |
| /route-research-for-testing | 研究用于测试的路由模式 |

---

## 关键概念

### 钩子 + skill-rules.json = 自动激活

**系统：**
1. **skill-activation-prompt 钩子**在每个用户提示上运行
2. 检查 **skill-rules.json** 寻找触发模式
3. 自动建议相关技能
4. 技能仅在需要时加载

**这解决了 Claude Code 技能的头号问题**：它们不能自动激活。

### 渐进式披露（500行规则）

**问题：** 大型技能达到上下文限制

**解决方案：** 模块化结构
- 主 SKILL.md <500 行（概述 + 导航）
- 资源文件每个 <500 行（深度探讨）
- Claude 根据需要增量加载

**示例：** backend-dev-guidelines 有 12 个资源文件，涵盖路由、控制器、服务、存储库、测试等。

### 开发文档模式

**问题：** 上下文重置丢失项目上下文

**解决方案：** 三文件结构
- `[task]-plan.md` - 战略计划
- `[task]-context.md` - 关键决策和文件
- `[task]-tasks.md` - 清单格式

**适用于：** `/dev-docs` 斜杠命令自动生成这些内容。

---

## ⚠️ 重要：什么不能按原样工作

### settings.json
包含的 `settings.json` **仅是示例**：
- 停止钩子引用特定的单体仓库结构
- 服务名称（blog-api 等）是示例
- MCP 服务器在你的设置中可能不存在

**使用它：**
1. 仅提取 UserPromptSubmit 和 PostToolUse 钩子
2. 自定义或跳过停止钩子
3. 为你的设置更新 MCP 服务器列表

### 博客域示例
技能使用通用博客示例（Post/Comment/User）：
- 这些是**教学示例**，不是要求
- 模式适用于任何域（电子商务、SaaS 等）
- 将模式适配到你的业务逻辑

### 钩子目录结构
一些钩子期望特定结构：
- `tsc-check.sh` 期望服务目录
- 根据你的项目布局自定义

---

## 集成工作流

**推荐方法：**

### 阶段 1：技能激活 (15 分钟)
1. 复制 skill-activation-prompt 钩子
2. 复制 post-tool-use-tracker 钩子
3. 更新 settings.json
4. 安装钩子依赖

### 阶段 2：添加第一个技能 (10 分钟)
1. 选择一个相关技能
2. 复制技能目录
3. 创建/更新 skill-rules.json
4. 自定义路径模式

### 阶段 3：测试和迭代 (5 分钟)
1. 编辑文件 - 技能应该激活
2. 提问 - 应该建议技能
3. 根据需要添加更多技能

### 阶段 4：可选增强
- 添加你发现有用的代理
- 添加斜杠命令
- 自定义停止钩子（高级）

---

## 获取帮助

### 对于用户
**集成有问题？**
1. 检查 [CLAUDE_INTEGRATION_GUIDE_CN.md](CLAUDE_INTEGRATION_GUIDE_CN.md)
2. 询问 Claude："[技能] 为什么没有激活？"
3. 用你的项目结构提交问题

### 对于 Claude Code
帮助用户集成时：
1. **首先阅读 CLAUDE_INTEGRATION_GUIDE_CN.md**
2. 询问他们的项目结构
3. 自定义，不要盲目复制
4. 集成后验证

---

## 这解决了什么

### 在此基础设施之前

❌ 技能不能自动激活
❌ 必须记住使用哪个技能
❌ 大型技能达到上下文限制
❌ 上下文重置丢失项目知识
❌ 开发中缺乏一致性
❌ 每次手动调用代理

### 在此基础设施之后

✅ 技能基于上下文自我建议
✅ 钩子在正确时间触发技能
✅ 模块化技能保持在上下文限制内
✅ 开发文档在重置中保留知识
✅ 通过防护墙保持一致的模式
✅ 代理简化复杂任务

---

## 社区

**发现这个有用？**

- ⭐ 给这个仓库加星
- 🐛 报告问题或建议改进
- 💬 分享你自己的技能/钩子/代理
- 📝 从你的域贡献示例

**背景：**
这个基础设施详细说明在我发布到 Reddit 的帖子 ["Claude Code is a Beast – Tips from 6 Months of Hardcore Use"](https://www.reddit.com/r/ClaudeAI/comments/1oivjvm/claude_code_is_a_beast_tips_from_6_months_of/) 中。经过数百次请求，创建了这个展示来帮助社区实施这些模式。

---

## 许可证

MIT 许可证 - 在你的项目中自由使用，商业或个人。

---

## 快速链接

- 📖 [Claude 集成指南](CLAUDE_INTEGRATION_GUIDE_CN.md) - 用于 AI 辅助设置
- 🎨 [技能文档](.claude/skills/README.md)
- 🪝 [钩子设置](.claude/hooks/README.md)
- 🤖 [代理指南](.claude/agents/README.md)
- 📝 [开发文档模式](dev/README.md)

**从这里开始：** 复制两个必需钩子，添加一个技能，看看自动激活魔法发生。