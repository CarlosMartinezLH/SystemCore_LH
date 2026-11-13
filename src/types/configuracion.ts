import { UserRole, ActionPermissions } from './auth';

export interface Sucursal {
  id: string;
  sucursalIdNum?: number;
  clave: string;
  nombre: string;
  nombreCompleto?: string;
  direccion: string;
  ciudad: string;
  estado: string;
  telefono: string;
  responsable: string;
  latitud?: number;
  longitud?: number;
  distIdMin?: number;
  distIdMax?: number;
  limiteCredito?: number;
  importeMaxCanje?: number;
  maxNumCanjes?: number;
  tabuladorTipo?: number;
  gerente?: string;
  gestorSucursal?: string;
  abogado?: string;
  abogadoCoordinador?: string;
  imagenPromo?: string;
  reqCartaPrestanombres?: boolean;
  activo?: boolean;
  noPuedeColocar?: boolean;
  estatus: 'ACTIVA' | 'INACTIVA';
  fechaRegistro: string;
}

export interface InstitutionalUserConfig {
  id: string;
  name: string;
  email: string;
  password?: string;
  puesto: string;
  role: UserRole;
  roleLabel: string;
  branch: string;
  branchScope: 'ALL' | 'BRANCH';
  telefono?: string;
  estatus: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  avatarInitials: string;
  allowedModules?: string[];
  permissions?: ActionPermissions;
}

