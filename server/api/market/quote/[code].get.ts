/**
 * GET /api/market/quote/:code
 * 주식 현재가 조회
 */
import { getStockQuote } from '~~/server/services/stock.service'
import { apiSuccess, apiError, isValidStockCode } from '~~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  if (!code || !isValidStockCode(code)) {
    throw createError({ statusCode: 400, message: '유효하지 않은 종목 코드입니다. (6자리 숫자)' })
  }

  try {
    const quote = await getStockQuote(code)
    return apiSuccess(quote)
  }
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : '시세 조회 실패'
    throw createError({ statusCode: 500, message: apiError(message).error })
  }
})
