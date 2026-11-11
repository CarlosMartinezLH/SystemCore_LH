import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const ADB_PATH = 'C:\\Users\\carlo\\platform-tools\\adb.exe';
const TEMP_FILE = path.join(process.cwd(), 'scripts', 'last_notif.txt');

/**
 * Envía una notificación corporativa de alta fidelidad estilo WhatsApp / LanApp
 * directamente al dispositivo Android / Samsung Galaxy conectado por USB/ADB.
 */
export function sendAdbSystemNotification(
  title: string,
  body: string,
  category: string = 'RECORDATORIO_PAGO',
  recipientName: string = 'Todas las Distribuidoras'
): void {
  try {
    let appLabel = 'LanAhora Móvil';
    if (category === 'COBRO_VALE') {
      appLabel = 'LanApp · Vales Digitales';
    } else if (category === 'RECORDATORIO_PAGO') {
      appLabel = 'LanApp · Fechas de Corte';
    } else if (category === 'AVISO_INSTITUCIONAL') {
      appLabel = 'LanApp · Comunicados';
    } else if (category === 'PROMOCION') {
      appLabel = 'LanApp · Bonificaciones';
    }

    const cleanTitle = title.replace(/[\r\n]+/g, ' ').trim();
    const cleanBody = body.replace(/[\r\n]+/g, ' ').trim();
    const shortText = cleanBody.length > 90 ? cleanBody.slice(0, 87) + '...' : cleanBody;

    // Escribir archivo estructurado en utf-8
    // L1: App Label / Summary
    // L2: Título destacado
    // L3: Texto corto
    // L4: Cuerpo completo extendido
    const content = `${appLabel}\n${cleanTitle}\n${shortText}\n${cleanBody}\n`;
    fs.writeFileSync(TEMP_FILE, content, 'utf8');

    // Despachar a través de adb push y notify.sh
    const pushMsgCmd = `"${ADB_PATH}" push "${TEMP_FILE}" /data/local/tmp/last_notif.txt`;
    const execNotifyCmd = `"${ADB_PATH}" shell "sh /data/local/tmp/notify.sh"`;

    exec(`${pushMsgCmd} && ${execNotifyCmd}`, { timeout: 5000 }, (err) => {
      if (err) {
        // Dispositivo desconectado o ADB no disponible en este momento
      } else {
        console.log(`[ADB Notification] Notificación despachada a Android: [${appLabel}] ${cleanTitle}`);
      }
    });
  } catch (error) {
    console.warn('[ADB Notification] Error despachando notificación:', error);
  }
}
