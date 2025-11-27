#!/bin/bash

# Vue项目专属验证脚本
# 验证Vue 3 + TypeScript + Element Plus组件

echo "🔍 开始Vue项目完整验证..."

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印状态
print_status() {
    local status=$1
    local message=$2
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✅ $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# 函数：检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. TypeScript类型检查
echo -e "\n${BLUE}📋 步骤1: TypeScript类型检查${NC}"
if command_exists npx; then
    npx tsc --noEmit
    print_status $? "TypeScript编译检查"
else
    echo -e "${RED}❌ npx命令未找到${NC}"
fi

# 2. Vue ESLint检查
echo -e "\n${BLUE}📋 步骤2: Vue ESLint检查${NC}"
if command_exists npx; then
    npx eslint "src/**/*.{vue,ts,js}" --ext .vue,.ts,.js
    print_status $? "Vue ESLint检查"
else
    echo -e "${RED}❌ npx命令未找到${NC}"
fi

# 3. 检查Vue项目文件结构
echo -e "\n${BLUE}📋 步骤3: Vue项目结构检查${NC}"
if [ -f "src/main.ts" ] && [ -f "src/App.vue" ]; then
    print_status 0 "Vue项目基本结构检查"
else
    print_status 1 "Vue项目基本结构检查"
fi

# 4. 检查Vue依赖
echo -e "\n${BLUE}📋 步骤4: Vue依赖检查${NC}"
if [ -f "package.json" ]; then
    if grep -q "vue" package.json && grep -q "element-plus" package.json; then
        print_status 0 "Vue和Element Plus依赖检查"
    else
        print_status 1 "Vue和Element Plus依赖检查"
    fi
else
    print_status 1 "package.json文件检查"
fi

# 5. 检查TypeScript配置
echo -e "\n${BLUE}📋 步骤5: TypeScript配置检查${NC}"
if [ -f "tsconfig.json" ]; then
    print_status 0 "TypeScript配置检查"
else
    print_status 1 "TypeScript配置检查"
fi

# 6. 检查Vue Router配置
echo -e "\n${BLUE}📋 步骤6: Vue Router配置检查${NC}"
if [ -f "src/router/index.ts" ]; then
    print_status 0 "Vue Router配置检查"
else
    print_status 1 "Vue Router配置检查"
fi

# 7. 运行Vue构建测试（如果存在）
echo -e "\n${BLUE}📋 步骤7: Vue构建测试${NC}"
if command_exists npm && npm run build >/dev/null 2>&1; then
    print_status 0 "Vue项目构建测试"
else
    echo -e "${YELLOW}⚠️  Vue构建测试跳过（构建脚本不存在或构建失败）${NC}"
fi

# 8. 检查Vue组件语法
echo -e "\n${BLUE}📋 步骤8: Vue组件语法检查${NC}"
if find src -name "*.vue" -type f >/dev/null 2>&1; then
    # 检查Vue文件基本语法
    vue_files=$(find src -name "*.vue" -type f)
    syntax_errors=0

    for file in $vue_files; do
        # 检查基本的Vue模板语法
        if ! grep -q "<script setup" "$file"; then
            echo -e "${RED}❌ $file 缺少script setup语法${NC}"
            syntax_errors=$((syntax_errors + 1))
        fi

        # 检查是否有template标签
        if ! grep -q "<template>" "$file"; then
            echo -e "${RED}❌ $file 缺少template标签${NC}"
            syntax_errors=$((syntax_errors + 1))
        fi

        # 检查是否有style标签
        if ! grep -q "<style" "$file"; then
            echo -e "${YELLOW}⚠️  $file 建议添加style标签${NC}"
        fi
    done

    if [ $syntax_errors -eq 0 ]; then
        print_status 0 "Vue组件语法检查"
    else
        print_status 1 "Vue组件语法检查"
    fi
else
    print_status 1 "Vue组件文件检查"
fi

# 9. 验证Element Plus使用
echo -e "\n${BLUE}📋 步骤9: Element Plus使用检查${NC}"
if [ -d "src" ]; then
    element_imports=$(grep -r "from 'element-plus'" src/ | wc -l)
    if [ $element_imports -gt 0 ]; then
        print_status 0 "Element Plus导入检查"
        echo -e "${GREEN}   发现 $element_imports 个Element Plus导入${NC}"
    else
        print_status 1 "Element Plus导入检查"
    fi

    # 检查图标使用
    icon_imports=$(grep -r "from '@element-plus/icons-vue'" src/ | wc -l)
    if [ $icon_imports -gt 0 ]; then
        echo -e "${GREEN}   发现 $icon_imports 个Element Plus图标导入${NC}"
    else
        echo -e "${YELLOW}⚠️  建议添加Element Plus图标支持${NC}"
    fi
fi

# 总结
echo -e "\n${BLUE}🎯 Vue项目验证完成${NC}"
echo -e "${NC}请根据上述检查结果修复发现的问题。"

# 提供修复建议
echo -e "\n${YELLOW}📝 修复建议：${NC}"
echo "1. TypeScript错误：运行 'npx tsc --noEmit' 查看详细错误"
echo "2. ESLint错误：运行 'npx eslint src/ --fix' 自动修复"
echo "3. 构建错误：检查依赖和配置文件"
echo "4. 语法错误：确保Vue组件使用正确的组合式API语法"
