# Vue3项目测试策略完整指南

## 1. 单元测试：Vitest配置

### 安装依赖
```bash
npm install -D vitest @vue/test-utils jsdom @testing-library/vue @testing-library/jest-dom
```

### 配置文件
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        'dist/',
        'coverage/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 测试设置文件
```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Element Plus if needed
vi.mock('element-plus', () => ({
  default: {},
  ElButton: { name: 'ElButton' },
  ElInput: { name: 'ElInput' },
  // 其他Element Plus组件...
}))

// Mock LLM API calls
global.fetch = vi.fn()

// Mock Chart.js or other chart libraries
vi.mock('chart.js', () => ({
  default: {
    register: vi.fn(),
    Chart: vi.fn()
  }
}))
```

## 2. Vue3组件测试示例

### 基础组件测试
```typescript
// src/components/__tests__/HelloWorld.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { 
      props: { msg: 'Hello Vitest' }
    })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('emits events correctly', async () => {
    const wrapper = mount(HelloWorld)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

### Element Plus组件测试
```typescript
// src/components/__tests__/FormComponent.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import FormComponent from '../FormComponent.vue'

describe('FormComponent with Element Plus', () => {
  let wrapper: any

  beforeEach(() => {
    const app = createApp(FormComponent)
    app.use(ElementPlus)
    
    wrapper = mount(FormComponent, {
      global: {
        plugins: [ElementPlus]
      }
    })
  })

  it('renders Element Plus components', () => {
    expect(wrapper.find('.el-input').exists()).toBe(true)
    expect(wrapper.find('.el-button').exists()).toBe(true)
  })

  it('validates form inputs', async () => {
    const input = wrapper.find('input[type="text"]')
    await input.setValue('test value')
    await input.trigger('blur')
    
    expect(wrapper.emitted('input-change')).toBeTruthy()
  })
})
```

### Composition API测试
```typescript
// src/composables/__tests__/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
  it('increments counter', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    
    increment()
    expect(count.value).toBe(1)
  })

  it('decrements counter', () => {
    const { count, decrement } = useCounter(5)
    expect(count.value).toBe(5)
    
    decrement()
    expect(count.value).toBe(4)
  })
})
```

## 3. 端到端测试：Cypress vs Playwright对比

### 推荐选择：Playwright

### Playwright优势：
- **多浏览器支持**：Chromium、Firefox、Webkit
- **更快执行速度**：比Cypress快约26%
- **并行测试**：原生支持并行执行
- **更好的网络控制**：完善的API模拟和拦截
- **跨平台**：支持Windows、macOS、Linux
- **TypeScript支持**：原生TypeScript支持

### Cypress的情况：
- 更适合组件测试
- 调试体验更好
- 学习曲线较低

## 4. Playwright配置和示例

### 安装依赖
```bash
npm install -D @playwright/test
npx playwright install
```

### 配置文件
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E测试示例
```typescript
// src/tests/e2e/app.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Vue3应用E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('页面加载和基本功能', async ({ page }) => {
    await expect(page).toHaveTitle(/Vue3应用/)
    await expect(page.locator('h1')).toContainText('欢迎使用')
  })

  test('表单提交功能', async ({ page }) => {
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.success-message')).toContainText('提交成功')
  })

  test('Element Plus组件交互', async ({ page }) => {
    // 测试下拉菜单
    await page.click('.el-dropdown')
    await page.click('.el-dropdown-menu__item:has-text("选项1")')
    
    // 测试对话框
    await page.click('.el-button:has-text("打开对话框")')
    await expect(page.locator('.el-dialog')).toBeVisible()
    await page.click('.el-dialog__headerbtn')
    await expect(page.locator('.el-dialog')).not.toBeVisible()
  })

  test('图表渲染', async ({ page }) => {
    await page.waitForSelector('canvas')
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // 可以截图对比
    await expect(canvas).toHaveScreenshot('chart.png')
  })
})
```

## 5. LLM API调用测试策略

### Mock方案
```typescript
// src/services/__tests__/llmService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { llmService } from '../llmService'

// Mock fetch
global.fetch = vi.fn()

