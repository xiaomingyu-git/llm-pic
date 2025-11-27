import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', () => {
  // State
  const isCollapsed = ref(false)
  const activeMenu = ref('home')
  const openedMenus = ref<string[]>([])

  // 从localStorage读取持久化状态
  const getCollapsedFromStorage = (): boolean => {
    try {
      const stored = localStorage.getItem('menu-collapsed')
      return stored ? JSON.parse(stored) : false
    } catch {
      return false
    }
  }

  const getActiveMenuFromStorage = (): string => {
    try {
      return localStorage.getItem('menu-active') || 'home'
    } catch {
      return 'home'
    }
  }

  // 初始化状态
  const initializeMenu = () => {
    isCollapsed.value = getCollapsedFromStorage()
    activeMenu.value = getActiveMenuFromStorage()
  }

  // Actions
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
    saveCollapsedToStorage()
  }

  const setCollapsed = (collapsed: boolean) => {
    isCollapsed.value = collapsed
    saveCollapsedToStorage()
  }

  const setActiveMenu = (menuKey: string) => {
    activeMenu.value = menuKey
    saveActiveMenuToStorage()
  }

  const toggleMenu = (menuKey: string) => {
    const index = openedMenus.value.indexOf(menuKey)
    if (index > -1) {
      openedMenus.value.splice(index, 1)
    } else {
      openedMenus.value.push(menuKey)
    }
  }

  const closeMenu = (menuKey: string) => {
    const index = openedMenus.value.indexOf(menuKey)
    if (index > -1) {
      openedMenus.value.splice(index, 1)
    }
  }

  const closeAllMenus = () => {
    openedMenus.value = []
  }

  // Persistence helpers
  const saveCollapsedToStorage = () => {
    try {
      localStorage.setItem('menu-collapsed', JSON.stringify(isCollapsed.value))
    } catch {
      // Ignore localStorage errors
    }
  }

  const saveActiveMenuToStorage = () => {
    try {
      localStorage.setItem('menu-active', activeMenu.value)
    } catch {
      // Ignore localStorage errors
    }
  }

  // Computed
  const isMobile = ref(false)

  // 检查是否为移动端
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
    if (isMobile.value) {
      setCollapsed(true) // 移动端默认折叠
    }
  }

  // 重置菜单状态
  const resetMenu = () => {
    isCollapsed.value = false
    activeMenu.value = 'home'
    openedMenus.value = []
    saveCollapsedToStorage()
    saveActiveMenuToStorage()
  }

  return {
    // State
    isCollapsed,
    activeMenu,
    openedMenus,
    isMobile,

    // Actions
    toggleSidebar,
    setCollapsed,
    setActiveMenu,
    toggleMenu,
    closeMenu,
    closeAllMenus,
    initializeMenu,
    checkMobile,
    resetMenu
  }
})
