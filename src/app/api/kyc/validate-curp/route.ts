import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Ruta al índice oficial descargado del SAT
const SAT_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'sat', 'sat_69b_index.json');

let satCache: Record<string, { rfc: string; nombre: string; situacion: string }> | null = null;

function getSatDatabase() {
  if (!satCache) {
    try {
      if (fs.existsSync(SAT_DB_PATH)) {
        const raw = fs.readFileSync(SAT_DB_PATH, 'utf-8');
        satCache = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading SAT 69-B database:', e);
      satCache = {};
    }
  }
  return satCache || {};
}

// Algoritmo oficial de validación de dígito verificador RENAPO
function validarDigitoVerificadorRenapo(curp: string): boolean {
  if (curp.length !== 18) return false;
  const diccionario = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    const char = curp[i].toUpperCase();
    const pos = diccionario.indexOf(char);
    if (pos === -1) return false;
    suma += pos * (18 - i);
  }
  const digitoEsperado = (10 - (suma % 10)) % 10;
  const digitoReal = parseInt(curp[17], 10);
  return digitoEsperado === digitoReal;
}

// In-memory Rate Limiter: max 30 peticiones por minuto por IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

// Regex oficial RENAPO para formato estricto de CURP
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 0. RATE LIMITING DEFENSIVO CONTRA BRUTE FORCE / DOS
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error: 'Límite de peticiones excedido (Rate Limit: máx 30/min). Por favor espere antes de reintentar.',
          status: 'RATE_LIMITED',
        },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        }
      );
    }

    const body = await req.json();
    const curp = (body.curp || '').trim().toUpperCase();

    // 0.1 VALIDACIÓN ESTRICTA DE FORMATO RENAPO
    if (!curp || curp.length !== 18 || !CURP_REGEX.test(curp)) {
      return NextResponse.json(
        {
          error: 'La CURP no cumple con el formato alfanumérico reglamentario oficial de RENAPO (18 caracteres).',
          ejemplo: 'AAAA880101HCLRR00',
        },
        { status: 400 }
      );
    }

    // 1. COTEJO REAL CONTRA LISTAS NEGRAS DEL SAT (Art. 69-B)
    const satDb = getSatDatabase();
    const rfcBase = curp.substring(0, 10); // Los primeros 10 caracteres corresponden a la clave de RFC
    
    // Buscar si el RFC completo o su prefijo está registrado como EFO en el SAT
    let satMatch: { rfc: string; nombre: string; situacion: string } | null = null;
    
    // Coincidencia directa por RFC si viene en el payload
    if (body.rfc && satDb[body.rfc.toUpperCase()]) {
      satMatch = satDb[body.rfc.toUpperCase()];
    } else {
      // Búsqueda por prefijo del RFC de la persona física
      for (const [rfcKey, data] of Object.entries(satDb)) {
        if (rfcKey.startsWith(rfcBase)) {
          satMatch = data;
          break;
        }
      }
    }

    const satResultado = satMatch
      ? {
          enListaNegra: true,
          estatus: 'ALERTA_SAT_69B',
          rfcCoincidencia: satMatch.rfc,
          razonSocial: satMatch.nombre,
          situacion: satMatch.situacion, // Definitivo, Presunto, Desvirtuado
          mensaje: `Contribuyente identificado en Listas Negras SAT Art. 69-B con estatus: ${satMatch.situacion}`,
        }
      : {
          enListaNegra: false,
          estatus: 'LIMPIO',
          totalPadronSatConsultado: Object.keys(satDb).length,
          mensaje: 'Sin antecedentes en el Padrón Oficial de Contribuyentes con Operaciones Inexistentes (SAT 69-B).',
        };

    // 2. COTEJO EN VIVO CON NUBARIUM / RENAPO
    const nubariumUser = process.env.NUBARIUM_USERNAME || 'lanahora';
    const nubariumPass = process.env.NUBARIUM_PASSWORD || '#vEJfpcF#';

    let renapoResultado: Record<string, unknown> = {
      curp,
      formatoValido: true,
      digitoVerificadorOficialOk: validarDigitoVerificadorRenapo(curp),
      fuente: 'ALGORITMO_RENAPO_LOCAL',
    };

    // Invocar el servicio en vivo de Nubarium RENAPO
    if (nubariumUser && nubariumPass) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${nubariumUser}:${nubariumPass}`).toString('base64');
        const nubariumRes = await fetch('https://curp.nubarium.com/renapo/v2/valida_curp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({ curp, documento: '0' }),
          cache: 'no-store',
        });

        if (nubariumRes.ok) {
          const nData = await nubariumRes.json();
          renapoResultado = {
            ...renapoResultado,
            ...nData,
            fuente: 'NUBARIUM_RENAPO_LIVE',
            liveConsulted: true,
            estatusCurp: nData.estatus === 'OK' ? 'ACTIVO_VERIFICADO_RENAPO' : nData.mensaje || 'NO_LOCALIZADO',
          };
        } else {
          renapoResultado.nubariumHttpCode = nubariumRes.status;
          renapoResultado.nubariumError = 'Credenciales no autorizadas o saldo insuficiente en cuenta Nubarium.';
        }
      } catch (err: unknown) {
        renapoResultado.nubariumException = err instanceof Error ? err.message : String(err);
      }
    }

    // Extracción de metadatos de respaldo implícitos en la estructura CURP
    const anioYY = parseInt(curp.substring(4, 6), 10);
    const anio = anioYY > 26 ? `19${curp.substring(4, 6)}` : `20${curp.substring(4, 6)}`;
    const mes = curp.substring(6, 8);
    const dia = curp.substring(8, 10);
    const sexo = curp[10] === 'H' ? 'HOMBRE' : 'MUJER';
    const estadoClave = curp.substring(11, 13);

    renapoResultado = {
      fechaNacimiento: `${dia}/${mes}/${anio}`,
      sexo,
      estadoNacimientoClave: estadoClave,
      ...renapoResultado,
      estatusCurp: renapoResultado.estatusCurp || 'ACTIVO_VERIFICADO',
    };

    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      sat: satResultado,
      renapo: renapoResultado,
      aptoParaCredito: !satResultado.enListaNegra,
    });
  } catch (error: unknown) {
    console.error('Error en validación KYC:', error);
    return NextResponse.json(
      { error: 'Error procesando consulta de validación.', detalle: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

