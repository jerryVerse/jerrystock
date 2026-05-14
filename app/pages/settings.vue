<template>
  <NuxtLayout>
    <div class="settings-page fade-in">
      <div class="settings-grid">
        <!-- API Settings -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-6">API 설정</h2>
          <div class="settings-form">
            <div class="input-group">
              <label class="input-label">계좌번호</label>
              <input v-model="form.accountNo" class="input" placeholder="12345678-01" />
              <p class="input-hint">한국투자증권 계좌번호 (8자리-2자리)</p>
            </div>
            <div class="input-group">
              <label class="input-label">App Key</label>
              <input v-model="form.appKey" class="input" type="password" placeholder="API App Key" />
            </div>
            <div class="input-group">
              <label class="input-label">App Secret</label>
              <input v-model="form.appSecret" class="input" type="password" placeholder="API App Secret" />
            </div>
            <div class="input-group">
              <label class="input-label">API Base URL</label>
              <input v-model="form.baseUrl" class="input" placeholder="https://openapi.koreainvestment.com:9443" />
            </div>

            <div class="settings-actions">
              <button class="btn btn-primary" @click="saveSettings">저장</button>
              <button class="btn btn-ghost" @click="testConnection" :disabled="testing">
                <span v-if="testing" class="spinner" style="width:14px;height:14px;" />
                <span>연결 테스트</span>
              </button>
            </div>

            <div v-if="testResult" class="test-result fade-in" :class="testSuccess ? 'text-rise' : 'text-fall'">
              {{ testResult }}
            </div>
          </div>
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
  accountNo: accountStore.accountNo,
  appKey: '',
  appSecret: '',
  baseUrl: 'https://openapi.koreainvestment.com:9443',
})

const testing = ref(false)
const testResult = ref('')
const testSuccess = ref(false)

const endpoints = [
  { method: 'GET', path: '/api/market/quote/:code', desc: '주식 현재가' },
  { method: 'GET', path: '/api/market/chart/:code', desc: '차트 데이터' },
  { method: 'GET', path: '/api/account/balance', desc: '계좌 잔고' },
  { method: 'GET', path: '/api/account/holdings', desc: '보유 종목' },
  { method: 'POST', path: '/api/trading/order', desc: '주문 접수' },
  { method: 'GET', path: '/api/trading/orders/pending', desc: '미체결 주문' },
]

function saveSettings() {
  if (form.accountNo) {
    accountStore.setAccountNo(form.accountNo)
  }
  alert('설정이 저장되었습니다. API Key는 .env 파일에 설정해주세요.')
}

async function testConnection() {
  if (!form.accountNo) {
    testResult.value = '계좌번호를 입력해주세요.'
    testSuccess.value = false
    return
  }
  testing.value = true
  testResult.value = ''
  try {
    await $fetch(`/api/account/balance?accountNo=${form.accountNo}`)
    testSuccess.value = true
    testResult.value = '✅ API 연결 성공!'
  }
  catch (err: unknown) {
    testSuccess.value = false
    testResult.value = `❌ 연결 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
  }
  finally {
    testing.value = false
  }
}
</script>

<style scoped>
.settings-page { display: flex; flex-direction: column; gap: var(--space-6); }

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

.settings-actions { display: flex; gap: var(--space-3); }

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
</style>
