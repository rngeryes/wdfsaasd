// pages/api/tasks.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Открываем соединение с базой данных
    const db = await open({
      filename: './tasks.db',
      driver: sqlite3.Database
    })

    // Получаем задания в игре
    const gameTasks = await db.all(
      'SELECT id, title, link, icon_path as icon, reward, reward_amount as rewardAmount FROM tasks WHERE is_partner_task = 0'
    )

    // Получаем партнерские задания
    const partnerTasks = await db.all(
      'SELECT id, title, link, icon_path as icon, reward, reward_amount as rewardAmount FROM tasks WHERE is_partner_task = 1'
    )

    await db.close()

    res.status(200).json({ 
      success: true, 
      gameTasks, 
      partnerTasks 
    })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}