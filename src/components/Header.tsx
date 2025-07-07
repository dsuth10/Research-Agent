import { Settings, Moon, Sun, Menu } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import Button from '@/components/Button'

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
}