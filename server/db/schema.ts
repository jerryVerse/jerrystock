/**
 * Drizzle ORM 스키마 정의
 * - users: 사용자 테이블
 * - brokerAccounts: 증권 계좌 테이블
 */
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ─── users ────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),   // bcrypt hash
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── broker_accounts ──────────────────────────────────────────────
export const brokerAccounts = sqliteTable('broker_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),                      // "일반 계좌", "ISA" 등 사용자 별칭
  accountNo: text('account_no').notNull(),             // "68786746"
  accountSuffix: text('account_suffix').notNull().default('01'),
  accountType: text('account_type', {
    enum: ['NORMAL', 'ISA', 'IRP', 'CMA'],
  }).notNull().default('NORMAL'),
  broker: text('broker').notNull().default('KIS'),     // 한국투자증권
  apiKey: text('api_key').notNull(),
  apiSecret: text('api_secret').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

// ─── TypeScript 타입 추론 ──────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type BrokerAccount = typeof brokerAccounts.$inferSelect
export type NewBrokerAccount = typeof brokerAccounts.$inferInsert
