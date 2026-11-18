// ==============================================================================
// LanAhora SystemCore — Catálogo Oficial de Perfiles y Matriz de Permisos (RBAC)
// Extraído de la base de datos de producción: Perfil Usuario ID, Sistema Modulo, Función
// ==============================================================================

export interface PerfilSistemaOficial {
  id: string;
  nombre: string;
  categoria: 'DIRECCION' | 'GERENCIA' | 'OPERACIONES' | 'LEGAL' | 'RIESGOS' | 'ADMINISTRACION';
  descripcion: string;
  totalPermisosModulos: number;
  totalFuncionesEspeciales: number;
}

export const LISTA_PERFILES_OFICIALES: PerfilSistemaOficial[] = [
  {
    id: 'Admin',
    nombre: 'Administrador General del Sistema',
    categoria: 'DIRECCION',
    descripcion: 'Control absoluto de módulos, parámetros financieros, cancelaciones bancarias y desbloqueos.',
    totalPermisosModulos: 89,
    totalFuncionesEspeciales: 24,
  },
  {
    id: 'Director General',
    nombre: 'Director General',
    categoria: 'DIRECCION',
    descripcion: 'Acceso corporativo integral a métricas, colocación, cobranza y asignación de valeras.',
    totalPermisosModulos: 82,
    totalFuncionesEspeciales: 10,
  },
  {
    id: 'Director Operativo',
    nombre: 'Director Operativo',
    categoria: 'DIRECCION',
    descripcion: 'Supervisión y control de sucursales, dispersiones, cortes y carteras regionales.',
    totalPermisosModulos: 78,
    totalFuncionesEspeciales: 8,
  },
  {
    id: 'Oficial de Control',
    nombre: 'Oficial de Control',
    categoria: 'DIRECCION',
    descripcion: 'Validación estricta de expedientes de distribuidores y auditoría de colocación.',
    totalPermisosModulos: 74,
    totalFuncionesEspeciales: 7,
  },
  {
    id: 'COORDINADOR JURIDICO',
    nombre: 'Coordinador Jurídico',
    categoria: 'LEGAL',
    descripcion: 'Titular de Cartera Legal, asignación de abogados litigantes, demandas y dictámenes.',
    totalPermisosModulos: 43,
    totalFuncionesEspeciales: 12,
  },
  {
    id: 'Abogado Juridico',
    nombre: 'Abogado Jurídico / Litigante',
    categoria: 'LEGAL',
    descripcion: 'Gestión procesal de demandas radicadas, convenios judiciales y reportes legales.',
    totalPermisosModulos: 39,
    totalFuncionesEspeciales: 8,
  },
  {
    id: 'Gerente de Sucursal',
    nombre: 'Gerente de Sucursal',
    categoria: 'GERENCIA',
    descripcion: 'Responsable de la plaza: reestructuras, cambio de coordinadores, cálculo de relaciones y cancelación.',
    totalPermisosModulos: 42,
    totalFuncionesEspeciales: 14,
  },
  {
    id: 'Gerente de zona',
    nombre: 'Gerente de Zona',
    categoria: 'GERENCIA',
    descripcion: 'Supervisión multizonal: cambio de coordinador, gestor, comisiones y reestructuras.',
    totalPermisosModulos: 48,
    totalFuncionesEspeciales: 16,
  },
  {
    id: 'GERENTE VOLANTE',
    nombre: 'Gerente Volante',
    categoria: 'GERENCIA',
    descripcion: 'Atención a sucursales foráneas con facultades plenas de auditoría y reestructura.',
    totalPermisosModulos: 45,
    totalFuncionesEspeciales: 15,
  },
  {
    id: 'GERENTE DE COBRANZA',
    nombre: 'Gerente de Cobranza',
    categoria: 'GERENCIA',
    descripcion: 'Supervisión de recuperación en mora, asignación de gestores y análisis de corte.',
    totalPermisosModulos: 34,
    totalFuncionesEspeciales: 6,
  },
  {
    id: 'Coordinador de Negocios',
    nombre: 'Coordinador de Negocios',
    categoria: 'OPERACIONES',
    descripcion: 'Atención directa a distribuidores de la sucursal y asignación oficial de valeras.',
    totalPermisosModulos: 38,
    totalFuncionesEspeciales: 7,
  },
  {
    id: 'Analista',
    nombre: 'Analista de Riesgos y Crédito',
    categoria: 'RIESGOS',
    descripcion: 'Validación de contratos, modificación de líneas de crédito, bloqueos y reestructuras.',
    totalPermisosModulos: 36,
    totalFuncionesEspeciales: 11,
  },
  {
    id: 'ASESOR DE CREDITO',
    nombre: 'Asesor de Crédito',
    categoria: 'OPERACIONES',
    descripcion: 'Originación de campo, integración de prospectos y prospección de distribuidoras.',
    totalPermisosModulos: 61,
    totalFuncionesEspeciales: 6,
  },
  {
    id: 'Ejecutiva de Canjes',
    nombre: 'Ejecutiva de Canjes',
    categoria: 'OPERACIONES',
    descripcion: 'Mesa de ventanilla: canjes de vales físicos y digitales y asignación de valeras.',
    totalPermisosModulos: 34,
    totalFuncionesEspeciales: 7,
  },
  {
    id: 'Gestor de Cobranza',
    nombre: 'Gestor de Cobranza en Campo',
    categoria: 'OPERACIONES',
    descripcion: 'Visitas domiciliarias de cobranza temprana (1 a 30 días de atraso) y registro de notas con GPS.',
    totalPermisosModulos: 40,
    totalFuncionesEspeciales: 8,
  },
  {
    id: 'Administrador LanaTienda',
    nombre: 'Administrador LanaTienda',
    categoria: 'ADMINISTRACION',
    descripcion: 'Gestión de catálogo departamental, validación de compras y cancelación de órdenes.',
    totalPermisosModulos: 35,
    totalFuncionesEspeciales: 8,
  },
  {
    id: 'TESORERIA',
    nombre: 'Tesorería & Bancos',
    categoria: 'ADMINISTRACION',
    descripcion: 'Dispersión SPEI STP, conciliación de cobranza Banorte/Paynet y pólizas.',
    totalPermisosModulos: 25,
    totalFuncionesEspeciales: 4,
  },
];

