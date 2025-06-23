// components/TasksTab.tsx
'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import { useBalance } from '@/contexts/BalanceContext'

type Task = {
    id?: string;
    icon: string;
    title: string;
    reward: string;
    rewardAmount: number;
    link: string;
    completed?: boolean;
    type: 'in-game' | 'partners';
}

const TasksTab = () => {
    const [activeTab, setActiveTab] = useState<'in-game' | 'partners'>('in-game')
    const [tasks, setTasks] = useState<Task[]>([])
    const [partnerTasks, setPartnerTasks] = useState<Task[]>([])
    const [clickCount, setClickCount] = useState(0)
    const [showAdminPanel, setShowAdminPanel] = useState(false)
    const [newTask, setNewTask] = useState<Omit<Task, 'completed' | 'id'>>({ 
        icon: '/task.png',
        title: '',
        reward: '',
        rewardAmount: 0,
        link: '',
        type: 'in-game'
    })
    const [isLoading, setIsLoading] = useState(true)
    
    // Получаем функцию addBalance из контекста
    const { addBalance } = useBalance()

    // Загрузка заданий с сервера и из localStorage
    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/tasks')
            const data = await response.json()
            
            // Получаем выполненные задания из localStorage
            const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '{}')
            
            const processedTasks = data.map((task: Task) => ({
                ...task,
                completed: completedTasks[task.id || ''] || false
            }))
            
            setTasks(processedTasks.filter((task: Task) => task.type === 'in-game'))
            setPartnerTasks(processedTasks.filter((task: Task) => task.type === 'partners'))
        } catch (error) {
            console.error('Error fetching tasks:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const handleTaskStart = (task: Task, isPartnerTask: boolean) => {
        if (task.completed) return
        
        window.open(task.link, '_blank')
        
        // Обновляем состояние выполненных заданий
        const updatedTasks = (isPartnerTask ? partnerTasks : tasks).map(t => 
            t.id === task.id ? {...t, completed: true} : t
        )
        
        if (isPartnerTask) {
            setPartnerTasks(updatedTasks)
        } else {
            setTasks(updatedTasks)
        }
        
        // Сохраняем в localStorage
        const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '{}')
        completedTasks[task.id || ''] = true
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks))
        
        // Начисляем звезды через контекст
        addBalance(task.rewardAmount)
        
        console.log(`Начислено ${task.rewardAmount} звезд за задание "${task.title}"`)
        alert(`Задание "${task.title}" выполнено! Начислено ${task.rewardAmount} звезд.`)
    }


    // Остальной код остается без изменений...
    const handleAdminClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        
        if (newCount >= 9) {
            setShowAdminPanel(true);
            setClickCount(0);
        }
    };

    const handleAddTask = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            });
            
            if (response.ok) {
                await fetchTasks();
                setNewTask({ 
                    icon: '/task.png',
                    title: '',
                    reward: '',
                    rewardAmount: 0,
                    link: '',
                    type: 'in-game'
                });
                alert('Задание успешно добавлено!');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Ошибка при добавлении задания');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                await fetchTasks();
                alert('Задание успешно удалено!');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Ошибка при удалении задания');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className={`quests-tab-con px-4 transition-all duration-300`}>
            {/* Dart GIF at the top */}
            <div className="flex justify-center pt-4">
                <Player
                    src="/darts.json"
                    autoplay
                    loop
                    style={{ width: 200, height: 200 }}
                />
            </div>

            {/* Updated Header */}
            <div className="pt-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Задания</h1>
                <div 
                    className="text-l text-gray-500 cursor-pointer"
                    onClick={handleAdminClick}
                >
                    Выполняйте задания и получайте награды
                </div>
            </div>

            {/* Admin Panel */}
            {showAdminPanel && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-bold mb-4 text-yellow-400">Админ-панель</h2>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Название задания</label>
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                className="w-full p-2 bg-gray-700 rounded"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Ссылка</label>
                            <input
                                type="text"
                                value={newTask.link}
                                onChange={(e) => setNewTask({...newTask, link: e.target.value})}
                                className="w-full p-2 bg-gray-700 rounded"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Награда (текст)</label>
                            <input
                                type="text"
                                value={newTask.reward}
                                onChange={(e) => setNewTask({...newTask, reward: e.target.value})}
                                className="w-full p-2 bg-gray-700 rounded"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Количество звезд</label>
                            <input
                                type="number"
                                value={newTask.rewardAmount}
                                onChange={(e) => setNewTask({...newTask, rewardAmount: Number(e.target.value)})}
                                className="w-full p-2 bg-gray-700 rounded"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Тип задания</label>
                            <select
                                value={newTask.type}
                                onChange={(e) => setNewTask({...newTask, type: e.target.value as 'in-game' | 'partners'})}
                                className="w-full p-2 bg-gray-700 rounded"
                            >
                                <option value="in-game">В игре</option>
                                <option value="partners">Партнеры</option>
                            </select>
                        </div>
                        
                        <button
                            onClick={handleAddTask}
                            className="w-full py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-600 transition"
                        >
                            Добавить задание
                        </button>
                    </div>
                    
                    {/* Список всех заданий для управления */}
                    <div className="mt-6">
                        <h3 className="font-bold mb-2">Все задания</h3>
                        <div className="space-y-2">
                            {[...tasks, ...partnerTasks].map((task) => (
                                <div key={task.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                                    <div>
                                        <span className="font-medium">{task.title}</span> ({task.type})
                                    </div>
                                    <button
                                        onClick={() => task.id && handleDeleteTask(task.id)}
                                        className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Switcher */}
            <div className="flex gap-0 mt-6">
                <button
                    onClick={() => setActiveTab('in-game')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition duration-300 
                        ${activeTab === 'in-game'
                            ? 'bg-white text-black'
                            : 'bg-[#151515] text-white'
                        }`}
                >
                    В игре
                </button>
                <button
                    onClick={() => setActiveTab('partners')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition duration-300 
                        ${activeTab === 'partners'
                            ? 'bg-white text-black'
                            : 'bg-[#151515] text-white'
                        }`}
                >
                    Партнеры
                    <div className="bg-[#5a5a5a] text-[#fefefe] size-4 rounded-full flex items-center justify-center text-[11px]">
                        {partnerTasks.filter(t => !t.completed).length}
                    </div>
                </button>
            </div>

            {/* Tasks List */}
            <div className="mt-5 mb-20 space-y-3">
                {(activeTab === 'in-game' ? tasks : partnerTasks).map((task, index) => (
                    <div
                        key={task.id || index}
                        className={`flex items-center bg-[#151516] rounded-xl p-2 ${task.completed ? 'opacity-70' : ''}`}
                    >
                        <div className="w-[72px] flex justify-center">
                            <div className="w-11 h-11 rounded-full overflow-hidden">
                                <Image
                                    src={task.icon}
                                    alt={task.title}
                                    width={60}
                                    height={60}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <div className="text-[17px]">{task.title}</div>
                                <div className={`font-medium text-[16px] flex items-center gap-1 ${task.completed ? 'text-gray-500' : 'text-[#edaa00]'}`}>
                                    {task.reward}
                                    {!task.completed && (
                                        <Image 
                                            src="/star.png" 
                                            alt="Star" 
                                            width={24} 
                                            height={24} 
                                            className="w-3.5 h-3.5 object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => !task.completed && handleTaskStart(task, activeTab === 'partners')}
                                className={`h-7 px-4 rounded-full text-sm font-medium flex items-center 
                                    ${task.completed 
                                        ? 'bg-gray-500/10 text-gray-500 cursor-default' 
                                        : 'bg-[#edaa00]/10 text-[#edaa00] hover:bg-[#edaa00]/20'
                                    }`}
                                disabled={task.completed}
                            >
                                {task.completed ? 'Выполнено' : 'Начать'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TasksTab