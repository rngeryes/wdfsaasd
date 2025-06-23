// pages/api/complete-task.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { taskId, isPartnerTask } = req.body

  try {
    // Здесь должна быть логика проверки, что пользователь действительно выполнил задание
    // и начисления награды пользователю
    
    // В этом примере просто возвращаем успех
    res.status(200).json({ 
      success: true,
      message: 'Task completed successfully'
    })
  } catch (error) {
    console.error('Error completing task:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}