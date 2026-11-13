// ==============================================================================
// LanAhora SystemCore — Motor Central de Reglas de Negocio Financieras
// Implementación fiel de dbo.CreditoGeneraCanje, Amortizaciones, Comisiones,
// Incrementos de Línea y Políticas Oficiales de Distribuidoras
// ==============================================================================

import {
  DistribuidorCategoria,
  DistribuidorPerfil,
  CATEGORIAS_CONFIG,
  COMISIONES_POR_PERFIL,
  TASAS_POR_PLAZO,
  COSTOS_SEGURO,
  FACTORES_LANATIENDA,
  INCREMENTOS_VALE_LANA,
  BC_SCORE_RANGOS,
  CreditoValidationResult,
} from '@/types/businessRules';
import { PersonaCore, DistribuidorCore, CreditoCore } from '@/types/core';
import { formatMoney } from '@/lib/utils/formatters';

export interface ParametrosValidacionCanje {
  // Datos del crédito
  importe: number;
  plazos: number;
  folioVale?: string;
  isCreditoDigital?: boolean;
  requiereDistribuidor?: boolean; // false = Vale Cliente Final | true = Préstamo Distribuidor
  tipoDesembolsoId?: number; // 5 = STP SPEI, 1 = Efectivo, 2 = Cheque
  cuentaBancariaValida?: boolean;

  // Sujetos involucrados
  distribuidor: DistribuidorCore;
  cliente: PersonaCore;
  todosLosCreditos?: CreditoCore[];
  todasLasPersonas?: PersonaCore[];

  // Modos de operación y omisión
  noRealizarValidaciones?: boolean;
  isReestructura?: boolean;
  fechaOperacion?: Date;
}

/**
 * Matriz Oficial de Validaciones: dbo.CreditoGeneraCanje (C1-C29, D1-D3, V1-V19)
 */
