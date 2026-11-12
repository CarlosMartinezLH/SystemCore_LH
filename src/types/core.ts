export type CategoriaPersona = 'CF' | 'DV' | 'AV' | 'CO';

export function getCategoriaPersona(p?: { isDistribuidor?: boolean; categoria?: CategoriaPersona | string } | null): CategoriaPersona {
  if (!p) return 'CF';
  if (p.categoria === 'DV' || p.isDistribuidor) return 'DV';
  if (p.categoria === 'AV') return 'AV';
  if (p.categoria === 'CO') return 'CO';
  return 'CF';
}

export function getCategoriaInfo(cat: CategoriaPersona) {
  switch (cat) {
    case 'DV':
      return {
        code: 'DV',
        label: 'Distribuidora',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        pillClass: 'bg-blue-600 text-white',
        canPromoteToDv: false,
      };
    case 'AV':
      return {
        code: 'AV',
        label: 'Aval',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        pillClass: 'bg-amber-600 text-white',
        canPromoteToDv: true,
      };
    case 'CO':
      return {
        code: 'CO',
        label: 'Cónyuge de DV',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
        pillClass: 'bg-purple-600 text-white',
        canPromoteToDv: true,
      };
    case 'CF':
    default:
      return {
        code: 'CF',
        label: 'Cliente Final',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        pillClass: 'bg-slate-600 text-white',
        canPromoteToDv: true,
      };
  }
}

export interface NotaClienteCore {
  id?: string;
  text: string;
  date: string; // Cuándo se puso (Fecha y hora)
  author: string; // Quién la puso (Nombre del usuario/analista)
  authorRole?: string; // Rol o puesto del usuario
  modulo: string; // Dónde se puso (El módulo del sistema)
  avatarInitials?: string;
}

export interface AmortizacionCuota {
  numeroPago: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  seguro: number;
  iva: number;
  cuotaTotal: number;
  saldoRestante: number;
  estatus: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  fechaPago?: string;
}

export interface CreditoHistorialPersona {
  contratoId: number;
  coordinador: string;
  creditoId: number | string;
  nombreDistribuidor: string;
  distribuidorId: number;
  personaId: number;
  nombreCompleto: string;
  plazos: number;
  porcTasaMensual: number;
  producto: string;
  capital: number;
  interes: number;
  seguro: number;
  iva: number;
  importeTotal: number;
  abonos: number;
  pagoModa: number;
  saldoActual: number;
  diasAtraso: number;
  saldoAtrasado: number;
  fechaHoraRegistro: string;
  fechaHoraDesembolso: string;
  fechaHoraUltimoPago: string;
  valeCanje: number;
  capitalPagado: number;
  capitalPendiente: number;
  interesPendiente: number;
  seguroPendiente: number;
  ivaPendiente: number;
  usuarioIdRegistro: number;
  nomUsuarioRegistro: string;
  pagosAtrasados: number;
  tipoDesembolso: string;
  estatus: 'ACTIVO' | 'LIQUIDADO' | 'EN MORA' | 'CANCELADO';
  username?: string;
  puntoDeVenta?: string;
  pagareEstatusDesc: string;
  fechaPrimerPlazo: string;
  fechaUltimoPlazo: string;
  capitalAtrasado: number;
  interesAtrasado: number;
  comisionAtrasado: number;
  seguroAtrasado: number;
  cargoAtrasado: number;
  ivaAtrasado: number;
  observacion: string;
  sucursal: string;
  tipo: string;
  clasificacionDesc: string;
  amortizaciones?: AmortizacionCuota[];
}

export interface CuentaBancariaPersona {
  id: number;
  banco: string;
  tarjetaDebito?: string;
  clabeInterbancaria?: string;
  numeroCuenta?: string;
  fhRegistro: string;
  usuarioRegistra: string;
  esPrincipal: boolean;
}

