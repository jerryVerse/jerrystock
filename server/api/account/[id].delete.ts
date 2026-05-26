/**
 * DELETE /api/account/:id
 * 증권 계좌 삭제 (본인 계좌만)
 */
import { requireAuth } from '~~/server/utils/auth'
import { db } from '~~/server/db/index'
import { brokerAccounts } from '~~/server/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: '올바르지 않은 계좌 ID입니다.' })
  }

  const deleted = await db
    .delete(brokerAccounts)
    .where(and(eq(brokerAccounts.id, id), eq(brokerAccounts.userId, user.id)))
    .returning()

  if (!deleted.length) {
    throw createError({ statusCode: 404, message: '계좌를 찾을 수 없습니다.' })
  }

  return { success: true, message: '계좌가 삭제되었습니다.' }
})
