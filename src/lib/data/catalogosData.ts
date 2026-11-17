import {
  CoordinadorCore,
  AccesoCoordinador,
  FuncionUsuario,
} from '@/types/core';

// =========================================================================
// 1. TIPO & DATOS: USUARIOS DEL SISTEMA (Exacto a Imagen 2)
// =========================================================================
export interface CatalogoUsuario {
  usuarioId: number;
  perfilUsuarioId: string;
  usuario: string;
  nombre: string;
  correo: string;
  telefonoMovil: string;
  bloqueado: boolean;
  todosLosCoordinadores: boolean;
  sucursalId: string;
  usuarioIdOdco?: string;
  fechaRegistro?: string;
}

export const INITIAL_CATALOGO_USUARIOS: CatalogoUsuario[] = [
  {
    usuarioId: 0,
    perfilUsuarioId: 'Admin',
    usuario: 'DC',
    nombre: 'Sistema',
    correo: 'sistema@delcarmx.com',
    telefonoMovil: '',
    bloqueado: true,
    todosLosCoordinadores: false,
    sucursalId: 'MATRIZ',
    usuarioIdOdco: 'OD-00',
  },
  {
    usuarioId: 1,
    perfilUsuarioId: 'Admin',
    usuario: 'delcar',
    nombre: 'Sistema',
    correo: 'efrain.vazquez.sosa@delcar.com.mx',
    telefonoMovil: '9999',
    bloqueado: false,
    todosLosCoordinadores: true,
    sucursalId: 'MATRIZ',
    usuarioIdOdco: 'OD-01',
  },
  {
    usuarioId: 4,
    perfilUsuarioId: 'Admin',
    usuario: 'jorge',
    nombre: 'Jorge Viggiano',
    correo: 'jorge_viggiano@lanahora.com',
    telefonoMovil: '8717145020',
    bloqueado: false,
    todosLosCoordinadores: true,
    sucursalId: 'MATRIZ',
    usuarioIdOdco: 'OD-04',
  },
  {
    usuarioId: 5,
    perfilUsuarioId: 'Admin',
    usuario: 'lmartinez',
    nombre: 'Lizeth Martinez',
    correo: 'lizeth_martinez@lanahora.com',
    telefonoMovil: '8712349011',
    bloqueado: false,
    todosLosCoordinadores: true,
    sucursalId: 'MATRIZ',
    usuarioIdOdco: 'OD-05',
  },
  {
    usuarioId: 6,
    perfilUsuarioId: 'Analista',
    usuario: 'mrodarte',
    nombre: 'Manuela Rodarte Vargas',
    correo: 'analista01@lanahora.mx',
    telefonoMovil: '8711904422',
    bloqueado: true,
    todosLosCoordinadores: true,
    sucursalId: 'MATRIZ',
    usuarioIdOdco: 'OD-06',
  },
  {
    usuarioId: 7,
    perfilUsuarioId: 'ASESOR DE CREDITO',
    usuario: 'agarcia',
    nombre: 'Adrian Garcia',
    correo: 'adrian_garcia@lanahora.com',
    telefonoMovil: '6181677856',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'SALTILLO',
    usuarioIdOdco: 'OD-07',
  },
  {
    usuarioId: 8,
    perfilUsuarioId: 'Gerente de Sucursal',
    usuario: 'srodriguezl',
    nombre: 'Sonia Rodriguez Leyva',
    correo: 'sonia_rodriguez@lanahora.com',
    telefonoMovil: '6181863378',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'DURANGO',
    usuarioIdOdco: 'OD-08',
  },
  {
    usuarioId: 9,
    perfilUsuarioId: 'ASESOR DE CREDITO',
    usuario: 'ptrejo',
    nombre: 'Paloma Itzel Trejo Soto',
    correo: 'ejecutivacuenta1dgo@lanahora.com',
    telefonoMovil: '6183517931',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'DURANGO',
    usuarioIdOdco: 'OD-09',
  },
  {
    usuarioId: 10,
    perfilUsuarioId: 'Gerente de zona',
    usuario: 'lramirez',
    nombre: 'Luis Fernando Ramirez Vera',
    correo: 'luis_ramirez@lanahora.com',
    telefonoMovil: '6183305995',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'DURANGO',
    usuarioIdOdco: 'OD-10',
  },
  {
    usuarioId: 11,
    perfilUsuarioId: 'ASESOR DE CREDITO',
    usuario: 'vmartinez',
    nombre: 'Veronica Jaqueline Martinez Escobedo',
    correo: 'ejecutivacuenta2dgo@lanahora.com',
    telefonoMovil: '6183305995',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'DURANGO',
    usuarioIdOdco: 'OD-11',
  },
  {
    usuarioId: 12,
    perfilUsuarioId: 'ASESOR DE CREDITO',
    usuario: 'asoto',
    nombre: 'Ana Karen Soto Moreno',
    correo: 'ejecutivacuenta2gp@lanahora.com',
    telefonoMovil: '8713799542',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'GOMEZ PALACIO',
    usuarioIdOdco: 'OD-12',
  },
  {
    usuarioId: 13,
    perfilUsuarioId: 'ASESOR DE CREDITO',
    usuario: 'lespino',
    nombre: 'Lidia Susana Espino Fraire',
    correo: 'ejecutivacuenta1gp@lanahora.com',
    telefonoMovil: '8712604175',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'GOMEZ PALACIO',
    usuarioIdOdco: 'OD-13',
  },
  {
    usuarioId: 14,
    perfilUsuarioId: 'Ejecutiva de Canjes',
    usuario: 'yjaramillo',
    nombre: 'Yessica Judith Jaramillo Flores',
    correo: 'ejecutivacuenta2sal@lanahora.com',
    telefonoMovil: '8445885691',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'SALTILLO',
    usuarioIdOdco: 'OD-14',
  },
  {
    usuarioId: 15,
    perfilUsuarioId: 'Gerente de zona',
    usuario: 'jgarcia',
    nombre: 'Jesus Adrian Garcia Martinez',
    correo: 'adrian_garcia@lanahora.com',
    telefonoMovil: '8442860493',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'SALTILLO',
    usuarioIdOdco: 'OD-15',
  },
  {
    usuarioId: 16,
    perfilUsuarioId: 'ASESOR DE CREDITO',
    usuario: 'mhernandez',
    nombre: 'Ana Magdalena Hernandez Lopez',
    correo: 'ejecutivacuenta1sal@lanahora.com',
    telefonoMovil: '8441982231',
    bloqueado: false,
    todosLosCoordinadores: false,
    sucursalId: 'SALTILLO',
    usuarioIdOdco: 'OD-16',
  },
];

