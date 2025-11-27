# Vue 3 样式指南

## 核心原则

使用SCSS/CSS3配合Element Plus，实现响应式设计和主题定制，保持样式的一致性和可维护性。

## 样式架构设计

### 样式文件组织结构

```
src/assets/styles/
├── index.scss              # 样式入口文件
├── variables.scss          # 样式变量
├── mixins.scss             # 样式混入
├── reset.scss              # 样式重置
├── base.scss               # 基础样式
├── common.scss             # 通用样式
├── components.scss         # 组件样式
├── layouts.scss            # 布局样式
├── utilities.scss          # 工具类样式
├── responsive.scss         # 响应式样式
└── themes/                 # 主题样式
    ├── light.scss          # 浅色主题
    ├── dark.scss           # 深色主题
    └── variables.scss      # 主题变量
```

### 样式入口文件

```scss
// src/assets/styles/index.scss

// 1. 导入变量和混入
@import './variables';
@import './mixins';

// 2. 导入重置和基础样式
@import './reset';
@import './base';

// 3. 导入通用样式
@import './common';
@import './layouts';
@import './components';

// 4. 导入工具类
@import './utilities';

// 5. 导入响应式样式
@import './responsive';

// 6. 导入主题
@import './themes/light';
```

## 样式变量系统

### 颜色系统

```scss
// assets/styles/variables.scss

// 主色调
$primary-color: #409eff;
$primary-light: #79bbff;
$primary-dark: #337ecc;

// 功能色
$success-color: #67c23a;
$success-light: #95d475;
$success-dark: #529b2e;

$warning-color: #e6a23c;
$warning-light: #ebb563;
$warning-dark: #b88230;

$danger-color: #f56c6c;
$danger-light: #f78989;
$danger-dark: #c45656;

$info-color: #909399;
$info-light: #a6a9ad;
$info-dark: #73767a;

// 中性色
$text-color-primary: #303133;
$text-color-regular: #606266;
$text-color-secondary: #909399;
$text-color-placeholder: #c0c4cc;

$border-color-base: #dcdfe6;
$border-color-light: #e4e7ed;
$border-color-lighter: #ebeef5;
$border-color-extra-light: #f2f6fc;

$background-color-base: #f5f7fa;
$background-color-light: #fafafa;
$background-color-lighter: #fafcff;

// 渐变色
$gradient-primary: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
$gradient-success: linear-gradient(135deg, $success-color 0%, $success-light 100%);
$gradient-warning: linear-gradient(135deg, $warning-color 0%, $warning-light 100%);
$gradient-danger: linear-gradient(135deg, $danger-color 0%, $danger-light 100%);
```

### 字体系统

```scss
// 字体族
$font-family-primary: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
$font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;

// 字体大小
$font-size-extra-large: 20px;
$font-size-large: 18px;
$font-size-medium: 16px;
$font-size-base: 14px;
$font-size-small: 13px;
$font-size-extra-small: 12px;

// 字体粗细
$font-weight-primary: 500;
$font-weight-secondary: 400;

// 行高
$line-height-primary: 24px;
$line-height-secondary: 20px;
$line-height-base: 1.5;
```

### 间距系统

```scss
// 间距变量
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-xxl: 48px;

// 内边距类
$padding-xs: $spacing-xs;
$padding-sm: $spacing-sm;
$padding-md: $spacing-md;
$padding-lg: $spacing-lg;
$padding-xl: $spacing-xl;

// 外边距类
$margin-xs: $spacing-xs;
$margin-sm: $spacing-sm;
$margin-md: $spacing-md;
$margin-lg: $spacing-lg;
$margin-xl: $spacing-xl;
```

### 圆角和阴影

```scss
// 圆角
$border-radius-none: 0;
$border-radius-base: 4px;
$border-radius-small: 2px;
$border-radius-large: 8px;
$border-radius-round: 20px;
$border-radius-circle: 50%;

// 阴影
$box-shadow-base: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
$box-shadow-dark: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.12);
$box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
$box-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
```

