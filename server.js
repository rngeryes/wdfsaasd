require('dotenv').config();
const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');

// Инициализация базы данных
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] }).write();

// Инициализация Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Инициализация Telegram бота
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '7638201917:AAF5JLBnwubw_mDwPJQlMzjz9DCasf4RlZA');

// Обработка команды /start
bot.command('start', (ctx) => {
    ctx.reply('Привет! Добро пожаловать в Paws Game. Используйте мини-приложение для игры!');
});

// Запуск бота
bot.launch();

// API для мини-приложения
app.post('/api/user', (req, res) => {
    const { initData } = req.body;
    
    // Здесь должна быть реальная проверка данных от Telegram
    // В демо-версии мы просто принимаем данные как есть
    try {
        const userData = parseInitData(initData);
        const userId = userData.user?.id;
        
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user data' });
        }

        // Поиск или создание пользователя
        let user = db.get('users').find({ id: userId }).value();
        
        if (!user) {
            user = {
                id: userId,
                balance: 100,
                energy: 100,
                lastUpdate: new Date().toISOString()
            };
            db.get('users').push(user).write();
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/update-balance', (req, res) => {
    const { userId, balance, energy } = req.body;
    
    if (!userId || balance === undefined || energy === undefined) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    db.get('users')
        .find({ id: userId })
        .assign({ 
            balance: parseInt(balance),
            energy: parseInt(energy),
            lastUpdate: new Date().toISOString()
        })
        .write();

    res.json({ success: true });
});

// Вспомогательная функция для парсинга initData (упрощенная версия)
function parseInitData(initData) {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    return {
        user: userStr ? JSON.parse(userStr) : null
    };
}

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Telegram bot is running`);
});