import { defineStore } from 'pinia'
import { db } from '@/services/db'
import { encryption } from '@/services/encryption'

interface Dream {
  id: string
  title: string
  status: 'pending' | 'started' | 'completed'
  startTime?: string
  endTime?: string
  dailyGoalMinutes: number
  accumulatedSeconds: number
}

interface TimelineEvent {
  id: string
  time: string
  title: string
  type: string
  category?: string
  note?: string
}

interface DiaryEntry {
  id: string
  type: string
  title: string
  content: string
  timestamp: string
}

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    timelineEvents: [] as TimelineEvent[],
    diaryEntries: [] as DiaryEntry[],
    dreams: [
      { 
        id: '1', 
        title: '学习编程', 
        status: 'pending', 
        dailyGoalMinutes: 120,
        accumulatedSeconds: 0 
      },
      { 
        id: '2', 
        title: '健身计划', 
        status: 'pending', 
        dailyGoalMinutes: 60,
        accumulatedSeconds: 0 
      },
      { 
        id: '3', 
        title: '阅读', 
        status: 'pending', 
        dailyGoalMinutes: 30,
        accumulatedSeconds: 0 
      },
      { 
        id: '4', 
        title: '写作', 
        status: 'pending', 
        dailyGoalMinutes: 45,
        accumulatedSeconds: 0 
      }
    ] as Dream[],
    syncing: false,
    lastSyncTime: null as string | null,
    syncError: null as string | null
  }),

  getters: {
    getTodayEvents: (state) => () => {
      const today = new Date().toISOString().split('T')[0]
      return state.timelineEvents.filter(event => event.time.startsWith(today))
    },
    
    getActiveDreams: (state) => {
      return state.dreams
    }
  },

  actions: {
    // 初始化
    async init() {
      // 确保有加密密钥
      let key = encryption.getKey()
      if (!key) {
        key = encryption.generateKey()
        encryption.saveKey(key)
      }
      db.setEncryptionKey(key)
      
      // 加载今日数据
      const today = new Date().toISOString().split('T')[0]
      const [events, entries] = await Promise.all([
        db.getTimelineEvents(today),
        db.getDiaryEntries(today)
      ])
      
      this.timelineEvents = events
      this.diaryEntries = entries
    },

    // 添加时间轴事件
    async addTimelineEvent(event) {
      await db.addTimelineEvent(event)
      this.timelineEvents.push(event)
    },

    // 添加日记条目
    async addDiaryEntry(entry) {
      await db.addDiaryEntry(entry)
      this.diaryEntries.push(entry)
    },

    // 更新梦想状态
    updateDream(dreamId: string, updates: Partial<Dream>) {
      const index = this.dreams.findIndex(d => d.id === dreamId)
      if (index > -1) {
        this.dreams[index] = { ...this.dreams[index], ...updates }
      }
    },

    async syncData() {
      if (this.syncing) return
      
      this.syncing = true
      this.syncError = null
      
      try {
        const { success, error } = await db.sync()
        
        if (!success) {
          throw error
        }
        
        // 重新加载数据
        await this.init()
        
        this.lastSyncTime = new Date().toISOString()
      } catch (error) {
        console.error('Sync failed:', error)
        this.syncError = error.message
      } finally {
        this.syncing = false
      }
    }
  }
}) 