## 样式混入(Mixins)

### 布局混入

```scss
// assets/styles/mixins.scss

// Flexbox布局
@mixin flex($direction: row, $justify: flex-start, $align: stretch, $wrap: nowrap) {
  display: flex;
  flex-direction: $direction;
  justify-content: $justify;
  align-items: $align;
  flex-wrap: $wrap;
}

// 居中对齐
@mixin flex-center {
  @include flex(row, center, center);
}

// 垂直居中
@mixin flex-center-vertical {
  @include flex(column, center, center);
}

// 水平居中
@mixin flex-center-horizontal {
  @include flex(row, center, center);
}

// 两端对齐
@mixin flex-between {
  @include flex(row, space-between, center);
}

// 网格布局
@mixin grid($columns: 12, $gap: $spacing-md) {
  display: grid;
  grid-template-columns: repeat($columns, 1fr);
  gap: $gap;
}
```

### 文本混入

```scss
// 文本省略
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行文本省略
@mixin text-ellipsis-multi($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 文本选择禁用
@mixin no-select {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

// 文本渐变
@mixin text-gradient($colors...) {
  background: linear-gradient(90deg, $colors);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### 视觉效果混入

```scss
// 过渡动画
@mixin transition($properties: all, $duration: 0.3s, $timing: ease) {
  transition: $properties $duration $timing;
}

// 变换
@mixin transform($transforms...) {
  transform: $transforms;
}

// 缩放
@mixin scale($scale) {
  @include transform(scale($scale));
}

// 旋转
@mixin rotate($degrees) {
  @include transform(rotate($degrees));
}

// 透明度
@mixin opacity($opacity) {
  opacity: $opacity;
  filter: alpha(opacity=($opacity * 100));
}

// 阴影
@mixin box-shadow($shadow) {
  box-shadow: $shadow;
}

// 边框
@mixin border($width: 1px, $style: solid, $color: $border-color-base) {
  border: $width $style $color;
}
```

### 响应式混入

```scss
// 响应式断点
$breakpoints: (
  xs: 480px,
  sm: 768px,
  md: 992px,
  lg: 1200px,
  xl: 1920px
);

// 媒体查询混入
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media screen and (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "无效的断点: #{$breakpoint}";
  }
}

// 移动设备优先
@mixin mobile-first($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media screen and (max-width: map-get($breakpoints, $breakpoint) - 1px) {
      @content;
    }
  }
}

