import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// 路由元信息类型定义 - 扩展Vue Router的RouteMeta
interface RouteMetaExtended {
  title?: string
  icon?: string
  hidden?: boolean
  roles?: string[]
  keepAlive?: boolean
  affix?: boolean
  noCache?: boolean
  badge?: string | number
  requiresAuth?: boolean
  activeMenu?: string
  followAuth?: string
  showParent?: boolean
  frameSrc?: string
  frameBlank?: boolean
  isLink?: string
  isIframe?: boolean
  isAffix?: boolean
  isKeepAlive?: boolean
  [key: PropertyKey]: unknown // 使用unknown代替any，提供更好的类型安全
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '仪表盘',
        icon: 'Monitor',
        hidden: false,
        keepAlive: true
      } as RouteMetaExtended,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '关于',
        icon: 'InfoFilled',
        hidden: true,
        keepAlive: false
      } as RouteMetaExtended,
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: {
        title: '用户管理',
        icon: 'User',
        hidden: false,
        keepAlive: true
      } as RouteMetaExtended,
    },

    {
      path: '/table',
      name: 'table',
      component: () => import('../views/TablePage.vue'),
      meta: {
        title: '图表展示',
        icon: 'PieChart',
        hidden: false,
        keepAlive: true
      } as RouteMetaExtended,
    },
  ],
})

// 导航守卫：设置页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta?.title as string
  if (title) {
    document.title = `${title} - Vue Element App`
  } else {
    document.title = 'Vue Element App'
  }
  next()
})

export default router
