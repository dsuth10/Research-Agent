import '@testing-library/jest-dom'

// Mock File System Access API for tests
global.showDirectoryPicker = vi.fn()
global.showSaveFilePicker = vi.fn()
global.showOpenFilePicker = vi.fn()

// Mock fetch for API calls
global.fetch = vi.fn()

// Setup for React Query
import { QueryClient } from '@tanstack/react-query'

// Create a new QueryClient instance for each test
beforeEach(() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
})