import { UserRole } from './auth';

export interface Sucursal {
  id: string;
  clave: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  telefono: string;
  responsable: string;
  estatus: 'ACTIVA' | 'INACTIVA';
  fechaRegistro: string;
}

export interface InstitutionalUserConfig {
  id: string;
  name: string;
  email: string;
  puesto: string;
  role: UserRole;
  roleLabel: string;
  branch: string;
  branchScope: 'ALL' | 'BRANCH';
  telefono?: string;
  estatus: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  avatarInitials: string;
}
