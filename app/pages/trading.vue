<template>
  <NuxtLayout>
    <div class="trading-page fade-in">
      <!-- Order Form -->
      <div class="trading-grid">
        <div class="card order-form-card">
          <h2 class="text-lg font-semibold mb-6">주문 입력</h2>

          <!-- Buy / Sell Toggle -->
          <div class="side-toggle">
            <button
              class="toggle-btn"
              :class="{ active: form.side === 'BUY', buy: form.side === 'BUY' }"
              @click="form.side = 'BUY'"
            >
              매수
            </button>
            <button
              class="toggle-btn"
              :class="{ active: form.side === 'SELL', sell: form.side === 'SELL' }"
              @click="form.side = 'SELL'"
            >
              매도
            </button>
          </div>

          <div class="form-fields">
            <div class="input-group">
              <label class="input-label">종목 코드</label>
              <div class="input-with-action">
                <input v-model="form.code" class="input" placeholder="005930" maxlength="6" />
                <button class="btn btn-ghost btn-sm" @click="lookupQuote">조회</button>
              </div>
            </div>

            <div v-if="lookupResult" class="stock-info-chip fade-in">
              <span class="font-medium">{{ lookupResult.name }}</span>
              <span class="text-mono" :class="lookupResult.priceChange >= 0 ? 'text-rise' : 'text-fall'">
                {{ lookupResult.currentPrice.toLocaleString() }}원
              </span>
            </div>

            <div class="input-group">
              <label class="input-label">주문 유형</label>
              <select v-model="form.orderType" class="input">
                <option value="MARKET">시장가</option>
                <option value="LIMIT">지정가</option>
              </select>
            </div>

            <div v-if="form.orderType === 'LIMIT'" class="input-group">
              <label class="input-label">주문 가격 (원)</label>
              <input v-model.number="form.price" class="input" type="number" placeholder="주문 가격" />
            </div>

            <div class="input-group">
              <label class="input-label">수량</label>
              <div class="quantity-row">
                <button class="btn btn-ghost btn-sm" @click="form.quantity = Math.max(1, form.quantity - 1)">－</button>
                <input v-model.number="form.quantity" class="input" type="number" min="1" style="text-align:center;" />
                <button class="btn btn-ghost btn-sm" @click="form.quantity++">＋</button>
              </div>
            </div>

            <div v-if="form.orderType === 'LIMIT' && form.price" class="order-total">
              <span class="text-muted text-sm">예상 주문금액</span>
              <span class="text-mono font-semibold">{{ formatKRW(form.price * form.quantity) }}</span>
            </div>
          </div>

          <button
            class="btn w-full btn-lg mt-4"
            :class="form.side === 'BUY' ? 'btn-rise' : 'btn-fall'"
            :disabled="submitting"
            @click="submitOrder"
          >
            <span v-if="submitting" class="spinner" style="width:18px;height:18px;" />
            <span>{{ form.side === 'BUY' ? '매수 주문' : '매도 주문' }}</span>
          </button>

          <div v-if="resultMsg" class="result-msg fade-in" :class="resultSuccess ? 'text-rise' : 'text-fall'">
            {{ resultMsg }}
          </div>
        </div>

        <!-- Pending Orders -->
        <div class="card pending-card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">미체결 주문</h2>
            <button class="btn btn-ghost btn-sm" @click="fetchPending">새로고침</button>
          </div>

          <div v-if="loadingPending" class="loading-state">
            <div class="spinner" />
          </div>
          <div v-else-if="!pendingOrders.length" class="empty-state">
            <span>미체결 주문이 없습니다.</span>
          </div>
          <div v-else class="pending-list">
            <div v-for="order in pendingOrders" :key="order.orderId" class="pending-item">
              <div class="pending-header">
                <span class="badge" :class="order.side === 'BUY' ? 'badge-rise' : 'badge-fall'">
                  {{ order.side === 'BUY' ? '매수' : '매도' }}
                </span>
                <span class="font-medium">{{ order.name }}</span>
                <span class="text-muted text-sm text-mono">{{ order.code }}</span>
              </div>
              <div class="pending-details">
                <span class="text-sm text-muted">{{ order.orderType === 'MARKET' ? '시장가' : '지정가' }}</span>
                <span class="text-mono">{{ order.quantity.toLocaleString() }}주</span>
                <span v-if="order.price" class="text-mono">@ {{ order.price.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Order, StockQuote } from '~/types/stock'
import { useAccountStore } from '~/stores/account'

useHead({ title: '매매 주문 | JStock' })

const route = useRoute()
const accountStore = useAccountStore()

const form = reactive({
  side: (route.query.side as 'BUY' | 'SELL') || 'BUY',
  code: (route.query.code as string) || '',
  orderType: 'MARKET' as 'MARKET' | 'LIMIT',
  quantity: 1,
  price: undefined as number | undefined,
})

const lookupResult = ref<StockQuote | null>(null)
const submitting = ref(false)
const resultMsg = ref('')
const resultSuccess = ref(false)

const pendingOrders = ref<Order[]>([])
const loadingPending = ref(false)

function formatKRW(n: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n)
}

