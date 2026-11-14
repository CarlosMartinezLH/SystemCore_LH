import { NextResponse } from 'next/server';
import { tiendaStore } from '@/lib/store/tiendaStore';
import { requireAuth } from '@/lib/auth/serverAuth';

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(req.url);
    const distribuidoraId = searchParams.get('distribuidoraId') || undefined;

    const pedidos = tiendaStore.getPedidos(distribuidoraId);

    return NextResponse.json({
      success: true,
      pedidos,
      total: pedidos.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const body = await req.json();
    const {
      distribuidoraId,
      distribuidoraNombre,
      clienteId,
      clienteNombre,
      sku,
      cantidad = 1,
      tipoEntrega,
      direccionEntrega,
      referenciasDomicilio,
      telefonoContacto,
      metodoPago = 'CREDITO_LANATIENDA',
      puntosCanjeados = 0,
    } = body;

    if (!distribuidoraId || !clienteId || !sku || !tipoEntrega || !direccionEntrega) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios para registrar el pedido' },
        { status: 400 }
      );
    }

    const resultado = tiendaStore.crearPedido({
      distribuidoraId,
      distribuidoraNombre: distribuidoraNombre || 'Elena LanAhora',
      clienteId,
      clienteNombre,
      sku,
      cantidad: Number(cantidad) || 1,
      tipoEntrega,
      direccionEntrega,
      referenciasDomicilio: referenciasDomicilio || '',
      telefonoContacto: telefonoContacto || '',
      metodoPago,
      puntosCanjeados: Number(puntosCanjeados) || 0,
    });

    if (!resultado.success) {
      return NextResponse.json({ success: false, error: resultado.error }, { status: 422 });
    }

    const distActual = tiendaStore.getDistribuidora(distribuidoraId);

    return NextResponse.json({
      success: true,
      pedido: resultado.pedido,
      creditoCoreId: resultado.creditoCoreId,
      disponibleRestante: distActual.disponibleLanaTienda,
      monederoRestante: distActual.monedero,
      mensaje: `Pedido ${resultado.pedido?.folio} registrado exitosamente.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar pedido' },
      { status: 500 }
    );
  }
}

