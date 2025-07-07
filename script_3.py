# Create Vite configuration with testing setup
vite_config = '''/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // https://vitest.dev/guide/browser/
      headless: true,
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          ui: ['lucide-react'],
        },
      },
    },
  },
})'''

# TypeScript configuration
tsconfig = '''{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "tests", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}'''

# TypeScript Node configuration
tsconfig_node = '''{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}'''

# Tailwind configuration
tailwind_config = '''/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}'''

# Environment variable example
env_example = '''# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Notion Integration
VITE_NOTION_TOKEN=your_notion_integration_token_here
VITE_NOTION_DATABASE_ID=your_research_database_id_here

# Application Settings
VITE_APP_NAME=Research Wrapper
VITE_DEFAULT_EXPORT_FOLDER=ResearchExports'''

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

# Save all configuration files
files_to_create = {
    "vite.config.ts": vite_config,
    "tsconfig.json": tsconfig,
    "tsconfig.node.json": tsconfig_node,
    "tailwind.config.js": tailwind_config,
    ".env.example": env_example,
    "tests/setup.ts": test_setup
}

for filename, content in files_to_create.items():
    with open(filename, "w") as f:
        f.write(content)

print("CONFIGURATION FILES CREATED")
print("=" * 50)
for filename in files_to_create.keys():
    print(f"✓ {filename}")

print("\nKEY FEATURES:")
print("• Vite with React + TypeScript")
print("• Vitest with browser mode for real browser testing")
print("• Tailwind CSS with custom design system")
print("• Path aliases (@/* for src/*)")
print("• Environment variables with VITE_ prefix")
print("• Strict TypeScript configuration")
print("• Modern ES2020+ target")
print("• Source maps for debugging")
print("• Code splitting for performance")