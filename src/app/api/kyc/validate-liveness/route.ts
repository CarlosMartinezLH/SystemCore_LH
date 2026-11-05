import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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

    // 1. Limpiar header de data URL si viene presente
    const cleanBase64 = face.replace(/^data:image\/[a-z]+;base64,/, '');
    const rawBuffer = Buffer.from(cleanBase64, 'base64');

    // 2. Normalizar imagen con Sharp:
    // - .rotate(): Aplica físicamente la orientación EXIF de Android/Samsung para que el rostro quede vertical (0° portrait)
    // - .resize(): Tamaño óptimo para IA biométrica (max 900px)
    // - .jpeg(): Calidad 85 para balance perfecto entre resolución y velocidad
    let processedBase64 = cleanBase64;
    try {
      const processedBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({ width: 900, height: 1200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      processedBase64 = processedBuffer.toString('base64');
    } catch (sharpErr) {
      console.warn('[KYC Liveness] Error normalizando con sharp, usando imagen original:', sharpErr);
    }

    // 3. Invocar API Oficial de Biometría y Prueba de Vida de Nubarium
    const authHeader = 'Basic ' + Buffer.from('lanahora:#vEJfpcF#').toString('base64');
    
    try {
      const nubariumRes = await fetch('https://api.nubarium.com/global/biometrics/v1/liveness-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ face: processedBase64 }),
      });

      const nubariumData = await nubariumRes.json();
      console.log('[Nubarium Biometrics Response]:', nubariumData);

      // Si Nubarium detecta error, spoofing, lentes o anomalía biométrica
      if (nubariumData.status !== 'OK' || nubariumData.messageCode === 1 || (nubariumData.score !== undefined && nubariumData.score < 50)) {
        let motivoDetallado = 'Prueba de vida rechazada';
        let esLentes = true;

        if (nubariumData.message === 'Spoof detected') {
          motivoDetallado = 'Uso de lentes o alteración detectada. Para validar la prueba de vida ante la CNBV, retírese los lentes.';
          esLentes = true;
        } else if (nubariumData.message && nubariumData.message.toLowerCase().includes('face not found')) {
          motivoDetallado = 'No se detectó un rostro claro en el óvalo. Centre su rostro.';
          esLentes = false;
        } else if (nubariumData.message) {
          motivoDetallado = nubariumData.message;
        }

        return NextResponse.json({
          success: false,
          isValid: false,
          lentesDetectados: esLentes,
          provider: 'Nubarium Biometrics Latam',
          status: 'RECHAZADO',
          score: nubariumData.score ?? 0,
          validationCode: nubariumData.validationCode || '',
          message: motivoDetallado,
        });
      }

      // Si Nubarium aprueba con éxito (Rostro real, presente y sin lentes)
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
      console.warn('Error conectando a Nubarium:', nubariumErr);
      
      return NextResponse.json({
        success: false,
        isValid: false,
        lentesDetectados: false,
        provider: 'Nubarium Biometrics Latam',
        status: 'ERROR_CONEXION',
        message: 'Error temporal de conexión con el servicio biométrico Nubarium. Verifique su red.',
      }, { status: 502 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