async function lookupQuote() {
  if (!form.code) return
  try {
    const res = await $fetch<{ success: boolean; data: StockQuote }>(`/api/market/quote/${form.code}`)
    if (res.success) lookupResult.value = res.data
  }
  catch { lookupResult.value = null }
}

async function submitOrder() {
  if (!accountStore.accountNo) {
    resultMsg.value = '계좌 설정을 먼저 해주세요. (계좌 관리 메뉴)'
    resultSuccess.value = false
    return
  }
  submitting.value = true
  resultMsg.value = ''
  try {
    const res = await $fetch('/api/trading/order', {
      method: 'POST',
      body: { ...form, accountNo: accountStore.accountNo },
    })
    resultSuccess.value = true
    resultMsg.value = (res as { data?: { message?: string } })?.data?.message || '주문이 접수되었습니다.'
    await fetchPending()
  }
  catch (err: unknown) {
    resultSuccess.value = false
    resultMsg.value = err instanceof Error ? err.message : '주문 처리 실패'
  }
  finally {
    submitting.value = false
  }
}

async function fetchPending() {
  if (!accountStore.accountNo) return
  loadingPending.value = true
  try {
    const res = await $fetch<{ data: Order[] }>(`/api/trading/orders/pending?accountNo=${accountStore.accountNo}`)
    pendingOrders.value = res.data || []
  }
  catch { pendingOrders.value = [] }
  finally { loadingPending.value = false }
}

onMounted(() => {
  if (form.code) lookupQuote()
  fetchPending()
})
</script>

<style scoped>
.trading-page { display: flex; flex-direction: column; gap: var(--space-6); }

.trading-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--space-6);
  align-items: start;
}

@media (max-width: 1024px) { .trading-grid { grid-template-columns: 1fr; } }

.side-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 4px;
}

.toggle-btn {
  padding: var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-btn.active.buy { background: var(--color-rise); color: #fff; }
.toggle-btn.active.sell { background: var(--color-fall); color: #fff; }

.form-fields { display: flex; flex-direction: column; gap: var(--space-4); }

.input-group { display: flex; flex-direction: column; gap: var(--space-1); }
.input-label { font-size: 0.8125rem; color: var(--color-text-secondary); font-weight: 500; }

.input-with-action {
  display: flex;
  gap: var(--space-2);
}

.stock-info-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: 0.9375rem;
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.result-msg {
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.9rem;
  text-align: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--color-text-muted);
}

.pending-list { display: flex; flex-direction: column; gap: var(--space-2); }

.pending-item {
  padding: var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: border-color var(--transition-fast);
}
.pending-item:hover { border-color: var(--color-border-strong); }

.pending-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pending-details {
  display: flex;
  gap: var(--space-4);
  font-size: 0.875rem;
}
</style>
