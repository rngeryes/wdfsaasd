// components/GiftsTab.tsx
'use client'

import Image from 'next/image'
import { Player } from '@lottiefiles/react-lottie-player'
import { useState } from 'react'
import { useBalance } from '@/contexts/BalanceContext'

type GiftItem = {
    id: number;
    image: string;
    price: number;
    name: string;
    isVip?: boolean;
}

const GiftsTab = () => {
    const [telegramUsername, setTelegramUsername] = useState('')
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    const { balance, addBalance } = useBalance()

    const giftsData: GiftItem[] = [
        { id: 1, image: "/bear.png", price: 1500, name: "Мишка" },
        { id: 2, image: "/heart.png", price: 2500, name: "Сердце" },
        { id: 3, image: "/gift.png", price: 1000, name: "Подарок" },
        { id: 4, image: "/flo.png", price: 1000, name: "Роза" },
        { id: 5, image: "/tort.png", price: 800, name: "Торт" },
        { id: 6, image: "/flowers.png", price: 3000, name: "Букет" },
        { id: 7, image: "/rocket.png", price: 500, name: "Ракета" },
        { id: 8, image: "/bottle.png", price: 2000, name: "Бутылка" },
        { id: 9, image: "/trophy.png", price: 2000, name: "Кубок" },
        { id: 10, image: "/ring.png", price: 2000, name: "Кольцо" },
        { id: 11, image: "/diamond.png", price: 2000, name: "Алмаз" },
        // VIP подарки
        { id: 12, image: "/nft1.png", price: 5000, name: "NFT Шар", isVip: true },
        { id: 13, image: "/nft2.png", price: 7500, name: "NFT Кольцо", isVip: true },
        { id: 14, image: "/nft3.png", price: 10000, name: "NFT Шар 2", isVip: true },
    ]

    const handleGiftSelect = (gift: GiftItem) => {
        if (balance < gift.price) {
            setError(`Недостаточно звезд. Нужно еще ${gift.price - balance} звезд`);
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        setSelectedGift(gift);
        setIsWithdrawModalOpen(true);
    };

    const handleWithdrawSubmit = async () => {
        if (!telegramUsername || !selectedGift) return;
        
        if (balance < selectedGift.price) {
            setError('Недостаточно звезд для этого подарка');
            setTimeout(() => setError(''), 3000);
            return;
        }
        
        setIsLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const userId = localStorage.getItem('userId') || 'anonymous';
            
            const response = await fetch('http://localhost:3001/api/create_withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    telegram_username: telegramUsername,
                    gift_id: selectedGift.id,
                    gift_name: selectedGift.name,
                    gift_price: selectedGift.price
                }),
            });
            
            if (response.ok) {
                if (balance >= selectedGift.price) {
                    addBalance(-selectedGift.price);
                    setSuccess('Запрос на вывод отправлен! Админ свяжется с вами в Telegram.');
                    setIsWithdrawModalOpen(false);
                    setTelegramUsername('');
                    setSelectedGift(null);
                } else {
                    setError('Недостаточно звезд для этого подарка');
                }
            } else {
                setError('Ошибка при отправке запроса');
            }
        } catch (err) {
            setError('Произошла ошибка соединения');
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
        }
    };

    return (
        <div className={`gifts-tab-con transition-all duration-300`}>
            <div className="px-4">
<div className="flex flex-col items-center mt-4 relative">
  {/* Glow effect с новой анимацией */}
  <div 
    className="absolute top-[30px] w-[70px] h-[120px] bg-yellow-200 rounded-full blur-xl opacity-0"
    style={{ 
      left: 'calc(50% - 35px)',
      animation: 'glow-flicker 3s ease-in-out infinite'
    }}
  ></div>

  <Player
    src="/trophy.json"
    autoplay
    loop
    style={{ width: 170, height: 170, position: 'relative', zIndex: 10 }}
  />
  {/* ... остальной код ... */}

<style jsx global>{`
  @keyframes glow-flicker {
    0%, 100% { opacity: 0.1; transform: scale(0.9); }
    20% { opacity: 0.3; transform: scale(1); }
    40% { opacity: 0.2; transform: scale(0.95); }
    60% { opacity: 0.25; }
    80% { opacity: 0.15; transform: scale(1.05); }
  }
`}</style>
  <h1 className="text-2xl font-bold mb-2">Подарки</h1>
  <p className="text-sm text-[#7c7c7c] mb-4">Выбери подарок — и получи его на свой аккаунт!</p>
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

                {/* Остальной код остается без изменений */}
                {/* Обычные подарки */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {giftsData.filter(g => !g.isVip).map((gift) => (
                        <div 
                            key={gift.id}
                            className="bg-[#151515] rounded-2xl p-3 flex flex-col items-center"
                        >
                            <div className="w-21 h-21 mb-3 relative">
                                <Image 
                                    src={gift.image} 
                                    alt={gift.name} 
                                    width={90} 
                                    height={90}
                                />
                            </div>
                            <h3 className="text-base font-medium mb-2 text-center">{gift.name}</h3>
                            <button 
                                onClick={() => handleGiftSelect(gift)}
                                className="h-7 bg-[#edaa00]/10 text-[#edaa00] px-4 rounded-full text-sm font-medium flex items-center gap-1"
                            >
                                {gift.price}
                                <Image 
                                    src="/star.png" 
                                    alt="Stars" 
                                    width={14} 
                                    height={14}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                {/* VIP подарки */}
                <h2 className="text-xl font-bold mt-8 mb-4 text-center">VIP Подарки</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {giftsData.filter(g => g.isVip).map((gift) => (
                        <div 
                            key={gift.id}
                            className="relative rounded-2xl overflow-hidden h-40"
                            onClick={() => handleGiftSelect(gift)}
                        >
                            <Image 
                                src={gift.image} 
                                alt={gift.name} 
                                fill
                                className="object-cover rounded-2xl"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-2xl">
                                <h3 className="text-white font-medium text-sm">{gift.name}</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[#edaa00] text-sm font-medium">
                                        {gift.price}
                                    </span>
                                    <Image 
                                        src="/star.png" 
                                        alt="Stars" 
                                        width={14} 
                                        height={14}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Модальное окно вывода */}
                {isWithdrawModalOpen && selectedGift && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                        <div className="bg-[#1f1f1f] rounded-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Запрос вывода</h3>
                            
                            <div className="mb-4 flex items-center gap-3 bg-[#252525] p-3 rounded-lg">
                                {selectedGift.isVip ? (
                                    <div className="relative w-16 h-16">
                                        <Image 
                                            src={selectedGift.image} 
                                            alt={selectedGift.name} 
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <Image 
                                        src={selectedGift.image} 
                                        alt={selectedGift.name} 
                                        width={50} 
                                        height={50}
                                    />
                                )}
                                <div>
                                    <h4 className="font-medium">{selectedGift.name}</h4>
                                    <div className="flex items-center text-sm text-[#edaa00]">
                                        {selectedGift.price}
                                        <Image 
                                            src="/star.png" 
                                            alt="Stars" 
                                            width={12} 
                                            height={12}
                                            className="ml-1"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Ваш Telegram username</label>
                                <input
                                    type="text"
                                    placeholder="@username"
                                    value={telegramUsername}
                                    onChange={(e) => setTelegramUsername(e.target.value)}
                                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-lg p-3 text-sm"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="flex-1 py-3 bg-[#252525] rounded-lg font-medium"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleWithdrawSubmit}
                                    disabled={!telegramUsername || isLoading}
                                    className={`flex-1 py-3 bg-[#edaa00] rounded-lg font-medium text-black ${
                                        (!telegramUsername || isLoading) ? 'opacity-50' : ''
                                    }`}
                                >
                                    {isLoading ? 'Отправка...' : 'Вывести'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
            </div>
        </div>
    )
}

export default GiftsTab