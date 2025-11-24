#!/usr/bin/env node

/**
 * TypeScript 配置同步工具
 * 确保 VSCode 编辑器和命令行使用一致的 TypeScript 配置
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// VSCode 推荐的 TypeScript 设置
const vscodeTsSettings = {
  "typescript.preferences.useWorkspaceTsdk": true,
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.validate.enable": true,
  "typescript.tsserver.experimental.enableProjectDiagnostics": false,
  "typescript.tsserver.maxTsServerMemory": 8192,
  "typescript.suggest.completeFunctionCalls": true,
  "typescript.suggestionActions.enabled": true,
  "typescript.preferences.quoteStyle": "single",
  "typescript.noUnusedParameters.enabled": false,
  "typescript.noUnusedLocals.enabled": false,
  "typescript.preferences.strict": true,
  "typescript.disableAutomaticTypeAcquisition": false,
  "typescript.surfaces.enabled": true,
  "javascript.validate.enable": false,
  "vetur.validation.script": false,
  "vetur.validation.style": false,
  "vetur.validation.template": false
};

function updateVSCodeSettings() {
  const settingsPath = join(process.cwd(), '.vscode', 'settings.json');

  if (!existsSync(settingsPath)) {
    log('❌ .vscode/settings.json 文件不存在', 'red');
    return false;
  }

  try {
    const currentSettings = JSON.parse(readFileSync(settingsPath, 'utf-8'));

    // 合并推荐设置
    const mergedSettings = {
      ...vscodeTsSettings,
      ...currentSettings,
      // 确保一些关键设置不被覆盖
      "typescript.preferences.useWorkspaceTsdk": vscodeTsSettings["typescript.preferences.useWorkspaceTsdk"],
      "typescript.tsdk": vscodeTsSettings["typescript.tsdk"],
      "typescript.validate.enable": vscodeTsSettings["typescript.validate.enable"]
    };

    writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2));
    log('✅ VSCode TypeScript 设置已更新', 'green');
    return true;
  } catch (error) {
    log(`❌ 更新 VSCode 设置失败: ${error}`, 'red');
    return false;
  }
}

function checkTypeScriptVersion() {
  try {
    const { execSync } = require('child_process');
    const version = execSync('npx tsc --version', { cwd: process.cwd() }).toString().trim();
    log(`📋 TypeScript 版本: ${version}`, 'blue');
    return true;
  } catch (error) {
    log('❌ 无法获取 TypeScript 版本', 'red');
    return false;
  }
}

function checkProjectFiles() {
  const requiredFiles = [
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'package.json'
  ];

  log('📁 检查项目配置文件:', 'blue');
  let allExist = true;

  requiredFiles.forEach(file => {
    if (existsSync(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file}`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

function checkVueExtensions() {
  const vsCodePath = join(process.cwd(), '.vscode');
  const extensionsPath = join(vsCodePath, 'extensions.json');

  if (existsSync(extensionsPath)) {
    try {
      const extensions = JSON.parse(readFileSync(extensionsPath, 'utf-8'));
      const hasVolar = extensions.recommendations?.includes('vue.volar');
      const hasTypescriptVue = extensions.recommendations?.includes('vue.vscode-typescript-vue-plugin');

      if (hasVolar && hasTypescriptVue) {
        log('✅ Vue 扩展推荐配置正确', 'green');
        return true;
      } else {
        log('⚠️ 建议安装 Vue Volar 和 TypeScript Vue Plugin', 'yellow');
        return false;
      }
    } catch (error) {
      log('❌ 无法读取扩展推荐', 'red');
      return false;
    }
  } else {
    log('⚠️ 未找到 .vscode/extensions.json', 'yellow');
    return false;
  }
}

function main() {
  log('🔄 TypeScript 配置同步工具', 'bright');
  log('=============================', 'blue');

  let success = true;

  // 检查项目文件
  if (!checkProjectFiles()) {
    log('\n❌ 项目配置不完整', 'red');
    success = false;
  }

  // 检查 TypeScript 版本
  if (!checkTypeScriptVersion()) {
    log('\n❌ TypeScript 检查失败', 'red');
    success = false;
  }

  // 检查 Vue 扩展
  checkVueExtensions();

  // 更新 VSCode 设置
  if (!updateVSCodeSettings()) {
    log('\n❌ VSCode 设置更新失败', 'red');
    success = false;
  }

  log('\n📋 同步结果:', 'blue');
  log('=============================', 'blue');

  if (success) {
    log('🎉 TypeScript 配置同步完成！', 'green');
    log('\n💡 建议操作:', 'yellow');
    log('1. 重新加载 VSCode 窗口 (Ctrl+Shift+P -> Developer: Reload Window)', 'yellow');
    log('2. 重启 TypeScript 服务器 (Ctrl+Shift+P -> TypeScript: Restart TS Server)', 'yellow');
    log('3. 检查编辑器中的类型错误是否减少', 'yellow');
    process.exit(0);
  } else {
    log('❌ 同步过程中发现问题，请检查上述错误', 'red');
    process.exit(1);
  }
}

// 运行主程序
main();
