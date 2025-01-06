import { describe, it, expect, beforeEach } from 'vitest'
import { dbEncryption } from '@/services/database-encryption'
import { keyManager } from '@/services/key-manager'

describe('DatabaseEncryption', () => {
  const testKey = 'test-encryption-key'
  
  beforeEach(() => {
    keyManager.clear()
    localStorage.clear()
    keyManager.setKey(testKey)
  })

  it('should encrypt and decrypt diary entry', () => {
    const entry = {
      id: '1',
      title: 'Test Title',
      content: 'Test Content',
      timestamp: '2023-01-01',
      encrypted: false
    }

    const encrypted = dbEncryption.encryptData(entry)
    expect(encrypted.encrypted).toBe(true)
    expect(encrypted.title).not.toBe(entry.title)
    expect(encrypted.content).not.toBe(entry.content)
    expect(encrypted.timestamp).toBe(entry.timestamp) // 不加密时间戳

    const decrypted = dbEncryption.decryptData(encrypted)
    expect(decrypted.encrypted).toBe(false)
    expect(decrypted.title).toBe(entry.title)
    expect(decrypted.content).toBe(entry.content)
    expect(decrypted.timestamp).toBe(entry.timestamp)
  })

  it('should handle missing encryption key', () => {
    keyManager.clear()
    
    const entry = {
      id: '1',
      content: 'Test Content',
      encrypted: false
    }

    expect(() => dbEncryption.encryptData(entry)).toThrow('No encryption key available')
  })

  it('should skip already encrypted data', () => {
    const encrypted = {
      id: '1',
      content: 'already-encrypted-content',
      encrypted: true
    }

    const result = dbEncryption.encryptData(encrypted)
    expect(result).toEqual(encrypted)
  })

  it('should skip already decrypted data', () => {
    const decrypted = {
      id: '1',
      content: 'plain-content',
      encrypted: false
    }

    const result = dbEncryption.decryptData(decrypted)
    expect(result).toEqual(decrypted)
  })

  it('should handle partial encryption fields', () => {
    const entry = {
      id: '1',
      title: 'Test Title',
      timestamp: '2023-01-01',
      encrypted: false
    }

    const encrypted = dbEncryption.encryptData(entry)
    expect(encrypted.encrypted).toBe(true)
    expect(encrypted.title).not.toBe(entry.title)
    expect(encrypted.timestamp).toBe(entry.timestamp)
  })
}) 