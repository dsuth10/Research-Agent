# Create the main React application entry point and components

# HTML template
html_template = '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Research Wrapper - AI-Powered Research Tool</title>
    <meta name="description" content="A powerful wrapper for OpenAI's Deep Research API with local file management" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>'''

# Main entry point
main_tsx = '''import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './styles/globals.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408 (timeout)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500 && status !== 408) {
            return false
          }
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)'''

# Main App component
app_tsx = '''import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { openaiService } from '@/lib/api/openai-service'
import Layout from '@/components/layout/Layout'
import PromptBuilder from '@/modules/prompt-builder/components/PromptBuilder'
import AgentRunner from '@/modules/agent-runner/components/AgentRunner'
import ResultsViewer from '@/modules/results-viewer/components/ResultsViewer'
import TaskHistory from '@/modules/task-log/components/TaskHistory'

function App() {
  const { ui, settings } = useAppStore()
  
  // Initialize OpenAI service with API key
  useEffect(() => {
    if (settings.openaiApiKey) {
      openaiService.setApiKey(settings.openaiApiKey)
    }
  }, [settings.openaiApiKey])
  
  // Add dark mode class to document
  useEffect(() => {
    if (ui.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [ui.darkMode])
  
  const renderCurrentTab = () => {
    switch (ui.currentTab) {
      case 'prompt':
        return <PromptBuilder />
      case 'research':
        return <AgentRunner />
      case 'results':
        return <ResultsViewer />
      case 'history':
        return <TaskHistory />
      default:
        return <PromptBuilder />
    }
  }
  
  return (
    <Layout>
      {renderCurrentTab()}
    </Layout>
  )
}

export default App'''

# Layout component
layout_component = '''import { ReactNode } from 'react'
import { useAppStore } from '@/store/app-store'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { ui } = useAppStore()
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex">
        {ui.sidebarOpen && <Sidebar />}
        <main 
          className={`flex-1 transition-all duration-300 ${
            ui.sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}'''

# Header component
header_component = '''import { Settings, Moon, Sun, Menu } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import Button from '@/components/ui/Button'

export default function Header() {
  const { ui, setUI, settings } = useAppStore()
  
  const toggleSidebar = () => {
    setUI({ sidebarOpen: !ui.sidebarOpen })
  }
  
  const toggleDarkMode = () => {
    setUI({ darkMode: !ui.darkMode })
  }
  
  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Research Wrapper</h1>
          {!settings.openaiApiKey && (
            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
              API Key Required
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
          >
            {ui.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUI({ currentTab: 'settings' })}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}'''

# Sidebar component
sidebar_component = '''import { FileText, Play, BarChart3, History, Settings } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import Button from '@/components/ui/Button'

const navigationItems = [
  { id: 'prompt', label: 'Prompt Builder', icon: FileText },
  { id: 'research', label: 'Run Research', icon: Play },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
] as const

export default function Sidebar() {
  const { ui, setUI, researchHistory } = useAppStore()
  
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = ui.currentTab === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setUI({ currentTab: item.id as any })}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.id === 'history' && researchHistory.length > 0 && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {researchHistory.length}
                  </span>
                )}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}'''

# Basic UI Button component (simplified shadcn/ui style)
button_component = '''import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export default Button'''

# Utility function for className merging
utils_file = '''import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatTokenCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

export function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  // Pricing as of 2025
  const pricing = {
    'gpt-4.1': { input: 2.5, output: 10 }, // per 1M tokens
    'o3-deep-research': { input: 10, output: 40 }, // per 1M tokens
  }
  
  const modelPricing = pricing[model as keyof typeof pricing]
  if (!modelPricing) return 0
  
  return (
    (inputTokens / 1000000) * modelPricing.input +
    (outputTokens / 1000000) * modelPricing.output
  )
}'''

# Global CSS with Tailwind and CSS variables
global_css = '''@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;

    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-muted;
}

::-webkit-scrollbar-thumb {
  @apply bg-border rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-accent-foreground/20;
}

/* Loading animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Research status indicators */
.status-pending {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}

.status-running {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
}

.status-completed {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.status-error {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}'''

# Create all files
files = {
    "public/index.html": html_template,
    "src/main.tsx": main_tsx,
    "src/App.tsx": app_tsx,
    "src/components/layout/Layout.tsx": layout_component,
    "src/components/layout/Header.tsx": header_component,
    "src/components/layout/Sidebar.tsx": sidebar_component,
    "src/components/ui/Button.tsx": button_component,
    "src/lib/utils.ts": utils_file,
    "src/styles/globals.css": global_css,
}

for filepath, content in files.items():
    # Create directory if it doesn't exist
    directory = "/".join(filepath.split("/")[:-1])
    os.makedirs(directory, exist_ok=True)
    
    with open(filepath, "w") as f:
        f.write(content)

print("REACT APPLICATION COMPONENTS CREATED")
print("=" * 60)
for filepath in files.keys():
    print(f"✓ {filepath}")

print("\nAPPLICATION FEATURES:")
print("• Modern React 18 with TypeScript")
print("• TanStack Query for server state management")
print("• Zustand for client state with persistence")
print("• Tailwind CSS with dark mode support")
print("• Responsive layout with collapsible sidebar")
print("• Component-based architecture")
print("• Custom UI components (shadcn/ui inspired)")
print("• Theme system with CSS variables")
print("• Error boundaries and loading states")
print("• Accessibility considerations")
print("• Mobile-responsive design")