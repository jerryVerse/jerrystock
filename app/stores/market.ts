/**
 * Market Pinia Store
 * 시세 데이터 및 관심 종목 상태 관리
 */
import { defineStore } from 'pinia'
import type { StockQuote } from '~/types/stock'

interface WatchlistItem {
  code: string
  name: string
  addedAt: string
}

interface MarketState {
  quotes: Record<string, StockQuote>   // code -> quote
  watchlist: WatchlistItem[]
  loading: Record<string, boolean>
}

export const useMarketStore = defineStore('market', {
  state: (): MarketState => ({
    quotes: {},
    watchlist: [],
    loading: {},
  }),

  getters: {
    getQuote: state => (code: string) => state.quotes[code] ?? null,
    isLoading: state => (code: string) => state.loading[code] ?? false,
    watchlistWithQuotes: (state) => {
      return state.watchlist.map(item => ({
        ...item,
        quote: state.quotes[item.code] ?? null,
      }))
    },
  },

  actions: {
    async fetchQuote(code: string) {
      this.loading[code] = true
      try {
        const res = await $fetch<{ success: boolean; data: StockQuote }>(`/api/market/quote/${code}`)
        if (res.success) {
          this.quotes[code] = res.data
        }
        return res.data
      }
      catch {
        return null
      }
      finally {
        this.loading[code] = false
      }
    },

    async refreshWatchlist() {
      await Promise.all(this.watchlist.map(item => this.fetchQuote(item.code)))
    },

    addToWatchlist(code: string, name: string) {
      if (this.watchlist.find(w => w.code === code)) return
      this.watchlist.push({ code, name, addedAt: new Date().toISOString() })
    },

    removeFromWatchlist(code: string) {
      this.watchlist = this.watchlist.filter(w => w.code !== code)
    },
  },

  // persist: true, // 활성화하려면 @pinia-plugin-persistedstate/nuxt 모듈 설치 필요
})
