import { Settings, Moon, Sun, Menu } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import Button from '@/components/Button'

export default function Header() {
  const { ui, setUI } = useAppStore()

  const toggleSidebar = () => {
    setUI({ sidebarOpen: !ui.sidebarOpen })
  }

  const toggleDarkMode = () => {
    setUI({ darkMode: !ui.darkMode })
  }

  return (
    <header className="sticky top-0 z-10 bg-background text-foreground border-b border-border">
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
          <h1 className="text-xl font-semibold">Research Wrapper</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="lg"
            className="font-bold"
            // TODO: Connect to research run logic
          >
            Run ▶
          </Button>
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