export function validarCreditoGeneraCanje(
  params: ParametrosValidacionCanje
): CreditoValidationResult {
  const errores: Array<{ codigo: string; mensaje: string }> = [];
  const advertencias: string[] = [];
  const {
    importe,
    plazos,
    folioVale,
    isCreditoDigital = true,
    requiereDistribuidor = false,
    tipoDesembolsoId = 5,
    distribuidor,
    cliente,
    todosLosCreditos = [],
    todasLasPersonas = [],
    noRealizarValidaciones = false,
    isReestructura = false,
    fechaOperacion = new Date(),
  } = params;

  // --------------------------------------------------------------------------
  // GRUPO 1: SIEMPRE SE EJECUTA (Reglas Críticas de Sistema, Contrato y Sucursal)
  // --------------------------------------------------------------------------

  // C1: Interés fijo calculable
  if (plazos > 2 && !TASAS_POR_PLAZO[plazos]) {
    errores.push({
      codigo: 'C1',
      mensaje: 'NO SE PUDO CALCULAR EL IMPORTE INTERES A UTILIZAR.',
    });
  }

  // C3: Folio cancelado global
  const FOLIOS_CANCELADOS_GLOBAL = ['0', 'CANCELADO', 'ANULADO'];
  if (folioVale && FOLIOS_CANCELADOS_GLOBAL.includes(folioVale.toUpperCase())) {
    errores.push({
      codigo: 'C3',
      mensaje: 'ESTOS FOLIOS SE ENCUENTRAN CANCELADOS PARA CUALQUIER DISTRIBUIDOR..',
    });
  }

  // C4: Pagaré del cliente
  if (cliente.pagareEstatusId === 'SIN PAGARE' && !isCreditoDigital) {
    errores.push({
      codigo: 'C4',
      mensaje: `ClienteId: ${cliente.personaId}, NO CUENTA PAGARE PARA PARA PODER CANJEAR....`,
    });
  }

  // C8: Castigo del distribuidor por mora
  if (distribuidor.fechaCastigo) {
    const fechaCastigo = new Date(distribuidor.fechaCastigo);
    if (fechaCastigo >= new Date(fechaOperacion.setHours(0, 0, 0, 0))) {
      errores.push({
        codigo: 'C8',
        mensaje: 'DISTRIBUIDOR TIENE UNA FECHA DE CASTIGO POR NO PAGAR A TIEMPO...',
      });
    }
  }

  // C10: Crédito activo con otro distribuidor
  const creditoOtroDist = todosLosCreditos.find(
    (c) =>
      c.clienteNombre.toUpperCase() === `${cliente.nombre} ${cliente.apellidoPaterno}`.toUpperCase() &&
      c.estatus === 'VIGENTE' &&
      c.noDist !== distribuidor.noDist
  );
  if (creditoOtroDist) {
    errores.push({
      codigo: 'C10',
      mensaje: 'ESTE CLIENTE TIENE UN CREDITO CON OTRO DISTRIBUIDOR...',
    });
  }

  // C11 & C12: Cartera legal y atraso
  if (cliente.buroInternoEstatus === 'NO SUJETO DE CREDITO' || cliente.buroInternoEstatus === 'BLOQUEADO') {
    errores.push({
      codigo: 'C11',
      mensaje: 'ESTE CLIENTE CUENTA CON UN CREDITO EN CARTERA LEGAL O EN MORA....',
    });
  }

  // C14: Desembolso STP en fin de semana (política preventiva)
  const diaSemana = fechaOperacion.getDay(); // 0 = Domingo, 6 = Sábado
  // En operaciones 24/7 de LanApp digital se permite con advertencia
  if (tipoDesembolsoId === 5 && (diaSemana === 0 || diaSemana === 6)) {
    advertencias.push('Desembolso en fin de semana: se programará en la ventana bancaria SPEI activa.');
  }

  // C15: Estatus del distribuidor
  if (distribuidor.estatus === 'CANCELADO') {
    errores.push({
      codigo: 'C15',
      mensaje: `NO CUENTA CON UN ESTATUS VALIDO PARA CANJEAR....DISTRIBUIDOR:${distribuidor.noDist}`,
    });
  }

  // C16: Datos bancarios requeridos para dispersión STP
  if (tipoDesembolsoId === 5 && (!cliente.clabe || cliente.clabe.length < 16)) {
    errores.push({
      codigo: 'C16',
      mensaje: 'NO CUENTA CON LOS DATOS BANCARIOS.... (Tarjeta o CLABE de 18 dígitos requerida)',
    });
  }

  // C17: Género definido
  if (!cliente.sexoId) {
    errores.push({
      codigo: 'C17',
      mensaje: 'DEBE DEFINIR EL GENERO DEL CLIENTE...',
    });
  }

  // C18: Dirección completa
  if (!cliente.direccion || cliente.direccion.trim().length < 10) {
    errores.push({
      codigo: 'C18',
      mensaje: `PERSONAID:${cliente.personaId}, FALTAN DATOS EN LA DIRECCIÓN DEL CLIENTE. DEBE CAPTURARLOS PARA CONTINUAR...`,
    });
  }

  // C22: Un crédito por día
  const fechaHoyStr = fechaOperacion.toLocaleDateString('es-MX');
  const creditoHoy = todosLosCreditos.find(
    (c) =>
      c.clienteNombre.toUpperCase() === `${cliente.nombre} ${cliente.apellidoPaterno}`.toUpperCase() &&
      c.fechaOtorgamiento === fechaHoyStr &&
      c.estatus === 'VIGENTE'
  );
  if (creditoHoy) {
    errores.push({
      codigo: 'C22',
      mensaje: 'ESTA PERSONA YA TIENE UN CREDITO CAPTURADO EL DIA DE HOY....',
    });
  }

  // --------------------------------------------------------------------------
  // GRUPO 2: BLOQUE PROTEGIDO (Políticas de Negocio, Montos, Buró, Plazos)
  // --------------------------------------------------------------------------
  if (!noRealizarValidaciones && !isReestructura) {
    // C23: Buró interno
    if (cliente.buroInternoEstatus !== 'NORMAL') {
      errores.push({
        codigo: 'C23',
        mensaje: 'EL CLIENTE ESTA BLOQUEADO EN BURO INTERNO..',
      });
    }

    // C26: Mínimo global ($1,000.00)
    if (importe < 1000) {
      errores.push({
        codigo: 'C26',
        mensaje: 'EL IMPORTE MINIMO A PRESTAR ES DE $1,000.00.',
      });
    }

    // C27: Celular repetido en otra persona
    if (cliente.telefono) {
      const otroConMismoTel = todasLasPersonas.find(
        (p) => p.personaId !== cliente.personaId && p.telefono && p.telefono === cliente.telefono
      );
      if (otroConMismoTel) {
        errores.push({
          codigo: 'C27',
          mensaje: `OTRO CLIENTE YA TIENE ESTE CELULAR. PersonaID: ${otroConMismoTel.personaId}`,
        });
      }
    }

    // C28: Máximo por nivel / categoría del distribuidor
    const catConfig = CATEGORIAS_CONFIG[distribuidor.nivel as DistribuidorCategoria] || CATEGORIAS_CONFIG.BRONCE;
    if (importe > catConfig.prestamoMaxClienteFinal) {
      errores.push({
        codigo: 'C28',
        mensaje: `EL IMPORTE DEL CANJE DEL CLIENTE ES MAYOR QUE EL AUTORIZADO A SU NIVEL (${formatMoney(catConfig.prestamoMaxClienteFinal)} MXN).`,
      });
    }

    // ------------------------------------------------------------------------
    // SUB-BLOQUE: VALE / CLIENTE FINAL (V1 a V19)
    // ------------------------------------------------------------------------
    if (!requiereDistribuidor) {
      // V5: Solo cliente final (la persona no puede ser la misma distribuidora)
      if (distribuidor.personaId === cliente.personaId) {
        errores.push({
          codigo: 'V5',
          mensaje: 'ESTE TIPO DE PRODUCTO SOLO ESTA DISPONIBLE PARA CLIENTE FINAL.',
        });
      }

      // V7: Rango de edad (18 a 64 años)
      if (cliente.fechaNacimiento) {
        const anioNac = new Date(cliente.fechaNacimiento).getFullYear();
        const anioActual = fechaOperacion.getFullYear();
        const edad = anioActual - anioNac;
        if (edad < 18 || edad > 64) {
          errores.push({
            codigo: 'V7',
            mensaje: `LA EDAD DEL CLIENTE PARA CANJE DEBE SER DE 18 A 64 AÑOS (Edad calculada: ${edad} años).`,
          });
        }
      }

      // V11: Múltiplos de $500.00
      if (plazos > 2 && importe % 500 !== 0) {
        errores.push({
          codigo: 'V11',
          mensaje: 'LOS PRESTAMOS DEBEN SER MULTIPLOS DE $500.00.',
        });
      }

      // V14: Crédito disponible del distribuidor (con tolerancia oficial de $900)
      if (importe > distribuidor.disponible + 900) {
        errores.push({
          codigo: 'V14',
          mensaje: `EL DISTRIBUIDOR NO TIENE CREDITO DISPONIBLE. DISPONIBLE: ${formatMoney(distribuidor.disponible)} MXN.`,
        });
      }

      // V19: El cliente no debe ser un distribuidor activo
      if (cliente.isDistribuidor) {
        errores.push({
          codigo: 'V19',
          mensaje: 'ESTE CLIENTE ESTA REGISTRADO COMO DISTRIBUIDOR....',
        });
      }
    }

    // ------------------------------------------------------------------------
    // SUB-BLOQUE: PRÉSTAMO DISTRIBUIDOR (D1 a D3)
    // ------------------------------------------------------------------------
    if (requiereDistribuidor) {
      if (distribuidor.personaId !== cliente.personaId) {
        errores.push({
          codigo: 'D3',
          mensaje: 'ESTE TIPO DE PRODUCTO SOLO ESTA DISPONIBLE PARA DISTRIBUIDORES.',
        });
      }

      const lcPersonal = catConfig.lineaCreditoPersonal;
      if (importe > lcPersonal) {
        errores.push({
          codigo: 'D2',
          mensaje: `NO CUENTA CON DISPONIBLE PARA REALIZAR ESTE CANJE. LÍNEA PERSONAL MÁXIMA: ${formatMoney(lcPersonal)} MXN.`,
        });
      }
    }
  }

  return {
    valido: errores.length === 0,
    codigoError: errores[0]?.codigo,
    mensajeError: errores[0]?.mensaje,
    errores,
    advertencias,
  };
}

