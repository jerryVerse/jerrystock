/**
 * 한국투자증권 Open API 서비스
 * Docs: https://apiportal.koreainvestment.com/apiservice
 *
 * 지원 계좌:
 *   - 일반 계좌 : 68786746-01
 *   - ISA 계좌  : 63331990-01
 */

import type {
  StockQuote,
  StockChartData,
  HoldingStock,
  AccountBalance,
  Order,
  OrderRequest,
  OrderResponse,
} from '~~/types/stock'

// ─────────────────────────────────────────────────────────────────
// 계좌 자격증명 타입
// ─────────────────────────────────────────────────────────────────

interface AccountCredential {
  accountNo: string    // e.g. "68786746"
  suffix: string       // e.g. "01"
  apiKey: string
  apiSecret: string
}

interface AccessToken {
  value: string
  expiresAt: number
}

// 계좌별 토큰 캐시
const _tokenCache = new Map<string, AccessToken>()

// ─────────────────────────────────────────────────────────────────
// 계좌번호로 자격증명 선택
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// DB에서 계좌 자격증명 조회
// ─────────────────────────────────────────────────────────────────

export async function resolveCredential(
  accountNo: string,
  userId: number,
): Promise<AccountCredential> {
  const { db } = await import('~~/server/db/index')
  const { brokerAccounts } = await import('~~/server/db/schema')
  const { eq, and } = await import('drizzle-orm')

  // "68786746-01" 또는 "68786746" 형식 모두 허용
  const baseNo = accountNo.split('-')[0]

  const account = await db
    .select()
    .from(brokerAccounts)
    .where(
      and(
        eq(brokerAccounts.accountNo, baseNo),
        eq(brokerAccounts.userId, userId),
        eq(brokerAccounts.isActive, true),
      ),
    )
    .get()

  if (!account) {
    throw createError({
      statusCode: 403,
      message: `접근 권한이 없거나 등록되지 않은 계좌입니다: ${accountNo}`,
    })
  }

  return {
    accountNo: account.accountNo,
    suffix: account.accountSuffix,
    apiKey: account.apiKey,
    apiSecret: account.apiSecret,
  }
}

// ─────────────────────────────────────────────────────────────────
// OAuth2 Token 발급 (계좌별 캐싱)
// ─────────────────────────────────────────────────────────────────

async function getAccessToken(cred: AccountCredential): Promise<string> {
  const config = useRuntimeConfig()
  const cacheKey = cred.accountNo

  const cached = _tokenCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt - 5 * 60 * 1000) {
    return cached.value
  }

  const res = await $fetch<{ access_token: string; expires_in: number }>(
    `${config.stockApiBaseUrl}/oauth2/tokenP`,
    {
      method: 'POST',
      body: {
        grant_type: 'client_credentials',
        appkey: cred.apiKey,
        appsecret: cred.apiSecret,
      },
    },
  )

  _tokenCache.set(cacheKey, {
    value: res.access_token,
    expiresAt: Date.now() + res.expires_in * 1000,
  })

  return res.access_token
}

// ─────────────────────────────────────────────────────────────────
// 공통 API 요청
// ─────────────────────────────────────────────────────────────────

async function kiRequest<T>(
  path: string,
  options: {
    tr_id: string
    cred: AccountCredential
    params?: Record<string, string>
    body?: Record<string, unknown>
    method?: 'GET' | 'POST'
  },
): Promise<T> {
  const config = useRuntimeConfig()
  const token = await getAccessToken(options.cred)
  const method = options.method ?? 'GET'

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    appkey: options.cred.apiKey,
    appsecret: options.cred.apiSecret,
    tr_id: options.tr_id,
    'Content-Type': 'application/json; charset=utf-8',
    custtype: 'P',
  }

  return $fetch<T>(`${config.stockApiBaseUrl}${path}`, {
    method,
    headers,
    query: method === 'GET' ? options.params : undefined,
    body: method === 'POST' ? options.body : undefined,
  })
}

// ─────────────────────────────────────────────────────────────────
// Market Data APIs (시세는 계좌 무관 → 일반 계좌 키 사용)
// ─────────────────────────────────────────────────────────────────

