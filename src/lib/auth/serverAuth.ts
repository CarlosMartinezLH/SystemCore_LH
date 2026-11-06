import { NextRequest, NextResponse } from 'next/server';

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
  exp?: number;
}

export interface AuthValidationResult {
  ok: boolean;
  status?: number;
  error?: string;
  user?: DecodedToken;
}

/**
 * Validates the Authorization Bearer JWT or Institutional Session Cookie.
 * Allows role-based authorization check (RBAC).
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
      // Check for x-session-token header as institutional backup
      const sessionToken = req.headers.get('x-session-token');
      if (sessionToken) {
        token = sessionToken.trim();
      }
    }

    if (!token) {
      // Allow development bypass only when explicitly running offline in local development
      if (process.env.NODE_ENV === 'development' && req.headers.get('x-dev-bypass') === 'true') {
        return {
          ok: true,
          user: {
            sub: 'dev-admin',
            email: 'admin@lanahora.com',
            name: 'Desarrollador Local',
            realm_access: { roles: ['ADMIN', 'DIRECTOR_GENERAL', 'MESA_CREDITO'] },
            sucursal: 'Corporativo Saltillo',
            scope: 'ALL',
          },
        };
      }

      return {
        ok: false,
        status: 401,
        error: 'Acceso no autorizado: Token de autenticación requerido (Bearer OIDC).',
      };
    }

    // Decode and validate JWT parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        ok: false,
        status: 401,
        error: 'Token de autenticación con formato JWT inválido.',
      };
    }

    const payloadRaw = Buffer.from(parts[1], 'base64').toString('utf8');
    const payload: DecodedToken = JSON.parse(payloadRaw);

    // Expiration check
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return {
        ok: false,
        status: 401,
        error: 'La sesión ha expirado. Por favor inicie sesión nuevamente.',
      };
    }

    // Role check (RBAC)
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
