import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  buildUrl,
  formatAmount,
  isBrowser,
  isNode,
  parseAmount,
  retry,
  sleep,
} from '../utils/index.js'

describe('buildUrl', () => {
  it('should build a simple url without params', () => {
    const url = buildUrl('https://api.example.com', '/users')
    expect(url).toBe('https://api.example.com/users')
  })

  it('should build a url with query params', () => {
    const url = buildUrl('https://api.example.com', '/users', {
      page: 1,
      limit: 10,
    })
    expect(url).toBe('https://api.example.com/users?page=1&limit=10')
  })

  it('should filter out undefined and null params', () => {
    const url = buildUrl('https://api.example.com', '/users', {
      page: 1,
      limit: undefined,
      filter: null,
    })
    expect(url).toBe('https://api.example.com/users?page=1')
  })

  it('should handle boolean params', () => {
    const url = buildUrl('https://api.example.com', '/users', {
      active: true,
      verified: false,
    })
    expect(url).toBe('https://api.example.com/users?active=true&verified=false')
  })

  it('should handle empty params object', () => {
    const url = buildUrl('https://api.example.com', '/users', {})
    expect(url).toBe('https://api.example.com/users')
  })
})

describe('formatAmount', () => {
  it('should format cents to currency string', () => {
    const result = formatAmount(1000)
    expect(result).toContain('10')
    expect(result).toContain('€')
  })

  it('should handle zero', () => {
    const result = formatAmount(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('should handle different currencies', () => {
    const result = formatAmount(1000, 'USD')
    expect(result).toContain('10')
    expect(result).toContain('$')
  })
})

describe('parseAmount', () => {
  it('should convert amount to cents', () => {
    expect(parseAmount(10.0)).toBe(1000)
    expect(parseAmount(10.5)).toBe(1050)
    expect(parseAmount(0.99)).toBe(99)
  })

  it('should handle integer amounts', () => {
    expect(parseAmount(10)).toBe(1000)
  })

  it('should handle zero', () => {
    expect(parseAmount(0)).toBe(0)
  })

  it('should round properly', () => {
    expect(parseAmount(10.999)).toBe(1100)
    expect(parseAmount(10.001)).toBe(1000)
  })
})

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should resolve after specified milliseconds', async () => {
    const promise = sleep(1000)
    vi.advanceTimersByTime(1000)
    await expect(promise).resolves.toBeUndefined()
  })
})

describe('retry', () => {
  it('should return result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and succeed', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('success')

    const result = await retry(fn, {
      maxRetries: 3,
      baseDelay: 10,
      shouldRetry: () => true,
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should throw after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'))

    await expect(
      retry(fn, {
        maxRetries: 2,
        baseDelay: 10,
        shouldRetry: () => true,
      })
    ).rejects.toThrow('always fail')

    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it('should not retry when shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('do not retry'))

    await expect(
      retry(fn, {
        maxRetries: 3,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('do not retry')

    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('isBrowser', () => {
  it('should return false in node environment', () => {
    expect(isBrowser()).toBe(false)
  })
})

describe('isNode', () => {
  it('should return true in node environment', () => {
    expect(isNode()).toBe(true)
  })
})
