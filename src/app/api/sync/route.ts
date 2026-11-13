import { NextRequest, NextResponse } from 'next/server';
import {
  getServerSyncData,
  recordCanjeSync,
  recordClienteSync,
  updateClienteSync,
  recordPagoSync,
  recordSpeiInboundSync,
  recordCreditoSync,
  sendNotificationSync,
  updateNotificationRulesSync,
  markNotificationReadSync,
  setMobileNotificationPermissionSync,
  recordPasarACoreSync,
  recordProspectoAPersonasSync,
} from '@/lib/store/serverSyncStore';
import { sendAdbSystemNotification } from '@/lib/adbNotifications';
import { sendWebPushNotification } from '@/lib/webPushService';
import { formatMoney } from '@/lib/utils/formatters';

// GET: Retorna todo el estado sincronizado del Core
export async function GET() {
  try {
    const data = getServerSyncData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Recibe eventos desde la App Móvil (Flutter) o Web y los replica en todo el sistema
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Falta campo action' },
        { status: 400 }
      );
    }

    if (action === 'CANJE_COMPLETED') {
      const result = recordCanjeSync(payload);

      // Despachar alerta instantánea a teléfono Samsung/Android conectado
      if (result?.notifCobro) {
        sendAdbSystemNotification(
          result.notifCobro.title,
          result.notifCobro.body,
          'COBRO_VALE',
          result.notifCobro.recipientName
        );

        // Despachar WebPush en la nube a celulares conectados por 4G/5G / Wi-Fi remota
        sendWebPushNotification({
          title: result.notifCobro.title,
          body: result.notifCobro.body,
          category: 'COBRO_VALE',
          url: '/lanapp',
        }).catch((e) => console.warn('WebPush error:', e));
      }

      return NextResponse.json({
        success: true,
        message: 'Canje registrado con éxito en Dispersión STP y Cartera',
        result,
      });
    }

    if (action === 'NUEVO_CLIENTE') {
      const result = recordClienteSync(payload);
      return NextResponse.json({
        success: true,
        message: 'Cliente registrado con éxito en Personas y CRM',
        result,
      });
    }

    if (action === 'UPDATE_CLIENTE') {
      const result = updateClienteSync(payload);
      return NextResponse.json({
        success: true,
        message: 'Cliente actualizado con éxito en Personas y Core',
        result,
      });
    }

    if (action === 'REGISTRAR_PAGO') {
      const result = recordPagoSync(payload);

      // Despachar recibo instantáneo a móvil
      const pagoTitle = '¡Abono Registrado!';
      const pagoBody = `Se registró tu pago por ${formatMoney(payload.monto || 0)} MXN. Tu nuevo saldo ha sido actualizado.`;

      sendAdbSystemNotification(
        pagoTitle,
        pagoBody,
        'RECORDATORIO_PAGO',
        payload.distribuidorNombre || 'Distribuidora'
      );

      sendWebPushNotification({
        title: pagoTitle,
        body: pagoBody,
        category: 'RECORDATORIO_PAGO',
        url: '/lanapp',
      }).catch((e) => console.warn('WebPush error:', e));

      return NextResponse.json({
        success: true,
        message: 'Pago registrado con éxito y reflejado en Distribuidor',
        result,
      });
    }

    if (action === 'REGISTRAR_SPEI_INBOUND') {
      const result = recordSpeiInboundSync(payload);

      // Despachar recibo instantáneo a móvil
      const pagoTitle = '¡SPEI Recibido y Aplicado!';
      const pagoBody = `Recibimos tu transferencia SPEI por ${formatMoney(result.pagoSpei.montoDepositado)} MXN (+ ${formatMoney(result.pagoSpei.montoBonificacion)} de Bonificación). Tu línea disponible subió a ${formatMoney(result.pagoSpei.lineaNuevaDisponible)}.`;

      sendAdbSystemNotification(
        pagoTitle,
        pagoBody,
        'RECORDATORIO_PAGO',
        result.pagoSpei.distribuidorNombre || 'Distribuidora'
      );

      sendWebPushNotification({
        title: pagoTitle,
        body: pagoBody,
        category: 'RECORDATORIO_PAGO',
        url: '/lanapp',
      }).catch((e) => console.warn('WebPush error:', e));

      return NextResponse.json({
        success: true,
        message: 'Pago SPEI entrante procesado y cascada aplicada exitosamente',
        result,
      });
    }

    if (action === 'NUEVO_CREDITO') {
      const result = recordCreditoSync(payload);
      if (result && typeof result === 'object' && 'rechazado' in result && result.rechazado) {
        return NextResponse.json({
          success: false,
          error: result.error,
          codigoError: result.codigoError,
          errores: result.errores,
        }, { status: 422 });
      }
      return NextResponse.json({
        success: true,
        message: 'Crédito registrado con éxito en Core y Cartera',
        result,
      });
    }

    if (action === 'SEND_NOTIFICATION') {
      const result = sendNotificationSync(payload);

      // Despachar notificación profesional estilo WhatsApp/LanApp al Samsung S25 Ultra conectado por USB
      if (payload?.title && payload?.body) {
        sendAdbSystemNotification(
          payload.title,
          payload.body,
          payload.category || 'RECORDATORIO_PAGO',
          payload.recipientName || 'Todas las Distribuidoras'
        );

        // Despachar WebPush en la nube a celulares conectados por 4G/5G / Wi-Fi remota
        sendWebPushNotification({
          title: payload.title,
          body: payload.body,
          category: payload.category || 'RECORDATORIO_PAGO',
          url: '/lanapp',
          meta: payload.meta,
        }).catch((e) => console.warn('WebPush error:', e));
      }

      return NextResponse.json({
        success: true,
        message: 'Notificación emitida exitosamente hacia las aplicaciones móviles',
        result,
      });
    }

    if (action === 'UPDATE_NOTIFICATION_RULES') {
      const result = updateNotificationRulesSync(payload);
      return NextResponse.json({
        success: true,
        message: 'Reglas de alertas actualizadas con éxito',
        result,
      });
    }

    if (action === 'MARK_NOTIFICATION_READ') {
      const result = markNotificationReadSync(payload?.id);
      return NextResponse.json({
        success: true,
        message: 'Notificación marcada como leída',
        result,
      });
    }

    if (action === 'SET_MOBILE_NOTIFICATION_PERMISSION') {
      const result = setMobileNotificationPermissionSync(Boolean(payload?.accepted));
      return NextResponse.json({
        success: true,
        message: 'Permiso de notificaciones actualizado en la app móvil',
        result,
      });
    }

    if (action === 'PASAR_A_CORE') {
      const result = recordPasarACoreSync(payload?.prospectId);
      return NextResponse.json({
        success: result.success,
        message: result.message,
        result,
      });
    }

    if (action === 'SYNC_PROSPECTO_PERSONAS') {
      const result = recordProspectoAPersonasSync(payload?.prospectId, payload?.targetStage);
      return NextResponse.json({
        success: result.success,
        message: result.message,
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: `Acción no soportada: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

