// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Dev server
  devServer: {
    port: 5000,
  },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
  ],

  // Color mode (dark mode support)
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },

  // Runtime config (server-side secrets + public client config)
  runtimeConfig: {
    // Server-side only (private)
    stockApiKey: process.env.STOCK_API_KEY || '',
    stockApiSecret: process.env.STOCK_API_SECRET || '',
    stockApiBaseUrl: process.env.STOCK_API_BASE_URL || 'https://openapi.koreainvestment.com:9443',
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    databaseUrl: process.env.DATABASE_URL || '',

    // Public (accessible in client)
    public: {
      appName: 'JStock',
      appVersion: '1.0.0',
      apiBase: '/api',
    },
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false,
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // Nitro (Backend server config)
  nitro: {
    experimental: {
      tasks: true,
    },
  },

  // App metadata
  app: {
    head: {
      title: 'JStock - 증권 계좌 관리',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '증권 API를 활용한 계좌 관리 및 거래 플랫폼' },
        { name: 'theme-color', content: '#0f172a' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})
