import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { aiService } from '@/services/ai-service'
import Layout from '@/components/Layout'
import PromptBuilder from '@/modules/PromptBuilder'
import AgentRunner from '@/modules/AgentRunner'
import ResultsViewer from '@/modules/ResultsViewer'
import TaskLog from '@/modules/TaskLog'
import Settings from '@/modules/Settings'

export default function App() {
  const { ui, settings } = useAppStore()

  // Initialize AI service based on provider
  useEffect(() => {
    if (settings.apiProvider === 'openrouter') {
      if (settings.openrouterApiKey) {
        aiService.setConfig({
          apiKey: settings.openrouterApiKey,
          baseUrl: 'https://openrouter.ai/api/v1',
          headers: {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Research Agent',
          },
        })
      }
    } else if (settings.openaiApiKey) {
      aiService.setConfig({ apiKey: settings.openaiApiKey })
    }
  }, [settings])

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
        return <TaskLog />
      case 'settings':
        return <Settings />
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