// contexts/BalanceContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type BalanceContextType = {
  balance: number
  energy: number
  addBalance: (amount: number) => void
  deductEnergy: (amount: number) => void
  resetEnergy: () => void
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export const BalanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [balance, setBalance] = useState(() => {
    // Инициализация из localStorage при первом рендере
    if (typeof window !== 'undefined') {
      const savedBalance = localStorage.getItem('balance')
      return savedBalance ? parseInt(savedBalance) : 100
    }
    return 100
  })
  
  const [energy, setEnergy] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedEnergy = localStorage.getItem('energy')
      return savedEnergy ? parseInt(savedEnergy) : 100
    }
    return 100
  })

  // Сохранение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('balance', balance.toString())
  }, [balance])

  useEffect(() => {
    localStorage.setItem('energy', energy.toString())
  }, [energy])

  const addBalance = (amount: number) => {
    setBalance(prev => {
      const newBalance = prev + amount
      console.log(`Adding ${amount} stars. New balance: ${newBalance}`)
      return newBalance
    })
  }

  const deductEnergy = (amount: number) => {
    setEnergy(prev => Math.max(0, prev - amount))
  }

  const resetEnergy = () => {
    setEnergy(100)
  }

  return (
    <BalanceContext.Provider value={{ balance, energy, addBalance, deductEnergy, resetEnergy }}>
      {children}
    </BalanceContext.Provider>
  )
}

export const useBalance = () => {
  const context = useContext(BalanceContext)
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider')
  }
  return context
}