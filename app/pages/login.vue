<template>
  <div class="auth-page">
    <!-- Background decoration -->
    <div class="bg-glow" />

    <div class="auth-card card glass fade-in">
      <div class="auth-logo">
        <span class="logo-emoji">📈</span>
        <h1 class="logo-text">JStock</h1>
      </div>
      <p class="auth-subtitle text-muted">계좌 관리 & 거래 플랫폼</p>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label class="input-label">이메일</label>
          <input
            id="email"
            v-model="form.email"
            class="input"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="input-group">
          <label class="input-label">비밀번호</label>
          <input
            id="password"
            v-model="form.password"
            class="input"
            type="password"
            placeholder="비밀번호"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button id="login-btn" class="btn btn-primary w-full btn-lg" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:18px;height:18px;" />
          <span>{{ loading ? '로그인 중...' : '로그인' }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <span class="text-muted text-sm">계정이 없으신가요?</span>
        <NuxtLink to="/register" class="text-sm">회원가입</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })
useHead({ title: '로그인 | JStock' })

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.email, form.password)
    router.push('/dashboard')
  }
  catch (err: unknown) {
    error.value = (err as { data?: { message?: string } })?.data?.message
      || '로그인에 실패했습니다.'
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-4);
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  justify-content: center;
}

.logo-emoji { font-size: 2rem; }

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle { text-align: center; font-size: 0.9375rem; }

.auth-form { display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2); }

.input-group { display: flex; flex-direction: column; gap: var(--space-1); }
.input-label { font-size: 0.8125rem; color: var(--color-text-secondary); font-weight: 500; }

.error-msg {
  padding: var(--space-2) var(--space-3);
  background: var(--color-fall-bg);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: var(--color-fall);
  font-size: 0.875rem;
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