export interface FuncionEspecialPermiso {
  id: number;
  perfil: string;
  funcion: string;
  activo: boolean;
}

export const FUNCIONES_ESPECIALES_CLAVE: FuncionEspecialPermiso[] = [
  { id: 1, perfil: 'Director General', funcion: 'ASIGNAR VALERAS', activo: true },
  { id: 2, perfil: 'Oficial de Control', funcion: 'VALIDAR DISTRIBUIDORES', activo: true },
  { id: 3, perfil: 'Gerente de zona', funcion: 'VER TELEFONO EN LISTADO DISTRIBUIDORES', activo: true },
  { id: 4, perfil: 'Admin', funcion: 'VER TELEFONO EN LISTADO DISTRIBUIDORES', activo: true },
  { id: 5, perfil: 'Ejecutiva de Canjes', funcion: 'ASIGNAR VALERAS', activo: true },
  { id: 6, perfil: 'Analista', funcion: 'BLOQUEA DISTRIBUIDOR', activo: true },
  { id: 7, perfil: 'Analista', funcion: 'VALIDAR CONTRATO DE DISTRIBUIDOR', activo: true },
  { id: 9, perfil: 'Analista', funcion: 'PUEDE CAMBIAR LINEAS DE CREDITO', activo: true },
  { id: 10, perfil: 'Analista', funcion: 'GENERA RESTRUTURA DE DISTRIBUIDOR', activo: true },
  { id: 11, perfil: 'Analista', funcion: 'FINALIZAR SOLICITUDES MESA DE CREDITO', activo: true },
  { id: 12, perfil: 'COORDINADOR JURIDICO', funcion: 'VER REPORTES DE LEGAL', activo: true },
  { id: 13, perfil: 'Gerente de zona', funcion: 'MODIFICAR INFORMACIÓN DE DISTRIBUIDOR', activo: true },
  { id: 14, perfil: 'Gerente de zona', funcion: 'MODIFICAR FECHA DE COMISION', activo: true },
  { id: 15, perfil: 'Gerente de zona', funcion: 'MODIFICAR COORDINADOR DE DISTRIBUIDOR', activo: true },
  { id: 16, perfil: 'Gerente de zona', funcion: 'RECALCULAR ULTIMA RELACION DE DV', activo: true },
  { id: 17, perfil: 'Gerente de zona', funcion: 'CAMBIA GESTOR DISTRIBUIDOR', activo: true },
  { id: 19, perfil: 'Administrador LanaTienda', funcion: 'CANCELAR VENTA LANATIENDA', activo: true },
  { id: 174, perfil: 'Admin', funcion: 'AGENTE MESA CREDITO', activo: true },
  { id: 175, perfil: 'Admin', funcion: 'CAMBIAR DESEMBOLSO', activo: true },
  { id: 176, perfil: 'Admin', funcion: 'CANCELAR CREDITOS', activo: true },
  { id: 177, perfil: 'GERENTE DE COBRANZA', funcion: 'CAMBIA GESTOR DISTRIBUIDOR', activo: true },
  { id: 205, perfil: 'Admin', funcion: 'CANCELAR MOVS BANCO', activo: true },
  { id: 212, perfil: 'COORDINADOR JURIDICO', funcion: 'MOD:GLOBAL LEGAL, FUN: VER TODA LA CARTERA', activo: true },
  { id: 213, perfil: 'COORDINADOR JURIDICO', funcion: 'MOD:GLOBAL LEGAL, FUN: ASIGNAR ABOGADO', activo: true },
  { id: 214, perfil: 'COORDINADOR JURIDICO', funcion: 'VER TODAS LAS SOLICITUDES DE BANDEJA DE CREDITO Y PERMISO A SUC', activo: true },
  { id: 216, perfil: 'Administrador LanaTienda', funcion: 'ACTIVA DISTRIBUIDOR', activo: true },
  { id: 217, perfil: 'Coordinador de Negocios', funcion: 'ASIGNAR VALERAS', activo: true },
  { id: 228, perfil: 'Admin', funcion: 'MOD:GLOBAL LEGAL, FUN: VER TODA LA CARTERA', activo: true },
  { id: 237, perfil: 'Gerente de Sucursal', funcion: 'RECALCULAR ULTIMA RELACION DE DV', activo: true },
  { id: 240, perfil: 'Admin', funcion: 'GENERA RESTRUTURA DE DISTRIBUIDOR', activo: true },
  { id: 241, perfil: 'Gerente de Sucursal', funcion: 'GENERA RESTRUTURA DE DISTRIBUIDOR', activo: true },
  { id: 244, perfil: 'Gerente de Sucursal', funcion: 'CAMBIA GESTOR DISTRIBUIDOR', activo: true },
  { id: 245, perfil: 'Gerente de Sucursal', funcion: 'CANCELA DISTRIBUIDOR', activo: true },
  { id: 246, perfil: 'Admin', funcion: 'ACTIVA DISTRIBUIDOR', activo: true },
  { id: 250, perfil: 'Admin', funcion: 'PUEDE CAMBIAR LINEAS DE CREDITO', activo: true },
  { id: 251, perfil: 'Gerente de Sucursal', funcion: 'MODIFICAR COORDINADOR DE DISTRIBUIDOR', activo: true },
  { id: 253, perfil: 'Admin', funcion: 'CANCELA DISTRIBUIDOR', activo: true },
];
