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
  email?: string;
  clabe?: string;
  banco?: string;
  scoreBuro?: number;
  fotoUrl?: string;
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
  fechaCastigo?: string | null;
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

// STP Dispersión
export interface DispersionSTP {
  id: string;
  folioSTP: string;
  claveRastreo: string;
  creditoId: string;
  beneficiario: string;
  curp: string;
  clabe: string;
  banco: string;
  monto: number;
  fechaHora: string;
  estatus: 'LIQUIDADO' | 'PENDIENTE' | 'DEVUELTO';
  concepto: string;
}

// Pagos & Recaudación (Paynet / Banorte / Club Pago)
export interface PagoCore {
  id: string;
  referencia: string;
  medioPago: 'PAYNET_TIENDAS' | 'STP_SPEI' | 'BANORTE_SUCURSAL' | 'CLUB_PAGO';
  noDist?: number;
  distribuidorNombre?: string;
  clienteNombre?: string;
  monto: number;
  comision: number;
  fechaPago: string;
  estatus: 'APLICADO' | 'EN_TRANSITO' | 'CONCILIADO';
  establecimiento?: string; // 7-Eleven, Farmacias del Ahorro, etc.
}

// Matriz de Pagos y Cobranza
export interface MatrizPagoRecord {
  id: string;
  noDist: number;
  nombreDistribuidor: string;
  coordinador: string;
  sucursal: string;
  cobroEstimadoQuincena: number;
  cobroRealizado: number;
  diferenciaMora: number;
  porcentajeRecuperacion: number;
  estatusGestion: 'COMPLETO' | 'EN_GESTION' | 'CRITICO';
}

// Integraciones Externas (Arquitectura Oficial)
export interface ExternalServiceStatus {
  id: string;
  name: string;
  type: 'BURO_CREDITO' | 'STP_SPEI' | 'NUBARIUM_KYC' | 'PAYNET_RECIBOS' | 'ODOO_CRM' | 'BOTMAKER_WHATSAPP';
  status: 'ONLINE' | 'DEGRADADO' | 'OFFLINE';
  latencyMs: number;
  lastPing: string;
  description: string;
  endpoint: string;
  authMethod: string;
  dailyRequests: number;
  successRate: number;
}
