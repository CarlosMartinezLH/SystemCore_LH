'use client';

import React, { useState, useMemo } from 'react';
import { CoordinadorCore, DistribuidorCore, AccesoCoordinador, FuncionUsuario, UsuarioSistema } from '@/types/core';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  INITIAL_COORDINADORES,
  INITIAL_ACCESOS_COORDINADOR,
  INITIAL_FUNCIONES_USUARIO,
  INITIAL_USUARIOS_SISTEMA,
} from '@/lib/data/coreData';
import {
  Search,
  FileSpreadsheet,
  UserCheck,
  Users,
  Plus,
  ArrowRightLeft,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  ExternalLink,
  KeyRound,
  ShieldAlert,
  Trash2,
  Link2,
  AlertTriangle,
  Layers,
  Bot,
  Building2,
  SlidersHorizontal,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

interface CoordinadoresViewProps {
  currentUser?: UserSession | null;
  onNavigateToDistribuidores?: (coordinadorNombre?: string) => void;
}

export default function CoordinadoresView({
  currentUser,
  onNavigateToDistribuidores,
}: CoordinadoresViewProps) {
  const { distribuidores, updateDistribuidor } = useCoreSync();

  // Sub-tabs principales heredadas del sistema legado
  const [activeTab, setActiveTab] = useState<'coordinadores' | 'accesos' | 'funciones'>('coordinadores');

  // Estados principales de datos
  const [coordinadores, setCoordinadores] = useState<CoordinadorCore[]>(INITIAL_COORDINADORES);
  const [accesos, setAccesos] = useState<AccesoCoordinador[]>(INITIAL_ACCESOS_COORDINADOR);
  const [funciones, setFunciones] = useState<FuncionUsuario[]>(INITIAL_FUNCIONES_USUARIO);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Filtros Tab Coordinadores
  const [searchTerm, setSearchTerm] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('ALL');
  const [tipoFilter, setTipoFilter] = useState<'ALL' | 'NORMAL' | 'GESTOR'>('ALL');
  const [estatusFilter, setEstatusFilter] = useState('ALL');
  const [zonaFilter, setZonaFilter] = useState('ALL');

  // Filtros Tab Accesos
  const [accesoSearch, setAccesoSearch] = useState('');
  const [usuariosSistema] = useState<UsuarioSistema[]>(INITIAL_USUARIOS_SISTEMA);
  const [inlineCoordId, setInlineCoordId] = useState(INITIAL_COORDINADORES[0]?.id || '');
  const [inlineUsuarioId, setInlineUsuarioId] = useState(INITIAL_USUARIOS_SISTEMA[0]?.id || '');

  // Filtros Tab Funciones
  const [funcionUserFilter, setFuncionUserFilter] = useState('ALL');
  const [funcionSearch, setFuncionSearch] = useState('');

  // Modales
  const [selectedCoordForDvs, setSelectedCoordForDvs] = useState<CoordinadorCore | null>(null);
  const [selectedCoordForEdit, setSelectedCoordForEdit] = useState<CoordinadorCore | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReasignarModalOpen, setIsReasignarModalOpen] = useState(false);
  const [isNewAccesoModalOpen, setIsNewAccesoModalOpen] = useState(false);

  // Enriquecer datos de coordinadores con distribuidoras reales
  const enrichedCoordinadores = useMemo(() => {
    return coordinadores.map((coord) => {
      const coordNameClean = coord.nombre.trim().toUpperCase();
      const dvs = distribuidores.filter(
        (d) => (d.coordinador || '').trim().toUpperCase() === coordNameClean
      );
      const totalDvs = dvs.length;
      const carteraActiva = dvs.reduce((acc, d) => acc + (d.saldoActual || 0), 0);
      const rec =
        coord.cobroEstimadoQuincena > 0
          ? Math.min(100, Math.round((coord.cobroRealizadoQuincena / coord.cobroEstimadoQuincena) * 1000) / 10)
          : 0;

      return {
        ...coord,
        totalDistribuidores: totalDvs > 0 ? totalDvs : coord.totalDistribuidores || 0,
        carteraActiva: carteraActiva > 0 ? carteraActiva : coord.carteraActiva || 0,
        porcentajeRecuperacion: rec > 0 ? rec : coord.porcentajeRecuperacion || 0,
      };
    });
  }, [coordinadores, distribuidores]);

  // Filtrado de la tabla de coordinadores
  const filtered = useMemo(() => {
    return enrichedCoordinadores.filter((c) => {
      // Alcance por sucursal de usuario
      if (currentUser && currentUser.branchScope === 'BRANCH') {
        const uB = currentUser.branch.toUpperCase();
        const cB = (c.sucursal || '').toUpperCase();
        if (!cB.includes(uB) && !uB.includes(cB)) return false;
      }

      if (sucursalFilter !== 'ALL' && c.sucursal !== sucursalFilter) return false;
      if (tipoFilter !== 'ALL' && c.tipoCoordinador !== tipoFilter) return false;
      if (estatusFilter !== 'ALL' && c.estatus !== estatusFilter) return false;
      if (zonaFilter !== 'ALL' && c.zona !== zonaFilter) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.coordinadorIdNum && String(c.coordinadorIdNum).includes(q)) ||
        (c.moonflowId && c.moonflowId.toLowerCase().includes(q)) ||
        c.sucursal.toLowerCase().includes(q) ||
        c.zona.toLowerCase().includes(q) ||
        (c.telefono && c.telefono.includes(q)) ||
        (c.usuarioAsignado && c.usuarioAsignado.toLowerCase().includes(q))
      );
    });
  }, [enrichedCoordinadores, sucursalFilter, tipoFilter, estatusFilter, zonaFilter, searchTerm, currentUser]);

  // Métricas macro
  const metrics = useMemo(() => {
    const totalCoords = enrichedCoordinadores.filter((c) => c.estatus === 'ACTIVO').length;
    const normales = enrichedCoordinadores.filter((c) => (c.tipoCoordinador || 'NORMAL') === 'NORMAL').length;
    const gestores = enrichedCoordinadores.filter((c) => c.tipoCoordinador === 'GESTOR').length;
    const totalDvs = enrichedCoordinadores.reduce((acc, c) => acc + (c.totalDistribuidores || 0), 0);
    const carteraTotal = enrichedCoordinadores.reduce((acc, c) => acc + (c.carteraActiva || 0), 0);
    const cobroEstimadoTotal = enrichedCoordinadores.reduce((acc, c) => acc + c.cobroEstimadoQuincena, 0);
    const cobroRealizadoTotal = enrichedCoordinadores.reduce((acc, c) => acc + c.cobroRealizadoQuincena, 0);
    const recGlobal =
      cobroEstimadoTotal > 0
        ? Math.min(100, Math.round((cobroRealizadoTotal / cobroEstimadoTotal) * 1000) / 10)
        : 0;

    return { totalCoords, normales, gestores, totalDvs, carteraTotal, recGlobal, cobroRealizadoTotal };
  }, [enrichedCoordinadores]);

  // Accesos filtrados
  const filteredAccesos = useMemo(() => {
    return accesos.filter((acc) => {
      if (!accesoSearch.trim()) return true;
      const q = accesoSearch.toLowerCase();
      return (
        acc.coordinadorNombre.toLowerCase().includes(q) ||
        acc.usuarioNombre.toLowerCase().includes(q) ||
        acc.usuarioId.toLowerCase().includes(q) ||
        acc.coordinadorId.toLowerCase().includes(q)
      );
    });
  }, [accesos, accesoSearch]);

  // Funciones filtradas
  const filteredFunciones = useMemo(() => {
    return funciones.filter((fun) => {
      if (funcionUserFilter !== 'ALL' && fun.usuarioId !== funcionUserFilter) return false;
      if (!funcionSearch.trim()) return true;
      const q = funcionSearch.toLowerCase();
      return (
        fun.funcionNombre.toLowerCase().includes(q) ||
        fun.funcionId.toLowerCase().includes(q) ||
        fun.usuarioNombre.toLowerCase().includes(q) ||
        (fun.descripcion && fun.descripcion.toLowerCase().includes(q))
      );
    });
  }, [funciones, funcionUserFilter, funcionSearch]);

  // Lista única de usuarios para filtro de funciones
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, string>();
    funciones.forEach((f) => {
      map.set(f.usuarioId, f.usuarioNombre);
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [funciones]);

  // Toggle permiso de función
  const handleTogglePermiso = (id: string) => {
    setFunciones((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, permiso: !f.permiso };
          showToast(
            `Permiso "${f.funcionNombre}" ${updated.permiso ? 'ACTIVADO' : 'DESACTIVADO'} para ${f.usuarioNombre}.`,
            updated.permiso ? 'success' : 'error'
          );
          return updated;
        }
        return f;
      })
    );
  };

  // Desvincular Acceso
  const handleRemoveAcceso = (id: string) => {
    const acc = accesos.find((a) => a.id === id);
    if (!acc) return;
    if (confirm(`¿Desvincular el acceso de "${acc.usuarioNombre}" con el coordinador "${acc.coordinadorNombre}"?`)) {
      setAccesos((prev) => prev.filter((a) => a.id !== id));
      showToast(`Acceso desvinculado exitosamente.`);
    }
  };

  // Asignar / Actualizar Acceso desde el formulario superior (Estilo Sistema Legado)
  const handleInlineAsignar = () => {
    const coord = coordinadores.find((c) => c.id === inlineCoordId);
    const user = usuariosSistema.find((u) => u.id === inlineUsuarioId);
    if (!coord || !user) return;

    const existing = accesos.find((a) => a.coordinadorId === coord.id);
    if (existing) {
      setAccesos((prev) =>
        prev.map((a) =>
          a.id === existing.id
            ? { ...a, usuarioId: user.id, usuarioNombre: user.nombre, fechaAsignacion: new Date().toLocaleDateString('es-MX') }
            : a
        )
      );
      showToast(`Acceso actualizado: "${coord.nombre}" vinculado a "${user.nombre}".`);
    } else {
      const newAcc: AccesoCoordinador = {
        id: `acc-${Date.now().toString().slice(-4)}`,
        coordinadorId: coord.id,
        coordinadorNombre: coord.nombre,
        usuarioId: user.id,
        usuarioNombre: user.nombre,
        fechaAsignacion: new Date().toLocaleDateString('es-MX'),
      };
      setAccesos((prev) => [newAcc, ...prev]);
      showToast(`Nuevo acceso vinculado: "${coord.nombre}" asignado a "${user.nombre}".`);
    }
  };

  const handleCancelInline = () => {
    setInlineCoordId(coordinadores[0]?.id || '');
    setInlineUsuarioId(usuariosSistema[0]?.id || '');
    showToast('Formulario de asignación cancelado.', 'error');
  };

  // Exportar a Excel
  const handleExportXLS = () => {
    const exportData = filtered.map((c) => ({
      ID_Num: c.coordinadorIdNum || '-',
      Clave: c.id,
      Nombre: c.nombre,
      Tipo: c.tipoCoordinador || 'NORMAL',
      Sucursal: c.sucursal,
      Moonflow_ID: c.moonflowId || '-',
      Usuario_Asignado: c.usuarioAsignado || '-',
      Zona: c.zona,
      Subzona: c.subzona || '-',
      'DVs Asignadas': c.totalDistribuidores || 0,
      'Cartera Activa ($)': c.carteraActiva || 0,
      'Cobro Estimado ($)': c.cobroEstimadoQuincena,
      'Cobro Realizado ($)': c.cobroRealizadoQuincena,
      '% Recuperación': `${c.porcentajeRecuperacion}%`,
      Teléfono: c.telefono,
      Email: c.email || '',
      Estatus: c.estatus,
      'Fecha Ingreso': c.fechaIngreso,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Coordinadores');
    XLSX.writeFile(workbook, `catalogo_coordinadores_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Catálogo exportado a Excel exitosamente.');
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      
      {/* ======================================================== */}
      {/* 1. ENCABEZADO Y SELECTOR DE PESTAÑAS (SISTEMA ANTERIOR)    */}
      {/* ======================================================== */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Catálogo de Coordinadores y Control de Accesos</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {enrichedCoordinadores.length} Registros
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Gestión operativa de supervisores de campo, gestores de cobranza y matriz de facultades del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* SUB-TABS INTERACTIVAS */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('coordinadores')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'coordinadores'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Coordinadores</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono">
              {enrichedCoordinadores.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accesos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'accesos'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Accesos x Coordinador</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-mono">
              {accesos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('funciones')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'funciones'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Funciones x Usuario</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">
              17
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
      {/* VISTA 1: COORDINADORES (TAB PRINCIPAL)                   */}
      {/* ======================================================== */}
      {activeTab === 'coordinadores' && (
        <>
          {/* 1. Tarjetas de Resumen Macro */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Coordinadores Activos
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {metrics.totalCoords}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    ({metrics.normales} Norm / {metrics.gestores} Gest)
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/80">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Distribuidoras Asignadas
                </span>
                <span className="text-xl font-black text-blue-600 font-mono">
                  {metrics.totalDvs.toLocaleString('es-MX')} DVs
                </span>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/80">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Cartera Total Supervisada
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {formatMoney(metrics.carteraTotal)}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Recuperación Promedio
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  {metrics.recGlobal}%
                </span>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/80">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. Barra de Control y Filtros */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, ID (#2), Moonflow, sucursal o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium text-slate-900"
              />
            </div>

            {/* Filtros Dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sucursalFilter}
                onChange={(e) => setSucursalFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
              >
                <option value="ALL">Todas las Sucursales</option>
                <option value="SALTILLO">Saltillo</option>
                <option value="GOMEZ PALACIO">Gómez Palacio</option>
                <option value="DURANGO">Durango</option>
                <option value="TORREON">Torreón</option>
                <option value="MONCLOVA">Monclova</option>
              </select>

              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
              >
                <option value="ALL">Todos los Tipos</option>
                <option value="NORMAL">NORMAL (Campo)</option>
                <option value="GESTOR">GESTOR (Cobranza)</option>
              </select>

              <select
                value={estatusFilter}
                onChange={(e) => setEstatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
              >
                <option value="ALL">Todos los Estatus</option>
                <option value="ACTIVO">Activos</option>
                <option value="INACTIVO">Inactivos</option>
              </select>

              {/* Botón Reasignar Cartera */}
              <button
                onClick={() => setIsReasignarModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Reasignar Cartera</span>
              </button>

              {/* Botón Exportar XLS */}
              <button
                onClick={handleExportXLS}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exportar XLS</span>
              </button>

              {/* Botón Nuevo Coordinador */}
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Coordinador</span>
              </button>
            </div>
          </div>

          {/* 3. Tabla Principal de Coordinadores */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="p-3 text-center">Acción</th>
                    <th className="p-3 text-center"># ID</th>
                    <th className="p-3">Coordinador</th>
                    <th className="p-3 text-center">Tipo</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3 text-center">Moonflow ID</th>
                    <th className="p-3">Teléfono Móvil</th>
                    <th className="p-3 text-center">DVs Asignadas</th>
                    <th className="p-3 text-right">Cartera Asignada</th>
                    <th className="p-3 text-right">Cobro Quincenal</th>
                    <th className="p-3 text-center">% Recuperación</th>
                    <th className="p-3 text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const rec = c.porcentajeRecuperacion || 0;
                    const recColor =
                      rec >= 95 ? 'text-emerald-700' : rec >= 85 ? 'text-blue-700' : 'text-amber-700';
                    const recBarColor =
                      rec >= 95 ? 'bg-emerald-500' : rec >= 85 ? 'bg-blue-500' : 'bg-amber-500';

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        {/* Botón Editar estilo sistema legado */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedCoordForEdit(c)}
                            className="px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                            title="Editar coordinador"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </td>

                        {/* ID Numérico del sistema legado */}
                        <td className="p-3 text-center">
                          <span className="font-mono font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 text-xs">
                            {c.coordinadorIdNum ? `#${c.coordinadorIdNum}` : c.id}
                          </span>
                        </td>

                        {/* Nombre del Coordinador + Usuario Asignado */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.nombre}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
                            {c.usuarioAsignado ? (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Link2 className="w-3 h-3 text-indigo-500" />
                                {c.usuarioAsignado}
                              </span>
                            ) : (
                              <span>{c.email || 'Sin usuario asignado'}</span>
                            )}
                          </div>
                        </td>

                        {/* Tipo Coordinador: NORMAL vs GESTOR */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${
                              c.tipoCoordinador === 'GESTOR'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {c.tipoCoordinador || 'NORMAL'}
                          </span>
                        </td>

                        {/* Sucursal */}
                        <td className="p-3 font-semibold text-slate-700">{c.sucursal}</td>

                        {/* Moonflow ID */}
                        <td className="p-3 text-center">
                          {c.moonflowId ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              <Bot className="w-3 h-3 text-blue-500" />
                              {c.moonflowId}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Sin ID</span>
                          )}
                        </td>

                        {/* Teléfono Móvil con enlace */}
                        <td className="p-3">
                          {c.telefono ? (
                            <div className="flex items-center gap-1.5 font-mono text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a
                                href={`tel:${c.telefono.replace(/\s+/g, '')}`}
                                className="hover:text-blue-600 transition"
                              >
                                {c.telefono}
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* DVs Asignadas */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedCoordForDvs(c)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono font-bold text-xs border border-blue-200 transition cursor-pointer"
                            title="Ver Distribuidoras asignadas"
                          >
                            {c.totalDistribuidores || 0} DVs
                          </button>
                        </td>

                        {/* Cartera Asignada con formato $000,000,000.00 */}
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {formatMoney(c.carteraActiva || 0)}
                        </td>

                        {/* Cobro Quincenal */}
                        <td className="p-3 text-right font-mono text-slate-700">
                          <span className="font-bold">{formatMoney(c.cobroRealizadoQuincena)}</span>
                          <span className="text-[10px] text-slate-400 block">
                            de {formatMoney(c.cobroEstimadoQuincena)}
                          </span>
                        </td>

                        {/* % Recuperación */}
                        <td className="p-3 text-center">
                          <div className="inline-flex flex-col items-center gap-1 min-w-[70px]">
                            <span className={`text-[11px] font-mono font-extrabold ${recColor}`}>
                              {rec}%
                            </span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${recBarColor} rounded-full transition-all`}
                                style={{ width: `${Math.min(100, rec)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Estatus */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.estatus === 'ACTIVO'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                            }`}
                          >
                            {c.estatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Info */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>
                Mostrando <strong>{filtered.length}</strong> de {enrichedCoordinadores.length} coordinadores registrados
              </span>
              <span className="font-mono text-[11px]">Sistema LanAhora · Módulo Catálogos</span>
            </div>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: ACCESOS X COORDINADOR (SISTEMA ANTERIOR)        */}
      {/* ======================================================== */}
      {activeTab === 'accesos' && (
        <div className="space-y-4">
          {/* Banner explicativo */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 text-xs text-indigo-900 flex items-start gap-3">
            <Link2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Mapeo de Accesos Operativos (Accesos x Coordinador):</span>
              <p className="text-indigo-700 mt-0.5">
                Vincula las credenciales de los usuarios del sistema (login) con cada coordinador o gestor de cartera.
                Esto controla el filtrado de distribuidoras, captura de cobranza en campo y permisos de la aplicación LanApp.
              </p>
            </div>
          </div>

          {/* Formulario Superior Estilo Sistema Anterior */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Asignación de Acceso a Coordinador</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setInlineCoordId(coordinadores[0]?.id || '');
                  setInlineUsuarioId(usuariosSistema[0]?.id || '');
                  showToast('Formulario listo para nuevo registro.');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                + Nuevo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Coordinador ID:
                </label>
                <select
                  value={inlineCoordId}
                  onChange={(e) => setInlineCoordId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  {coordinadores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.sucursal} · #{c.coordinadorIdNum || c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-5">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Usuario ID:
                </label>
                <select
                  value={inlineUsuarioId}
                  onChange={(e) => setInlineUsuarioId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  {usuariosSistema.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInlineAsignar}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={handleCancelInline}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          {/* Buscador Estilo Sistema Anterior */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Introduzca el texto a buscar..."
                value={accesoSearch}
                onChange={(e) => setAccesoSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium text-slate-900"
              />
            </div>

            <button
              onClick={() => setIsNewAccesoModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vincular Nuevo Acceso (Modal)</span>
            </button>
          </div>

          {/* Tabla de Accesos con Columnas Idénticas al Sistema Anterior */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold select-none">
                <tr>
                  <th className="p-3 text-center w-20">Acción</th>
                  <th className="p-3">Coordinador ID</th>
                  <th className="p-3">Usuario ID</th>
                  <th className="p-3 text-center">Fecha Asignación</th>
                  <th className="p-3 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccesos.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                    {/* Enlace Eliminar en azul al estilo del sistema legado */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveAcceso(acc.id)}
                        className="text-blue-600 hover:text-rose-600 hover:underline font-bold text-xs transition cursor-pointer"
                        title="Eliminar este acceso"
                      >
                        Eliminar
                      </button>
                    </td>

                    {/* Coordinador ID */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900 uppercase">{acc.coordinadorNombre}</div>
                      <div className="text-[10px] font-mono text-slate-400">{acc.coordinadorId}</div>
                    </td>

                    {/* Usuario ID */}
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{acc.usuarioNombre}</div>
                      <div className="text-[10px] font-mono text-slate-400">{acc.usuarioId}</div>
                    </td>

                    {/* Fecha de Asignación */}
                    <td className="p-3 text-center font-mono text-slate-500">{acc.fechaAsignacion}</td>

                    {/* Estatus */}
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        CONECTADO
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredAccesos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No se encontraron vinculaciones de acceso con el criterio de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paginación estilo sistema anterior */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium">
              <span>
                Página <strong>1 de 1</strong> ({filteredAccesos.length} elementos)
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
                <span className="ml-1 text-slate-500 font-sans">All</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 3: FUNCIONES X USUARIO (17 PERMISOS LEGADOS)       */}
      {/* ======================================================== */}
      {activeTab === 'funciones' && (
        <div className="space-y-4">
          {/* Banner explicativo */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Matriz de Facultades Operativas (Funciones x Usuario):</span>
              <p className="text-emerald-700 mt-0.5">
                Controles de seguridad y facultades críticas heredadas del sistema anterior. Regulan acciones de
                Mesa de Crédito (aprobación, cancelación, modificación de líneas), Cobranza Legal (reestructuras, demandas) y Cartera.
              </p>
            </div>
          </div>

          {/* Filtros de Funciones */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar función operativa (ej. REESTRUCTURA, LÍNEAS, VALIDAR)..."
                  value={funcionSearch}
                  onChange={(e) => setFuncionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-medium text-slate-900"
                />
              </div>

              <select
                value={funcionUserFilter}
                onChange={(e) => setFuncionUserFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
              >
                <option value="ALL">Todos los Usuarios ({funciones.length} funciones)</option>
                {uniqueUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFunciones((prev) => prev.map((f) => ({ ...f, permiso: true })));
                  showToast('Todas las funciones operativas han sido habilitadas.');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Activar Todas</span>
              </button>

              <button
                onClick={() => {
                  setFunciones((prev) => prev.map((f) => ({ ...f, permiso: false })));
                  showToast('Todas las funciones operativas han sido pausadas.', 'error');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Bloquear Todas</span>
              </button>
            </div>
          </div>

          {/* Tabla de 17 Funciones */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold select-none">
                <tr>
                  <th className="p-3 text-center">Permiso</th>
                  <th className="p-3">Código Función</th>
                  <th className="p-3">Nombre de la Función Operativa</th>
                  <th className="p-3">Usuario Asignado</th>
                  <th className="p-3">Descripción de Facultad</th>
                  <th className="p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFunciones.map((fun) => (
                  <tr
                    key={fun.id}
                    className={`hover:bg-slate-50/80 transition ${
                      fun.permiso ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                    }`}
                  >
                    {/* Toggle interactivo */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleTogglePermiso(fun.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center cursor-pointer ${
                          fun.permiso ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                        title="Clic para cambiar permiso"
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            fun.permiso ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Código Función */}
                    <td className="p-3">
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {fun.funcionId}
                      </span>
                    </td>

                    {/* Nombre */}
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{fun.funcionNombre}</div>
                    </td>

                    {/* Usuario Asignado */}
                    <td className="p-3">
                      <span className="font-semibold text-slate-700">{fun.usuarioNombre}</span>
                    </td>

                    {/* Descripción */}
                    <td className="p-3 text-slate-500 font-normal">
                      {fun.descripcion || 'Sin descripción'}
                    </td>

                    {/* Estado */}
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          fun.permiso
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {fun.permiso ? 'AUTORIZADO' : 'DENEGADO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL: VER DISTRIBUIDORAS ASIGNADAS                   */}
      {/* ======================================================== */}
      {selectedCoordForDvs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm tracking-tight flex items-center gap-2">
                  <span>Distribuidoras Asignadas · {selectedCoordForDvs.nombre}</span>
                  {selectedCoordForDvs.tipoCoordinador === 'GESTOR' && (
                    <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded">
                      GESTOR
                    </span>
                  )}
                </h3>
                <p className="text-blue-100 text-[11px]">
                  {selectedCoordForDvs.sucursal} · {selectedCoordForDvs.zona} · ID {selectedCoordForDvs.coordinadorIdNum || selectedCoordForDvs.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCoordForDvs(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-blue-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {(() => {
                const coordNameClean = selectedCoordForDvs.nombre.trim().toUpperCase();
                const coordDvs = distribuidores.filter(
                  (d) => (d.coordinador || '').trim().toUpperCase() === coordNameClean
                );

                if (coordDvs.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm">No hay distribuidoras asociadas</p>
                    </div>
                  );
                }

                return (
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold">
                      <tr>
                        <th className="p-2.5">No. Dist</th>
                        <th className="p-2.5">Nombre Distribuidor</th>
                        <th className="p-2.5">Nivel</th>
                        <th className="p-2.5">Estatus</th>
                        <th className="p-2.5 text-right">Línea Crédito</th>
                        <th className="p-2.5 text-right">Saldo Actual</th>
                        <th className="p-2.5 text-right">Disponible</th>
                        <th className="p-2.5 text-center">LanaApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coordDvs.map((d) => (
                        <tr key={d.noDist} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-mono font-bold text-blue-600">#{d.noDist}</td>
                          <td className="p-2.5 font-bold text-slate-900">{d.nombreDistribuidor}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                              {d.nivel}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.estatus === 'ACTIVO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {d.estatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {formatMoney(d.creditoLimite)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatMoney(d.saldoActual)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">
                            {formatMoney(d.disponible)}
                          </td>
                          <td className="p-2.5 text-center">
                            {d.tieneLanaApp ? (
                              <span className="text-emerald-600 font-bold text-[10px]">ACTIVA</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">NO</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedCoordForDvs(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: EDITAR COORDINADOR (CAMPOS SISTEMA LEGADO)     */}
      {/* ======================================================== */}
      {selectedCoordForEdit && (
        <EditarCoordinadorModal
          coord={selectedCoordForEdit}
          onClose={() => setSelectedCoordForEdit(null)}
          onSave={(updated) => {
            setCoordinadores((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setSelectedCoordForEdit(null);
            showToast(`Coordinador "${updated.nombre}" actualizado correctamente.`);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: NUEVO COORDINADOR (CAMPOS SISTEMA LEGADO)      */}
      {/* ======================================================== */}
      {isNewModalOpen && (
        <NuevoCoordinadorModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSave={(newCoord) => {
            setCoordinadores((prev) => [newCoord, ...prev]);
            setIsNewModalOpen(false);
            showToast(`Nuevo coordinador "${newCoord.nombre}" registrado exitosamente.`);
          }}
          nextIdNum={
            coordinadores.reduce((max, c) => Math.max(max, c.coordinadorIdNum || 0), 0) + 1
          }
          nextId={`COORD-${String(coordinadores.length + 1).padStart(2, '0')}`}
        />
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: REASIGNAR CARTERA                              */}
      {/* ======================================================== */}
      {isReasignarModalOpen && (
        <ReasignarCarteraModal
          isOpen={isReasignarModalOpen}
          onClose={() => setIsReasignarModalOpen(false)}
          coordinadores={coordinadores}
          distribuidores={distribuidores}
          onReassign={(noDist, nuevoCoordinador) => {
            const dv = distribuidores.find((d) => d.noDist === noDist);
            if (dv) {
              updateDistribuidor({
                ...dv,
                coordinador: nuevoCoordinador,
              });
              showToast(`Distribuidora #${noDist} reasignada a "${nuevoCoordinador}".`);
            }
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: VINCULAR ACCESO (ACCESOS X COORDINADOR)        */}
      {/* ======================================================== */}
      {isNewAccesoModalOpen && (
        <NuevoAccesoModal
          isOpen={isNewAccesoModalOpen}
          onClose={() => setIsNewAccesoModalOpen(false)}
          coordinadores={coordinadores}
          usuariosSistema={usuariosSistema}
          onSave={(newAcceso) => {
            setAccesos((prev) => [newAcceso, ...prev]);
            setIsNewAccesoModalOpen(false);
            showToast(`Acceso vinculado exitosamente a "${newAcceso.usuarioNombre}".`);
          }}
        />
      )}
    </div>
  );
}

// ====================================================================
// SUB-COMPONENTE: MODAL EDITAR COORDINADOR
// ====================================================================
function EditarCoordinadorModal({
  coord,
  onClose,
  onSave,
}: {
  coord: CoordinadorCore;
  onClose: () => void;
  onSave: (coord: CoordinadorCore) => void;
}) {
  const [nombre, setNombre] = useState(coord.nombre);
  const [sucursal, setSucursal] = useState(coord.sucursal);
  const [tipoCoordinador, setTipoCoordinador] = useState<'NORMAL' | 'GESTOR'>(
    coord.tipoCoordinador === 'GESTOR' ? 'GESTOR' : 'NORMAL'
  );
  const [telefono, setTelefono] = useState(coord.telefono || '');
  const [moonflowId, setMoonflowId] = useState(coord.moonflowId || '');
  const [usuarioAsignado, setUsuarioAsignado] = useState(coord.usuarioAsignado || '');
  const [zona, setZona] = useState(coord.zona || 'ZONA A');
  const [subzona, setSubzona] = useState(coord.subzona || '1');
  const [email, setEmail] = useState(coord.email || '');
  const [estatus, setEstatus] = useState<'ACTIVO' | 'INACTIVO'>(coord.estatus);
  const [metaColocacion, setMetaColocacion] = useState(coord.metaColocacion || 500000);
  const [cobroEstimado, setCobroEstimado] = useState(coord.cobroEstimadoQuincena || 45000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onSave({
      ...coord,
      nombre: nombre.trim().toUpperCase(),
      sucursal,
      tipoCoordinador,
      telefono: telefono.trim(),
      moonflowId: moonflowId.trim().toUpperCase(),
      usuarioAsignado: usuarioAsignado.trim(),
      zona,
      subzona,
      email: email.trim().toLowerCase(),
      estatus,
      metaColocacion: Number(metaColocacion) || 0,
      cobroEstimadoQuincena: Number(cobroEstimado) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header estilo modal sistema legado */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm tracking-tight flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-400" />
              <span>Editar Coordinador #{coord.coordinadorIdNum || coord.id}</span>
            </h3>
            <p className="text-slate-400 text-[11px]">{coord.id} · {coord.sucursal}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Coordinador</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sucursal ID</label>
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
              >
                <option value="SALTILLO">SALTILLO</option>
                <option value="GOMEZ PALACIO">GOMEZ PALACIO</option>
                <option value="DURANGO">DURANGO</option>
                <option value="TORREON">TORREON</option>
                <option value="MONCLOVA">MONCLOVA</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Coordinador Tipo Id</label>
              <select
                value={tipoCoordinador}
                onChange={(e) => setTipoCoordinador(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-bold text-blue-700"
              >
                <option value="NORMAL">NORMAL (Campo)</option>
                <option value="GESTOR">GESTOR (Cobranza)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 8442860493"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Moonflow ID (Cobranza Auto)</label>
              <input
                type="text"
                value={moonflowId}
                onChange={(e) => setMoonflowId(e.target.value)}
                placeholder="MF-844286"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Usuario Asignado (Sistema)</label>
              <input
                type="text"
                value={usuarioAsignado}
                onChange={(e) => setUsuarioAsignado(e.target.value)}
                placeholder="adrian.garcia@lanahora.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estatus</label>
              <select
                value={estatus}
                onChange={(e) => setEstatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Zona Operativa</label>
              <input
                type="text"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Subzona</label>
              <input
                type="text"
                value={subzona}
                onChange={(e) => setSubzona(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cobro Estimado Quincena ($)</label>
              <input
                type="number"
                value={cobroEstimado}
                onChange={(e) => setCobroEstimado(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Meta Colocación ($)</label>
              <input
                type="number"
                value={metaColocacion}
                onChange={(e) => setMetaColocacion(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Botones Actualizar / Cancelar estilo sistema legado */}
          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer"
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====================================================================
// SUB-COMPONENTE: MODAL NUEVO COORDINADOR
// ====================================================================
function NuevoCoordinadorModal({
  isOpen,
  onClose,
  onSave,
  nextId,
  nextIdNum,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coord: CoordinadorCore) => void;
  nextId: string;
  nextIdNum: number;
}) {
  const [nombre, setNombre] = useState('');
  const [sucursal, setSucursal] = useState('SALTILLO');
  const [tipoCoordinador, setTipoCoordinador] = useState<'NORMAL' | 'GESTOR'>('NORMAL');
  const [telefono, setTelefono] = useState('');
  const [moonflowId, setMoonflowId] = useState('');
  const [usuarioAsignado, setUsuarioAsignado] = useState('');
  const [zona, setZona] = useState('ZONA A');
  const [subzona, setSubzona] = useState('1');
  const [email, setEmail] = useState('');
  const [metaColocacion, setMetaColocacion] = useState(500000);
  const [cobroEstimado, setCobroEstimado] = useState(45000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    onSave({
      id: nextId,
      coordinadorIdNum: nextIdNum,
      nombre: nombre.trim().toUpperCase(),
      sucursal,
      tipoCoordinador,
      moonflowId: moonflowId.trim().toUpperCase() || `MF-${nextIdNum}00`,
      usuarioAsignado: usuarioAsignado.trim() || email.trim().toLowerCase(),
      zona,
      subzona,
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      estatus: 'ACTIVO',
      fechaIngreso: new Date().toLocaleDateString('es-MX'),
      cobroEstimadoQuincena: Number(cobroEstimado) || 0,
      cobroRealizadoQuincena: 0,
      metaColocacion: Number(metaColocacion) || 0,
      totalDistribuidores: 0,
      carteraActiva: 0,
      porcentajeRecuperacion: 100,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm tracking-tight">Nuevo Coordinador #{nextIdNum}</h3>
            <p className="text-blue-100 text-[11px] font-mono">{nextId}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. LAURA PATRICIA MORALES"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sucursal ID</label>
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
              >
                <option value="SALTILLO">SALTILLO</option>
                <option value="GOMEZ PALACIO">GOMEZ PALACIO</option>
                <option value="DURANGO">DURANGO</option>
                <option value="TORREON">TORREON</option>
                <option value="MONCLOVA">MONCLOVA</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Coordinador Tipo Id</label>
              <select
                value={tipoCoordinador}
                onChange={(e) => setTipoCoordinador(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-bold text-blue-700"
              >
                <option value="NORMAL">NORMAL (Campo)</option>
                <option value="GESTOR">GESTOR (Cobranza)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 8442860493"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Moonflow ID</label>
              <input
                type="text"
                value={moonflowId}
                onChange={(e) => setMoonflowId(e.target.value)}
                placeholder="MF-844001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Zona</label>
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
              >
                <option value="ZONA A">Zona A</option>
                <option value="ZONA B">Zona B</option>
                <option value="ZONA C">Zona C</option>
                <option value="ZONA NORTE">Zona Norte</option>
                <option value="ZONA SUR">Zona Sur</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subzona</label>
              <input
                type="text"
                value={subzona}
                onChange={(e) => setSubzona(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Correo Electrónico / Usuario</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setUsuarioAsignado(e.target.value);
              }}
              placeholder="coordinador@lanahora.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Meta Colocación ($)</label>
              <input
                type="number"
                value={metaColocacion}
                onChange={(e) => setMetaColocacion(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cobro Estimado ($)</label>
              <input
                type="number"
                value={cobroEstimado}
                onChange={(e) => setCobroEstimado(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer"
            >
              Guardar Coordinador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====================================================================
// SUB-COMPONENTE: MODAL REASIGNAR CARTERA
// ====================================================================
function ReasignarCarteraModal({
  isOpen,
  onClose,
  coordinadores,
  distribuidores,
  onReassign,
}: {
  isOpen: boolean;
  onClose: () => void;
  coordinadores: CoordinadorCore[];
  distribuidores: DistribuidorCore[];
  onReassign: (noDist: number, nuevoCoordinador: string) => void;
}) {
  const [selectedDvNo, setSelectedDvNo] = useState<number>(distribuidores[0]?.noDist || 1001);
  const [nuevoCoordNombre, setNuevoCoordNombre] = useState<string>(
    coordinadores.find((c) => c.estatus === 'ACTIVO')?.nombre || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentDv = distribuidores.find((d) => d.noDist === selectedDvNo);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDvNo || !nuevoCoordNombre) return;
    onReassign(selectedDvNo, nuevoCoordNombre);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <h3 className="font-black text-sm tracking-tight">Reasignar Cartera de Distribuidora</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Seleccionar Distribuidora</label>
            <select
              value={selectedDvNo}
              onChange={(e) => setSelectedDvNo(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
            >
              {distribuidores.map((d) => (
                <option key={d.noDist} value={d.noDist}>
                  DV #{d.noDist} · {d.nombreDistribuidor} (Actual: {d.coordinador})
                </option>
              ))}
            </select>
          </div>

          {currentDv && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinador Actual:</span>
                <span className="font-bold text-slate-800">{currentDv.coordinador}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sucursal / Zona:</span>
                <span className="font-bold text-slate-800">
                  {currentDv.sucursal} · {currentDv.zona}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Cartera:</span>
                <span className="font-mono font-bold text-blue-600">
                  {formatMoney(currentDv.saldoActual)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nuevo Coordinador Asignado</label>
            <select
              value={nuevoCoordNombre}
              onChange={(e) => setNuevoCoordNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
            >
              {coordinadores
                .filter((c) => c.estatus === 'ACTIVO')
                .map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre} ({c.sucursal} · {c.zona})
                  </option>
                ))}
            </select>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Distribuidora reasignada exitosamente</span>
            </div>
          )}

          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Confirmar Reasignación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====================================================================
// SUB-COMPONENTE: MODAL VINCULAR ACCESO (ACCESOS X COORDINADOR)
// ====================================================================
function NuevoAccesoModal({
  isOpen,
  onClose,
  coordinadores,
  usuariosSistema,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  coordinadores: CoordinadorCore[];
  usuariosSistema: UsuarioSistema[];
  onSave: (acceso: AccesoCoordinador) => void;
}) {
  const [selectedCoordId, setSelectedCoordId] = useState(coordinadores[0]?.id || '');
  const [selectedUserId, setSelectedUserId] = useState(usuariosSistema[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coord = coordinadores.find((c) => c.id === selectedCoordId);
    const user = usuariosSistema.find((u) => u.id === selectedUserId);
    if (!coord || !user) return;

    onSave({
      id: `acc-${Date.now().toString().slice(-4)}`,
      coordinadorId: coord.id,
      coordinadorNombre: coord.nombre,
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      fechaAsignacion: new Date().toLocaleDateString('es-MX'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            <h3 className="font-black text-sm tracking-tight">Vincular Acceso a Coordinador</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Coordinador ID</label>
            <select
              value={selectedCoordId}
              onChange={(e) => setSelectedCoordId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
            >
              {coordinadores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.sucursal} · #{c.coordinadorIdNum || c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Usuario ID del Sistema</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-semibold"
            >
              {usuariosSistema.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} ({u.email} · {u.id})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer"
            >
              Actualizar / Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
