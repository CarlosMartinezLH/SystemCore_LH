import { NextResponse } from 'next/server';
import { generateCriticalOtp, verifyCriticalOtp } from '@/lib/auth/criticalOtpStore';
import { requireAuth } from '@/lib/auth/serverAuth';

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }
    const body = await req.json();
    const { mode, email, actionType, details, code } = body;

    // Obtener el correo del usuario (desde auth o del cuerpo)
    const targetEmail = email || auth.user?.email || 'admin@lanahora.com';

    if (mode === 'request') {
      if (!actionType) {
        return NextResponse.json(
          { success: false, error: 'Se requiere el tipo de acción crítica (actionType)' },
          { status: 400 }
        );
      }

      const res = await generateCriticalOtp(
        targetEmail,
        actionType,
        details || 'Confirmación de operación crítica de seguridad'
      );

      return NextResponse.json({
        success: true,
        emailMasked: res.emailMasked,
        expiresInSeconds: res.expiresInSeconds,
      });
    }

    if (mode === 'verify') {
      if (!code || !actionType) {
        return NextResponse.json(
          { success: false, error: 'Código de 6 dígitos y actionType requeridos' },
          { status: 400 }
        );
      }

      const res = verifyCriticalOtp(targetEmail, code, actionType);
      if (!res.success) {
        return NextResponse.json(
          { success: false, error: res.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        verifiedToken: res.verifiedToken,
        message: 'Código verificado exitosamente.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Modo inválido. Use "request" o "verify".' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error en el servidor de verificación OTP' },
      { status: 500 }
    );
  }
}
