/**
 * GET /api/market/domestic
 * 코스피, 코스닥 지수 및 수급 정보 반환
 */
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance()

export default defineEventHandler(async () => {
  try {
    const tickers = ['^KS11', '^KQ11']
    const quotes = await yahooFinance.quote(tickers)
    
    // 최근 40일(영업일 기준 약 30일) 데이터 조회
    const period1_30d = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    // 최근 3일(1일 차트 보장) 5분봉 데이터 조회
    const period1_1d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    
    const [kospiChart, kosdaqChart, kospiChart1d, kosdaqChart1d] = await Promise.all([
      yahooFinance.chart('^KS11', { period1: period1_30d, interval: '1d' }),
      yahooFinance.chart('^KQ11', { period1: period1_30d, interval: '1d' }),
      yahooFinance.chart('^KS11', { period1: period1_1d, interval: '5m' }),
      yahooFinance.chart('^KQ11', { period1: period1_1d, interval: '5m' }),
    ])

    const kospiHist = kospiChart.quotes || []
    const kosdaqHist = kosdaqChart.quotes || []
    
    // 5분봉에서 가장 최근 날짜의 데이터만 필터링
    const filterLastDay = (quotes: any[]) => {
      if (!quotes || quotes.length === 0) return []
      const lastDate = new Date(quotes[quotes.length - 1].date).toISOString().slice(0, 10)
      return quotes.filter(q => new Date(q.date).toISOString().slice(0, 10) === lastDate).map(q => q.close)
    }
    const kospiHist1d = filterLastDay(kospiChart1d.quotes)
    const kosdaqHist1d = filterLastDay(kosdaqChart1d.quotes)

    // Naver Finance 수급 크롤링
    const supplyDemand = {
      KOSPI: { individual: '-', foreign: '-', institutional: '-' },
      KOSDAQ: { individual: '-', foreign: '-', institutional: '-' },
    }
    
    try {
      const buf = await $fetch<ArrayBuffer>('https://finance.naver.com/', { responseType: 'arrayBuffer' })
      const html = new TextDecoder('euc-kr').decode(buf)
      
      const parseSupplyDemand = (htmlBlock: string) => {
        const getVal = (name: string) => {
          const regex = new RegExp(`${name}<\\/a><\\/dt>\\s*<dd[^>]*><a[^>]*>([^<]+)<\\/a>`)
          const m = htmlBlock.match(regex)
          return m ? m[1].trim() : '-'
        }
        return {
          individual: getVal('개인'),
          foreign: getVal('외국인'),
          institutional: getVal('기관')
        }
      }

      const kospiMatch = html.match(/class="kospi_area[^>]*"([\s\S]*?)class="kosdaq_area/)
      if (kospiMatch) {
        supplyDemand.KOSPI = parseSupplyDemand(kospiMatch[1])
      }
      
      const kosdaqMatch = html.match(/class="kosdaq_area[^>]*"([\s\S]*?)class="kpi_b"/)
      if (kosdaqMatch) {
        supplyDemand.KOSDAQ = parseSupplyDemand(kosdaqMatch[1])
      } else {
        const kosdaqHtml = html.split('class="kosdaq_area')[1]
        if (kosdaqHtml) {
          supplyDemand.KOSDAQ = parseSupplyDemand(kosdaqHtml)
        }
      }
    } catch(e) {
      console.error('Naver scraping failed:', e)
    }

    const domesticData = {
      KOSPI: {
        price: quotes.find(q => q.symbol === '^KS11')?.regularMarketPrice,
        change: quotes.find(q => q.symbol === '^KS11')?.regularMarketChange,
        changePercent: quotes.find(q => q.symbol === '^KS11')?.regularMarketChangePercent,
        history: kospiHist.map(h => h.close),
        history1d: kospiHist1d,
        supply: supplyDemand.KOSPI,
      },
      KOSDAQ: {
        price: quotes.find(q => q.symbol === '^KQ11')?.regularMarketPrice,
        change: quotes.find(q => q.symbol === '^KQ11')?.regularMarketChange,
        changePercent: quotes.find(q => q.symbol === '^KQ11')?.regularMarketChangePercent,
        history: kosdaqHist.map(h => h.close),
        history1d: kosdaqHist1d,
        supply: supplyDemand.KOSDAQ,
      }
    }

    return { success: true, data: domesticData }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: '국내 증시 지표를 불러오는 중 오류가 발생했습니다.',
      cause: err,
    })
  }
})
