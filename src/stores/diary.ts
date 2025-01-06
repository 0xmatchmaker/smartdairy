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
    dreams: [] as Dream[],
    diaryEntries: [] as DiaryEntry[],
  }),

  actions: {
    async init() {
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
          // ... 其他默认梦想
        ]
        
        await Promise.all(defaultDreams.map(dream => db.saveDream(dream)))
        this.dreams = defaultDreams
      } else {
        this.dreams = dreams
      }

      this.diaryEntries = entries || []
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