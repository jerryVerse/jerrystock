<template>
  <NuxtLayout>
    <div class="market-page fade-in">
      <!-- Search Bar -->
      <div class="search-section card">
        <div class="search-row">
          <input
            v-model="searchCode"
            class="input"
            placeholder="종목 코드 또는 이름 입력 (예: 005930, 삼성전자)"
            @keyup.enter="searchStock"
          />
          <button class="btn btn-primary" :disabled="loading" @click="searchStock">
            <span v-if="loading" class="spinner" style="width:16px;height:16px;" />
            <span>조회</span>
          </button>
        </div>
      </div>

      <!-- Quote Result -->
      <div v-if="quote" class="card quote-card fade-in">
        <div class="quote-header">
          <div>
            <h2 class="text-xl font-bold">{{ quote.name }}</h2>
            <span class="text-muted text-mono">{{ quote.code }}</span>
          </div>
          <div class="quote-price-block">
            <div class="quote-price text-mono text-2xl font-bold">
              {{ quote.currentPrice.toLocaleString() }}원
            </div>
            <div class="quote-change" :class="quote.priceChange >= 0 ? 'text-rise' : 'text-fall'">
              {{ quote.priceChange >= 0 ? '▲' : '▼' }}
              {{ Math.abs(quote.priceChange).toLocaleString() }}
              ({{ formatPercent(quote.priceChangeRate) }})
            </div>
          </div>
        </div>

        <div class="divider" />

        <div class="quote-details">
          <div class="detail-item">
            <span class="text-muted text-sm">시가</span>
            <span class="text-mono">{{ quote.openPrice.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span class="text-muted text-sm">고가</span>
            <span class="text-mono text-rise">{{ quote.highPrice.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span class="text-muted text-sm">저가</span>
            <span class="text-mono text-fall">{{ quote.lowPrice.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span class="text-muted text-sm">전일 종가</span>
            <span class="text-mono">{{ quote.prevClosePrice.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span class="text-muted text-sm">거래량</span>
            <span class="text-mono">{{ quote.volume.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span class="text-muted text-sm">거래대금</span>
            <span class="text-mono">{{ (quote.tradingValue / 100_000_000).toFixed(0) }}억</span>
          </div>
        </div>

        <div class="quote-actions">
          <button class="btn btn-rise" @click="goToOrder('BUY')">매수 주문</button>
          <button class="btn btn-fall" @click="goToOrder('SELL')">매도 주문</button>
        </div>
      </div>

      <div v-if="error" class="card error-card">
        <span class="text-fall">⚠️ {{ error }}</span>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { StockQuote } from '~/types/stock'

useHead({ title: '시장 현황 | JStock' })

const router = useRouter()
const searchCode = ref('')
const loading = ref(false)
const quote = ref<StockQuote | null>(null)
const error = ref('')

function formatPercent(rate: number) {
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}

async function searchStock() {
  if (!searchCode.value.trim()) return
  loading.value = true
  error.value = ''
  quote.value = null

  try {
    const res = await $fetch<{ success: boolean; data: StockQuote }>(`/api/market/quote/${searchCode.value.trim()}`)
    if (res.success) {
      quote.value = res.data
    }
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '시세 조회에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}

function goToOrder(side: 'BUY' | 'SELL') {
  router.push({ path: '/trading', query: { code: quote.value?.code, side } })
}
</script>

<style scoped>
.market-page { display: flex; flex-direction: column; gap: var(--space-6); }

.search-row {
  display: flex;
  gap: var(--space-3);
}

.quote-card {}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.quote-price-block { text-align: right; }
.quote-change { font-size: 1rem; font-weight: 500; margin-top: var(--space-1); }

.quote-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin: var(--space-4) 0;
}

@media (max-width: 640px) {
  .quote-details { grid-template-columns: repeat(2, 1fr); }
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.quote-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.error-card { border-color: var(--color-fall); }
</style>
