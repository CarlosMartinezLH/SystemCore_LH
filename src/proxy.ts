import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Whitelist de hosts autorizados para mitigar ataques de Host Header Injection (CWE-644)
const ALLOWED_TIENDA_HOSTS = [
  'tienda.lanahora.com',
  'tienda.localhost',
  'tienda.localhost:3000',
  'tienda.127.0.0.1.nip.io',
  'tienda.local',
];

export default function proxy(request: NextRequest) {
  // Extraer y sanitizar host (remover puertos extraños y caracteres no válidos)
  const rawHost = (request.headers.get('host') || '').toLowerCase().trim();
  const rawFwdHost = (request.headers.get('x-forwarded-host') || '').toLowerCase().trim();
  const effectiveHost = rawFwdHost || rawHost;

  const { pathname, search } = request.nextUrl;

  // Static assets and internal api requests should pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/tienda/banners') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Multi-domain routing estricto contra lista blanca o prefijo seguro
  const isTiendaDomain =
    ALLOWED_TIENDA_HOSTS.some((h) => effectiveHost.startsWith(h) || effectiveHost === h) ||
    effectiveHost.startsWith('tienda.');

  if (isTiendaDomain) {
    // If accessing root on tienda subdomain, rewrite to /tienda
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/tienda${search}`, request.url));
    }
    // If not already prefixed with /tienda, rewrite to /tienda/...
    if (!pathname.startsWith('/tienda')) {
      return NextResponse.rewrite(new URL(`/tienda${pathname}${search}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
