import { setVapidDetails, sendNotification } from 'web-push';
import { getPushSubscriptions, removePushSubscription } from './store/serverSyncStore';

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BFDy2CwbSkeP1gE-Klz7QDteiOpVKM7JzXMuxpXbxiux_RcM3wqS9mTeKxy4tDsccW95-aa0l1CRu9FnJ59ynog';

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  '6U5Zi8NK43BJ8cMQGoJLE0pYJ_V1ZS3nMNK2qfnMZ9E';

const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:soporte@lanahora.com.mx';

// Inicializar configuración VAPID
try {
  setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('[WebPush] Error inicializando VAPID:', e);
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  category?: string;
  meta?: Record<string, unknown>;
}

/**
 * Despacha la notificación WebPush real hacia todos los teléfonos y navegadores registrados.
 * Funciona sobre datos móviles (4G/5G) y cualquier red remota a través de Google FCM / Mozilla Push Service.
 */
export async function sendWebPushNotification(payload: WebPushPayload): Promise<{
  successCount: number;
  failureCount: number;
  totalSubscribers: number;
}> {
  const subscriptions = getPushSubscriptions();
  let successCount = 0;
  let failureCount = 0;

  if (subscriptions.length === 0) {
    console.log('[WebPush] No hay dispositivos suscritos actualmente.');
    return { successCount: 0, failureCount: 0, totalSubscribers: 0 };
  }

  const notificationData = JSON.stringify({
    title: payload.title || 'LanApp (Distribuidoras)',
    body: payload.body || 'Notificación de LanAhora',
    icon: payload.icon || '/icon.png',
    badge: payload.badge || '/favicon-32x32.png',
    tag: payload.tag || `lanapp-${Date.now()}`,
    url: payload.url || '/lanapp',
    category: payload.category,
    meta: payload.meta,
  });

  const pushPromises = subscriptions.map(async (sub) => {
    try {
      await sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        },
        notificationData,
        {
          TTL: 86400, // 24 horas en cola si el teléfono está apagado
          urgency: 'high',
        }
      );
      successCount++;
    } catch (err: unknown) {
      failureCount++;
      const error = err as { statusCode?: number; message?: string };
      console.warn(`[WebPush] Falló envío a endpoint:`, error?.message || error);

      // Si el token expiró (410 Gone o 404 Not Found), remover la suscripción
      if (error?.statusCode === 410 || error?.statusCode === 404) {
        removePushSubscription(sub.endpoint);
      }
    }
  });

  await Promise.allSettled(pushPromises);

  console.log(
    `[WebPush] Resumen de envío push: ${successCount} exitosos, ${failureCount} fallidos (Total registrados: ${subscriptions.length})`
  );

  return {
    successCount,
    failureCount,
    totalSubscribers: subscriptions.length,
  };
}
