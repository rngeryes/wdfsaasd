# bot.py
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
import aiohttp
import logging
from pathlib import Path

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = "8096336072:AAH4Cw1nkPM_N7zT_qhp_X8Y2J0-X8_U51E"
ADMIN_IDS = {2144460390, 7648312416}  # Используем множество для быстрого поиска
SERVER_URL = "http://localhost:3001"  # URL вашего FastAPI сервера

# Инициализация с новым синтаксисом aiogram 3.7.0
bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.MARKDOWN)
)
dp = Dispatcher()

# ... остальной код остается без изменений ...

# Глобальные переменные
checked_withdraws = set()

async def fetch_withdraws():
    """Получение списка выводов с сервера"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{SERVER_URL}/api/withdraws") as resp:
                if resp.status == 200:
                    return await resp.json()
                logger.error(f"Ошибка получения выводов: HTTP {resp.status}")
                return None
    except Exception as e:
        logger.error(f"Ошибка при запросе к серверу: {e}")
        return None

async def send_withdraw_notification(withdraw_data: dict):
    """Отправка уведомления о новом выводе"""
    try:
        message = (
            "🎁 *Новый запрос на вывод!*\n\n"
            f"👤 Пользователь: @{withdraw_data.get('telegram_username', 'N/A')}\n"
            f"🆔 User ID: `{withdraw_data.get('user_id', 'N/A')}`\n"
            f"🎁 Подарок: {withdraw_data.get('gift_name', 'N/A')}\n"
            f"💰 Стоимость: {withdraw_data.get('gift_price', 0)} звезд\n"
            f"🆔 Withdraw ID: `{withdraw_data.get('id', 'N/A')}`"
        )
        
        keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
            [
                types.InlineKeyboardButton(
                    text="✅ Подтвердить", 
                    callback_data=f"approve_{withdraw_data.get('id', '')}"
                ),
                types.InlineKeyboardButton(
                    text="❌ Отклонить", 
                    callback_data=f"reject_{withdraw_data.get('id', '')}"
                )
            ]
        ])
        
        await bot.send_message(
            chat_id=ADMIN_ID,
            text=message,
            reply_markup=keyboard
        )
        logger.info(f"Уведомление о выводе отправлено: {withdraw_data}")
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления: {e}")

@dp.message(Command("start"))
async def cmd_start(message: Message):
    """Обработка команды /start"""
    await message.answer(
        "🛠 Бот для обработки выводов работает!\n"
        "Используйте /help для списка команд"
    )

@dp.message(Command("help"))
async def cmd_help(message: Message):
    """Обработка команды /help"""
    help_text = (
        "📌 *Доступные команды:*\n\n"
        "/start - Запустить бота\n"
        "/help - Помощь\n"
        "/status - Проверить статус бота\n"
        "/withdraws - Посмотреть последние выводы"
    )
    await message.answer(help_text)

@dp.message(Command("status"))
async def cmd_status(message: Message):
    """Обработка команды /status (только для админа)"""
if message.from_user.id in ADMIN_IDS:
        status = (
            "✅ Бот работает нормально\n"
            f"🔎 Проверено выводов: {len(checked_withdraws)}\n"
            f"🔄 Последняя проверка: {asyncio.get_event_loop().time()}"
        )
        await message.answer(status)
    else:
        await message.answer("⛔ У вас нет прав для этой команды")

@dp.message(Command("withdraws"))
async def cmd_withdraws(message: Message):
    """Обработка команды /withdraws (только для админа)"""
    if str(message.from_user.id) != ADMIN_ID:
        await message.answer("⛔ У вас нет прав для этой команды")
        return
    
    withdraws = await fetch_withdraws()
    if not withdraws:
        await message.answer("❌ Не удалось получить данные о выводах")
        return
    
    last_withdraws = withdraws[-5:]  # Последние 5 выводов
    
    response = "📋 *Последние запросы на вывод:*\n\n"
    for withdraw in last_withdraws:
        response += (
            f"🆔 ID: `{withdraw.get('id', 'N/A')}`\n"
            f"👤 @{withdraw.get('telegram_username', 'N/A')}\n"
f"🎁 {withdraw.get('gift_name', 'N/A')} ({withdraw.get('gift_price', 0)} звезд)\n"
            f"📌 Статус: {withdraw.get('status', 'unknown').upper()}\n"
            "━━━━━━━━━━━━━━\n"
        )
    
    await message.answer(response)

@dp.callback_query(lambda c: c.data.startswith(('approve_', 'reject_')))
async def handle_withdraw_action(callback: CallbackQuery):
    """Обработка действий подтверждения/отклонения"""
    try:
        action, withdraw_id = callback.data.split('_', 1)
        status = "completed" if action == "approve" else "rejected"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{SERVER_URL}/api/update_withdraw_status",
                json={"withdraw_id": withdraw_id, "status": status}
            ) as resp:
                if resp.status == 200:
                    status_text = "одобрен" if action == "approve" else "отклонен"
                    await callback.answer(f"Запрос {withdraw_id} {status_text}!")
                    
                    # Обновляем сообщение
                    original_text = callback.message.text or ""
                    await callback.message.edit_text(
                        text=f"{original_text}\n\nСтатус: {status.upper()}",
                        reply_markup=None
                    )
                else:
                    await callback.answer("Ошибка при обновлении статуса!")
    except Exception as e:
        logger.error(f"Ошибка обработки callback: {e}")
        await callback.answer("Произошла ошибка!")

async def check_new_withdraws_periodically():
    """Периодическая проверка новых выводов"""
    while True:
        try:
            withdraws = await fetch_withdraws()
            if withdraws:
                new_withdraws = [
                    w for w in withdraws 
                    if isinstance(w, dict) and w.get("id") not in checked_withdraws
                ]
                
                for withdraw in new_withdraws:
                    await send_withdraw_notification(withdraw)
                    checked_withdraws.add(withdraw["id"])
        except Exception as e:
            logger.error(f"Ошибка при проверке выводов: {e}")
        
        await asyncio.sleep(10)  # Проверка каждые 10 секунд

async def on_startup():
    """Действия при запуске бота"""
    logger.info("Бот запущен")
    await bot.send_message(ADMIN_ID, "🟢 Бот для выводов запущен!")
    asyncio.create_task(check_new_withdraws_periodically())

async def on_shutdown():
    """Действия при остановке бота"""
    logger.info("Бот остановлен")
    await bot.send_message(ADMIN_ID, "🔴 Бот для выводов остановлен!")

async def main():
    """Основная функция запуска"""
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    
    # Удаляем необработанные обновления
    await bot.delete_webhook(drop_pending_updates=True)
    
    # Запускаем бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Бот остановлен вручную")
    except Exception as e:
        logger.error(f"Фатальная ошибка: {e}")