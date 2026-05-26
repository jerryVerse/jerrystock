/**
 * GET /api/account/balance
 * 계좌 잔고 조회 (인증 필요)
 */
import { requireAuth } from '~~/server/utils/auth'
import { getAccountBalance } from '~~/server/services/stock.service'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const accountNo = query.accountNo as string

  if (!accountNo) {
    throw createError({ statusCode: 400, message: '계좌번호를 입력하세요.' })
  }

  const balance = await getAccountBalance(accountNo, user.id)
  return { success: true, data: balance }
})
