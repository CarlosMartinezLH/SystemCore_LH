import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export interface DecodedToken {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  sucursal?: string;
  scope?: 'ALL' | 'BRANCH';
  puesto?: string;
  mfaMethod?: string;
  device?: string;
  iat?: number;
  exp?: number;
}

export interface AuthValidationResult {
  ok: boolean;
  status?: number;
  error?: string;
  user?: DecodedToken;
}

// Clave secreta criptográfica institucional para firma HMAC-SHA256
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.KEYCLOAK_CLIENT_SECRET ||
  'lanahora_systemcore_production_secret_key_2026';

/**
 * Emite un token JWT institucional firmado con HMAC-SHA256
 */
export function signSessionToken(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verifica criptográficamente un token JWT institucional
 */
export function verifySessionToken(token: string): { ok: boolean; payload?: DecodedToken; error?: string } {
  if (!token || typeof token !== 'string') {
    return { ok: false, error: 'Token no proporcionado.' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'Formato de token JWT inválido (se requieren 3 segmentos).' };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  // Comparación criptográfica en tiempo constante (timingSafeEqual) para mitigar Timing Attacks
  const sigBuffer = Buffer.from(signatureB64);
  const expBuffer = Buffer.from(expectedSignature);

  let isMatch = false;
  if (sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    isMatch = true;
  } else {
    // Compatibilidad con firma base64 estándar
    const legacySig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64');
    if (signatureB64 === legacySig) {
      isMatch = true;
    }
  }

  if (!isMatch) {
    return { ok: false, error: 'Firma criptográfica inválida o token manipulado.' };
  }

  let payload: DecodedToken;
  try {
    const raw = Buffer.from(payloadB64, 'base64url').toString('utf8');
    payload = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Payload del token corrupto o ilegible.' };
  }

  // Validación de expiración
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return { ok: false, error: 'La sesión ha expirado. Por favor inicia sesión nuevamente.' };
  }

  return { ok: true, payload };
}

/**
 * Validador estricto de autenticación y control de acceso basado en roles (RBAC)
 */
export function requireAuth(
  req: NextRequest | Request,
  allowedRoles: string[] = []
): AuthValidationResult {
  try {
    const authHeader = req.headers.get('authorization') || '';
    let token = '';

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    } else {
      const sessionToken = req.headers.get('x-session-token');
      if (sessionToken) {
        token = sessionToken.trim();
      }
    }

    if (!token) {
      return {
        ok: false,
        status: 401,
        error: 'Acceso no autorizado: Token de autenticación requerido (Bearer OIDC).',
      };
    }

    // Verificación criptográfica obligatoria
    const verification = verifySessionToken(token);
    if (!verification.ok || !verification.payload) {
      return {
        ok: false,
        status: 401,
        error: verification.error || 'Token de sesión inválido.',
      };
    }

    const payload = verification.payload;

    // Control de roles RBAC
    if (allowedRoles.length > 0) {
      const userRoles: string[] = payload.realm_access?.roles || [];
      const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasPermission) {
        return {
          ok: false,
          status: 403,
          error: `Acceso denegado: El usuario no cuenta con los privilegios necesarios (${allowedRoles.join(
            ', '
          )}).`,
        };
      }
    }

    return {
      ok: true,
      user: payload,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 401,
      error: 'Error validando credenciales de acceso: ' + (err?.message || 'Token inválido'),
    };
  }
}
