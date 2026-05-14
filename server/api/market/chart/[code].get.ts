/**
 * GET /api/market/chart/:code
 * 주식 차트 데이터 조회
 * Query: ?period=D|W|M&startDate=YYYYMMDD&endDate=YYYYMMDD
 */
import { getStockChart } from '~~/server/services/stock.service'
import { apiSuccess, isValidStockCode } from '~~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  const query = getQuery(event)

  if (!code || !isValidStockCode(code)) {
    throw createError({ statusCode: 400, message: '유효하지 않은 종목 코드입니다.' })
  }

  const period = (query.period as 'D' | 'W' | 'M') || 'D'
  const startDate = (query.startDate as string) || ''
  const endDate = (query.endDate as string) || ''

  if (!['D', 'W', 'M'].includes(period)) {
    throw createError({ statusCode: 400, message: 'period는 D, W, M 중 하나여야 합니다.' })
  }

  try {
    const chartData = await getStockChart(code, period, startDate, endDate)
    return apiSuccess(chartData)
  }
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : '차트 데이터 조회 실패'
    throw createError({ statusCode: 500, message })
  }
})
