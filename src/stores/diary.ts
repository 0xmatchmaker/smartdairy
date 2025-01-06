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
  content: string
  timestamp: string
  dreamId?: string
  relatedThoughts?: string
}

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    dreams: [] as Dream[],
    diaryEntries: [] as DiaryEntry[],
  }),

  getters: {
    // 添加 getter 以确保组件可以访问数据
    getActiveDreams: (state) => state.dreams,
    getDiaryEntries: (state) => state.diaryEntries
  },

  actions: {
    async init() {
      console.log('Initializing store...') // 添加日志
      // 从 IndexedDB 加载数据
      const [dreams, entries] = await Promise.all([
        db.getDreams(),
        db.getEntries()
      ])

      // 如果没有梦想数据，初始化默认数据
      if (!dreams || dreams.length === 0) {
        const defaultDreams = [
          { 
            id: '1', 
            title: '学习编程', 
            dailyGoalMinutes: 120,
            accumulatedSeconds: 0 
          },
          { 
            id: '2', 
            title: '健身计划', 
            dailyGoalMinutes: 60,
            accumulatedSeconds: 0 
          },
          { 
            id: '3', 
            title: '阅读', 
            dailyGoalMinutes: 30,
            accumulatedSeconds: 0 
          },
          { 
            id: '4', 
            title: '写作', 
            dailyGoalMinutes: 45,
            accumulatedSeconds: 0 
          }
        ]
        
        await Promise.all(defaultDreams.map(dream => db.saveDream(dream)))
        this.dreams = defaultDreams

        // 添加一些测试日记条目
        const testEntries = [
          {
            id: Date.now().toString(),
            type: 'quick_note',
            content: '开始使用智能日记！',
            timestamp: new Date().toISOString()
          },
          {
            id: (Date.now() + 1).toString(),
            type: 'dream_note',
            content: '今天学习了Vue 3的基础知识',
            dreamId: '1',
            relatedThoughts: '学习编程',
            timestamp: new Date().toISOString()
          }
        ]

        await Promise.all(testEntries.map(entry => db.addEntry(entry)))
        this.diaryEntries = testEntries
      } else {
        this.dreams = dreams
        this.diaryEntries = entries || []
      }
    },

    async updateDreamProgress(dreamId: string, seconds: number) {
      const dream = this.dreams.find(d => d.id === dreamId)
      if (dream) {
        dream.accumulatedSeconds = (dream.accumulatedSeconds || 0) + seconds
        await db.saveDream(dream)
      }
    },

    async addDiaryEntry(entry: DiaryEntry) {
      await db.addEntry(entry)
      this.diaryEntries.push(entry)
    }
  }
}) 