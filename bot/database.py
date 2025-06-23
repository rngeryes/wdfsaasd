import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / 'tasks.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        reward_amount INTEGER NOT NULL,
        is_partner BOOLEAN NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT 1
    )
    ''')
    
    conn.commit()
    conn.close()

def get_tasks(is_partner=False):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, title, link, reward_amount FROM tasks WHERE is_partner = ? AND is_active = 1', (is_partner,))
    tasks = cursor.fetchall()
    
    conn.close()
    return [{'id': t[0], 'title': t[1], 'link': t[2], 'reward_amount': t[3]} for t in tasks]

def add_task(title, link, reward_amount, is_partner):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO tasks (title, link, reward_amount, is_partner)
    VALUES (?, ?, ?, ?)
    ''', (title, link, reward_amount, is_partner))
    
    conn.commit()
    conn.close()
    return cursor.lastrowid

def remove_task(task_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE tasks SET is_active = 0 WHERE id = ?', (task_id,))
    affected = cursor.rowcount
    
    conn.commit()
    conn.close()
    return affected > 0

# Инициализация БД при первом импорте
init_db()