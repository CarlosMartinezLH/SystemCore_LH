// ==============================================================================
// LanAhora SystemCore — Tipos y Parámetros Oficiales de Reglas de Negocio
// Documento Oficial: Políticas de Distribuidoras, Comisiones, Amortizaciones,
// Seguros, Incrementos, Score de Buró y Matriz de Validaciones dbo.CreditoGeneraCanje
// ==============================================================================

export type DistribuidorCategoria = 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO' | 'DIAMANTE';

export type DistribuidorPerfil = 'E-A' | 'E-AA' | 'E-AAA' | 'D-A' | 'D-AA' | 'D-AAA';

export interface CategoriaConfig {
  categoria: DistribuidorCategoria;
  saldoMinimo: number;
  saldoMaximo: number;
  lineaCreditoPersonal: number;
  prestamoMaxClienteFinal: number;
  descripcion: string;
}

export const CATEGORIAS_CONFIG: Record<DistribuidorCategoria, CategoriaConfig> = {
  BRONCE: {
    categoria: 'BRONCE',
    saldoMinimo: 0,
    saldoMaximo: 40000,
    lineaCreditoPersonal: 5000,
    prestamoMaxClienteFinal: 9000,
    descripcion: 'Menos de $40,000 al corte',
  },
  PLATA: {
    categoria: 'PLATA',
    saldoMinimo: 40001,
    saldoMaximo: 75000,
    lineaCreditoPersonal: 10000,
    prestamoMaxClienteFinal: 9000,
    descripcion: '$40,001 a $75,000 al corte',
  },
  ORO: {
    categoria: 'ORO',
    saldoMinimo: 75001,
    saldoMaximo: 125000,
    lineaCreditoPersonal: 15000,
    prestamoMaxClienteFinal: 10000,
    descripcion: '$75,001 a $125,000 al corte',
  },
  PLATINO: {
    categoria: 'PLATINO',
    saldoMinimo: 125001,
    saldoMaximo: 175000,
    lineaCreditoPersonal: 20000,
    prestamoMaxClienteFinal: 12000,
    descripcion: '$125,001 a $175,000 al corte',
  },
  DIAMANTE: {
    categoria: 'DIAMANTE',
    saldoMinimo: 175001,
    saldoMaximo: Infinity,
    lineaCreditoPersonal: 25000,
    prestamoMaxClienteFinal: 15000,
    descripcion: '$175,001 en adelante al corte',
  },
};

// Escala de Comisiones por Día de Pago
export interface ComisionDiaItem {
  diaRango: string; // ej. '30-15', '01-16', etc.
  porcentaje: number;
  seMuestraEnRelacion: boolean;
}

export const COMISIONES_POR_PERFIL: Record<string, ComisionDiaItem[]> = {
  'D-AAA': [
    { diaRango: '30-15', porcentaje: 0.18, seMuestraEnRelacion: true },
    { diaRango: '01-16', porcentaje: 0.17, seMuestraEnRelacion: true },
    { diaRango: '02-17', porcentaje: 0.16, seMuestraEnRelacion: true },
    { diaRango: '03-18', porcentaje: 0.15, seMuestraEnRelacion: true },
    { diaRango: '04-19', porcentaje: 0.14, seMuestraEnRelacion: false },
    { diaRango: '05-20', porcentaje: 0.13, seMuestraEnRelacion: false },
    { diaRango: '06-21', porcentaje: 0.12, seMuestraEnRelacion: false },
    { diaRango: '07-22', porcentaje: 0.11, seMuestraEnRelacion: false },
    { diaRango: '08-23', porcentaje: 0.10, seMuestraEnRelacion: false },
  ],
  'D-AA_E-AAA': [
    { diaRango: '30-15', porcentaje: 0.16, seMuestraEnRelacion: true },
    { diaRango: '01-16', porcentaje: 0.15, seMuestraEnRelacion: true },
    { diaRango: '02-17', porcentaje: 0.14, seMuestraEnRelacion: true },
    { diaRango: '03-18', porcentaje: 0.13, seMuestraEnRelacion: true },
    { diaRango: '04-19', porcentaje: 0.12, seMuestraEnRelacion: false },
    { diaRango: '05-20', porcentaje: 0.11, seMuestraEnRelacion: false },
    { diaRango: '06-21', porcentaje: 0.10, seMuestraEnRelacion: false },
    { diaRango: '07-22', porcentaje: 0.09, seMuestraEnRelacion: false },
    { diaRango: '08-23', porcentaje: 0.08, seMuestraEnRelacion: false },
  ],
  'D-A_E-AA': [
    { diaRango: '30-15', porcentaje: 0.14, seMuestraEnRelacion: true },
    { diaRango: '01-16', porcentaje: 0.13, seMuestraEnRelacion: true },
    { diaRango: '02-17', porcentaje: 0.12, seMuestraEnRelacion: true },
    { diaRango: '03-18', porcentaje: 0.11, seMuestraEnRelacion: true },
    { diaRango: '04-19', porcentaje: 0.10, seMuestraEnRelacion: false },
    { diaRango: '05-20', porcentaje: 0.09, seMuestraEnRelacion: false },
    { diaRango: '06-21', porcentaje: 0.08, seMuestraEnRelacion: false },
    { diaRango: '07-22', porcentaje: 0.07, seMuestraEnRelacion: false },
    { diaRango: '08-23', porcentaje: 0.06, seMuestraEnRelacion: false },
  ],
  'E-A': [
    { diaRango: '30-15', porcentaje: 0.12, seMuestraEnRelacion: true },
    { diaRango: '01-16', porcentaje: 0.11, seMuestraEnRelacion: true },
    { diaRango: '02-17', porcentaje: 0.10, seMuestraEnRelacion: true },
    { diaRango: '03-18', porcentaje: 0.09, seMuestraEnRelacion: true },
    { diaRango: '04-19', porcentaje: 0.08, seMuestraEnRelacion: false },
    { diaRango: '05-20', porcentaje: 0.07, seMuestraEnRelacion: false },
    { diaRango: '06-21', porcentaje: 0.06, seMuestraEnRelacion: false },
    { diaRango: '07-22', porcentaje: 0.05, seMuestraEnRelacion: false },
    { diaRango: '08-23', porcentaje: 0.04, seMuestraEnRelacion: false },
  ],
};

