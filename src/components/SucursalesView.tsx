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
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Ban,
  Check,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  AlertCircle,
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

export default function SucursalesView({ currentUser }: SucursalesViewProps) {
  const [sucursales, setSucursales] = useState<Sucursal[]>(DEFAULT_SUCURSALES);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstatus, setFilterEstatus] = useState<'ALL' | 'ACTIVA' | 'INACTIVA'>('ALL');
  const [filterCiudad, setFilterCiudad] = useState<string>('ALL');
  const [filterColocacion, setFilterColocacion] = useState<'ALL' | 'PERMITIDA' | 'BLOQUEADA'>('ALL');

  // Estado del Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos del formulario modal
  const [formSucursal, setFormSucursal] = useState('');
  const [formNombreCompleto, setFormNombreCompleto] = useState('');
  const [formDireccion, setFormDireccion] = useState('');
  const [formCiudad, setFormCiudad] = useState('SALTILLO');
  const [formEstado, setFormEstado] = useState('COAHUILA');
  const [formTelefono, setFormTelefono] = useState('');
  const [formLatitud, setFormLatitud] = useState<string>('25.4260');
  const [formLongitud, setFormLongitud] = useState<string>('-101.0053');
  const [formDistIdMin, setFormDistIdMin] = useState<number>(1001);
  const [formDistIdMax, setFormDistIdMax] = useState<number>(3000);
  const [formLimiteCredito, setFormLimiteCredito] = useState<number>(30000);
  const [formImporteMaxCanje, setFormImporteMaxCanje] = useState<number>(0);
  const [formMaxNumCanjes, setFormMaxNumCanjes] = useState<number>(5);
  const [formTabuladorTipo, setFormTabuladorTipo] = useState<number>(1);
  const [formGerente, setFormGerente] = useState('');
  const [formGestorSucursal, setFormGestorSucursal] = useState('Carlos Vazquez Gomez');
  const [formAbogado, setFormAbogado] = useState('Jorge Valenzuela');
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
    } catch (e) {
      console.warn('Usando sucursales locales predeterminadas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Abrir modal para crear nueva sucursal
  const handleOpenCreateModal = () => {
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
    setFormGerente('');
    setFormGestorSucursal('Carlos Vazquez Gomez');
    setFormAbogado('Jorge Valenzuela');
    setFormAbogadoCoordinador('Jorge Valenzuela');
    setFormImagenPromo('~\\images\\P');
    setFormReqCarta(false);
    setFormActivo(true);
    setFormNoPuedeColocar(false);
    setIsModalOpen(true);
  };

  // Abrir modal para editar sucursal existente
  const handleOpenEditModal = (suc: Sucursal) => {
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
    setIsModalOpen(true);
  };

  // Guardar / Actualizar sucursal desde Modal
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSucursal.trim()) {
      showToast('El nombre o clave de la sucursal es obligatorio.', 'error');
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

    setIsModalOpen(false);
  };

  // Confirmar y eliminar sucursal
  const handleConfirmDelete = async () => {
    if (!sucursalToDelete) return;
    try {
      await fetch(`/api/configuracion/sucursales/${sucursalToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {}

    setSucursales((prev) => prev.filter((s) => s.id !== sucursalToDelete.id));
    showToast(`Sucursal "${sucursalToDelete.nombre}" eliminada exitosamente.`);
    setSucursalToDelete(null);
  };

  // Métricas para KPI Cards
  const metrics = useMemo(() => {
    const total = sucursales.length;
    const activas = sucursales.filter((s) => s.activo !== false && s.estatus !== 'INACTIVA').length;
    const inactivas = total - activas;
    const ciudades = new Set(sucursales.map((s) => s.ciudad.toUpperCase())).size;
    const sumaCredito = sucursales.reduce((acc, s) => acc + (s.limiteCredito || 0), 0);
    const promCredito = total > 0 ? sumaCredito / total : 0;
    return { total, activas, inactivas, ciudades, promCredito };
  }, [sucursales]);

  // Lista de ciudades únicas para el filtro
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    sucursales.forEach((s) => {
      if (s.ciudad) set.add(s.ciudad.toUpperCase());
    });
    return Array.from(set).sort();
  }, [sucursales]);

  // Filtrado reactivo
  const filteredSucursales = useMemo(() => {
    return sucursales.filter((s) => {
      if (filterEstatus !== 'ALL' && s.estatus !== filterEstatus) return false;
      if (filterCiudad !== 'ALL' && s.ciudad.toUpperCase() !== filterCiudad.toUpperCase()) return false;
      if (filterColocacion === 'PERMITIDA' && s.noPuedeColocar) return false;
      if (filterColocacion === 'BLOQUEADA' && !s.noPuedeColocar) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        s.nombre.toLowerCase().includes(q) ||
        s.clave.toLowerCase().includes(q) ||
        (s.nombreCompleto && s.nombreCompleto.toLowerCase().includes(q)) ||
        (s.responsable && s.responsable.toLowerCase().includes(q)) ||
        (s.gerente && s.gerente.toLowerCase().includes(q)) ||
        (s.gestorSucursal && s.gestorSucursal.toLowerCase().includes(q)) ||
        (s.abogado && s.abogado.toLowerCase().includes(q)) ||
        (s.abogadoCoordinador && s.abogadoCoordinador.toLowerCase().includes(q)) ||
        s.ciudad.toLowerCase().includes(q) ||
        s.estado.toLowerCase().includes(q) ||
        s.direccion.toLowerCase().includes(q) ||
        (s.telefono && s.telefono.includes(q)) ||
        (s.distIdMin && String(s.distIdMin).includes(q)) ||
        (s.distIdMax && String(s.distIdMax).includes(q))
      );
    });
  }, [sucursales, filterEstatus, filterCiudad, filterColocacion, searchTerm]);

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* ======================================================== */}
      {/* 1. HEADER LIMPIO DEL CATÁLOGO DE SUCURSALES              */}
      {/* ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Catálogo de Sucursales
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {sucursales.length} Registradas
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Administración de plazas, rangos de distribuidor (Dist ID Min/Max), límites de crédito y abogados asignados.
            </p>
          </div>
        </div>

        {/* Botones de acción principales */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs cursor-pointer"
            title="Refrescar catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Sucursal</span>
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
      {/* 2. TARJETAS DE RESUMEN MACRO / KPIS                     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Sucursales */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Sucursales
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-900 font-mono">
                {metrics.total}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Plazas</span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/80">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Sucursales Activas */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Estatus Operativo
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-600 font-mono">
                {metrics.activas}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Activas {metrics.inactivas > 0 ? `(${metrics.inactivas} Inact)` : ''}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Plazas / Ciudades */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Cobertura Geográfica
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-indigo-600 font-mono">
                {metrics.ciudades}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Ciudades</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/80">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* Límite Crédito Promedio */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Límite Crédito Promedio
            </span>
            <span className="text-lg font-black text-slate-900 font-mono block mt-0.5">
              {formatMoney(metrics.promCredito)}
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/80">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BARRA DE CONTROL Y FILTROS                            */}
      {/* ======================================================== */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Introduzca el texto a buscar (clave, ciudad, abogado, rango DV)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium text-slate-900"
          />
        </div>

        {/* Filtros Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ciudad */}
          <select
            value={filterCiudad}
            onChange={(e) => setFilterCiudad(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">Todas las Ciudades</option>
            {uniqueCities.map((ciudad) => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>

          {/* Estatus */}
          <select
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="ACTIVA">Activas</option>
            <option value="INACTIVA">Inactivas</option>
          </select>

          {/* Colocación */}
          <select
            value={filterColocacion}
            onChange={(e) => setFilterColocacion(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
          >
            <option value="ALL">Toda Colocación</option>
            <option value="PERMITIDA">Colocación Permitida</option>
            <option value="BLOQUEADA">Colocación Bloqueada</option>
          </select>

          {/* Limpiar filtros */}
          {(searchTerm || filterCiudad !== 'ALL' || filterEstatus !== 'ALL' || filterColocacion !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCiudad('ALL');
                setFilterEstatus('ALL');
                setFilterColocacion('ALL');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1 transition cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA PRINCIPAL DEL CATÁLOGO DE SUCURSALES             */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold select-none">
              <tr>
                <th className="p-3 text-center">Acciones</th>
                <th className="p-3 text-center">ID</th>
                <th className="p-3">Sucursal</th>
                <th className="p-3">Nombre Completo</th>
                <th className="p-3">Ciudad / Estado</th>
                <th className="p-3">Dirección</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3 text-center">Rango DVs (Min - Max)</th>
                <th className="p-3 text-right">Límite Crédito</th>
                <th className="p-3 text-right">Importe Máx Canje</th>
                <th className="p-3 text-center">Máx Canjes</th>
                <th className="p-3">Gerente</th>
                <th className="p-3">Abogado</th>
                <th className="p-3 text-center">Estatus</th>
                <th className="p-3 text-center">Colocación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSucursales.map((suc) => (
                <tr key={suc.id} className="hover:bg-slate-50/80 transition">
                  {/* Acciones */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(suc)}
                        className="px-2.5 py-1 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                        title="Editar parámetros de la sucursal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => setSucursalToDelete(suc)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Eliminar sucursal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* ID numérico */}
                  <td className="p-3 text-center font-mono font-bold text-slate-600">
                    {suc.sucursalIdNum || suc.id.replace(/\D/g, '') || '1'}
                  </td>

                  {/* Sucursal Clave */}
                  <td className="p-3 font-bold text-slate-900 uppercase">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span>{suc.clave || suc.nombre}</span>
                    </div>
                  </td>

                  {/* Nombre Completo */}
                  <td className="p-3 font-semibold text-slate-700">
                    {suc.nombreCompleto || suc.nombre}
                  </td>

                  {/* Ciudad / Estado */}
                  <td className="p-3 font-medium text-slate-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{suc.ciudad}, {suc.estado}</span>
                    </div>
                  </td>

                  {/* Dirección */}
                  <td className="p-3 text-slate-600 max-w-xs truncate" title={suc.direccion}>
                    {suc.direccion || '-'}
                  </td>

                  {/* Teléfono */}
                  <td className="p-3 font-mono text-slate-600">
                    {suc.telefono || '-'}
                  </td>

                  {/* Rango DVs Min - Max */}
                  <td className="p-3 text-center font-mono font-bold text-blue-700">
                    {suc.distIdMin?.toLocaleString('es-MX') || '1,001'} - {suc.distIdMax?.toLocaleString('es-MX') || '3,000'}
                  </td>

                  {/* Límite Crédito */}
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatMoney(suc.limiteCredito || 30000)}
                  </td>

                  {/* Importe Máx Canje */}
                  <td className="p-3 text-right font-mono text-slate-700">
                    {formatMoney(suc.importeMaxCanje || 0)}
                  </td>

                  {/* Máx Canjes */}
                  <td className="p-3 text-center font-mono text-slate-700">
                    {suc.maxNumCanjes || 5}
                  </td>

                  {/* Gerente */}
                  <td className="p-3 text-slate-700 font-medium">
                    {suc.gerente || suc.responsable || '-'}
                  </td>

                  {/* Abogado */}
                  <td className="p-3 font-semibold text-slate-900">
                    {suc.abogado || '-'}
                  </td>

                  {/* Estatus */}
                  <td className="p-3 text-center">
                    {suc.activo !== false && suc.estatus !== 'INACTIVA' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>ACTIVA</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <Ban className="w-3 h-3" />
                        <span>INACTIVA</span>
                      </span>
                    )}
                  </td>

                  {/* Colocación */}
                  <td className="p-3 text-center">
                    {suc.noPuedeColocar ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <Ban className="w-3 h-3" />
                        <span>BLOQUEADA</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Check className="w-3 h-3" />
                        <span>PERMITIDA</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSucursales.length === 0 && (
                <tr>
                  <td colSpan={15} className="p-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No se encontraron sucursales</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Prueba con otro término de búsqueda o limpia los filtros activos.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Paginación */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium">
          <span>
            Mostrando <strong>{filteredSucursales.length}</strong> de <strong>{sucursales.length}</strong> sucursales
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold">
              [1]
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL FORMULARIO A 2 COLUMNAS (CREAR / EDITAR)         */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    {editingId ? `Editar Sucursal: ${formSucursal}` : 'Alta de Nueva Sucursal'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingId
                      ? 'Actualiza los parámetros operativos, rango de distribuidores y responsables.'
                      : 'Captura los datos y reglas operativas para dar de alta una nueva plaza.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                {/* --- COLUMNA IZQUIERDA --- */}
                <div className="space-y-3">
                  {/* Sucursal Clave */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Sucursal (Clave): <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formSucursal}
                      onChange={(e) => setFormSucursal(e.target.value)}
                      placeholder="Ej. CHIHUAHUA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-bold text-slate-900 uppercase"
                    />
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dirección:</label>
                    <input
                      type="text"
                      value={formDireccion}
                      onChange={(e) => setFormDireccion(e.target.value)}
                      placeholder="Calle, Número, Colonia, Código Postal"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 text-slate-800"
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estado:</label>
                    <input
                      type="text"
                      value={formEstado}
                      onChange={(e) => setFormEstado(e.target.value)}
                      placeholder="Ej. COAHUILA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 uppercase font-medium"
                    />
                  </div>

                  {/* Latitud */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Latitud Geográfica:</label>
                    <input
                      type="text"
                      value={formLatitud}
                      onChange={(e) => setFormLatitud(e.target.value)}
                      placeholder="Ej. 28.6353"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                  </div>

                  {/* Dist ID Min */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Dist ID Min (Rango Inicial DVs):
                    </label>
                    <input
                      type="number"
                      value={formDistIdMin}
                      onChange={(e) => setFormDistIdMin(Number(e.target.value))}
                      placeholder="1001"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono font-bold text-blue-700"
                    />
                  </div>

                  {/* Límite Crédito */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Límite Crédito Sucursal ($ MXN):
                    </label>
                    <input
                      type="number"
                      value={formLimiteCredito}
                      onChange={(e) => setFormLimiteCredito(Number(e.target.value))}
                      placeholder="30000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono font-bold text-slate-900"
                    />
                  </div>

                  {/* Máx Num Canjes */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Máx Num Canjes:</label>
                    <input
                      type="number"
                      value={formMaxNumCanjes}
                      onChange={(e) => setFormMaxNumCanjes(Number(e.target.value))}
                      placeholder="5"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                  </div>

                  {/* Gerente */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gerente de Sucursal:</label>
                    <input
                      type="text"
                      value={formGerente}
                      onChange={(e) => setFormGerente(e.target.value)}
                      placeholder="Nombre del gerente o responsable"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
                    />
                  </div>

                  {/* Abogado */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Abogado Asignado:</label>
                    <input
                      type="text"
                      value={formAbogado}
                      onChange={(e) => setFormAbogado(e.target.value)}
                      placeholder="Nombre del abogado litigante"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium text-slate-800"
                    />
                  </div>

                  {/* Imagen Promo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ruta Imagen Promo:</label>
                    <input
                      type="text"
                      value={formImagenPromo}
                      onChange={(e) => setFormImagenPromo(e.target.value)}
                      placeholder="~\images\P"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono text-[11px]"
                    />
                  </div>

                  {/* Activo Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formActivo}
                        onChange={(e) => setFormActivo(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">Sucursal Activa en el Sistema</span>
                    </label>
                    <p className="text-[11px] text-slate-500 ml-6">
                      Si se desmarca, la sucursal quedará inactiva para nuevas operaciones.
                    </p>
                  </div>
                </div>

                {/* --- COLUMNA DERECHA --- */}
                <div className="space-y-3">
                  {/* Nombre Completo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nombre Completo: <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formNombreCompleto}
                      onChange={(e) => setFormNombreCompleto(e.target.value)}
                      placeholder="Ej. Chihuahua Centro"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
                    />
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ciudad: <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCiudad}
                      onChange={(e) => setFormCiudad(e.target.value)}
                      placeholder="Ej. CHIHUAHUA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium uppercase"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={formTelefono}
                      onChange={(e) => setFormTelefono(e.target.value)}
                      placeholder="Ej. 614 412 8900"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                  </div>

                  {/* Longitud */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Longitud Geográfica:</label>
                    <input
                      type="text"
                      value={formLongitud}
                      onChange={(e) => setFormLongitud(e.target.value)}
                      placeholder="Ej. -106.0889"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                  </div>

                  {/* Dist ID Max */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Dist ID Max (Rango Final DVs):
                    </label>
                    <input
                      type="number"
                      value={formDistIdMax}
                      onChange={(e) => setFormDistIdMax(Number(e.target.value))}
                      placeholder="3000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono font-bold text-blue-700"
                    />
                  </div>

                  {/* Importe Máx Canje */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Importe Máx Canje ($ MXN):
                    </label>
                    <input
                      type="number"
                      value={formImporteMaxCanje}
                      onChange={(e) => setFormImporteMaxCanje(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                  </div>

                  {/* Tabulador Tipo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tabulador Tipo:</label>
                    <input
                      type="number"
                      value={formTabuladorTipo}
                      onChange={(e) => setFormTabuladorTipo(Number(e.target.value))}
                      placeholder="1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                  </div>

                  {/* Gestor Sucursal */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gestor Sucursal:</label>
                    <input
                      type="text"
                      value={formGestorSucursal}
                      onChange={(e) => setFormGestorSucursal(e.target.value)}
                      placeholder="Carlos Vazquez Gomez"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
                    />
                  </div>

                  {/* Abogado Coordinador */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Abogado Coordinador:</label>
                    <input
                      type="text"
                      value={formAbogadoCoordinador}
                      onChange={(e) => setFormAbogadoCoordinador(e.target.value)}
                      placeholder="Jorge Valenzuela"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
                    />
                  </div>

                  {/* Req Carta Prestanombres */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formReqCarta}
                        onChange={(e) => setFormReqCarta(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">Req. Carta Prestanombres</span>
                    </label>
                    <p className="text-[11px] text-slate-500 ml-6">
                      Exigir validación de carta prestanombres en mesa de control.
                    </p>
                  </div>

                  {/* No puede colocar */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formNoPuedeColocar}
                        onChange={(e) => setFormNoPuedeColocar(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                      />
                      <span className={`font-bold ${formNoPuedeColocar ? 'text-rose-600' : 'text-slate-800'}`}>
                        Bloquear Colocación de Vales
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 ml-6">
                      Si se marca, los distribuidores de esta sucursal no podrán colocar créditos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones del Modal */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold transition shadow-sm cursor-pointer"
                >
                  {editingId ? 'Actualizar Cambios' : 'Guardar Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL DE CONFIRMACIÓN PARA ELIMINAR                   */}
      {/* ======================================================== */}
      {sucursalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  ¿Eliminar sucursal {sucursalToDelete.nombre}?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Esta acción eliminará la plaza de la configuración del sistema. Los distribuidores y coordinadores asignados deberán ser reasignados.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSucursalToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
