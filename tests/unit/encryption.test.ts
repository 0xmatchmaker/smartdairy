import { describe, it, expect } from 'vitest'
import { encryption } from '@/services/encryption'

describe('SimpleEncryption', () => {
  const testPassword = 'test123'

  it('should encrypt and decrypt text correctly', () => {
    const text = 'Hello World'
    const encrypted = encryption.encrypt(text, testPassword)
    expect(encrypted).not.toBe(text)
    const decrypted = encryption.decrypt(encrypted, testPassword)
    expect(decrypted).toBe(text)
  })

  it('should handle empty text', () => {
    const text = ''
    const encrypted = encryption.encrypt(text, testPassword)
    const decrypted = encryption.decrypt(encrypted, testPassword)
    expect(decrypted).toBe(text)
  })

  it('should return error message for invalid encrypted data', () => {
    const result = encryption.decrypt('invalid-data', testPassword)
    expect(result).toBe('[解密失败]')
  })
}) 