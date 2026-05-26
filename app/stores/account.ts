/**
 * Account Pinia Store
 * 계좌 잔고 및 보유 종목 상태 관리
 */
import { defineStore } from 'pinia'
import type { AccountBalance, HoldingStock } from '~/types/stock'

interface RegisteredAccount {
  id: number
  accountNo: string
  label: string
  type: 'NORMAL' | 'ISA'
}

interface AccountState {
  registeredAccounts: RegisteredAccount[]
  accountNo: string
  balance: AccountBalance | null
  holdings: HoldingStock[]
  loadingAccounts: boolean
  loadingBalance: boolean
  loadingHoldings: boolean
  lastUpdated: string | null
  error: string | null
}

export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    registeredAccounts: [],
    accountNo: '',
    balance: null,
    holdings: [],
    loadingAccounts: false,
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
    currentAccountLabel: (state) => {
      const found = state.registeredAccounts.find(a => a.accountNo === state.accountNo)
      return found?.label ?? state.accountNo
    },
  },

  actions: {
    /** 서버에 등록된 계좌 목록 불러오기 */
    async fetchRegisteredAccounts() {
      this.loadingAccounts = true
      try {
        const res = await $fetch<{ success: boolean; data: RegisteredAccount[] }>('/api/account/list')
        if (res.success) {
          this.registeredAccounts = res.data
          // 첫 계좌를 기본값으로 자동 선택
          if (!this.accountNo && res.data.length > 0) {
            this.accountNo = res.data[0].accountNo
          }
        }
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : '계좌 목록 조회 실패'
      }
      finally {
        this.loadingAccounts = false
      }
    },

    async deleteAccount(id: number) {
      try {
        await $fetch(`/api/account/${id}`, { method: 'DELETE' })
        await this.fetchRegisteredAccounts()
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : '계좌 삭제 실패'
        throw err
      }
    },

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
})
