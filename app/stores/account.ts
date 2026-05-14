/**
 * Account Pinia Store
 * 계좌 잔고 및 보유 종목 상태 관리
 */
import { defineStore } from 'pinia'
import type { AccountBalance, HoldingStock } from '~/types/stock'

interface AccountState {
  accountNo: string
  balance: AccountBalance | null
  holdings: HoldingStock[]
  loadingBalance: boolean
  loadingHoldings: boolean
  lastUpdated: string | null
  error: string | null
}

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    accountNo: '',
    balance: null,
    holdings: [],
    loadingBalance: false,
    loadingHoldings: false,
    lastUpdated: null,
    error: null,
  }),

  getters: {
    totalEvaluationAmount: state => state.balance?.totalEvaluationAmount ?? 0,
    totalProfitLoss: state => state.balance?.totalProfitLoss ?? 0,
    totalProfitLossRate: state => state.balance?.totalProfitLossRate ?? 0,
    holdingCount: state => state.holdings.length,
    isConfigured: state => !!state.accountNo,
  },

  actions: {
    async fetchBalance() {
      if (!this.accountNo) return
      this.loadingBalance = true
      this.error = null
      try {
        const res = await $fetch<{ success: boolean; data: AccountBalance }>(
          `/api/account/balance?accountNo=${this.accountNo}`,
        )
        if (res.success) {
          this.balance = res.data
          this.lastUpdated = new Date().toISOString()
        }
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : '잔고 조회 실패'
      }
      finally {
        this.loadingBalance = false
      }
    },

    async fetchHoldings() {
      if (!this.accountNo) return
      this.loadingHoldings = true
      try {
        const res = await $fetch<{ success: boolean; data: HoldingStock[] }>(
          `/api/account/holdings?accountNo=${this.accountNo}`,
        )
        if (res.success) {
          this.holdings = res.data
        }
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : '보유 종목 조회 실패'
      }
      finally {
        this.loadingHoldings = false
      }
    },

    async refreshAll() {
      await Promise.all([this.fetchBalance(), this.fetchHoldings()])
    },

    setAccountNo(accountNo: string) {
      this.accountNo = accountNo
      this.balance = null
      this.holdings = []
    },

    clearError() {
      this.error = null
    },
  },

  // persist: true, // 활성화하려면 @pinia-plugin-persistedstate/nuxt 모듈 설치 필요
})
