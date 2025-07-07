# Create directories first, then files
import os

# Create necessary directories
directories = ["tests", "src", "src/components", "src/lib", "src/modules", "public"]
for directory in directories:
    os.makedirs(directory, exist_ok=True)

# Test setup file
test_setup = '''import '@testing-library/jest-dom'

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
})'''

# Now create the test setup file
with open("tests/setup.ts", "w") as f:
    f.write(test_setup)

print("DIRECTORIES AND TEST SETUP CREATED")
print("=" * 50)
print("✓ tests/setup.ts")
print("✓ Directory structure created")
print("\nAll configuration files are now ready!")