/**
 * POST /api/trading/order
 * 주식 주문 (매수/매도)
 */
import { z } from 'zod'
import { placeOrder } from '~~/server/services/stock.service'
import { apiSuccess } from '~~/server/utils/helpers'
import type { OrderRequest } from '~~/types/stock'

const orderSchema = z.object({
  accountNo: z.string().regex(/^\d{8}-\d{2}$/, '계좌번호 형식이 올바르지 않습니다.'),
  code: z.string().regex(/^\d{6}$/, '종목 코드는 6자리 숫자여야 합니다.'),
  side: z.enum(['BUY', 'SELL']),
  orderType: z.enum(['MARKET', 'LIMIT', 'CONDITIONAL']),
  quantity: z.number().int().positive('수량은 1 이상이어야 합니다.'),
  price: z.number().positive().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.errors[0]?.message || '요청 데이터가 올바르지 않습니다.',
    })
  }

  const req = parsed.data as OrderRequest

  // 지정가 주문 시 가격 필수
  if (req.orderType === 'LIMIT' && !req.price) {
    throw createError({ statusCode: 400, message: '지정가 주문에는 가격이 필요합니다.' })
  }

  try {
    const result = await placeOrder(req)
    if (!result.success) {
      throw createError({ statusCode: 422, message: result.message })
    }
    return apiSuccess(result)
  }
  catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    const message = err instanceof Error ? err.message : '주문 처리 실패'
    throw createError({ statusCode: 500, message })
  }
})
