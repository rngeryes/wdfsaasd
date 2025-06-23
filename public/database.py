# database.py
import sqlite3
from typing import List, Dict, Any

def init_db():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    # Создаем таблицу для заданий
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        icon_path TEXT NOT NULL,
        reward TEXT NOT NULL,
        reward_amount INTEGER NOT NULL,
        is_partner_task BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Создаем таблицу для администраторов
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admins (
        user_id INTEGER PRIMARY KEY,
        username TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def add_task(task_data: Dict[str, Any]):
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO tasks (title, link, icon_path, reward, reward_amount, is_partner_task)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        task_data['title'],
        task_data['link'],
        task_data['icon_path'],
        task_data['reward'],
        task_data['reward_amount'],
        task_data.get('is_partner_task', False)
    ))
    
    conn.commit()
    conn.close()

def get_all_tasks(is_partner: bool = False) -> List[Dict[str, Any]]:
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id, title, link, icon_path, reward, reward_amount 
    FROM tasks 
    WHERE is_partner_task = ?
    ORDER BY created_at DESC
    ''', (is_partner,))
    
    tasks = []
    for row in cursor.fetchall():
        tasks.append({
            'id': row[0],
            'title': row[1],
            'link': row[2],
            'icon_path': row[3],
            'reward': row[4],
            'reward_amount': row[5]
        })
    
    conn.close()
    return tasks

def delete_task(task_id: int):
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    
    conn.commit()
    conn.close()

def is_admin(user_id: int) -> bool:
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT 1 FROM admins WHERE user_id = ?', (user_id,))
    result = cursor.fetchone() is not None
    
    conn.close()
    return result

def add_admin(user_id: int, username: str):
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT OR IGNORE INTO admins (user_id, username)
    VALUES (?, ?)
    ''', (user_id, username))
    
    conn.commit()
    conn.close()

# Инициализируем базу данных при импорте
init_db()