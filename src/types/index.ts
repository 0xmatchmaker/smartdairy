export interface DiaryEntry {
  id: string
  content: string
  timestamp: Date
  tags?: string[]
}

export interface QuickNote {
  id: string
  content: string
  createdAt: Date
} 