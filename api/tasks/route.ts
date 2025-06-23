import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'bot/tasks.db');

export async function GET() {
  let db;
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Проверка соединения с БД
    await db.get('SELECT 1');

    const inGameTasks = await db.all(
      'SELECT id, title, link, reward_amount FROM tasks WHERE is_partner = 0 AND is_active = 1'
    );

    const partnerTasks = await db.all(
      'SELECT id, title, link, reward_amount FROM tasks WHERE is_partner = 1 AND is_active = 1'
    );

    return NextResponse.json({
      inGameTasks: inGameTasks || [],
      partnerTasks: partnerTasks || []
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      inGameTasks: [],
      partnerTasks: [],
      error: 'Database connection failed'
    }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}