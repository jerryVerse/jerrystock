// ============================================================
// Stock / Market Types
// ============================================================

export interface StockItem {
  code: string       // 종목 코드 (e.g. "005930")
  name: string       // 종목명 (e.g. "삼성전자")
  market: 'KOSPI' | 'KOSDAQ' | 'KONEX'
  currentPrice: number
  priceChange: number
  priceChangeRate: number
  volume: number
  tradingValue: number
  marketCap?: number
  high52w?: number
  low52w?: number
  updatedAt?: string
}

export interface StockQuote {
  code: string
  name: string
  currentPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  closePrice: number
  prevClosePrice: number
  priceChange: number
  priceChangeRate: number
  volume: number
  tradingValue: number
  timestamp: string
}

export interface StockChartData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// ============================================================
// Account Types
// ============================================================

export interface Account {
  accountNo: string
  accountName: string
  accountType: 'CMA' | 'STOCK' | 'ISA' | 'IRP'
  balance: number
  purchaseAmount: number
  evaluationAmount: number
  profitLoss: number
  profitLossRate: number
  currency: string
}

export interface AccountBalance {
  accountNo: string
  depositBalance: number     // 예수금
  withdrawableBalance: number // 출금가능금액
  d1Balance: number          // D+1 잔액
  d2Balance: number          // D+2 잔액
  totalEvaluationAmount: number // 총 평가금액
  totalPurchaseAmount: number   // 총 매입금액
  totalProfitLoss: number       // 총 손익
  totalProfitLossRate: number   // 총 손익률
}

export interface HoldingStock {
  code: string
  name: string
  quantity: number
  availableQuantity: number
  purchasePrice: number
  currentPrice: number
  evaluationAmount: number
  purchaseAmount: number
  profitLoss: number
  profitLossRate: number
  purchaseDate?: string
}

// ============================================================
// Order Types
// ============================================================

export type OrderSide = 'BUY' | 'SELL'
export type OrderType = 'MARKET' | 'LIMIT' | 'CONDITIONAL'
export type OrderStatus = 'PENDING' | 'PARTIAL' | 'FILLED' | 'CANCELLED' | 'REJECTED'

export interface Order {
  orderId: string
  accountNo: string
  code: string
  name: string
  side: OrderSide
  orderType: OrderType
  quantity: number
  price: number
  filledQuantity: number
  filledPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface OrderRequest {
  accountNo: string
  code: string
  side: OrderSide
  orderType: OrderType
  quantity: number
  price?: number   // required for LIMIT orders
}

export interface OrderResponse {
  success: boolean
  orderId?: string
  message: string
  order?: Order
}

// ============================================================
// Trade History Types
// ============================================================

export interface TradeHistory {
  tradeId: string
  orderId: string
  accountNo: string
  code: string
  name: string
  side: OrderSide
  quantity: number
  price: number
  tradingValue: number
  tradingFee: number
  tax: number
  netAmount: number
  tradedAt: string
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode?: number
}

export interface PaginatedResponse<T = unknown> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================
// Auth Types
// ============================================================

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}