// =========================================================================
// 2. TIPO & DATOS: TIPOS DE DOCUMENTO (Tab 6)
// =========================================================================
export interface TipoDocumento {
  id: string;
  codigo: string;
  nombre: string;
  aplicaA: 'DISTRIBUIDORA' | 'CLIENTE_FINAL' | 'AMBOS';
  obligatorio: boolean;
  formatos: string;
  vigenciaDias: number;
  estatus: 'ACTIVO' | 'INACTIVO';
}

export const INITIAL_TIPOS_DOCUMENTO: TipoDocumento[] = [
  { id: 'doc-01', codigo: 'INE_FRENTE', nombre: 'INE / Pasaporte Oficial (Frente)', aplicaA: 'AMBOS', obligatorio: true, formatos: 'PDF, JPG, PNG', vigenciaDias: 365, estatus: 'ACTIVO' },
  { id: 'doc-02', codigo: 'INE_REVERSO', nombre: 'INE Oficial (Reverso con OCR)', aplicaA: 'AMBOS', obligatorio: true, formatos: 'PDF, JPG, PNG', vigenciaDias: 365, estatus: 'ACTIVO' },
  { id: 'doc-03', codigo: 'COMP_DOMICILIO', nombre: 'Comprobante de Domicilio Vigente (CFE / Agua)', aplicaA: 'AMBOS', obligatorio: true, formatos: 'PDF, JPG, PNG', vigenciaDias: 90, estatus: 'ACTIVO' },
  { id: 'doc-04', codigo: 'COMP_INGRESOS', nombre: 'Comprobante de Ingresos / Recibo de Nómina', aplicaA: 'DISTRIBUIDORA', obligatorio: true, formatos: 'PDF, XML', vigenciaDias: 60, estatus: 'ACTIVO' },
  { id: 'doc-05', codigo: 'CARTA_PRESTANOMBRES', nombre: 'Carta Declaración No Prestamista / No Prestanombres', aplicaA: 'CLIENTE_FINAL', obligatorio: true, formatos: 'PDF', vigenciaDias: 365, estatus: 'ACTIVO' },
  { id: 'doc-06', codigo: 'PAGARE_CONTRATO', nombre: 'Pagaré y Contrato de Apertura de Crédito Firmado', aplicaA: 'AMBOS', obligatorio: true, formatos: 'PDF', vigenciaDias: 365, estatus: 'ACTIVO' },
  { id: 'doc-07', codigo: 'BIOMETRIA_FACIAL', nombre: 'Captura Biométrica y Liveness Test (Nubarium)', aplicaA: 'AMBOS', obligatorio: true, formatos: 'JPG, PNG', vigenciaDias: 180, estatus: 'ACTIVO' },
  { id: 'doc-08', codigo: 'ESTADO_CUENTA', nombre: 'Carátula de Estado de Cuenta Bancario con CLABE', aplicaA: 'DISTRIBUIDORA', obligatorio: true, formatos: 'PDF', vigenciaDias: 90, estatus: 'ACTIVO' },
];

