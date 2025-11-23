import { sendChatMessage, APIError, APIErrorType } from './llmService'
import type { LLMConfiguration, DiagramGenerationOptions } from '../types'

// 图表生成结果
export interface DiagramGenerationResult {
  success: boolean
  code: string
  format: string
  metadata: {
    generatedAt: Date
    processingTime: number
    tokensUsed: number
    model: string
  }
  error?: {
    type: 'api_error' | 'validation_error' | 'parsing_error' | 'generation_error'
    message: string
    details?: any
  }
}

// 预定义的提示词模板
const PROMPT_TEMPLATES = {
  mermaid: {
    system: `你是一个专业的软件架构师，擅长使用Mermaid语法创建清晰、准确的技术架构图。

请根据用户的描述生成符合以下要求的Mermaid代码：

1. 语法正确且可以在Mermaid.js中正常渲染
2. 使用清晰的节点名称和连接关系
3. 合理使用颜色和样式区分不同组件类型
4. 包含必要的注释说明
5. 根据系统复杂度选择合适的图表类型：
   - 简单系统：flowchart (流程图)
   - 微服务架构：graph (关系图)
   - 包含时间流程：sequence (时序图)
   - 层级结构：graph TD (从上到下)
   - 水平布局：graph LR (从左到右)

请只返回Mermaid代码，不要包含额外的解释文字。`,

    user_template: (description: string, _options: DiagramGenerationOptions) =>
      `请为以下系统架构生成${options.format.toUpperCase()}图表代码：

${description}

要求：
- 图表方向：${options.direction}
- 使用颜色：${options.useColors ? '是' : '否'}
- 包含详细说明：${options.includeDetails ? '是' : '否'}
- 添加图标：${options.addIcons ? '是' : '否'}
- 主题风格：${options.theme}

请生成可以在${options.format.toUpperCase()}中直接使用的完整代码。`
  },

  plantuml: {
    system: `你是一个专业的软件架构师，擅长使用PlantUML语法创建清晰、准确的技术架构图。

请根据用户的描述生成符合以下要求的PlantUML代码：

1. 语法正确且可以在PlantUML中正常渲染
2. 使用清晰的对象名称和连接关系
3. 合理使用颜色和样式区分不同组件类型
4. 包含必要的注释说明
5. 根据系统复杂度选择合适的图表类型：
   - 简单系统：@startuml ... @enduml
   - 组件图：component diagram
   - 部署图：deployment diagram
   - 时序图：sequence diagram

请只返回PlantUML代码，不要包含额外的解释文字。`,

    user_template: (description: string, _options: DiagramGenerationOptions) =>
      `请为以下系统架构生成PlantUML图表代码：

${description}

要求：
- 使用颜色：${options.useColors ? '是' : '否'}
- 包含详细说明：${options.includeDetails ? '是' : '否'}
- 添加图标：${options.addIcons ? '是' : '否'}

请生成可以在PlantUML中直接使用的完整代码（包含@startuml和@enduml）。`
  },

  xml: {
    system: `你是一个专业的软件架构师，擅长使用XML格式创建清晰、准确的技术架构图。

请根据用户的描述生成符合以下要求的XML代码：

1. 语法正确的XML格式
2. 包含components（组件）和connections（连接）部分
3. 每个组件需要定义id、label、x、y坐标、宽度、高度和类型
4. 连接关系需要定义from、to节点和可选的label
5. 使用合适的布局，确保组件位置合理
6. 只返回XML代码，不要其他解释

请只返回XML代码，不要包含额外的解释文字。`,

    user_template: (description: string, _options: DiagramGenerationOptions) =>
      `请为以下系统架构生成XML架构图代码：

${description}

要求：
- 包含详细的组件和连接信息
- 使用合理的坐标布局
- 组件类型包括：rectangle、database、server、client等
- 连接关系要明确标示方向

请生成符合规范的XML架构图代码。`
  }
}

export class DiagramService {
  private static readonly MAX_RETRIES = 3

