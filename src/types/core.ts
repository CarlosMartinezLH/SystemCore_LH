export interface PersonaCore {
  personaId: number;
  nombre: string;
  nombreAdicional?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  pagareEstatusId: 'NO DEFINIDO' | 'FIRMADO EN BLANCO' | 'SIN PAGARE';
  pagareCantidad: number;
  curp: string;
  rfc: string;
  sexoId: 'FEMENINO' | 'MASCULINO';
  buroInternoEstatus: 'NORMAL' | 'NO SUJETO DE CREDITO' | 'BLOQUEADO';
  observaciones?: string;
  isDistribuidor: boolean;
  distribuidorId?: number;
  telefono?: string;
  direccion?: string;
}

export type DistribuidorEstatus = 'ACTIVO' | 'CANCELADO' | 'REESTRUCTURA';
export type DistribuidorNivel = 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';

export interface DistribuidorCore {
  noDist: number;
  nombreDistribuidor: string;
  sucursal: string;
  zonaId?: string;
  zona: string;
  subzonaId?: string;
  subzona: string;
  coordinador: string;
  genero: 'FEMENINO' | 'MASCULINO' | 'NO DEFINIDO';
  estatus: DistribuidorEstatus;
  nivel: DistribuidorNivel;
  personaId: number;
  curp: string;
  telefono: string;
  creditoLimite: number;
  saldoActual: number;
  disponible: number;
  tieneLanaApp: boolean;
  fechaAlta: string;
}

export interface CreditoCore {
  creditoId: string;
  noVale: string;
  noDist: number;
  distribuidorNombre: string;
  clienteNombre: string;
  monto: number;
  saldo: number;
  estatus: 'VIGENTE' | 'LIQUIDADO' | 'EN MORA' | 'CANCELADO';
  fechaOtorgamiento: string;
  quincenasPlazo: number;
  sucursal: string;
}

