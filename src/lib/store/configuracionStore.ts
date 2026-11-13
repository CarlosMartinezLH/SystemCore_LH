import { Sucursal, InstitutionalUserConfig } from '@/types/configuracion';
import { INSTITUTIONAL_USERS } from '@/types/auth';

const INITIAL_SUCURSALES: Sucursal[] = [
  {
    id: 'suc-001',
    sucursalIdNum: 1,
    clave: 'CHIHUAHUA',
    nombre: 'CHIHUAHUA',
    nombreCompleto: 'CHIHUAHUA',
    direccion: 'Fedor Dostoyevsk #1100-2, Alamedas III Etapa, Chihuahua 2000, CP 31136',
    ciudad: 'CHIHUAHUA',
    estado: 'CHIHUAHUA',
    telefono: '614 412 8900',
    responsable: 'Concepción Gerardo Castro Rico',
    latitud: 28.6353,
    longitud: -106.0889,
    distIdMin: 9001,
    distIdMax: 11000,
    limiteCredito: 30000,
    importeMaxCanje: 0,
    maxNumCanjes: 5,
    tabuladorTipo: 1,
    gerente: 'CONCEPCION GERARDO CASTRO RICO',
    gestorSucursal: 'Carlos Vazquez Gomez',
    abogado: 'CONCEPCION GERARDO CASTRO RICO',
    abogadoCoordinador: 'Jorge Valenzuela',
    imagenPromo: '~\\images\\P',
    reqCartaPrestanombres: false,
    activo: true,
    noPuedeColocar: false,
    estatus: 'ACTIVA',
    fechaRegistro: '2023-01-15T09:00:00.000Z',
  },
  {
    id: 'suc-002',
    sucursalIdNum: 2,
    clave: 'SALTILLO',
    nombre: 'SALTILLO',
    nombreCompleto: 'Saltillo Corporativo',
    direccion: 'C. Hidalgo #382 Nte., Zona Centro',
    ciudad: 'SALTILLO',
    estado: 'COAHUILA',
    telefono: '844 601 1797',
    responsable: 'José Carlos Martínez Mayorga',
    latitud: 25.4260,
    longitud: -101.0053,
    distIdMin: 1001,
    distIdMax: 3000,
    limiteCredito: 50000,
    importeMaxCanje: 15000,
    maxNumCanjes: 8,
    tabuladorTipo: 1,
    gerente: 'Adrian Garcia Lopez',
    gestorSucursal: 'Carlos Vazquez Gomez',
    abogado: 'Jorge Valenzuela',
    abogadoCoordinador: 'Jorge Valenzuela',
    imagenPromo: '~\\images\\saltillo.png',
    reqCartaPrestanombres: false,
    activo: true,
    noPuedeColocar: false,
    estatus: 'ACTIVA',
    fechaRegistro: '2024-01-15T09:00:00.000Z',
  },
  {
    id: 'suc-003',
    sucursalIdNum: 3,
    clave: 'GOMEZ PALACIO',
    nombre: 'GOMEZ PALACIO',
    nombreCompleto: 'Gómez Palacio Centro',
    direccion: 'Av. Victoria #450, Zona Centro',
    ciudad: 'GOMEZ PALACIO',
    estado: 'DURANGO',
    telefono: '871 412 5836',
    responsable: 'Eduardo Del Río Álvarez',
    latitud: 25.5684,
    longitud: -103.4988,
    distIdMin: 3001,
    distIdMax: 5000,
    limiteCredito: 45000,
    importeMaxCanje: 12000,
    maxNumCanjes: 6,
    tabuladorTipo: 1,
    gerente: 'Adriana Ruiz Hernandez',
    gestorSucursal: 'Carlos Vazquez Gomez',
    abogado: 'Jorge Valenzuela',
    abogadoCoordinador: 'Jorge Valenzuela',
    imagenPromo: '~\\images\\gomez.png',
    reqCartaPrestanombres: false,
    activo: true,
    noPuedeColocar: false,
    estatus: 'ACTIVA',
    fechaRegistro: '2024-02-01T09:00:00.000Z',
  },
  {
    id: 'suc-004',
    sucursalIdNum: 4,
    clave: 'DURANGO',
    nombre: 'DURANGO',
    nombreCompleto: 'Durango Centro',
    direccion: 'Av. 20 de Noviembre #705, Zona Centro',
    ciudad: 'DURANGO',
    estado: 'DURANGO',
    telefono: '618 123 4567',
    responsable: 'Alejandro Aguirre Morales',
    latitud: 24.0277,
    longitud: -104.6532,
    distIdMin: 5001,
    distIdMax: 7000,
    limiteCredito: 40000,
    importeMaxCanje: 10000,
    maxNumCanjes: 6,
    tabuladorTipo: 1,
    gerente: 'Cesar Joel Aguilar Corral',
    gestorSucursal: 'Carlos Vazquez Gomez',
    abogado: 'Jorge Valenzuela',
    abogadoCoordinador: 'Jorge Valenzuela',
    imagenPromo: '~\\images\\durango.png',
    reqCartaPrestanombres: false,
    activo: true,
    noPuedeColocar: false,
    estatus: 'ACTIVA',
    fechaRegistro: '2024-03-10T09:00:00.000Z',
  },
  {
    id: 'suc-005',
    sucursalIdNum: 5,
    clave: 'TORREON',
    nombre: 'TORREON',
    nombreCompleto: 'Torreón Centro',
    direccion: 'Av. Hidalgo #1040, Col. Centro',
    ciudad: 'TORREON',
    estado: 'COAHUILA',
    telefono: '871 712 9080',
    responsable: 'Esaú Espinoza Hernández',
    latitud: 25.5428,
    longitud: -103.4068,
    distIdMin: 7001,
    distIdMax: 9000,
    limiteCredito: 45000,
    importeMaxCanje: 12000,
    maxNumCanjes: 6,
    tabuladorTipo: 1,
    gerente: 'Esaú Espinoza Hernández',
    gestorSucursal: 'Carlos Vazquez Gomez',
    abogado: 'Jorge Valenzuela',
    abogadoCoordinador: 'Jorge Valenzuela',
    imagenPromo: '~\\images\\torreon.png',
    reqCartaPrestanombres: false,
    activo: true,
    noPuedeColocar: false,
    estatus: 'ACTIVA',
    fechaRegistro: '2024-04-05T09:00:00.000Z',
  },
  {
    id: 'suc-006',
    sucursalIdNum: 6,
    clave: 'MONCLOVA',
    nombre: 'MONCLOVA',
    nombreCompleto: 'Monclova Foránea',
    direccion: 'Blvd. Harold R. Pape #805, Col. Guadalupe',
    ciudad: 'MONCLOVA',
    estado: 'COAHUILA',
    telefono: '866 633 4520',
    responsable: 'Roberto Treviño Valdez',
    latitud: 26.9069,
    longitud: -101.4206,
    distIdMin: 11001,
    distIdMax: 13000,
    limiteCredito: 35000,
    importeMaxCanje: 8000,
    maxNumCanjes: 5,
    tabuladorTipo: 1,
    gerente: 'Roberto Treviño Valdez',
    gestorSucursal: 'Carlos Vazquez Gomez',
    abogado: 'Jorge Valenzuela',
    abogadoCoordinador: 'Jorge Valenzuela',
    imagenPromo: '~\\images\\monclova.png',
    reqCartaPrestanombres: false,
    activo: true,
    noPuedeColocar: false,
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

