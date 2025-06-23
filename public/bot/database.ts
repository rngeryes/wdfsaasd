import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, 'tasks.db');
const db = new Database(dbPath);

// Инициализация базы данных
export function initDb() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      reward TEXT NOT NULL,
      reward_amount INTEGER NOT NULL,
      completed INTEGER DEFAULT 0
    )
  `).run();

  // Тестовые данные
  const stmt = db.prepare(`
    INSERT INTO tasks (type, title, link, reward, reward_amount)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const tasks = [
    ['in-game', 'Азартный Злой', 'https://example.com/task1', '+ 1,000', 1000],
    ['in-game', 'Москва сегодня', 'https://example.com/task2', '+ 5,000', 5000],
    ['partners', 'Join Blum Channel', 'https://example.com/partner1', '+ 1,000 PAWS', 1000]
  ];

  tasks.forEach(task => stmt.run(...task));
}

// Получение задач
export function getTasks(type?: string) {
  const sql = type 
    ? 'SELECT * FROM tasks WHERE type = ?' 
    : 'SELECT * FROM tasks';
  
  const params = type ? [type] : [];
  
  return db.prepare(sql).all(...params);
}

// Обновление статуса задачи
export function updateTaskStatus(id: number, completed: boolean) {
  db.prepare(`
    UPDATE tasks SET completed = ? WHERE id = ?
  `).run(completed ? 1 : 0, id);
}

// Удаление задачи
export function deleteTask(id: number) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}