function getDefaultCred(): AccountCredential {
  const config = useRuntimeConfig()
  return {
    accountNo: config.accountNormalNo,
    suffix: config.accountNormalSuffix,
    apiKey: config.accountNormalApiKey,
    apiSecret: config.accountNormalApiSecret,
  }
}

/** 주식 현재가 조회 */
export async function getStockQuote(code: string): Promise<StockQuote> {
  const cred = getDefaultCred()
  const raw = await kiRequest<Record<string, unknown>>(
    '/uapi/domestic-stock/v1/quotations/inquire-price',
    {
      tr_id: 'FHKST01010100',
      cred,
      params: {
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: code,
      },
    },
  )

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
  startDate = '',
  endDate = '',
): Promise<StockChartData[]> {
  const cred = getDefaultCred()
  const today = new Date()
  const end = endDate || today.toISOString().slice(0, 10).replace(/-/g, '')
  const start = startDate
    || new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10).replace(/-/g, '')

  const raw = await kiRequest<Record<string, unknown>>(
    '/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice',
    {
      tr_id: 'FHKST03010100',
      cred,
      params: {
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: code,
        FID_INPUT_DATE_1: start,
        FID_INPUT_DATE_2: end,
        FID_PERIOD_DIV_CODE: period,
        FID_ORG_ADJ_PRC: '0',
      },
    },
  )

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
// Account APIs (계좌번호로 API Key 자동 선택)
// ─────────────────────────────────────────────────────────────────

/** 계좌 잔고 조회 */
export async function getAccountBalance(accountNo: string, userId: number): Promise<AccountBalance> {
  const cred = await resolveCredential(accountNo, userId)

  const raw = await kiRequest<Record<string, unknown>>(
    '/uapi/domestic-stock/v1/trading/inquire-balance',
    {
      tr_id: 'TTTC8434R',
      cred,
      params: {
        CANO: cred.accountNo,
        ACNT_PRDT_CD: cred.suffix,
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
    },
  )

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
export async function getHoldings(accountNo: string, userId: number): Promise<HoldingStock[]> {
  const cred = await resolveCredential(accountNo, userId)

  const raw = await kiRequest<Record<string, unknown>>(
    '/uapi/domestic-stock/v1/trading/inquire-balance',
    {
      tr_id: 'TTTC8434R',
      cred,
      params: {
        CANO: cred.accountNo,
        ACNT_PRDT_CD: cred.suffix,
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
    },
  )

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
export async function placeOrder(req: OrderRequest, userId: number): Promise<OrderResponse> {
  const cred = await resolveCredential(req.accountNo, userId)

  // tr_id: TTTC0802U (매수), TTTC0801U (매도)
  const tr_id = req.side === 'BUY' ? 'TTTC0802U' : 'TTTC0801U'
  const ordDvsn = req.orderType === 'MARKET' ? '01' : '00'

  try {
    const raw = await kiRequest<Record<string, unknown>>(
      '/uapi/domestic-stock/v1/trading/order-cash',
      {
        tr_id,
        cred,
        method: 'POST',
        body: {
          CANO: cred.accountNo,
          ACNT_PRDT_CD: cred.suffix,
          PDNO: req.code,
          ORD_DVSN: ordDvsn,
          ORD_QTY: String(req.quantity),
          ORD_UNPR: req.orderType === 'MARKET' ? '0' : String(req.price || 0),
        },
      },
    )

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
export async function getPendingOrders(accountNo: string, userId: number): Promise<Order[]> {
  const cred = await resolveCredential(accountNo, userId)

  const raw = await kiRequest<Record<string, unknown>>(
    '/uapi/domestic-stock/v1/trading/inquire-psbl-rvsecncl',
    {
      tr_id: 'TTTC8036R',
      cred,
      params: {
        CANO: cred.accountNo,
        ACNT_PRDT_CD: cred.suffix,
        CTX_AREA_FK100: '',
        CTX_AREA_NK100: '',
        INQR_DVSN_1: '',
        INQR_DVSN_2: '',
      },
    },
  )

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
