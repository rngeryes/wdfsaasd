// components/GamesTab.tsx
'use client'

import Image from 'next/image'
import { Player } from '@lottiefiles/react-lottie-player'
import { useState, useEffect } from 'react'
import { useBalance } from '@/contexts/BalanceContext'

type GameItem = {
    id: number;
    image: string;
    name: string;
    reward: number;
    description: string;
}

const GamesTab = () => {
    const { balance, addBalance } = useBalance()
    const [playedGames, setPlayedGames] = useState<number[]>([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [memoryGameState, setMemoryGameState] = useState<{
        cards: { id: number; emoji: string; flipped: boolean; matched: boolean }[];
        moves: number;
        gameCompleted: boolean;
    } | null>(null)
    
    useEffect(() => {
        const savedPlayedGames = localStorage.getItem('playedGames')
        if (savedPlayedGames) {
            setPlayedGames(JSON.parse(savedPlayedGames))
        }
    }, [])

    const gamesData: GameItem[] = [
        { id: 1, image: "/pngegg.png", name: "Мемори", reward: 100, description: "Найди все пары карточек" },
    ]

    const initMemoryGame = () => {
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
        const cards = [...emojis, ...emojis]
            .map((emoji, index) => ({
                id: index,
                emoji,
                flipped: false,
                matched: false
            }))
            .sort(() => Math.random() - 0.5)
        
        setMemoryGameState({
            cards,
            moves: 0,
            gameCompleted: false
        })
    }

    const handleCardClick = (id: number) => {
        if (!memoryGameState) return
        
        const { cards, moves } = memoryGameState
        const clickedCard = cards.find(card => card.id === id)
        
        if (!clickedCard || clickedCard.flipped || clickedCard.matched) return
        
        const flippedCards = cards.filter(card => card.flipped && !card.matched)
        
        if (flippedCards.length === 1) {
            const newCards = cards.map(card => {
                if (card.id === id) {
                    return { ...card, flipped: true }
                }
                return card
            })
            
            const firstCard = flippedCards[0]
            const secondCard = newCards.find(card => card.id === id)!
            
            if (firstCard.emoji === secondCard.emoji) {
                const matchedCards = newCards.map(card => {
                    if (card.emoji === firstCard.emoji) {
                        return { ...card, matched: true, flipped: true }
                    }
                    return card
                })
                
                const gameCompleted = matchedCards.every(card => card.matched)
                
                setMemoryGameState({
                    cards: matchedCards,
                    moves: moves + 1,
                    gameCompleted
                })
                
                if (gameCompleted) {
                    setTimeout(() => {
                        handleGameComplete(1)
                    }, 1000)
                }
            } else {
                setMemoryGameState({
                    cards: newCards,
                    moves: moves + 1,
                    gameCompleted: false
                })
                
                setTimeout(() => {
                    setMemoryGameState(prev => {
                        if (!prev) return null
                        return {
                            ...prev,
                            cards: prev.cards.map(card => {
                                if (card.id === firstCard.id || card.id === id) {
                                    return { ...card, flipped: false }
                                }
                                return card
                            })
                        }
                    })
                }, 1000)
            }
        } else {
            setMemoryGameState({
                ...memoryGameState,
                cards: cards.map(card => {
                    if (card.id === id) {
                        return { ...card, flipped: true }
                    }
                    return card
                }),
                moves: moves + 1
            })
        }
    }

    const handleGameStart = (gameId: number) => {
        if (playedGames.includes(gameId)) {
            setError('Вы уже играли в эту игру сегодня. Возвращайтесь завтра!')
            setTimeout(() => setError(''), 3000)
            return
        }
        
        switch (gameId) {
            case 1:
                initMemoryGame()
                break
            case 2:
                break
            case 3:
                break
            default:
                break
        }
    }

    const handleGameComplete = (gameId: number) => {
        const game = gamesData.find(g => g.id === gameId)
        if (!game) return
        
        const newPlayedGames = [...playedGames, gameId]
        setPlayedGames(newPlayedGames)
        localStorage.setItem('playedGames', JSON.stringify(newPlayedGames))
        
        addBalance(game.reward)
        setSuccess(`Поздравляем! Вы получили ${game.reward} звезд за игру!`)
        setTimeout(() => setSuccess(''), 5000)
        
        setMemoryGameState(null)
    }

    const renderGameContent = (gameId: number) => {
        switch (gameId) {
            case 1:
                if (!memoryGameState) return null
                
                return (
                    <div className="mt-4">
                        <div className="grid grid-cols-4 gap-2">
                            {memoryGameState.cards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    className={`h-16 flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-all duration-200 ${
                                        card.flipped || card.matched 
                                            ? 'bg-[#edaa00]' 
                                            : 'bg-[#252525] hover:bg-[#333]'
                                    }`}
                                >
                                    {(card.flipped || card.matched) ? card.emoji : '?'}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <p>Ходы: {memoryGameState.moves}</p>
                            {memoryGameState.gameCompleted && (
                                <p className="text-green-500">Поздравляем! Вы нашли все пары!</p>
                            )}
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="mt-4 text-center py-8">
                        <p>Игра в разработке</p>
                        <button 
                            onClick={() => {
                                handleGameComplete(gameId)
                                setMemoryGameState(null)
                            }}
                            className="mt-4 bg-[#edaa00] text-black px-4 py-2 rounded-lg font-medium"
                        >
                            Завершить игру (тест)
                        </button>
                    </div>
                )
        }
    }

    return (
        <div className={`games-tab-con transition-all duration-300`}>
            <div className="px-4">
                <div className="flex flex-col items-center mt-4 relative">
                    {/* Glow effect with white-black color scheme */}
                    <div 
                        className="absolute top-[30px] w-[150px] h-[150px] bg-white/20 rounded-full blur-xl opacity-15"
                        style={{ 
                            left: 'calc(50% - 75px)',
                            animation: 'glow-flicker 3s ease-in-out infinite'
                        }}
                    ></div>

                    <Player
                        src="/game.json"
                        autoplay
                        loop
                        style={{ width: 170, height: 170, position: 'relative', zIndex: 10 }}
                    />
                    <h1 className="text-2xl font-bold mb-2">Мини-Игры</h1>
                    <p className="text-sm text-[#7c7c7c] mb-4">Играй в мини-игры и получай звезды на баланс!</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/10 text-green-500 p-3 rounded-lg mb-4 text-center">
                        {success}
                    </div>
                )}

                {/* Список игр */}
                <div className="grid grid-cols-1 gap-4 mt-6">
                    {gamesData.map((game) => (
                        <div 
                            key={game.id}
                            className="bg-[#151515] rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16">
                                    <Image 
                                        src={game.image} 
                                        alt={game.name} 
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium">{game.name}</h3>
                                    <p className="text-sm text-[#7c7c7c]">{game.description}</p>
                                    <div className="flex items-center mt-1 text-[#edaa00] text-sm">
                                        Награда: {game.reward}
                                        <Image 
                                            src="/star.png" 
                                            alt="Stars" 
                                            width={12} 
                                            height={12}
                                            className="ml-1"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleGameStart(game.id)}
                                    disabled={playedGames.includes(game.id)}
                                    className={`h-7 px-4 rounded-full text-sm font-medium flex items-center 
                                        ${playedGames.includes(game.id)
                                            ? 'bg-gray-500/10 text-gray-500 cursor-default' 
                                            : 'bg-[#edaa00]/10 text-[#edaa00] hover:bg-[#edaa00]/20'
                                        }`}
                                >
                                    {playedGames.includes(game.id) ? (
                                        <>
                                            <Image 
                                                src="/lock.png" 
                                                alt="Lock" 
                                                width={14} 
                                                height={14}
                                                className="mr-1"
                                            />
                                            Завтра
                                        </>
                                    ) : (
                                        'Играть'
                                    )}
                                </button>
                            </div>
                            
                            {/* Контент игры */}
                            {memoryGameState && renderGameContent(game.id)}
                        </div>
                    ))}
                </div>

                {/* Баланс пользователя */}
                <div className="bg-white rounded-2xl p-4 mt-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Image 
                            src="/star.png" 
                            alt="Stars" 
                            width={20} 
                            height={20}
                        />
                        <span className="text-black font-medium">Ваш баланс:</span>
                    </div>
                    <span className="text-black font-bold">{balance.toLocaleString()}</span>
                </div>

                <style jsx global>{`
                    @keyframes glow-flicker {
                        0%, 100% { opacity: 0.1; transform: scale(0.9); }
                        20% { opacity: 0.6; transform: scale(1); }
                        40% { opacity: 0.4; transform: scale(0.95); }
                        60% { opacity: 0.5; }
                        80% { opacity: 0.3; transform: scale(1.05); }
                    }
                `}</style>
            </div>
        </div>
    )
}

export default GamesTab