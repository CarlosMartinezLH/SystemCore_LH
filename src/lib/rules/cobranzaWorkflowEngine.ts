// ==============================================================================
// LanAhora SystemCore — Motor Oficial de Cobranza y Migración de Cartera
// Documento Oficial: Flujo Operaciones -> Gestores de Cobranza -> Prelegal -> Legal
// ==============================================================================

export type EtapaCobranza = 'OPERACIONES' | 'COBRANZA' | 'PRELEGAL' | 'LEGAL';

export interface EvaluacionCobranzaDV {
  noDist: number;
  nombre: string;
  diasAtraso: number;
  maxDiasAtrasoCorte: number;
  saldoAtrasado: number;
  pagosPuntualesConsecutivos: number;
  etapaActual: EtapaCobranza;
  estatusColocacion: 'ACTIVO' | 'BLOQUEADO' | 'CANCELADO_MORA' | 'COBRANZA_LEGAL';
  puedeHacerVales: boolean;
  motivoBloqueo?: string;
  quincenasFaltantesParaDesbloqueo: number;
}

/**
 * Determina la etapa de cartera según los días de atraso
 */
export function obtenerEtapaCobranza(diasAtraso: number): EtapaCobranza {
  if (diasAtraso <= 0) return 'OPERACIONES';
  if (diasAtraso <= 30) return 'COBRANZA';
  if (diasAtraso <= 120) return 'PRELEGAL';
  return 'LEGAL';
}

/**
 * Evalúa las reglas oficiales de candado de colocación y reactivación
 * 1. Al día 1 de atraso se bloquea la cuenta y se prohíbe la colocación.
 * 2. Si cae en día 1 de atraso: requiere 1 pago puntual para reactivar.
 * 3. Si cae en día 2 de atraso: requiere 2 pagos puntuales consecutivos.
 * 4. Si cae en día 3 o más de atraso: requiere 3 pagos puntuales consecutivos.
 */
export function evaluarEstatusColocacionDV(params: {
  noDist: number;
  nombre: string;
  diasAtraso: number;
  maxDiasAtrasoEnCiclo: number;
  saldoAtrasado: number;
  pagosPuntualesConsecutivos: number;
  estatusManual?: string;
}): EvaluacionCobranzaDV {
  const {
    noDist,
    nombre,
    diasAtraso,
    maxDiasAtrasoEnCiclo,
    saldoAtrasado,
    pagosPuntualesConsecutivos,
  } = params;

  const etapa = obtenerEtapaCobranza(diasAtraso);

  // Si está en mora activa (días > 0 o saldo atrasado > 0)
  if (diasAtraso > 0 || saldoAtrasado > 1.0) {
    let estatus: EvaluacionCobranzaDV['estatusColocacion'] = 'BLOQUEADO';
    if (etapa === 'LEGAL') estatus = 'COBRANZA_LEGAL';
    else if (etapa === 'PRELEGAL' || etapa === 'COBRANZA') estatus = 'CANCELADO_MORA';

    return {
      noDist,
      nombre,
      diasAtraso,
      maxDiasAtrasoCorte: maxDiasAtrasoEnCiclo,
      saldoAtrasado,
      pagosPuntualesConsecutivos,
      etapaActual: etapa,
      estatusColocacion: estatus,
      puedeHacerVales: false,
      motivoBloqueo: `Cuenta en mora activa (${diasAtraso} días de atraso, saldo vencido: $${saldoAtrasado.toLocaleString()}). Asignada a etapa ${etapa}.`,
      quincenasFaltantesParaDesbloqueo: maxDiasAtrasoEnCiclo >= 3 ? 3 : maxDiasAtrasoEnCiclo === 2 ? 2 : 1,
    };
  }

  // Si ya está al corriente (días = 0 y saldo atrasado = 0), validar reglas de pagos puntuales consecutivos requeridos
  let quincenasRequeridas = 0;
  if (maxDiasAtrasoEnCiclo === 1) {
    quincenasRequeridas = 1;
  } else if (maxDiasAtrasoEnCiclo === 2) {
    quincenasRequeridas = 2;
  } else if (maxDiasAtrasoEnCiclo >= 3) {
    quincenasRequeridas = 3;
  }

  const quincenasFaltantes = Math.max(0, quincenasRequeridas - pagosPuntualesConsecutivos);
  const estaDesbloqueado = quincenasFaltantes === 0;

  return {
    noDist,
    nombre,
    diasAtraso: 0,
    maxDiasAtrasoCorte: maxDiasAtrasoEnCiclo,
    saldoAtrasado: 0,
    pagosPuntualesConsecutivos,
    etapaActual: 'OPERACIONES',
    estatusColocacion: estaDesbloqueado ? 'ACTIVO' : 'BLOQUEADO',
    puedeHacerVales: estaDesbloqueado,
    motivoBloqueo: estaDesbloqueado
      ? undefined
      : `Cuenta al corriente pero en periodo de prueba por haber acumulado ${maxDiasAtrasoEnCiclo} días de atraso. Requiere ${quincenasRequeridas} pagos puntuales consecutivos (ha cubierto ${pagosPuntualesConsecutivos}, faltan ${quincenasFaltantes}).`,
    quincenasFaltantesParaDesbloqueo: quincenasFaltantes,
  };
}

/**
 * Matriz de Calendario de Migraciones Oficiales
 */
export const CALENDARIO_MIGRACIONES = {
  cierresDeMes: ['Día 5 de cada mes', 'Día 20 de cada mes'],
  migracionAutomatica: {
    diasEjecucion: [6, 21],
    reglaInhabil: 'Si el día 6 o 21 cae en domingo o día festivo oficial, se ejecuta el siguiente día hábil.',
    horarios: [
      {
        etapa: 'Tipo 1 a Tipo 2 (Operaciones a Gestoría)',
        condicion: 'Cuentas con 1 día vencido',
        hora: '12:00 PM',
        destino: 'Usuario genérico de gestoría por sucursal',
      },
      {
        etapa: 'Tipo 2 a Tipo 3 (Gestoría a Prelegal)',
        condicion: 'Cuentas con 31 días vencidos cumplidos',
        hora: '12:00 PM',
        destino: 'Usuario genérico de prelegal por sucursal',
      },
      {
        etapa: 'Tipo 3 a Tipo 4 (Prelegal a Legal)',
        condicion: 'Cuentas con 121 días vencidos cumplidos',
        hora: '04:00 PM',
        destino: 'Usuario genérico de legal por sucursal (Coordinador Jurídico)',
      },
      {
        etapa: 'Tipo 2 a Tipo 1 (Normalización y retorno)',
        condicion: 'Cuenta normalizada a 0 días de atraso (sin convenio ni restructura)',
        hora: 'Barridos diarios a las 12:00 PM, 03:00 PM y 06:00 PM',
        destino: 'Retorna al Coordinador original asignado',
      },
    ],
  },
  reportesAuditoria: [
    'Reporte de saldos vencidos totales (Instantánea)',
    'Reporte de saldos vencidos capital (Instantánea)',
    'Reporte de cuentas transferidas por tipo 1, 2 y 3',
  ],
};
