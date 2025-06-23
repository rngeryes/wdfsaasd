# public/bot/bot.py
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
import sqlite3
import os
from uuid import uuid4

# Configuration
TOKEN = "7912461150:AAEFL1S1hncWjdxp3cKfXSkibr5B0OZFnOQ"
ADMIN_ID = 1002488907
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'bot', 'tasks.db')

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        icon TEXT,
        title TEXT,
        reward TEXT,
        rewardAmount INTEGER,
        link TEXT,
        is_partner_task INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0
    )
    ''')
    
    conn.commit()
    conn.close()

# Bot commands
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id == ADMIN_ID:
        keyboard = [
            [InlineKeyboardButton("Добавить задание", callback_data='add_task')],
            [InlineKeyboardButton("Список заданий", callback_data='list_tasks')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="Панель администратора заданий:",
            reply_markup=reply_markup
        )
    else:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="У вас нет доступа к этой команде."
        )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if query.data == 'add_task':
        await add_task_step1(query, context)
    elif query.data == 'list_tasks':
        await list_tasks(query, context)
    elif query.data.startswith('delete_'):
        task_id = query.data.split('_')[1]
        await delete_task(query, context, task_id)
    elif query.data in ['task_type_game', 'task_type_partner']:  # Добавлено!
        await add_task_step5(query, context)  # Переход к запросу иконки
    elif query.data == 'cancel':
        await query.edit_message_text(text="Действие отменено.")
    elif query.data == 'menu':
        await start(query, context)  # Возврат в меню

async def add_task_step1(query: Update, context: ContextTypes.DEFAULT_TYPE):
    await query.edit_message_text(
        text="Введите название задания:",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("Отмена", callback_data='cancel')]])
    )
    context.user_data['task_state'] = 'awaiting_title'

async def add_task_step2(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['task_title'] = update.message.text
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text="Введите награду (например, '+ 1,000 PAWS'):",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("Отмена", callback_data='cancel')]])
    )
    context.user_data['task_state'] = 'awaiting_reward'

async def add_task_step3(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['task_reward'] = update.message.text
    try:
        reward_amount = int(''.join(filter(str.isdigit, update.message.text)))
        context.user_data['task_reward_amount'] = reward_amount
    except:
        context.user_data['task_reward_amount'] = 0
    
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text="Введите ссылку для задания:",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("Отмена", callback_data='cancel')]])
    )
    context.user_data['task_state'] = 'awaiting_link'

async def add_task_step4(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['task_link'] = update.message.text
    
    keyboard = [
        [InlineKeyboardButton("Игровое задание", callback_data='task_type_game')],
        [InlineKeyboardButton("Партнерское задание", callback_data='task_type_partner')],
        [InlineKeyboardButton("Отмена", callback_data='cancel')]
    ]
    
    # Отправляем новое сообщение с кнопками выбора типа
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text="Выберите тип задания:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
    context.user_data['task_state'] = 'awaiting_type'

async def add_task_step5(query: Update, context: ContextTypes.DEFAULT_TYPE):
    # Сохраняем тип задания
    is_partner = 1 if query.data == 'task_type_partner' else 0
    context.user_data['task_is_partner'] = is_partner
    
    # Редактируем предыдущее сообщение (убираем кнопки)
    await query.edit_message_text(
        text=f"Тип задания: {'Партнерское' if is_partner else 'Игровое'}\n\nОтправьте иконку задания (фото):",
        reply_markup=None  # Убираем кнопки
    )
    
    # Меняем состояние для обработки фото
    context.user_data['task_state'] = 'awaiting_icon'

async def save_task(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message.photo:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="Пожалуйста, отправьте фото для иконки задания."
        )
        return
    
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    
    # Save icon (in a real app, you'd save this to a proper file storage)
    icon_path = f"task_{uuid4().hex}.jpg"
    await file.download_to_drive(os.path.join('icons', icon_path))
    
    # Save task to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO tasks (id, icon, title, reward, rewardAmount, link, is_partner_task)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        str(uuid4()),
        icon_path,
        context.user_data['task_title'],
        context.user_data['task_reward'],
        context.user_data['task_reward_amount'],
        context.user_data['task_link'],
        context.user_data['task_is_partner']
    ))
    
    conn.commit()
    conn.close()
    
    # Clear user data
    context.user_data.clear()
    
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text="Задание успешно добавлено!",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("В меню", callback_data='menu')]])
    )

async def list_tasks(query: Update, context: ContextTypes.DEFAULT_TYPE):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, title, is_partner_task FROM tasks')
    tasks = cursor.fetchall()
    conn.close()
    
    if not tasks:
        await query.edit_message_text(
            text="Нет доступных заданий.",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("В меню", callback_data='menu')]])
        )
        return
    
    message = "Список заданий:\n\n"
    keyboard = []
    
    for task in tasks:
        task_id, title, is_partner = task
        task_type = "Партнерское" if is_partner else "Игровое"
        message += f"- {title} ({task_type})\n"
        keyboard.append([InlineKeyboardButton(f"Удалить {title}", callback_data=f'delete_{task_id}')])
    
    keyboard.append([InlineKeyboardButton("В меню", callback_data='menu')])
    
    await query.edit_message_text(
        text=message,
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def delete_task(query: Update, context: ContextTypes.DEFAULT_TYPE, task_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    
    await query.edit_message_text(
        text="Задание успешно удалено!",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("В меню", callback_data='menu')]])
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return
    
    if 'task_state' not in context.user_data:
        return
    
    state = context.user_data['task_state']
    
    if state == 'awaiting_title':
        await add_task_step2(update, context)
    elif state == 'awaiting_reward':
        await add_task_step3(update, context)
    elif state == 'awaiting_link':
        await add_task_step4(update, context)
    elif state == 'awaiting_icon':
        await save_task(update, context)

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != ADMIN_ID:
        return
    
    if 'task_state' in context.user_data and context.user_data['task_state'] == 'awaiting_icon':
        await save_task(update, context)

def main():
    # Create database if not exists
    init_db()
    
    # Create icons directory if not exists
    os.makedirs(os.path.join(os.path.dirname(__file__), 'icons'), exist_ok=True)
    
    application = ApplicationBuilder().token(TOKEN).build()
    
    # Handlers
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CallbackQueryHandler(button_handler))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
    application.add_handler(MessageHandler(filters.PHOTO, handle_photo))
    
    application.run_polling()

if __name__ == '__main__':
    main()