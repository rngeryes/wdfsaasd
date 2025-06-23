'use client'

import { useEffect, useState } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import Image from 'next/image'

const FriendsTab = () => {
  const [refLink, setRefLink] = useState('')
  const [invitedCount, setInvitedCount] = useState(0)
  const [earned, setEarned] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

const handleInviteClick = () => {
  if (window.Telegram?.WebApp?.openLink) {
    // Открываем ссылку внутри Telegram WebApp (не закрывает мини-приложение)
    Telegram.WebApp.openLink(
      `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=Присоединяйся!`
    );
  } else {
    // Fallback для обычного браузера (если открыто не в Telegram)
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=Присоединяйся!`,
      '_blank'
    );
  }
};

  // Генерация и загрузка реферальных данных
  useEffect(() => {
      if (window.Telegram?.WebApp) {
    Telegram.WebApp.expand(); // Раскрываем на весь экран (опционально)
    Telegram.WebApp.enableClosingConfirmation(); // Запрашиваем подтверждение при закрытии
  }
    
    const generateRefCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    const loadRefData = async () => {
      // Проверяем localStorage
      const savedData = localStorage.getItem('refData')
      if (savedData) {
        const { code, count, earned } = JSON.parse(savedData)
        setRefLink(`https://t.me/StarTapa_bot?start=ref_${code}`)
        setInvitedCount(count)
        setEarned(earned)
        setIsLoading(false)
        return
      }

      // Генерируем новый код
      const newCode = generateRefCode()
      const newRefLink = `https://t.me/StarTapa_bot?start=ref_${newCode}`

      // Сохраняем в localStorage
      const refData = {
        code: newCode,
        count: 0,
        earned: 0
      }
      localStorage.setItem('refData', JSON.stringify(refData))
      
      setRefLink(newRefLink)
      setIsLoading(false)
    }

    loadRefData()
  }, [])

  const copyRefLink = () => {
    if (!refLink) return
    navigator.clipboard.writeText(refLink)
    // Можно добавить уведомление
    alert('Ссылка скопирована!')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className={`friends-tab-con px-4 pb-24 transition-all duration-300`}>
      {/* Header with duck image and blue container */}
      <div className="pt-8 flex items-center gap-4">
        <div className="flex-shrink-0">
          <Player
            src="/1.json"
            autoplay
            loop
            style={{ width: 170, height: 170 }}
          />
        </div>
        <div className="bg-blue-500 size-[170px] rounded-3xl flex flex-col items-center justify-center relative">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-white">+100</span>
            <Image 
              src="/star.png" 
              alt="Star" 
              width={30} 
              height={30}
            />
          </div>
          <div className="text-white text-bold mt-1">
            За друзей
          </div>
        </div>
      </div>

      {/* Ref link container */}
      <div className="mt-10 mb-2">
        <p className="text-white text-sm font-medium mb-2">Ваша реферальная ссылка:</p>
        <div className="bg-[#151516] w-full rounded-xl p-3 flex items-center justify-between">
          <p className="text-sm font-medium text-white truncate">
            {refLink || "Генерация ссылки..."}
          </p>
          <button 
            onClick={copyRefLink}
            className="text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            disabled={!refLink}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24264C20 6.70435 19.7893 6.18827 19.4142 5.81319L16.6868 3.08579C16.3117 2.71071 15.7957 2.5 15.2574 2.5H10C8.89543 2.5 8 3.39543 8 4Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 8V20C4 21.1046 4.89543 22 6 22H14C15.1046 22 16 21.1046 16 20V19" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Stats containers */}
      <div className="flex justify-between mt-5">
        <div className="bg-[#151516] rounded-xl p-4 text-center w-[48%]">
          <div className="text-2xl font-bold text-white">{invitedCount}</div>
          <div className="text-gray-400 text-sm mt-1">Приглашено</div>
        </div>
        <div className="bg-[#151516] rounded-xl p-4 text-center w-[48%]">
          <div className="text-2xl font-bold text-white">{earned}</div>
          <div className="text-gray-400 text-sm mt-1">Заработано</div>
        </div>
      </div>

      {/* Invite Button */}
      <div className="mt-6 mb-8">
<button
  className="w-full bg-[#3b82f6] text-white py-3 rounded-xl text-lg font-medium"
  onClick={handleInviteClick}
  disabled={!refLink}
>
  Пригласить
</button>
      </div>
    </div>
  )
}

export default FriendsTab