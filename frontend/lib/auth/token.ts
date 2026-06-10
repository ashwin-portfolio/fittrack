const ACCESS_TOKEN_KEY = 'fittrack_access_token'
const REFRESH_TOKEN_KEY = 'fittrack_refresh_token'
const SESSION_COOKIE = 'fittrack_session'

function setCookie(name: string, value: string, days = 7): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  // Session cookie lets the middleware detect auth state
  setCookie(SESSION_COOKIE, '1')
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  deleteCookie(SESSION_COOKIE)
}

export function hasValidSession(): boolean {
  return Boolean(getAccessToken())
}
