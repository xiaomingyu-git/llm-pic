/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  rules: {
    // Vue 3 specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off', // 代码高亮等场景需要使用v-html
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'off', // 开发阶段允许any类型
    '@typescript-eslint/ban-ts-comment': 'warn',

    // General JavaScript rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off', // Let TypeScript handle this
    'prefer-const': 'error',
    'no-var': 'error'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // TypeScript-specific overrides
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    },
    {
      files: ['*.vue'],
      rules: {
        // Vue-specific overrides
        'no-undef': 'off' // Vue templates handle this
      }
    }
  ]
}