// =========================================================================
// 3. TIPO & DATOS: CONDICIONES DE PRODUCTO (Tab 7)
// =========================================================================
export interface CondicionProducto {
  id: string;
  codigo: string;
  nombre: string;
  plazoQuincenas: number;
  tasaQuincenalPct: number;
  comisionAperturaPct: number;
  montoMinimo: number;
  montoMaximo: number;
  requiereAval: boolean;
  estatus: 'ACTIVO' | 'INACTIVO';
}

export const INITIAL_CONDICIONES_PRODUCTO: CondicionProducto[] = [
  { id: 'prod-01', codigo: 'VALE_TRADICIONAL', nombre: 'Valelana Tradicional (16 Quincenas)', plazoQuincenas: 16, tasaQuincenalPct: 3.125, comisionAperturaPct: 0, montoMinimo: 1000, montoMaximo: 80000, requiereAval: false, estatus: 'ACTIVO' },
  { id: 'prod-02', codigo: 'PRESTAMO_PERSONAL', nombre: 'Préstamo Personal Directo Distribuidora', plazoQuincenas: 16, tasaQuincenalPct: 3.0, comisionAperturaPct: 0, montoMinimo: 3000, montoMaximo: 50000, requiereAval: true, estatus: 'ACTIVO' },
  { id: 'prod-03', codigo: 'LANATIENDA_DROPSHIP', nombre: 'LanaTienda Dropshipping a 16 Quincenas', plazoQuincenas: 16, tasaQuincenalPct: 0, comisionAperturaPct: 0, montoMinimo: 500, montoMaximo: 35000, requiereAval: false, estatus: 'ACTIVO' },
  { id: 'prod-04', codigo: 'VALE_EXPRESS', nombre: 'Valelana Emergente / Canje Rápido', plazoQuincenas: 8, tasaQuincenalPct: 3.5, comisionAperturaPct: 0, montoMinimo: 1000, montoMaximo: 15000, requiereAval: false, estatus: 'ACTIVO' },
];

// =========================================================================
// 4. TIPO & DATOS: CUENTAS BANCARIAS (Tab 8)
// =========================================================================
export interface CuentaBancaria {
  id: string;
  banco: string;
  clabe: string;
  numeroCuenta: string;
  titular: string;
  sucursal: string;
  tipoUso: 'DISPERSION_SPEI' | 'RECAUDACION' | 'REEMBOLSOS';
  saldoDisponible: number;
  estatus: 'ACTIVA' | 'INACTIVA';
}

