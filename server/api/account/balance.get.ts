/**
 * GET /api/account/balance
 * 계좌 잔고 조회
 * Query: ?accountNo=12345678-01
 */
import { getAccountBalance } from '~~/server/services/stock.service'
import { apiSuccess, isValidAccountNo } from '~~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const accountNo = query.accountNo as string

  if (!accountNo || !isValidAccountNo(accountNo)) {
    throw createError({
      statusCode: 400,
      message: '계좌번호 형식이 올바르지 않습니다. (예: 12345678-01)',
    })
  }

  try {
    const balance = await getAccountBalance(accountNo)
    return apiSuccess(balance)
  }
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : '잔고 조회 실패'
    throw createError({ statusCode: 500, message })
  }
})
