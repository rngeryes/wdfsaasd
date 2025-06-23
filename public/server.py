# server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import uvicorn
from pydantic import BaseModel

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация базы данных
def init_db():
    conn = sqlite3.connect('paws_game.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS players (
            telegram_id INTEGER PRIMARY KEY,
            balance INTEGER DEFAULT 100,
            energy INTEGER DEFAULT 100,
            last_click_time INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class PlayerData(BaseModel):
    telegram_id: int

@app.post("/get_balance")
async def get_balance(player: PlayerData):
    conn = sqlite3.connect('paws_game.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT balance, energy FROM players WHERE telegram_id = ?', (player.telegram_id,))
    result = cursor.fetchone()
    
    if result is None:
        # Создаем нового игрока
        cursor.execute('INSERT INTO players (telegram_id, balance, energy) VALUES (?, 100, 100)', (player.telegram_id,))
        conn.commit()
        balance, energy = 100, 100
    else:
        balance, energy = result
    
    conn.close()
    return {"balance": balance, "energy": energy}

@app.post("/increment_balance")
async def increment_balance(player: PlayerData):
    conn = sqlite3.connect('paws_game.db')
    cursor = conn.cursor()
    
    # Проверяем энергию
    cursor.execute('SELECT energy FROM players WHERE telegram_id = ?', (player.telegram_id,))
    result = cursor.fetchone()
    
    if result is None or result[0] <= 0:
        conn.close()
        raise HTTPException(status_code=400, detail="Not enough energy")
    
    # Обновляем баланс и энергию
    cursor.execute('''
        UPDATE players 
        SET balance = balance + 1, 
            energy = energy - 1 
        WHERE telegram_id = ?
    ''', (player.telegram_id,))
    conn.commit()
    
    # Получаем обновленные значения
    cursor.execute('SELECT balance, energy FROM players WHERE telegram_id = ?', (player.telegram_id,))
    balance, energy = cursor.fetchone()
    
    conn.close()
    return {"balance": balance, "energy": energy}

@app.post("/recharge_energy")
async def recharge_energy(player: PlayerData):
    conn = sqlite3.connect('paws_game.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE players 
        SET energy = 100 
        WHERE telegram_id = ?
    ''', (player.telegram_id,))
    conn.commit()
    
    cursor.execute('SELECT energy FROM players WHERE telegram_id = ?', (player.telegram_id,))
    energy = cursor.fetchone()[0]
    
    conn.close()
    return {"energy": energy}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ssl_keyfile="./localhost-key.pem", ssl_certfile="./localhost.pem")