export const INITIAL_CUENTAS_BANCARIAS: CuentaBancaria[] = [
  { id: 'cta-01', banco: 'STP (Sistema de Transferencias y Pagos)', clabe: '646180123456789012', numeroCuenta: 'STP-LANAHORA-01', titular: 'Financiera LanAhora SAPI de CV SOFOM ENR', sucursal: 'MATRIZ MONTERREY', tipoUso: 'DISPERSION_SPEI', saldoDisponible: 1245000, estatus: 'ACTIVA' },
  { id: 'cta-02', banco: 'Banorte', clabe: '072580001928374651', numeroCuenta: '0192837465', titular: 'Financiera LanAhora SAPI de CV SOFOM ENR', sucursal: 'SALTILLO CENTRO', tipoUso: 'RECAUDACION', saldoDisponible: 450800, estatus: 'ACTIVA' },
  { id: 'cta-03', banco: 'BBVA México', clabe: '012180004561239874', numeroCuenta: '0045612398', titular: 'Financiera LanAhora SAPI de CV SOFOM ENR', sucursal: 'GOMEZ PALACIO', tipoUso: 'RECAUDACION', saldoDisponible: 380200, estatus: 'ACTIVA' },
  { id: 'cta-04', banco: 'Santander México', clabe: '014180605928371625', numeroCuenta: '6059283716', titular: 'Financiera LanAhora SAPI de CV SOFOM ENR', sucursal: 'DURANGO', tipoUso: 'REEMBOLSOS', saldoDisponible: 185000, estatus: 'ACTIVA' },
];

// =========================================================================
// 5. TIPO & DATOS: POLÍTICAS DE EDAD (Tab 9)
// =========================================================================
export interface PoliticaEdad {
  id: string;
  perfil: string;
  descripcion: string;
  edadMinima: number;
  edadMaximaOtorgamiento: number;
  edadMaximaRenovacion: number;
  requiereAutorizacionMesa: boolean;
  estatus: 'VIGENTE' | 'SUSPENDIDA';
}

export const INITIAL_POLITICAS_EDAD: PoliticaEdad[] = [
  { id: 'pol-01', perfil: 'D-AAA', descripcion: 'Distribuidora Diamante / Historial Impecable', edadMinima: 18, edadMaximaOtorgamiento: 70, edadMaximaRenovacion: 75, requiereAutorizacionMesa: false, estatus: 'VIGENTE' },
  { id: 'pol-02', perfil: 'D-AA', descripcion: 'Distribuidora Oro / Cumplimiento Alto', edadMinima: 18, edadMaximaOtorgamiento: 68, edadMaximaRenovacion: 72, requiereAutorizacionMesa: false, estatus: 'VIGENTE' },
  { id: 'pol-03', perfil: 'D-A', descripcion: 'Distribuidora Plata / Nivel Estándar', edadMinima: 21, edadMaximaOtorgamiento: 65, edadMaximaRenovacion: 68, requiereAutorizacionMesa: false, estatus: 'VIGENTE' },
  { id: 'pol-04', perfil: 'E-AAA', descripcion: 'Cliente Final Nivel 1 (Sin buró previo negativo)', edadMinima: 18, edadMaximaOtorgamiento: 65, edadMaximaRenovacion: 70, requiereAutorizacionMesa: false, estatus: 'VIGENTE' },
  { id: 'pol-05', perfil: 'E-A', descripcion: 'Cliente Final Inicial (Primer vale autorizado)', edadMinima: 18, edadMaximaOtorgamiento: 60, edadMaximaRenovacion: 65, requiereAutorizacionMesa: true, estatus: 'VIGENTE' },
];

// =========================================================================
// 6. TIPO & DATOS: NIVELES DE DISTRIBUIDOR (Tab 10)
// =========================================================================
export interface NivelDistribuidor {
  id: string;
  nivel: 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO' | 'DIAMANTE';
  limiteBase: number;
  valesMaximos: number;
  tasaComisionCobranzaPct: number;
  descuentoProntoPagoPct: number;
  beneficioLanaTienda: string;
}

