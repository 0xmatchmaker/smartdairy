import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/services/db'
import { encryption } from '@/services/encryption'
import { IDBFactory } from 'fake-indexeddb'
import 'fake-indexeddb/auto'

describe('DiaryDatabase', () => {
  beforeEach(async () => {
    // 清理之前的数据库
    indexedDB = new IDBFactory()
    
    // 设置测试密钥
    const testKey = 'test-key'
    encryption.setKey(testKey)
    
    // 等待数据库初始化完成
    await db.init()
  })

  afterEach(async () => {
    // 清理测试数据
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('diary-db')
      request.onerror = () => resolve()
      request.onsuccess = () => resolve()
    })
  })

  it('should encrypt and decrypt data correctly', async () => {
    const testEntry = {
      id: '1',
      type: 'note',
      title: '测试笔记',
      content: '这是一条测试内容',
      timestamp: new Date().toISOString(),
      encrypted: true
    }

    await db.addDiaryEntry(testEntry)
    
    // 等待数据库操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const entries = await db.getDiaryEntries(testEntry.timestamp.split('T')[0])
    
    expect(entries).toHaveLength(1)
    expect(entries[0].content).toBe(testEntry.content)
  })

  it('should handle timeline events correctly', async () => {
    const testEvent = {
      id: '1',
      time: new Date().toISOString(),
      title: '测试事件',
      type: 'test',
      note: '测试备注',
      encrypted: false
    }

    await db.addTimelineEvent(testEvent)
    
    // 等待数据库操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const events = await db.getTimelineEvents(testEvent.time.split('T')[0])
    
    expect(events).toHaveLength(1)
    expect(events[0].note).toBe(testEvent.note)
  })

  it('should export and import data correctly', async () => {
    const testData = {
      id: '1',
      type: 'note',
      title: '测试笔记',
      content: '测试导出导入',
      timestamp: new Date().toISOString(),
      encrypted: false
    }

    await db.addDiaryEntry(testData)
    const exported = await db.exportData()
    
    // 清理数据库
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('diary-db')
      request.onerror = () => resolve()
      request.onsuccess = () => resolve()
    })
    
    // 重新初始化
    await db.init()
    
    // 导入数据
    await db.importData(exported)
    const entries = await db.getDiaryEntries(testData.timestamp.split('T')[0])
    
    expect(entries).toHaveLength(1)
    expect(entries[0].content).toBe(testData.content)
  })
}) 