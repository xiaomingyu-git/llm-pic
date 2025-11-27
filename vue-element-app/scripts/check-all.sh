#!/bin/bash

# 检查项目和 hooks 的 TypeScript
# 分别使用不同的配置

set -e

echo "🔍 运行完整的 TypeScript 检查..." >&2
echo "" >&2

# 检查项目代码
echo "1️⃣ 检查项目 TypeScript 文件..." >&2
if npm run type-check; then
    echo "✅ 项目 TypeScript 检查通过" >&2
else
    echo "❌ 项目 TypeScript 检查失败" >&2
    exit 1
fi

echo "" >&2

# 检查 hooks
echo "2️⃣ 检查 Claude hooks TypeScript 文件..." >&2
if bash .claude/hooks/check-hooks.sh; then
    echo "✅ Hooks TypeScript 检查通过" >&2
else
    echo "❌ Hooks TypeScript 检查失败" >&2
    exit 1
fi

echo "" >&2
echo "🎉 所有 TypeScript 检查完成！" >&2