export interface PersonaCore {
  personaId: number;
  nombre: string;
  nombreAdicional?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  categoria?: CategoriaPersona;
  pagareEstatusId: 'NO DEFINIDO' | 'FIRMADO EN BLANCO' | 'SIN PAGARE';
  pagareCantidad: number;
  curp: string;
  rfc: string;
  sexoId: 'FEMENINO' | 'MASCULINO';
  buroInternoEstatus: 'NORMAL' | 'NO SUJETO DE CREDITO' | 'BLOQUEADO';
  observaciones?: string;
  isDistribuidor: boolean;
  distribuidorId?: number;
  distribuidorNombre?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  clabe?: string;
  banco?: string;
  cuentasBancarias?: CuentaBancariaPersona[];
  scoreBuro?: number;
  fotoUrl?: string;
  numeroExterior?: string;
  codigoPostal?: string;
  localidad?: string;
  tipoIdentificacion?: 'INE' | 'PASAPORTE' | 'CEDULA' | 'OTRA';
  numeroIdentificacion?: string;
  estadoNacimiento?: string;
  localidadNacimiento?: string;
  consultaBuroInicial?: boolean;
  folioBuroPrevia?: string;
  saldoActual?: number;
  capitalVencido?: number;
  // Campos complementarios del sistema legacy (Editar Persona)
  ocupacionId?: string;
  puesto?: string;
  otrosIngresos?: number;
  telefonoDomicilio?: string;
  telefonoTrabajo?: string;
  telefonoMovil?: string;
  numeroInterior?: string;
  colonia?: string;
  entreCalle1?: string;
  entreCalle2?: string;
  referenciaNombre01?: string;
  referenciaTelefono01?: string;
  referenciaNombre02?: string;
  referenciaTelefono02?: string;
  referenciasGeograficas?: string;
  estadoCivilId?: string;
  nombreEmpresa?: string;
  ingresosMensuales?: number;
  dependientesEconomicos?: number;
  lugarNacimiento?: string;
  firmaElectronicaAvanzada?: string;
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
  // Campos del Perfil de Distribuidor y Relación de Cobro (Sistema LanAhora)
  contratoId?: number;
  lineaAdicional?: number;
  gestor?: string;
  promotor?: string;
  direccion?: string;
  lanapuntos?: number;
  usuarioValida?: string;
  fechaValidacion?: string;
  usuarioConsolida?: string;
  fechaConsolidacion?: string;
  lineaLanaTienda?: number;
  disponibleLanaTienda?: number;
  perfil?: string; // ej. 'Distribuidor AAA'
  valesActivos?: number;
  lineaPersonal?: number;
  disponiblePersonal?: number;
}

export interface CoordinadorCore {
  id: string;
  nombre: string;
  sucursal: string;
  zonaId?: string;
  zona: string;
  subzonaId?: string;
  subzona?: string;
  telefono: string;
  email?: string;
  estatus: 'ACTIVO' | 'INACTIVO';
  fechaIngreso: string;
  cobroEstimadoQuincena: number;
  cobroRealizadoQuincena: number;
  metaColocacion?: number;
  totalDistribuidores?: number;
  carteraActiva?: number;
  porcentajeRecuperacion?: number;
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
  tipoCredito?: 'VALE_DINERO' | 'PRESTAMO_PERSONAL' | 'PROTECCION_RELACION';
  plazoActual?: number;
  dctoQuincenal?: number;
  saldoCorriente?: number;
  saldoVencido?: number;
  valorCorte?: number;
  pagoCliente?: number;
  saldoDespuesPago?: number;
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

// SPEI STP Inbound & Cascada de Aplicación Automática a Créditos
export interface SpeiInboundPago {
  id: string;
  folioSTP: string;
  claveRastreo: string;
  bancoEmisorId: string;
  bancoEmisorNombre: string;
  clabeVirtual: string;
  noDist: number;
  distribuidorNombre: string;
  perfilDV: 'D-AAA' | 'D-AA' | 'D-A' | 'E-AAA' | 'E-AA' | 'E-A';
  saldoExigible: number;
  montoDepositado: number;
  diaCorte: string;
  porcentajeBonificacion: number;
  montoBonificacion: number;
  montoAplicadoCredito: number;
  montoMoratorios: number;
  montoAmortVencida: number;
  montoAmortCorriente: number;
  montoRemanenteFavor: number;
  lineaPrevia: number;
  lineaNuevaDisponible: number;
  fechaHora: string;
  concepto: string;
  estatus: 'APLICADO_AUTOMATICO' | 'CONCILIADO' | 'EN_REVISION';
  cepUrl?: string;
  polizaContableId: string;
}

export interface ClabeVirtualSTP {
  noDist: number;
  distribuidorNombre: string;
  clabe: string;
  bancoConcentrador: 'STP (646)';
  estatus: 'ACTIVA' | 'BLOQUEADA';
  fechaAsignacion: string;
  saldoPendienteQuincena: number;
  perfil: 'D-AAA' | 'D-AA' | 'D-A' | 'E-AAA' | 'E-AA' | 'E-A';
  sucursal: string;
}

// Integraciones Externas (Arquitectura Oficial)
export interface ExternalServiceStatus {
  id: string;
  name: string;
  type: 'BURO_CREDITO' | 'STP_SPEI' | 'NUBARIUM_KYC' | 'PAYNET_RECIBOS' | 'CRM_ORIGINACION' | 'BOTMAKER_WHATSAPP';
  status: 'ONLINE' | 'DEGRADADO' | 'OFFLINE';
  latencyMs: number;
  lastPing: string;
  description: string;
  endpoint: string;
  authMethod: string;
  dailyRequests: number;
  successRate: number;
}
