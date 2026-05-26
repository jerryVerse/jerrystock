<template>
  <NuxtLayout>
    <div class="add-account-page fade-in">
      <div class="card" style="max-width:600px;">
        <div class="card-header">
          <h2 class="text-lg font-semibold">증권 계좌 추가</h2>
          <NuxtLink to="/account" class="btn btn-ghost btn-sm">← 목록으로</NuxtLink>
        </div>

        <form class="form" @submit.prevent="handleSubmit">
          <div class="input-group">
            <label class="input-label">계좌 별칭 <span class="required">*</span></label>
            <input v-model="form.label" class="input" placeholder="예: 일반 계좌, ISA" required />
          </div>

          <div class="form-row">
            <div class="input-group" style="flex:2">
              <label class="input-label">계좌번호 <span class="required">*</span></label>
              <input v-model="form.accountNo" class="input" placeholder="68786746" maxlength="10" required />
            </div>
            <div class="input-group" style="flex:1">
              <label class="input-label">계좌 구분</label>
              <input v-model="form.accountSuffix" class="input" placeholder="01" maxlength="2" />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">계좌 유형</label>
            <select v-model="form.accountType" class="input">
              <option value="NORMAL">일반 (주식)</option>
              <option value="ISA">ISA</option>
              <option value="IRP">IRP</option>
              <option value="CMA">CMA</option>
            </select>
          </div>

          <div class="input-group">
            <label class="input-label">API Key (App Key) <span class="required">*</span></label>
            <input v-model="form.apiKey" class="input" placeholder="한국투자증권 App Key" required />
          </div>

          <div class="input-group">
            <label class="input-label">API Secret (App Secret) <span class="required">*</span></label>
            <textarea
              v-model="form.apiSecret"
              class="input"
              placeholder="한국투자증권 App Secret"
              rows="3"
              style="resize:vertical;"
              required
            />
          </div>

          <div class="info-notice">
            💡 API Key/Secret은 한국투자증권
            <a href="https://apiportal.koreainvestment.com" target="_blank">API 포털</a>에서 발급받을 수 있습니다.
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="form-actions">
            <NuxtLink to="/account" class="btn btn-ghost">취소</NuxtLink>
            <button class="btn btn-primary" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner" style="width:16px;height:16px;" />
              <span>{{ loading ? '등록 중...' : '계좌 등록' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({ title: '계좌 추가 | JStock' })

const router = useRouter()

const form = reactive({
  label: '',
  accountNo: '',
  accountSuffix: '01',
  accountType: 'NORMAL',
  broker: 'KIS',
  apiKey: '',
  apiSecret: '',
})

const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/account/create', { method: 'POST', body: { ...form } })
    router.push('/account')
  }
  catch (err: unknown) {
    error.value = (err as { data?: { message?: string } })?.data?.message || '등록에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.add-account-page { display: flex; flex-direction: column; gap: var(--space-6); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); }
.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-row { display: flex; gap: var(--space-3); }
.input-group { display: flex; flex-direction: column; gap: var(--space-1); }
.input-label { font-size: 0.8125rem; color: var(--color-text-secondary); font-weight: 500; }
.required { color: var(--color-fall); }
.info-notice {
  padding: var(--space-3);
  background: var(--color-primary-glow);
  border: 1px solid rgba(59,130,246,0.2);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: 0.875rem;
}
.error-msg {
  padding: var(--space-2) var(--space-3);
  background: var(--color-fall-bg);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: var(--radius-md);
  color: var(--color-fall);
  font-size: 0.875rem;
}
.form-actions { display: flex; gap: var(--space-3); justify-content: flex-end; margin-top: var(--space-2); }
</style>