// 高分辨率屏幕
@mixin retina {
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    @content;
  }
}
```

## 组件样式规范

### 组件样式结构

```vue
<!-- UserCard.vue -->
<template>
  <div class="user-card" :class="{ 'user-card--compact': compact }">
    <div class="user-card__avatar">
      <img :src="user.avatar" :alt="user.name" class="user-card__img">
    </div>
    <div class="user-card__content">
      <h3 class="user-card__name">{{ user.name }}</h3>
      <p class="user-card__email">{{ user.email }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types'

interface Props {
  user: User
  compact?: boolean
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
// 导入变量
@import '@/assets/styles/variables';
@import '@/assets/styles/mixins';

// 组件根样式
.user-card {
  @include flex(row, flex-start, center);
  @include box-shadow($box-shadow-base);
  @include border-radius($border-radius-base);
  @include transition(all, 0.3s);
  
  padding: $spacing-md;
  background: white;
  border: 1px solid $border-color-light;
  cursor: pointer;

  &:hover {
    @include box-shadow($box-shadow-hover);
    transform: translateY(-2px);
  }

  // 变体样式
  &--compact {
    padding: $spacing-sm;
    
    .user-card__content {
      margin-left: $spacing-sm;
    }
  }
}

// 子元素样式
.user-card__avatar {
  flex-shrink: 0;
  margin-right: $spacing-md;
}

.user-card__img {
  @include border-radius($border-radius-circle);
  width: 48px;
  height: 48px;
  object-fit: cover;
}

.user-card__content {
  flex: 1;
  min-width: 0; // 允许内容被省略
}

.user-card__name {
  @include text-ellipsis;
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-medium;
  font-weight: $font-weight-primary;
  color: $text-color-primary;
}

.user-card__email {
  @include text-ellipsis;
  margin: 0;
  font-size: $font-size-small;
  color: $text-color-secondary;
}

// 响应式样式
@include mobile-first(md) {
  .user-card {
    flex-direction: column;
    text-align: center;
    
    .user-card__avatar {
      margin-right: 0;
      margin-bottom: $spacing-sm;
    }
  }
}
</style>
```

### BEM命名规范

```scss
// Block
.card {
  padding: $spacing-md;
  border: 1px solid $border-color-base;
  @include border-radius($border-radius-base);

  // Element
  &__header {
    @include flex-between;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color-light;
  }

  &__title {
    font-size: $font-size-medium;
    font-weight: $font-weight-primary;
    color: $text-color-primary;
  }

  &__content {
    margin-bottom: $spacing-md;
  }

  &__footer {
    @include flex-end;
  }

  // Modifier
  &--primary {
    border-color: $primary-color;
    box-shadow: 0 2px 8px rgba($primary-color, 0.2);
  }

  &--compact {
    padding: $spacing-sm;
    
    .card__header {
      margin-bottom: $spacing-sm;
    }
  }

  &--loading {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      @include flex-center;
    }
  }
}
```

## 工具类样式

### 间距工具类

```scss
// assets/styles/utilities.scss

// 外边距
.m-0 { margin: 0; }
.m-auto { margin: auto; }

@each $prop, $abbrev in (margin: m) {
  @each $size, $length in (xs: $spacing-xs, sm: $spacing-sm, md: $spacing-md, lg: $spacing-lg, xl: $spacing-xl) {
    .#{$abbrev}-#{$size} { #{$prop}: $length; }
    
    .#{$abbrev}t-#{$size} { #{$prop}-top: $length; }
    .#{$abbrev}r-#{$size} { #{$prop}-right: $length; }
    .#{$abbrev}b-#{$size} { #{$prop}-bottom: $length; }
    .#{$abbrev}l-#{$size} { #{$prop}-left: $length; }
    
    .#{$abbrev}x-#{$size} { 
      #{$prop}-left: $length; 
      #{$prop}-right: $length; 
    }
    
    .#{$abbrev}y-#{$size} { 
      #{$prop}-top: $length; 
      #{$prop}-bottom: $length; 
    }
  }
}

// 内边距
@each $prop, $abbrev in (padding: p) {
  @each $size, $length in (xs: $spacing-xs, sm: $spacing-sm, md: $spacing-md, lg: $spacing-lg, xl: $spacing-xl) {
    .#{$abbrev}-#{$size} { #{$prop}: $length; }
    
    .#{$abbrev}t-#{$size} { #{$prop}-top: $length; }
    .#{$abbrev}r-#{$size} { #{$prop}-right: $length; }
    .#{$abbrev}b-#{$size} { #{$prop}-bottom: $length; }
    .#{$abbrev}l-#{$size} { #{$prop}-left: $length; }
    
    .#{$abbrev}x-#{$size} { 
      #{$prop}-left: $length; 
      #{$prop}-right: $length; 
    }
    
    .#{$abbrev}y-#{$size} { 
      #{$prop}-top: $length; 
      #{$prop}-bottom: $length; 
    }
  }
}
```

### 布局工具类

```scss
// Flexbox
.d-flex { display: flex; }
.d-inline-flex { display: inline-flex; }

.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.align-start { align-items: flex-start; }
.align-center { align-items: center; }
.align-end { align-items: flex-end; }
.align-stretch { align-items: stretch; }

