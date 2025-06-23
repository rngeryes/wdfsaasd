// pages/api/create_withdraw.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const serverResponse = await fetch('http://localhost:3001/api/create_withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    })

    const data = await serverResponse.json()
    
    if (serverResponse.ok) {
      return res.status(200).json(data)
    } else {
      return res.status(serverResponse.status).json(data)
    }
  } catch (error) {
    console.error('Error creating withdraw:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}