export const INITIAL_NIVELES_DISTRIBUIDOR: NivelDistribuidor[] = [
  { id: 'niv-01', nivel: 'BRONCE', limiteBase: 25000, valesMaximos: 8, tasaComisionCobranzaPct: 8.0, descuentoProntoPagoPct: 5.0, beneficioLanaTienda: 'Línea de $15,000 MXN a 16 quincenas' },
  { id: 'niv-02', nivel: 'PLATA', limiteBase: 50000, valesMaximos: 15, tasaComisionCobranzaPct: 10.0, descuentoProntoPagoPct: 6.5, beneficioLanaTienda: 'Línea de $25,000 MXN a 16 quincenas' },
  { id: 'niv-03', nivel: 'ORO', limiteBase: 100000, valesMaximos: 30, tasaComisionCobranzaPct: 12.0, descuentoProntoPagoPct: 8.0, beneficioLanaTienda: 'Línea de $40,000 MXN + Monedero Doble' },
  { id: 'niv-04', nivel: 'PLATINO', limiteBase: 180000, valesMaximos: 50, tasaComisionCobranzaPct: 14.0, descuentoProntoPagoPct: 10.0, beneficioLanaTienda: 'Línea de $60,000 MXN + Envíos Express' },
  { id: 'niv-05', nivel: 'DIAMANTE', limiteBase: 300000, valesMaximos: 100, tasaComisionCobranzaPct: 16.0, descuentoProntoPagoPct: 12.0, beneficioLanaTienda: 'Línea Ilimitada Aprobada + VIP' },
];

// =========================================================================
// 7. TIPO & DATOS: RELACIÓN CORTES TABLA DÍAS (Tab 11)
// =========================================================================
export interface RelacionCorte {
  id: string;
  quincenaNumero: 1 | 2;
  diaCorte: string;
  diaLimitePago: string;
  diasGracia: number;
  aplicaMoratoriosDesdeDia: number;
  estatus: 'ACTIVO' | 'INACTIVO';
}

export const INITIAL_RELACION_CORTES: RelacionCorte[] = [
  { id: 'corte-q1', quincenaNumero: 1, diaCorte: 'Día 15 de cada mes', diaLimitePago: 'Día 18 de cada mes (3 días hábiles)', diasGracia: 2, aplicaMoratoriosDesdeDia: 21, estatus: 'ACTIVO' },
  { id: 'corte-q2', quincenaNumero: 2, diaCorte: 'Último día del mes (28/30/31)', diaLimitePago: 'Día 3 del siguiente mes', diasGracia: 2, aplicaMoratoriosDesdeDia: 6, estatus: 'ACTIVO' },
];

// =========================================================================
// 8. TIPO & DATOS: COMISIONES (Tab 12)
// =========================================================================
export interface ComisionEsquema {
  id: string;
  concepto: string;
  rangoRecuperacionMinPct: number;
  rangoRecuperacionMaxPct: number;
  comisionDistribuidoraPct: number;
  bonoCoordinadorPct: number;
  periodicidad: 'QUINCENAL' | 'MENSUAL';
}

export const INITIAL_COMISIONES: ComisionEsquema[] = [
  { id: 'com-01', concepto: 'Cobranza Excelente (Meta Cumplida)', rangoRecuperacionMinPct: 98, rangoRecuperacionMaxPct: 100, comisionDistribuidoraPct: 14.0, bonoCoordinadorPct: 2.5, periodicidad: 'QUINCENAL' },
  { id: 'com-02', concepto: 'Cobranza Satisfactoria', rangoRecuperacionMinPct: 92, rangoRecuperacionMaxPct: 97.9, comisionDistribuidoraPct: 11.0, bonoCoordinadorPct: 1.8, periodicidad: 'QUINCENAL' },
  { id: 'com-03', concepto: 'Cobranza Regular', rangoRecuperacionMinPct: 85, rangoRecuperacionMaxPct: 91.9, comisionDistribuidoraPct: 8.0, bonoCoordinadorPct: 1.0, periodicidad: 'QUINCENAL' },
  { id: 'com-04', concepto: 'Cobranza en Riesgo / Cartera Vencida', rangoRecuperacionMinPct: 0, rangoRecuperacionMaxPct: 84.9, comisionDistribuidoraPct: 3.0, bonoCoordinadorPct: 0.0, periodicidad: 'QUINCENAL' },
];

// =========================================================================
// 9. TIPO & DATOS: GESTORES DE COBRANZA (Tab 13)
// =========================================================================
export interface GestorCobranza {
  id: string;
  codigoGestor: string;
  nombre: string;
  telefono: string;
  sucursalId: string;
  carteraMoraAsignada: number;
  cuentasEnGestion: number;
  porcentajeRecuperacion: number;
  estatus: 'ACTIVO' | 'INACTIVO';
}