  /**
   * 生成架构图
   */
  static async generateDiagram(
    config: LLMConfiguration,
    description: string,
    _options: Partial<DiagramGenerationOptions> = {}
  ): Promise<DiagramGenerationResult> {
    const startTime = Date.now()
    const mergedOptions: DiagramGenerationOptions = {
      format: 'mermaid',
      theme: 'default',
      direction: 'TB',
      includeDetails: true,
      useColors: true,
      addIcons: false,
      generateCode: false,
      customStyles: '',
      timeout: 60000, // 默认超时时间
      ..._options
    }

    try {
      // 验证输入
      this.validateInput(description)

      // 构建提示词
      const prompt = this.buildPrompt(description, mergedOptions)

      // 调用LLM API
      const response = await this.callLLMWithRetry(config, prompt, mergedOptions)

      // 解析响应
      const diagramCode = this.parseResponse(response, mergedOptions.format)

      // 验证生成的代码
      this.validateDiagramCode(diagramCode, mergedOptions.format)

      const processingTime = Date.now() - startTime

      return {
        success: true,
        code: diagramCode,
        format: mergedOptions.format,
        metadata: {
          generatedAt: new Date(),
          processingTime,
          tokensUsed: response.usage?.total_tokens || 0,
          model: response.model || 'unknown'
        }
      }
    } catch (error) {
      const processingTime = Date.now() - startTime

      return {
        success: false,
        code: '',
        format: mergedOptions.format,
        metadata: {
          generatedAt: new Date(),
          processingTime,
          tokensUsed: 0,
          model: 'unknown'
        },
        error: this.parseError(error)
      }
    }
  }

  /**
   * 流式生成架构图
   */
  static async* generateDiagramStream(
    config: LLMConfiguration,
    description: string,
    _options: Partial<DiagramGenerationOptions> = {},
    onProgress?: (progress: number, text: string) => void
  ): AsyncGenerator<string, DiagramGenerationResult, unknown> {
    const startTime = Date.now()
    const mergedOptions: DiagramGenerationOptions = {
      format: 'mermaid',
      theme: 'default',
      direction: 'TB',
      includeDetails: true,
      useColors: true,
      addIcons: false,
      generateCode: false,
      customStyles: '',
      timeout: 60000, // 默认超时时间
      ..._options
    }

    try {
      this.validateInput(description)
      const prompt = this.buildPrompt(description, mergedOptions)

      let fullResponse = ''
      let lastProgressUpdate = Date.now()

      // 模拟流式响应（由于我们的API客户端不支持真正的流式，这里用轮询模拟）
      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          const response = await sendChatMessage(config, prompt, {
            model: "gpt-3.5-turbo",
            maxTokens: 2000,
            temperature: 0.3
          })

          const content = response.choices?.[0]?.message?.content || ''

          // 模拟流式输出
          for (let i = 0; i < content.length; i += 10) {
            const chunk = content.slice(0, i + 10)
            yield chunk

            // 进度更新
            if (onProgress && Date.now() - lastProgressUpdate > 500) {
              onProgress((i + 10) / content.length * 100, chunk)
              lastProgressUpdate = Date.now()
            }

            await new Promise(resolve => setTimeout(resolve, 50))
          }

          fullResponse = content
          break
        } catch (error) {
          if (attempt === this.MAX_RETRIES) {
            throw error
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }

      const diagramCode = this.parseResponse(fullResponse, mergedOptions.format)
      this.validateDiagramCode(diagramCode, mergedOptions.format)

      return {
        success: true,
        code: diagramCode,
        format: mergedOptions.format,
        metadata: {
          generatedAt: new Date(),
          processingTime: Date.now() - startTime,
          tokensUsed: 0, // 在流式响应中难以准确计算
          model: 'gpt-3.5-turbo'
        }
      }
    } catch (error) {
      return {
        success: false,
        code: '',
        format: mergedOptions.format,
        metadata: {
          generatedAt: new Date(),
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          model: 'unknown'
        },
        error: this.parseError(error)
      }
    }
  }

  /**
   * 构建提示词
   */
  private static buildPrompt(description: string, options: DiagramGenerationOptions): string {
    const template = PROMPT_TEMPLATES[options.format]
    if (!template) {
      throw new Error(`不支持的图表格式: ${options.format}`)
    }

    return template.user_template(description, options)
  }

