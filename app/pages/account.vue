<template>
  <NuxtLayout>
    <div class="account-page fade-in">
      <!-- Account Setup -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">계좌 설정</h2>
        <div class="account-input-row">
          <div class="input-group" style="flex:1">
            <label class="input-label">계좌번호</label>
            <input
              v-model="accountInput"
              class="input"
              placeholder="12345678-01"
              @keyup.enter="setAccount"
            />
          </div>
          <button class="btn btn-primary" @click="setAccount">적용</button>
        </div>
        <p class="text-muted text-sm mt-2">※ 한국투자증권 계좌번호를 입력하세요 (형식: 8자리-2자리)</p>
      </div>

      <!-- Balance Info -->
      <div v-if="accountStore.accountNo" class="balance-grid">
        <div class="card balance-card">
          <div class="balance-label text-muted text-sm">예수금</div>
          <div class="balance-value text-mono text-xl font-bold">
            {{ formatKRW(balance?.depositBalance ?? 0) }}
          </div>
        </div>
        <div class="card balance-card">
          <div class="balance-label text-muted text-sm">출금 가능금액</div>
          <div class="balance-value text-mono text-xl font-bold">
            {{ formatKRW(balance?.withdrawableBalance ?? 0) }}
          </div>
        </div>
        <div class="card balance-card">
          <div class="balance-label text-muted text-sm">총 평가금액</div>
          <div class="balance-value text-mono text-xl font-bold">
            {{ formatKRW(balance?.totalEvaluationAmount ?? 0) }}
          </div>
        </div>
        <div class="card balance-card">
          <div class="balance-label text-muted text-sm">총 손익</div>
          <div class="balance-value text-mono text-xl font-bold" :class="plClass">
            {{ formatKRW(balance?.totalProfitLoss ?? 0) }}
          </div>
          <div class="text-sm" :class="plClass">{{ formatPercent(balance?.totalProfitLossRate ?? 0) }}</div>
        </div>
      </div>

      <!-- Holdings Table -->
      <div v-if="accountStore.accountNo" class="card">
        <div class="card-header">
          <h2 class="text-lg font-semibold">보유 종목</h2>
          <button class="btn btn-ghost btn-sm" @click="accountStore.fetchHoldings()">새로고침</button>
        </div>

        <div v-if="loadingHoldings" class="loading-state">
          <div class="spinner" />
        </div>
        <div v-else-if="!holdings.length" class="empty-state">
          <span>보유 종목이 없습니다.</span>
        </div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>종목</th>
                <th class="text-right">보유수량</th>
                <th class="text-right">평균 매입가</th>
                <th class="text-right">현재가</th>
                <th class="text-right">평가금액</th>
                <th class="text-right">손익</th>
                <th class="text-right">수익률</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in holdings" :key="h.code">
                <td>
                  <div class="font-medium">{{ h.name }}</div>
                  <div class="text-muted text-xs text-mono">{{ h.code }}</div>
                </td>
                <td class="text-right text-mono">{{ h.quantity.toLocaleString() }}</td>
                <td class="text-right text-mono">{{ h.purchasePrice.toLocaleString() }}</td>
                <td class="text-right text-mono">{{ h.currentPrice.toLocaleString() }}</td>
                <td class="text-right text-mono">{{ h.evaluationAmount.toLocaleString() }}</td>
                <td class="text-right text-mono" :class="h.profitLoss >= 0 ? 'text-rise' : 'text-fall'">
                  {{ h.profitLoss >= 0 ? '+' : '' }}{{ h.profitLoss.toLocaleString() }}
                </td>
                <td class="text-right">
                  <span class="badge" :class="h.profitLossRate >= 0 ? 'badge-rise' : 'badge-fall'">
                    {{ formatPercent(h.profitLossRate) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account'

useHead({ title: '계좌 관리 | JStock' })

const accountStore = useAccountStore()
const { balance, holdings, loadingHoldings } = storeToRefs(accountStore)

const accountInput = ref(accountStore.accountNo)

const plClass = computed(() => {
  const rate = balance.value?.totalProfitLossRate ?? 0
  return rate > 0 ? 'text-rise' : rate < 0 ? 'text-fall' : 'text-muted'
})

function formatKRW(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
}
function formatPercent(rate: number) {
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}

async function setAccount() {
  if (!accountInput.value) return
  accountStore.accountNo = accountInput.value
  await accountStore.fetchBalance()
  await accountStore.fetchHoldings()
}

onMounted(() => {
  if (accountStore.accountNo) {
    accountStore.fetchBalance()
    accountStore.fetchHoldings()
  }
})
</script>

<style scoped>
.account-page { display: flex; flex-direction: column; gap: var(--space-6); }

.account-input-row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 1024px) { .balance-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .balance-grid { grid-template-columns: 1fr; } }

.balance-card { display: flex; flex-direction: column; gap: var(--space-1); }
.balance-label { margin-bottom: var(--space-1); }

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

.text-right { text-align: right; }
</style>
