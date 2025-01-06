import { describe, it, expect } from 'vitest'
import { api } from '@/services/api'

describe('ApiService', () => {
  it('should handle errors correctly', async () => {
    await expect(api.fetchData()).rejects.toThrow()
  })
}) 