import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

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
  const from = process.env.SMTP_FROM || `"LanAhora Seguridad" <${user || 'seguridad@lanahora.com'}>`;

  console.log(`[EmailService] Preparando envío de código [${code}] a: ${to}`);

  if (!user || !pass) {
    console.warn(
      '[EmailService] AVISO: SMTP_USER y SMTP_PASS no están configurados en .env.local.'
    );
    return {
      success: false,
      error: 'Servidor SMTP no configurado en .env.local.',
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

    // Formatear fecha y hora en zona horaria institucional (Saltillo / Monterrey / CDMX)
    const formattedDate = new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Monterrey',
    }).format(new Date());

    // Separar los 6 dígitos para renderizado tipo Token Bancario Fintech
    const digits = (code || '000000').slice(0, 6).split('');
    const digitCellsHtml = digits
      .map(
        (d) => `
        <td style="width: 44px; height: 54px; background-color: #ffffff; border: 2px solid #cbd5e1; border-radius: 10px; font-size: 28px; font-weight: 800; color: #0f172a; text-align: center; vertical-align: middle; font-family: 'Courier New', Courier, monospace; box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05); padding: 0;">
          ${d}
        </td>`
      )
      .join('<td style="width: 8px;"></td>');

    // Comprobar existencia del logo en disco para adjunto CID
    const logoPath = path.join(process.cwd(), 'public', 'lanahora-logo.png');
    const hasLogo = fs.existsSync(logoPath);

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Seguridad · LanAhora</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Tarjeta Principal -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
          
          <!-- Barra de Acento Superior Corporativo -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #0f172a 0%, #1e3a8a 35%, #f59e0b 70%, #10b981 100%);"></td>
          </tr>

          <!-- Header con Logo Oficial LanAhora -->
          <tr>
            <td align="center" style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              ${
                hasLogo
                  ? `<img src="cid:lanahoraLogo" alt="LanAhora" width="175" style="display: block; max-width: 175px; height: auto; border: 0;" />`
                  : `<div style="font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">LanAhora <span style="color: #f59e0b;">SystemCore</span></div>`
              }
              <div style="display: inline-block; margin-top: 12px; padding: 4px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 9999px; font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase;">
                🔒 Seguridad Institucional · OTP
              </div>
            </td>
          </tr>

          <!-- Contenido Central -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; text-align: center;">
              
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -0.3px;">
                Código de Autorización Requerido
              </h1>
              
              <p style="font-size: 13px; line-height: 1.5; color: #475569; margin: 0 0 20px 0;">
                Para confirmar la operación <strong style="color: #0f172a;">${actionTitle}</strong> en la plataforma <strong style="color: #0f172a;">SystemCore</strong>, introduce el siguiente código de 6 dígitos:
              </p>

              <!-- Tabla de Token Bancario (6 celdas individuales) -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 16px auto;">
                <tr>
                  ${digitCellsHtml}
                </tr>
              </table>

              <!-- Badge de Vigencia -->
              <div style="display: inline-block; padding: 6px 14px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 24px;">
                ⏱ Código de un solo uso · Expira en 10 minutos
              </div>

              <!-- Ficha Informativa de la Solicitud -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; text-align: left; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 11px; color: #64748b; font-weight: 600; padding: 3px 0;">Detalle:</td>
                  <td style="font-size: 11px; color: #0f172a; font-weight: 700; text-align: right; padding: 3px 0;">${actionDetails}</td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #64748b; font-weight: 600; padding: 3px 0;">Fecha y hora:</td>
                  <td style="font-size: 11px; color: #0f172a; font-weight: 700; text-align: right; padding: 3px 0;">${formattedDate} (Centro de México)</td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #64748b; font-weight: 600; padding: 3px 0;">Destinatario:</td>
                  <td style="font-size: 11px; color: #1d4ed8; font-weight: 700; font-family: monospace; text-align: right; padding: 3px 0;">${to}</td>
                </tr>
              </table>

              <!-- Aviso de Ciberseguridad -->
              <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 10px; padding: 12px 14px; text-align: left; margin-bottom: 12px;">
                <p style="font-size: 11px; line-height: 1.4; color: #9f1239; margin: 0; font-weight: 500;">
                  🛡️ <strong>Aviso de Ciberseguridad:</strong> Ningún colaborador de LanAhora te solicitará este código por WhatsApp, llamada o mensaje. Si tú no realizaste esta acción, comunícate inmediatamente con TI.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer Institucional -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center;">
              <p style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">
                LanAhora — ¡En Ti confiamos!
              </p>
              <p style="font-size: 10px; color: #94a3b8; line-height: 1.4; margin: 0 0 8px 0;">
                Corporativo Saltillo, Coahuila · México · Plataforma Central SystemCore 2.0
              </p>
              <p style="font-size: 9px; color: #cbd5e1; margin: 0;">
                Este es un mensaje institucional cifrado generado automáticamente. Por favor no respondas a este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const attachments = hasLogo
      ? [
          {
            filename: 'lanahora-logo.png',
            path: logoPath,
            cid: 'lanahoraLogo',
          },
        ]
      : [];

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Código de Seguridad LanAhora: ${code}`,
      text: `Tu código de seguridad para ${actionTitle} es: ${code}. Válido por 10 minutos.`,
      html: htmlContent,
      attachments,
    });

    console.log(`[EmailService] ✓ Correo enviado exitosamente a ${to}. MessageId: ${info.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EmailService] ✕ Error enviando correo a ${to}:`, error);
    return { success: false, error: error.message || 'Error al conectar con servidor SMTP' };
  }
}

