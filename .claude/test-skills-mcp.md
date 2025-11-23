# Skills MCP Integration Test

## 测试各个Skill是否能正确调用对应的MCP工具

### 1. skill-developer 测试
**预期MCP工具**: mcp__acp__Read, mcp__acp__Write, mcp__acp__Edit, TodoWrite, Glob, Grep
```bash
# 测试触发
请帮我创建一个新的skill来管理Vue组件开发
```

### 2. backend-dev-guidelines 测试  
**预期MCP工具**: mcp__acp__Read, mcp__acp__Write, mcp__acp__Edit, mcp__context7__*
```bash
# 测试触发
我需要创建一个Express API路由，如何使用最新的Express.js最佳实践？
```

### 3. frontend-dev-guidelines 测试
**预期MCP工具**: mcp__acp__*, mcp__context7__*, mcp__playwright__*
```bash
# 测试触发  
创建一个React组件，需要了解最新的MUI v7组件API
```

### 4. vue-dev-guidelines 测试
**预期MCP工具**: mcp__acp__*, mcp__context7__*, mcp__playwright__*, WebFetch, WebSearch
```bash
# 测试触发
帮我创建一个Vue 3 + Element Plus的表单组件,我需要了解Element Plus最新的button api
```

### 5. route-tester 测试
**预期MCP工具**: mcp__acp__Bash*, mcp__acp__Read, TodoWrite
```bash
# 测试触发
测试一下我的API路由 /api/users 是否正常工作
```

### 6. error-tracking 测试
**预期MCP工具**: mcp__acp__*, mcp__context7__*, TodoWrite
```bash
# 测试触发
如何在Node.js项目中集成Sentry错误监控？
```

## 验证清单

- [ ] Skill能够被正确触发
- [ ] Skill能够访问其配置的MCP工具
- [ ] MCP工具调用成功
- [ ] 权限配置生效
- [ ] 错误处理正常

## 配置文件位置
- 主配置: `.claude/settings.json`
- Skills配置: `.claude/skills/skill-rules.json`
- MCP服务器: 全局编辑器配置 + 项目级备用配置
