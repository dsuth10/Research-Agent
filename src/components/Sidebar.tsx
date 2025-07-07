import { FileText, Play, BarChart3, History, Settings } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import Button from '@/components/Button'

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
}