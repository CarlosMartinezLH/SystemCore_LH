// ==============================================================================
// LanAhora SystemCore — Algoritmos Oficiales STP y Validación CLABE (ABM)
// Documento de Integración Oficial: STP Enlace Financiero & Reglas ABM
// ==============================================================================

// Ponderación oficial de 17 dígitos definida por la Asociación de Bancos de México (ABM)
const PONDERACION_CLABE = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];

/**
 * Calcula el dígito verificador para los primeros 17 dígitos de una cuenta CLABE
 * siguiendo estrictamente el algoritmo oficial ABM:
 * 1. Multiplica cada dígito por su factor de ponderación [3, 7, 1...].
 * 2. Toma el módulo 10 de cada producto.
 * 3. Suma los resultados.
 * 4. A = suma mod 10
 * 5. B = 10 - A
 * 6. Digito = B mod 10
 */
export function calcularDigitoVerificadorClabe(cuenta17: string): number {
  const digits = cuenta17.replace(/\D/g, '');
  if (digits.length !== 17) {
    throw new Error('Se requieren exactamente 17 dígitos numéricos para calcular el dígito verificador CLABE.');
  }

  let suma = 0;
  for (let i = 0; i < 17; i++) {
    const d = parseInt(digits[i], 10);
    const prod = (d * PONDERACION_CLABE[i]) % 10;
    suma += prod;
  }

  const a = suma % 10;
  const b = (10 - a) % 10;
  return b;
}

/**
 * Valida una cuenta CLABE de 18 dígitos según el estándar ABM y Banco de México
 */
export function validarClabe(clabe18: string): {
  valida: boolean;
  banco?: string;
  digitoCalculado?: number;
  digitoEsperado?: number;
  error?: string;
} {
  const clean = clabe18.replace(/\s+/g, '').replace(/\D/g, '');

  if (clean.length !== 18) {
    return {
      valida: false,
      error: `La CLABE debe contener exactamente 18 dígitos numéricos (recibidos: ${clean.length}).`,
    };
  }

  const primeros17 = clean.substring(0, 17);
  const digitoRecibido = parseInt(clean[17], 10);
  const digitoCalculado = calcularDigitoVerificadorClabe(primeros17);

  if (digitoRecibido !== digitoCalculado) {
    return {
      valida: false,
      digitoCalculado,
      digitoEsperado: digitoRecibido,
      error: `Dígito verificador inválido: se calculó ${digitoCalculado} pero la CLABE indica ${digitoRecibido}.`,
    };
  }

  // Identificar banco emisor por código de 3 dígitos
  const codigoBanco = clean.substring(0, 3);
  const bancoNombre = CATALOGO_BANCOS_CLABE[codigoBanco] || 'Institución Financiera Registrada';

  return {
    valida: true,
    banco: bancoNombre,
    digitoCalculado,
    digitoEsperado: digitoRecibido,
  };
}

/**
 * Genera una cuenta CLABE personalizada STP (Institución 646 - STP)
 * Estructura STP: 646 [Plaza 3d] [Prefijo 4d] [Consecutivo 7d] [DV 1d]
 */
export function generarClabeSTP(
  plaza: string = '180',
  centroCosto: string = '000',
  consecutivo: string | number
): string {
  const plazaStr = plaza.padStart(3, '0').slice(0, 3);
  const centroStr = centroCosto.padStart(3, '0').slice(0, 3);
  const consecStr = String(consecutivo).padStart(8, '0').slice(0, 8);
  const primeros17 = `646${plazaStr}${centroStr}${consecStr}`;
  const dv = calcularDigitoVerificadorClabe(primeros17);
  return `${primeros17}${dv}`;
}

// Catálogo abreviado de códigos bancarios de 3 dígitos ABM
export const CATALOGO_BANCOS_CLABE: Record<string, string> = {
  '646': 'STP (Sistema de Transferencias y Pagos)',
  '002': 'BANAMEX (Banco Nacional de México)',
  '012': 'BBVA BANCOMER',
  '014': 'SANTANDER',
  '021': 'HSBC',
  '072': 'BANORTE (Banco Mercantil del Norte)',
  '036': 'INBURSA',
  '044': 'SCOTIABANK INVERLAT',
  '058': 'BANREGIO',
  '127': 'BANCO AZTECA',
  '136': 'INTERBANCO',
  '137': 'BANCOPPEL',
  '846': 'STP ENLACE FINANCIERO (Ambiente de Pruebas)',
};

/**
 * Interface del payload de orden de pago STP SPEI OUT
 */
export interface STPOrdenPagoPayload {
  institucionContraparte: number | string;
  empresa: string;
  fechaOperacion?: number | string;
  folioOrigen?: string;
  claveRastreo: string;
  institucionOperante: number | string;
  monto: number;
  tipoPago: number;
  tipoCuentaOrdenante?: number;
  nombreOrdenante?: string;
  cuentaOrdenante?: string;
  rfcCurpOrdenante?: string;
  tipoCuentaBeneficiario: number;
  nombreBeneficiario: string;
  cuentaBeneficiario: string;
  rfcCurpBeneficiario?: string;
  emailBeneficiario?: string;
  conceptoPago: string;
  referenciaNumerica: number;
  topologia?: string;
  medioEntrega?: number;
  prioridad?: number;
  iva?: number;
  latitud?: string;
  longitud?: string;
}

/**
 * Genera la Cadena Original canónica para firma electrónica RSA-SHA256
 * conforme a la especificación oficial de STP Enlace Financiero (34 campos delimitados por pipes).
 */
export function generarCadenaOriginalSTP(o: STPOrdenPagoPayload): string {
  let cadena = '||';
  cadena += `${o.institucionContraparte}|`;
  cadena += `${o.empresa}|`;
  cadena += `${o.fechaOperacion || ''}||`; // fechaOperacion + campo reservado
  cadena += `${o.claveRastreo}|`;
  cadena += `${o.institucionOperante}|`;
  cadena += `${o.monto.toFixed(2)}|`;
  cadena += `${o.tipoPago}|||`; // tipoPago + 2 campos reservados

  if (o.nombreOrdenante) {
    cadena += `${o.nombreOrdenante}|`;
  }
  if (o.cuentaOrdenante) {
    cadena += `${o.cuentaOrdenante}|`;
  }
  if (o.rfcCurpOrdenante) {
    cadena += `${o.rfcCurpOrdenante}|`;
  }

  cadena += '|'; // separador adicional
  cadena += `${o.tipoCuentaBeneficiario}|`;
  cadena += `${o.nombreBeneficiario}|`;
  cadena += `${o.cuentaBeneficiario}|`;
  cadena += `${o.rfcCurpBeneficiario || 'ND'}||||||`; // rfc + 5 pipes reservados
  cadena += `${o.conceptoPago}||||||`; // concepto + 5 pipes reservados
  cadena += `${o.referenciaNumerica}||`; // referencia + 1 pipe reservado
  cadena += `${o.topologia || 'T'}||||||`; // topologia + 5 pipes finales
  cadena += '||'; // cierre canónico

  return cadena;
}