/**
 * Cálculo Exacto de Amortización Quincenal de Vales Digitales
 * Fórmula Oficial: Interés = (Capital * TasaMensual * Plazo) / 2
 * Pago Quincenal = (Capital + Interés) / Plazo
 */
export function calcularAmortizacionVale(
  capital: number,
  plazos: number,
  perfil: string = 'DISTRIBUIDORA_AAA'
): {
  capital: number;
  plazos: number;
  tasaMensual: number;
  interesTotal: number;
  seguroCliente: number;
  seguroDistribuidora: number;
  totalPagar: number;
  pagoQuincenalSinSeguro: number;
  pagoQuincenalConSeguro: number;
} {
  const tasaMensual = TASAS_POR_PLAZO[plazos] || 0.14;
  const interesTotal = Math.round((capital * tasaMensual * plazos) / 2);
  const pagoQuincenalSinSeguro = Math.round((capital + interesTotal) / plazos);

  const seguros = COSTOS_SEGURO[perfil] || COSTOS_SEGURO.DISTRIBUIDORA_AAA;
  const seguroCliente = seguros.seguroClienteFinal;
  const seguroDistribuidora = seguros.seguroDistribuidora;

  const totalPagar = capital + interesTotal + seguroCliente;
  const pagoQuincenalConSeguro = Math.round(totalPagar / plazos);

  return {
    capital,
    plazos,
    tasaMensual,
    interesTotal,
    seguroCliente,
    seguroDistribuidora,
    totalPagar,
    pagoQuincenalSinSeguro,
    pagoQuincenalConSeguro,
  };
}

