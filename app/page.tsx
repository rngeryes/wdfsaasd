import CheckFootprint from '@/components/CheckFootprint'
import NavigationBar from '@/components/NavigationBar'
import HomeTab from '@/components/HomeTab'
import TasksTab from '@/components/TasksTab'
import TabContainer from '@/components/TabContainer'
import { TabProvider } from '@/contexts/TabContext'
import { BalanceProvider } from '@/contexts/BalanceContext'

export default function Home() {
  return (
    <BalanceProvider>
      <TabProvider>
        <main className="min-h-screen bg-[#0a0a0a] text-white">
          <CheckFootprint />
          <TabContainer />
          <NavigationBar />
        </main>
      </TabProvider>
    </BalanceProvider>
  )
}