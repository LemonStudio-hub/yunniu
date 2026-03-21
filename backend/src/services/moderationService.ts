import Mint from 'mint-filter'
import fs from 'fs'
import path from 'path'

class ModerationService {
  private mint: Mint
  private initialized: boolean = false

  constructor() {
    this.mint = new Mint([])
    this.initialize()
  }

  private async initialize() {
    try {
      const sensitiveWords = await this.loadSensitiveWords()
      sensitiveWords.forEach(word => {
        this.mint.add(word)
      })
      this.initialized = true
      console.log(`敏感词库初始化完成，加载了 ${sensitiveWords.length} 个敏感词`)
    } catch (error) {
      console.error('敏感词库初始化失败:', error)
      this.initialized = false
    }
  }

  private async loadSensitiveWords(): Promise<string[]> {
    const words: string[] = []
    
    // 在 Cloudflare Workers 环境中，我们使用预加载的敏感词
    // 这里简化处理，返回一个空数组，实际项目中可以从 KV 或其他存储中加载
    return words
  }

  /**
   * 审核内容
   * @param content 需要审核的内容
   * @returns 审核结果
   */
  public moderate(content: string) {
    if (!this.initialized) {
      return {
        passed: true,
        message: '审核服务未初始化，暂时跳过审核',
        sensitiveWords: []
      }
    }

    const result = this.mint.filter(content)
    const hasSensitiveWords = result.words.length > 0

    return {
      passed: !hasSensitiveWords,
      message: hasSensitiveWords ? '内容包含敏感词' : '审核通过',
      sensitiveWords: result.words,
      filteredContent: result.text
    }
  }

  /**
   * 快速验证内容是否通过审核
   * @param content 需要验证的内容
   * @returns 是否通过审核
   */
  public verify(content: string): boolean {
    if (!this.initialized) {
      return true
    }

    return this.mint.verify(content)
  }

  /**
   * 添加敏感词
   * @param word 敏感词
   * @returns 是否添加成功
   */
  public addSensitiveWord(word: string): boolean {
    return this.mint.add(word)
  }

  /**
   * 删除敏感词
   * @param word 敏感词
   * @returns 操作状态
   */
  public removeSensitiveWord(word: string): 'update' | 'delete' {
    return this.mint.delete(word)
  }
}

export const moderationService = new ModerationService()
export { ModerationService }
