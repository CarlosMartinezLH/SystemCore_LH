import { NextRequest, NextResponse } from 'next/server';
import { addPushSubscriptionSync, getPushSubscriptions } from '@/lib/store/serverSyncStore';
import { getVapidPublicKey, sendWebPushNotification } from '@/lib/webPushService';

// GET: Retorna la clave pública VAPID y el total de dispositivos conectados
export async function GET() {
  try {
    const publicKey = getVapidPublicKey();
    const subs = getPushSubscriptions();
    return NextResponse.json({
      success: true,
      publicKey,
      totalSubscribers: subs.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Registra la suscripción WebPush del celular (Samsung S25 Ultra / Chrome / PWA)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, distribuidorId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Suscripción WebPush inválida' },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || 'Mobile Device';

    addPushSubscriptionSync({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      distribuidorId: distribuidorId || 1002,
      userAgent,
    });

    console.log(`[WebPush] ¡Nuevo dispositivo móvil registrado exitosamente para notificaciones en la nube!`);

    // Enviar notificación de bienvenida instantánea para confirmar vinculación
    sendWebPushNotification({
      title: '¡LanApp Vinculada con Éxito! 🎉',
      body: 'Tu celular está configurado para recibir alertas de vales cobrados y recordatorios de pago en tiempo real.',
      url: '/lanapp',
      category: 'AVISO_INSTITUCIONAL',
    }).catch((e) => console.warn('Error bienvenida push:', e));

    return NextResponse.json({
      success: true,
      message: 'Dispositivo suscrito exitosamente a notificaciones remotas',
      totalSubscribers: getPushSubscriptions().length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
