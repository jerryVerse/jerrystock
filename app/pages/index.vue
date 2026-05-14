<template>
  <NuxtLayout>
    <div class="dashboard fade-in">
      <!-- Summary Cards -->
      <section class="summary-grid">
        <div class="card card-elevated summary-card">
          <div class="summary-label text-muted text-sm">총 평가금액</div>
          <div class="summary-value text-mono text-2xl font-bold">
            {{ formatKRW(balance?.totalEvaluationAmount ?? 0) }}
          </div>
          <div class="summary-change" :class="profitLossClass">
            {{ formatPercent(balance?.totalProfitLossRate ?? 0) }}
            ({{ formatKRW(balance?.totalProfitLoss ?? 0) }})
          </div>
        </div>

        <div class="card card-elevated summary-card">
          <div class="summary-label text-muted text-sm">예수금</div>
          <div class="summary-value text-mono text-2xl font-bold">
            {{ formatKRW(balance?.depositBalance ?? 0) }}
          </div>
          <div class="text-muted text-sm">출금가능: {{ formatKRW(balance?.withdrawableBalance ?? 0) }}</div>
        </div>

        <div class="card card-elevated summary-card">
          <div class="summary-label text-muted text-sm">매입금액</div>
          <div class="summary-value text-mono text-2xl font-bold">
            {{ formatKRW(balance?.totalPurchaseAmount ?? 0) }}
          </div>
          <div class="text-muted text-sm">보유 종목 {{ holdingCount }}개</div>
        </div>

        <div class="card card-elevated summary-card">
          <div class="summary-label text-muted text-sm">총 손익</div>
          <div class="summary-value text-mono text-2xl font-bold" :class="profitLossClass">
            {{ formatKRW(balance?.totalProfitLoss ?? 0) }}
          </div>
          <div class="summary-change" :class="profitLossClass">
            수익률 {{ formatPercent(balance?.totalProfitLossRate ?? 0) }}
          </div>
        </div>
      </section>

      <!-- Main content row -->
      <section class="dashboard-row">
        <!-- Holdings -->
        <div class="card holdings-card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">보유 종목</h2>
            <NuxtLink to="/portfolio" class="btn btn-ghost btn-sm">전체 보기 →</NuxtLink>
          </div>

          <div v-if="loadingHoldings" class="loading-state">
            <div class="spinner" />
          </div>
          <div v-else-if="holdings.length === 0" class="empty-state">
            <span>보유 종목이 없습니다.</span>
          </div>
          <div v-else class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>종목</th>
                  <th class="text-right">현재가</th>
                  <th class="text-right">수익률</th>
                  <th class="text-right">평가금액</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in holdings.slice(0, 5)" :key="h.code">
                  <td>
                    <div class="font-medium">{{ h.name }}</div>
                    <div class="text-muted text-xs text-mono">{{ h.code }}</div>
                  </td>
                  <td class="text-right text-mono">{{ h.currentPrice.toLocaleString() }}</td>
                  <td class="text-right">
                    <span class="badge" :class="h.profitLossRate >= 0 ? 'badge-rise' : 'badge-fall'">
                      {{ formatPercent(h.profitLossRate) }}
                    </span>
                  </td>
                  <td class="text-right text-mono">{{ h.evaluationAmount.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Order -->
        <div class="card quick-order-card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">빠른 주문</h2>
          </div>
          <div class="quick-order-body">
            <div class="input-group">
              <label class="input-label">종목 코드</label>
              <input v-model="quickOrder.code" class="input" placeholder="예: 005930" maxlength="6" />
            </div>
            <div class="input-group">
              <label class="input-label">수량</label>
              <input v-model.number="quickOrder.quantity" class="input" type="number" min="1" placeholder="수량 입력" />
            </div>
            <div class="input-group">
              <label class="input-label">주문 유형</label>
              <select v-model="quickOrder.orderType" class="input">
                <option value="MARKET">시장가</option>
                <option value="LIMIT">지정가</option>
              </select>
            </div>
            <div v-if="quickOrder.orderType === 'LIMIT'" class="input-group">
              <label class="input-label">가격</label>
              <input v-model.number="quickOrder.price" class="input" type="number" placeholder="주문 가격" />
            </div>
            <div class="order-buttons">
              <button class="btn btn-rise w-full" @click="submitOrder('BUY')">
                매수
              </button>
              <button class="btn btn-fall w-full" @click="submitOrder('SELL')">
                매도
              </button>
            </div>
            <div v-if="orderMessage" class="order-message" :class="orderSuccess ? 'text-rise' : 'text-fall'">
              {{ orderMessage }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account'

useHead({ title: '대시보드 | JStock' })

const accountStore = useAccountStore()
const { balance, holdings, loadingHoldings } = storeToRefs(accountStore)

const holdingCount = computed(() => holdings.value.length)
const profitLossClass = computed(() => {
  const rate = balance.value?.totalProfitLossRate ?? 0
  return rate > 0 ? 'text-rise' : rate < 0 ? 'text-fall' : 'text-muted'
})

const quickOrder = reactive({
  code: '',
  quantity: 1,
  orderType: 'MARKET' as 'MARKET' | 'LIMIT',
  price: undefined as number | undefined,
})

const orderMessage = ref('')
const orderSuccess = ref(false)

function formatKRW(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
}
function formatPercent(rate: number) {
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}

async function submitOrder(side: 'BUY' | 'SELL') {
  if (!quickOrder.code || quickOrder.quantity < 1) {
    orderMessage.value = '종목 코드와 수량을 확인해주세요.'
    orderSuccess.value = false
    return
  }
  try {
    const res = await $fetch('/api/trading/order', {
      method: 'POST',
      body: {
        accountNo: accountStore.accountNo,
        code: quickOrder.code,
        side,
        orderType: quickOrder.orderType,
        quantity: quickOrder.quantity,
        price: quickOrder.price,
      },
    })
    orderSuccess.value = true
    orderMessage.value = (res as { data?: { message?: string } })?.data?.message || '주문 접수 완료'
    await accountStore.fetchBalance()
  }
  catch (err: unknown) {
    orderSuccess.value = false
    orderMessage.value = err instanceof Error ? err.message : '주문 처리 실패'
  }
}

onMounted(() => {
  accountStore.fetchBalance()
  accountStore.fetchHoldings()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 1200px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .summary-grid { grid-template-columns: 1fr; }
}

.summary-card { display: flex; flex-direction: column; gap: var(--space-1); }
.summary-label { margin-bottom: var(--space-1); }
.summary-value { margin: var(--space-1) 0; }
.summary-change { font-size: 0.875rem; font-weight: 500; }

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-6);
}

@media (max-width: 1024px) {
  .dashboard-row { grid-template-columns: 1fr; }
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
  height: 120px;
  color: var(--color-text-muted);
}

.text-right { text-align: right; }

/* Quick order */
.quick-order-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.input-label {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.order-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.order-message {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
}
</style>
