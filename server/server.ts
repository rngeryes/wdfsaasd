import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initializeDatabase, getUser, updateUser, addReferral } from './database';
import { Telegraf } from 'telegraf';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '7912461150:AAEFL1S1hncWjdxp3cKfXSkibr5B0OZFnOQ');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
initializeDatabase().then(() => {
  console.log('Database initialized');
});

// API Routes
app.get('/api/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await getUser(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

app.post('/api/user/:userId/click', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await getUser(userId);
    
    if (user.energy <= 0) {
      return res.status(400).json({ error: 'Not enough energy' });
    }
    
    await updateUser(userId, {
      balance: user.balance + 1,
      energy: user.energy - 1
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user data' });
  }
});

app.post('/api/user/:userId/complete-task', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { taskId, reward } = req.body;
    
    const user = await getUser(userId);
    
    if (user.completedTasks.includes(taskId)) {
      return res.status(400).json({ error: 'Task already completed' });
    }
    
    await updateUser(userId, {
      balance: user.balance + reward,
      completedTasks: [...user.completedTasks, taskId]
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

app.post('/api/user/:userId/purchase-gift', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { giftId, price } = req.body;
    
    const user = await getUser(userId);
    
    if (user.balance < price) {
      return res.status(400).json({ error: 'Not enough balance' });
    }
    
    await updateUser(userId, {
      balance: user.balance - price,
      purchasedGifts: [...user.purchasedGifts, giftId]
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purchase gift' });
  }
});

app.post('/api/user/:userId/invite', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { referredUserId } = req.body;
    
    await addReferral(referredUserId, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

// Telegram bot commands
bot.command('start', (ctx) => {
  const userId = ctx.from.id;
  const command = ctx.message.text;
  
  // Check if this is a referral link
  const match = command.match(/\/start ref(\d+)/);
  
  if (match) {
    const referrerId = parseInt(match[1]);
    addReferral(userId, referrerId);
  }
  
  ctx.reply('Welcome to the game! Use the Mini App to play.');
});

// Start the server and bot
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  bot.launch().then(() => {
    console.log('Telegram bot started');
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));