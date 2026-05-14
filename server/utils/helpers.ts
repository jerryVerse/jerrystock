/**
 * Server-side utility functions
 */

import type { H3Event } from 'h3'
import type { ApiResponse } from '~/types/stock'

/** Standardized success response */
export function apiSuccess<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message }
}

/** Standardized error response */
export function apiError(message: string, statusCode = 500): ApiResponse {
  return { success: false, error: message, statusCode }
}

/** Extract and validate Bearer token from request */
export function extractBearerToken(event: H3Event): string | null {
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

/** Format number as Korean won */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

/** Format percentage */
export function formatPercent(rate: number): string {
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}

/** Validate stock code (6 digits) */
export function isValidStockCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/** Validate account number format */
export function isValidAccountNo(accountNo: string): boolean {
  return /^\d{8}-\d{2}$/.test(accountNo)
}

/** Get YYYYMMDD string for today */
export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

/** Sleep for n milliseconds (for rate limiting) */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
