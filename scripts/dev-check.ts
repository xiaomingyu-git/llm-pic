#!/usr/bin/env node

/**
 * Development Type Checker
 * 开发阶段的类型检查工具
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command: string, description: string): boolean {
  log(`\n🔍 ${description}`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} - 通过`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - 失败`, 'red');
    log(`错误: ${error}`, 'red');
    return false;
  }
}

function checkProjectSetup(): boolean {
  log('📋 检查项目配置...', 'blue');

  const requiredFiles = [
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'package.json',
    'vite.config.ts',
    '.vscode/settings.json'
  ];

  let allExist = true;

  requiredFiles.forEach(file => {
    if (!existsSync(file)) {
      log(`❌ 缺少必要文件: ${file}`, 'red');
      allExist = false;
    } else {
      log(`✅ ${file}`, 'green');
    }
  });

  return allExist;
}

function main() {
  log('\n🚀 Vue 3 TypeScript 开发检查工具', 'bright');
  log('=====================================', 'blue');

  const commands = [
    { cmd: 'npm run type-check', desc: 'TypeScript 类型检查' },
    { cmd: 'npm run lint', desc: 'ESLint 代码质量检查' },
    { cmd: 'npm run format -- --check', desc: 'Prettier 代码格式检查' }
  ];

  // 检查项目配置
  if (!checkProjectSetup()) {
    log('\n❌ 项目配置不完整，请检查以上缺失的文件', 'red');
    process.exit(1);
  }

  log('\n📝 开始检查代码质量...', 'blue');
  log('=====================================', 'blue');

  let allPassed = true;

  commands.forEach(({ cmd, desc }) => {
    const passed = runCommand(cmd, desc);
    allPassed = allPassed && passed;
  });

  log('\n📊 检查结果', 'blue');
  log('=====================================', 'blue');

  if (allPassed) {
    log('🎉 所有检查通过！代码质量良好！', 'green');
    log('\n💡 建议:', 'yellow');
    log('   • 保持严格的TypeScript配置', 'yellow');
    log('   • 继续使用类型安全的开发模式', 'yellow');
    log('   • 定期运行 npm run quality:check', 'yellow');
    process.exit(0);
  } else {
    log('❌ 存在问题，请修复后重试', 'red');
    log('\n🔧 修复建议:', 'yellow');
    log('   • 运行 npm run quality:fix 自动修复部分问题', 'yellow');
    log('   • 检查TypeScript类型错误', 'yellow');
    log('   • 查看ESLint报告并修复', 'yellow');
    process.exit(1);
  }
}

// 运行主程序
main();
