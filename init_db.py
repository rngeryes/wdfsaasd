import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'tasks.db')

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
    
    # Добавим тестовые данные
    cursor.execute('''
    INSERT OR IGNORE INTO tasks (id, icon, title, reward, rewardAmount, link, is_partner_task)
    VALUES 
        ('1', 'task1.png', 'Азартный Злой', '+ 1,000', 1000, 'https://example.com/task1', 0),
        ('2', 'task2.png', 'Москва сегодня', '+ 5,000', 5000, 'https://example.com/task2', 0),
        ('3', 'task3.png', 'В гостях у Булыча', '+ 1,000', 1000, 'https://example.com/task3', 0),
        ('4', 'task4.png', 'Join Blum Channel', '+ 1,000 PAWS', 1000, 'https://example.com/partner1', 1)
    ''')
    
    conn.commit()
    conn.close()
    print(f"База данных инициализирована по пути: {DB_PATH}")

if __name__ == '__main__':
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    init_db()