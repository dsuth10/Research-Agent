# Create the main application files with modern React patterns

# Global TypeScript types
global_types = '''// Global types for the application
export interface Research {
  id: string
  title: string
  prompt: string
  status: 'pending' | 'running' | 'completed' | 'error'
  createdAt: string
  completedAt?: string
  result?: ResearchResult
  cost?: {
    inputTokens: number
    outputTokens: number
    totalCost: number
  }
}

export interface ResearchResult {
  report: string
  thoughtProcess: string
  sources: Source[]
  reasoning?: {
    effort: string
    summary: string
  }
}

export interface Source {
  id: string
  title: string
  url: string
  snippet: string
  citedAt: string
}

export interface PromptConfig {
  goal: string
  scope: string
  constraints: string
  depth: 'low' | 'medium' | 'high'
  model: 'gpt-4.1' | 'o3-deep-research'
  maxTokens?: number
}

export interface ExportOptions {
  format: 'markdown' | 'docx' | 'pdf'
  includeThoughtProcess: boolean
  includeSources: boolean
  template?: string
}

export interface FileSystemHandle {
  kind: 'file' | 'directory'
  name: string
}

// OpenAI API types
export interface OpenAIResponse {
  id: string
  object: string
  created_at: number
  status: 'completed' | 'running' | 'failed'
  model: string
  output: Array<{
    type: 'message'
    id: string
    status: 'completed'
    role: 'assistant'
    content: Array<{
      type: 'output_text'
      text: string
    }>
  }>
  usage: {
    input_tokens: number
    output_tokens: number
    reasoning_tokens: number
    total_tokens: number
  }
}'''

# Zustand store for application state
zustand_store = '''import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Research, PromptConfig } from '@/lib/types'

interface AppState {
  // Current research session
  currentResearch: Research | null
  setCurrentResearch: (research: Research | null) => void
  
  // Research history
  researchHistory: Research[]
  addResearch: (research: Research) => void
  updateResearch: (id: string, updates: Partial<Research>) => void
  deleteResearch: (id: string) => void
  
  // Application settings
  settings: {
    openaiApiKey: string
    defaultExportPath: string
    notionToken?: string
    notionDatabaseId?: string
  }
  updateSettings: (settings: Partial<AppState['settings']>) => void
  
  // UI state
  ui: {
    sidebarOpen: boolean
    currentTab: 'prompt' | 'research' | 'results' | 'history'
    darkMode: boolean
  }
  setUI: (ui: Partial<AppState['ui']>) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentResearch: null,
        researchHistory: [],
        settings: {
          openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
          defaultExportPath: 'ResearchExports',
          notionToken: import.meta.env.VITE_NOTION_TOKEN,
          notionDatabaseId: import.meta.env.VITE_NOTION_DATABASE_ID,
        },
        ui: {
          sidebarOpen: true,
          currentTab: 'prompt',
          darkMode: false,
        },
        
        // Actions
        setCurrentResearch: (research) => 
          set({ currentResearch: research }, false, 'setCurrentResearch'),
        
        addResearch: (research) =>
          set(
            (state) => ({
              researchHistory: [research, ...state.researchHistory],
            }),
            false,
            'addResearch'
          ),
        
        updateResearch: (id, updates) =>
          set(
            (state) => ({
              researchHistory: state.researchHistory.map((r) =>
                r.id === id ? { ...r, ...updates } : r
              ),
              currentResearch:
                state.currentResearch?.id === id
                  ? { ...state.currentResearch, ...updates }
                  : state.currentResearch,
            }),
            false,
            'updateResearch'
          ),
        
        deleteResearch: (id) =>
          set(
            (state) => ({
              researchHistory: state.researchHistory.filter((r) => r.id !== id),
              currentResearch:
                state.currentResearch?.id === id ? null : state.currentResearch,
            }),
            false,
            'deleteResearch'
          ),
        
        updateSettings: (newSettings) =>
          set(
            (state) => ({
              settings: { ...state.settings, ...newSettings },
            }),
            false,
            'updateSettings'
          ),
        
        setUI: (newUI) =>
          set(
            (state) => ({
              ui: { ...state.ui, ...newUI },
            }),
            false,
            'setUI'
          ),
      }),
      {
        name: 'research-wrapper-storage',
        partialize: (state) => ({
          researchHistory: state.researchHistory,
          settings: state.settings,
          ui: state.ui,
        }),
      }
    ),
    {
      name: 'research-wrapper',
    }
  )
)'''

