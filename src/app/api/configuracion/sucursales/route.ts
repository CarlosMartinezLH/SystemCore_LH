import { NextResponse } from 'next/server';
import { configuracionStore } from '@/lib/store/configuracionStore';
import { requireAuth } from '@/lib/auth/serverAuth';

const ADMIN_ROLES = ['ADMIN', 'DIRECTOR_GENERAL', 'ADMINISTRADOR'];

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const sucursales = configuracionStore.getSucursales();
    return NextResponse.json({ success: true, sucursales });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener sucursales' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req, ADMIN_ROLES);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const body = await req.json();
    const { clave, nombre, direccion, ciudad, estado, telefono, responsable, estatus } = body;

    if (!nombre || !clave) {
      return NextResponse.json(
        { success: false, error: 'Nombre y clave de sucursal requeridos' },
        { status: 400 }
      );
    }

    const nueva = configuracionStore.crearSucursal({
      clave: clave.trim().toUpperCase(),
      nombre: nombre.trim(),
      direccion: direccion || '',
      ciudad: ciudad || 'Saltillo',
      estado: estado || 'Coahuila',
      telefono: telefono || '',
      responsable: responsable || '',
      estatus: estatus || 'ACTIVA',
    });

    return NextResponse.json({ success: true, sucursal: nueva });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear sucursal' },
      { status: 500 }
    );
  }
}
