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
  role: UserRole;
  roleLabel: string;
  branch: string; // ej. Saltillo Centro, Torreón, Monclova
  avatarInitials: string;
}

export const DEMO_USERS: Record<string, UserSession> = {
  admin: {
    id: 'usr-1',
    name: 'JOSE CARLOS MARTINEZ MAYORGA',
    email: 'carlos_martinez@lanahora.com',
    role: 'ADMINISTRADOR',
    roleLabel: 'Dirección General / Administrador',
    branch: 'Corporativo Saltillo',
    avatarInitials: 'JC',
  },
  asesor: {
    id: 'usr-2',
    name: 'CINDY KARIME LOPEZ GARCIA',
    email: 'cindy_lopez@lanahora.com',
    role: 'ASESOR_CAMPO',
    roleLabel: 'Asesor de Crédito (Campo)',
    branch: 'Saltillo Centro',
    avatarInitials: 'CK',
  },
  coordinador: {
    id: 'usr-3',
    name: 'ESAU ESPINOZA',
    email: 'esau_espinoza@lanahora.com',
    role: 'COORDINADOR_COMERCIAL',
    roleLabel: 'Coordinador Comercial',
    branch: 'Saltillo Centro',
    avatarInitials: 'EE',
  },
  mesa: {
    id: 'usr-4',
    name: 'LORENA DE LA TORRE',
    email: 'lorena_torre@lanahora.com',
    role: 'MESA_CREDITO',
    roleLabel: 'Analista de Mesa de Crédito',
    branch: 'Corporativo Saltillo',
    avatarInitials: 'LT',
  },
};
