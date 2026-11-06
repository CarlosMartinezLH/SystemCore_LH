import { NextResponse } from 'next/server';
import { configuracionStore } from '@/lib/store/configuracionStore';
import { requireAuth } from '@/lib/auth/serverAuth';

const ADMIN_ROLES = ['ADMIN', 'DIRECTOR_GENERAL', 'ADMINISTRADOR'];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(req, ADMIN_ROLES);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action === 'toggleEstatus') {
      const sucursal = configuracionStore.toggleEstatusSucursal(id);
      if (!sucursal) {
        return NextResponse.json({ success: false, error: 'Sucursal no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, sucursal });
    }

    const actualizada = configuracionStore.actualizarSucursal(id, body);
    if (!actualizada) {
      return NextResponse.json({ success: false, error: 'Sucursal no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, sucursal: actualizada });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar sucursal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(req, ADMIN_ROLES);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const eliminada = configuracionStore.eliminarSucursal(id);
    if (!eliminada) {
      return NextResponse.json({ success: false, error: 'Sucursal no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Sucursal eliminada' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar sucursal' },
      { status: 500 }
    );
  }
}
