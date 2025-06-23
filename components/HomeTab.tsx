// components/HomeTab.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useState, useEffect } from 'react';
import Wallet from '@/icons/Wallet'
import PawsLogo from '@/icons/PawsLogo'
import Community from '@/icons/Community'
import Star from '@/icons/Star'
import Image from 'next/image'
import ArrowRight from '@/icons/ArrowRight'
import { sparkles } from '@/images'
import Lightning from '@/icons/Lightning'
import { useBalance } from '@/contexts/BalanceContext'

const HomeTab = () => {
    const { balance, energy, addBalance, deductEnergy } = useBalance();
    const [isStarClicked, setIsStarClicked] = useState(false);
    const [scale, setScale] = useState(1);

    // Пульсация звезды
    useEffect(() => {
        const interval = setInterval(() => {
            setScale(prev => {
                if (prev >= 1.03) return 1;
                return prev + 0.002;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleStarClick = () => {
        if (energy <= 0) return;
        
        // Анимация тапа
        setIsStarClicked(true);
        setScale(1.1);
        
        // Увеличиваем баланс и уменьшаем энергию через контекст
        addBalance(1);
        deductEnergy(1);
        
        // Сбрасываем анимацию тапа
        setTimeout(() => {
            setIsStarClicked(false);
        }, 200);
    };

    return (
        <div className={`home-tab-con transition-all duration-300`}>
            <div className="flex flex-col items-center px-4 pt-2 h-full">
                <div className="text-[#868686] text-sm mb-1">Ваш баланс</div>
                <div className="flex items-center gap-1 text-center">
                    <div className="text-6xl font-bold mb-1">{balance.toLocaleString()}</div>
                </div>
                <div className="text-[#868686] text-sm mt-1">+1 за нажатие</div>

                <div className="relative my-10 w-full flex justify-center flex-1">
                    <div className="absolute inset-0 flex justify-center items-center">
                        <div 
                            className="w-[250px] h-[250px] bg-yellow-500 rounded-full blur-xl opacity-20 animate-pulse"
                            style={{ width: '250px', height: '250px' }}
                        ></div>
                    </div>
                    <button 
                        onClick={handleStarClick}
                        className="relative z-10 active:scale-95 transition-transform"
                        style={{
                            transform: `scale(${scale})`,
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        <Image
                            src="/star.png"
                            alt="Star"
                            width={250}
                            height={250}
                            className={`relative z-10 ${isStarClicked ? 'animate-tap' : ''}`}
                        />
                    </button>
                </div>
                
                <div className="w-full pb-8 pt-4">
                    <div className="text-[#868686] text-center mb-2">Заряд энергии</div>
                    <div className="flex items-center gap-3">
                        <Lightning className="w-6 h-6 text-[#007aff]" />
                        <div className="flex-1 h-3 bg-[#2d2d2e] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#007aff] rounded-full transition-all duration-300" 
                                style={{ width: `${energy}%` }}
                            ></div>
                        </div>
                        <span className="text-sm text-white">{energy}%</span>
                    </div>
                </div>
            </div>

            {/* Стили для анимации тапа */}
            <style jsx>{`
                @keyframes tap {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.95); }
                    100% { transform: scale(1); }
                }
                .animate-tap {
                    animation: tap 0.2s ease-out;
                }
            `}</style>
        </div>
    )
}

export default HomeTab