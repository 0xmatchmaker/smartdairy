import { defineStore } from 'pinia'

interface DiaryEntry {
  id: string
  type: 'health' | 'note' | 'custom'
  title: string
  content: string
  timestamp: string
}

interface TimelineEvent {
  id: string
  time: string
  title: string
  type: 'preset' | 'custom' | 'health'
  category?: 'health-task-start' | 'health-task-complete'
  note?: string
}

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    timelineEvents: [] as TimelineEvent[],
    diaryEntries: [] as DiaryEntry[],
    quickNotes: [],
    settings: {}
  }),
  
  getters: {
    getTodayEvents: (state) => () => {
      const today = new Date().toISOString().split('T')[0]
      return state.timelineEvents.filter(event => event.time.startsWith(today))
    }
  },

  actions: {
    addTimelineEvent(event: TimelineEvent) {
      this.timelineEvents.push(event)
    },
    
    removeTimelineEvent(time: string) {
      const index = this.timelineEvents.findIndex(e => e.time === time)
      if (index > -1) {
        this.timelineEvents.splice(index, 1)
      }
    },
    
    updateTimelineEvent(event: TimelineEvent) {
      const index = this.timelineEvents.findIndex(e => e.time === event.time)
      if (index > -1) {
        this.timelineEvents[index] = event
      }
    },

    addDiaryEntry(entry: DiaryEntry) {
      this.diaryEntries.push(entry)
    },

    getDailyEntries(date: string) {
      return this.diaryEntries.filter(entry => 
        entry.timestamp.startsWith(date)
      )
    }
  }
}) 