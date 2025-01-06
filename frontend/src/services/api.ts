import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VITE_API_URL
})

export const diaryApi = {
  getDreams: () => api.get('/api/diary/dreams'),
  updateProgress: (id: string, seconds: number) => 
    api.put(`/api/diary/dreams/${id}/progress`, { seconds }),
  addEntry: (entry: any) => 
    api.post('/api/diary/entries', entry)
} 