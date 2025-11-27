<template>
  <div class="home-view">
    <!-- 顶部欢迎区域 -->
    <section class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎使用仪表板</h1>
          <p class="welcome-subtitle">{{ currentGreeting }}，开始您的高效工作之旅</p>
        </div>
        <div class="welcome-stats">
          <div v-for="stat in systemStats" :key="stat.key" class="stat-item">
            <div class="stat-number">{{ formatNumber(stat.value) }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能卡片区域 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">快速开始</h2>
        <p class="section-subtitle">选择您需要的功能模块</p>
      </div>

      <div class="feature-cards">
        <el-card v-for="feature in filteredFeatures" :key="feature.id" class="feature-card"
          :class="{ 'card-hover': hoveredCard === feature.id }" @mouseenter="hoveredCard = feature.id"
          @mouseleave="hoveredCard = null" @click="handleFeatureClick(feature)">
          <template #header>
            <div class="card-header">
              <div class="card-icon">
                <component :is="feature.icon" />
              </div>
              <div class="card-title">{{ feature.title }}</div>
            </div>
          </template>

          <div class="card-content">
            <p class="card-description">{{ feature.description }}</p>
            <div class="card-stats" v-if="feature.stats && feature.stats.length > 0">
              <el-tag v-for="stat in feature.stats" :key="stat.label" size="small" type="info" class="stat-tag">
                {{ stat.value }} {{ stat.label }}
              </el-tag>
            </div>
          </div>

          <template #footer>
            <div class="card-footer">
              <el-button type="primary" :icon="ArrowRight" :loading="loadingStates[feature.id] ?? false"
                @click.stop="handleFeatureClick(feature)">
                进入
              </el-button>
            </div>
          </template>
        </el-card>
      </div>
    </section>

    <!-- 数据概览区域 -->
    <section class="dashboard-section">
      <div class="section-header">
        <h2 class="section-title">数据概览</h2>
        <div class="header-actions">
          <el-button-group>
            <el-button v-for="period in timePeriods" :key="period.value"
              :type="selectedPeriod === period.value ? 'primary' : 'default'" @click="selectedPeriod = period.value">
              {{ period.label }}
            </el-button>
          </el-button-group>
        </div>
      </div>

      <div class="dashboard-cards">
        <el-card v-for="metric in dashboardMetrics" :key="metric.key" class="dashboard-card" shadow="hover">
          <div class="metric-card">
            <div class="metric-icon" :class="metric.iconClass">
              <component :is="metric.icon" />
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metric.formattedValue }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-change" :class="metric.changeType">
                <component :is="metric.changeIcon" />
                {{ metric.changeText }}
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 最近活动区域 -->
    <section class="activity-section">
      <div class="section-header">
        <h2 class="section-title">最近活动</h2>
        <el-button type="text" :loading="refreshingActivities" @click="refreshActivities">
          <el-icon class="refresh-icon" :class="{ 'rotating': refreshingActivities }">
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>

      <el-card class="activity-card">
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-avatar">
              <el-avatar :size="40" :src="activity.userAvatar ?? undefined">
                {{ activity.userName.charAt(0) }}
              </el-avatar>
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>{{ activity.userName }}</strong>
                {{ activity.action }}
              </div>
              <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
            </div>
            <div class="activity-status">
              <el-tag :type="activity.status === 'success' ? 'success' : 'warning'" size="small">
                {{ getStatusText(activity.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import {
  ElCard, ElButton, ElButtonGroup, ElTag, ElAvatar, ElIcon
} from 'element-plus'
import {
  ArrowRight, ArrowUp, ArrowDown, Refresh,
  User, Document, Setting, TrendCharts, Timer, Coin, Grid
} from '@element-plus/icons-vue'

// 类型定义
interface FeatureStats {
  value: string
  label: string
}

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: Component
  route: RouteLocationRaw
  stats?: FeatureStats[]
  available?: boolean
}

interface SystemStat {
  key: string
  value: number
  label: string
}

interface DashboardMetric {
  key: string
  label: string
  value: number | string
  formattedValue: string
  changePercent: number
  icon: Component
  iconClass: string
  changeType: 'positive' | 'negative'
  changeIcon: Component
  changeText: string
}

interface ActivityRecord {
  id: string
  userName: string
  userAvatar?: string
  action: string
  timestamp: Date
  status: 'success' | 'pending' | 'processing'
}

interface TimePeriod {
  label: string
  value: string
}

// Router
const router = useRouter()

// 响应式数据
const hoveredCard = ref<string | null>(null)
const selectedPeriod = ref<string>('7d')
const refreshingActivities = ref<boolean>(false)
const loadingStates = ref<Record<string, boolean>>({})

// 系统统计数据
const systemStats = ref<SystemStat[]>([
  { key: 'totalUsers', value: 1284, label: '总用户数' },
  { key: 'activeProjects', value: 42, label: '活跃项目' },
  { key: 'todayVisits', value: 389, label: '今日访问' }
])

// 仪表板指标数据
const dashboardMetrics = ref<DashboardMetric[]>([
  {
    key: 'pageViews',
    label: '页面浏览量',
    value: 45832,
    formattedValue: '45.8K',
    changePercent: 12.5,
    icon: TrendCharts,
    iconClass: 'trending',
    changeType: 'positive',
    changeIcon: ArrowUp,
    changeText: '+12.5%'
  },
  {
    key: 'activeUsers',
    label: '活跃用户',
    value: 1284,
    formattedValue: '1.3K',
    changePercent: 8.3,
    icon: User,
    iconClass: 'users',
    changeType: 'positive',
    changeIcon: ArrowUp,
    changeText: '+8.3%'
  },
  {
    key: 'avgResponseTime',
    label: '平均响应时间',
    value: 245,
    formattedValue: '245ms',
    changePercent: 15.2,
    icon: Timer,
    iconClass: 'performance',
    changeType: 'negative',
    changeIcon: ArrowDown,
    changeText: '-15.2%'
  },
  {
    key: 'revenue',
    label: '总收入',
    value: 89234,
    formattedValue: '¥89.2K',
    changePercent: 23.7,
    icon: Coin,
    iconClass: 'revenue',
    changeType: 'positive',
    changeIcon: ArrowUp,
    changeText: '+23.7%'
  }
])

// 最近活动数据
const recentActivities = ref<ActivityRecord[]>([
  {
    id: '1',
    userName: '张三',
    action: '创建了新的项目 "移动端重构"',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'success'
  },
  {
    id: '2',
    userName: '李四',
    action: '更新了用户管理模块',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'success'
  },
  {
    id: '3',
    userName: '王五',
    action: '正在处理数据导出请求',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'processing'
  },
  {
    id: '4',
    userName: '赵六',
    action: '完成了系统配置更新',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: 'success'
  }
])

// 功能卡片数据
const featureCards: FeatureCard[] = [
  {
    id: 'users',
    title: '用户管理',
    description: '管理系统用户，包括角色分配和权限控制',
    icon: User,
    route: '/users',
    stats: [
      { value: '1.2k', label: '用户' },
      { value: '8', label: '角色' }
    ],
    available: true
  },
  {
    id: 'diagram',
    title: '图表管理',
    description: '创建和管理各种类型的图表，支持Mermaid和XML格式',
    icon: TrendCharts,
    route: '/diagram',
    stats: [
      { value: '12', label: '图表' },
      { value: '3', label: '模板' }
    ],
    available: false // 暂时不可用
  },
  {
    id: 'llm',
    title: 'AI 配置',
    description: '配置和管理AI大模型服务，支持多种模型接入',
    icon: Setting,
    route: '/llm',
    stats: [
      { value: '5', label: '模型' },
      { value: '2', label: '活跃' }
    ],
    available: false // 暂时不可用
  },
  {
    id: 'table',
    title: '表格工具',
    description: '快速创建和管理数据表格，支持导入导出和数据分析',
    icon: Grid,
    route: '/table',
    stats: [
      { value: '25', label: '表格' },
      { value: '1.5k', label: '数据' }
    ],
    available: true // 可用
  },
  {
    id: 'docs',
    title: '文档中心',
    description: '查看和管理项目文档，快速获取开发资源',
    icon: Document,
    route: '/docs',
    available: false // 暂时不可用
  }
]

// 时间段选项
const timePeriods: TimePeriod[] = [
  { label: '今天', value: '1d' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' }
]

// 计算属性
const currentGreeting = computed<string>(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const filteredFeatures = computed<FeatureCard[]>(() => {
  return featureCards.filter(feature => feature.available ?? true)
})



// 方法
const handleFeatureClick = async (feature: FeatureCard): Promise<void> => {
  if (!feature.available) {
    // 使用 Element Plus 的消息提示组件显示功能暂不可用
    return
  }

  loadingStates.value[feature.id] = true

  try {
    // 模拟导航延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    await router.push(feature.route)
  } catch (error) {
    console.error('导航失败:', error)
  } finally {
    loadingStates.value[feature.id] = false
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatRelativeTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  return `${Math.floor(hours / 24)}天前`
}

const getStatusText = (status: ActivityRecord['status']): string => {
  const statusMap: Record<ActivityRecord['status'], string> = {
    success: '成功',
    pending: '处理中',
    processing: '进行中'
  }
  return statusMap[status] ?? '未知'
}

const refreshActivities = async (): Promise<void> => {
  refreshingActivities.value = true

  try {
    // 模拟刷新延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟添加新活动
    const newActivity: ActivityRecord = {
      id: Date.now().toString(),
      userName: '系统',
      action: '活动列表已刷新',
      timestamp: new Date(),
      status: 'success'
    }

    recentActivities.value.unshift(newActivity)

    // 保持最多10条记录
    if (recentActivities.value.length > 10) {
      recentActivities.value = recentActivities.value.slice(0, 10)
    }
  } catch (error) {
    console.error('刷新活动失败:', error)
  } finally {
    refreshingActivities.value = false
  }
}

// 生命周期
onMounted(() => {
  console.log('首页已加载')
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  color: white;
  padding: 32px 0;
  margin-bottom: 24px;
  border-radius: 12px;
}

.welcome-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-title {
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: clamp(16px, 2.5vw, 18px);
  margin: 0;
  opacity: 0.9;
}

.welcome-stats {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  min-width: 80px;
}

.stat-number {
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

/* 功能卡片区域 */
.features-section {
  background: white;
  padding: 32px 0;
  margin-bottom: 24px;
  border-radius: 12px;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 0 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.section-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.feature-cards {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.feature-card:hover,
.feature-card.card-hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.card-content {
  padding: 16px 0;
}

.card-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.card-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-tag {
  font-size: 12px;
}

.card-footer {
  text-align: right;
  padding: 0;
  border-top: none;
}

/* 数据概览区域 */
.dashboard-section {
  background: #f8f9fa;
  padding: 32px 0;
  margin-bottom: 24px;
  border-radius: 12px;
}

.header-actions {
  margin-top: 16px;
}

.dashboard-cards {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.dashboard-card {
  padding: 24px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.metric-icon.trending {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.metric-icon.users {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.metric-icon.performance {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.metric-icon.revenue {
  background: linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%);
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.metric-change.positive {
  color: #52c41a;
}

.metric-change.negative {
  color: #ff4d4f;
}

/* 最近活动区域 */
.activity-section {
  background: white;
  padding: 32px 0;
  border-radius: 12px;
}

.activity-card {
  max-width: 1200px;
  margin: 0 auto;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
  min-width: 0;
  /* 允许文本截断 */
}

.activity-text {
  color: #2c3e50;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  font-size: 12px;
  color: #7f8c8d;
}

.activity-status {
  flex-shrink: 0;
}

.refresh-icon {
  transition: transform 0.3s ease;
}

.refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .welcome-stats {
    justify-content: center;
    gap: 24px;
  }

  .feature-cards,
  .dashboard-cards {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }

  .activity-card {
    margin-left: 16px;
    margin-right: 16px;
  }

  .activity-item {
    flex-wrap: wrap;
    gap: 12px;
  }

  .activity-text {
    white-space: normal;
    overflow: visible;
  }
}

@media (max-width: 480px) {
  .welcome-stats {
    gap: 16px;
  }

  .stat-item {
    min-width: 60px;
  }

  .metric-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
</style>