/**
 * Escala de Comisiones Dinámicas por Día de Pago Quincenal
 */
export function calcularComisionDistribuidora(
  perfil: DistribuidorPerfil = 'D-AAA',
  diaPago: number = 15
): {
  diaRango: string;
  porcentaje: number;
  bonificacionPorcentaje: number;
  seMuestraEnRelacion: boolean;
} {
  // Mapear al grupo de perfiles
  let grupo = 'D-AAA';
  if (perfil === 'D-AA' || perfil === 'E-AAA') {
    grupo = 'D-AA_E-AAA';
  } else if (perfil === 'D-A' || perfil === 'E-AA') {
    grupo = 'D-A_E-AA';
  } else if (perfil === 'E-A') {
    grupo = 'E-A';
  }

  const tabla = COMISIONES_POR_PERFIL[grupo] || COMISIONES_POR_PERFIL['D-AAA'];

  // Pago en fecha oficial (30 o 15): bonificación máxima
  if (diaPago === 30 || diaPago === 15) {
    const item = tabla[0];
    return {
      diaRango: item.diaRango,
      porcentaje: item.porcentaje,
      bonificacionPorcentaje: Math.round(item.porcentaje * 100),
      seMuestraEnRelacion: item.seMuestraEnRelacion,
    };
  }

  // Pago tardío (días posteriores): se reduce 1% por día hasta el límite
  const index = Math.min(diaPago > 15 ? diaPago - 15 : diaPago, tabla.length - 1);
  const item = tabla[index] || tabla[tabla.length - 1];

  return {
    diaRango: item.diaRango,
    porcentaje: item.porcentaje,
    bonificacionPorcentaje: Math.round(item.porcentaje * 100),
    seMuestraEnRelacion: item.seMuestraEnRelacion,
  };
}

/**
 * Reglas de Incremento de Línea de Crédito Vale Lana
 * Requisitos:
 * 1. 6 pagos puntuales consecutivos (si falla se reinicia).
 * 2. 80% de colocación de la línea actual.
 * 3. Estatus ACTIVO.
 * 4. Botón de pausado desactivado.
 * 5. Cortes días 8 y 23 de cada mes.
 * 6. Tope máximo $350,000.
 */
