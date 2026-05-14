/**
 * 한국투자증권 Open API 서비스
 * Docs: https://apiportal.koreainvestment.com/apiservice
 */

import type { StockQuote, StockChartData, HoldingStock, AccountBalance, Order, OrderRequest, OrderResponse } from '~~/types/stock'

// ─────────────────────────────────────────────────────────────────
// Token management
// ─────────────────────────────────────────────────────────────────

interface AccessToken {
  value: string
  expiresAt: number
}

let _tokenCache: AccessToken | null = null

async function getAccessToken(): Promise<string> {
  const config = useRuntimeConfig()

  // Return cached token if still valid (5 min buffer)
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 5 * 60 * 1000) {
    return _tokenCache.value
  }

  const res = await $fetch<{ access_token: string; expires_in: number }>(
    `${config.stockApiBaseUrl}/oauth2/tokenP`,
    {
      method: 'POST',
      body: {
        grant_type: 'client_credentials',
        appkey: config.stockApiKey,
        appsecret: config.stockApiSecret,
      },
    },
  )

  _tokenCache = {
    value: res.access_token,
    expiresAt: Date.now() + res.expires_in * 1000,
  }

  return _tokenCache.value
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

async function kiRequest<T>(
  path: string,
  options: {
    tr_id: string
    params?: Record<string, string>
    body?: Record<string, unknown>
    method?: 'GET' | 'POST'
  },
): Promise<T> {
  const config = useRuntimeConfig()
  const token = await getAccessToken()
  const method = options.method ?? 'GET'

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    appkey: config.stockApiKey,
    appsecret: config.stockApiSecret,
    tr_id: options.tr_id,
    'Content-Type': 'application/json; charset=utf-8',
    custtype: 'P', // 개인
  }

  return $fetch<T>(`${config.stockApiBaseUrl}${path}`, {
    method,
    headers,
    query: method === 'GET' ? options.params : undefined,
    body: method === 'POST' ? options.body : undefined,
  })
}

// ─────────────────────────────────────────────────────────────────
// Market Data APIs
// ─────────────────────────────────────────────────────────────────

/** 주식 현재가 조회 */
export async function getStockQuote(code: string): Promise<StockQuote> {
  const raw = await kiRequest<Record<string, unknown>>('/uapi/domestic-stock/v1/quotations/inquire-price', {
    tr_id: 'FHKST01010100',
    params: {
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: code,
    },
  })

  const output = (raw.output as Record<string, string>) || {}
  return {
    code,
    name: output.hts_kor_isnm || '',
    currentPrice: Number(output.stck_prpr),
    openPrice: Number(output.stck_oprc),
    highPrice: Number(output.stck_hgpr),
    lowPrice: Number(output.stck_lwpr),
    closePrice: Number(output.stck_prpr),
    prevClosePrice: Number(output.stck_sdpr),
    priceChange: Number(output.prdy_vrss),
    priceChangeRate: Number(output.prdy_ctrt),
    volume: Number(output.acml_vol),
    tradingValue: Number(output.acml_tr_pbmn),
    timestamp: new Date().toISOString(),
  }
}

/** 주식 일봉/주봉/월봉 차트 데이터 */
export async function getStockChart(
  code: string,
  period: 'D' | 'W' | 'M' = 'D',
  startDate: string = '',
  endDate: string = '',
): Promise<StockChartData[]> {
  const today = new Date()
  const end = endDate || today.toISOString().slice(0, 10).replace(/-/g, '')
  const start = startDate || new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10).replace(/-/g, '')

  const raw = await kiRequest<Record<string, unknown>>('/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice', {
    tr_id: 'FHKST03010100',
    params: {
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: code,
      FID_INPUT_DATE_1: start,
      FID_INPUT_DATE_2: end,
      FID_PERIOD_DIV_CODE: period,
      FID_ORG_ADJ_PRC: '0',
    },
  })

  const output2 = (raw.output2 as Record<string, string>[]) || []
  return output2.map(item => ({
    date: item.stck_bsop_date,
    open: Number(item.stck_oprc),
    high: Number(item.stck_hgpr),
    low: Number(item.stck_lwpr),
    close: Number(item.stck_clpr),
    volume: Number(item.acml_vol),
  }))
}

// ─────────────────────────────────────────────────────────────────
// Account APIs
// ─────────────────────────────────────────────────────────────────

