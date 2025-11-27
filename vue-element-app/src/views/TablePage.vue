<template>
  <div class="table-page">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <h3>图表展示</h3>
          <p>数据可视化和图表分析工具</p>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-select v-model="selectedChartType" placeholder="选择图表类型" style="width: 100%">
            <el-option label="柱状图" value="bar" />
            <el-option label="折线图" value="line" />
            <el-option label="饼图" value="pie" />
            <el-option label="散点图" value="scatter" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" :icon="Upload" @click="handleImportData">
            导入数据
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button :icon="Download" @click="handleExportChart">
            导出图表
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="chart-container" style="margin-top: 16px;">
      <template #header>
        <div class="card-header">
          <h4>图表预览</h4>
          <el-button-group>
            <el-button size="small" :icon="Refresh" @click="refreshChart">
              刷新
            </el-button>
            <el-button size="small" :icon="FullScreen" @click="toggleFullscreen">
              全屏
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="chart-wrapper" ref="chartWrapper">
        <div v-if="!selectedChartType" class="empty-chart">
          <el-empty description="请选择图表类型开始分析">
            <el-button type="primary" @click="selectSampleChart">
              使用示例数据
            </el-button>
          </el-empty>
        </div>
        <div v-else class="chart-placeholder">
          <el-skeleton :rows="8" animated />
          <p class="chart-tip">{{ selectedChartType }} 图表组件将在此显示</p>
        </div>
      </div>
    </el-card>

    <el-card class="data-config" style="margin-top: 16px;">
      <template #header>
        <h4>数据配置</h4>
      </template>

      <el-form :model="chartConfig" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="图表标题">
              <el-input v-model="chartConfig.title" placeholder="输入图表标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="X轴标签">
              <el-input v-model="chartConfig.xAxis" placeholder="X轴标签" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Y轴标签">
              <el-input v-model="chartConfig.yAxis" placeholder="Y轴标签" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主题颜色">
              <el-select v-model="chartConfig.theme" placeholder="选择主题">
                <el-option label="默认主题" value="default" />
                <el-option label="深色主题" value="dark" />
                <el-option label="彩色主题" value="colorful" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="applyConfig">
            应用配置
          </el-button>
          <el-button @click="resetConfig">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  Download,
  Refresh,
  FullScreen
} from '@element-plus/icons-vue'

// 响应式数据
const selectedChartType = ref<string>('')
const chartWrapper = ref<HTMLElement>()

// 图表配置
const chartConfig = reactive({
  title: '数据图表',
  xAxis: 'X轴',
  yAxis: 'Y轴',
  theme: 'default'
})

// 选择示例图表
const selectSampleChart = () => {
  selectedChartType.value = 'bar'
  ElMessage.success('已选择柱状图示例')
}

// 刷新图表
const refreshChart = () => {
  if (!selectedChartType.value) {
    ElMessage.warning('请先选择图表类型')
    return
  }
  ElMessage.success('图表已刷新')
}

// 切换全屏
const toggleFullscreen = () => {
  if (!chartWrapper.value) return

  if (!document.fullscreenElement) {
    chartWrapper.value.requestFullscreen()
    ElMessage.success('已进入全屏模式')
  } else {
    document.exitFullscreen()
    ElMessage.success('已退出全屏模式')
  }
}

// 导入数据
const handleImportData = () => {
  ElMessage.info('数据导入功能开发中...')
}

// 导出图表
const handleExportChart = () => {
  if (!selectedChartType.value) {
    ElMessage.warning('请先生成图表')
    return
  }
  ElMessage.info('图表导出功能开发中...')
}

// 应用配置
const applyConfig = () => {
  ElMessage.success('配置已应用')
}

// 重置配置
const resetConfig = () => {
  Object.assign(chartConfig, {
    title: '数据图表',
    xAxis: 'X轴',
    yAxis: 'Y轴',
    theme: 'default'
  })
  ElMessage.success('配置已重置')
}

// 生命周期
onMounted(() => {
  console.log('图表展示页面已加载')
})
</script>

<style scoped>
.table-page {
  padding: 20px;
}

.page-header .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header .card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-header .card-header p {
  margin: 4px 0 0 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.chart-container .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container .card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.chart-wrapper {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-chart {
  width: 100%;
  text-align: center;
}

.chart-placeholder {
  width: 100%;
  text-align: center;
}

.chart-tip {
  margin-top: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.data-config h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-page {
    padding: 12px;
  }

  .page-header .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .chart-container .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