.flex-1 { flex: 1; }
.flex-auto { flex: auto; }
.flex-none { flex: none; }

// Grid
.d-grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }

.gap-0 { gap: 0; }
.gap-1 { gap: $spacing-xs; }
.gap-2 { gap: $spacing-sm; }
.gap-3 { gap: $spacing-md; }
.gap-4 { gap: $spacing-lg; }
```

### 文本工具类

```scss
// 文本对齐
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }

// 文本换行
.text-wrap { white-space: normal; }
.text-nowrap { white-space: nowrap; }
.text-break { word-wrap: break-word; word-break: break-word; }

// 文本省略
.text-ellipsis {
  @include text-ellipsis;
}

.text-ellipsis-2 {
  @include text-ellipsis-multi(2);
}

.text-ellipsis-3 {
  @include text-ellipsis-multi(3);
}

// 字体大小
.text-xs { font-size: $font-size-extra-small; }
.text-sm { font-size: $font-size-small; }
.text-base { font-size: $font-size-base; }
.text-lg { font-size: $font-size-medium; }
.text-xl { font-size: $font-size-large; }
.text-2xl { font-size: $font-size-extra-large; }

// 字体粗细
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

// 文本颜色
.text-primary { color: $text-color-primary; }
.text-regular { color: $text-color-regular; }
.text-secondary { color: $text-color-secondary; }
.text-placeholder { color: $text-color-placeholder; }
.text-success { color: $success-color; }
.text-warning { color: $warning-color; }
.text-danger { color: $danger-color; }
.text-info { color: $info-color; }
```

### 显示和位置工具类

```scss
// 显示
.d-none { display: none; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }

// 位置
.position-static { position: static; }
.position-relative { position: relative; }
.position-absolute { position: absolute; }
.position-fixed { position: fixed; }
.position-sticky { position: sticky; }

// 定位
.top-0 { top: 0; }
.right-0 { right: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }

// 层级
.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }
.z-auto { z-index: auto; }

// 溢出
.overflow-auto { overflow: auto; }
.overflow-hidden { overflow: hidden; }
.overflow-visible { overflow: visible; }
.overflow-scroll { overflow: scroll; }

.overflow-x-auto { overflow-x: auto; }
.overflow-y-auto { overflow-y: auto; }
.overflow-x-hidden { overflow-x: hidden; }
.overflow-y-hidden { overflow-y: hidden; }
```

## 响应式设计

### 响应式断点使用

```scss
// 响应式工具类
@include respond-to(sm) {
  .d-sm-none { display: none; }
  .d-sm-block { display: block; }
  .d-sm-flex { display: flex; }
  
  .text-sm-center { text-align: center; }
  .text-sm-left { text-align: left; }
  .text-sm-right { text-align: right; }
}

@include respond-to(md) {
  .d-md-none { display: none; }
  .d-md-block { display: block; }
  .d-md-flex { display: flex; }
  
  .text-md-center { text-align: center; }
  .text-md-left { text-align: left; }
  .text-md-right { text-align: right; }
}

@include respond-to(lg) {
  .d-lg-none { display: none; }
  .d-lg-block { display: block; }
  .d-lg-flex { display: flex; }
  
  .text-lg-center { text-align: center; }
  .text-lg-left { text-align: left; }
  .text-lg-right { text-align: right; }
}
```

### 容器系统

```scss
// 响应式容器
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 $spacing-md;

  @include respond-to(sm) {
    max-width: 720px;
  }

  @include respond-to(md) {
    max-width: 960px;
  }

  @include respond-to(lg) {
    max-width: 1140px;
  }

  @include respond-to(xl) {
    max-width: 1320px;
  }
}