# OpenAI API service
openai_service = '''import OpenAI from 'openai'
import type { OpenAIResponse, PromptConfig } from '@/lib/types'

class OpenAIService {
  private client: OpenAI | null = null
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Required for client-side usage
      })
    }
  }
  
  setApiKey(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  }
  
  async generatePrompt(config: PromptConfig): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }
    
    const promptEnhancementPrompt = `You are a research prompt specialist. Create a high-quality, detailed research prompt based on the following requirements:

Goal: ${config.goal}
Scope: ${config.scope}
Constraints: ${config.constraints}
Depth Level: ${config.depth}

Create a clear, specific prompt that will guide a research AI to produce comprehensive, well-cited results. The prompt should be concise but information-rich, following best practices for AI research tasks.

Return only the optimized research prompt, nothing else.`
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content: promptEnhancementPrompt,
        },
      ],
      max_tokens: config.maxTokens || 500,
      temperature: 0.3,
    })
    
    return response.choices[0]?.message?.content || config.goal
  }
  
  async runDeepResearch(prompt: string): Promise<{
    responseId: string
    stream: ReadableStream<string>
  }> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }
    
    // Create research task
    const response = await this.client.responses.create({
      model: 'o3-deep-research-2025-06-26',
      input: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      background: true, // Run in background for long tasks
    })
    
    const responseId = response.id
    
    // Create a stream for progress updates
    const stream = new ReadableStream<string>({
      async start(controller) {
        // Poll for updates
        const pollForUpdates = async () => {
          try {
            const status = await this.client!.responses.retrieve(responseId)
            
            if (status.status === 'completed') {
              controller.enqueue(JSON.stringify(status))
              controller.close()
              return
            }
            
            if (status.status === 'failed') {
              controller.error(new Error('Research failed'))
              return
            }
            
            // Send progress update
            controller.enqueue(JSON.stringify({ status: 'running', id: responseId }))
            
            // Continue polling
            setTimeout(pollForUpdates, 2000)
          } catch (error) {
            controller.error(error)
          }
        }
        
        pollForUpdates()
      },
    })
    
    return { responseId, stream }
  }
  
  async getResearchResult(responseId: string): Promise<OpenAIResponse> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }
    
    return await this.client.responses.retrieve(responseId)
  }
}

export const openaiService = new OpenAI Service()
export default OpenAIService'''

# File system utilities using the modern File System Access API
file_system_utils = '''import { fileOpen, fileSave, directoryOpen, supported } from 'browser-fs-access'
import type { FileSystemHandle } from '@/lib/types'

export class FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null
  
  async selectExportDirectory(): Promise<void> {
    if (!supported) {
      throw new Error('File System Access API not supported')
    }
    
    try {
      this.directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      })
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Directory selection cancelled')
      }
      throw error
    }
  }
  
  async saveFile(
    filename: string,
    content: string | Blob,
    mimeType: string = 'text/plain'
  ): Promise<void> {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
    
    try {
      await fileSave(blob, {
        fileName: filename,
        extensions: [this.getExtension(filename)],
      })
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Save cancelled')
      }
      throw error
    }
  }
  
  async saveToDirectory(
    filename: string,
    content: string | Blob,
    subdirectory?: string
  ): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected')
    }
    
    let targetDir = this.directoryHandle
    
    // Create subdirectory if specified
    if (subdirectory) {
      targetDir = await this.directoryHandle.getDirectoryHandle(subdirectory, {
        create: true,
      })
    }
    
    // Create file handle
    const fileHandle = await targetDir.getFileHandle(filename, { create: true })
    const writable = await fileHandle.createWritable()
    
    const blob = content instanceof Blob ? content : new Blob([content])
    await writable.write(blob)
    await writable.close()
  }
  
  async loadFile(): Promise<{ content: string; filename: string }> {
    const file = await fileOpen({
      mimeTypes: ['text/*', 'application/json'],
    })
    
    const content = await file.text()
    return { content, filename: file.name }
  }
  
  async createResearchFolder(researchTitle: string): Promise<string> {
    if (!this.directoryHandle) {
      await this.selectExportDirectory()
    }
    
    const sanitizedTitle = this.sanitizeFilename(researchTitle)
    const timestamp = new Date().toISOString().split('T')[0]
    const folderName = `${timestamp}_${sanitizedTitle}`
    
    await this.directoryHandle!.getDirectoryHandle(folderName, { create: true })
    return folderName
  }
  
  private getExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? `.${parts.pop()}` : ''
  }
  
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50)
  }
  
  get hasDirectory(): boolean {
    return this.directoryHandle !== null
  }
  
  get directoryName(): string {
    return this.directoryHandle?.name || 'No directory selected'
  }
}

export const fileSystemService = new FileSystemService()'''

# Create files
files = {
    "src/lib/types.ts": global_types,
    "src/store/app-store.ts": zustand_store,
    "src/lib/api/openai-service.ts": openai_service,
    "src/lib/storage/file-system.ts": file_system_utils,
}

for filepath, content in files.items():
    # Create directory if it doesn't exist
    directory = "/".join(filepath.split("/")[:-1])
    os.makedirs(directory, exist_ok=True)
    
    with open(filepath, "w") as f:
        f.write(content)

print("CORE APPLICATION FILES CREATED")
print("=" * 50)
for filepath in files.keys():
    print(f"✓ {filepath}")

print("\nKEY FEATURES IMPLEMENTED:")
print("• TypeScript interfaces for all data types")
print("• Zustand store with persistence and devtools")
print("• OpenAI service with streaming support")
print("• File System Access API with fallbacks")
print("• Modern ES modules and async/await patterns")
print("• Error handling and user feedback")
print("• Background processing for long research tasks")
print("• Local storage for research history")