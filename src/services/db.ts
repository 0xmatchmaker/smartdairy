import { openDB } from 'idb'

// 添加一个抽象层
interface StorageProvider {
  getDreams(): Promise<Dream[]>
  saveDream(dream: Dream): Promise<void>
  getEntries(): Promise<DiaryEntry[]>
  addEntry(entry: DiaryEntry): Promise<void>
}

// 现有的 IndexedDB 实现
class IndexedDBStorage implements StorageProvider {
  private db: any = null
  private readonly DB_NAME = 'diary-app'
  private readonly DB_VERSION = 1

  async init() {
    if (this.db) return

    this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // 创建所需的对象仓库
        if (!db.objectStoreNames.contains('dreams')) {
          db.createObjectStore('dreams', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('diary_entries')) {
          db.createObjectStore('diary_entries', { keyPath: 'id' })
        }
      }
    })
  }

  // 梦想相关操作
  async saveDream(dream: any) {
    await this.init()
    return this.db.put('dreams', dream)
  }

  async getDreams() {
    await this.init()
    return this.db.getAll('dreams')
  }

  // 日记条目相关操作
  async addEntry(entry: any) {
    await this.init()
    return this.db.add('diary_entries', entry)
  }

  async getEntries() {
    await this.init()
    return this.db.getAll('diary_entries')
  }

  // 清除所有数据（用于测试）
  async clearAll() {
    await this.init()
    await this.db.clear('dreams')
    await this.db.clear('diary_entries')
  }
}

// 未来的 API 实现
class APIStorage implements StorageProvider {
  // 后续添加
}

// 导出当前使用的存储实现
export const db = new IndexedDBStorage() 