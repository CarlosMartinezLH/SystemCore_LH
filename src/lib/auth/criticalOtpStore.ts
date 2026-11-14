import crypto from 'crypto';

export interface CriticalOtpEntry {
  email: string;
  code: string;
  action: string;
  details: string;
  expiresAt: number;
  createdAt: number;
  attempts: number;
}

// Almacén seguro en memoria para códigos OTP de operaciones críticas
const otpStore = new Map<string, CriticalOtpEntry>();

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'tu***@lanahora.com';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.max(local.length - 2, 3))}${local[local.length - 1]}@${domain}`;
}

export function generateCriticalOtp(
  email: string,
  action: string,
  details: string
): { success: boolean; emailMasked: string; expiresInSeconds: number; devCode: string } {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Generar código numérico de 6 dígitos con aleatoriedad criptográfica
  const buffer = crypto.randomBytes(4);
  const codeNum = (buffer.readUInt32BE(0) % 900000) + 100000;
  const code = codeNum.toString();

  const expiresInSeconds = 600; // 10 minutos de vigencia
  const expiresAt = Date.now() + expiresInSeconds * 1000;

  const key = `${normalizedEmail}:${action}`;
  otpStore.set(key, {
    email: normalizedEmail,
    code,
    action,
    details,
    expiresAt,
    createdAt: Date.now(),
    attempts: 0,
  });

  // Simulación de envío por correo SMTP corporativo
  console.log(`\n======================================================`);
  console.log(`[CORREO INSTITUCIONAL LANAHORA] - OPERACIÓN CRÍTICA`);
  console.log(`Destinatario: ${normalizedEmail}`);
  console.log(`Acción:       ${action}`);
  console.log(`Detalle:      ${details}`);
  console.log(`CÓDIGO DE SEGURIDAD (6 DÍGITOS): [ ${code} ]`);
  console.log(`Válido por:   10 minutos`);
  console.log(`======================================================\n`);

  return {
    success: true,
    emailMasked: maskEmail(normalizedEmail),
    expiresInSeconds,
    devCode: code,
  };
}

export function verifyCriticalOtp(
  email: string,
  code: string,
  action: string
): { success: boolean; error?: string; verifiedToken?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const key = `${normalizedEmail}:${action}`;
  const entry = otpStore.get(key);

  if (!entry) {
    return {
      success: false,
      error: 'No hay un código activo para esta operación. Solicita uno nuevo.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return {
      success: false,
      error: 'El código de seguridad ha expirado. Solicita uno nuevo.',
    };
  }

  if (entry.attempts >= 4) {
    otpStore.delete(key);
    return {
      success: false,
      error: 'Demasiados intentos fallidos. Por seguridad, solicita un nuevo código.',
    };
  }

  if (entry.code.trim() !== code.trim()) {
    entry.attempts += 1;
    return {
      success: false,
      error: `Código incorrecto. Te quedan ${4 - entry.attempts} intentos.`,
    };
  }

  // Código correcto: se consume y genera un token único de verificación
  otpStore.delete(key);
  const verifiedToken = crypto.randomBytes(24).toString('hex');

  return {
    success: true,
    verifiedToken,
  };
}
