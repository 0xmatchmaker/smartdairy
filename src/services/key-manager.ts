// 负责密钥的管理和存储
class KeyManager {
  private static readonly STORAGE_KEY = 'diary-password'
  private currentPassword: string | null = null

  hasPassword(): boolean {
    return Boolean(this.currentPassword || localStorage.getItem(KeyManager.STORAGE_KEY))
  }

  setPassword(password: string): void {
    this.currentPassword = password
    localStorage.setItem(KeyManager.STORAGE_KEY, password)
  }

  getPassword(): string | null {
    if (!this.currentPassword) {
      this.currentPassword = localStorage.getItem(KeyManager.STORAGE_KEY)
    }
    return this.currentPassword
  }

  clear(): void {
    this.currentPassword = null
    localStorage.removeItem(KeyManager.STORAGE_KEY)
  }
}

export const keyManager = new KeyManager() 