import { NextResponse } from 'next/server';
import { tiendaStore } from '@/lib/store/tiendaStore';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || 'DV-0042';

    const distribuidora = tiendaStore.getDistribuidora(id);
    const clientes = tiendaStore.getClientes(id);

    return NextResponse.json({
      success: true,
      distribuidora,
      clientes,
      sucursalPredeterminada: distribuidora.sucursal,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener datos de distribuidora' },
      { status: 500 }
    );
  }
}

