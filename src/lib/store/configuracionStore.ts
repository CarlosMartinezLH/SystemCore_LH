import { Sucursal, InstitutionalUserConfig } from '@/types/configuracion';
import { INSTITUTIONAL_USERS } from '@/types/auth';

const INITIAL_SUCURSALES: Sucursal[] = [
  {
    id: 'suc-001',
    clave: 'SUC-CORP',
    nombre: 'Corporativo Saltillo',
    direccion: 'C. Hidalgo #382 Nte., Zona Centro',
    ciudad: 'Saltillo',
    estado: 'Coahuila',
    telefono: '844 601 1797',
    responsable: 'José Carlos Martínez Mayorga',
    estatus: 'ACTIVA',
    fechaRegistro: '2024-01-15T09:00:00.000Z',
  },
  {
    id: 'suc-002',
    clave: 'SUC-SLT-CEN',
    nombre: 'Saltillo Centro',
    direccion: 'C. Hidalgo #382 Nte., entre Aldama y Pérez Treviño',
    ciudad: 'Saltillo',
    estado: 'Coahuila',
    telefono: '844 594 3752',
    responsable: 'Cindy Karime López García',
    estatus: 'ACTIVA',
    fechaRegistro: '2024-02-01T09:00:00.000Z',
  },
  {
    id: 'suc-003',
    clave: 'SUC-TRN-CEN',
    nombre: 'Torreón Centro',
    direccion: 'Av. Hidalgo #1040, Col. Centro',
    ciudad: 'Torreón',
    estado: 'Coahuila',
    telefono: '871 712 9080',
    responsable: 'Esaú Espinoza Hernández',
    estatus: 'ACTIVA',
    fechaRegistro: '2024-03-10T09:00:00.000Z',
  },
  {
    id: 'suc-004',
    clave: 'SUC-MVA-FOR',
    nombre: 'Monclova Foránea',
    direccion: 'Blvd. Harold R. Pape #805, Col. Guadalupe',
    ciudad: 'Monclova',
    estado: 'Coahuila',
    telefono: '866 633 4520',
    responsable: 'Roberto Treviño Valdez',
    estatus: 'ACTIVA',
    fechaRegistro: '2024-04-05T09:00:00.000Z',
  },
  {
    id: 'suc-005',
    clave: 'SUC-RAM-ARZ',
    nombre: 'Ramos Arizpe',
    direccion: 'Blvd. Plan de Guadalupe #450, Zona Industrial',
    ciudad: 'Ramos Arizpe',
    estado: 'Coahuila',
    telefono: '844 488 2310',
    responsable: 'Brenda Marcela Morales',
    estatus: 'ACTIVA',
    fechaRegistro: '2024-06-20T09:00:00.000Z',
  },
];

const INITIAL_USUARIOS: InstitutionalUserConfig[] = INSTITUTIONAL_USERS.map((u, i) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  password: u.password || 'lanahora2026',
  puesto: u.roleLabel,
  role: u.role,
  roleLabel: u.roleLabel,
  branch: u.branch,
  branchScope: u.branchScope,
  telefono: '844 ' + (5000000 + i * 111111),
  estatus: 'ACTIVO',
  createdAt: '2024-01-15T00:00:00.000Z',
  avatarInitials: u.avatarInitials,
  allowedModules: u.allowedModules || [],
  permissions: u.permissions,
}));

class ConfiguracionStore {
  private sucursales: Sucursal[] = [...INITIAL_SUCURSALES];
  private usuarios: InstitutionalUserConfig[] = [...INITIAL_USUARIOS];

  // --- SUCURSALES ---
  getSucursales(): Sucursal[] {
    return this.sucursales;
  }

  crearSucursal(data: Omit<Sucursal, 'id' | 'fechaRegistro'>): Sucursal {
    const id = `suc-${Date.now()}`;
    const nueva: Sucursal = {
      ...data,
      id,
      fechaRegistro: new Date().toISOString(),
    };
    this.sucursales.unshift(nueva);
    return nueva;
  }

  actualizarSucursal(id: string, data: Partial<Sucursal>): Sucursal | null {
    const idx = this.sucursales.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const oldName = this.sucursales[idx].nombre;
    this.sucursales[idx] = { ...this.sucursales[idx], ...data };

    // Si se cambió el nombre de la sucursal, actualizar en cascada a los usuarios
    if (data.nombre && data.nombre !== oldName) {
      this.usuarios = this.usuarios.map((u) =>
        u.branch === oldName ? { ...u, branch: data.nombre! } : u
      );
    }

    return this.sucursales[idx];
  }

  toggleEstatusSucursal(id: string): Sucursal | null {
    const idx = this.sucursales.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const nuevo = this.sucursales[idx].estatus === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    this.sucursales[idx].estatus = nuevo;
    return this.sucursales[idx];
  }

  eliminarSucursal(id: string): boolean {
    const idx = this.sucursales.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const nombre = this.sucursales[idx].nombre;
    this.sucursales.splice(idx, 1);

    // Reasignar usuarios de esa sucursal a 'Corporativo Saltillo'
    this.usuarios = this.usuarios.map((u) =>
      u.branch === nombre ? { ...u, branch: 'Corporativo Saltillo' } : u
    );
    return true;
  }

  // --- USUARIOS ---
  getUsuarios(): InstitutionalUserConfig[] {
    return this.usuarios;
  }

  crearUsuario(data: Omit<InstitutionalUserConfig, 'id' | 'createdAt' | 'avatarInitials'>): InstitutionalUserConfig {
    const id = `usr-${Date.now()}`;
    const names = data.name.trim().split(' ');
    const initials =
      names.length >= 2
        ? (names[0][0] + names[1][0]).toUpperCase()
        : names[0].substring(0, 2).toUpperCase();

    const nuevo: InstitutionalUserConfig = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      avatarInitials: initials,
    };
    this.usuarios.unshift(nuevo);
    return nuevo;
  }

  actualizarUsuario(id: string, data: Partial<InstitutionalUserConfig>): InstitutionalUserConfig | null {
    const idx = this.usuarios.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    if (data.name) {
      const names = data.name.trim().split(' ');
      data.avatarInitials =
        names.length >= 2
          ? (names[0][0] + names[1][0]).toUpperCase()
          : names[0].substring(0, 2).toUpperCase();
    }

    this.usuarios[idx] = { ...this.usuarios[idx], ...data };
    return this.usuarios[idx];
  }

  toggleEstatusUsuario(id: string): InstitutionalUserConfig | null {
    const idx = this.usuarios.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const nuevo = this.usuarios[idx].estatus === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.usuarios[idx].estatus = nuevo;
    return this.usuarios[idx];
  }

  eliminarUsuario(id: string): boolean {
    const idx = this.usuarios.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.usuarios.splice(idx, 1);
    return true;
  }
}

declare global {
  var __configuracionStore: ConfiguracionStore | undefined;
}

export const configuracionStore = global.__configuracionStore || new ConfiguracionStore();
if (process.env.NODE_ENV !== 'production') {
  global.__configuracionStore = configuracionStore;
}

