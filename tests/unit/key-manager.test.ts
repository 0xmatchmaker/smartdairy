import { describe, it, expect, beforeEach } from 'vitest'
import { keyManager } from '@/services/key-manager'

describe('KeyManager', () => {
  beforeEach(() => {
    keyManager.clear()
    localStorage.clear()
  })

  it('should manage password correctly', () => {
    expect(keyManager.hasPassword()).toBe(false)
    const testPassword = 'test123'
    keyManager.setPassword(testPassword)
    expect(keyManager.hasPassword()).toBe(true)
    expect(keyManager.getPassword()).toBe(testPassword)
    expect(localStorage.getItem('diary-password')).toBe(testPassword)
  })

  it('should clear password', () => {
    keyManager.setPassword('test123')
    keyManager.clear()
    expect(keyManager.hasPassword()).toBe(false)
    expect(keyManager.getPassword()).toBeNull()
    expect(localStorage.getItem('diary-password')).toBeNull()
  })
}) 