  /**
   * 调用LLM API（带重试）
   */
  private static async callLLMWithRetry(
    config: LLMConfiguration,
    prompt: string,
    _options: DiagramGenerationOptions
  ): Promise<any> {
    let lastError: any

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await sendChatMessage(config, prompt, {
          model: "gpt-3.5-turbo",
          maxTokens: 2000,
          temperature: 0.3
        })

        return response
      } catch (error) {
        lastError = error

        // 如果是认证错误，不重试
        if (error instanceof APIError && error.type === APIErrorType.AUTHENTICATION_ERROR) {
          throw error
        }

        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 指数退避
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  /**
   * 解析响应
   */
  private static parseResponse(response: any, format: string): string {
    const content = response.choices?.[0]?.message?.content || ''

    if (!content.trim()) {
      throw new Error('AI响应为空')
    }

    // 提取图表代码
    return this.extractDiagramCode(content, format)
  }

  /**
   * 提取图表代码
   */
  private static extractDiagramCode(content: string, format: string): string {
    // 移除代码块标记
    let code = content.replace(/```(?:mermaid|plantuml|xml)?\n?/gi, '').replace(/```\s*$/g, '')

    // 对于PlantUML，确保包含开始和结束标记
    if (format === 'plantuml') {
      if (!code.includes('@startuml')) {
        code = `@startuml\n${code}`
      }
      if (!code.includes('@enduml')) {
        code = `${code}\n@enduml`
      }
    }

    return code.trim()
  }

  /**
   * 验证输入
   */
  private static validateInput(description: string): void {
    if (!description || !description.trim()) {
      throw new Error('架构描述不能为空')
    }

    if (description.trim().length < 10) {
      throw new Error('架构描述至少需要10个字符')
    }

    if (description.trim().length > 5000) {
      throw new Error('架构描述不能超过5000字符')
    }
  }

  /**
   * 验证图表代码
   */
  private static validateDiagramCode(code: string, format: string): void {
    if (!code || !code.trim()) {
      throw new Error('生成的图表代码为空')
    }

    // 基本语法检查
    if (format === 'mermaid') {
      // 检查是否包含基本的Mermaid关键字
      const hasValidKeyword = /^(graph|flowchart|sequence|gantt|class|git|pie|journey|state|er|pie|block|timeline|mindmap)/i.test(code.trim())
      if (!hasValidKeyword) {
        throw new Error('生成的代码不符合Mermaid语法规范')
      }
    } else if (format === 'plantuml') {
      // 检查是否包含PlantUML开始/结束标记
      if (!code.includes('@startuml') || !code.includes('@enduml')) {
        throw new Error('生成的代码不符合PlantUML语法规范')
      }
    }
  }

  /**
   * 解析错误
   */
  private static parseError(error: any): DiagramGenerationResult['error'] {
    if (error instanceof APIError) {
      return {
        type: 'api_error',
        message: error.message,
        details: {
          statusCode: error.statusCode,
          errorType: error.type
        }
      }
    }

    if (error instanceof Error) {
      return {
        type: error.message.includes('语法') ? 'parsing_error' : 'generation_error',
        message: error.message
      }
    }

    return {
      type: 'generation_error',
      message: '未知错误',
      details: error
    }
  }

  /**
   * 获取支持的图表格式
   */
  static getSupportedFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      {
        value: 'mermaid',
        label: 'Mermaid',
        description: '简单易用的图表语法，适合快速生成'
      },
      {
        value: 'plantuml',
        label: 'PlantUML',
        description: '功能强大的UML工具，支持复杂图表'
      }
    ]
  }

  /**
   * 获取图表样式预设
   */
  static getStylePresets(): Array<{ name: string; styles: string }> {
    return [
      {
        name: '科技蓝',
        styles: `
          style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px
          style B fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
          style C fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
        `
      },
      {
        name: '商务灰',
        styles: `
          style A fill:#f5f5f5,stroke:#424242,stroke-width:2px
          style B fill:#eeeeee,stroke:#616161,stroke-width:2px
          style C fill:#fafafa,stroke:#757575,stroke-width:2px
        `
      },
      {
        name: '活力橙',
        styles: `
          style A fill:#fff3e0,stroke:#e65100,stroke-width:2px
          style B fill:#fce4ec,stroke:#c2185b,stroke-width:2px
          style C fill:#f1f8e9,stroke:#33691e,stroke-width:2px
        `
      }
    ]
  }
}

// 导出便捷函数
export const generateDiagram = DiagramService.generateDiagram
export const generateDiagramStream = DiagramService.generateDiagramStream
