export type UserRole = 
  | 'ASESOR_CAMPO'
  | 'COORDINADOR_COMERCIAL'
  | 'MESA_CREDITO'
  | 'COORDINADOR_NEGOCIOS'
  | 'GERENTE_SUCURSAL'
  | 'ADMINISTRADOR';

export interface ActionPermissions {
  canApproveLoans: boolean;
  canDisperseSPEI: boolean;
  canEditRules: boolean;
  canManageUsers: boolean;
  canViewPayroll: boolean;
  canExportData: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleLabel: string;
  branch: string; // ej. Corporativo (Todas), Saltillo Centro, Torreón Centro, Monclova Foránea
  branchScope: 'ALL' | 'BRANCH'; // 'ALL' = administrativo (ve todo); 'BRANCH' = solo su sucursal
  avatarInitials: string;
  allowedModules?: string[];
  permissions?: ActionPermissions;
}

export const ALL_SYSTEM_MODULES: { id: string; name: string; category: string; description: string }[] = [
  { id: 'core_dashboard', name: 'Buscador Core & Monitor Timeline', category: 'Operaciones & Cartera', description: 'Monitor en vivo Ballast y búsqueda de cartera' },
  { id: 'crm', name: 'CRM & Tubería de Originación', category: 'Operaciones & Cartera', description: 'Prospectos, cotizaciones y conversión' },
  { id: 'mesa_credito', name: 'Mesa de Crédito & Riesgos', category: 'Operaciones & Cartera', description: 'Dictamen de solicitudes, Buró BC Score y análisis de riesgo' },
  { id: 'dispersion', name: 'Bancos & SPEI STP', category: 'Operaciones & Cartera', description: 'Recepción automática, cascada a crédito y dispersión STP' },
  { id: 'lanatienda', name: 'LanaTienda Vales', category: 'Operaciones & Cartera', description: 'Compras en línea y financiamiento departamental' },
  { id: 'distribuidores', name: 'Padrón Distribuidoras (DV)', category: 'Cobranza & Distribución', description: 'Líneas de crédito, categorías y comisiones' },
  { id: 'personas', name: 'Personas & Clientes KYC', category: 'Cobranza & Distribución', description: 'Expedientes, RENAPO, SAT 69-B y buró' },
  { id: 'gestoria', name: 'Gestoría & Notas de Cobranza', category: 'Cobranza & Distribución', description: 'Gestión domiciliaria, promesas de pago y bitácora de gestores' },
  { id: 'reportes', name: 'Reportes & Colocación por DV', category: 'Reportes & Contabilidad', description: 'Colocación quincenal por DV, vintage de morosidad y metas' },
  { id: 'contabilidad', name: 'Contabilidad & Pólizas Core', category: 'Reportes & Contabilidad', description: 'Pólizas automáticas de egresos e ingresos, balanza y asientos' },
  { id: 'reglas', name: 'Reglas del Negocio & Políticas', category: 'Gobernanza & Cumplimiento', description: '51 reglas auditadas, comisiones 30-15 y amortizaciones' },
  { id: 'pld', name: 'Buzón PLD & Prevención de Fraude', category: 'Gobernanza & Cumplimiento', description: 'Reporte anónimo de operaciones sospechosas y cumplimiento UIF' },
  { id: 'notificaciones', name: 'Alertas & Notificaciones Móviles', category: 'Gobernanza & Cumplimiento', description: 'Alertas push y recordatorios masivos' },
  { id: 'rh', name: 'Capital Humano (Buk RH)', category: 'Administración Interna & RH', description: 'Colaboradores, GPS, vacaciones, nómina y OKRs' },
  { id: 'configuracion', name: 'Configuración & Sucursales', category: 'Administración Interna & RH', description: 'Usuarios, permisos, sucursales y roles' },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<
  UserRole,
  { allowedModules: string[]; permissions: ActionPermissions }
> = {
  ADMINISTRADOR: {
    allowedModules: [
      'core_dashboard',
      'crm',
      'mesa_credito',
      'dispersion',
      'lanatienda',
      'distribuidores',
      'personas',
      'gestoria',
      'reportes',
      'contabilidad',
      'reglas',
      'pld',
      'notificaciones',
      'rh',
      'configuracion',
    ],
    permissions: {
      canApproveLoans: true,
      canDisperseSPEI: true,
      canEditRules: true,
      canManageUsers: true,
      canViewPayroll: true,
      canExportData: true,
    },
  },
  MESA_CREDITO: {
    allowedModules: ['core_dashboard', 'crm', 'mesa_credito', 'distribuidores', 'personas', 'reportes', 'reglas', 'pld'],
    permissions: {
      canApproveLoans: true,
      canDisperseSPEI: false,
      canEditRules: false,
      canManageUsers: false,
      canViewPayroll: false,
      canExportData: true,
    },
  },
  GERENTE_SUCURSAL: {
    allowedModules: [
      'core_dashboard',
      'crm',
      'mesa_credito',
      'distribuidores',
      'personas',
      'gestoria',
      'reportes',
      'lanatienda',
      'rh',
      'pld',
    ],
    permissions: {
      canApproveLoans: false,
      canDisperseSPEI: false,
      canEditRules: false,
      canManageUsers: false,
      canViewPayroll: false,
      canExportData: true,
    },
  },
  COORDINADOR_COMERCIAL: {
    allowedModules: ['core_dashboard', 'crm', 'distribuidores', 'personas', 'reportes', 'pld'],
    permissions: {
      canApproveLoans: false,
      canDisperseSPEI: false,
      canEditRules: false,
      canManageUsers: false,
      canViewPayroll: false,
      canExportData: true,
    },
  },
  COORDINADOR_NEGOCIOS: {
    allowedModules: ['core_dashboard', 'crm', 'distribuidores', 'personas', 'gestoria', 'reportes', 'pld'],
    permissions: {
      canApproveLoans: false,
      canDisperseSPEI: false,
      canEditRules: false,
      canManageUsers: false,
      canViewPayroll: false,
      canExportData: true,
    },
  },
  ASESOR_CAMPO: {
    allowedModules: ['core_dashboard', 'crm', 'distribuidores', 'personas', 'pld'],
    permissions: {
      canApproveLoans: false,
      canDisperseSPEI: false,
      canEditRules: false,
      canManageUsers: false,
      canViewPayroll: false,
      canExportData: false,
    },
  },
};

export const INSTITUTIONAL_USERS: UserSession[] = [
  // --- 1. PERFIL ADMINISTRATIVO (Acceso Global a Todas las Sucursales) ---
  {
    id: 'usr-admin',
    name: 'JOSE CARLOS MARTINEZ MAYORGA',
    email: 'carlos_martinez@lanahora.com',
    password: 'lanahora2026',
    role: 'ADMINISTRADOR',
    roleLabel: 'Dirección General / Administrador',
    branch: 'Corporativo (Todas las Sucursales)',
    branchScope: 'ALL',
    avatarInitials: 'JC',
    allowedModules: DEFAULT_ROLE_PERMISSIONS.ADMINISTRADOR.allowedModules,
    permissions: DEFAULT_ROLE_PERMISSIONS.ADMINISTRADOR.permissions,
  },
  {
    id: 'usr-admin-gen',
    name: 'ADMINISTRADOR GENERAL CORE',
    email: 'admin@lanahora.com',
    password: 'lanahora2026',
    role: 'ADMINISTRADOR',
    roleLabel: 'Administración Corporativa',
    branch: 'Corporativo (Todas las Sucursales)',
    branchScope: 'ALL',
    avatarInitials: 'AD',
    allowedModules: DEFAULT_ROLE_PERMISSIONS.ADMINISTRADOR.allowedModules,
    permissions: DEFAULT_ROLE_PERMISSIONS.ADMINISTRADOR.permissions,
  },
  {
    id: 'usr-mesa',
    name: 'LORENA DE LA TORRE',
    email: 'mesa_credito@lanahora.com',
    password: 'credito2026',
    role: 'MESA_CREDITO',
    roleLabel: 'Mesa de Crédito & Riesgos (Nacional)',
    branch: 'Corporativo (Todas las Sucursales)',
    branchScope: 'ALL',
    avatarInitials: 'LT',
    allowedModules: DEFAULT_ROLE_PERMISSIONS.MESA_CREDITO.allowedModules,
    permissions: DEFAULT_ROLE_PERMISSIONS.MESA_CREDITO.permissions,
  },

  // --- 2. PERFIL DE SUCURSAL (Restringido Únicamente a su Sucursal) ---
  {
    id: 'usr-saltillo',
    name: 'CINDY KARIME LOPEZ GARCIA',
    email: 'saltillo@lanahora.com',
    password: 'saltillo2026',
    role: 'GERENTE_SUCURSAL',
    roleLabel: 'Gerencia Saltillo',
    branch: 'Saltillo Centro',
    branchScope: 'BRANCH',
    avatarInitials: 'CK',
    allowedModules: DEFAULT_ROLE_PERMISSIONS.GERENTE_SUCURSAL.allowedModules,
    permissions: DEFAULT_ROLE_PERMISSIONS.GERENTE_SUCURSAL.permissions,
  },
  {
    id: 'usr-torreon',
    name: 'ESAU ESPINOZA HERNANDEZ',
    email: 'torreon@lanahora.com',
    password: 'torreon2026',
    role: 'GERENTE_SUCURSAL',
    roleLabel: 'Gerencia Torreón',
    branch: 'Torreón Centro',
    branchScope: 'BRANCH',
    avatarInitials: 'EE',
    allowedModules: DEFAULT_ROLE_PERMISSIONS.GERENTE_SUCURSAL.allowedModules,
    permissions: DEFAULT_ROLE_PERMISSIONS.GERENTE_SUCURSAL.permissions,
  },
  {
    id: 'usr-monclova',
    name: 'ROBERTO TREVIÑO VALDEZ',
    email: 'monclova@lanahora.com',
    password: 'monclova2026',
    role: 'GERENTE_SUCURSAL',
    roleLabel: 'Gerencia Monclova',
    branch: 'Monclova Foránea',
    branchScope: 'BRANCH',
    avatarInitials: 'RT',
    allowedModules: DEFAULT_ROLE_PERMISSIONS.GERENTE_SUCURSAL.allowedModules,
    permissions: DEFAULT_ROLE_PERMISSIONS.GERENTE_SUCURSAL.permissions,
  },
];

// Compatibility export
export const DEMO_USERS: Record<string, UserSession> = {
  admin: INSTITUTIONAL_USERS[0],
  asesor: INSTITUTIONAL_USERS[3],
  coordinador: INSTITUTIONAL_USERS[4],
  mesa: INSTITUTIONAL_USERS[2],
};

