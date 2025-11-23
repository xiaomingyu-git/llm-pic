export class CopyService {
  // 移除未使用的常量以避免警告
  // private static readonly COPY_TIMEOUT = 5000 // 5秒超时

  /**
   * 复制文本到剪贴板
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      // 优先使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await this.copyWithClipboardAPI(text)
        return true
      }

      // 回退到传统方法
      await this.copyWithLegacyMethod(text)
      return true
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }

  /**
   * 复制并显示反馈
   */
  static async copyWithFeedback(
    text: string,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      const success = await this.copyToClipboard(text)
      if (success) {
        onSuccess?.(text.length > 100 ? '内容已复制到剪贴板' : `已复制: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`)
      } else {
        onError?.('复制失败，请手动选择文本复制')
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '复制失败')
    }
  }

  /**
   * 复制带格式的文本
   */
  static async copyFormattedText(
    plainText: string,
    htmlText?: string
  ): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        const items = []

        // 添加纯文本
        items.push(
          new ClipboardItem({
            'text/plain': new Blob([plainText], { type: 'text/plain' })
          })
        )

        // 如果有HTML，也添加HTML格式
        if (htmlText) {
          items.push(
            new ClipboardItem({
              'text/html': new Blob([htmlText], { type: 'text/html' })
            })
          )
        }

        await navigator.clipboard.write(items)
        return true
      }

      // 回退到只复制纯文本
      return await this.copyToClipboard(plainText)
    } catch (error) {
      console.error('复制格式化文本失败:', error)
      return false
    }
  }

  /**
   * 复制图片到剪贴板
   */
  static async copyImageToClipboard(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<boolean> {
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('当前浏览器不支持复制图片到剪贴板')
      }

      let blob: Blob

      if (imageElement instanceof HTMLCanvasElement) {
        blob = await new Promise<Blob>((resolve) => {
          imageElement.toBlob((blob) => {
            resolve(blob!)
          }, 'image/png')
        })
      } else {
        // 如果是img元素，先转换为canvas
        const canvas = await this.imageToCanvas(imageElement)
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!)
          }, 'image/png')
        })
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ])

      return true
    } catch (error) {
      console.error('复制图片失败:', error)
      return false
    }
  }

  /**
   * 复制SVG到剪贴板（支持多种格式）
   */
  static async copySVGToClipboard(
    svgElement: SVGElement,
    options: {
      asText?: boolean
      asImage?: boolean
      width?: number
      height?: number
    } = {}
  ): Promise<{ success: boolean; formats: string[] }> {
    const results: { success: boolean; formats: string[] } = {
      success: false,
      formats: []
    }

    try {
      const tasks: Promise<void>[] = []

      // 复制为文本
      if (options.asText !== false) {
        tasks.push(
          this.copySVGAsText(svgElement).then(() => {
            results.formats.push('text')
          })
        )
      }

      // 复制为图片
      if (options.asImage !== false) {
        tasks.push(
          this.copySVGAsImage(svgElement, options.width, options.height).then(() => {
            results.formats.push('image')
          })
        )
      }

      await Promise.allSettled(tasks)
      results.success = results.formats.length > 0

      return results
    } catch (error) {
      console.error('复制SVG失败:', error)
      return results
    }
  }

  /**
   * 带选择功能的复制
   */
  static copyWithSelection(text: string, _element?: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)

        const selection = document.getSelection()
        const selected = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

        textArea.focus()
        textArea.select()

        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (selected) {
          selection!.removeAllRanges()
          selection!.addRange(selected)
        }

        if (successful) {
          resolve()
        } else {
          reject(new Error('execCommand copy failed'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 检查剪贴板权限
   */
  static async checkClipboardPermission(): Promise<PermissionState> {
    try {
      if (!navigator.permissions) {
        return 'prompt' // 不支持权限API的浏览器
      }

      const permission = await navigator.permissions.query({
        name: 'clipboard-write' as PermissionName
      })
      return permission.state
    } catch {
      return 'prompt'
    }
  }

  /**
   * 请求剪贴板权限
   */
  static async requestClipboardPermission(): Promise<boolean> {
    try {
      // 尝试写入剪贴板来请求权限
      await this.copyToClipboard('')
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取剪贴板内容
   */
  static async getClipboardContent(): Promise<string> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return await navigator.clipboard.readText()
      }
      throw new Error('当前环境不支持读取剪贴板')
    } catch (error) {
      console.error('读取剪贴板失败:', error)
      throw error
    }
  }

  // 私有方法

  /**
   * 使用 Clipboard API 复制
   */
  private static async copyWithClipboardAPI(text: string): Promise<void> {
    await navigator.clipboard.writeText(text)
  }

  /**
   * 使用传统方法复制
   */
  private static async copyWithLegacyMethod(text: string): Promise<void> {
    await this.copyWithSelection(text)
  }

  /**
   * 将图片转换为 Canvas
   */
  private static async imageToCanvas(img: HTMLImageElement): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'))
        return
      }

      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height

      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        resolve(canvas)
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      // 如果图片已经加载
      if (img.complete && img.naturalHeight !== 0) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas)
      }
    })
  }

  /**
   * 复制SVG为文本
   */
  private static async copySVGAsText(svgElement: SVGElement): Promise<void> {
    const svgText = new XMLSerializer().serializeToString(svgElement)
    await this.copyToClipboard(svgText)
  }

  /**
   * 复制SVG为图片
   */
  private static async copySVGAsImage(
    svgElement: SVGElement,
    width?: number,
    height?: number
  ): Promise<void> {
    const svgText = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = async () => {
      URL.revokeObjectURL(url)

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('无法获取Canvas上下文')
      }

      canvas.width = width || img.width
      canvas.height = height || img.height

      // 如果有指定的尺寸，先绘制白色背景
      if (width || height) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const success = await this.copyImageToClipboard(canvas)
      if (!success) {
        throw new Error('复制SVG图片失败')
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      throw new Error('SVG转换为图片失败')
    }

    img.src = url
  }

  /**
   * 检查浏览器支持
   */
  static isClipboardSupported(): boolean {
    return !!(navigator.clipboard && window.isSecureContext)
  }

  /**
   * 获取支持的功能
   */
  static getSupportedFeatures(): {
    copyText: boolean
    copyImage: boolean
    copyFormatted: boolean
    readClipboard: boolean
  } {
    return {
      copyText: !!navigator.clipboard?.writeText,
      copyImage: !!navigator.clipboard?.write,
      copyFormatted: !!navigator.clipboard?.write,
      readClipboard: !!navigator.clipboard?.readText
    }
  }
}

// 导出便捷函数
export const copyToClipboard = CopyService.copyToClipboard.bind(CopyService)
export const copyWithFeedback = CopyService.copyWithFeedback.bind(CopyService)
export const copyImageToClipboard = CopyService.copyImageToClipboard.bind(CopyService)
export const copySVGToClipboard = CopyService.copySVGToClipboard.bind(CopyService)
