const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initDb() {
  const dbPath = path.join(__dirname, '../public/bot/tasks.db');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
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
  `);

  // Добавляем тестовые данные
  await db.run(`
    INSERT OR IGNORE INTO tasks VALUES 
    ('1', 'task1.png', 'Азартный Злой', '+1,000', 1000, 'https://example.com/task1', 0, 0)
  `);

  await db.close();
  console.log('Database initialized at', dbPath);
}

initDb();