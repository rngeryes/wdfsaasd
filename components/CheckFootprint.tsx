// components/LatestWithdrawals.tsx

'use client'

import { useEffect, useState } from "react"
import Image from "next/image"

interface Withdrawal {
  id: string
  telegram_username: string
  gift_name: string
  gift_id: number
  gift_price: number
  status: string
}

const LatestWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/withdraws')
        const data = await response.json()
        // Get last 5 withdrawals and reverse to show newest first
        const lastFive = data.slice(-5).reverse()
        setWithdrawals(lastFive)
      } catch (error) {
        console.error('Error fetching withdrawals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWithdrawals()
    // Set up polling every 10 seconds
    const interval = setInterval(fetchWithdrawals, 10000)
    return () => clearInterval(interval)
  }, [])

  // Функция для получения пути к изображению по ID подарка
  const getGiftImagePath = (giftId: number) => {
    const giftImages: Record<number, string> = {
      1: "/bear.png",
      2: "/heart.png",
      3: "/gift.png",
      4: "/flo.png",
      5: "/tort.png",
      6: "/flowers.png",
      7: "/rocket.png",
      8: "/bottle.png",
      9: "/trophy.png",
      10: "/ring.png",
      11: "/diamond.png",
      12: "/nft1.png",
      13: "/nft2.png",
      14: "/nft3.png"
    };
    return giftImages[giftId] || "/gift.png"; // fallback image
  };

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        <div className="fixed top-0 w-full max-w-md px-4 py-3 bg-[#151516]">
          <div className="text-base text-white font-medium">Loading recent withdrawals...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full">
      <div className="fixed top-0 w-full max-w-md px-4 py-3 bg-[#151516] overflow-hidden">
        <div className="flex items-center space-x-4 animate-scroll">
          {withdrawals.map((withdrawal, index) => (
            <div key={index} className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-white font-medium">{withdrawal.telegram_username}</span>
              <span className="text-gray-300">won</span>
              <div className="flex items-center space-x-1">
                <Image 
                  src={getGiftImagePath(withdrawal.gift_id)} 
                  alt={withdrawal.gift_name}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[#4c9ce2] font-medium">{withdrawal.gift_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 text-sm">({withdrawal.gift_price}</span>
                <Image 
                  src="/star.png" 
                  alt="Stars" 
                  width={14} 
                  height={14}
                  className="w-3.5 h-3.5"
                />
                <span className="text-gray-400 text-sm">)</span>
              </div>
            </div>
          ))}
          {/* Duplicate for seamless looping */}
          {withdrawals.map((withdrawal, index) => (
            <div key={`dup-${index}`} className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-white font-medium">{withdrawal.telegram_username}</span>
              <span className="text-gray-300">won</span>
              <div className="flex items-center space-x-1">
                <Image 
                  src={getGiftImagePath(withdrawal.gift_id)} 
                  alt={withdrawal.gift_name}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[#4c9ce2] font-medium">{withdrawal.gift_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 text-sm">({withdrawal.gift_price}</span>
                <Image 
                  src="/star.png" 
                  alt="Stars" 
                  width={14} 
                  height={14}
                  className="w-3.5 h-3.5"
                />
                <span className="text-gray-400 text-sm">)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LatestWithdrawals