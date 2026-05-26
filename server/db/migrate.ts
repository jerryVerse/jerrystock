/**
 * DB 마이그레이션 + 초기 admin 계정 seed
 * 실행: npm run db:migrate
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import bcrypt from 'bcryptjs'
import * as schema from './schema'

const DB_PATH = resolve(process.cwd(), 'data', 'jstock.db')
mkdirSync(resolve(process.cwd(), 'data'), { recursive: true })

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite, { schema })

// ─── 테이블 생성 (drizzle-kit 없이 직접 DDL 실행) ─────────────────
console.log('📦 Creating tables...')

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'user',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS broker_accounts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           TEXT    NOT NULL,
    account_no      TEXT    NOT NULL,
    account_suffix  TEXT    NOT NULL DEFAULT '01',
    account_type    TEXT    NOT NULL DEFAULT 'NORMAL',
    broker          TEXT    NOT NULL DEFAULT 'KIS',
    api_key         TEXT    NOT NULL,
    api_secret      TEXT    NOT NULL,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`)

console.log('✅ Tables created.')

// ─── Admin 계정 seed ──────────────────────────────────────────────
const existing = sqlite.prepare('SELECT id FROM users WHERE email = ?').get('admin@jstock.local')

if (!existing) {
  const hash = bcrypt.hashSync('admin1234!', 10)
  sqlite.prepare(`
    INSERT INTO users (email, password, name, role)
    VALUES (?, ?, ?, 'admin')
  `).run('admin@jstock.local', hash, '관리자')

  console.log('🌱 Admin account created:')
  console.log('   Email   : admin@jstock.local')
  console.log('   Password: admin1234!')
  console.log('   ⚠️  로그인 후 반드시 비밀번호를 변경하세요!')
}
else {
  console.log('ℹ️  Admin account already exists, skipping seed.')
}

console.log('\n🎉 Migration complete! DB path:', DB_PATH)
sqlite.close()
