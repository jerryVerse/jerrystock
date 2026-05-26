/**
 * app/middleware/auth.global.ts
 * Nuxt 전역 라우트 미들웨어 — 비로그인 시 /login 으로 리다이렉트
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // 랜딩, 로그인, 회원가입 페이지는 통과
  if (to.path === '/' || to.path === '/login' || to.path === '/register') return

  const authStore = useAuthStore()

  // 사용자 정보 없으면 서버에서 조회
  if (!authStore.user) {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    await authStore.fetchMe(headers)
  }

  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})
