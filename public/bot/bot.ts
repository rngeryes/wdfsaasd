import { Telegraf } from 'telegraf';
import { initDb, getTasks, deleteTask } from './database';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const ADMIN_ID = Number(process.env.ADMIN_ID);

// Инициализация базы данных
initDb();

bot.start((ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply('У вас нет доступа к этому боту.');
  }

  ctx.reply('Панель администратора:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Добавить задание', callback_data: 'add_task' }],
        [{ text: 'Удалить задание', callback_data: 'delete_task' }],
        [{ text: 'Просмотреть задания', callback_data: 'view_tasks' }]
      ]
    }
  });
});

// Обработчики кнопок и сообщений
// ... (аналогично предыдущей реализации)

bot.launch();
console.log('Бот запущен');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));