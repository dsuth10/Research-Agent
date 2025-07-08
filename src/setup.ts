import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock File System Access API for tests
;(global as any).showDirectoryPicker = vi.fn()
;(global as any).showSaveFilePicker = vi.fn()
;(global as any).showOpenFilePicker = vi.fn()

// Mock fetch for API calls
;(global as any).fetch = vi.fn()

// Setup for React Query
import { QueryClient } from '@tanstack/react-query'

// Create a new QueryClient instance for each test
beforeEach(() => {
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
})