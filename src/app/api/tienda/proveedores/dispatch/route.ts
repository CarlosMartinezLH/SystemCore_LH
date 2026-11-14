import { NextResponse } from 'next/server';
import { ProveedoresService } from '@/lib/integrations/proveedoresService';
import { tiendaStore } from '@/lib/store/tiendaStore';
import { requireAuth } from '@/lib/auth/serverAuth';

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const body = await req.json();
    const { pedidoId, proveedorId } = body;

    if (!pedidoId) {
      return NextResponse.json(
        { success: false, error: 'pedidoId requerido para despacho' },
        { status: 400 }
      );
    }

    const pedidos = tiendaStore.getPedidos();
    const pedido = pedidos.find((p) => p.id === pedidoId || p.folio === pedidoId);

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const dispatchResult = await ProveedoresService.dispatchOrderToProveedor({
      pedido,
      proveedorId,
    });

    if (!dispatchResult.success || !dispatchResult.dispatch) {
      return NextResponse.json(
        { success: false, error: dispatchResult.error || 'Fallo al despachar orden a la API del proveedor' },
        { status: 502 }
      );
    }

    // Actualizar pedido en TiendaStore con la orden de compra y guía retornada por el proveedor
    tiendaStore.actualizarEstatusPedido(
      pedido.id,
      'EN_TRANSITO',
      dispatchResult.dispatch.guiaRastreo,
      dispatchResult.dispatch.paqueteria
    );

    return NextResponse.json({
      success: true,
      dispatch: dispatchResult.dispatch,
      mensaje: `Orden ${dispatchResult.dispatch.ordenCompraExterna} colocada exitosamente con ${dispatchResult.dispatch.proveedorNombre}. Guía asignada: ${dispatchResult.dispatch.guiaRastreo}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error en despacho a proveedor' },
      { status: 500 }
    );
  }
}
