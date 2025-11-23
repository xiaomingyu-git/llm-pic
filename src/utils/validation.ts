import type { LLMConfiguration, DiagramGenerationOptions } from '../types'

// URL验证规则
const URL_PATTERNS = {
  HTTP: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  API_ENDPOINT: /^https?:\/\/.+(\/api\/.*)?$/i,
  OPENAI_COMPATIBLE: /^https?:\/\/api\.openai\.com\/v1/i,
  LOCAL_LLM: /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i
} as const

// API密钥验证规则
const API_KEY_PATTERNS = {
  OPENAI: /^sk-[A-Za-z0-9]{48}$/,
  CLAUDE: /^sk-ant-api[0-9]{1}-[A-Za-z0-9_-]{95}$/,
  CUSTOM: /^[A-Za-z0-9_\-\.]{20,}$/
} as const

export class ValidationService {
  // URL验证
  static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false

    try {
      new URL(url)
      return URL_PATTERNS.HTTP.test(url)
    } catch {
      return false
    }
  }

  static isValidApiUrl(url: string): boolean {
    return this.isValidUrl(url) && URL_PATTERNS.API_ENDPOINT.test(url)
  }

  static isOpenAICompatible(url: string): boolean {
    return URL_PATTERNS.OPENAI_COMPATIBLE.test(url)
  }

  static isLocalLLM(url: string): boolean {
    return URL_PATTERNS.LOCAL_LLM.test(url)
  }

  static getUrlType(url: string): 'openai' | 'local' | 'custom' | 'invalid' {
    if (!this.isValidUrl(url)) return 'invalid'
    if (this.isOpenAICompatible(url)) return 'openai'
    if (this.isLocalLLM(url)) return 'local'
    return 'custom'
  }

  // API密钥验证
  static isValidApiKey(key: string, provider?: 'openai' | 'claude' | 'custom'): boolean {
    if (!key || typeof key !== 'string') return false

    if (provider) {
      switch (provider) {
        case 'openai':
          return API_KEY_PATTERNS.OPENAI.test(key)
        case 'claude':
          return API_KEY_PATTERNS.CLAUDE.test(key)
        case 'custom':
          return API_KEY_PATTERNS.CUSTOM.test(key)
        default:
          return false
      }
    }

    // 自动检测
    return API_KEY_PATTERNS.OPENAI.test(key) ||
      API_KEY_PATTERNS.CLAUDE.test(key) ||
      API_KEY_PATTERNS.CUSTOM.test(key)
  }

  static getApiKeyProvider(key: string): 'openai' | 'claude' | 'custom' | 'unknown' {
    if (API_KEY_PATTERNS.OPENAI.test(key)) return 'openai'
    if (API_KEY_PATTERNS.CLAUDE.test(key)) return 'claude'
    if (API_KEY_PATTERNS.CUSTOM.test(key)) return 'custom'
    return 'unknown'
  }

  // 配置验证
  static validateLLMConfig(config: Partial<LLMConfiguration>): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // URL验证
    if (!config.url) {
      errors.push('API URL不能为空')
    } else if (!this.isValidUrl(config.url)) {
      errors.push('API URL格式无效')
    } else {
      const urlType = this.getUrlType(config.url)
      if (urlType === 'local') {
        warnings.push('使用本地LLM服务，请确保服务正在运行')
      }
    }

    // API密钥验证
    if (!config.apiKey) {
      errors.push('API密钥不能为空')
    } else if (!this.isValidApiKey(config.apiKey)) {
      errors.push('API密钥格式无效')
    } else {
      const provider = this.getApiKeyProvider(config.apiKey)
      if (provider === 'unknown') {
        warnings.push('未知的API密钥格式，请确认密钥正确')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 图表生成选项验证
  static validateDiagramOptions(options: Partial<DiagramGenerationOptions>): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // 格式验证
    if (options.format && !['mermaid', 'plantuml'].includes(options.format)) {
      errors.push('图表格式必须是 mermaid 或 plantuml')
    }

    // 主题验证
    if (options.theme && !['default', 'dark', 'forest', 'neutral'].includes(options.theme)) {
      errors.push('图表主题无效')
    }

    // 方向验证
    if (options.direction && !['TB', 'TD', 'BT', 'RL', 'LR'].includes(options.direction)) {
      errors.push('图表方向无效')
    }

    // 超时验证
    if (options.timeout !== undefined) {
      if (typeof options.timeout !== 'number' || options.timeout <= 0) {
        errors.push('超时时间必须是正数')
      } else if (options.timeout > 300) {
        errors.push('超时时间不能超过300秒')
      } else if (options.timeout < 5) {
        errors.push('超时时间不能少于5秒')
      }
    }

    // 最大token数验证
    if (options.maxTokens !== undefined) {
      if (typeof options.maxTokens !== 'number' || options.maxTokens <= 0) {
        errors.push('最大token数必须是正数')
      } else if (options.maxTokens > 8000) {
        errors.push('最大token数不能超过8000')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 输入验证
  static validateDiagramInput(input: string): {
    isValid: boolean
    errors: string[]
    suggestions: string[]
  } {
    const errors: string[] = []
    const suggestions: string[] = []

    if (!input || typeof input !== 'string') {
      errors.push('输入不能为空')
      return { isValid: false, errors, suggestions }
    }

    const trimmedInput = input.trim()

    if (trimmedInput.length < 5) {
      errors.push('输入太短，请提供更详细的描述')
    } else if (trimmedInput.length > 2000) {
      errors.push('输入太长，请控制在2000字符以内')
    }

    // 提供改进建议
    if (!trimmedInput.includes('系统') && !trimmedInput.includes('应用') && !trimmedInput.includes('架构')) {
      suggestions.push('建议包含"系统"、"应用"或"架构"等关键词')
    }

    if (!trimmedInput.includes('数据库') && !trimmedInput.includes('API') && !trimmedInput.includes('服务')) {
      suggestions.push('建议包含具体的技术组件，如数据库、API、服务等')
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    }
  }

  // 通用输入清理
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return ''

    return input
      .trim()
      .replace(/[<>]/g, '') // 移除潜在的HTML标签
      .replace(/[\r\n\t]+/g, ' ') // 将多个空白字符替换为单个空格
      .slice(0, 2000) // 限制长度
  }

  // 密码强度检查
  static checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (!password) {
      return { score: 0, feedback: ['密码不能为空'] }
    }

    if (password.length >= 8) score++
    else feedback.push('密码长度至少8位')

    if (/[a-z]/.test(password)) score++
    else feedback.push('需要包含小写字母')

    if (/[A-Z]/.test(password)) score++
    else feedback.push('需要包含大写字母')

    if (/[0-9]/.test(password)) score++
    else feedback.push('需要包含数字')

    if (/[^A-Za-z0-9]/.test(password)) score++
    else feedback.push('建议包含特殊字符')

    return { score, feedback }
  }

  // 邮箱验证
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 版本号验证
  static isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9\-\.]+)?$/
    return versionRegex.test(version)
  }

  // 端口号验证
  static isValidPort(port: number): boolean {
    return Number.isInteger(port) && port > 0 && port <= 65535
  }
}
