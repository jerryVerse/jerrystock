/**
 * GET /api/market/overseas
 * 해외 주요 증시 지수 (S&P 500, 나스닥, 필라델피아 반도체) 정보 반환
 */
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

export default defineEventHandler(async () => {
  try {
    const tickers = ['^GSPC', '^IXIC', '^SOX']
    const quotes = await yahooFinance.quote(tickers)
    
    const period1_30d = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const period1_1d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    
    const charts = await Promise.all([
      yahooFinance.chart('^GSPC', { period1: period1_30d, interval: '1d' }),
      yahooFinance.chart('^IXIC', { period1: period1_30d, interval: '1d' }),
      yahooFinance.chart('^SOX', { period1: period1_30d, interval: '1d' }),
      yahooFinance.chart('^GSPC', { period1: period1_1d, interval: '5m' }),
      yahooFinance.chart('^IXIC', { period1: period1_1d, interval: '5m' }),
      yahooFinance.chart('^SOX', { period1: period1_1d, interval: '5m' }),
    ])

    const sp500Hist = charts[0].quotes || []
    const nasdaqHist = charts[1].quotes || []
    const soxHist = charts[2].quotes || []
    
    const filterLastDay = (quotes: any[]) => {
      if (!quotes || quotes.length === 0) return []
      const lastDate = new Date(quotes[quotes.length - 1].date).toISOString().slice(0, 10)
      return quotes.filter(q => new Date(q.date).toISOString().slice(0, 10) === lastDate).map(q => q.close)
    }

    const sp500Hist1d = filterLastDay(charts[3].quotes)
    const nasdaqHist1d = filterLastDay(charts[4].quotes)
    const soxHist1d = filterLastDay(charts[5].quotes)

    const findQuote = (symbol: string) => quotes.find(q => q.symbol === symbol)

    const overseasData = {
      SP500: {
        price: findQuote('^GSPC')?.regularMarketPrice,
        change: findQuote('^GSPC')?.regularMarketChange,
        changePercent: findQuote('^GSPC')?.regularMarketChangePercent,
        history: sp500Hist.map(h => h.close),
        history1d: sp500Hist1d,
      },
      NASDAQ: {
        price: findQuote('^IXIC')?.regularMarketPrice,
        change: findQuote('^IXIC')?.regularMarketChange,
        changePercent: findQuote('^IXIC')?.regularMarketChangePercent,
        history: nasdaqHist.map(h => h.close),
        history1d: nasdaqHist1d,
      },
      SOX: {
        price: findQuote('^SOX')?.regularMarketPrice,
        change: findQuote('^SOX')?.regularMarketChange,
        changePercent: findQuote('^SOX')?.regularMarketChangePercent,
        history: soxHist.map(h => h.close),
        history1d: soxHist1d,
      }
    }

    return { success: true, data: overseasData }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: '해외 증시 지표를 불러오는 중 오류가 발생했습니다.',
      cause: err,
    })
  }
})
