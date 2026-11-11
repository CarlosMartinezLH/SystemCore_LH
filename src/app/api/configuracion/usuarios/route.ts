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

    const usuarios = configuracionStore.getUsuarios();
    return NextResponse.json({ success: true, usuarios });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener usuarios' },
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
      name,
      email,
      role,
      roleLabel,
      branch,
      branchScope,
      telefono,
      puesto,
      estatus,
      allowedModules,
      permissions,
      password,
    } = body;

    if (!name || !email || !branch) {
      return NextResponse.json(
        { success: false, error: 'Nombre, correo y sucursal requeridos' },
        { status: 400 }
      );
    }

    const nuevo = configuracionStore.crearUsuario({
      name: name.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      puesto: puesto || roleLabel || 'Colaborador Institucional',
      role: role || 'ASESOR_CAMPO',
      roleLabel: roleLabel || 'Asesor de Campo',
      branch: branch.trim(),
      branchScope: branchScope || 'BRANCH',
      telefono: telefono || '',
      estatus: estatus || 'ACTIVO',
      allowedModules: allowedModules || [],
      permissions: permissions || undefined,
      password: password || 'lanahora2026',
    });

    return NextResponse.json({ success: true, usuario: nuevo });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
