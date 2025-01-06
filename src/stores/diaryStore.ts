import { defineStore } from 'pinia'
import type { TimelineEvent, CoreFocus, Dream, QuickNote } from '@/types/diary'

export const useDiaryStore = defineStore('diary', {
  state: () => ({
    timelineEvents: [] as TimelineEvent[],
    coreFocus: null as CoreFocus | null,
    dreams: [] as Dream[],
    quickNotes: [] as QuickNote[],
    presetTimePoints: [
      { time: '07:00', title: '起床' },
      { time: '08:00', title: '早餐' },
      { time: '12:00', title: '午餐' },
      { time: '18:00', title: '晚餐' },
      { time: '23:00', title: '就寝' },
    ]
  }),

  actions: {
    addTimelineEvent(event: TimelineEvent) {
      this.timelineEvents.push(event)
    },

    updateCoreFocus(focus: CoreFocus) {
      this.coreFocus = focus
    },

    addDream(dream: Dream) {
      this.dreams.push(dream)
    },

    updateDreamProgress(dreamId: string, progress: number) {
      const dream = this.dreams.find(d => d.id === dreamId)
      if (dream) {
        dream.progress = progress
      }
    },

    addQuickNote(note: QuickNote) {
      this.quickNotes.push(note)
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
      },
    ],
  },
}) 