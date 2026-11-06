import { NextResponse } from 'next/server';

export async function GET() {
  const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
  const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'lanahora';

  try {
    const res = await fetch(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/.well-known/openid-configuration`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        available: true,
        realm: KEYCLOAK_REALM,
        issuer: data.issuer,
        tokenEndpoint: data.token_endpoint,
        authorizationEndpoint: data.authorization_endpoint,
      });
    }
    return NextResponse.json({ available: false }, { status: 503 });
  } catch {
    return NextResponse.json({ available: false }, { status: 503 });
  }
}

