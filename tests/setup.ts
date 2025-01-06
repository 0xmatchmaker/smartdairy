import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom'

// 全局测试设置
beforeAll(() => {
  // 设置测试环境
})

afterAll(() => {
  // 清理测试环境
})

afterEach(() => {
  cleanup() // 清理测试渲染
}) 