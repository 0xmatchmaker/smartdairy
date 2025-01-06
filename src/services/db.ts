import { openDB, DBSchema, IDBPDatabase } from 'idb'
import CryptoJS from 'crypto-js'
import { api } from './api'

interface DiaryDB extends DBSchema {
  timeline: {
    key: string
    value: {
      id: string
      time: string
      title: string
      type: string
      category?: string
      note?: string
      encrypted: boolean
    }
  }
  diary: {
    key: string
    value: {
      id: string
      type: string
      title: string
      content: string
      timestamp: string
      encrypted: boolean
    }
  }
  dreams: {
    key: string
    value: {
      id: string
      title: string
      dailyGoalMinutes: number
      accumulatedSeconds: number
      lastUpdated: string
    }
  }
}

class DiaryDatabase {
  private db: IDBPDatabase<DiaryDB> | null = null
  private encryptionKey: string = ''
  private lastSyncTime: string = ''

  async init() {
    if (!this.db) {
      this.db = await openDB<DiaryDB>('diary-db', 1, {
        upgrade(db) {
          // 时间轴存储
          if (!db.objectStoreNames.contains('timeline')) {
            db.createObjectStore('timeline', { keyPath: 'id' })
          }
          
          // 日记存储
          if (!db.objectStoreNames.contains('diary')) {
            const diaryStore = db.createObjectStore('diary', { keyPath: 'id' })
            diaryStore.createIndex('by-date', 'timestamp')
          }

          // 梦想存储
          if (!db.objectStoreNames.contains('dreams')) {
            const dreamsStore = db.createObjectStore('dreams', { keyPath: 'id' })
            dreamsStore.createIndex('by-last-updated', 'lastUpdated')
          }
        }
      })
    }
  }

  // 设置加密密钥
  setEncryptionKey(key: string) {
    this.encryptionKey = key
  }

  // 加密数据
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString()
  }

  // 解密数据
  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  // 添加时间轴事件
  async addTimelineEvent(event: any) {
    if (!this.db) await this.init()
    if (event.note) {
      event.note = this.encrypt(event.note)
      event.encrypted = true
    }
    await this.db!.add('timeline', event)
  }

  // 添加日记条目
  async addDiaryEntry(entry: any) {
    if (!this.db) await this.init()
    entry.content = this.encrypt(entry.content)
    entry.encrypted = true
    await this.db!.add('diary', entry)
  }

  // 获取指定日期的日记
  async getDiaryEntries(date: string) {
    if (!this.db) await this.init()
    const entries = await this.db!.getAllFromIndex('diary', 'by-date', date)
    return entries.map(entry => {
      if (entry.encrypted) {
        entry.content = this.decrypt(entry.content)
      }
      return entry
    })
  }

  // 获取指定日期的时间轴事件
  async getTimelineEvents(date: string) {
    if (!this.db) await this.init()
    const events = await this.db!.getAll('timeline')
    return events
      .filter(event => event.time.startsWith(date))
      .map(event => {
        if (event.encrypted && event.note) {
          event.note = this.decrypt(event.note)
        }
        return event
      })
  }

  // 备份数据
  async exportData() {
    if (!this.db) await this.init()
    const data = {
      timeline: await this.db!.getAll('timeline'),
      diary: await this.db!.getAll('diary'),
      dreams: await this.db!.getAll('dreams')
    }
    return this.encrypt(JSON.stringify(data))
  }

  // 恢复数据
  async importData(encryptedData: string) {
    if (!this.db) await this.init()
    const data = JSON.parse(this.decrypt(encryptedData))
    
    const tx = this.db!.transaction(['timeline', 'diary', 'dreams'], 'readwrite')
    await Promise.all([
      tx.objectStore('timeline').clear(),
      tx.objectStore('diary').clear(),
      tx.objectStore('dreams').clear()
    ])

    await Promise.all([
      ...data.timeline.map((event: any) => tx.objectStore('timeline').add(event)),
      ...data.diary.map((entry: any) => tx.objectStore('diary').add(entry)),
      ...data.dreams.map((dream: any) => tx.objectStore('dreams').add(dream))
    ])

    await tx.done
  }

  // 云同步相关方法
  async sync() {
    if (!this.db) await this.init()
    
    try {
      // 1. 获取本地更改
      const localChanges = await this.getLocalChanges(this.lastSyncTime)
      
      // 2. 获取远程更改
      const remoteChanges = await api.fetchData(this.lastSyncTime)
      
      // 3. 合并更改
      await this.mergeChanges(localChanges, remoteChanges)
      
      // 4. 上传本地更改
      await api.saveData({
        data: localChanges.data,
        checksum: localChanges.checksum,
        timestamp: new Date().toISOString()
      })
      
      // 5. 更新同步时间
      this.lastSyncTime = new Date().toISOString()
      localStorage.setItem('last-sync-time', this.lastSyncTime)
      
      return { success: true }
    } catch (error) {
      console.error('Sync failed:', error)
      return { success: false, error }
    }
  }

  // 获取本地更改
  private async getLocalChanges(since: string) {
    const changes = {
      timeline: await this.db!.getAll('timeline'),
      diary: await this.db!.getAll('diary'),
      dreams: await this.db!.getAll('dreams')
    }
    
    // 加密所有数据
    return this.encryptChanges(changes)
  }

  // 加密更改
  private encryptChanges(changes: any) {
    // 使用用户的加密密钥加密数据
    const encrypted = this.encrypt(JSON.stringify(changes))
    return {
      data: encrypted,
      checksum: CryptoJS.SHA256(encrypted).toString()
    }
  }

  // 合并更改
  private async mergeChanges(local: any, remote: any[]) {
    for (const change of remote) {
      try {
        const decrypted = JSON.parse(this.decrypt(change.data))
        await this.applyChanges(decrypted)
      } catch (error) {
        console.error('Failed to merge change:', error)
      }
    }
  }

  // 应用更改
  private async applyChanges(changes: any) {
    const tx = this.db!.transaction(['timeline', 'diary', 'dreams'], 'readwrite')
    
    for (const store of ['timeline', 'diary', 'dreams']) {
      for (const item of changes[store] || []) {
        await tx.objectStore(store).put(item)
      }
    }
    
    await tx.done
  }
}

export const db = new DiaryDatabase() 