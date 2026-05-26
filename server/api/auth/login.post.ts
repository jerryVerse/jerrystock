/**
 * POST /api/auth/login
 * 로그인
 */
import { z } from 'zod'
import { db } from '~~/server/db/index'
import { users } from '~~/server/db/schema'
import { verifyPassword, signJwt } from '~~/server/utils/auth'
import { eq } from 'drizzle-orm'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: '이메일과 비밀번호를 입력하세요.' })
  }

  const { email, password } = parsed.data

  const user = await db.select().from(users).where(eq(users.email, email)).get()
  if (!user) {
    throw createError({ statusCode: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
  }

  const token = await signJwt({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  return {
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
  }
})
