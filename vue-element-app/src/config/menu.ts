import type { RouteRecordName } from 'vue-router'

// 菜单项接口定义
export interface MenuItem {
  key: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  hidden?: boolean
  badge?: string | number
  external?: boolean
  target?: '_blank' | '_self'
}

// 路由元信息接口
export interface RouteMeta {
  title: string
  icon?: string
  hidden?: boolean
  roles?: string[]
  keepAlive?: boolean
  affix?: boolean
  noCache?: boolean
}

// 菜单配置
export const menuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    title: '仪表盘',
    icon: 'Monitor',
    path: '/'
  },
  {
    key: 'users',
    title: '用户管理',
    icon: 'User',
    path: '/users'
  },
  {
    key: 'diagram-display',
    title: '图表展示',
    icon: 'PieChart',
    path: '/table'
  },
  {
    key: 'about',
    title: '关于',
    icon: 'InfoFilled',
    path: '/about',
    hidden: true // 隐藏在菜单中，但可以通过路由访问
  }
]

// 根据路由获取菜单项
export const getMenuItemByRoute = (routeName: RouteRecordName | undefined): MenuItem | null => {
  if (!routeName) return null

  const findMenuItem = (items: MenuItem[]): MenuItem | null => {
    for (const item of items) {
      if (item.key === routeName) {
        return item
      }
      if (item.children) {
        const found = findMenuItem(item.children)
        if (found) return found
      }
    }
    return null
  }

  return findMenuItem(menuConfig)
}

// 获取所有可见的菜单项（扁平化）
export const getVisibleMenuItems = (items: MenuItem[] = menuConfig): MenuItem[] => {
  const result: MenuItem[] = []

  const traverse = (menuItems: MenuItem[]) => {
    menuItems.forEach(item => {
      if (!item.hidden) {
        result.push(item)
        if (item.children) {
          traverse(item.children)
        }
      }
    })
  }

  traverse(items)
  return result
}

// 根据路径查找菜单项
export const getMenuItemByPath = (path: string): MenuItem | null => {
  const findMenuItem = (items: MenuItem[]): MenuItem | null => {
    for (const item of items) {
      if (item.path === path) {
        return item
      }
      if (item.children) {
        const found = findMenuItem(item.children)
        if (found) return found
      }
    }
    return null
  }

  return findMenuItem(menuConfig)
}

// 获取面包屑配置
export const getBreadcrumbItems = (path: string): MenuItem[] => {
  const findPath = (items: MenuItem[], targetPath: string, currentPath: MenuItem[] = []): MenuItem[] | null => {
    for (const item of items) {
      const newPath = [...currentPath, item]

      if (item.path === targetPath) {
        return newPath
      }

      if (item.children) {
        const found = findPath(item.children, targetPath, newPath)
        if (found) return found
      }
    }
    return null
  }

  const pathItems = findPath(menuConfig, path)
  return pathItems || []
}

// 菜单图标映射（Element Plus 图标）
export const iconMap: Record<string, string> = {
  // 导航类
  'Monitor': 'Monitor',
  'Dashboard': 'Monitor',
  'Home': 'House',
  'HomeFilled': 'House',

  // 用户管理类
  'User': 'User',
  'UserFilled': 'UserFilled',
  'Avatar': 'Avatar',
  'Users': 'UserFilled',

  // 设置配置类
  'Setting': 'Setting',
  'Tools': 'Tools',
  'Operation': 'Operation',
  'ToolsFilled': 'Tools',

  // 图表数据类
  'DataAnalysis': 'DataAnalysis',
  'PieChart': 'PieChart',
  'TrendCharts': 'TrendCharts',
  'DataBoard': 'DataBoard',
  'DataLine': 'TrendCharts',

  // 信息类
  'InfoFilled': 'InfoFilled',
  'Info': 'InfoFilled',
  'QuestionFilled': 'QuestionFilled',
  'Warning': 'WarningFilled',
  'SuccessFilled': 'CircleCheckFilled',

  // 操作类
  'Plus': 'Plus',
  'Edit': 'Edit',
  'Delete': 'Delete',
  'Search': 'Search',
  'Close': 'Close',
  'Check': 'Check',

  // 导航类
  'ArrowLeft': 'ArrowLeft',
  'ArrowRight': 'ArrowRight',
  'ArrowUp': 'ArrowUp',
  'ArrowDown': 'ArrowDown',
  'Back': 'ArrowLeft',
  'Right': 'ArrowRight',

  // 文件类
  'Document': 'Document',
  'Folder': 'Folder',
  'FolderOpened': 'FolderOpened',

  // 其他
  'Menu': 'Menu',
  'More': 'More',
  'MoreFilled': 'MoreFilled',
  'View': 'View',
  'Hide': 'Hide',
  'Link': 'Link',
  'Star': 'Star',
  'StarFilled': 'StarFilled'
}

// 默认图标
export const defaultIcon = 'Document'

// 获取菜单项的图标
export const getMenuItemIcon = (iconName?: string): string => {
  if (!iconName) return defaultIcon
  return iconMap[iconName] || defaultIcon
}
