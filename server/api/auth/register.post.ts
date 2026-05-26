/**
 * POST /api/auth/register
 * 회원가입
 */
import { z } from 'zod'
import { db } from '~~/server/db/index'
import { users } from '~~/server/db/schema'
import { hashPassword, signJwt } from '~~/server/utils/auth'
import { eq } from 'drizzle-orm'

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(1, '이름을 입력하세요.'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0]?.message })
  }

  const { email, password, name } = parsed.data

  // 이메일 중복 확인
  const existing = await db.select().from(users).where(eq(users.email, email)).get()
  if (existing) {
    throw createError({ statusCode: 409, message: '이미 사용 중인 이메일입니다.' })
  }

  const hashedPw = await hashPassword(password)

  const [newUser] = await db.insert(users).values({
    email,
    password: hashedPw,
    name,
    role: 'user',
  }).returning({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
  })

  const token = await signJwt({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: '/',
    sameSite: 'lax',
  })

  return { success: true, data: { user: newUser } }
})
