import { useAppStore } from '@/store/app-store'


export default function Sidebar() {
  const { ui, setUI, researchHistory } = useAppStore()
  const steps = [
    { id: 'prompt', label: 'Prompt Builder' },
    { id: 'research', label: 'Run Research' },
    { id: 'results', label: 'Results' },
    { id: 'history', label: 'History' },
  ]
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-56 bg-card text-card-foreground p-4 space-y-4">
      <nav className="space-y-4">
        {steps.map((step) => {
          const isActive = ui.currentTab === step.id
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 cursor-pointer ${isActive ? 'font-bold' : 'opacity-75'}`}
              onClick={() => setUI({ currentTab: step.id as typeof ui.currentTab })}
            >
              <span className={`h-3 w-3 rounded-full ${isActive ? 'bg-primary' : 'bg-accent'}`} />
              {step.label}
              {step.id === 'history' && researchHistory.length > 0 && (
                <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {researchHistory.length}
                </span>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}