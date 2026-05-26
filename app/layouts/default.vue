<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar glass">
      <div class="sidebar-logo">
        <span class="logo-icon">📈</span>
        <span class="logo-text">JStock</span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item" active-class="active" exact>
          <span class="nav-icon">🏠</span>
          <span>대시보드</span>
        </NuxtLink>
        <NuxtLink to="/market" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>
          <span>시장 현황</span>
        </NuxtLink>
        <NuxtLink to="/account" class="nav-item" active-class="active">
          <span class="nav-icon">💼</span>
          <span>계좌 관리</span>
        </NuxtLink>
        <NuxtLink to="/trading" class="nav-item" active-class="active">
          <span class="nav-icon">⚡</span>
          <span>매매 주문</span>
        </NuxtLink>
        <NuxtLink to="/portfolio" class="nav-item" active-class="active">
          <span class="nav-icon">🥧</span>
          <span>포트폴리오</span>
        </NuxtLink>
        <NuxtLink to="/history" class="nav-item" active-class="active">
          <span class="nav-icon">📋</span>
          <span>거래 내역</span>
        </NuxtLink>

        <div class="nav-divider" />

        <NuxtLink to="/settings" class="nav-item" active-class="active">
          <span class="nav-icon">⚙️</span>
          <span>설정</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="market-status" :class="isMarketOpen ? 'open' : 'closed'">
          <span class="status-dot" />
          <span>{{ isMarketOpen ? '장 운영중' : '장 마감' }}</span>
        </div>
        <div class="current-time text-mono text-sm text-muted">{{ currentTime }}</div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <header class="topbar glass">
        <div class="topbar-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <!-- 사용자 정보 -->
          <div v-if="authStore.user" class="user-chip">
            <span class="user-name">{{ authStore.user.name }}님</span>
            <button class="btn btn-ghost btn-sm text-fall" @click="authStore.logout">로그아웃</button>
          </div>

          <div class="divider-vertical" />

          <!-- 계좌 선택 드롭다운 -->
          <div class="account-selector">
            <select
              v-if="accountStore.registeredAccounts.length > 0"
              :value="accountStore.accountNo"
              class="account-select"
              @change="onAccountChange"
            >
              <option
                v-for="acc in accountStore.registeredAccounts"
                :key="acc.accountNo"
                :value="acc.accountNo"
              >
                {{ acc.label }} ({{ acc.accountNo }})
              </option>
            </select>
            <div v-else class="account-chip">
              <span class="text-muted text-sm">계좌</span>
              <span class="account-no text-mono">{{ accountStore.accountNo || '미설정' }}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="refreshAll">
            <span>↻</span>
            <span>새로고침</span>
          </button>
        </div>
      </header>

      <div class="page-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account'
import { useAuthStore } from '~/stores/auth'

const accountStore = useAccountStore()
const authStore = useAuthStore()
const route = useRoute()

// Market hours (KSX: 09:00-15:30 KST)
const isMarketOpen = computed(() => {
  const now = new Date()
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const hours = kst.getHours()
  const minutes = kst.getMinutes()
  const day = kst.getDay()
  if (day === 0 || day === 6) return false
  const totalMinutes = hours * 60 + minutes
  return totalMinutes >= 9 * 60 && totalMinutes <= 15 * 60 + 30
})

// Current time (KST)
const currentTime = ref('')
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))

// Page title
const pageTitles: Record<string, string> = {
  '/dashboard': '대시보드',
  '/market': '시장 현황',
  '/account': '계좌 관리',
  '/trading': '매매 주문',
  '/portfolio': '포트폴리오',
  '/history': '거래 내역',
  '/settings': '설정',
}
const pageTitle = computed(() => pageTitles[route.path] || 'JStock')

async function refreshAll() {
  await accountStore.fetchBalance()
}

async function onAccountChange(e: Event) {
  const no = (e.target as HTMLSelectElement).value
  accountStore.setAccountNo(no)
  await accountStore.refreshAll()
}

onMounted(async () => {
  await accountStore.fetchRegisteredAccounts()
  if (accountStore.accountNo) {
    await accountStore.refreshAll()
  }
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

/* ─── Sidebar ─── */
.sidebar {
  width: 240px;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-6) 0;
  z-index: 100;
  border-right: 1px solid var(--color-border);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-6) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.logo-icon { font-size: 1.5rem; }
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-item:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.nav-item.active {
  background: var(--color-primary-glow);
  color: var(--color-primary);
}

.nav-icon { font-size: 1rem; }
.nav-divider { height: 1px; background: var(--color-border); margin: var(--space-2) 0; }

.sidebar-footer {
  padding: var(--space-4) var(--space-6) 0;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.market-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 500;
}

.market-status.open { color: var(--color-rise); }
.market-status.closed { color: var(--color-text-muted); }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.market-status.open .status-dot {
  animation: pulse-glow 2s infinite;
}

/* ─── Main ─── */
.main-content {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-8);
  border-bottom: 1px solid var(--color-border);
  min-height: 64px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.account-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
}

.account-no {
  font-size: 0.875rem;
  color: var(--color-text);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.divider-vertical {
  width: 1px;
  height: 20px;
  background: var(--color-border);
}

.account-selector {}

.account-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 4px 12px;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.account-select:hover,
.account-select:focus {
  border-color: var(--color-primary);
}

.page-content {
  flex: 1;
  padding: var(--space-8);
  max-width: 1400px;
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .sidebar { width: 200px; }
  .main-content { margin-left: 200px; }
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; }
  .page-content { padding: var(--space-4); }
}
</style>
