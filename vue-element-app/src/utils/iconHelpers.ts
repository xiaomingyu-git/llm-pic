import type { Component } from 'vue'
import {
  Menu,
  Fold,
  Search,
  Bell,
  UserFilled,
  User,
  ArrowDown,
  Setting,
  SwitchButton,
  Expand,
  Close
} from '@element-plus/icons-vue'

// 图标类型映射
export const iconComponents: Record<string, Component> = {
  Menu,
  Fold,
  Search,
  Bell,
  UserFilled,
  User,
  ArrowDown,
  Setting,
  SwitchButton,
  Expand,
  Close
}

// 类型安全的图标属性
export interface IconProps {
  icon: string | Component
}

// 获取图标组件
export function getIconComponent(iconName: string): Component {
  return iconComponents[iconName] || Menu // 默认使用Menu图标
}
