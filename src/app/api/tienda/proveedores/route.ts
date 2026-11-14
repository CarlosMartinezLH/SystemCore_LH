import { NextResponse } from 'next/server';
import { ProveedoresService } from '@/lib/integrations/proveedoresService';
import { requireAuth } from '@/lib/auth/serverAuth';

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const proveedores = ProveedoresService.getProveedores();
    const dispatches = ProveedoresService.getDispatches();

    return NextResponse.json({
      success: true,
      proveedores,
      dispatches,
      totalProveedores: proveedores.length,
      totalOrdenesDespachadas: dispatches.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error al consultar proveedores' },
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
    const { action, proveedorId } = body;

    if (!proveedorId) {
      return NextResponse.json(
        { success: false, error: 'proveedorId requerido' },
        { status: 400 }
      );
    }

    if (action === 'test-connection') {
      const result = await ProveedoresService.testConnection(proveedorId);
      return NextResponse.json({ success: result.success, result });
    }

    if (action === 'sync-catalogo') {
      const log = await ProveedoresService.syncCatalogo(proveedorId);
      return NextResponse.json({ success: true, log });
    }

    return NextResponse.json(
      { success: false, error: 'Acción inválida. Usa "test-connection" o "sync-catalogo".' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error procesando solicitud de proveedor' },
      { status: 500 }
    );
  }
}