/** 계좌 잔고 조회 */
export async function getAccountBalance(accountNo: string): Promise<AccountBalance> {
  const config = useRuntimeConfig()
  const [acctNo, acctSuffix] = accountNo.split('-')

  const raw = await kiRequest<Record<string, unknown>>('/uapi/domestic-stock/v1/trading/inquire-balance', {
    tr_id: 'TTTC8434R',
    params: {
      CANO: acctNo,
      ACNT_PRDT_CD: acctSuffix || '01',
      AFHR_FLPR_YN: 'N',
      OFL_YN: '',
      INQR_DVSN: '02',
      UNPR_DVSN: '01',
      FUND_STTL_ICLD_YN: 'N',
      FNCG_AMT_AUTO_RDPT_YN: 'N',
      PRCS_DVSN: '00',
      CTX_AREA_FK100: '',
      CTX_AREA_NK100: '',
    },
  })

  const output2 = (raw.output2 as Record<string, string>[])?.[0] || {}
  return {
    accountNo,
    depositBalance: Number(output2.dnca_tot_amt || 0),
    withdrawableBalance: Number(output2.nxdy_excc_amt || 0),
    d1Balance: Number(output2.nxdy_excc_amt || 0),
    d2Balance: Number(output2.afhr_flpr_yn || 0),
    totalEvaluationAmount: Number(output2.tot_evlu_amt || 0),
    totalPurchaseAmount: Number(output2.pchs_amt_smtl_amt || 0),
    totalProfitLoss: Number(output2.evlu_pfls_smtl_amt || 0),
    totalProfitLossRate: Number(output2.asst_icdc_erng_rt || 0),
  }
}

/** 보유 종목 조회 */
export async function getHoldings(accountNo: string): Promise<HoldingStock[]> {
  const [acctNo, acctSuffix] = accountNo.split('-')

  const raw = await kiRequest<Record<string, unknown>>('/uapi/domestic-stock/v1/trading/inquire-balance', {
    tr_id: 'TTTC8434R',
    params: {
      CANO: acctNo,
      ACNT_PRDT_CD: acctSuffix || '01',
      AFHR_FLPR_YN: 'N',
      OFL_YN: '',
      INQR_DVSN: '02',
      UNPR_DVSN: '01',
      FUND_STTL_ICLD_YN: 'N',
      FNCG_AMT_AUTO_RDPT_YN: 'N',
      PRCS_DVSN: '00',
      CTX_AREA_FK100: '',
      CTX_AREA_NK100: '',
    },
  })

  const output1 = (raw.output1 as Record<string, string>[]) || []
  return output1.map(item => ({
    code: item.pdno,
    name: item.prdt_name,
    quantity: Number(item.hldg_qty),
    availableQuantity: Number(item.ord_psbl_qty),
    purchasePrice: Number(item.pchs_avg_pric),
    currentPrice: Number(item.prpr),
    evaluationAmount: Number(item.evlu_amt),
    purchaseAmount: Number(item.pchs_amt),
    profitLoss: Number(item.evlu_pfls_amt),
    profitLossRate: Number(item.evlu_pfls_rt),
  }))
}

// ─────────────────────────────────────────────────────────────────
// Order APIs
// ─────────────────────────────────────────────────────────────────

/** 주식 주문 (매수/매도) */
export async function placeOrder(req: OrderRequest): Promise<OrderResponse> {
  const [acctNo, acctSuffix] = req.accountNo.split('-')

  // tr_id: TTTC0802U (매수), TTTC0801U (매도)
  const tr_id = req.side === 'BUY' ? 'TTTC0802U' : 'TTTC0801U'

  // 주문구분: 00(지정가), 01(시장가)
  const ordDvsn = req.orderType === 'MARKET' ? '01' : '00'

  try {
    const raw = await kiRequest<Record<string, unknown>>('/uapi/domestic-stock/v1/trading/order-cash', {
      tr_id,
      method: 'POST',
      body: {
        CANO: acctNo,
        ACNT_PRDT_CD: acctSuffix || '01',
        PDNO: req.code,
        ORD_DVSN: ordDvsn,
        ORD_QTY: String(req.quantity),
        ORD_UNPR: req.orderType === 'MARKET' ? '0' : String(req.price || 0),
      },
    })

    const output = (raw.output as Record<string, string>) || {}
    return {
      success: true,
      orderId: output.odno,
      message: '주문이 성공적으로 접수되었습니다.',
    }
  }
  catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다.',
    }
  }
}

/** 미체결 주문 조회 */
export async function getPendingOrders(accountNo: string): Promise<Order[]> {
  const [acctNo, acctSuffix] = accountNo.split('-')

  const raw = await kiRequest<Record<string, unknown>>('/uapi/domestic-stock/v1/trading/inquire-psbl-rvsecncl', {
    tr_id: 'TTTC8036R',
    params: {
      CANO: acctNo,
      ACNT_PRDT_CD: acctSuffix || '01',
      CTX_AREA_FK100: '',
      CTX_AREA_NK100: '',
      INQR_DVSN_1: '',
      INQR_DVSN_2: '',
    },
  })

  const output1 = (raw.output1 as Record<string, string>[]) || []
  return output1.map(item => ({
    orderId: item.odno,
    accountNo,
    code: item.pdno,
    name: item.prdt_name,
    side: item.sll_buy_dvsn_cd === '01' ? 'SELL' : 'BUY',
    orderType: item.ord_dvsn_cd === '01' ? 'MARKET' : 'LIMIT',
    quantity: Number(item.ord_qty),
    price: Number(item.ord_unpr),
    filledQuantity: Number(item.tot_ccld_qty),
    filledPrice: Number(item.avg_prvs),
    status: 'PENDING',
    createdAt: item.ord_dt,
    updatedAt: item.ord_dt,
  }))
}
