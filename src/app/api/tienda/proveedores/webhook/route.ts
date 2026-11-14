import { NextResponse } from 'next/server';
import { ProveedoresService } from '@/lib/integrations/proveedoresService';
import { tiendaStore } from '@/lib/store/tiendaStore';

/**
 * Webhook para recepción de eventos de rastreo y guías de paqueterías / proveedores mayoristas
 * (FedEx, DHL, Estafeta, Syscom, Ingram, etc.)
 */
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-provider-signature') || req.headers.get('x-webhook-secret');
    const body = await req.json();

    const { ordenCompraExterna, guiaRastreo, paqueteria, estatusEnvio, pedidoFolio } = body;

    if (!ordenCompraExterna || !guiaRastreo) {
      return NextResponse.json(
        { success: false, error: 'ordenCompraExterna y guiaRastreo requeridos' },
        { status: 400 }
      );
    }

    const nuevoEstatus =
      estatusEnvio === 'ENTREGADO'
        ? 'ENTREGADO'
        : estatusEnvio === 'CANCELADO'
        ? 'CANCELADO'
        : 'EN_TRANSITO';

    // 1. Actualizar orden en ProveedoresService
    const updated = ProveedoresService.processWebhookTracking({
      ordenCompraExterna,
      guiaRastreo,
      paqueteria: paqueteria || 'FedEx Express',
      nuevoEstatus,
    });

    // 2. Si se proporcionó pedidoFolio o se encuentra la orden, actualizar pedido en LanaTienda
    if (pedidoFolio) {
      tiendaStore.actualizarEstatusPedido(pedidoFolio, nuevoEstatus, guiaRastreo, paqueteria);
    }

    return NextResponse.json({
      success: true,
      mensaje: `Webhook procesado con éxito. Guía ${guiaRastreo} actualizada para PO ${ordenCompraExterna}.`,
      updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error procesando webhook' },
      { status: 500 }
    );
  }
}
