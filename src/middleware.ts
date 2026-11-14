import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de DevSecOps:
 * 1. Sinergia y validación de perímetro Cloudflare Zero Trust
 * 2. Inyección de cabeceras HTTP de ciberseguridad (Security Headers)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Omitir recursos estáticos, imágenes y bundles compilados
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.jpg')
  ) {
    return NextResponse.next();
  }

  // 2. Validación de Perímetro Cloudflare Zero Trust
  // Activo en producción o cuando se defina ENFORCE_CLOUDFLARE_ZERO_TRUST=true
  const isZeroTrustEnforced =
    process.env.ENFORCE_CLOUDFLARE_ZERO_TRUST === 'true' ||
    (process.env.NODE_ENV === 'production' && Boolean(process.env.CLOUDFLARE_ZERO_TRUST_TEAM));

  if (isZeroTrustEnforced) {
    const cfJwtAssertion = request.headers.get('cf-access-jwt-assertion');
    const cfEmail = request.headers.get('cf-access-authenticated-user-email');

    // Bloquear intentos de bypass directo a la IP de origen del servidor
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

    // Validar dominio corporativo inyectado por la identidad autenticada de Cloudflare
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

  // 3. Inyección de Cabeceras de Seguridad (Defense-in-Depth)
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