// Tasas Mensuales y Amortizaciones de Vale Lana
export const TASAS_POR_PLAZO: Record<number, number> = {
  4: 0.15,
  6: 0.14,
  8: 0.13,
  10: 0.12,
  12: 0.11,
  14: 0.10,
  16: 0.09,
};

// Costos de Seguros por Perfil
export interface CostoSeguro {
  perfil: string;
  seguroDistribuidora: number;
  seguroClienteFinal: number;
}

export const COSTOS_SEGURO: Record<string, CostoSeguro> = {
  'EMPRENDEDORA_AAA': { perfil: 'Emprendedora AAA', seguroDistribuidora: 90, seguroClienteFinal: 60 },
  'EMPRENDEDORA_AA': { perfil: 'Emprendedora AA', seguroDistribuidora: 105, seguroClienteFinal: 65 },
  'EMPRENDEDORA_A': { perfil: 'Emprendedora A', seguroDistribuidora: 120, seguroClienteFinal: 75 },
  'DISTRIBUIDORA_AAA': { perfil: 'Distribuidora AAA', seguroDistribuidora: 60, seguroClienteFinal: 60 },
  'DISTRIBUIDORA_AA': { perfil: 'Distribuidora AA', seguroDistribuidora: 65, seguroClienteFinal: 65 },
  'DISTRIBUIDORA_A': { perfil: 'Distribuidora A', seguroDistribuidora: 75, seguroClienteFinal: 75 },
};

// LanaTienda: Factores Multiplicadores según rango de precio
export interface FactorLanaTiendaRango {
  min: number;
  max: number;
  factor: number;
}

export const FACTORES_LANATIENDA: FactorLanaTiendaRango[] = [
  { min: 0, max: 1000, factor: 2.30 },
  { min: 1000, max: 1500, factor: 1.45 },
  { min: 1500, max: 2000, factor: 1.50 },
  { min: 2000, max: 2500, factor: 1.50 },
  { min: 2500, max: 3000, factor: 1.55 },
  { min: 3000, max: 3500, factor: 1.55 },
  { min: 3500, max: 4000, factor: 1.55 },
  { min: 4000, max: 5000, factor: 1.60 },
  { min: 5000, max: 6000, factor: 1.65 },
  { min: 6000, max: 7000, factor: 1.65 },
  { min: 7000, max: 8000, factor: 1.65 },
  { min: 8000, max: 9000, factor: 1.65 },
  { min: 9000, max: 15000, factor: 1.70 },
];

// Incrementos de Línea Vale Lana por Categoría
export interface IncrementoValeLanaConfig {
  categoria: DistribuidorCategoria;
  incrementoPorEtapa: number;
  maxEtapas: number;
  maxLinea: number;
}

