// components/NavigationBar.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useTab } from '@/contexts/TabContext'
import Earn from '@/icons/Earn'
import Friends from '@/icons/Friends'
import Home from '@/icons/Home'
import Game from '@/icons/Game'
import Leaderboard from '@/icons/Leaderboard'
import { TabType } from '@/utils/types'

const NavigationBar = () => {
    const { activeTab, setActiveTab } = useTab()

    const tabs: { id: TabType; label: string; Icon: React.FC<{ className?: string }> }[] = [
        { id: 'home', label: 'Главная', Icon: Home },
        { id: 'leaderboard', label: 'Вывод', Icon: Leaderboard },
        { id: 'friends', label: 'Друзья', Icon: Friends },
        { id: 'earn', label: 'Задания', Icon: Earn },
        { id: 'game', label: 'Игры', Icon: Game },
    ]

    return (
        <div className="flex justify-center w-full">
            <div className="fixed bottom-0 bg-[#0a0a0a] border-t border-gray-800 w-full max-w-md">
                <div className="flex justify-between px-8 py-5">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center`}
                            >
                                <tab.Icon
                                    className={`w-10 h-10 ${isActive ? 'text-[#3b82f6]' : 'text-[#727272]'
                                        }`}
                                />
                                <span
                                    className={`text-xs font-bold ${isActive ? 'text-[#3b82f6]' : 'text-[#727272]'
                                        }`}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default NavigationBar