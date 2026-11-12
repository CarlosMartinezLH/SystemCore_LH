'use client';

import React, { useState, useMemo } from 'react';
import { DistribuidorCore } from '@/types/core';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  Search,
  FileSpreadsheet,
  X,
  RefreshCw,
  Pencil,
  Briefcase,
  Users,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
  Award,
  UserPlus,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import PerfilDistribuidorModal from './modals/PerfilDistribuidorModal';
import CarteraDistribuidorModal from './modals/CarteraDistribuidorModal';
import EstadoCuentaDistribuidorModal from './modals/EstadoCuentaDistribuidorModal';
import RelacionCobranzaModal from './modals/RelacionCobranzaModal';
import {
  MensajesMasivosModal,
  QuitarCastigoModal,
  NotificacionAppModal,
} from './modals/DistribuidorModals';

interface DistribuidoresViewProps {
  currentUser?: UserSession | null;
}

export default function DistribuidoresView({ currentUser }: DistribuidoresViewProps = {}) {
  const { distribuidores, updateDistribuidor } = useCoreSync();

  // Distribuidor seleccionado (null inicialmente, idéntico a PersonasView)
  const [selectedNoDist, setSelectedNoDist] = useState<number | null>(null);

  // Buscador superior único
  const [searchFilter, setSearchFilter] = useState('');
  const [coordinatorFilter, setCoordinatorFilter] = useState('ALL');
  const [estatusSegment, setEstatusSegment] = useState<'TODOS' | 'ACTIVO' | 'REESTRUCTURA' | 'CANCELADO'>('TODOS');

  // Filtros individuales in-grid por columna (idéntico al módulo de Personas)
  const [colFilterNoDist, setColFilterNoDist] = useState('');
  const [colFilterNombre, setColFilterNombre] = useState('');
  const [colFilterCoordinador, setColFilterCoordinador] = useState('');
  const [colFilterSucursal, setColFilterSucursal] = useState('');
  const [colFilterZona, setColFilterZona] = useState('');
  const [colFilterSubzona, setColFilterSubzona] = useState('');
  const [colFilterGenero, setColFilterGenero] = useState('TODOS');
  const [colFilterEstatus, setColFilterEstatus] = useState('TODOS');
  const [colFilterNivel, setColFilterNivel] = useState('TODOS');
  const [colFilterPerfil, setColFilterPerfil] = useState('TODOS');
  const [colFilterSaldo, setColFilterSaldo] = useState<'TODOS' | 'CON_SALDO' | 'SIN_SALDO'>('TODOS');

  // Feedback de copiado en portapapeles
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modales
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [detalleInitialTab, setDetalleInitialTab] = useState<'detalle' | 'opciones' | 'cartera' | 'estado_cuenta' | 'notas'>('detalle');
  const [isCarteraOpen, setIsCarteraOpen] = useState(false);
  const [isEstadoCuentaOpen, setIsEstadoCuentaOpen] = useState(false);
  const [isRelacionOpen, setIsRelacionOpen] = useState(false);
  const [isMensajesOpen, setIsMensajesOpen] = useState(false);
  const [isCastigoOpen, setIsCastigoOpen] = useState(false);
  const [isPushOpen, setIsPushOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const selectedDist = useMemo(() => {
    return distribuidores.find((d) => d.noDist === selectedNoDist) || distribuidores[0] || null;
  }, [distribuidores, selectedNoDist]);

  // Lista única de coordinadores
  const coordinators = useMemo(() => {
    return Array.from(new Set(distribuidores.map((d) => d.coordinador).filter(Boolean))).sort();
  }, [distribuidores]);

  // Conteo por estatus
  const countActivas = distribuidores.filter((d) => d.estatus === 'ACTIVO').length;
  const countReestructura = distribuidores.filter((d) => d.estatus === 'REESTRUCTURA').length;
  const countCanceladas = distribuidores.filter((d) => d.estatus === 'CANCELADO').length;

  // Bandera de filtros activos (para mostrar botón "Limpiar" idéntico a PersonasView)
  const hasActiveFilters =
    searchFilter.trim() !== '' ||
    coordinatorFilter !== 'ALL' ||
    estatusSegment !== 'TODOS' ||
    colFilterNoDist.trim() !== '' ||
    colFilterNombre.trim() !== '' ||
    colFilterCoordinador.trim() !== '' ||
    colFilterSucursal.trim() !== '' ||
    colFilterZona.trim() !== '' ||
    colFilterSubzona.trim() !== '' ||
    colFilterGenero !== 'TODOS' ||
    colFilterEstatus !== 'TODOS' ||
    colFilterNivel !== 'TODOS' ||
    colFilterPerfil !== 'TODOS' ||
    colFilterSaldo !== 'TODOS';

  const handleResetFilters = () => {
    setSearchFilter('');
    setCoordinatorFilter('ALL');
    setEstatusSegment('TODOS');
    setColFilterNoDist('');
    setColFilterNombre('');
    setColFilterCoordinador('');
    setColFilterSucursal('');
    setColFilterZona('');
    setColFilterSubzona('');
    setColFilterGenero('TODOS');
    setColFilterEstatus('TODOS');
    setColFilterNivel('TODOS');
    setColFilterPerfil('TODOS');
    setColFilterSaldo('TODOS');
    setCurrentPage(1);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Filtrado reactivo de la tabla
  const filtered = useMemo(() => {
    return distribuidores.filter((d) => {
      // Alcance por sucursal de usuario institucional
      if (currentUser && currentUser.branchScope === 'BRANCH') {
        const uB = currentUser.branch.toUpperCase();
        const dB = (d.sucursal || '').toUpperCase();
        if (!dB.includes(uB) && !uB.includes(dB)) return false;
      }

      // Filtro superior por coordinador
      if (coordinatorFilter !== 'ALL' && d.coordinador !== coordinatorFilter) {
        return false;
      }

      // Segmented status filter
      if (estatusSegment !== 'TODOS' && d.estatus !== estatusSegment) {
        return false;
      }

      // Buscador superior único
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesGlobal =
          d.nombreDistribuidor.toLowerCase().includes(q) ||
          d.noDist.toString().includes(q) ||
          (d.coordinador && d.coordinador.toLowerCase().includes(q)) ||
          (d.sucursal && d.sucursal.toLowerCase().includes(q)) ||
          (d.curp && d.curp.toLowerCase().includes(q)) ||
          (d.telefono && d.telefono.includes(q));
        if (!matchesGlobal) return false;
      }

      // Filtros in-grid por columna
      if (colFilterNoDist.trim() && !d.noDist.toString().includes(colFilterNoDist.trim())) {
        return false;
      }
      if (colFilterNombre.trim() && !d.nombreDistribuidor.toLowerCase().includes(colFilterNombre.toLowerCase())) {
        return false;
      }
      if (colFilterCoordinador.trim() && !d.coordinador.toLowerCase().includes(colFilterCoordinador.toLowerCase())) {
        return false;
      }
      if (colFilterSucursal.trim() && !d.sucursal.toLowerCase().includes(colFilterSucursal.toLowerCase())) {
        return false;
      }
      if (colFilterZona.trim() && !(d.zona || d.zonaId || '').toLowerCase().includes(colFilterZona.toLowerCase())) {
        return false;
      }
      if (colFilterSubzona.trim() && !(d.subzona || d.subzonaId || '').toLowerCase().includes(colFilterSubzona.toLowerCase())) {
        return false;
      }
      if (colFilterGenero !== 'TODOS' && d.genero !== colFilterGenero) {
        return false;
      }
      if (colFilterEstatus !== 'TODOS' && d.estatus !== colFilterEstatus) {
        return false;
      }
      if (colFilterNivel !== 'TODOS' && d.nivel !== colFilterNivel) {
        return false;
      }
      if (colFilterPerfil !== 'TODOS' && (d.perfil || 'Distribuidor AAA') !== colFilterPerfil) {
        return false;
      }
      if (colFilterSaldo === 'CON_SALDO' && (d.saldoActual || 0) <= 0) {
        return false;
      }
      if (colFilterSaldo === 'SIN_SALDO' && (d.saldoActual || 0) > 0) {
        return false;
      }

      return true;
    });
  }, [
    distribuidores,
    currentUser,
    coordinatorFilter,
    estatusSegment,
    searchFilter,
    colFilterNoDist,
    colFilterNombre,
    colFilterCoordinador,
    colFilterSucursal,
    colFilterZona,
    colFilterSubzona,
    colFilterGenero,
    colFilterEstatus,
    colFilterNivel,
    colFilterPerfil,
    colFilterSaldo,
  ]);

  // Paginación real
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedDistribuidores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // Exportar a Excel XLSX (SheetJS - Idéntico a PersonasView)
  const handleExportExcel = () => {
    const exportData = filtered.map((d) => ({
      'No. Dist': d.noDist,
      'Nombre Distribuidor': d.nombreDistribuidor,
      Sucursal: d.sucursal,
      Zona: d.zona || d.zonaId || '',
      Subzona: d.subzona || d.subzonaId || '',
      Coordinador: d.coordinador,
      Género: d.genero,
      Estatus: d.estatus,
      Nivel: d.nivel,
      Perfil: d.perfil || 'Distribuidor AAA',
      'Línea de Crédito': d.creditoLimite,
      'Saldo Actual': d.saldoActual,
      Disponible: d.disponible,
      Teléfono: d.telefono,
      CURP: d.curp,
      'LanaApp Activa': d.tieneLanaApp ? 'SÍ' : 'NO',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 32 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 28 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Padrón de Distribuidores');
    XLSX.writeFile(
      workbook,
      `Padron_Distribuidores_LanAhora_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="flex-1 bg-[#f8fafc] text-slate-800 flex flex-col min-h-0 overflow-hidden font-sans">
      {/* 1. Header Toolbar (Diseño IDÉNTICO a PersonasView) */}
      <div className="px-4 lg:px-6 pt-4 pb-3">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Buscador Único Principal */}
          <div className="flex-1 relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por Nombre, No. Dist, Coordinador, Sucursal, CURP o Teléfono..."
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition font-medium"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Acciones & Filtros Globales a la Derecha */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Limpiar Filtros */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 border border-red-200 transition active:scale-95 cursor-pointer"
                title="Limpiar todos los filtros activos"
              >
                <RefreshCw className="w-3 h-3 text-red-600" />
                <span>Limpiar</span>
              </button>
            )}

            {/* Selector de Coordinador */}
            <select
              value={coordinatorFilter}
              onChange={(e) => {
                setCoordinatorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="ALL">-- Todos los Coordinadores --</option>
              {coordinators.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Exportar a Excel (.xlsx) */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 border border-emerald-600 transition active:scale-95 shadow-2xs cursor-pointer"
              title="Descargar padrón completo en Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace: Full-Width Table 100% (Diseño IDÉNTICO a PersonasView) */}
      <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-6 pb-4 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Sub-header con conteo y segmented filter de estatus */}
          <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60 shrink-0">
            <span className="text-xs text-slate-600 font-medium">
              Mostrando <strong className="text-slate-900 font-bold">{filtered.length}</strong> de {distribuidores.length} distribuidoras registradas
            </span>

            {/* Segmented status filter (idéntico a PersonasView) */}
            <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg border border-slate-300/60 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setEstatusSegment('TODOS');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition ${
                  estatusSegment === 'TODOS'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({distribuidores.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setEstatusSegment('ACTIVO');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                  estatusSegment === 'ACTIVO'
                    ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Activas ({countActivas})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEstatusSegment('REESTRUCTURA');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                  estatusSegment === 'REESTRUCTURA'
                    ? 'bg-white text-amber-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Reestructura ({countReestructura})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEstatusSegment('CANCELADO');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${
                  estatusSegment === 'CANCELADO'
                    ? 'bg-white text-slate-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Canceladas ({countCanceladas})</span>
              </button>
            </div>
          </div>

          {/* Tabla de Datos con Scroll */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200 z-10">
                <tr>
                  <th className="px-2.5 py-2.5">No Dist</th>
                  <th className="px-2.5 py-2.5">Nombre Distribuidor</th>
                  <th className="px-2.5 py-2.5">Coordinador</th>
                  <th className="px-2.5 py-2.5">Sucursal</th>
                  <th className="px-2.5 py-2.5 text-center">Zona</th>
                  <th className="px-2.5 py-2.5 text-center">Subzona</th>
                  <th className="px-2.5 py-2.5 text-center">Género</th>
                  <th className="px-2.5 py-2.5 text-center">Estatus</th>
                  <th className="px-2.5 py-2.5 text-center">Nivel</th>
                  <th className="px-2.5 py-2.5">Perfil</th>
                  <th className="px-2.5 py-2.5 text-right">Línea Crédito</th>
                  <th className="px-2.5 py-2.5 text-right">Saldo Actual</th>
                  <th className="px-2.5 py-2.5 text-right">Disponible</th>
                  <th className="px-3 py-2.5 text-center sticky right-0 bg-slate-100 z-10 shadow-[-1px_0_0_0_#e2e8f0]">
                    Acciones
                  </th>
                </tr>

                {/* Fila de Filtros In-Grid debajo de cada columna (idéntico a PersonasView) */}
                <tr className="bg-slate-50/95 border-t border-slate-200/80 font-normal lowercase">
                  {/* No Dist */}
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilterNoDist}
                      onChange={(e) => {
                        setColFilterNoDist(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-800 font-mono font-normal focus:outline-none focus:border-blue-500"
                    />
                  </th>

                  {/* Nombre Distribuidor */}
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilterNombre}
                      onChange={(e) => {
                        setColFilterNombre(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    />
                  </th>

                  {/* Coordinador */}
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilterCoordinador}
                      onChange={(e) => {
                        setColFilterCoordinador(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    />
                  </th>

                  {/* Sucursal */}
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={colFilterSucursal}
                      onChange={(e) => {
                        setColFilterSucursal(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    />
                  </th>

                  {/* Zona */}
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Zona..."
                      value={colFilterZona}
                      onChange={(e) => {
                        setColFilterZona(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500 text-center"
                    />
                  </th>

                  {/* Subzona */}
                  <th className="p-1">
                    <input
                      type="text"
                      placeholder="Sub..."
                      value={colFilterSubzona}
                      onChange={(e) => {
                        setColFilterSubzona(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500 text-center"
                    />
                  </th>

                  {/* Género */}
                  <th className="p-1">
                    <select
                      value={colFilterGenero}
                      onChange={(e) => {
                        setColFilterGenero(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    >
                      <option value="TODOS">(Todos)</option>
                      <option value="FEMENINO">FEMENINO</option>
                      <option value="MASCULINO">MASCULINO</option>
                      <option value="NO DEFINIDO">NO DEF</option>
                    </select>
                  </th>

                  {/* Estatus */}
                  <th className="p-1">
                    <select
                      value={colFilterEstatus}
                      onChange={(e) => {
                        setColFilterEstatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    >
                      <option value="TODOS">(Todos)</option>
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="CANCELADO">CANCELADO</option>
                      <option value="REESTRUCTURA">REESTRUCTURA</option>
                    </select>
                  </th>

                  {/* Nivel */}
                  <th className="p-1">
                    <select
                      value={colFilterNivel}
                      onChange={(e) => {
                        setColFilterNivel(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    >
                      <option value="TODOS">(Todos)</option>
                      <option value="BRONCE">BRONCE</option>
                      <option value="PLATA">PLATA</option>
                      <option value="ORO">ORO</option>
                      <option value="DIAMANTE">DIAMANTE</option>
                    </select>
                  </th>

                  {/* Perfil */}
                  <th className="p-1">
                    <select
                      value={colFilterPerfil}
                      onChange={(e) => {
                        setColFilterPerfil(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    >
                      <option value="TODOS">(Todos)</option>
                      <option value="Distribuidor AAA">Dist. AAA</option>
                      <option value="Distribuidor AA">Dist. AA</option>
                      <option value="Distribuidor A">Dist. A</option>
                    </select>
                  </th>

                  {/* Línea Crédito */}
                  <th className="p-1"></th>

                  {/* Saldo Actual */}
                  <th className="p-1">
                    <select
                      value={colFilterSaldo}
                      onChange={(e) => {
                        setColFilterSaldo(e.target.value as any);
                        setCurrentPage(1);
                      }}
                      className="w-full px-1 py-1 text-[10px] bg-white border border-slate-200 rounded text-slate-800 font-normal focus:outline-none focus:border-blue-500"
                    >
                      <option value="TODOS">(Todos)</option>
                      <option value="CON_SALDO">Con Saldo</option>
                      <option value="SIN_SALDO">$0.00</option>
                    </select>
                  </th>

                  {/* Disponible */}
                  <th className="p-1"></th>

                  {/* Acciones */}
                  <th className="p-1 text-center sticky right-0 bg-slate-50 z-10 shadow-[-1px_0_0_0_#e2e8f0]">
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        title="Limpiar filtros"
                        className="px-2 py-0.5 text-[10px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded font-bold border border-red-200 cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </th>
                </tr>
              </thead>

              {/* Cuerpo de la Tabla */}
              <tbody className="divide-y divide-slate-100 font-sans">
                {paginatedDistribuidores.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-slate-400">
                      No se encontraron distribuidoras con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  paginatedDistribuidores.map((d) => {
                    const isSelected = selectedNoDist === d.noDist;

                    return (
                      <tr
                        key={d.noDist}
                        onClick={() => setSelectedNoDist(d.noDist)}
                        className={`transition-colors group cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 font-semibold'
                            : 'hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        {/* No. Dist (con botón de copiar rápido) */}
                        <td className="px-2.5 py-2 font-mono font-bold text-blue-600">
                          <div className="flex items-center gap-1.5">
                            <span>#{d.noDist}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(d.noDist.toString(), `dist-${d.noDist}`);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                              title="Copiar No. de Distribuidor"
                            >
                              {copiedKey === `dist-${d.noDist}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Nombre del Distribuidor */}
                        <td className="px-2.5 py-2 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider border font-mono shrink-0 shadow-2xs ${
                                d.nivel === 'DIAMANTE'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : d.nivel === 'ORO'
                                  ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                  : d.nivel === 'PLATA'
                                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                              title={`Nivel: ${d.nivel}`}
                            >
                              {d.nivel.slice(0, 3)}
                            </span>
                            <span>{d.nombreDistribuidor}</span>
                          </div>
                        </td>

                        {/* Coordinador */}
                        <td className="px-2.5 py-2 text-slate-700 font-medium">
                          {d.coordinador}
                        </td>

                        {/* Sucursal */}
                        <td className="px-2.5 py-2 text-slate-600">
                          {d.sucursal}
                        </td>

                        {/* Zona */}
                        <td className="px-2.5 py-2 text-center text-slate-600 font-mono">
                          {d.zona || d.zonaId || '-'}
                        </td>

                        {/* Subzona */}
                        <td className="px-2.5 py-2 text-center text-slate-600 font-mono">
                          {d.subzona || d.subzonaId || '-'}
                        </td>

                        {/* Género */}
                        <td className="px-2.5 py-2 text-center text-slate-500 text-[11px]">
                          {d.genero}
                        </td>

                        {/* Estatus */}
                        <td className="px-2.5 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              d.estatus === 'ACTIVO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : d.estatus === 'REESTRUCTURA'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {d.estatus}
                          </span>
                        </td>

                        {/* Nivel */}
                        <td className="px-2.5 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              d.nivel === 'DIAMANTE'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : d.nivel === 'ORO'
                                ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                                : d.nivel === 'PLATA'
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {d.nivel}
                          </span>
                        </td>

                        {/* Perfil */}
                        <td className="px-2.5 py-2 text-slate-600 text-[11px]">
                          {d.perfil || 'Distribuidor AAA'}
                        </td>

                        {/* Línea de Crédito */}
                        <td className="px-2.5 py-2 text-right font-mono text-slate-700">
                          ${d.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Saldo Actual */}
                        <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-900">
                          ${(d.saldoActual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Disponible */}
                        <td className="px-2.5 py-2 text-right font-mono font-bold text-emerald-600">
                          ${d.disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Columna Acciones (Sticky Right - IDÉNTICA a PersonasView) */}
                        <td
                          className="px-2.5 py-2 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-1px_0_0_0_#f1f5f9]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            {/* Botón Detalle -> PerfilDistribuidorModal (Tab Detalle) */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNoDist(d.noDist);
                                setDetalleInitialTab('detalle');
                                setIsDetalleOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 border border-blue-200 transition active:scale-95 shadow-2xs cursor-pointer"
                              title="Ver y editar detalle del distribuidor"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Detalle</span>
                            </button>

                            {/* Botón Cartera -> CarteraDistribuidorModal */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNoDist(d.noDist);
                                setIsCarteraOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1 border border-emerald-200 transition active:scale-95 shadow-2xs cursor-pointer"
                              title="Ver cartera de clientes y créditos"
                            >
                              <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Cartera</span>
                            </button>

                            {/* Botón Estado de Cuenta directo */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNoDist(d.noDist);
                                setIsEstadoCuentaOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 border border-slate-200 transition active:scale-95 shadow-2xs cursor-pointer"
                              title="Generar Estado de Cuenta imprimible"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edo. Cta</span>
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

          {/* 3. Footer de Paginación Moderno (IDÉNTICO a PersonasView) */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
            <div className="flex items-center gap-2">
              <span>Filas por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-600">
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              </span>

              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Última página"
                >
                  <ChevronsRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: PERFIL DEL DISTRIBUIDOR (DETALLE MODERNO CON PESTAÑAS) */}
      {isDetalleOpen && selectedDist && (
        <PerfilDistribuidorModal
          isOpen={isDetalleOpen}
          onClose={() => setIsDetalleOpen(false)}
          distribuidor={selectedDist}
          initialTab={detalleInitialTab}
          onSelectDv={(noDist) => setSelectedNoDist(noDist)}
          onOpenCartera={(d) => {
            setSelectedNoDist(d.noDist);
            setIsCarteraOpen(true);
          }}
          onOpenRelacion={(d) => {
            setSelectedNoDist(d.noDist);
            setIsRelacionOpen(true);
          }}
          onOpenEstadoCuenta={(d) => {
            setSelectedNoDist(d.noDist);
            setIsEstadoCuentaOpen(true);
          }}
          onOpenCastigo={(d) => {
            setSelectedNoDist(d.noDist);
            setIsCastigoOpen(true);
          }}
        />
      )}

      {/* MODAL 2: CARTERA DEL DISTRIBUIDOR */}
      {isCarteraOpen && selectedDist && (
        <CarteraDistribuidorModal
          isOpen={isCarteraOpen}
          onClose={() => setIsCarteraOpen(false)}
          distribuidor={selectedDist}
          onOpenDetallePerfil={(d) => {
            setSelectedNoDist(d.noDist);
            setDetalleInitialTab('detalle');
            setIsDetalleOpen(true);
          }}
        />
      )}

      {/* MODAL 3: ESTADO DE CUENTA OFICIAL IMPRIMIBLE */}
      {isEstadoCuentaOpen && selectedDist && (
        <EstadoCuentaDistribuidorModal
          isOpen={isEstadoCuentaOpen}
          onClose={() => setIsEstadoCuentaOpen(false)}
          distribuidor={selectedDist}
          currentUser={currentUser}
        />
      )}

      {/* MODAL 4: RELACIÓN DE COBRANZA */}
      <RelacionCobranzaModal
        isOpen={isRelacionOpen}
        onClose={() => setIsRelacionOpen(false)}
        distribuidor={selectedDist || distribuidores[0]}
      />

      {/* MODAL 5: MENSAJES MASIVOS WHATSAPP */}
      <MensajesMasivosModal
        isOpen={isMensajesOpen}
        onClose={() => setIsMensajesOpen(false)}
        distribuidor={selectedDist || distribuidores[0]}
      />

      {/* MODAL 6: QUITAR FECHA CASTIGO */}
      <QuitarCastigoModal
        isOpen={isCastigoOpen}
        onClose={() => setIsCastigoOpen(false)}
        distribuidor={selectedDist || distribuidores[0]}
        onUpdateDistribuidor={(up) => updateDistribuidor(up)}
      />

      {/* MODAL 7: NOTIFICACIÓN PUSH APP */}
      <NotificacionAppModal
        isOpen={isPushOpen}
        onClose={() => setIsPushOpen(false)}
        distribuidor={selectedDist || distribuidores[0]}
      />
    </div>
  );
}
