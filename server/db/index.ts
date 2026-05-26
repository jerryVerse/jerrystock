/**
 * Drizzle ORM + better-sqlite3 연결
 * Nitro 서버에서 싱글톤으로 사용
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { resolve } from 'node:path'
import * as schema from './schema'

const DB_PATH = resolve(process.cwd(), 'data', 'jstock.db')

// 데이터 디렉토리 자동 생성
import { mkdirSync } from 'node:fs'
mkdirSync(resolve(process.cwd(), 'data'), { recursive: true })

const sqlite = new Database(DB_PATH)

// WAL 모드로 성능 향상
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export type DB = typeof db