export const INCREMENTOS_VALE_LANA: Record<DistribuidorCategoria, IncrementoValeLanaConfig> = {
  BRONCE: { categoria: 'BRONCE', incrementoPorEtapa: 3500, maxEtapas: 6, maxLinea: 350000 },
  PLATA: { categoria: 'PLATA', incrementoPorEtapa: 5000, maxEtapas: 6, maxLinea: 350000 },
  ORO: { categoria: 'ORO', incrementoPorEtapa: 5000, maxEtapas: 6, maxLinea: 350000 },
  PLATINO: { categoria: 'PLATINO', incrementoPorEtapa: 7000, maxEtapas: 6, maxLinea: 350000 },
  DIAMANTE: { categoria: 'DIAMANTE', incrementoPorEtapa: 10000, maxEtapas: 6, maxLinea: 350000 },
};

// BC Score Rangos de Evaluación
export interface BCScoreEvaluacion {
  minScore: number;
  maxScore: number;
  badRate: number;
  perfilOdictamen: string;
  decision: 'RECHAZO' | 'BANDEJA_BURO' | 'APROBADO_A' | 'APROBADO_AA' | 'APROBADO_AAA';
}

export const BC_SCORE_RANGOS: BCScoreEvaluacion[] = [
  { minScore: 0, maxScore: 524, badRate: 0.99, perfilOdictamen: 'RECHAZO', decision: 'RECHAZO' },
  { minScore: 525, maxScore: 556, badRate: 0.95, perfilOdictamen: 'PERFIL MALO (BANDEJA BURÓ)', decision: 'BANDEJA_BURO' },
  { minScore: 557, maxScore: 579, badRate: 0.871, perfilOdictamen: 'PERFIL MALO (DV A O EMPRENDEDORA A)', decision: 'APROBADO_A' },
  { minScore: 580, maxScore: 596, badRate: 0.743, perfilOdictamen: 'PERFIL MALO (DV A O EMPRENDEDORA A)', decision: 'APROBADO_A' },
  { minScore: 597, maxScore: 620, badRate: 0.564, perfilOdictamen: 'REGULAR (DV AA O EMPRENDEDORA AA)', decision: 'APROBADO_AA' },
  { minScore: 621, maxScore: 639, badRate: 0.377, perfilOdictamen: 'REGULAR (DV AA O EMPRENDEDORA AA)', decision: 'APROBADO_AA' },
  { minScore: 640, maxScore: 650, badRate: 0.286, perfilOdictamen: 'REGULAR (DV AA O EMPRENDEDORA AA)', decision: 'APROBADO_AA' },
  { minScore: 651, maxScore: 659, badRate: 0.219, perfilOdictamen: 'REGULAR (DV AA O EMPRENDEDORA AA)', decision: 'APROBADO_AA' },
  { minScore: 660, maxScore: 666, badRate: 0.165, perfilOdictamen: 'REGULAR (DV AA O EMPRENDEDORA AA)', decision: 'APROBADO_AA' },
  { minScore: 667, maxScore: 672, badRate: 0.127, perfilOdictamen: 'REGULAR (DV AA O EMPRENDEDORA AA)', decision: 'APROBADO_AA' },
  { minScore: 673, maxScore: 678, badRate: 0.105, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 679, maxScore: 683, badRate: 0.084, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 684, maxScore: 688, badRate: 0.071, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 689, maxScore: 693, badRate: 0.058, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 694, maxScore: 698, badRate: 0.048, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 699, maxScore: 702, badRate: 0.042, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 703, maxScore: 707, badRate: 0.035, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 708, maxScore: 712, badRate: 0.029, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 713, maxScore: 719, badRate: 0.025, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
  { minScore: 720, maxScore: 999, badRate: 0.024, perfilOdictamen: 'BUENO (DV AAA O EMPRENDEDORA AAA)', decision: 'APROBADO_AAA' },
];

// Matriz Oficial de Validaciones de Crédito (dbo.CreditoGeneraCanje)
export interface ReglaCreditoValidacion {
  codigo: string;
  tipoCredito: 'COMUN' | 'DISTRIBUIDOR' | 'VALE';
  momento: 'SIEMPRE' | 'BLOQUE_PROTEGIDO' | 'BLOQUE_DISTRIBUIDOR';
  queValida: string;
  regla: string;
  mensajeUsuario: string;
}

export interface CreditoValidationResult {
  valido: boolean;
  codigoError?: string;
  mensajeError?: string;
  errores: Array<{ codigo: string; mensaje: string }>;
  advertencias: string[];
}