export const INITIAL_GESTORES: GestorCobranza[] = [
  { id: 'gst-01', codigoGestor: 'GST-SAL-01', nombre: 'Carlos Vazquez Gomez', telefono: '8441029384', sucursalId: 'SALTILLO', carteraMoraAsignada: 385000, cuentasEnGestion: 42, porcentajeRecuperacion: 78.5, estatus: 'ACTIVO' },
  { id: 'gst-02', codigoGestor: 'GST-DGO-02', nombre: 'Roberto Alanis Morales', telefono: '6182918273', sucursalId: 'DURANGO', carteraMoraAsignada: 420000, cuentasEnGestion: 55, porcentajeRecuperacion: 81.2, estatus: 'ACTIVO' },
  { id: 'gst-03', codigoGestor: 'GST-GP-03', nombre: 'Javier Solis Cardenas', telefono: '8719283746', sucursalId: 'GOMEZ PALACIO', carteraMoraAsignada: 290000, cuentasEnGestion: 31, porcentajeRecuperacion: 84.0, estatus: 'ACTIVO' },
  { id: 'gst-04', codigoGestor: 'GST-MTY-04', nombre: 'Edgar Hiram del Toro Sanchez', telefono: '8118273645', sucursalId: 'MONTERREY', carteraMoraAsignada: 510000, cuentasEnGestion: 64, porcentajeRecuperacion: 75.8, estatus: 'ACTIVO' },
];

// =========================================================================
// 10. TIPO & DATOS: ACCESOS COORDINADORES SUCURSAL (Tab 14)
// =========================================================================
export interface AccesoCoordinadorSucursal {
  id: string;
  coordinadorId: string;
  coordinadorNombre: string;
  sucursalMatriz: string;
  sucursalesSecundarias: string[];
  fechaAsignacion: string;
  estatus: 'ACTIVO' | 'INACTIVO';
}

export const INITIAL_ACCESOS_COORD_SUCURSAL: AccesoCoordinadorSucursal[] = [
  { id: 'acs-01', coordinadorId: 'COORD-19', coordinadorNombre: 'CARMEN BEATRIZ OSUNA ONTIVEROS', sucursalMatriz: 'SALTILLO', sucursalesSecundarias: ['MONTERREY'], fechaAsignacion: '01/01/2022', estatus: 'ACTIVO' },
  { id: 'acs-02', coordinadorId: 'COORD-20', coordinadorNombre: 'CESAR JOEL AGUILAR CORRAL', sucursalMatriz: 'DURANGO', sucursalesSecundarias: ['GOMEZ PALACIO'], fechaAsignacion: '15/05/2021', estatus: 'ACTIVO' },
  { id: 'acs-03', coordinadorId: 'COORD-22', coordinadorNombre: 'SANDRA SOTO', sucursalMatriz: 'GOMEZ PALACIO', sucursalesSecundarias: ['TORREON'], fechaAsignacion: '10/10/2021', estatus: 'ACTIVO' },
  { id: 'acs-04', coordinadorId: 'COORD-04', coordinadorNombre: 'ALEJANDRINA MONTOYA', sucursalMatriz: 'SALTILLO', sucursalesSecundarias: [], fechaAsignacion: '10/08/2021', estatus: 'ACTIVO' },
  { id: 'acs-05', coordinadorId: 'COORD-18', coordinadorNombre: 'SEBASTIAN BRACHO', sucursalMatriz: 'MONTERREY', sucursalesSecundarias: ['SALTILLO'], fechaAsignacion: '12/03/2024', estatus: 'ACTIVO' },
];

// =========================================================================
// 11. TIPO & DATOS: PERMISO MÓDULO X PERFIL (Tab 15)
// =========================================================================
export interface PermisoModuloPerfil {
  id: string;
  perfil: string;
  modulo: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  requiereMFA: boolean;
}

