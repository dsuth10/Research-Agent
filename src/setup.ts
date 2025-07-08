import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Helper to get the global object in any environment
const globalObj: any = typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
    ? global
    : globalThis;

// Mock File System Access API for tests
globalObj.showDirectoryPicker = vi.fn();
globalObj.showSaveFilePicker = vi.fn();
globalObj.showOpenFilePicker = vi.fn();

// Mock fetch for API calls
globalObj.fetch = vi.fn();

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