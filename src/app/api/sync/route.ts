import { NextRequest, NextResponse } from 'next/server';
import {
  getServerSyncData,
  recordCanjeSync,
  recordClienteSync,
  recordPagoSync,
  recordCreditoSync,
} from '@/lib/store/serverSyncStore';

// GET: Retorna todo el estado sincronizado del Core
export async function GET() {
  try {
    const data = getServerSyncData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Recibe eventos desde la App Móvil (Flutter) o Web y los replica en todo el sistema
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Falta campo action' },
        { status: 400 }
      );
    }

    if (action === 'CANJE_COMPLETED') {
      const result = recordCanjeSync(payload);
      return NextResponse.json({
        success: true,
        message: 'Canje registrado con éxito en Dispersión STP y Cartera',
        result,
      });
    }

    if (action === 'NUEVO_CLIENTE') {
      const result = recordClienteSync(payload);
      return NextResponse.json({
        success: true,
        message: 'Cliente registrado con éxito en Personas y CRM',
        result,
      });
    }

    if (action === 'REGISTRAR_PAGO') {
      const result = recordPagoSync(payload);
      return NextResponse.json({
        success: true,
        message: 'Pago registrado con éxito y reflejado en Distribuidor',
        result,
      });
    }

    if (action === 'NUEVO_CREDITO') {
      const result = recordCreditoSync(payload);
      return NextResponse.json({
        success: true,
        message: 'Crédito registrado con éxito en Core y Cartera',
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: `Acción no soportada: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

