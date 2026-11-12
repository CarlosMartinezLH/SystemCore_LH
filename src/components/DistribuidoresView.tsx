'use client';

import React, { useState, useMemo } from 'react';
import { DistribuidorCore } from '@/types/core';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  Search,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Smartphone,
  RotateCcw,
  SlidersHorizontal,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import PerfilDistribuidorModal from './modals/PerfilDistribuidorModal';
import CarteraDistribuidorModal from './modals/CarteraDistribuidorModal';
import EstadoCuentaDistribuidorModal from './modals/EstadoCuentaDistribuidorModal';
import {
  MensajesMasivosModal,
  QuitarCastigoModal,
  NotificacionAppModal,
} from './modals/DistribuidorModals';
import RelacionCobranzaModal from './modals/RelacionCobranzaModal';

interface DistribuidoresViewProps {
  currentUser?: UserSession | null;
}

export default function DistribuidoresView({ currentUser }: DistribuidoresViewProps = {}) {
  const { distribuidores, updateDistribuidor } = useCoreSync();
  const [selectedNoDist, setSelectedNoDist] = useState<number | null>(1001);

  // Filtro superior único
  const [searchTerm, setSearchTerm] = useState('');
  const [coordinatorTopFilter, setCoordinatorTopFilter] = useState('ALL');

  // Filtros individuales in-grid por columna
  const [colFilterSucursal, setColFilterSucursal] = useState('');
  const [colFilterZonaId, setColFilterZonaId] = useState('');
  const [colFilterZona, setColFilterZona] = useState('');
  const [colFilterSubzonaId, setColFilterSubzonaId] = useState('');
  const [colFilterSubzona, setColFilterSubzona] = useState('');
  const [colFilterCoordinador, setColFilterCoordinador] = useState('');
  const [colFilterNoDist, setColFilterNoDist] = useState('');
  const [colFilterNombre, setColFilterNombre] = useState('');
  const [colFilterGenero, setColFilterGenero] = useState('TODOS');
  const [colFilterEstatus, setColFilterEstatus] = useState('TODOS');
  const [colFilterNivel, setColFilterNivel] = useState('TODOS');
  const [colFilterPerfil, setColFilterPerfil] = useState('TODOS');
  const [colFilterSaldo, setColFilterSaldo] = useState('TODOS');

  // Modales
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isCarteraOpen, setIsCarteraOpen] = useState(false);
  const [isRelacionOpen, setIsRelacionOpen] = useState(false);
  const [isEstadoCuentaOpen, setIsEstadoCuentaOpen] = useState(false);
  const [isNotasOpen, setIsNotasOpen] = useState(false);
  const [isMensajesOpen, setIsMensajesOpen] = useState(false);
  const [isCastigoOpen, setIsCastigoOpen] = useState(false);
  const [isPushOpen, setIsPushOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const selectedDist =
    distribuidores.find((d) => d.noDist === selectedNoDist) || distribuidores[0];

  // Lista única de coordinadores para el selector superior
  const coordinatorsList = useMemo(() => {
    return Array.from(new Set(distribuidores.map((d) => d.coordinador).filter(Boolean)));
  }, [distribuidores]);

  // Filtrado de la tabla
  const filtered = useMemo(() => {
    return distribuidores.filter((d) => {
      // Alcance por sucursal de usuario institucional
      if (currentUser && currentUser.branchScope === 'BRANCH') {
        const uB = currentUser.branch.toUpperCase();
        const dB = (d.sucursal || '').toUpperCase();
        if (!dB.includes(uB) && !uB.includes(dB)) return false;
      }

      // Filtro superior por coordinador
      if (coordinatorTopFilter !== 'ALL' && d.coordinador !== coordinatorTopFilter) {
        return false;
      }

      // Buscador superior único
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesGlobal =
          d.nombreDistribuidor.toLowerCase().includes(q) ||
          d.noDist.toString().includes(q) ||
          (d.coordinador && d.coordinador.toLowerCase().includes(q)) ||
          (d.sucursal && d.sucursal.toLowerCase().includes(q)) ||
          (d.curp && d.curp.toLowerCase().includes(q));
        if (!matchesGlobal) return false;
      }

      // Filtros in-grid por columna
      if (colFilterSucursal.trim() && !d.sucursal.toLowerCase().includes(colFilterSucursal.toLowerCase())) {
        return false;
      }
      if (colFilterZonaId.trim() && !(d.zonaId || '').toLowerCase().includes(colFilterZonaId.toLowerCase())) {
        return false;
      }
      if (colFilterZona.trim() && !(d.zona || '').toLowerCase().includes(colFilterZona.toLowerCase())) {
        return false;
      }
      if (colFilterSubzonaId.trim() && !(d.subzonaId || '').toLowerCase().includes(colFilterSubzonaId.toLowerCase())) {
        return false;
      }
      if (colFilterSubzona.trim() && !(d.subzona || '').toLowerCase().includes(colFilterSubzona.toLowerCase())) {
        return false;
      }
      if (colFilterCoordinador.trim() && !d.coordinador.toLowerCase().includes(colFilterCoordinador.toLowerCase())) {
        return false;
      }
      if (colFilterNoDist.trim() && !d.noDist.toString().includes(colFilterNoDist.trim())) {
        return false;
      }
      if (colFilterNombre.trim() && !d.nombreDistribuidor.toLowerCase().includes(colFilterNombre.toLowerCase())) {
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
    coordinatorTopFilter,
    searchTerm,
    colFilterSucursal,
    colFilterZonaId,
    colFilterZona,
    colFilterSubzonaId,
    colFilterSubzona,
    colFilterCoordinador,
    colFilterNoDist,
    colFilterNombre,
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
  }, [filtered, currentPage]);

  const showToast = (msg: string) => {
    setActiveNotice(msg);
    setTimeout(() => setActiveNotice(null), 3000);
  };

  // Manejador de botones superiores de acción
  const handleTopActionClick = (actionName: string) => {
    if (!selectedDist) {
      alert('Seleccione primero una distribuidora en la tabla.');
      return;
    }

    if (actionName === 'Relacion' || actionName === 'Relacion Recibos') {
      setIsRelacionOpen(true);
    } else if (actionName === 'Estado de Cuenta') {
      setIsEstadoCuentaOpen(true);
    } else if (actionName === 'Notas') {
      setIsNotasOpen(true);
    } else if (actionName === 'Mensajes masivos') {
      setIsMensajesOpen(true);
    } else if (actionName === 'Historial de relaciones') {
      setIsRelacionOpen(true);
    } else if (actionName === 'Quitar fecha castigo') {
      setIsCastigoOpen(true);
    } else if (actionName === 'Enviar notificación APP') {
      setIsPushOpen(true);
    }
  };

  // Exportar a Excel XLS
  const handleExportXLS = () => {
    const rows = filtered.map((d) => ({
      Sucursal: d.sucursal,
      zonaId: d.zonaId || '',
      zona: d.zona || '',
      subzonaId: d.subzonaId || '',
      subzona: d.subzona || '',
      Coordinador: d.coordinador,
      'No Dist': d.noDist,
      'Nombre de Distribuidor': d.nombreDistribuidor,
      Genero: d.genero,
      Estatus: d.estatus,
      Nivel: d.nivel,
      Perfil: d.perfil || 'Distribuidor AAA',
      'Saldo Actual': d.saldoActual,
      'Línea de Crédito': d.creditoLimite,
      Disponible: d.disponible,
      Teléfono: d.telefono,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Distribuidores');
    XLSX.writeFile(
      workbook,
      `distribuidores_lanahora_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="flex-1 bg-slate-100/70 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-2 sm:p-4 space-y-2">
      {/* 1. Barra Superior de Botones de Acción (Idéntica a la Foto del ERP Anterior) */}
      <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Selector de Coordinadores */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-bold text-slate-700">Coordinadores</span>
          <select
            value={coordinatorTopFilter}
            onChange={(e) => {
              setCoordinatorTopFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">-- Todos --</option>
            {coordinatorsList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Botones de Acción Superiores */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => handleTopActionClick('Relacion')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Relacion
          </button>

          <button
            type="button"
            onClick={() => handleTopActionClick('Relacion Recibos')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Relacion Recibos
          </button>

          <button
            type="button"
            onClick={() => handleTopActionClick('Estado de Cuenta')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Estado de Cuenta
          </button>

          <button
            type="button"
            onClick={() => handleTopActionClick('Notas')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Notas
          </button>

          <button
            type="button"
            onClick={() => handleTopActionClick('Mensajes masivos')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Mensajes masivos
          </button>

          <button
            type="button"
            onClick={() => handleTopActionClick('Historial de relaciones')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Historial de relaciones
          </button>

          {/* Botón XLS Verde Oficial */}
          <button
            type="button"
            onClick={handleExportXLS}
            className="px-3 py-1 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold text-xs rounded transition active:scale-95 cursor-pointer shadow-2xs"
            title="Exportar padrón a Excel"
          >
            XLS
          </button>

          <button
            type="button"
            onClick={() => handleTopActionClick('Quitar fecha castigo')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Quitar fecha castigo
          </button>

          <button
            type="button"
            onClick={() => handleTopActionClick('Enviar notificación APP')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            Enviar notificación APP
          </button>
        </div>
      </div>

      {/* 2. Barra Única de Búsqueda Superior */}
      <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Introduzca el texto a buscar..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full text-xs bg-transparent focus:outline-none text-slate-800 font-medium placeholder-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* 3. Indicador de Agrupación de Columnas */}
      <div className="px-2 py-0.5 text-[11px] text-slate-500 italic">
        Arrastre una columna aquí para agrupar por dicha columna
      </div>

      {/* 4. Tabla Principal de Distribuidores con Filtros In-Grid */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
            {/* Encabezados Principales */}
            <thead className="sticky top-0 bg-slate-200 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-300 z-10">
              <tr>
                <th className="p-2 border-r border-slate-300 text-center">Detalle</th>
                <th className="p-2 border-r border-slate-300 text-center">Cartera</th>
                <th className="p-2 border-r border-slate-300">Sucursal</th>
                <th className="p-2 border-r border-slate-300">zonaId</th>
                <th className="p-2 border-r border-slate-300">zona</th>
                <th className="p-2 border-r border-slate-300">subzonaId</th>
                <th className="p-2 border-r border-slate-300">subzona</th>
                <th className="p-2 border-r border-slate-300">Coordinador</th>
                <th className="p-2 border-r border-slate-300">No Dist</th>
                <th className="p-2 border-r border-slate-300">Nombre de Distribuidor</th>
                <th className="p-2 border-r border-slate-300 text-center">Genero</th>
                <th className="p-2 border-r border-slate-300 text-center">Estatus</th>
                <th className="p-2 border-r border-slate-300 text-center">Nivel</th>
                <th className="p-2 border-r border-slate-300">Perfil</th>
                <th className="p-2 text-right">Saldo Actual</th>
              </tr>

              {/* Fila de Filtros In-Grid Abajo de Cada Columna */}
              <tr className="bg-slate-100 font-normal lowercase border-t border-slate-300">
                <th className="p-1 border-r border-slate-300"></th>
                <th className="p-1 border-r border-slate-300"></th>
                {/* Sucursal */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterSucursal}
                    onChange={(e) => {
                      setColFilterSucursal(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* zonaId */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterZonaId}
                    onChange={(e) => {
                      setColFilterZonaId(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* zona */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterZona}
                    onChange={(e) => {
                      setColFilterZona(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* subzonaId */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterSubzonaId}
                    onChange={(e) => {
                      setColFilterSubzonaId(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* subzona */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterSubzona}
                    onChange={(e) => {
                      setColFilterSubzona(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* Coordinador */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterCoordinador}
                    onChange={(e) => {
                      setColFilterCoordinador(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* No Dist */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterNoDist}
                    onChange={(e) => {
                      setColFilterNoDist(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-mono font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* Nombre de Distribuidor */}
                <th className="p-1 border-r border-slate-300">
                  <input
                    type="text"
                    value={colFilterNombre}
                    onChange={(e) => {
                      setColFilterNombre(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[11px] bg-white border border-slate-300 rounded font-normal text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </th>
                {/* Genero */}
                <th className="p-1 border-r border-slate-300">
                  <select
                    value={colFilterGenero}
                    onChange={(e) => {
                      setColFilterGenero(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-800 font-normal focus:outline-none"
                  >
                    <option value="TODOS">(Todos)</option>
                    <option value="FEMENINO">FEMENINO</option>
                    <option value="MASCULINO">MASCULINO</option>
                    <option value="NO DEFINIDO">NO DEFINIDO</option>
                  </select>
                </th>
                {/* Estatus */}
                <th className="p-1 border-r border-slate-300">
                  <select
                    value={colFilterEstatus}
                    onChange={(e) => {
                      setColFilterEstatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-800 font-normal focus:outline-none"
                  >
                    <option value="TODOS">(Todos)</option>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="CANCELADO">CANCELADO</option>
                    <option value="REESTRUCTURA">REESTRUCTURA</option>
                  </select>
                </th>
                {/* Nivel */}
                <th className="p-1 border-r border-slate-300">
                  <select
                    value={colFilterNivel}
                    onChange={(e) => {
                      setColFilterNivel(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-800 font-normal focus:outline-none"
                  >
                    <option value="TODOS">(Todos)</option>
                    <option value="BRONCE">BRONCE</option>
                    <option value="PLATA">PLATA</option>
                    <option value="ORO">ORO</option>
                    <option value="DIAMANTE">DIAMANTE</option>
                  </select>
                </th>
                {/* Perfil */}
                <th className="p-1 border-r border-slate-300">
                  <select
                    value={colFilterPerfil}
                    onChange={(e) => {
                      setColFilterPerfil(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-800 font-normal focus:outline-none"
                  >
                    <option value="TODOS">(Todos)</option>
                    <option value="Distribuidor AAA">Distribuidor AAA</option>
                    <option value="Distribuidor AA">Distribuidor AA</option>
                    <option value="Distribuidor A">Distribuidor A</option>
                  </select>
                </th>
                {/* Saldo Actual */}
                <th className="p-1">
                  <select
                    value={colFilterSaldo}
                    onChange={(e) => {
                      setColFilterSaldo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-1 py-0.5 text-[10px] bg-white border border-slate-300 rounded text-slate-800 font-normal focus:outline-none"
                  >
                    <option value="TODOS">(Todos)</option>
                    <option value="CON_SALDO">Con Saldo</option>
                    <option value="SIN_SALDO">$0.00</option>
                  </select>
                </th>
              </tr>
            </thead>

            {/* Filas de Datos */}
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {paginatedDistribuidores.map((d) => {
                const isSelected = selectedNoDist === d.noDist;
                return (
                  <tr
                    key={d.noDist}
                    onClick={() => setSelectedNoDist(d.noDist)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-blue-100/70 font-semibold' : 'hover:bg-blue-50/40 bg-white'
                    }`}
                  >
                    {/* Botón Detalle -> PerfilDistribuidorModal */}
                    <td className="p-1.5 border-r border-slate-200 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNoDist(d.noDist);
                          setIsDetalleOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                      >
                        Detalle
                      </button>
                    </td>

                    {/* Botón Cartera -> CarteraDistribuidorModal */}
                    <td className="p-1.5 border-r border-slate-200 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNoDist(d.noDist);
                          setIsCarteraOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                      >
                        Cartera
                      </button>
                    </td>

                    <td className="p-1.5 border-r border-slate-200 text-slate-800">{d.sucursal}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-center text-slate-600">
                      {d.zonaId || ''}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center text-slate-600">
                      {d.zona || ''}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-center text-slate-600">
                      {d.subzonaId || ''}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center text-slate-600">
                      {d.subzona || ''}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-slate-800 font-medium">
                      {d.coordinador}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-slate-900">
                      {d.noDist}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">
                      {d.nombreDistribuidor}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center text-slate-600">
                      {d.genero}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center">
                      <span
                        className={`font-bold ${
                          d.estatus === 'ACTIVO'
                            ? 'text-emerald-700'
                            : d.estatus === 'REESTRUCTURA'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {d.estatus}
                      </span>
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center font-bold text-slate-700">
                      {d.nivel}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-slate-700">
                      {d.perfil || 'Distribuidor AAA'}
                    </td>
                    <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                      ${(d.saldoActual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Barra Inferior de Paginación (Fiel al ERP Legacy: Página 1 de 145 (7204 elementos)) */}
        <div className="bg-slate-100 px-4 py-2 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({filtered.length} elementos)
            </span>

            {/* Controles de página */}
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Primera página"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Página anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Botones numéricos de página */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

              {totalPages > 5 && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                    currentPage === totalPages
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {totalPages}
                </button>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Página siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Última página"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Sistema LanAhora · Cartera de Distribuidores
          </div>
        </div>
      </div>

      {/* MODAL 1: PERFIL DEL DISTRIBUIDOR (DETALLE) */}
      {isDetalleOpen && selectedDist && (
        <PerfilDistribuidorModal
          isOpen={isDetalleOpen}
          onClose={() => setIsDetalleOpen(false)}
          distribuidor={selectedDist}
          onSelectDv={(noDist) => setSelectedNoDist(noDist)}
          onOpenCartera={(d) => {
            setIsDetalleOpen(false);
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
          onOpenNotas={(d) => {
            setSelectedNoDist(d.noDist);
            setIsNotasOpen(true);
          }}
          onOpenCastigo={(d) => {
            setSelectedNoDist(d.noDist);
            setIsCastigoOpen(true);
          }}
        />
      )}

      {/* MODAL 2: CARTERA DEL DISTRIBUIDOR (DETALLE DE CLIENTES & CRÉDITOS) */}
      {isCarteraOpen && selectedDist && (
        <CarteraDistribuidorModal
          isOpen={isCarteraOpen}
          onClose={() => setIsCarteraOpen(false)}
          distribuidor={selectedDist}
          onOpenDetallePerfil={(d) => {
            setSelectedNoDist(d.noDist);
            setIsDetalleOpen(true);
          }}
        />
      )}

      {/* MODAL 3: RELACIÓN DE COBRANZA QUINCENAL */}
      <RelacionCobranzaModal
        isOpen={isRelacionOpen}
        onClose={() => setIsRelacionOpen(false)}
        distribuidor={selectedDist}
      />

      {/* MODAL 4: ESTADO DE CUENTA */}
      <EstadoCuentaDistribuidorModal
        isOpen={isEstadoCuentaOpen}
        onClose={() => setIsEstadoCuentaOpen(false)}
        distribuidor={selectedDist}
        currentUser={currentUser}
      />

      {/* MODAL 5: MENSAJES MASIVOS WHATSAPP */}
      <MensajesMasivosModal
        isOpen={isMensajesOpen}
        onClose={() => setIsMensajesOpen(false)}
        distribuidor={selectedDist}
      />

      {/* MODAL 6: QUITAR FECHA CASTIGO */}
      <QuitarCastigoModal
        isOpen={isCastigoOpen}
        onClose={() => setIsCastigoOpen(false)}
        distribuidor={selectedDist}
        onUpdateDistribuidor={(up) => updateDistribuidor(up)}
      />

      {/* MODAL 7: NOTIFICACIÓN PUSH LANAAPP */}
      <NotificacionAppModal
        isOpen={isPushOpen}
        onClose={() => setIsPushOpen(false)}
        distribuidor={selectedDist}
      />
    </div>
  );
}
