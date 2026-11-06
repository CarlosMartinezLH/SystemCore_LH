import { NextResponse } from 'next/server';
import { configuracionStore } from '@/lib/store/configuracionStore';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'toggleEstatus') {
      const usuario = configuracionStore.toggleEstatusUsuario(id);
      if (!usuario) {
        return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, usuario });
    }

    const actualizado = configuracionStore.actualizarUsuario(id, body);
    if (!actualizado) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, usuario: actualizado });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eliminado = configuracionStore.eliminarUsuario(id);
    if (!eliminado) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Usuario eliminado' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
