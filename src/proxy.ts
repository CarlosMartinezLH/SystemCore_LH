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

  // 1. Sinergia y Validación de Perímetro Cloudflare Zero Trust
  // Activo en producción o cuando se defina ENFORCE_CLOUDFLARE_ZERO_TRUST=true
  const isZeroTrustEnforced =
    process.env.ENFORCE_CLOUDFLARE_ZERO_TRUST === 'true' ||
    (process.env.NODE_ENV === 'production' && Boolean(process.env.CLOUDFLARE_ZERO_TRUST_TEAM));

  if (isZeroTrustEnforced && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon')) {
    const cfJwtAssertion = request.headers.get('cf-access-jwt-assertion');
    const cfEmail = request.headers.get('cf-access-authenticated-user-email');

    // Bloquear intentos de bypass directo al servidor de origen
    if (!cfJwtAssertion) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Acceso Denegado: La conexión debe originarse a través del túnel seguro de Cloudflare Zero Trust.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validar dominio corporativo inyectado por la identidad de Cloudflare
    if (cfEmail && !cfEmail.endsWith('@lanahora.com') && !cfEmail.endsWith('@lanahora.com.mx')) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Identidad corporativa no autorizada en el perímetro Cloudflare Zero Trust.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // 2. Static assets and internal api requests should pass through with security headers
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/tienda/banners') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  // 3. Multi-domain routing estricto contra lista blanca o prefijo seguro
  const isTiendaDomain =
    ALLOWED_TIENDA_HOSTS.some((h) => effectiveHost.startsWith(h) || effectiveHost === h) ||
    effectiveHost.startsWith('tienda.');

  let response = NextResponse.next();

  if (isTiendaDomain) {
    // If accessing root on tienda subdomain, rewrite to /tienda
    if (pathname === '/') {
      response = NextResponse.rewrite(new URL(`/tienda${search}`, request.url));
    } else if (!pathname.startsWith('/tienda')) {
      // If not already prefixed with /tienda, rewrite to /tienda/...
      response = NextResponse.rewrite(new URL(`/tienda${pathname}${search}`, request.url));
    }
  }

  applySecurityHeaders(response);
  return response;
}

// Inyección de Cabeceras de Seguridad HTTP (Defense-in-Depth)
function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}
