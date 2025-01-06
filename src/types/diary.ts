export interface TimelineEvent {
  id: string;
  time: string;
  type: 'preset' | 'custom';
  title: string;
  note?: string;
}

export interface CoreFocus {
  date: string;
  changes: string;
  expectedFromOthers: string;
  personalExpectations: string;
  importantMatters: string;
}

export interface Dream {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface QuickNote {
  id: string;
  content: string;
  type: 'voice' | 'text' | 'template';
  tags: string[];
  createdAt: string;
} 