.container-fluid {
  width: 100%;
  padding: 0 $spacing-md;
}
```

## Element Plus 主题定制

### 自定义主题变量

```scss
// 自定义Element Plus主题
:root {
  // 主题色
  --el-color-primary: #{$primary-color};
  --el-color-primary-light-3: #{$primary-light};
  --el-color-primary-dark-2: #{$primary-dark};
  
  --el-color-success: #{$success-color};
  --el-color-warning: #{$warning-color};
  --el-color-danger: #{$danger-color};
  --el-color-info: #{$info-color};

  // 文字颜色
  --el-text-color-primary: #{$text-color-primary};
  --el-text-color-regular: #{$text-color-regular};
  --el-text-color-secondary: #{$text-color-secondary};
  --el-text-color-placeholder: #{$text-color-placeholder};

  // 边框颜色
  --el-border-color: #{$border-color-base};
  --el-border-color-light: #{$border-color-light};
  --el-border-color-lighter: #{$border-color-lighter};
  --el-border-color-extra-light: #{$border-color-extra-light};

  // 填充色
  --el-fill-color: #{$background-color-base};
  --el-fill-color-light: #{$background-color-light};
  --el-fill-color-lighter: #{$background-color-lighter};

  // 字体
  --el-font-size-base: #{$font-size-base};
  --el-font-size-small: #{$font-size-small};
  --el-font-size-large: #{$font-size-large};
  --el-font-family: #{$font-family-primary};

  // 边框圆角
  --el-border-radius-base: #{$border-radius-base};
  --el-border-radius-small: #{$border-radius-small};
  --el-border-radius-round: #{$border-radius-round};

  // 阴影
  --el-box-shadow: #{$box-shadow-base};
  --el-box-shadow-dark: #{$box-shadow-dark};
  --el-box-shadow-light: #{$box-shadow-light};
}
```

### 组件样式覆盖

```scss
// Element Plus 组件样式覆盖
.el-button {
  &--primary {
    background: $gradient-primary;
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: $box-shadow-hover;
    }
  }
}

.el-card {
  @include box-shadow($box-shadow-base);
  @include border-radius($border-radius-base);
  
  border: 1px solid $border-color-light;
  
  &:hover {
    @include box-shadow($box-shadow-hover);
  }
}

.el-table {
  .el-table__header {
    background-color: $background-color-base;
    
    th {
      color: $text-color-primary;
      font-weight: $font-weight-primary;
      background-color: transparent;
    }
  }
  
  .el-table__row {
    &:hover {
      background-color: $background-color-light;
    }
  }
}

.el-dialog {
  @include border-radius($border-radius-large);
  
  .el-dialog__header {
    padding: $spacing-lg $spacing-lg $spacing-md;
    border-bottom: 1px solid $border-color-light;
  }
  
  .el-dialog__body {
    padding: $spacing-lg;
  }
  
  .el-dialog__footer {
    padding: $spacing-md $spacing-lg $spacing-lg;
    border-top: 1px solid $border-color-light;
  }
}
```

## 动画和过渡

### 过渡动画

```scss
// 通用过渡
.fade-enter-active,
.fade-leave-active {
  @include transition(opacity, 0.3s);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  @include transition(all, 0.3s);
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  @include transition(all, 0.3s);
}

.scale-enter-from,
.scale-leave-to {
  @include scale(0.9);
  opacity: 0;
}
```

### 加载动画

```scss
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.loading-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.bounce-animation {
  animation: bounce 1s infinite;
}
```

## 最佳实践

### 1. 样式组织
- 使用SCSS变量和混入提高可维护性
- 按功能模块组织样式文件
- 遵循BEM命名规范

### 2. 性能优化
- 避免过度嵌套（最多3层）
- 使用CSS Grid和Flexbox布局
- 合理使用will-change属性

### 3. 响应式设计
- 移动设备优先的设计原则
- 合理设置断点
- 使用相对单位（rem, em, vh, vw）

### 4. 可访问性
- 确保足够的颜色对比度
- 支持键盘导航
- 提供适当的焦点状态

### 5. 浏览器兼容性
- 使用autoprefixer处理浏览器前缀
- 渐进增强的设计思路
- 提供降级方案