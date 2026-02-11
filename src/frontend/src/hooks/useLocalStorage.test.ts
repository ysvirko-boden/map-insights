import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  const TEST_KEY = 'test-key'
  const TEST_VALUE = { name: 'John', age: 30 }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, TEST_VALUE))
    expect(result.current[0]).toEqual(TEST_VALUE)
  })

  it('returns stored value from localStorage', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify(TEST_VALUE))

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, { name: '', age: 0 }))
    expect(result.current[0]).toEqual(TEST_VALUE)
  })

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, TEST_VALUE))

    const newValue = { name: 'Jane', age: 25 }
    act(() => {
      result.current[1](newValue)
    })

    expect(localStorage.getItem(TEST_KEY)).toEqual(JSON.stringify(newValue))
    expect(result.current[0]).toEqual(newValue)
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, { count: 0 }))

    act(() => {
      result.current[1](prev => ({ count: prev.count + 1 }))
    })

    expect(result.current[0]).toEqual({ count: 1 })
  })

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorage.setItem(TEST_KEY, 'invalid json')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, TEST_VALUE))

    expect(result.current[0]).toEqual(TEST_VALUE)
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('syncs with storage events from other tabs', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, TEST_VALUE))

    const newValue = { name: 'Alice', age: 35 }
    const storageEvent = new StorageEvent('storage', {
      key: TEST_KEY,
      newValue: JSON.stringify(newValue),
    })

    act(() => {
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toEqual(newValue)
  })

  it('ignores storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, TEST_VALUE))

    const storageEvent = new StorageEvent('storage', {
      key: 'different-key',
      newValue: JSON.stringify({ name: 'Bob', age: 40 }),
    })

    act(() => {
      window.dispatchEvent(storageEvent)
    })

    expect(result.current[0]).toEqual(TEST_VALUE)
  })
})
