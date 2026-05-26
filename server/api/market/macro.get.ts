/**
 * GET /api/market/macro
 * 원달러 환율, 미국채 10년물 금리, WTI 유가 등의 거시경제 지표 반환
 */
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

export default defineEventHandler(async () => {
  try {
    // Tickers:
    // USDKRW=X : USD/KRW 환율
    // ^TNX : CBOE Interest Rate 10-Year T-No (미국채 10년물)
    // CL=F : Crude Oil WTI (NYMEX)
    const tickers = ['USDKRW=X', '^TNX', 'CL=F']
    const quotes = await yahooFinance.quote(tickers)

    const macroData = {
      exchangeRate: null,
      usTreasury10y: null,
      wtiOil: null,
    }

    quotes.forEach((q) => {
      const data = {
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        symbol: q.symbol,
      }

      if (q.symbol === 'USDKRW=X') macroData.exchangeRate = data
      else if (q.symbol === '^TNX') macroData.usTreasury10y = data
      else if (q.symbol === 'CL=F') macroData.wtiOil = data
    })

    return { success: true, data: macroData }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: '매크로 지표 데이터를 불러오는 중 오류가 발생했습니다.',
      cause: err,
    })
  }
})
