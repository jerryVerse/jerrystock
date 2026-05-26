/**
 * GET /api/account/list
 * 로그인한 사용자의 증권 계좌 목록 조회
 */
import { requireAuth } from '~~/server/utils/auth'
import { db } from '~~/server/db/index'
import { brokerAccounts } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const accounts = await db
    .select({
      id: brokerAccounts.id,
      label: brokerAccounts.label,
      accountNo: brokerAccounts.accountNo,
      accountSuffix: brokerAccounts.accountSuffix,
      accountType: brokerAccounts.accountType,
      broker: brokerAccounts.broker,
      isActive: brokerAccounts.isActive,
      createdAt: brokerAccounts.createdAt,
    })
    .from(brokerAccounts)
    .where(eq(brokerAccounts.userId, user.id))

  // 프론트 드롭다운용 형식으로 변환
  const result = accounts.map(a => ({
    id: a.id,
    accountNo: `${a.accountNo}-${a.accountSuffix}`,
    label: a.label,
    type: a.accountType,
    broker: a.broker,
    isActive: a.isActive,
  }))

  return { success: true, data: result }
})
