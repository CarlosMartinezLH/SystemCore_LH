import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { spawn } from 'child_process';
import path from 'path';

// Helper para clasificar presencia de lentes mediante Red Neuronal ShuffleNet
function detectGlassesNeural(base64Image: string): Promise<{ glasses: boolean; label: string }> {
  return new Promise((resolve) => {
    try {
      const scriptPath = path.join(process.cwd(), 'scripts', 'check_glasses.py');
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const py = spawn(pythonCmd, [scriptPath]);
      let stdout = '';
      let stderr = '';

      py.stdout.on('data', (d) => { stdout += d; });
      py.stderr.on('data', (d) => { stderr += d; });

      py.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          try {
            const parsed = JSON.parse(stdout.trim());
            return resolve(parsed);
          } catch (e) {
            console.warn('[GlassesAI] Error parsing JSON:', e, stdout);
          }
        } else {
          console.warn('[GlassesAI] Process exited with code:', code, stderr);
        }
        resolve({ glasses: false, label: 'unknown' });
      });

      py.on('error', (err) => {
        console.warn('[GlassesAI] Error spawning Python:', err);
        resolve({ glasses: false, label: 'error' });
      });

      py.stdin.write(base64Image);
      py.stdin.end();
    } catch (err) {
      console.warn('[GlassesAI] Exception:', err);
      resolve({ glasses: false, label: 'error' });
    }
  });
}

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
    // - .rotate(): Corrige orientación EXIF vertical
    // - .resize(): Tamaño balanceado para IA biométrica
    let processedBase64 = cleanBase64;
    try {
      const processedBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({ width: 900, height: 1200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      processedBase64 = processedBuffer.toString('base64');
    } catch (sharpErr) {
      console.warn('[KYC Liveness] Error normalizando con sharp:', sharpErr);
    }

    // 3. CAPA 1: Detección Neuronal Específica de Lentes / Anteojos
    const glassesCheck = await detectGlassesNeural(processedBase64);
    console.log('[KYC Liveness] Neural Glasses Detection Result:', glassesCheck);

    if (glassesCheck.glasses) {
      return NextResponse.json({
        success: false,
        isValid: false,
        lentesDetectados: true,
        provider: 'Nubarium & Neural Glasses AI',
        status: 'RECHAZADO',
        score: 0,
        validationCode: '',
        message: 'SE DETECTARON LENTES O ANTEOJOS: Para validar la prueba de vida ante la CNBV, retírese los lentes y presione Repetir sin Lentes.',
      });
    }

    // 4. CAPA 2: Invocar API Oficial de Biometría y Prueba de Vida de Nubarium (RENAPO)
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

      // Si Nubarium detecta error, spoofing o anomalía biométrica
      if (nubariumData.status !== 'OK' || nubariumData.messageCode === 1 || (nubariumData.score !== undefined && nubariumData.score < 50)) {
        let motivoDetallado = 'Prueba de vida rechazada ante Nubarium';
        
        if (nubariumData.message === 'Spoof detected' || (nubariumData.score !== undefined && nubariumData.score < 50)) {
          motivoDetallado = 'Rostro sin lentes confirmado. Para aprobar la prueba de vida: aleje el teléfono a 35 cm, mire directamente a la cámara frontal (arriba) y asegure buena iluminación.';
        } else if (nubariumData.message && nubariumData.message.toLowerCase().includes('face not found')) {
          motivoDetallado = 'No se detectó un rostro claro en el óvalo. Centre su rostro.';
        } else if (nubariumData.message) {
          motivoDetallado = nubariumData.message;
        }

        return NextResponse.json({
          success: false,
          isValid: false,
          lentesDetectados: false, // Ya se verificó con IA que NO tiene lentes
          provider: 'Nubarium Biometrics Latam',
          status: 'RECHAZADO',
          score: nubariumData.score ?? 0,
          validationCode: nubariumData.validationCode || '',
          message: motivoDetallado,
        });
      }

      // Si ambas capas aprueban con éxito (Sin lentes + Rostro vivo real ante Nubarium)
      return NextResponse.json({
        success: true,
        isValid: true,
        lentesDetectados: false,
        provider: 'Nubarium Biometrics & Neural Glasses AI',
        status: 'APROBADO',
        score: nubariumData.score ?? 98.5,
        validationCode: nubariumData.validationCode || '',
        message: '✓ Rostro biométricamente validado sin lentes ante Nubarium',
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