export const INITIAL_PERMISOS_MODULO_PERFIL: PermisoModuloPerfil[] = [
  { id: 'pmp-01', perfil: 'Admin', modulo: 'Todos los módulos', puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true, requiereMFA: true },
  { id: 'pmp-02', perfil: 'Analista', modulo: 'Mesa de Crédito & Personas', puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false, requiereMFA: false },
  { id: 'pmp-03', perfil: 'ASESOR DE CREDITO', modulo: 'CRM & Prospectos', puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false, requiereMFA: false },
  { id: 'pmp-04', perfil: 'Gerente de Sucursal', modulo: 'Sucursal, Coordinadores & Vales', puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false, requiereMFA: true },
  { id: 'pmp-05', perfil: 'Gerente de zona', modulo: 'Reportes, Cartera & Cobranza', puedeVer: true, puedeCrear: false, puedeEditar: true, puedeEliminar: false, requiereMFA: true },
  { id: 'pmp-06', perfil: 'Ejecutiva de Canjes', modulo: 'Dispersión & Canjes de Vales', puedeVer: true, puedeCrear: true, puedeEditar: false, puedeEliminar: false, requiereMFA: true },
  { id: 'pmp-07', perfil: 'Auditor PLD', modulo: 'Buzón PLD & Auditoría CNBV', puedeVer: true, puedeCrear: false, puedeEditar: false, puedeEliminar: false, requiereMFA: true },
];

// =========================================================================
// 12. TIPO & DATOS: SUCURSALES (Tab 4)
// =========================================================================
export interface CatalogoSucursalItem {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  manager: string;
  active: boolean;
}

export const INITIAL_CATALOGO_SUCURSALES: CatalogoSucursalItem[] = [
  { id: 'SUC-01', name: 'CHIHUAHUA', city: 'Chihuahua', state: 'Chihuahua', address: 'Fedor Dostoyevsk #1100-2, Alamedas III', phone: '614 412 8900', manager: 'Concepción Gerardo Castro Rico', active: true },
  { id: 'SUC-02', name: 'SALTILLO', city: 'Saltillo', state: 'Coahuila', address: 'C. Hidalgo #382 Nte., Zona Centro', phone: '844 601 1797', manager: 'Adrian Garcia Lopez', active: true },
  { id: 'SUC-03', name: 'GOMEZ PALACIO', city: 'Gómez Palacio', state: 'Durango', address: 'Av. Victoria #450, Zona Centro', phone: '871 714 5520', manager: 'Sandra Soto', active: true },
  { id: 'SUC-04', name: 'TORREON', city: 'Torreón', state: 'Coahuila', address: 'Blvd. Independencia #850 Ote., Zona Centro', phone: '871 222 3400', manager: 'Manuel Pulido Vielma', active: true },
  { id: 'SUC-05', name: 'DURANGO', city: 'Durango', state: 'Durango', address: 'Av. 20 de Noviembre #600 Pte., Centro', phone: '618 811 2040', manager: 'Cesar Joel Aguilar Corral', active: true },
  { id: 'SUC-06', name: 'CULIACAN', city: 'Culiacán', state: 'Sinaloa', address: 'Blvd. Pedro Infante #2200, Desarrollo Urbano Tres Ríos', phone: '667 713 9010', manager: 'Jesus Martin Gamez Olan', active: true },
  { id: 'SUC-07', name: 'JUAREZ', city: 'Ciudad Juárez', state: 'Chihuahua', address: 'Av. Tecnológico #4450, Partido Iglesias', phone: '656 617 8830', manager: 'Miguel Angel Pureco Chaparro', active: true },
  { id: 'SUC-08', name: 'DELICIAS', city: 'Delicias', state: 'Chihuahua', address: 'Av. 6a Norte #102, Centro', phone: '639 472 1500', manager: 'Rafael Arturo Rivera Ochoa', active: true },
  { id: 'SUC-09', name: 'MAZATLAN', city: 'Mazatlán', state: 'Sinaloa', address: 'Av. Ejército Mexicano #1204, Palos Prietos', phone: '669 985 4100', manager: 'Perla Yareli Garcia Rios', active: true },
  { id: 'SUC-10', name: 'MONCLOVA', city: 'Monclova', state: 'Coahuila', address: 'Blvd. Harold R. Pape #1200, Guadalupe', phone: '866 633 4580', manager: 'Reyna Elizabeth Gutierrez Rios', active: true },
];