describe('LLM Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('成功调用LLM API', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: '这是AI的回复'
        }
      }]
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await llmService.generateResponse('测试问题')
    
    expect(result).toBe('这是AI的回复')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        })
      })
    )
  })

  it('处理API错误', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' })
    })

    await expect(llmService.generateResponse('测试问题')).rejects.toThrow()
  })

  it('处理网络错误', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

    await expect(llmService.generateResponse('测试问题')).rejects.toThrow('Network error')
  })
})
```

### 集成测试
```typescript
// src/tests/integration/llm.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupApp } from '../helpers/test-setup'

describe('LLM功能集成测试', () => {
  let app: any

  beforeAll(async () => {
    app = await setupApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('完整的LLM交互流程', async () => {
    const response = await app.request
      .post('/api/chat')
      .send({ message: '你好，请介绍一下自己' })
      .expect(200)

    expect(response.body).toHaveProperty('reply')
    expect(response.body.reply).toBeTypeOf('string')
    expect(response.body.reply.length).toBeGreaterThan(0)
  }, 10000) // 增加超时时间
})
```

## 6. 图表生成功能测试

### 组件测试
```typescript
// src/components/__tests__/ChartComponent.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ChartComponent from '../ChartComponent.vue'

// Mock Chart.js
vi.mock('chart.js', () => ({
  default: class MockChart {
    constructor() {
      this.data = null
      this.options = null
    }
    
    render() {
      return Promise.resolve()
    }
    
    update() {
      return Promise.resolve()
    }
    
    destroy() {
      return Promise.resolve()
    }
  }
}))

describe('ChartComponent', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ChartComponent, {
      props: {
        data: {
          labels: ['一月', '二月', '三月'],
          datasets: [{
            label: '销售额',
            data: [100, 200, 150]
          }]
        }
      }
    })
  })

  it('正确渲染图表', () => {
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.vm.chart).toBeDefined()
  })

  it('数据更新时重新渲染', async () => {
    const newData = {
      labels: ['四月', '五月'],
      datasets: [{
        label: '销售额',
        data: [300, 250]
      }]
    }

    await wrapper.setProps({ data: newData })
    
    expect(wrapper.vm.chart.data).toEqual(newData)
  })

  it('响应窗口大小变化', async () => {
    const resizeSpy = vi.spyOn(wrapper.vm, 'handleResize')
    
    window.dispatchEvent(new Event('resize'))
    
    expect(resizeSpy).toHaveBeenCalled()
  })
})
```

### 可视化回归测试
```typescript
// src/tests/visual/chart.visual.test.ts
import { test, expect } from '@playwright/test'

test.describe('图表可视化测试', () => {
  test('图表渲染截图对比', async ({ page }) => {
    await page.goto('/chart-demo')
    await page.waitForLoadState('networkidle')
    
    const chart = page.locator('#main-chart')
    await expect(chart).toBeVisible()
    
    // 截图对比
    await expect(chart).toHaveScreenshot('chart-default.png')
  })

  test('图表交互效果', async ({ page }) => {
    await page.goto('/chart-demo')
    
    // 测试hover效果
    const chart = page.locator('canvas')
    await chart.hover({ position: { x: 100, y: 100 } })
    
    // 检查tooltip是否显示
    await expect(page.locator('.chart-tooltip')).toBeVisible()
  })
})
```

## 7. 测试覆盖率要求和策略

### 覆盖率配置
```typescript
// vitest.config.ts 覆盖率配置
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // 对关键模块要求更高
        'src/services/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/utils/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    }
  }
})
```

### 分层测试策略
```
1. 单元测试（70%）
   - 工具函数：95%覆盖率
   - 业务逻辑：90%覆盖率
   - 组件逻辑：85%覆盖率

2. 集成测试（20%）
   - API集成测试
   - 组件间交互测试
   - 数据流测试

3. E2E测试（10%）
   - 核心用户流程
   - 关键业务场景
   - 跨浏览器兼容性
```

## 8. 性能测试策略

### 组件性能测试
```typescript
// src/tests/performance/component.performance.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import HeavyComponent from '../HeavyComponent.vue'

