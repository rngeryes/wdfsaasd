const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Simple database (file-based)
const DB_FILE = path.join(__dirname, 'database.txt');

// Initialize database if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }));
}

// Read database
function readDB() {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Write to database
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Telegram Bot
const bot = new Telegraf('7638201917:AAF5JLBnwubw_mDwPJQlMzjz9DCasf4RlZA');

bot.start((ctx) => {
  ctx.reply('Добро пожаловать в Paws Game! Используйте мини-приложение для игры.');
});

bot.launch();

// API Routes
app.post('/api/update-balance', (req, res) => {
  const { userId, balance } = req.body;
  
  if (!userId || balance === undefined) {
    return res.status(400).json({ error: 'Missing userId or balance' });
  }

  const db = readDB();
  db.users[userId] = db.users[userId] || { balance: 0 };
  db.users[userId].balance = balance;
  writeDB(db);

  res.json({ success: true });
});

app.get('/api/get-balance/:userId', (req, res) => {
  const { userId } = req.params;
  
  const db = readDB();
  const user = db.users[userId] || { balance: 0 };

  res.json({ balance: user.balance });
});

// Telegram Mini App Init Data validation middleware
app.post('/api/validate-init-data', (req, res) => {
  const { initData } = req.body;
  
  // In a real app, you should validate the initData with your bot token
  // For simplicity, we'll just parse it here
  try {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user') || '{}');

    res.json({
      valid: true,
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name
    });
  } catch (error) {
    res.status(400).json({ valid: false, error: 'Invalid initData' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});