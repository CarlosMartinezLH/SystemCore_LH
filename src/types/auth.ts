export type UserRole = 
  | 'ASESOR_CAMPO'
  | 'COORDINADOR_COMERCIAL'
  | 'MESA_CREDITO'
  | 'COORDINADOR_NEGOCIOS'
  | 'GERENTE_SUCURSAL'
  | 'ADMINISTRADOR';

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
}

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
  },
];

// Compatibility export
export const DEMO_USERS: Record<string, UserSession> = {
  admin: INSTITUTIONAL_USERS[0],
  asesor: INSTITUTIONAL_USERS[3],
  coordinador: INSTITUTIONAL_USERS[4],
  mesa: INSTITUTIONAL_USERS[2],
};

