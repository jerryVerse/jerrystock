<template>
  <NuxtLayout>
    <div class="settings-page fade-in">
      
      <!-- Registered Accounts List -->
      <div class="card mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">등록된 계좌 목록</h2>
          <button class="btn btn-ghost btn-sm" @click="accountStore.fetchRegisteredAccounts">↻ 새로고침</button>
        </div>
        
        <div v-if="accountStore.loadingAccounts" class="text-muted text-sm py-4 text-center">로딩 중...</div>
        <div v-else-if="accountStore.registeredAccounts.length === 0" class="empty-state">
          등록된 계좌가 없습니다. 아래 폼에서 계좌를 추가해 주세요.
        </div>
        <div v-else class="account-list">
          <div v-for="acc in accountStore.registeredAccounts" :key="acc.id" class="account-item">
            <div class="account-info">
              <span class="badge badge-blue">{{ acc.type || 'NORMAL' }}</span>
              <div class="account-text">
                <span class="font-semibold">{{ acc.label }}</span>
                <span class="text-mono text-sm text-muted">{{ acc.accountNo }}</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm text-fall" @click="handleDelete(acc.id)" :disabled="deleting === acc.id">
              {{ deleting === acc.id ? '삭제 중...' : '삭제' }}
            </button>
          </div>
        </div>
      </div>

      <div class="settings-grid">
        <!-- API Settings -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-6">새 계좌 등록</h2>
          <form class="settings-form" autocomplete="off" @submit.prevent="saveSettings">
            <div class="input-group">
              <label class="input-label">계좌 별칭</label>
              <input v-model="form.label" id="label" name="label" autocomplete="off" class="input" placeholder="예: 주식계좌 1" required />
            </div>
            <div class="input-group">
              <label class="input-label">계좌번호</label>
              <input v-model="form.accountNo" id="accountNo" name="accountNo" autocomplete="off" data-lpignore="true" class="input" placeholder="12345678-01" required />
              <p class="input-hint">한국투자증권 계좌번호 (8자리-2자리 형식으로 입력)</p>
            </div>
            <div class="input-group">
              <label class="input-label">App Key</label>
              <input v-model="form.appKey" id="appKey" name="appKey" autocomplete="new-password" class="input" type="password" placeholder="API App Key" required />
            </div>
            <div class="input-group">
              <label class="input-label">App Secret</label>
              <input v-model="form.appSecret" id="appSecret" name="appSecret" autocomplete="new-password" class="input" type="password" placeholder="API App Secret" required />
            </div>

            <div class="settings-actions">
              <button class="btn btn-primary" type="submit" :disabled="saving">
                <span v-if="saving" class="spinner" style="width:14px;height:14px;" />
                <span>계좌 등록</span>
              </button>
            </div>

            <div v-if="submitResult" class="test-result fade-in" :class="submitSuccess ? 'text-rise' : 'text-fall'">
              {{ submitResult }}
            </div>
          </form>
        </div>

        <!-- App Info -->
        <div class="card app-info-card">
          <h2 class="text-lg font-semibold mb-4">앱 정보</h2>
          <div class="info-list">
            <div class="info-row">
              <span class="text-muted text-sm">버전</span>
              <span class="text-mono">v1.0.0</span>
            </div>
            <div class="info-row">
              <span class="text-muted text-sm">API</span>
              <span>한국투자증권 Open API</span>
            </div>
            <div class="info-row">
              <span class="text-muted text-sm">프레임워크</span>
              <span>Nuxt 4 (Nitro)</span>
            </div>
          </div>

          <div class="divider" />

          <h3 class="text-base font-semibold mb-3">API 엔드포인트</h3>
          <div class="endpoint-list">
            <div v-for="ep in endpoints" :key="ep.path" class="endpoint-item">
              <span class="badge" :class="ep.method === 'GET' ? 'badge-blue' : 'badge-rise'">{{ ep.method }}</span>
              <code class="text-mono text-sm text-secondary">{{ ep.path }}</code>
              <span class="text-muted text-xs">{{ ep.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account'

useHead({ title: '설정 | JStock' })

const accountStore = useAccountStore()

const form = reactive({
  label: '',
  accountNo: '',
  appKey: '',
  appSecret: '',
})

const saving = ref(false)
const submitResult = ref('')
const submitSuccess = ref(false)
const deleting = ref<number | null>(null)

const endpoints = [
  { method: 'GET', path: '/api/market/quote/:code', desc: '주식 현재가' },
  { method: 'GET', path: '/api/market/chart/:code', desc: '차트 데이터' },
  { method: 'GET', path: '/api/account/balance', desc: '계좌 잔고' },
  { method: 'GET', path: '/api/account/holdings', desc: '보유 종목' },
  { method: 'POST', path: '/api/trading/order', desc: '주문 접수' },
  { method: 'GET', path: '/api/trading/orders/pending', desc: '미체결 주문' },
]

onMounted(() => {
  accountStore.fetchRegisteredAccounts()
})

async function saveSettings() {
  saving.value = true
  submitResult.value = ''
  
  // 계좌번호 파싱 (12345678-01 -> 12345678, 01)
  const match = form.accountNo.match(/^(\d{6,10})-(\d{2})$/)
  if (!match) {
    submitSuccess.value = false
    submitResult.value = '❌ 계좌번호 형식을 확인해주세요. (예: 12345678-01)'
    saving.value = false
    return
  }

  const [, no, suffix] = match

  try {
    const res = await $fetch('/api/account/create', {
      method: 'POST',
      body: {
        label: form.label,
        accountNo: no,
        accountSuffix: suffix,
        apiKey: form.appKey,
        apiSecret: form.appSecret,
      }
    })
    
    submitSuccess.value = true
    submitResult.value = '✅ 계좌가 성공적으로 등록되었습니다!'
    
    // 폼 초기화
    form.label = ''
    form.accountNo = ''
    form.appKey = ''
    form.appSecret = ''
    
    // 목록 새로고침
    await accountStore.fetchRegisteredAccounts()
  } catch (err: unknown) {
    submitSuccess.value = false
    submitResult.value = `❌ 등록 실패: ${(err as { data?: { message?: string } })?.data?.message || '알 수 없는 오류'}`
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('정말 이 계좌를 삭제하시겠습니까?')) return
  
  deleting.value = id
  try {
    await accountStore.deleteAccount(id)
  } catch (err) {
    alert('삭제 중 오류가 발생했습니다.')
  } finally {
    deleting.value = null
  }
}
</script>

<style scoped>
.settings-page { display: flex; flex-direction: column; gap: var(--space-6); }

.mb-6 { margin-bottom: var(--space-6); }
.mb-4 { margin-bottom: var(--space-4); }
.mt-4 { margin-top: var(--space-4); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.text-center { text-align: center; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }

.empty-state {
  text-align: center;
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.account-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.account-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  align-items: start;
}

@media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } }

.settings-form { display: flex; flex-direction: column; gap: var(--space-4); }
.input-group { display: flex; flex-direction: column; gap: var(--space-1); }
.input-label { font-size: 0.8125rem; color: var(--color-text-secondary); font-weight: 500; }
.input-hint { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

.settings-actions { display: flex; gap: var(--space-3); margin-top: var(--space-2); }

.test-result {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.9rem;
}

.info-list { display: flex; flex-direction: column; gap: var(--space-3); }
.info-row { display: flex; justify-content: space-between; align-items: center; }

.endpoint-list { display: flex; flex-direction: column; gap: var(--space-2); }
.endpoint-item { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }

.divider { height: 1px; background: rgba(255, 255, 255, 0.1); margin: var(--space-4) 0; }
</style>
