/**
 * 인증 유틸리티
 * - JWT 발급 / 검증 (jose)
 * - 비밀번호 해시 / 검증 (bcryptjs)
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'

// ─── JWT ──────────────────────────────────────────────────────────

export interface JwtUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
}

function getJwtSecret(): Uint8Array {
  const config = useRuntimeConfig()
  return new TextEncoder().encode(config.jwtSecret || 'jstock-default-secret')
}

/** JWT 발급 (7일 유효) */
export async function signJwt(payload: JwtUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

/** JWT 검증 → 페이로드 반환 */
export async function verifyJwt(token: string): Promise<(JWTPayload & JwtUser) | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as JWTPayload & JwtUser
  }
  catch {
    return null
  }
}

/** 요청에서 JWT 추출 (Cookie 우선, 그 다음 Authorization 헤더) */
export function extractToken(event: H3Event): string | null {
  // 1) httpOnly Cookie
  const cookie = getCookie(event, 'auth_token')
  if (cookie) return cookie

  // 2) Authorization: Bearer <token>
  const header = getHeader(event, 'Authorization')
  if (header?.startsWith('Bearer ')) return header.slice(7)

  return null
}

/** 요청의 인증 사용자 반환 (미들웨어에서 세팅된 값) */
export function getAuthUser(event: H3Event): JwtUser | null {
  return event.context.user ?? null
}

/** 인증 필수 — 없으면 401 throw */
export function requireAuth(event: H3Event): JwtUser {
  const user = getAuthUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })
  }
  return user
}

// ─── 비밀번호 ─────────────────────────────────────────────────────

/** 비밀번호 해시 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

/** 비밀번호 검증 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
