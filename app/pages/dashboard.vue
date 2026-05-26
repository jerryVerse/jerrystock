<template>
  <NuxtLayout>
    <div class="dashboard fade-in">
      <!-- Macro Info Box -->
      <section class="macro-grid">
        <div class="card macro-card">
          <div class="macro-header">
            <span class="macro-label text-muted text-sm">원/달러 환율</span>
            <span class="macro-icon">💵</span>
          </div>
          <div v-if="macroPending" class="macro-loading"><span class="spinner" style="width:20px;height:20px" /></div>
          <template v-else>
            <div class="macro-value font-bold">{{ macroData?.exchangeRate?.price?.toLocaleString() || '-' }} 원</div>
            <div class="macro-change" :class="macroData?.exchangeRate?.change > 0 ? 'text-rise' : 'text-fall'">
              {{ macroData?.exchangeRate?.change > 0 ? '▲' : '▼' }} {{ Math.abs(macroData?.exchangeRate?.change || 0).toFixed(2) }} ({{ formatPercent(macroData?.exchangeRate?.changePercent || 0) }})
            </div>
          </template>
        </div>

        <div class="card macro-card">
          <div class="macro-header">
            <span class="macro-label text-muted text-sm">미국채 10년물 금리</span>
            <span class="macro-icon">📜</span>
          </div>
          <div v-if="macroPending" class="macro-loading"><span class="spinner" style="width:20px;height:20px" /></div>
          <template v-else>
            <div class="macro-value font-bold">{{ macroData?.usTreasury10y?.price?.toFixed(3) || '-' }}%</div>
            <div class="macro-change" :class="macroData?.usTreasury10y?.change > 0 ? 'text-rise' : 'text-fall'">
              {{ macroData?.usTreasury10y?.change > 0 ? '▲' : '▼' }} {{ Math.abs(macroData?.usTreasury10y?.change || 0).toFixed(3) }} ({{ formatPercent(macroData?.usTreasury10y?.changePercent || 0) }})
            </div>
          </template>
        </div>

        <div class="card macro-card">
          <div class="macro-header">
            <span class="macro-label text-muted text-sm">WTI 유가 (NYMEX)</span>
            <span class="macro-icon">🛢️</span>
          </div>
          <div v-if="macroPending" class="macro-loading"><span class="spinner" style="width:20px;height:20px" /></div>
          <template v-else>
            <div class="macro-value font-bold">${{ macroData?.wtiOil?.price?.toFixed(2) || '-' }}</div>
            <div class="macro-change" :class="macroData?.wtiOil?.change > 0 ? 'text-rise' : 'text-fall'">
              {{ macroData?.wtiOil?.change > 0 ? '▲' : '▼' }} {{ Math.abs(macroData?.wtiOil?.change || 0).toFixed(2) }} ({{ formatPercent(macroData?.wtiOil?.changePercent || 0) }})
            </div>
          </template>
        </div>
      </section>

      <!-- Domestic Market -->
      <section class="domestic-grid">
        <div class="card domestic-card" v-for="(market, name) in { KOSPI: domesticData?.KOSPI, KOSDAQ: domesticData?.KOSDAQ }" :key="name">
          <div class="domestic-header">
            <h3 class="text-base font-semibold">{{ name }}</h3>
          </div>
          <div v-if="domesticPending" class="macro-loading"><span class="spinner" style="width:20px;height:20px" /></div>
          <template v-else-if="market">
            <div class="domestic-main">
              <!-- Left: 1 Month Graph -->
              <div class="domestic-chart-wrap" v-for="chart1m in [getSparklineData(market.history)]" :key="'1m'">
                <div class="chart-label text-muted text-xs mb-1">1개월</div>
                <div class="domestic-chart" v-if="chart1m">
                  <svg viewBox="0 -5 100 40" preserveAspectRatio="none" class="sparkline" :class="market.change > 0 ? 'stroke-rise' : 'stroke-fall'">
                    <polyline :points="chart1m.points" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>

              <!-- Center: Price Block -->
              <div class="domestic-price-block text-center mx-3">
                <div class="macro-value font-bold">{{ market.price?.toLocaleString() }}</div>
                <div class="macro-change justify-center" :class="market.change > 0 ? 'text-rise' : 'text-fall'">
                  {{ market.change > 0 ? '▲' : '▼' }} {{ Math.abs(market.change || 0).toFixed(2) }} ({{ formatPercent(market.changePercent || 0) }})
                </div>
              </div>

              <!-- Right: 1 Day Graph -->
              <div class="domestic-chart-wrap text-right" v-for="chart1d in [getSparklineData(market.history1d, market.price - market.change)]" :key="'1d'">
                <div class="chart-label text-muted text-xs mb-1">1일</div>
                <div class="domestic-chart" v-if="chart1d">
                  <svg viewBox="0 -5 100 40" preserveAspectRatio="none" class="sparkline">
                    <defs>
                      <linearGradient :id="'grad1d-dom-' + name.replace(/[^a-zA-Z0-9]/g, '')" x1="0" y1="0" x2="0" y2="1">
                        <stop :offset="chart1d.baselinePct + '%'" stop-color="var(--color-rise)" />
                        <stop :offset="chart1d.baselinePct + '%'" stop-color="var(--color-fall)" />
                      </linearGradient>
                    </defs>
                    <line x1="0" x2="100" :y1="chart1d.baselineY" :y2="chart1d.baselineY" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.3" />
                    <polyline :points="chart1d.points" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :stroke="'url(#grad1d-dom-' + name.replace(/[^a-zA-Z0-9]/g, '') + ')'" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="divider" style="margin: 12px 0; background: rgba(255,255,255,0.05); height: 1px;" />
            <div class="supply-grid text-sm">
              <div class="supply-col">
                <span class="text-muted text-xs">개인</span>
                <span class="font-medium" :class="market.supply.individual.includes('+') ? 'text-rise' : market.supply.individual.includes('-') && market.supply.individual !== '-' ? 'text-fall' : ''">{{ market.supply.individual }}{{ market.supply.individual !== '-' ? '억' : '' }}</span>
              </div>
              <div class="supply-col">
                <span class="text-muted text-xs">외국인</span>
                <span class="font-medium" :class="market.supply.foreign.includes('+') ? 'text-rise' : market.supply.foreign.includes('-') && market.supply.foreign !== '-' ? 'text-fall' : ''">{{ market.supply.foreign }}{{ market.supply.foreign !== '-' ? '억' : '' }}</span>
              </div>
              <div class="supply-col">
                <span class="text-muted text-xs">기관</span>
                <span class="font-medium" :class="market.supply.institutional.includes('+') ? 'text-rise' : market.supply.institutional.includes('-') && market.supply.institutional !== '-' ? 'text-fall' : ''">{{ market.supply.institutional }}{{ market.supply.institutional !== '-' ? '억' : '' }}</span>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Overseas Market -->
      <section class="overseas-grid mt-4">
        <div class="card domestic-card" v-for="(market, name) in { 'S&P 500': overseasData?.SP500, '나스닥': overseasData?.NASDAQ, '필라델피아 반도체': overseasData?.SOX }" :key="name">
          <div class="domestic-header">
            <h3 class="text-base font-semibold">{{ name }}</h3>
          </div>
          <div v-if="overseasPending" class="macro-loading"><span class="spinner" style="width:20px;height:20px" /></div>
          <template v-else-if="market">
            <div class="domestic-main">
              <!-- Left: 1 Month Graph -->
              <div class="domestic-chart-wrap" v-for="chart1m in [getSparklineData(market.history)]" :key="'1m'">
                <div class="chart-label text-muted text-xs mb-1">1개월</div>
                <div class="domestic-chart" v-if="chart1m">
                  <svg viewBox="0 -5 100 40" preserveAspectRatio="none" class="sparkline" :class="market.change > 0 ? 'stroke-rise' : 'stroke-fall'">
                    <polyline :points="chart1m.points" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>

              <!-- Center: Price Block -->
              <div class="domestic-price-block text-center mx-2">
                <div class="macro-value font-bold text-xl">{{ market.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
                <div class="macro-change justify-center" :class="market.change > 0 ? 'text-rise' : 'text-fall'">
                  {{ market.change > 0 ? '▲' : '▼' }} {{ Math.abs(market.change || 0).toFixed(2) }} ({{ formatPercent(market.changePercent || 0) }})
                </div>
              </div>

              <!-- Right: 1 Day Graph -->
              <div class="domestic-chart-wrap text-right" v-for="chart1d in [getSparklineData(market.history1d, market.price - market.change)]" :key="'1d'">
                <div class="chart-label text-muted text-xs mb-1">1일</div>
                <div class="domestic-chart" v-if="chart1d">
                  <svg viewBox="0 -5 100 40" preserveAspectRatio="none" class="sparkline">
                    <defs>
                      <linearGradient :id="'grad1d-ovs-' + name.replace(/[^a-zA-Z0-9]/g, '')" x1="0" y1="0" x2="0" y2="1">
                        <stop :offset="chart1d.baselinePct + '%'" stop-color="var(--color-rise)" />
                        <stop :offset="chart1d.baselinePct + '%'" stop-color="var(--color-fall)" />
                      </linearGradient>
                    </defs>
                    <line x1="0" x2="100" :y1="chart1d.baselineY" :y2="chart1d.baselineY" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.3" />
                    <polyline :points="chart1d.points" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :stroke="'url(#grad1d-ovs-' + name.replace(/[^a-zA-Z0-9]/g, '') + ')'" />
                  </svg>
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Summary Cards -->
      <section class="summary-grid">
        <div class="card card-elevated summary-card">
          <div class="summary-icon bg-primary/20 text-primary">
            <span class="icon">💰</span>
          </div>
          <div class="summary-info">
            <p class="text-muted text-sm mb-1">총 평가금액</p>
            <h3 class="text-xl font-bold">
              {{ accountsData?.summary?.totalEvaluationAmount?.toLocaleString() || '0' }} <span class="text-sm font-normal text-muted">원</span>
            </h3>
          </div>
        </div>
        <div class="card card-elevated summary-card">
          <div class="summary-icon bg-secondary/20 text-secondary">
            <span class="icon">💸</span>
          </div>
          <div class="summary-info">
            <p class="text-muted text-sm mb-1">예수금</p>
            <h3 class="text-xl font-bold">
              {{ accountsData?.summary?.depositBalance?.toLocaleString() || '0' }} <span class="text-sm font-normal text-muted">원</span>
            </h3>
          </div>
        </div>
        <div class="card card-elevated summary-card">
          <div class="summary-icon bg-accent/20 text-accent">
            <span class="icon">🛒</span>
          </div>
          <div class="summary-info">
            <p class="text-muted text-sm mb-1">총 매입금</p>
            <h3 class="text-xl font-bold">
              {{ accountsData?.summary?.totalPurchaseAmount?.toLocaleString() || '0' }} <span class="text-sm font-normal text-muted">원</span>
            </h3>
          </div>
        </div>
        <div class="card card-elevated summary-card">
          <div class="summary-icon bg-success/20 text-success">
            <span class="icon">📈</span>
          </div>
          <div class="summary-info">
            <p class="text-muted text-sm mb-1">총 손익금 (수익률)</p>
            <h3 class="text-xl font-bold" :class="(accountsData?.summary?.totalProfitLoss || 0) >= 0 ? 'text-rise' : 'text-fall'">
              {{ (accountsData?.summary?.totalProfitLoss || 0) > 0 ? '+' : '' }}{{ accountsData?.summary?.totalProfitLoss?.toLocaleString() || '0' }}
              <span class="text-sm font-normal ml-1">({{ formatPercent(accountsData?.summary?.totalProfitLossRate || 0) }})</span>
            </h3>
          </div>
        </div>
      </section>

      <!-- Account Status -->
      <section class="portfolio-section mt-8">
        <div class="flex justify-between items-end mb-4">
          <h2 class="text-xl font-bold tracking-tight">나의 계좌 현황</h2>
          <NuxtLink to="/settings" class="text-sm text-primary hover:underline">계좌 관리 &rarr;</NuxtLink>
        </div>
        
        <div class="card p-0 overflow-hidden">
          <div v-if="accountsPending" class="p-8 text-center text-muted">계좌 정보를 불러오는 중입니다...</div>
          <div v-else-if="!accountsData?.accounts?.length" class="p-8 text-center text-muted">
            등록된 계좌가 없습니다. <NuxtLink to="/settings" class="text-primary underline">설정</NuxtLink>에서 계좌를 등록해주세요.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-max">
              <thead>
                <tr class="bg-card-hover border-b border-white/5">
                  <th class="p-4 text-muted font-medium text-sm">계좌(이름)</th>
                  <th class="p-4 text-muted font-medium text-sm text-right">평가금액</th>
                  <th class="p-4 text-muted font-medium text-sm text-right">예수금</th>
                  <th class="p-4 text-muted font-medium text-sm text-right">매입금</th>
                  <th class="p-4 text-muted font-medium text-sm text-right">손익금 (수익률)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="acc in accountsData.accounts" :key="acc.id" class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td class="p-4">
                    <div class="font-medium text-white">{{ acc.label }}</div>
                    <div class="text-xs text-muted">{{ acc.accountNo }}</div>
                    <div v-if="acc.error" class="text-xs text-fall mt-1">조회 실패</div>
                  </td>
                  <td class="p-4 text-right font-medium">{{ acc.balance?.totalEvaluationAmount?.toLocaleString() || '0' }}원</td>
                  <td class="p-4 text-right">{{ acc.balance?.depositBalance?.toLocaleString() || '0' }}원</td>
                  <td class="p-4 text-right">{{ acc.balance?.totalPurchaseAmount?.toLocaleString() || '0' }}원</td>
                  <td class="p-4 text-right">
                    <div class="font-medium" :class="(acc.balance?.totalProfitLoss || 0) >= 0 ? 'text-rise' : 'text-fall'">
                      {{ (acc.balance?.totalProfitLoss || 0) > 0 ? '+' : '' }}{{ acc.balance?.totalProfitLoss?.toLocaleString() || '0' }}원
                    </div>
                    <div class="text-xs" :class="(acc.balance?.totalProfitLossRate || 0) >= 0 ? 'text-rise' : 'text-fall'">
                      {{ formatPercent(acc.balance?.totalProfitLossRate || 0) }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Removed Main content row (Holdings & Quick Order) -->
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account'

useHead({ title: '대시보드 | JStock' })

const accountStore = useAccountStore()

const { data: macroRes, pending: macroPending } = useFetch('/api/market/macro')
const macroData = computed(() => macroRes.value?.data)

const { data: domesticRes, pending: domesticPending } = useFetch('/api/market/domestic')
const domesticData = computed(() => domesticRes.value?.data)

const { data: overseasRes, pending: overseasPending } = useFetch('/api/market/overseas')
const overseasData = computed(() => overseasRes.value?.data)

const { data: accountsRes, pending: accountsPending } = useFetch('/api/accounts/balance')
const accountsData = computed(() => accountsRes.value?.data)

function getSparklineData(history: number[], baseline?: number) {
  if (!history || history.length < 2) return null
  
  const actualBaseline = baseline !== undefined ? baseline : history[0]
  const min = Math.min(...history, actualBaseline)
  const max = Math.max(...history, actualBaseline)
  const range = max - min || 1
  
  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * 100
    const y = 30 - ((val - min) / range) * 30
    return `${x},${y}`
  }).join(' ')
  
  const baselineY = 30 - ((actualBaseline - min) / range) * 30
  const baselinePct = Math.max(0, Math.min(100, (baselineY / 30) * 100))
  
  return { points, baselineY, baselinePct }
}

function formatPercent(rate: number) {
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.macro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.macro-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-5);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.macro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.macro-icon { font-size: 1.25rem; opacity: 0.8; }
.macro-value { font-size: 1.75rem; font-family: var(--font-mono); margin: var(--space-1) 0; }
.macro-change { font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 4px; }
.macro-loading { height: 60px; display: flex; align-items: center; justify-content: center; }

.domestic-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.domestic-card {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

.domestic-header { margin-bottom: var(--space-2); }

.domestic-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.domestic-price-block {
  display: flex;
  flex-direction: column;
}

.domestic-chart {
  width: 80px;
  height: 32px;
  opacity: 0.8;
}

.sparkline { width: 100%; height: 100%; }
.stroke-rise { stroke: var(--color-rise); }
.stroke-fall { stroke: var(--color-fall); }

.supply-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  text-align: center;
}

.supply-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.overseas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

@media (max-width: 1200px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
  .macro-grid { grid-template-columns: repeat(2, 1fr); }
  .domestic-grid { grid-template-columns: 1fr; }
  .overseas-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .overseas-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .summary-grid { grid-template-columns: 1fr; }
  .macro-grid { grid-template-columns: 1fr; }
}

.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--color-text-muted);
}
</style>
