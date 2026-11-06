import { NextResponse } from 'next/server';
import { INSTITUTIONAL_USERS, UserSession, UserRole } from '@/types/auth';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'lanahora';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'systemcore-web';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || 'systemcore_keycloak_secret_2026';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Intentar autenticar contra Keycloak OIDC Token Endpoint
    try {
      const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
      const params = new URLSearchParams();
      params.append('client_id', KEYCLOAK_CLIENT_ID);
      params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
      params.append('grant_type', 'password');
      params.append('username', cleanEmail);
      params.append('password', password);

      const kcRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        cache: 'no-store',
      });

      if (kcRes.ok) {
        const tokenData = await kcRes.json();
        const accessToken = tokenData.access_token;

        // Decodificar payload del JWT (segundo segmento base64)
        const payloadBase64 = accessToken.split('.')[1];
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));

        const roles: string[] = payload.realm_access?.roles || [];
        const sucursal = payload.sucursal || 'Corporativo Saltillo';
        const puesto = payload.puesto || 'Usuario Institucional';

        let role: UserRole = 'ADMINISTRADOR';
        let branchScope: 'ALL' | 'BRANCH' = 'ALL';

        if (roles.includes('DIRECTOR_GENERAL') || roles.includes('ADMIN')) {
          role = 'ADMINISTRADOR';
          branchScope = 'ALL';
        } else if (roles.includes('MESA_CREDITO')) {
          role = 'MESA_CREDITO';
          branchScope = 'ALL';
        } else if (roles.includes('COORDINADOR_COMERCIAL')) {
          role = 'COORDINADOR_COMERCIAL';
          branchScope = 'BRANCH';
        } else if (roles.includes('ASESOR_CAMPO')) {
          role = 'ASESOR_CAMPO';
          branchScope = 'BRANCH';
        }

        const userSession: UserSession & { token?: string } = {
          id: `kc-${payload.sub || 'user'}`,
          name: payload.name || cleanEmail,
          email: payload.email || cleanEmail,
          role,
          roleLabel: `${puesto} (${sucursal})`,
          branch: sucursal,
          branchScope,
          avatarInitials: (payload.given_name?.[0] || 'L') + (payload.family_name?.[0] || 'H'),
          token: accessToken,
        };

        return NextResponse.json({
          success: true,
          provider: 'KEYCLOAK',
          session: userSession,
        });
      }
    } catch (kcErr) {
      console.warn('Keycloak no disponible, evaluando respaldo institucional local:', kcErr);
    }

    // 2. Respaldo contra catálogo institucional si Keycloak estuviera temporalmente inaccesible
    const matchedUser = INSTITUTIONAL_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && (u.password === password || !u.password)
    );

    if (matchedUser) {
      return NextResponse.json({
        success: true,
        provider: 'LOCAL_FALLBACK',
        session: matchedUser,
      });
    }

    return NextResponse.json(
      { error: 'Credenciales inválidas. Verifique su correo institucional y contraseña.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error en autenticación' }, { status: 500 });
  }
}

