import axios from 'axios'
import type { DiaryEntry, QuickNote } from '@/types'

interface ApiConfig {
  baseUrl: string
  apiKey?: string  // 可选的 API 密钥，用于简单验证
}

class ApiService {
  private config: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  }

  // 设置配置
  setConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config }
  }

  // 获取数据
  async fetchData(since?: string) {
    const url = `${this.config.baseUrl}/diary-data${since ? `?since=${since}` : ''}`
    const response = await fetch(url, {
      headers: this.getHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    
    return response.json()
  }

  // 保存数据
  async saveData(data: any) {
    const response = await fetch(`${this.config.baseUrl}/diary-data`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to save data')
    }
    
    return response.json()
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey
    }
    
    return headers
  }
}

export const api = new ApiService() 