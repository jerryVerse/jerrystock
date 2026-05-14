<template>
  <NuxtLayout>
    <div class="history-page fade-in">
      <div v-if="!accountStore.accountNo" class="card empty-config">
        <p>계좌 관리 메뉴에서 계좌를 먼저 설정해주세요.</p>
        <NuxtLink to="/account" class="btn btn-primary mt-4">계좌 설정하기</NuxtLink>
      </div>

      <template v-else>
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold">거래 내역</h2>
            <div class="header-actions">
              <select v-model="filter" class="input" style="width: auto;">
                <option value="ALL">전체</option>
                <option value="BUY">매수</option>
                <option value="SELL">매도</option>
              </select>
            </div>
          </div>

          <div class="info-notice">
            <span>💡 거래 내역 조회는 증권사 API 연동 후 사용 가능합니다.</span>
          </div>

          <!-- Placeholder table -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>거래일시</th>
                  <th>종목</th>
                  <th>구분</th>
                  <th class="text-right">수량</th>
                  <th class="text-right">체결가</th>
                  <th class="text-right">거래금액</th>
                  <th class="text-right">수수료</th>
                  <th class="text-right">순손익</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!mockHistory.length">
                  <td colspan="8" style="text-align:center; color: var(--color-text-muted); padding: 2rem;">
                    거래 내역이 없습니다.
                  </td>
                </tr>
                <tr v-for="trade in filteredHistory" :key="trade.tradeId">
                  <td class="text-mono text-sm">{{ formatDate(trade.tradedAt) }}</td>
                  <td>
                    <div class="font-medium">{{ trade.name }}</div>
                    <div class="text-muted text-xs text-mono">{{ trade.code }}</div>
                  </td>
                  <td>
                    <span class="badge" :class="trade.side === 'BUY' ? 'badge-rise' : 'badge-fall'">
                      {{ trade.side === 'BUY' ? '매수' : '매도' }}
                    </span>
                  </td>
                  <td class="text-right text-mono">{{ trade.quantity.toLocaleString() }}</td>
                  <td class="text-right text-mono">{{ trade.price.toLocaleString() }}</td>
                  <td class="text-right text-mono">{{ trade.tradingValue.toLocaleString() }}</td>
                  <td class="text-right text-mono text-muted">{{ trade.tradingFee.toLocaleString() }}</td>
                  <td class="text-right text-mono" :class="trade.netAmount >= 0 ? 'text-rise' : 'text-fall'">
                    {{ trade.netAmount.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account'
import type { TradeHistory } from '~/types/stock'

useHead({ title: '거래 내역 | JStock' })

const accountStore = useAccountStore()
const filter = ref<'ALL' | 'BUY' | 'SELL'>('ALL')

// Sample data (실제는 API 연동 필요)
const mockHistory = ref<TradeHistory[]>([])

const filteredHistory = computed(() => {
  if (filter.value === 'ALL') return mockHistory.value
  return mockHistory.value.filter(t => t.side === filter.value)
})

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}
</script>

<style scoped>
.history-page { display: flex; flex-direction: column; gap: var(--space-6); }

.empty-config { text-align: center; padding: var(--space-16); display: flex; flex-direction: column; align-items: center; }

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }

.header-actions { display: flex; gap: var(--space-3); align-items: center; }

.info-notice {
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary-glow);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: 0.875rem;
  margin-bottom: var(--space-4);
}

.text-right { text-align: right; }
</style>
