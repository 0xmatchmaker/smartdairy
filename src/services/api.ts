import axios from 'axios'
import type { DiaryEntry, QuickNote } from '@/types'

export const diaryApi = {
  async getDiaryEntries(): Promise<DiaryEntry[]> {
    // API 实现
  },
  async createDiaryEntry(entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
    // API 实现
  }
} 