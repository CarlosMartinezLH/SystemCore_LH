import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const host = request.headers.get('host') || '';
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

  // Multi-domain routing for tienda.lanahora.com or tienda.localhost
  const isTiendaDomain =
    host.startsWith('tienda.') ||
    host.includes('lanatienda') ||
    request.headers.get('x-forwarded-host')?.startsWith('tienda.');

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
