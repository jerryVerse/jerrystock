<template>
  <div class="landing-page">
    <div class="glow-bg"></div>
    <div class="glow-bg-2"></div>

    <header class="landing-header glass">
      <div class="logo">
        <span class="logo-emoji">📈</span>
        <span class="logo-text">JStock</span>
      </div>
      <div class="nav-links">
        <NuxtLink to="/login" class="btn btn-ghost">로그인</NuxtLink>
        <NuxtLink to="/register" class="btn btn-primary">무료로 시작하기</NuxtLink>
      </div>
    </header>

    <main class="hero-section">
      <div class="hero-content fade-in-up">
        <div class="badge-new">✨ JStock 1.0 출시</div>
        <h1 class="hero-title">
          차세대 <span class="gradient-text">증권 계좌</span><br/>
          관리의 시작
        </h1>
        <p class="hero-subtitle text-muted">
          실시간 시세부터 계좌 현황, 포트폴리오 분석까지.<br/>
          당신의 투자를 한 차원 더 높여줄 단 하나의 플랫폼.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/register" class="btn btn-primary btn-xl">
            무료로 시작하기 <span class="icon">→</span>
          </NuxtLink>
          <a href="#features" class="btn btn-secondary btn-xl">더 알아보기</a>
        </div>
      </div>
      
      <div class="hero-visual fade-in-up delay-1">
        <div class="mockup-window glass">
          <div class="mockup-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="mockup-body">
            <!-- 간단한 대시보드 모의 UI -->
            <div class="mock-card">
              <div class="mock-title">총 평가금액</div>
              <div class="mock-value">₩ 24,500,000</div>
              <div class="mock-change text-rise">+12.4% (₩ 2,700,000)</div>
            </div>
            <div class="mock-chart">
              <div class="chart-bar" style="height: 40%"></div>
              <div class="chart-bar" style="height: 70%"></div>
              <div class="chart-bar" style="height: 50%"></div>
              <div class="chart-bar" style="height: 90%"></div>
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 100%"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <section id="features" class="features-section">
      <div class="feature-grid">
        <div class="feature-card glass">
          <div class="feature-icon">⚡</div>
          <h3>실시간 시세 연동</h3>
          <p class="text-muted">한국투자증권 API를 통한 빠르고 정확한 실시간 시장 데이터를 제공합니다.</p>
        </div>
        <div class="feature-card glass">
          <div class="feature-icon">💼</div>
          <h3>통합 계좌 관리</h3>
          <p class="text-muted">여러 계좌의 예수금, 보유 종목, 손익 현황을 한 눈에 파악할 수 있습니다.</p>
        </div>
        <div class="feature-card glass">
          <div class="feature-icon">🔒</div>
          <h3>안전한 거래 환경</h3>
          <p class="text-muted">강력한 보안 아키텍처와 함께 안심하고 매매 주문을 처리하세요.</p>
        </div>
      </div>
    </section>
    
    <footer class="landing-footer">
      <p class="text-muted text-sm">© 2026 JStock. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
useHead({
  title: 'JStock | 차세대 증권 관리 플랫폼',
  meta: [
    { name: 'description', content: '최고의 주식 투자 경험을 위한 스마트한 계좌 관리 솔루션' }
  ]
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--color-bg);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.glow-bg {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.glow-bg-2 {
  position: absolute;
  bottom: -20%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.logo-emoji {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160px var(--space-8) 80px;
  position: relative;
  z-index: 1;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.badge-new {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #60a5fa, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-2);
}

.btn-xl {
  padding: 16px 32px;
  font-size: 1.125rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
}

.icon {
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.btn-primary:hover .icon {
  transform: translateX(4px);
}

.hero-visual {
  margin-top: 80px;
  width: 100%;
  max-width: 900px;
  perspective: 1000px;
}

.mockup-window {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transform: rotateX(5deg) scale(0.95);
  transition: transform 0.5s ease;
}

.mockup-window:hover {
  transform: rotateX(0deg) scale(1);
}

.mockup-header {
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

.mockup-body {
  padding: var(--space-8);
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-6);
  min-height: 300px;
}

.mock-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mock-title { color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 8px; }
.mock-value { font-size: 2rem; font-weight: 700; font-family: var(--font-mono); margin-bottom: 8px; }
.mock-change { font-size: 1rem; font-weight: 500; }

.mock-chart {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 100%;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.8));
  border-radius: 4px 4px 0 0;
  transition: height 1s ease;
}

.features-section {
  padding: 100px var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.feature-card {
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  transition: transform 0.3s ease, background 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.04);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-4);
  display: inline-block;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.landing-footer {
  text-align: center;
  padding: var(--space-8);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 1;
}

/* Animations */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease forwards;
}

.delay-1 {
  animation-delay: 0.3s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .hero-actions { flex-direction: column; width: 100%; }
  .hero-actions .btn { width: 100%; }
  .feature-grid { grid-template-columns: 1fr; }
  .mockup-body { grid-template-columns: 1fr; }
  .mock-chart { height: 150px; }
}
</style>
