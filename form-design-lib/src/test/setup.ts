import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock console methods to avoid noise in tests
if (typeof globalThis !== 'undefined') {
  (globalThis as any).console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}
