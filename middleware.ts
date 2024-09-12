import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

const locales = [
  'en',
  'es',
  'pt',
  'fr',
  'id',
  'ru',
  'ko',
  'ja',
  'zh',
  'zh-hant',
]

const defaultLocale = locales[0]

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
  return defaultLocale
}

export async function middleware(request: NextRequest) {
  // Add optional Middleware to keep the session alive, this will update the session expiry every time its called.
  await auth()
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return

  // Rewrite the url with the default locale
  const locale = getLocale(request)
  return NextResponse.rewrite(new URL(`/${locale}${pathname}`, request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|webhook|images|_next/static|_next/image|favicon.ico).*)',
  ],
}
