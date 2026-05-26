/**
 * GET /api/accounts/balance
 * 로그인한 사용자의 모든 증권 계좌 잔고를 조회하고 합산하여 반환
 */
import { requireAuth } from '~~/server/utils/auth'
import { db } from '~~/server/db/index'
import { brokerAccounts } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getAccountBalance } from '~~/server/services/stock.service'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const accounts = await db
    .select({
      id: brokerAccounts.id,
      label: brokerAccounts.label,
      accountNo: brokerAccounts.accountNo,
      accountSuffix: brokerAccounts.accountSuffix,
    })
    .from(brokerAccounts)
    .where(eq(brokerAccounts.userId, user.id))

  const summary = {
    totalEvaluationAmount: 0,
    depositBalance: 0,
    totalPurchaseAmount: 0,
    totalProfitLoss: 0,
    totalProfitLossRate: 0,
  }

  const accountDetails = []

  for (const acc of accounts) {
    const fullAccountNo = `${acc.accountNo}-${acc.accountSuffix}`
    try {
      const balance = await getAccountBalance(fullAccountNo, user.id)
      
      summary.totalEvaluationAmount += balance.totalEvaluationAmount
      summary.depositBalance += balance.depositBalance
      summary.totalPurchaseAmount += balance.totalPurchaseAmount
      summary.totalProfitLoss += balance.totalProfitLoss

      accountDetails.push({
        id: acc.id,
        label: acc.label,
        accountNo: fullAccountNo,
        balance,
      })
    } catch (err: any) {
      console.error(`Failed to fetch balance for ${fullAccountNo}:`, err.message)
      // 잔고 조회 실패 시 기본값으로 처리
      accountDetails.push({
        id: acc.id,
        label: acc.label,
        accountNo: fullAccountNo,
        balance: {
          accountNo: fullAccountNo,
          depositBalance: 0,
          withdrawableBalance: 0,
          d1Balance: 0,
          d2Balance: 0,
          totalEvaluationAmount: 0,
          totalPurchaseAmount: 0,
          totalProfitLoss: 0,
          totalProfitLossRate: 0,
        },
        error: true,
      })
    }
  }

  // 전체 수익률 계산: (총 손익 / 총 매입금) * 100
  if (summary.totalPurchaseAmount > 0) {
    summary.totalProfitLossRate = (summary.totalProfitLoss / summary.totalPurchaseAmount) * 100
  }

  return { success: true, data: { summary, accounts: accountDetails } }
})
