/**
 * GET /api/auth/me
 * 현재 로그인 사용자 정보
 */
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  return { success: true, data: { user } }
})
