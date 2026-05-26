/**
 * POST /api/account/create
 * 증권 계좌 등록
 */
import { z } from 'zod'
import { requireAuth } from '~~/server/utils/auth'
import { db } from '~~/server/db/index'
import { brokerAccounts } from '~~/server/db/schema'

const schema = z.object({
  label: z.string().min(1, '계좌 별칭을 입력하세요.'),
  accountNo: z.string().regex(/^\d{6,10}$/, '계좌번호를 확인하세요.'),
  accountSuffix: z.string().default('01'),
  accountType: z.enum(['NORMAL', 'ISA', 'IRP', 'CMA']).default('NORMAL'),
  broker: z.string().default('KIS'),
  apiKey: z.string().min(1, 'API Key를 입력하세요.'),
  apiSecret: z.string().min(1, 'API Secret을 입력하세요.'),
})

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0]?.message })
  }

  const [account] = await db.insert(brokerAccounts).values({
    userId: user.id,
    ...parsed.data,
  }).returning()

  return { success: true, data: account }
})