export function evaluarIncrementoLineaValeLana(params: {
  distribuidor: DistribuidorCore;
  pagosPuntualesConsecutivos: number;
  estaPausado?: boolean;
}): {
  elegible: boolean;
  motivo: string;
  incrementoSugerido: number;
  nuevaLineaEstimada: number;
} {
  const { distribuidor, pagosPuntualesConsecutivos, estaPausado = false } = params;

  if (estaPausado) {
    return {
      elegible: false,
      motivo: 'Incremento pausado manualmente en opciones de Distribuidora.',
      incrementoSugerido: 0,
      nuevaLineaEstimada: distribuidor.creditoLimite,
    };
  }

  if (distribuidor.estatus !== 'ACTIVO') {
    return {
      elegible: false,
      motivo: 'La cuenta debe permanecer en estatus ACTIVO.',
      incrementoSugerido: 0,
      nuevaLineaEstimada: distribuidor.creditoLimite,
    };
  }

  if (pagosPuntualesConsecutivos < 6) {
    return {
      elegible: false,
      motivo: `Faltan pagos puntuales consecutivos (${pagosPuntualesConsecutivos}/6 cumplidos).`,
      incrementoSugerido: 0,
      nuevaLineaEstimada: distribuidor.creditoLimite,
    };
  }

  const colocacionPct = (distribuidor.saldoActual / (distribuidor.creditoLimite || 1)) * 100;
  if (colocacionPct < 80) {
    return {
      elegible: false,
      motivo: `Colocación insuficiente: tiene ${colocacionPct.toFixed(1)}% (mínimo requerido 80%).`,
      incrementoSugerido: 0,
      nuevaLineaEstimada: distribuidor.creditoLimite,
    };
  }

  const catConfig = INCREMENTOS_VALE_LANA[distribuidor.nivel as DistribuidorCategoria] || INCREMENTOS_VALE_LANA.BRONCE;
  const topeMaximo = catConfig.maxLinea; // 350,000
  const incremento = catConfig.incrementoPorEtapa;

  if (distribuidor.creditoLimite >= topeMaximo) {
    return {
      elegible: false,
      motivo: `Línea de crédito en el tope máximo autorizado de ${formatMoney(topeMaximo)} MXN.`,
      incrementoSugerido: 0,
      nuevaLineaEstimada: topeMaximo,
    };
  }

  const nuevaLinea = Math.min(distribuidor.creditoLimite + incremento, topeMaximo);

  return {
    elegible: true,
    motivo: `¡Cumple con 6 pagos puntuales y ${colocacionPct.toFixed(1)}% de colocación! Incremento de etapa autorizado.`,
    incrementoSugerido: incremento,
    nuevaLineaEstimada: nuevaLinea,
  };
}

/**
 * Factor Multiplicador LanaTienda según Costo Base
 */
export function calcularPrecioVentaLanaTienda(costoBase: number): {
  costoBase: number;
  factor: number;
  precioVentaFinal: number;
} {
  const rango = FACTORES_LANATIENDA.find((f) => costoBase >= f.min && costoBase <= f.max) || {
    min: 9000,
    max: 15000,
    factor: 1.7,
  };

  const precioVentaFinal = Math.round(costoBase * rango.factor);
  return {
    costoBase,
    factor: rango.factor,
    precioVentaFinal,
  };
}

/**
 * Evaluación de Buró de Crédito (BC Score y No Hit)
 */
export function evaluarScoreBuro(score: number, isNoHit: boolean = false): {
  score: number;
  badRate: number;
  perfilOdictamen: string;
  decision: 'RECHAZO' | 'BANDEJA_BURO' | 'APROBADO_A' | 'APROBADO_AA' | 'APROBADO_AAA';
} {
  if (isNoHit) {
    return {
      score,
      badRate: 0.95,
      perfilOdictamen: 'SCORE BURO NO HIT: DIRECCIONAR A BANDEJA DE BURO',
      decision: 'BANDEJA_BURO',
    };
  }

  const item = BC_SCORE_RANGOS.find((r) => score >= r.minScore && score <= r.maxScore) || BC_SCORE_RANGOS[0];
  return {
    score,
    badRate: item.badRate,
    perfilOdictamen: item.perfilOdictamen,
    decision: item.decision,
  };
}
