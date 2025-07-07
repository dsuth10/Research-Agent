import React, { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { openaiService } from '@/services/openai-service'
import Layout from '@/components/Layout'
import PromptBuilder from '@/modules/PromptBuilder'
import AgentRunner from '@/modules/AgentRunner'
import ResultsViewer from '@/modules/ResultsViewer'
import TaskLog from '@/modules/TaskLog'
import Settings from '@/modules/Settings'

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

export default App