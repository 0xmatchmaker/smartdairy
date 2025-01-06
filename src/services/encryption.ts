import CryptoJS from 'crypto-js'
import { keyManager } from './key-manager'

class SimpleEncryption {
  encrypt(text: string, password: string): string {
    // 简单的加密：Base64 + 密码混淆
    const base64 = btoa(text)
    return base64.split('').map((char, i) => {
      return String.fromCharCode(char.charCodeAt(0) ^ password.charCodeAt(i % password.length))
    }).join('')
  }

  decrypt(encrypted: string, password: string): string {
    // 简单的解密
    try {
      const unmixed = encrypted.split('').map((char, i) => {
        return String.fromCharCode(char.charCodeAt(0) ^ password.charCodeAt(i % password.length))
      }).join('')
      return atob(unmixed)
    } catch (e) {
      return '[解密失败]'
    }
  }
}

export const encryption = new SimpleEncryption() 