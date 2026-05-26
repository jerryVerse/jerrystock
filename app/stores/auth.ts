/**
 * Auth Pinia Store
 * 로그인 상태 · 사용자 정보 관리
 */
import { defineStore } from 'pinia'

interface AuthUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
  }),

  getters: {
    isLoggedIn: state => !!state.user,
    isAdmin: state => state.user?.role === 'admin',
  },

  actions: {
    async fetchMe(headers?: any) {
      this.loading = true
      try {
        const res = await $fetch<{ success: boolean; data: { user: AuthUser } }>('/api/auth/me', { headers })
        if (res.success) this.user = res.data.user
      }
      catch {
        this.user = null
      }
      finally {
        this.loading = false
      }
    },

    async login(email: string, password: string) {
      const res = await $fetch<{ success: boolean; data: { user: AuthUser } }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      if (res.success) this.user = res.data.user
      return res
    },

    async register(email: string, password: string, name: string) {
      const res = await $fetch<{ success: boolean; data: { user: AuthUser } }>('/api/auth/register', {
        method: 'POST',
        body: { email, password, name },
      })
      if (res.success) this.user = res.data.user
      return res
    },

    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
      navigateTo('/login')
    },
  },
})
