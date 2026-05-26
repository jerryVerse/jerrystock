/**
 * GET /api/trading/orders/pending
 * 미체결 주문 조회 (인증 필요)
 */
import { requireAuth } from '~~/server/utils/auth'
import { getPendingOrders } from '~~/server/services/stock.service'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const accountNo = query.accountNo as string

  if (!accountNo) {
    throw createError({ statusCode: 400, message: '계좌번호를 입력하세요.' })
  }

  const orders = await getPendingOrders(accountNo, user.id)
  return { success: true, data: orders }
})
