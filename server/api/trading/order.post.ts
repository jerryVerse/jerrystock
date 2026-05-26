/**
 * POST /api/trading/order
 * 주식 주문 (인증 필요)
 */
import { z } from 'zod'
import { requireAuth } from '~~/server/utils/auth'
import { placeOrder } from '~~/server/services/stock.service'
import type { OrderRequest } from '~~/types/stock'

const orderSchema = z.object({
  accountNo: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, '종목 코드는 6자리 숫자여야 합니다.'),
  side: z.enum(['BUY', 'SELL']),
  orderType: z.enum(['MARKET', 'LIMIT', 'CONDITIONAL']),
  quantity: z.number().int().positive('수량은 1 이상이어야 합니다.'),
  price: z.number().positive().optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0]?.message })
  }

  const req = parsed.data as OrderRequest
  if (req.orderType === 'LIMIT' && !req.price) {
    throw createError({ statusCode: 400, message: '지정가 주문에는 가격이 필요합니다.' })
  }

  const result = await placeOrder(req, user.id)
  if (!result.success) {
    throw createError({ statusCode: 422, message: result.message })
  }
  return { success: true, data: result }
})
