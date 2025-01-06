import { defineStore } from 'pinia'

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
    ] as Dream[]
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
    // 添加时间轴事件
    addTimelineEvent(event: TimelineEvent) {
      this.timelineEvents.push(event)
    },

    // 添加日记条目
    addDiaryEntry(entry: DiaryEntry) {
      this.diaryEntries.push(entry)
    },

    // 更新梦想状态
    updateDream(dreamId: string, updates: Partial<Dream>) {
      const index = this.dreams.findIndex(d => d.id === dreamId)
      if (index > -1) {
        this.dreams[index] = { ...this.dreams[index], ...updates }
      }
    }
  }
}) 