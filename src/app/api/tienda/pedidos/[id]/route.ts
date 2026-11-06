import { NextResponse } from 'next/server';
import { tiendaStore } from '@/lib/store/tiendaStore';
import { requireAuth } from '@/lib/auth/serverAuth';

const PEDIDOS_AUTH_ROLES = ['ADMIN', 'DIRECTOR_GENERAL', 'MESA_CREDITO', 'ADMINISTRADOR'];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(req, PEDIDOS_AUTH_ROLES);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { estatus, guiaEnvio, paqueteria } = body;

    if (!estatus) {
      return NextResponse.json(
        { success: false, error: 'Estatus requerido' },
        { status: 400 }
      );
    }

    const pedidoActualizado = tiendaStore.actualizarEstatusPedido(
      id,
      estatus,
      guiaEnvio,
      paqueteria
    );

    if (!pedidoActualizado) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pedido: pedidoActualizado,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar pedido' },
      { status: 500 }
    );
  }
}
