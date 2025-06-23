import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    ContextTypes,
    CommandHandler,
    MessageHandler,
    filters,
    CallbackQueryHandler
)
from database import init_db, add_task, get_tasks, delete_task, update_task_status

# Конфигурация
TOKEN = "7912461150:AAEFL1S1hncWjdxp3cKfXSkibr5B0OZFnOQ"
ADMIN_ID = 1002488907
TASK_IMAGE = "task.png"  # Все задания будут использовать одну и ту же картинку

# Настройка логгирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Состояния для FSM
(
    ADD_TASK_TYPE,
    ADD_TASK_TITLE,
    ADD_TASK_LINK,
    ADD_TASK_REWARD,
    ADD_TASK_REWARD_AMOUNT,
    DELETE_TASK
) = range(6)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        await update.message.reply_text("У вас нет доступа к этому боту.")
        return
    
    keyboard = [
        [InlineKeyboardButton("Добавить задание", callback_data='add_task')],
        [InlineKeyboardButton("Удалить задание", callback_data='delete_task')],
        [InlineKeyboardButton("Просмотреть задания", callback_data='view_tasks')]
    ]
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("Панель администратора:", reply_markup=reply_markup)

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    if data == 'add_task':
        keyboard = [
            [InlineKeyboardButton("В игре", callback_data='add_in_game')],
            [InlineKeyboardButton("Партнеры", callback_data='add_partners')],
            [InlineKeyboardButton("Назад", callback_data='back')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            text="Выберите тип задания:",
            reply_markup=reply_markup
        )
    
    elif data == 'delete_task':
        tasks = get_tasks()
        if not tasks:
            await query.edit_message_text("Нет доступных заданий для удаления.")
            return
        
        keyboard = []
        for task in tasks:
            keyboard.append([
                InlineKeyboardButton(
                    f"{task[0]}. {task[2]} ({'В игре' if task[1] == 'in-game' else 'Партнеры'})",
                    callback_data=f'delete_{task[0]}'
                )
            ])
        keyboard.append([InlineKeyboardButton("Назад", callback_data='back')])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            text="Выберите задание для удаления:",
            reply_markup=reply_markup
        )
    
    elif data == 'view_tasks':
        tasks = get_tasks()
        if not tasks:
            await query.edit_message_text("Нет доступных заданий.")
            return
        
        message_text = "Список заданий:\n\n"
        for task in tasks:
            message_text += (
                f"ID: {task[0]}\n"
                f"Тип: {'В игре' if task[1] == 'in-game' else 'Партнеры'}\n"
                f"Название: {task[2]}\n"
                f"Ссылка: {task[3]}\n"
                f"Награда: {task[4]} ({task[5]} звезд)\n"
                f"Статус: {'Выполнено' if task[6] else 'Активно'}\n\n"
            )
        
        keyboard = [[InlineKeyboardButton("Назад", callback_data='back')]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(
            text=message_text,
            reply_markup=reply_markup
        )
    
    elif data.startswith('delete_'):
        task_id = int(data.split('_')[1])
        delete_task(task_id)
        await query.edit_message_text("Задание успешно удалено.")
    
    elif data == 'add_in_game':
        context.user_data['task_type'] = 'in-game'
        context.user_data['state'] = ADD_TASK_TITLE
        await query.edit_message_text("Введите название задания:")
    
    elif data == 'add_partners':
        context.user_data['task_type'] = 'partners'
        context.user_data['state'] = ADD_TASK_TITLE
        await query.edit_message_text("Введите название задания:")
    
    elif data == 'back':
        keyboard = [
            [InlineKeyboardButton("Добавить задание", callback_data='add_task')],
            [InlineKeyboardButton("Удалить задание", callback_data='delete_task')],
            [InlineKeyboardButton("Просмотреть задания", callback_data='view_tasks')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text("Панель администратора:", reply_markup=reply_markup)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return
    
    if 'state' not in context.user_data:
        await update.message.reply_text("Используйте команды из меню.")
        return
    
    state = context.user_data['state']
    text = update.message.text
    
    if state == ADD_TASK_TITLE:
        context.user_data['title'] = text
        context.user_data['state'] = ADD_TASK_LINK
        await update.message.reply_text("Введите ссылку для задания:")
    
    elif state == ADD_TASK_LINK:
        context.user_data['link'] = text
        context.user_data['state'] = ADD_TASK_REWARD
        await update.message.reply_text("Введите текст награды (например: '+ 1,000 PAWS'):")
    
    elif state == ADD_TASK_REWARD:
        context.user_data['reward'] = text
        context.user_data['state'] = ADD_TASK_REWARD_AMOUNT
        await update.message.reply_text("Введите количество звезд для награды (только число):")
    
    elif state == ADD_TASK_REWARD_AMOUNT:
        try:
            reward_amount = int(text)
            task_type = context.user_data['task_type']
            title = context.user_data['title']
            link = context.user_data['link']
            reward = context.user_data['reward']
            
            add_task(task_type, title, link, reward, reward_amount)
            
            del context.user_data['state']
            del context.user_data['task_type']
            del context.user_data['title']
            del context.user_data['link']
            del context.user_data['reward']
            
            await update.message.reply_text("Задание успешно добавлено!")
            
            # Возвращаемся в главное меню
            keyboard = [
                [InlineKeyboardButton("Добавить задание", callback_data='add_task')],
                [InlineKeyboardButton("Удалить задание", callback_data='delete_task')],
                [InlineKeyboardButton("Просмотреть задания", callback_data='view_tasks')]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await update.message.reply_text("Панель администратора:", reply_markup=reply_markup)
        
        except ValueError:
            await update.message.reply_text("Пожалуйста, введите число. Попробуйте еще раз:")

if __name__ == '__main__':
    # Инициализация базы данных
    init_db()
    
    # Создание и настройка бота
    application = ApplicationBuilder().token(TOKEN).build()
    
    # Добавление обработчиков
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CallbackQueryHandler(button_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Запуск бота
    application.run_polling()