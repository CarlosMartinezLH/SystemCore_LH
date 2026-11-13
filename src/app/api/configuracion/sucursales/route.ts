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
    const {
      clave,
      nombre,
      nombreCompleto,
      direccion,
      ciudad,
      estado,
      telefono,
      responsable,
      latitud,
      longitud,
      distIdMin,
      distIdMax,
      limiteCredito,
      importeMaxCanje,
      maxNumCanjes,
      tabuladorTipo,
      gerente,
      gestorSucursal,
      abogado,
      abogadoCoordinador,
      imagenPromo,
      reqCartaPrestanombres,
      activo,
      noPuedeColocar,
      estatus,
    } = body;

    if (!nombre || !clave) {
      return NextResponse.json(
        { success: false, error: 'Nombre y clave de sucursal requeridos' },
        { status: 400 }
      );
    }

    const nueva = configuracionStore.crearSucursal({
      clave: clave.trim().toUpperCase(),
      nombre: nombre.trim().toUpperCase(),
      nombreCompleto: nombreCompleto?.trim() || nombre.trim().toUpperCase(),
      direccion: direccion || '',
      ciudad: ciudad || 'SALTILLO',
      estado: estado || 'COAHUILA',
      telefono: telefono || '',
      responsable: responsable || gerente || '',
      latitud: Number(latitud) || undefined,
      longitud: Number(longitud) || undefined,
      distIdMin: Number(distIdMin) || 1000,
      distIdMax: Number(distIdMax) || 3000,
      limiteCredito: Number(limiteCredito) || 30000,
      importeMaxCanje: Number(importeMaxCanje) || 0,
      maxNumCanjes: Number(maxNumCanjes) || 5,
      tabuladorTipo: Number(tabuladorTipo) || 1,
      gerente: gerente || '',
      gestorSucursal: gestorSucursal || '',
      abogado: abogado || '',
      abogadoCoordinador: abogadoCoordinador || '',
      imagenPromo: imagenPromo || '~\\images\\P',
      reqCartaPrestanombres: Boolean(reqCartaPrestanombres),
      activo: activo !== undefined ? Boolean(activo) : true,
      noPuedeColocar: Boolean(noPuedeColocar),
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
