import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / 'tasks.db'

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            link TEXT NOT NULL,
            reward_amount INTEGER NOT NULL,
            is_partner BOOLEAN NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT 1
        )
        ''')

def get_tasks(is_partner=False):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        SELECT id, title, link, reward_amount, is_partner 
        FROM tasks WHERE is_partner = ? AND is_active = 1
        ''', (is_partner,))
        return [dict(zip(['id', 'title', 'link', 'reward_amount', 'is_partner'], row)) for row in cursor.fetchall()]

def add_task(title, link, reward_amount, is_partner=False):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO tasks (title, link, reward_amount, is_partner)
        VALUES (?, ?, ?, ?)
        ''', (title, link, reward_amount, is_partner))
        return cursor.lastrowid

def remove_task(task_id):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE tasks SET is_active = 0 WHERE id = ?', (task_id,))
        return cursor.rowcount > 0

init_db()