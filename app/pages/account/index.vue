<template>
  <NuxtLayout>
    <div class="broker-accounts-page fade-in">
      <div class="page-header-row">
        <h2 class="text-lg font-semibold">증권 계좌 관리</h2>
        <NuxtLink to="/account/add" class="btn btn-primary btn-sm">
          <span>＋</span> 계좌 추가
        </NuxtLink>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner" />
      </div>

      <div v-else-if="!accounts.length" class="card empty-state-card">
        <div class="empty-icon">🏦</div>
        <p class="font-medium">등록된 증권 계좌가 없습니다.</p>
        <p class="text-muted text-sm">한국투자증권 API Key를 등록하면 계좌 조회와 거래가 가능합니다.</p>
        <NuxtLink to="/account/add" class="btn btn-primary mt-4">계좌 추가하기</NuxtLink>
      </div>

      <div v-else class="accounts-grid">
        <div v-for="acc in accounts" :key="acc.id" class="card account-card">
          <div class="account-card-header">
            <div>
              <div class="font-semibold text-lg">{{ acc.label }}</div>
              <div class="text-mono text-muted text-sm">{{ acc.accountNo }}</div>
            </div>
            <div class="account-badges">
              <span class="badge badge-blue">{{ typeLabel(acc.type) }}</span>
              <span class="badge" :class="acc.isActive ? 'badge-rise' : 'badge-neutral'">
                {{ acc.isActive ? '활성' : '비활성' }}
              </span>
            </div>
          </div>
          <div class="divider" />
          <div class="account-card-footer">
            <span class="text-muted text-xs">{{ acc.broker }} · 등록일 {{ formatDate(acc.createdAt) }}</span>
            <button
              class="btn btn-ghost btn-sm text-fall"
              :disabled="deletingId === acc.id"
              @click="deleteAccount(acc.id)"
            >
              <span v-if="deletingId === acc.id" class="spinner" style="width:14px;height:14px;" />
              <span v-else>삭제</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({ title: '증권 계좌 관리 | JStock' })

interface BrokerAccount {
  id: number
  label: string
  accountNo: string
  type: string
  broker: string
  isActive: boolean
  createdAt?: string
}

const accounts = ref<BrokerAccount[]>([])
const loading = ref(true)
const deletingId = ref<number | null>(null)

const typeLabels: Record<string, string> = {
  NORMAL: '일반',
  ISA: 'ISA',
  IRP: 'IRP',
  CMA: 'CMA',
}
function typeLabel(type: string) { return typeLabels[type] || type }
function formatDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ko-KR')
}

async function fetchAccounts() {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; data: BrokerAccount[] }>('/api/account/list')
    accounts.value = res.data || []
  }
  finally { loading.value = false }
}

async function deleteAccount(id: number) {
  if (!confirm('계좌를 삭제하시겠습니까?')) return
  deletingId.value = id
  try {
    await $fetch(`/api/account/${id}`, { method: 'DELETE' })
    await fetchAccounts()
  }
  catch (err: unknown) {
    alert((err as { data?: { message?: string } })?.data?.message || '삭제 실패')
  }
  finally { deletingId.value = null }
}

onMounted(fetchAccounts)
</script>

<style scoped>
.broker-accounts-page { display: flex; flex-direction: column; gap: var(--space-6); }
.page-header-row { display: flex; align-items: center; justify-content: space-between; }
.loading-state { display: flex; justify-content: center; padding: var(--space-16); }
.empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-12);
  gap: var(--space-3);
}
.empty-icon { font-size: 3rem; }
.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-4); }
.account-card { display: flex; flex-direction: column; gap: var(--space-3); }
.account-card-header { display: flex; align-items: flex-start; justify-content: space-between; }
.account-badges { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.account-card-footer { display: flex; align-items: center; justify-content: space-between; }
.text-fall { color: var(--color-fall); }
</style>
