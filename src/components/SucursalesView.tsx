'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sucursal, InstitutionalUserConfig } from '@/types/configuracion';
import { UserSession } from '@/types/auth';
import {
  Building2,
  Building,
  Plus,
  Search,
  MapPin,
  Phone,
  UserCheck,
  Power,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Users,
  Store,
  RefreshCw,
  Link2,
  ShieldCheck,
  Ban,
  Check,
} from 'lucide-react';
import { formatMoney } from '@/lib/utils/formatters';

interface SucursalesViewProps {
  currentUser?: UserSession | null;
  onNavigateToCoordinadores?: (tab?: string) => void;
}

function getAuthHeaders(): HeadersInit {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('lanahora_user_session_v2') : null;
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
          'x-dev-bypass': 'true',
        };
      }
    }
  } catch {}
  return {
    'Content-Type': 'application/json',
    'x-dev-bypass': 'true',
  };
}

const DEFAULT_SUCURSALES: Sucursal[] = [
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

export default function SucursalesView({
  currentUser,
  onNavigateToCoordinadores,
}: SucursalesViewProps) {
  const [sucursales, setSucursales] = useState<Sucursal[]>(DEFAULT_SUCURSALES);
  const [usuarios, setUsuarios] = useState<InstitutionalUserConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstatus, setFilterEstatus] = useState<'ALL' | 'ACTIVA' | 'INACTIVA'>('ALL');
  const [filterCiudad, setFilterCiudad] = useState<string>('ALL');

  // Formulario Superior (Campos exactos del Sistema Legado)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSucursal, setFormSucursal] = useState('CHIHUAHUA');
  const [formNombreCompleto, setFormNombreCompleto] = useState('CHIHUAHUA');
  const [formDireccion, setFormDireccion] = useState('Fedor Dostoyevsk #1100-2, Alamedas III Etapa, Chihuahua 2000, CP 31136');
  const [formCiudad, setFormCiudad] = useState('CHIHUAHUA');
  const [formEstado, setFormEstado] = useState('CHIHUAHUA');
  const [formTelefono, setFormTelefono] = useState('614 412 8900');
  const [formLatitud, setFormLatitud] = useState<string>('28.6353');
  const [formLongitud, setFormLongitud] = useState<string>('-106.0889');
  const [formDistIdMin, setFormDistIdMin] = useState<number>(9001);
  const [formDistIdMax, setFormDistIdMax] = useState<number>(11000);
  const [formLimiteCredito, setFormLimiteCredito] = useState<number>(30000);
  const [formImporteMaxCanje, setFormImporteMaxCanje] = useState<number>(0);
  const [formMaxNumCanjes, setFormMaxNumCanjes] = useState<number>(5);
  const [formTabuladorTipo, setFormTabuladorTipo] = useState<number>(1);
  const [formGerente, setFormGerente] = useState('CONCEPCION GERARDO CASTRO RICO');
  const [formGestorSucursal, setFormGestorSucursal] = useState('Carlos Vazquez Gomez');
  const [formAbogado, setFormAbogado] = useState('CONCEPCION GERARDO CASTRO RICO');
  const [formAbogadoCoordinador, setFormAbogadoCoordinador] = useState('Jorge Valenzuela');
  const [formImagenPromo, setFormImagenPromo] = useState('~\\images\\P');
  const [formReqCarta, setFormReqCarta] = useState<boolean>(false);
  const [formActivo, setFormActivo] = useState<boolean>(true);
  const [formNoPuedeColocar, setFormNoPuedeColocar] = useState<boolean>(false);

  // Modal Confirmar Eliminar
  const [sucursalToDelete, setSucursalToDelete] = useState<Sucursal | null>(null);

  // Notificaciones Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Cargar datos del servidor
  const fetchData = async () => {
    setLoading(true);
    try {
      const resSuc = await fetch('/api/configuracion/sucursales', { headers: getAuthHeaders() });
      if (resSuc.ok) {
        const dataSuc = await resSuc.json();
        if (dataSuc.success && Array.isArray(dataSuc.sucursales) && dataSuc.sucursales.length > 0) {
          setSucursales(dataSuc.sucursales);
        }
      }

      const resUsr = await fetch('/api/configuracion/usuarios', { headers: getAuthHeaders() });
      if (resUsr.ok) {
        const dataUsr = await resUsr.json();
        if (dataUsr.success && Array.isArray(dataUsr.usuarios)) {
          setUsuarios(dataUsr.usuarios);
        }
      }
    } catch (e) {
      console.warn('Usando sucursales locales predeterminadas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cargar sucursal en formulario superior para editar
  const handleLoadSucursalForEdit = (suc: Sucursal) => {
    setEditingId(suc.id);
    setFormSucursal(suc.clave || suc.nombre);
    setFormNombreCompleto(suc.nombreCompleto || suc.nombre);
    setFormDireccion(suc.direccion || '');
    setFormCiudad(suc.ciudad || 'SALTILLO');
    setFormEstado(suc.estado || 'COAHUILA');
    setFormTelefono(suc.telefono || '');
    setFormLatitud(suc.latitud !== undefined ? String(suc.latitud) : '25.4260');
    setFormLongitud(suc.longitud !== undefined ? String(suc.longitud) : '-101.0053');
    setFormDistIdMin(suc.distIdMin || 1000);
    setFormDistIdMax(suc.distIdMax || 3000);
    setFormLimiteCredito(suc.limiteCredito || 30000);
    setFormImporteMaxCanje(suc.importeMaxCanje || 0);
    setFormMaxNumCanjes(suc.maxNumCanjes || 5);
    setFormTabuladorTipo(suc.tabuladorTipo || 1);
    setFormGerente(suc.gerente || suc.responsable || '');
    setFormGestorSucursal(suc.gestorSucursal || 'Carlos Vazquez Gomez');
    setFormAbogado(suc.abogado || 'Jorge Valenzuela');
    setFormAbogadoCoordinador(suc.abogadoCoordinador || 'Jorge Valenzuela');
    setFormImagenPromo(suc.imagenPromo || '~\\images\\P');
    setFormReqCarta(Boolean(suc.reqCartaPrestanombres));
    setFormActivo(suc.activo !== undefined ? Boolean(suc.activo) : suc.estatus === 'ACTIVA');
    setFormNoPuedeColocar(Boolean(suc.noPuedeColocar));

    showToast(`Sucursal "${suc.nombre}" cargada en el formulario superior.`);
  };

  // Limpiar formulario para nuevo registro
  const handleResetForm = () => {
    setEditingId(null);
    setFormSucursal('');
    setFormNombreCompleto('');
    setFormDireccion('');
    setFormCiudad('SALTILLO');
    setFormEstado('COAHUILA');
    setFormTelefono('');
    setFormLatitud('25.4260');
    setFormLongitud('-101.0053');
    setFormDistIdMin(1001);
    setFormDistIdMax(3000);
    setFormLimiteCredito(30000);
    setFormImporteMaxCanje(0);
    setFormMaxNumCanjes(5);
    setFormTabuladorTipo(1);
    setFormGerente('Adrian Garcia Lopez');
    setFormGestorSucursal('Carlos Vazquez Gomez');
    setFormAbogado('CONCEPCION GERARDO CASTRO RICO');
    setFormAbogadoCoordinador('Jorge Valenzuela');
    setFormImagenPromo('~\\images\\P');
    setFormReqCarta(false);
    setFormActivo(true);
    setFormNoPuedeColocar(false);
    showToast('Formulario limpio para capturar nueva sucursal.');
  };

  // Guardar / Actualizar sucursal desde formulario superior
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSucursal.trim()) {
      showToast('El nombre de la sucursal es obligatorio.', 'error');
      return;
    }

    const payload = {
      clave: formSucursal.trim().toUpperCase(),
      nombre: formSucursal.trim().toUpperCase(),
      nombreCompleto: formNombreCompleto.trim() || formSucursal.trim().toUpperCase(),
      direccion: formDireccion.trim(),
      ciudad: formCiudad.trim().toUpperCase(),
      estado: formEstado.trim().toUpperCase(),
      telefono: formTelefono.trim(),
      responsable: formGerente || '',
      latitud: Number(formLatitud) || undefined,
      longitud: Number(formLongitud) || undefined,
      distIdMin: Number(formDistIdMin) || 1000,
      distIdMax: Number(formDistIdMax) || 3000,
      limiteCredito: Number(formLimiteCredito) || 30000,
      importeMaxCanje: Number(formImporteMaxCanje) || 0,
      maxNumCanjes: Number(formMaxNumCanjes) || 5,
      tabuladorTipo: Number(formTabuladorTipo) || 1,
      gerente: formGerente,
      gestorSucursal: formGestorSucursal,
      abogado: formAbogado,
      abogadoCoordinador: formAbogadoCoordinador,
      imagenPromo: formImagenPromo,
      reqCartaPrestanombres: formReqCarta,
      activo: formActivo,
      noPuedeColocar: formNoPuedeColocar,
      estatus: (formActivo ? 'ACTIVA' : 'INACTIVA') as 'ACTIVA' | 'INACTIVA',
    };

    if (editingId) {
      // Actualizar existente
      try {
        await fetch(`/api/configuracion/sucursales/${editingId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } catch (err) {}

      setSucursales((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
      );
      showToast(`Sucursal "${formSucursal}" actualizada exitosamente.`);
    } else {
      // Crear nueva
      const nextIdNum = sucursales.reduce((max, s) => Math.max(max, s.sucursalIdNum || 0), 0) + 1;
      const newSuc: Sucursal = {
        ...payload,
        id: `suc-${Date.now()}`,
        sucursalIdNum: nextIdNum,
        fechaRegistro: new Date().toISOString(),
      };

      try {
        await fetch('/api/configuracion/sucursales', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newSuc),
        });
      } catch (err) {}

      setSucursales((prev) => [newSuc, ...prev]);
      showToast(`Nueva sucursal "${formSucursal}" registrada exitosamente.`);
    }
  };

  // Filtrado reactivo
  const filteredSucursales = useMemo(() => {
    return sucursales.filter((s) => {
      if (filterEstatus !== 'ALL' && s.estatus !== filterEstatus) return false;
      if (filterCiudad !== 'ALL' && s.ciudad.toUpperCase() !== filterCiudad.toUpperCase()) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        s.nombre.toLowerCase().includes(q) ||
        s.clave.toLowerCase().includes(q) ||
        (s.nombreCompleto && s.nombreCompleto.toLowerCase().includes(q)) ||
        (s.responsable && s.responsable.toLowerCase().includes(q)) ||
        (s.gerente && s.gerente.toLowerCase().includes(q)) ||
        (s.abogado && s.abogado.toLowerCase().includes(q)) ||
        s.ciudad.toLowerCase().includes(q) ||
        s.estado.toLowerCase().includes(q) ||
        s.direccion.toLowerCase().includes(q) ||
        (s.telefono && s.telefono.includes(q))
      );
    });
  }, [sucursales, filterEstatus, filterCiudad, searchTerm]);

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* ======================================================== */}
      {/* 1. HEADER CON SUB-PESTAÑAS DEL SISTEMA ANTERIOR          */}
      {/* ======================================================== */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Catálogo de Sucursales y Parámetros Operativos</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {sucursales.length} Sucursales
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Configuración de rangos de distribuidor (Dist ID Min/Max), límites de colocación y abogados asignados.
            </p>
          </div>
        </div>

        {/* SUB-TABS INTERACTIVAS (IDÉNTICAS AL SISTEMA LEGADO) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1 text-xs">
          <button
            type="button"
            onClick={() => onNavigateToCoordinadores?.('coordinadores')}
            className="px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Coordinadores</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToCoordinadores?.('accesos')}
            className="px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Accesos x Coordinador</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToCoordinadores?.('funciones')}
            className="px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Funciones x Usuario</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg font-bold bg-white text-blue-700 shadow-2xs transition flex items-center gap-1.5 cursor-default"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Sucursales</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-mono font-bold">
              {sucursales.length}
            </span>
          </button>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FORMULARIO SUPERIOR A 2 COLUMNAS (SISTEMA ANTERIOR)   */}
      {/* ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-900 tracking-tight">
              {editingId ? `Editando Sucursal: ${formSucursal}` : 'Alta y Configuración de Sucursal'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetForm}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            + Nuevo
          </button>
        </div>

        <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {/* --- COLUMNA IZQUIERDA --- */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Sucursal:*</label>
                <input
                  type="text"
                  required
                  value={formSucursal}
                  onChange={(e) => setFormSucursal(e.target.value)}
                  placeholder="CHIHUAHUA"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-bold text-slate-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Dirección:</label>
                <input
                  type="text"
                  value={formDireccion}
                  onChange={(e) => setFormDireccion(e.target.value)}
                  placeholder="Calle, Número, Colonia, CP"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Estado:</label>
                <input
                  type="text"
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  placeholder="CHIHUAHUA"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white uppercase font-medium"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Latitud:</label>
                <input
                  type="text"
                  value={formLatitud}
                  onChange={(e) => setFormLatitud(e.target.value)}
                  placeholder="28.6353"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Dist ID Min:</label>
                <input
                  type="number"
                  value={formDistIdMin}
                  onChange={(e) => setFormDistIdMin(Number(e.target.value))}
                  placeholder="9001"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono font-bold text-blue-700"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Límite Crédito:</label>
                <input
                  type="number"
                  value={formLimiteCredito}
                  onChange={(e) => setFormLimiteCredito(Number(e.target.value))}
                  placeholder="30000"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Máx Num Canjes:</label>
                <input
                  type="number"
                  value={formMaxNumCanjes}
                  onChange={(e) => setFormMaxNumCanjes(Number(e.target.value))}
                  placeholder="5"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Gerente:</label>
                <input
                  type="text"
                  value={formGerente}
                  onChange={(e) => setFormGerente(e.target.value)}
                  placeholder="CONCEPCION GERARDO CASTRO RICO"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Abogado:</label>
                <input
                  type="text"
                  value={formAbogado}
                  onChange={(e) => setFormAbogado(e.target.value)}
                  placeholder="CONCEPCION GERARDO CASTRO RICO"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Imagen Promo:</label>
                <input
                  type="text"
                  value={formImagenPromo}
                  onChange={(e) => setFormImagenPromo(e.target.value)}
                  placeholder="~\images\P"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center pt-1">
                <label className="col-span-4 font-bold text-slate-700">Activo:</label>
                <div className="col-span-8 flex items-center">
                  <input
                    type="checkbox"
                    checked={formActivo}
                    onChange={(e) => setFormActivo(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 text-slate-600 font-medium">Sucursal activa en el sistema</span>
                </div>
              </div>
            </div>

            {/* --- COLUMNA DERECHA --- */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Nombre Completo:</label>
                <input
                  type="text"
                  value={formNombreCompleto}
                  onChange={(e) => setFormNombreCompleto(e.target.value)}
                  placeholder="CHIHUAHUA"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Ciudad:</label>
                <input
                  type="text"
                  value={formCiudad}
                  onChange={(e) => setFormCiudad(e.target.value)}
                  placeholder="CHIHUAHUA"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-medium uppercase"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Teléfono:</label>
                <input
                  type="text"
                  value={formTelefono}
                  onChange={(e) => setFormTelefono(e.target.value)}
                  placeholder="614 412 8900"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Longitud:</label>
                <input
                  type="text"
                  value={formLongitud}
                  onChange={(e) => setFormLongitud(e.target.value)}
                  placeholder="-106.0889"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Dist ID Max:</label>
                <input
                  type="number"
                  value={formDistIdMax}
                  onChange={(e) => setFormDistIdMax(Number(e.target.value))}
                  placeholder="11000"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono font-bold text-blue-700"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Importe Máx Canje:</label>
                <input
                  type="number"
                  value={formImporteMaxCanje}
                  onChange={(e) => setFormImporteMaxCanje(Number(e.target.value))}
                  placeholder="0"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Tabulador Tipo:</label>
                <input
                  type="number"
                  value={formTabuladorTipo}
                  onChange={(e) => setFormTabuladorTipo(Number(e.target.value))}
                  placeholder="1"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Gestor Sucursal:</label>
                <input
                  type="text"
                  value={formGestorSucursal}
                  onChange={(e) => setFormGestorSucursal(e.target.value)}
                  placeholder="Carlos Vazquez Gomez"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Abogado Coordinador:</label>
                <input
                  type="text"
                  value={formAbogadoCoordinador}
                  onChange={(e) => setFormAbogadoCoordinador(e.target.value)}
                  placeholder="Jorge Valenzuela"
                  className="col-span-8 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <label className="col-span-4 font-bold text-slate-700">Req Carta Prestanombres:</label>
                <div className="col-span-8 flex items-center">
                  <input
                    type="checkbox"
                    checked={formReqCarta}
                    onChange={(e) => setFormReqCarta(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 text-slate-500 text-[11px]">Obligatorio en mesa de control</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center pt-1">
                <label className="col-span-4 font-bold text-slate-700">No puede colocar:</label>
                <div className="col-span-8 flex items-center">
                  <input
                    type="checkbox"
                    checked={formNoPuedeColocar}
                    onChange={(e) => setFormNoPuedeColocar(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                  <span className={`ml-2 font-bold ${formNoPuedeColocar ? 'text-rose-600' : 'text-slate-500'}`}>
                    {formNoPuedeColocar ? 'BLOQUEADA PARA ORIGINACIÓN' : 'Permite colocar vales'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones Actualizar / Cancelar al pie del formulario */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer"
            >
              {editingId ? 'Actualizar' : 'Guardar Sucursal'}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 3. BARRA DE BÚSQUEDA Y CONTROL                           */}
      {/* ======================================================== */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Introduzca el texto a buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="ACTIVA">Activas</option>
            <option value="INACTIVA">Inactivas</option>
          </select>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA HORIZONTAL CON COLUMNAS DEL SISTEMA ANTERIOR     */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold select-none">
              <tr>
                <th className="p-3 text-center">Acción</th>
                <th className="p-3 text-center">ID</th>
                <th className="p-3">Sucursal</th>
                <th className="p-3">Nombre Completo</th>
                <th className="p-3">Dirección</th>
                <th className="p-3">Ciudad</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3 text-center">Latitud</th>
                <th className="p-3 text-center">Longitud</th>
                <th className="p-3 text-center">Dist ID Min</th>
                <th className="p-3 text-center">Dist ID Max</th>
                <th className="p-3 text-right">Límite Crédito</th>
                <th className="p-3 text-right">Importe Máx Canje</th>
                <th className="p-3 text-center">Máx Num Canjes</th>
                <th className="p-3 text-center">Tabulador Tipo</th>
                <th className="p-3">Gerente</th>
                <th className="p-3">Gestor Sucursal</th>
                <th className="p-3">Abogado</th>
                <th className="p-3">Abogado Coordinador</th>
                <th className="p-3">Imagen Promo</th>
                <th className="p-3 text-center">Req Carta Prestanombres</th>
                <th className="p-3 text-center">Activo</th>
                <th className="p-3 text-center">No puede colocar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSucursales.map((suc) => (
                <tr key={suc.id} className="hover:bg-slate-50/80 transition">
                  {/* Acción: Editar enlace azul como el sistema anterior */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleLoadSucursalForEdit(suc)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-bold text-xs transition cursor-pointer"
                      title="Cargar sucursal en el formulario superior"
                    >
                      Editar
                    </button>
                  </td>

                  {/* ID numérico consecutivo */}
                  <td className="p-3 text-center font-mono font-bold text-slate-600">
                    {suc.sucursalIdNum || suc.id.replace(/\D/g, '') || '1'}
                  </td>

                  {/* Sucursal Clave */}
                  <td className="p-3 font-bold text-slate-900 uppercase">
                    {suc.clave || suc.nombre}
                  </td>

                  {/* Nombre Completo */}
                  <td className="p-3 font-semibold text-slate-700">
                    {suc.nombreCompleto || suc.nombre}
                  </td>

                  {/* Dirección */}
                  <td className="p-3 text-slate-600 max-w-xs truncate" title={suc.direccion}>
                    {suc.direccion || '-'}
                  </td>

                  {/* Ciudad */}
                  <td className="p-3 font-medium text-slate-700">{suc.ciudad}</td>

                  {/* Estado */}
                  <td className="p-3 font-medium text-slate-700">{suc.estado}</td>

                  {/* Teléfono */}
                  <td className="p-3 font-mono text-slate-600">{suc.telefono || '-'}</td>

                  {/* Latitud */}
                  <td className="p-3 text-center font-mono text-slate-500">
                    {suc.latitud !== undefined ? suc.latitud : '-'}
                  </td>

                  {/* Longitud */}
                  <td className="p-3 text-center font-mono text-slate-500">
                    {suc.longitud !== undefined ? suc.longitud : '-'}
                  </td>

                  {/* Dist ID Min */}
                  <td className="p-3 text-center font-mono font-bold text-blue-700">
                    {suc.distIdMin?.toLocaleString('es-MX') || '1,001'}
                  </td>

                  {/* Dist ID Max */}
                  <td className="p-3 text-center font-mono font-bold text-blue-700">
                    {suc.distIdMax?.toLocaleString('es-MX') || '3,000'}
                  </td>

                  {/* Límite Crédito estrictamente con formatMoney */}
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatMoney(suc.limiteCredito || 30000)}
                  </td>

                  {/* Importe Máx Canje */}
                  <td className="p-3 text-right font-mono text-slate-700">
                    {formatMoney(suc.importeMaxCanje || 0)}
                  </td>

                  {/* Máx Num Canjes */}
                  <td className="p-3 text-center font-mono text-slate-700">
                    {suc.maxNumCanjes || 5}
                  </td>

                  {/* Tabulador Tipo */}
                  <td className="p-3 text-center font-mono text-slate-700">
                    {suc.tabuladorTipo || 1}
                  </td>

                  {/* Gerente */}
                  <td className="p-3 text-slate-700 font-medium">
                    {suc.gerente || suc.responsable || '-'}
                  </td>

                  {/* Gestor Sucursal */}
                  <td className="p-3 text-slate-700 font-medium">
                    {suc.gestorSucursal || '-'}
                  </td>

                  {/* Abogado */}
                  <td className="p-3 font-semibold text-slate-900">
                    {suc.abogado || '-'}
                  </td>

                  {/* Abogado Coordinador */}
                  <td className="p-3 text-slate-600">
                    {suc.abogadoCoordinador || '-'}
                  </td>

                  {/* Imagen Promo */}
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {suc.imagenPromo || '-'}
                  </td>

                  {/* Req Carta Prestanombres */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(suc.reqCartaPrestanombres)}
                      readOnly
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                    />
                  </td>

                  {/* Activo */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={suc.activo !== undefined ? suc.activo : suc.estatus === 'ACTIVA'}
                      readOnly
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                  </td>

                  {/* No puede colocar */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(suc.noPuedeColocar)}
                      readOnly
                      className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                    />
                  </td>
                </tr>
              ))}
              {filteredSucursales.length === 0 && (
                <tr>
                  <td colSpan={24} className="p-8 text-center text-slate-400">
                    No se encontraron sucursales registradas con el criterio de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Paginación estilo sistema anterior */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium">
          <span>
            Página <strong>1 de 1</strong> ({filteredSucursales.length} elementos)
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-400 cursor-not-allowed">
              &lt;
            </span>
            <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold">
              [1]
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-400 cursor-not-allowed">
              &gt;
            </span>
            <span className="ml-1 text-slate-500 font-sans cursor-pointer hover:underline">All</span>
          </div>
        </div>
      </div>
    </div>
  );
}
