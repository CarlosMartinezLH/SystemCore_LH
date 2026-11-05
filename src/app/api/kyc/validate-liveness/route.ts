import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { face } = body;

    if (!face) {
      return NextResponse.json(
        { success: false, error: 'Falta la imagen facial en Base64' },
        { status: 400 }
      );
    }

    // Limpiar header de data URL si viene presente (e.g., data:image/jpeg;base64,...)
    const cleanBase64 = face.replace(/^data:image\/[a-z]+;base64,/, '');

    // 1. Invocar API Oficial de Biometría y Prueba de Vida de Nubarium
    const authHeader = 'Basic ' + Buffer.from('lanahora:#vEJfpcF#').toString('base64');
    
    try {
      const nubariumRes = await fetch('https://api.nubarium.com/global/biometrics/v1/liveness-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ face: cleanBase64 }),
      });

      const nubariumData = await nubariumRes.json();
      console.log('[Nubarium Biometrics Response]:', nubariumData);

      // Si Nubarium detecta error, spoofing, lentes o anomalía biométrica
      if (nubariumData.status !== 'OK' || nubariumData.messageCode === 1 || (nubariumData.score !== undefined && nubariumData.score < 50)) {
        let motivoDetallado = 'Prueba de vida rechazada';
        if (nubariumData.message === 'Spoof detected') {
          motivoDetallado = 'Uso de lentes o reflejo en micas detectado. Debe retirarse los lentes.';
        } else if (nubariumData.message) {
          motivoDetallado = nubariumData.message;
        }

        return NextResponse.json({
          success: false,
          isValid: false,
          lentesDetectados: true,
          provider: 'Nubarium Biometrics Latam',
          status: 'RECHAZADO',
          score: nubariumData.score ?? 0,
          validationCode: nubariumData.validationCode || '',
          message: motivoDetallado,
        });
      }

      // Si Nubarium aprueba con éxito
      return NextResponse.json({
        success: true,
        isValid: true,
        lentesDetectados: false,
        provider: 'Nubarium Biometrics Latam',
        status: 'APROBADO',
        score: nubariumData.score ?? 98.5,
        validationCode: nubariumData.validationCode || '',
        message: 'Rostro biométricamente validado sin lentes ante Nubarium',
      });
    } catch (nubariumErr) {
      console.warn('Error conectando a Nubarium, aplicando validación de respaldo:', nubariumErr);
      
      // Fallback local si la conexión externa falla temporalmente
      return NextResponse.json({
        success: false,
        isValid: false,
        lentesDetectados: true,
        provider: 'Nubarium Biometrics Fallback',
        status: 'RECHAZADO',
        message: 'No fue posible validar la prueba de vida con Nubarium. Por favor reintente sin lentes.',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
