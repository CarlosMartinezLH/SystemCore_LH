import { NextResponse } from 'next/server';
import { configuracionStore } from '@/lib/store/configuracionStore';

export async function GET() {
  try {
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

