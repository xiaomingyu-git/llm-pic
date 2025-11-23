// 不使用任何存储，所有数据只在页面上临时使用
export class StorageService {
  // 配置相关 - 不保存，仅返回null
  static saveConfiguration(_config: any): void {
    // 不保存任何数据
    console.log('配置未保存（页面临时数据）')
  }

  static loadConfiguration(): any {
    // 不加载任何数据
    return null
  }

  static clearConfiguration(): void {
    // 无需清除，因为不保存
    console.log('配置清除（无数据需要清除）')
  }

  // 图表历史相关 - 不保存
  static saveDiagramHistory(_diagrams: any[]): void {
    // 不保存任何数据
    console.log('图表历史未保存（页面临时数据）')
  }

  static loadDiagramHistory(): any[] {
    // 不加载任何数据
    return []
  }

  static addToDiagramHistory(_diagram: any, _maxItems: number = 50): void {
    // 不保存任何数据
    console.log('图表未添加到历史记录（页面临时数据）')
  }

  static clearDiagramHistory(): void {
    // 无需清除，因为不保存
    console.log('图表历史清除（无数据需要清除）')
  }

  // 用户偏好设置 - 不保存
  static saveUserPreferences(_preferences: any): void {
    // 不保存任何数据
    console.log('用户偏好未保存（页面临时数据）')
  }

  static loadUserPreferences(): any {
    // 不加载任何数据
    return {}
  }

  // 工具方法 - 明确表示不使用存储
  static isLocalStorageAvailable(): boolean {
    return false // 不使用任何存储
  }

  static getStorageUsage(): { used: number; available: number } {
    return { used: 0, available: 0 } // 无存储使用
  }

  static clearAllData(): void {
    // 无需清除，因为不保存
    console.log('所有数据清除（无数据需要清除）')
  }

  // 获取当前存储使用情况
  static getMemoryUsage(): { config: boolean; history: number; preferences: boolean } {
    return {
      config: false,
      history: 0,
      preferences: false
    }
  }
}
