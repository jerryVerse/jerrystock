<template>
  <NuxtLayout>
    <div class="portfolio-page fade-in">
      <div v-if="!accountStore.accountNo" class="card empty-config">
        <p>계좌 관리 메뉴에서 계좌를 먼저 설정해주세요.</p>
        <NuxtLink to="/account" class="btn btn-primary mt-4">계좌 설정하기</NuxtLink>
      </div>

      <template v-else>
        <!-- Portfolio Summary -->
        <div class="portfolio-header card">
          <div class="portfolio-numbers">
            <div class="pf-number">
              <div class="text-muted text-sm">총 자산</div>
              <div class="text-mono text-2xl font-bold">{{ formatKRW(totalAsset) }}</div>
            </div>
            <div class="pf-number">
              <div class="text-muted text-sm">수익금</div>
              <div class="text-mono text-xl font-semibold" :class="plClass">
                {{ formatKRW(accountStore.totalProfitLoss) }}
              </div>
            </div>
            <div class="pf-number">
              <div class="text-muted text-sm">수익률</div>
              <div class="text-xl font-semibold" :class="plClass">
                {{ formatPercent(accountStore.totalProfitLossRate) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Holdings detail -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">종목별 현황</h2>
            <button class="btn btn-ghost btn-sm" @click="accountStore.refreshAll()">새로고침</button>
          </div>

          <div v-if="accountStore.loadingHoldings" class="loading-state">
            <div class="spinner" />
          </div>
          <div v-else-if="!accountStore.holdings.length" class="empty-state">
            <span>보유 종목이 없습니다.</span>
          </div>
          <div v-else>
            <div class="holdings-list">
              <div v-for="h in accountStore.holdings" :key="h.code" class="holding-row">
                <div class="holding-info">
                  <div class="font-semibold">{{ h.name }}</div>
                  <div class="text-mono text-muted text-xs">{{ h.code }}</div>
                </div>
                <div class="holding-bar-wrap">
                  <div
                    class="holding-bar"
                    :style="{ width: holdingPercent(h.evaluationAmount) + '%' }"
                    :class="h.profitLossRate >= 0 ? 'bar-rise' : 'bar-fall'"
                  />
                </div>
                <div class="holding-metrics">
                  <div class="metric">
                    <span class="text-muted text-xs">평가금액</span>
                    <span class="text-mono">{{ h.evaluationAmount.toLocaleString() }}</span>
                  </div>
                  <div class="metric">
                    <span class="text-muted text-xs">수익률</span>
                    <span :class="h.profitLossRate >= 0 ? 'text-rise' : 'text-fall'">
                      {{ formatPercent(h.profitLossRate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account'
import type { HoldingStock } from '~/types/stock'

useHead({ title: '포트폴리오 | JStock' })

const accountStore = useAccountStore()

const totalAsset = computed(
  () => (accountStore.balance?.totalEvaluationAmount ?? 0) + (accountStore.balance?.depositBalance ?? 0),
)

const plClass = computed(() => {
  const rate = accountStore.totalProfitLossRate
  return rate > 0 ? 'text-rise' : rate < 0 ? 'text-fall' : 'text-muted'
})

function holdingPercent(evaluationAmount: number) {
  const total = accountStore.balance?.totalEvaluationAmount || 1
  return Math.min(100, (evaluationAmount / total) * 100)
}

function formatKRW(n: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n)
}
function formatPercent(rate: number) {
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}

onMounted(() => {
  if (accountStore.accountNo) accountStore.refreshAll()
})
</script>

<style scoped>
.portfolio-page { display: flex; flex-direction: column; gap: var(--space-6); }

.empty-config { text-align: center; padding: var(--space-16); display: flex; flex-direction: column; align-items: center; }

.portfolio-header {}
.portfolio-numbers {
  display: flex;
  gap: var(--space-12);
  align-items: center;
}
.pf-number { display: flex; flex-direction: column; gap: var(--space-1); }

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
.loading-state, .empty-state { display: flex; align-items: center; justify-content: center; min-height: 120px; color: var(--color-text-muted); }

.holdings-list { display: flex; flex-direction: column; gap: var(--space-3); }

.holding-row {
  display: grid;
  grid-template-columns: 160px 1fr 200px;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .holding-row { grid-template-columns: 1fr; }
  .holding-bar-wrap { display: none; }
}

.holding-bar-wrap {
  height: 8px;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.holding-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s ease;
}
.bar-rise { background: var(--color-rise); }
.bar-fall { background: var(--color-fall); }

.holding-metrics {
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
}
.metric { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 0.9rem; }
</style>
