import { ReactNode } from 'react'
import { useAppStore } from '@/store/app-store'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

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
            ui.sidebarOpen ? 'ml-56' : 'ml-0'
          }`}
        >
          <div className="p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}