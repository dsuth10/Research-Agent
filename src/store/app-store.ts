import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Research, PromptConfig } from '@/types/types'

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
    currentTab: 'prompt' | 'research' | 'results' | 'history' | 'settings'
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
          openaiApiKey: (import.meta as any).env.VITE_OPENAI_API_KEY || '',
          defaultExportPath: 'ResearchExports',
          notionToken: (import.meta as any).env.VITE_NOTION_TOKEN,
          notionDatabaseId: (import.meta as any).env.VITE_NOTION_DATABASE_ID,
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
)