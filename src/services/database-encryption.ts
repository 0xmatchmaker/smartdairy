import { encryption } from './encryption'
import { keyManager } from './key-manager'

export interface EncryptableData {
  encrypted?: boolean
  [key: string]: any
}

class DatabaseEncryption {
  private encryptableFields = ['content', 'title', 'note']

  initialize(): void {
    // 尝试加载已保存的密钥
    if (!keyManager.getKey()) {
      keyManager.loadSavedKey()
    }
  }

  encryptData<T extends EncryptableData>(data: T): T {
    if (!data.encrypted) {
      const encryptedData = { ...data }
      
      this.encryptableFields.forEach(field => {
        if (field in data && data[field]) {
          encryptedData[field] = encryption.encrypt(data[field])
        }
      })
      
      encryptedData.encrypted = true
      return encryptedData
    }
    return data
  }

  decryptData<T extends EncryptableData>(data: T): T {
    if (data.encrypted) {
      const decryptedData = { ...data }
      
      this.encryptableFields.forEach(field => {
        if (field in data && data[field]) {
          try {
            decryptedData[field] = encryption.decrypt(data[field])
          } catch (error) {
            console.error(`Failed to decrypt field: ${field}`, error)
            decryptedData[field] = `[Decryption Failed]`
          }
        }
      })
      
      decryptedData.encrypted = false
      return decryptedData
    }
    return data
  }

  isEncrypted(data: EncryptableData): boolean {
    return Boolean(data.encrypted)
  }

  hasEncryptionKey(): boolean {
    return keyManager.getKey() !== null
  }

  setEncryptionKey(key: string): void {
    keyManager.saveKey(key)
  }
}

export const dbEncryption = new DatabaseEncryption() 