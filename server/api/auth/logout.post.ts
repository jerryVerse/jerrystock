/**
 * POST /api/auth/logout
 * 로그아웃 (Cookie 삭제)
 */
export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token', { path: '/' })
  return { success: true, message: '로그아웃되었습니다.' }
})
