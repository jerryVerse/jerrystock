/**
 * server/middleware/auth.ts
 * 모든 API 요청에서 JWT를 검증하여 event.context.user에 사용자 정보 세팅
 * - 인증 불필요 경로(/api/auth/*)는 통과
 * - 인증 필요 경로는 requireAuth()로 별도 체크
 */
import { extractToken, verifyJwt } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = extractToken(event)
  if (!token) return

  const user = await verifyJwt(token)
  if (user) {
    event.context.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  }
})
