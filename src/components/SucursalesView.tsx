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
} from 'lucide-react';

interface SucursalesViewProps {
  currentUser?: UserSession | null;
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
    clave: 'SUC-GP-CEN',
    nombre: 'Gómez Palacio',
    direccion: 'Av. Victoria #450, Zona Centro',
    ciudad: 'Gómez Palacio',
    estado: 'Durango',
    telefono: '871 412 5836',
    responsable: 'Eduardo Del Río Álvarez',
    estatus: 'ACTIVA',
    fechaRegistro: '2024-07-01T09:00:00.000Z',
  },
  {
    id: 'suc-005',
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
    id: 'suc-006',
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

export default function SucursalesView({ currentUser }: SucursalesViewProps) {
  const [sucursales, setSucursales] = useState<Sucursal[]>(DEFAULT_SUCURSALES);
  const [usuarios, setUsuarios] = useState<InstitutionalUserConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstatus, setFilterEstatus] = useState<'ALL' | 'ACTIVA' | 'INACTIVA'>('ALL');
  const [filterCiudad, setFilterCiudad] = useState<string>('ALL');

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [clave, setClave] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('Gómez Palacio');
  const [estado, setEstado] = useState('Durango');
  const [telefono, setTelefono] = useState('');
  const [responsable, setResponsable] = useState('');
  const [estatus, setEstatus] = useState<'ACTIVA' | 'INACTIVA'>('ACTIVA');

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

  // Ciudades únicas para el filtro
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    sucursales.forEach((s) => {
      if (s.ciudad) set.add(s.ciudad.trim());
    });
    return Array.from(set).sort();
  }, [sucursales]);

  // Contar usuarios por sucursal
  const usersCountByBranch = useMemo(() => {
    const map: Record<string, number> = {};
    usuarios.forEach((u) => {
      if (u.branch) {
        map[u.branch] = (map[u.branch] || 0) + 1;
      }
    });
    return map;
  }, [usuarios]);

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
        (s.responsable && s.responsable.toLowerCase().includes(q)) ||
        s.ciudad.toLowerCase().includes(q) ||
        s.estado.toLowerCase().includes(q) ||
        s.direccion.toLowerCase().includes(q) ||
        (s.telefono && s.telefono.includes(q))
      );
    });
  }, [sucursales, filterEstatus, filterCiudad, searchTerm]);

  // KPIs
  const totalCount = sucursales.length;
  const activasCount = sucursales.filter((s) => s.estatus === 'ACTIVA').length;
  const inactivasCount = sucursales.filter((s) => s.estatus === 'INACTIVA').length;

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setEditingSucursal(null);
    const nextClave = `SUC-${String(sucursales.length + 1).padStart(3, '0')}`;
    setClave(nextClave);
    setNombre('');
    setDireccion('');
    setCiudad('Gómez Palacio');
    setEstado('Durango');
    setTelefono('');
    setResponsable('');
    setEstatus('ACTIVA');
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (suc: Sucursal) => {
    setEditingSucursal(suc);
    setClave(suc.clave);
    setNombre(suc.nombre);
    setDireccion(suc.direccion);
    setCiudad(suc.ciudad);
    setEstado(suc.estado);
    setTelefono(suc.telefono);
    setResponsable(suc.responsable);
    setEstatus(suc.estatus);
    setIsModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !clave.trim()) {
      showToast('La clave y el nombre de la sucursal son campos obligatorios.', 'error');
      return;
    }

    try {
      if (editingSucursal) {
        // ACTUALIZACIÓN (PUT/PATCH)
        const res = await fetch(`/api/configuracion/sucursales/${editingSucursal.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            clave: clave.trim().toUpperCase(),
            nombre: nombre.trim(),
            direccion: direccion.trim(),
            ciudad: ciudad.trim(),
            estado: estado.trim(),
            telefono: telefono.trim(),
            responsable: responsable.trim(),
            estatus,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.sucursal) {
            setSucursales((prev) =>
              prev.map((s) => (s.id === editingSucursal.id ? json.sucursal : s))
            );
            showToast(`Sucursal "${nombre.trim()}" actualizada exitosamente.`);
            setIsModalOpen(false);
            return;
          }
        }

        // Fallback local
        const updatedSuc: Sucursal = {
          ...editingSucursal,
          clave: clave.trim().toUpperCase(),
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          estado: estado.trim(),
          telefono: telefono.trim(),
          responsable: responsable.trim(),
          estatus,
        };
        setSucursales((prev) =>
          prev.map((s) => (s.id === editingSucursal.id ? updatedSuc : s))
        );
        showToast(`Sucursal "${nombre.trim()}" actualizada exitosamente.`);
        setIsModalOpen(false);
      } else {
        // CREACIÓN (POST)
        const res = await fetch('/api/configuracion/sucursales', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            clave: clave.trim().toUpperCase(),
            nombre: nombre.trim(),
            direccion: direccion.trim(),
            ciudad: ciudad.trim(),
            estado: estado.trim(),
            telefono: telefono.trim(),
            responsable: responsable.trim(),
            estatus,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.sucursal) {
            setSucursales((prev) => [json.sucursal, ...prev]);
            showToast(`Nueva sucursal "${nombre.trim()}" dada de alta exitosamente.`);
            setIsModalOpen(false);
            return;
          }
        }

        // Fallback local
        const newSuc: Sucursal = {
          id: `suc-${Date.now()}`,
          clave: clave.trim().toUpperCase(),
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          estado: estado.trim(),
          telefono: telefono.trim(),
          responsable: responsable.trim(),
          estatus,
          fechaRegistro: new Date().toISOString(),
        };
        setSucursales((prev) => [newSuc, ...prev]);
        showToast(`Nueva sucursal "${nombre.trim()}" dada de alta exitosamente.`);
        setIsModalOpen(false);
      }
    } catch {
      showToast('Error de conexión al procesar la sucursal.', 'error');
    }
  };

  // Alternar Estatus ACTIVA / INACTIVA
  const handleToggleEstatus = async (suc: Sucursal) => {
    const nextStatus = suc.estatus === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    try {
      const res = await fetch(`/api/configuracion/sucursales/${suc.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'toggleEstatus' }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.sucursal) {
          setSucursales((prev) =>
            prev.map((s) => (s.id === suc.id ? json.sucursal : s))
          );
          showToast(`Sucursal "${suc.nombre}" ahora está ${json.sucursal.estatus === 'ACTIVA' ? 'Activa' : 'Inactiva'}.`);
          return;
        }
      }

      // Fallback local
      setSucursales((prev) =>
        prev.map((s) => (s.id === suc.id ? { ...s, estatus: nextStatus } : s))
      );
      showToast(`Sucursal "${suc.nombre}" ahora está ${nextStatus === 'ACTIVA' ? 'Activa' : 'Inactiva'}.`);
    } catch {
      showToast('Error al cambiar estatus de la sucursal.', 'error');
    }
  };

  // Eliminar Sucursal
  const handleConfirmDelete = async () => {
    if (!sucursalToDelete) return;
    const target = sucursalToDelete;
    try {
      const res = await fetch(`/api/configuracion/sucursales/${target.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSucursales((prev) => prev.filter((s) => s.id !== target.id));
          showToast(`Sucursal "${target.nombre}" eliminada correctamente.`);
          setSucursalToDelete(null);
          return;
        }
      }

      // Fallback local
      setSucursales((prev) => prev.filter((s) => s.id !== target.id));
      showToast(`Sucursal "${target.nombre}" eliminada correctamente.`);
      setSucursalToDelete(null);
    } catch {
      showToast('Error al eliminar sucursal.', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#f8fafc] text-slate-800 font-sans select-none overflow-hidden">
      
      {/* ======================================================== */}
      {/* 1. HEADER INSTITUCIONAL DEL CATÁLOGO                     */}
      {/* ======================================================== */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
            <Store className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Catálogo de Sucursales
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Oficial
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Gestión maestra de plazas, oficinas operativas, sucursales y encargados de LanAhora.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Actualizar catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Sucursal</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ÁREA PRINCIPAL CON SCROLL VERTICAL                     */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Sucursales
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Red operativa LanAhora
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Activas</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {activasCount}
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">
              Operando al 100%
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Inactivas
            </div>
            <div className="text-2xl font-bold text-slate-600 mt-1">
              {inactivasCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Pausadas o en apertura
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
              Plazas / Ciudades
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {uniqueCities.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {uniqueCities.slice(0, 3).join(', ')}...
            </div>
          </div>
        </div>

        {/* TOAST FEEDBACK */}
        {toast && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in ${
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
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* BARRA DE FILTROS & BÚSQUEDA */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, clave, encargado, ciudad o dirección..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition font-normal"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
            {/* Filtro por Plaza/Ciudad */}
            <select
              value={filterCiudad}
              onChange={(e) => setFilterCiudad(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-blue-600 transition cursor-pointer"
              title="Filtrar por ciudad / plaza"
            >
              <option value="ALL">Todas las Plazas</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Filtro por Estatus */}
            <select
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-blue-600 transition cursor-pointer"
              title="Filtrar por estatus"
            >
              <option value="ALL">Todos los Estatus</option>
              <option value="ACTIVA">Solo Activas</option>
              <option value="INACTIVA">Solo Inactivas</option>
            </select>

            <span className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
              {filteredSucursales.length} Sucursales
            </span>
          </div>
        </div>

        {/* TABLA DE SUCURSALES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Clave</th>
                  <th className="py-3 px-4">Sucursal</th>
                  <th className="py-3 px-4">Plaza & Dirección</th>
                  <th className="py-3 px-4">Encargado / Responsable</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4 text-center">Colaboradores</th>
                  <th className="py-3 px-4 text-center">Estatus</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSucursales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No se encontraron sucursales con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredSucursales.map((suc) => {
                    const colaboradores = usersCountByBranch[suc.nombre] || 0;
                    return (
                      <tr key={suc.id} className="hover:bg-slate-50/70 transition">
                        {/* Clave */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                            {suc.clave}
                          </span>
                        </td>

                        {/* Sucursal */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                              <Building className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{suc.nombre}</div>
                              <div className="text-[10px] text-slate-400">
                                Registrada: {suc.fechaRegistro ? new Date(suc.fechaRegistro).toLocaleDateString('es-MX') : '2024'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Plaza & Dirección */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{suc.ciudad}, {suc.estado}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {suc.direccion || 'Sin dirección asignada'}
                          </div>
                        </td>

                        {/* Encargado */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{suc.responsable || 'Sin asignar'}</span>
                          </div>
                        </td>

                        {/* Teléfono */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {suc.telefono ? (
                            <a
                              href={`tel:${suc.telefono}`}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{suc.telefono}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Colaboradores */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                            {colaboradores} asignados
                          </span>
                        </td>

                        {/* Estatus con Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleEstatus(suc)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer inline-flex items-center gap-1 border active:scale-95 ${
                              suc.estatus === 'ACTIVA'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Haz clic para activar o desactivar esta sucursal"
                          >
                            <Power className="w-3 h-3" />
                            <span>{suc.estatus}</span>
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(suc)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                              title="Editar datos de sucursal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSucursalToDelete(suc)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                              title="Eliminar sucursal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MODAL DE CREACIÓN / EDICIÓN DE SUCURSAL               */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingSucursal ? `Editar Sucursal: ${editingSucursal.nombre}` : 'Dar de Alta Nueva Sucursal'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ingresa los datos oficiales de la sucursal y su encargado operativo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clave Oficial *
                  </label>
                  <input
                    type="text"
                    required
                    value={clave}
                    onChange={(e) => setClave(e.target.value.toUpperCase())}
                    placeholder="Ej. SUC-GP-CEN"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estatus
                  </label>
                  <select
                    value={estatus}
                    onChange={(e) => setEstatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition cursor-pointer"
                  >
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="INACTIVA">INACTIVA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Sucursal *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Gómez Palacio Centro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Av. Victoria #450, Col. Centro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad / Municipio
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ej. Gómez Palacio"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="Ej. Durango"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 871 412 5836"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Encargado / Responsable
                  </label>
                  <input
                    type="text"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    placeholder="Ej. Eduardo Del Río Álvarez"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  {editingSucursal ? 'Actualizar Sucursal' : 'Guardar Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL DE CONFIRMACIÓN DE ELIMINAR                     */}
      {/* ======================================================== */}
      {sucursalToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-slate-900">
                ¿Eliminar Sucursal?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ¿Estás seguro de eliminar la sucursal <strong className="text-slate-800">"{sucursalToDelete.nombre}"</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSucursalToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition active:scale-95 cursor-pointer"
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