describe('组件性能测试', () => {
  it('大数据集渲染性能', async () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))

    const startTime = performance.now()
    
    const wrapper = mount(HeavyComponent, {
      props: { data: largeData }
    })
    
    await wrapper.vm.$nextTick()
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    expect(renderTime).toBeLessThan(1000) // 渲染时间小于1秒
    expect(wrapper.findAll('.list-item')).toHaveLength(10000)
  })

  it('内存使用测试', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    const wrapper = mount(HeavyComponent, {
      props: { data: Array(1000).fill({}) }
    })
    
    wrapper.unmount()
    
    // 强制垃圾回收（如果支持）
    if (global.gc) {
      global.gc()
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 内存增长小于10MB
  })
})
```

### API性能测试
```typescript
// src/tests/performance/api.performance.test.ts
import { describe, it, expect } from 'vitest'
import { apiService } from '../services/apiService'

describe('API性能测试', () => {
  it('API响应时间测试', async () => {
    const startTime = performance.now()
    
    await apiService.getData()
    
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    expect(responseTime).toBeLessThan(5000) // 响应时间小于5秒
  }, 10000)

  it('并发请求性能', async () => {
    const requests = Array(10).fill(null).map(() => apiService.getData())
    
    const startTime = performance.now()
    await Promise.all(requests)
    const endTime = performance.now()
    
    const totalTime = endTime - startTime
    expect(totalTime).toBeLessThan(10000) // 10个并发请求总时间小于10秒
  }, 15000)
})
```

## 9. Element Plus兼容性测试

### 主题和样式测试
```typescript
// src/tests/compatibility/element-plus.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import ThemeComponent from '../ThemeComponent.vue'

describe('Element Plus兼容性测试', () => {
  let app: any

  beforeEach(() => {
    app = createApp({})
    app.use(ElementPlus)
  })

  it('主题变量正确应用', () => {
    const wrapper = mount(ThemeComponent, {
      global: {
        plugins: [ElementPlus]
      }
    })

    const button = wrapper.find('.el-button')
    expect(button.exists()).toBe(true)
    
    // 检查自定义主题变量
    const styles = getComputedStyle(button.element)
    expect(styles.getPropertyValue('--el-button-bg-color')).toBeDefined()
  })

  it('响应式布局正常工作', async () => {
    const wrapper = mount(ThemeComponent, {
      global: {
        plugins: [ElementPlus]
      }
    })

    // 模拟不同屏幕尺寸
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()

    const grid = wrapper.find('.el-row')
    expect(grid.classes()).toContain('el-row--flex')
  })

  it('国际化支持', async () => {
    const app = createApp(ThemeComponent)
    app.use(ElementPlus, {
      locale: 'en'
    })

    const wrapper = mount(ThemeComponent, {
      global: {
        plugins: [app]
      }
    })

    const datePicker = wrapper.find('.el-date-picker')
    expect(datePicker.exists()).toBe(true)
    
    // 检查英文标签
    await datePicker.trigger('click')
    await wrapper.vm.$nextTick()
    
    const pickerPanel = wrapper.find('.el-picker-panel')
    expect(pickerPanel.text()).toMatch(/Jan|Feb|Mar/i)
  })
})
```

## 10. CI/CD集成配置

### GitHub Actions配置
```yaml
# .github/workflows/test.yml
name: 测试流水线

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
        
    steps:
    - uses: actions/checkout@v3
    
    - name: 设置Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 运行单元测试
      run: npm run test:unit
      
    - name: 运行E2E测试
      run: npm run test:e2e
      
    - name: 上传覆盖率报告
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
        
    - name: 上传测试结果
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: test-results
        path: |
          test-results/
          coverage/
          playwright-report/
```

### 测试脚本配置
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:visual": "playwright test --config=playwright.visual.config.ts",
    "test:performance": "node scripts/performance-test.js",
    "test:ci": "npm run test:unit && npm run test:e2e"
  }
}
```

## 总结

### 核心建议：
1. **单元测试使用Vitest** - 更好的性能和Vite集成
2. **E2E测试使用Playwright** - 更快的执行速度和多浏览器支持
3. **覆盖率要求80%以上** - 关键模块要求90-95%
4. **Element Plus兼容性测试** - 确保组件库正确工作
5. **LLM API Mock测试** - 减少外部依赖，提高测试稳定性
6. **性能测试** - 确保应用在各种条件下的性能表现
7. **CI/CD集成** - 自动化测试流程和质量门禁

这个测试策略提供了全面的质量保障，确保Vue3应用的稳定性和可靠性。