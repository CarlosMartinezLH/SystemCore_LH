import nodemailer from 'nodemailer';

interface SendOtpEmailParams {
  to: string;
  code: string;
  actionTitle?: string;
  actionDetails?: string;
}

export async function sendOtpEmail({
  to,
  code,
  actionTitle = 'Inicio de Sesión en SystemCore',
  actionDetails = 'Acceso a la plataforma institucional',
}: SendOtpEmailParams): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Seguridad LanAhora" <${user || 'seguridad@lanahora.com'}>`;

  console.log(`[EmailService] Preparando envío de código [${code}] a: ${to}`);

  // Si no se han configurado credenciales en .env.local
  if (!user || !pass) {
    console.warn(
      '[EmailService] AVISO: SMTP_USER y SMTP_PASS no están configurados en .env.local. ' +
      'Configura tus credenciales SMTP para el envío real a bandejas de correo.'
    );
    return {
      success: false,
      error: 'Servidor SMTP no configurado en .env.local (SMTP_USER / SMTP_PASS requeridos).',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Seguridad LanAhora</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0f172a; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 18px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; text-align: center; }
    .action-badge { display: inline-block; padding: 4px 12px; background-color: #f1f5f9; border-radius: 20px; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
    .code-box { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .code-digits { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; margin: 0; }
    .expiry { font-size: 11px; color: #94a3b8; font-weight: 600; }
    .footer { padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>LanAhora SystemCore</h1>
    </div>
    <div class="content">
      <div class="action-badge">${actionTitle}</div>
      <div class="title">Código de Autorización Requerido</div>
      <div class="subtitle">
        Para confirmar tu operación (${actionDetails}), utiliza el siguiente código de seguridad de 6 dígitos:
      </div>
      <div class="code-box">
        <p class="code-digits">${code}</p>
      </div>
      <div class="expiry">⏱ Este código es de un solo uso y expira en 10 minutos.</div>
    </div>
    <div class="footer">
      Este es un correo automático de seguridad institucional. Si tú no solicitaste este código, comunícate de inmediato con el Administrador del Sistema.
      <br><br>
      © 2026 LanAhora · Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Código de Seguridad LanAhora: ${code}`,
      text: `Tu código de seguridad para ${actionTitle} es: ${code}. Válido por 10 minutos.`,
      html: htmlContent,
    });

    console.log(`[EmailService] ✓ Correo enviado exitosamente a ${to}. MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EmailService] ✕ Error enviando correo a ${to}:`, error);
    return { success: false, error: error.message || 'Error al conectar con servidor SMTP' };
  }
}
