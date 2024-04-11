import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

export function middleware(request: NextRequest) {
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
