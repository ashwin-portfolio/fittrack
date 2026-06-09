import { type NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'fittrack_session'

const AUTH_ROUTES = ['/login', '/register']

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/workouts',
  '/nutrition',
  '/progress',
  '/profile',
  '/community',
]

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (isProtected(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute(pathname) && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.searchParams.delete('from')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
