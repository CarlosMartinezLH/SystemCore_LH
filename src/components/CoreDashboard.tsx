'use client';

import React, { useState } from 'react';
import {
  Search,
  ShieldAlert,
  FileText,
  Users,
  Briefcase,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CreditCard,
  Send,
} from 'lucide-react';
import { DistribuidorCore, CreditoCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';

interface CoreDashboardProps {
  onNavigateToPersonas: () => void;
  onNavigateToDistribuidores: () => void;
  onNavigateToDispersion?: () => void;
}

export default function CoreDashboard({
  onNavigateToPersonas,
  onNavigateToDistribuidores,
  onNavigateToDispersion,
}: CoreDashboardProps) {
  const { creditos, distribuidores } = useCoreSync();
  const [activeTab, setActiveTab] = useState<'todos' | 'distribuidores' | 'creditos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<'ALL' | 'DV' | 'CREDITO' | 'VALE' | 'NOMBRE'>('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Selected items for modal or quick inspector
  const [selectedDv, setSelectedDv] = useState<DistribuidorCore | null>(null);
  const [selectedCredito, setSelectedCredito] = useState<CreditoCore | null>(null);

  // Filter Distribuidores
  const filteredDistribuidores = distribuidores.filter((d) => {
    const matchBranch = selectedBranch === 'ALL' || d.sucursal === selectedBranch;
    if (!matchBranch) return false;
    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase().trim();
    if (searchCategory === 'DV') {
      return d.noDist.toString().includes(q);
    }
    if (searchCategory === 'NOMBRE') {
      return d.nombreDistribuidor.toLowerCase().includes(q);
    }
    return (
      d.nombreDistribuidor.toLowerCase().includes(q) ||
      d.noDist.toString().includes(q) ||
      d.coordinador.toLowerCase().includes(q)
    );
  });

  // Filter Créditos
  const filteredCreditos = creditos.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();

    if (searchCategory === 'CREDITO') {
      return c.creditoId.toLowerCase().includes(q);
    }
    if (searchCategory === 'VALE') {
      return c.noVale.toLowerCase().includes(q);
    }
    if (searchCategory === 'DV') {
      return c.noDist.toString().includes(q);
    }
    return (
      c.creditoId.toLowerCase().includes(q) ||
      c.noVale.toLowerCase().includes(q) ||
      c.clienteNombre.toLowerCase().includes(q) ||
      c.distribuidorNombre.toLowerCase().includes(q) ||
      c.noDist.toString().includes(q)
    );
  });

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* Top Action Toolbar: Botones de Acción y Filtros sobre la pantalla */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Module Tabs as segmented buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {[
            { id: 'todos', name: 'Búsqueda Global', icon: Search, count: `${distribuidores.length + creditos.length}` },
            { id: 'distribuidores', name: 'Distribuidores por DV', icon: Briefcase, count: distribuidores.length },
            { id: 'creditos', name: 'Créditos y Vales', icon: FileText, count: creditos.length },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setActiveTab(opt.id as any);
                setSelectedDv(null);
                setSelectedCredito(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === opt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <opt.icon className="w-3.5 h-3.5" />
              <span>{opt.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === opt.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Complementary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToPersonas && (
            <button
              onClick={onNavigateToPersonas}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Padrón Personas</span>
            </button>
          )}

          {onNavigateToDistribuidores && (
            <button
              onClick={onNavigateToDistribuidores}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Red DV</span>
            </button>
          )}

          <button
            onClick={() => alert('Abriendo bitácora y notas de gestoría...')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Notas Gestoría</span>
          </button>

          <button
            onClick={() => alert('Canal seguro y anónimo de Prevención de Lavado de Dinero (PLD) LanAhora')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>PLD Anónimo</span>
          </button>

          <button
            onClick={() => alert('Exportando resultados de búsqueda en formato Microsoft Excel (.xlsx)...')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Selected Item Detail Banner (if active) */}
      {(selectedDv || selectedCredito) && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between shadow-xs">
          {selectedDv ? (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                DV #{selectedDv.noDist}
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {selectedDv.nombreDistribuidor}
              </span>
              <span className="text-slate-500">
                {selectedDv.sucursal} • Nivel {selectedDv.nivel}
              </span>
              <span className="text-emerald-700 font-bold">
                Línea: ${selectedDv.creditoLimite.toLocaleString('es-MX')}
              </span>
              <span className="text-rose-600 font-mono font-bold">
                Saldo: ${selectedDv.saldoActual.toLocaleString('es-MX')}
              </span>
            </div>
          ) : selectedCredito ? (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                {selectedCredito.creditoId}
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {selectedCredito.clienteNombre}
              </span>
              <span className="text-slate-500">
                Vale: {selectedCredito.noVale} • DV #{selectedCredito.noDist}
              </span>
              <span className="text-blue-700 font-bold">
                Monto: ${selectedCredito.monto.toLocaleString('es-MX')}
              </span>
              <span className="text-emerald-700 font-bold">
                ✓ {selectedCredito.estatus}
              </span>
            </div>
          ) : null}

          <button
            onClick={() => {
              setSelectedDv(null);
              setSelectedCredito(null);
            }}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-white transition"
          >
            ✕ Cerrar selección
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-x-auto flex flex-col space-y-3">
        {/* Search & Stats Bar */}
        <div className="bg-white p-3 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por DV (ej. 1002), Nombre, CréditoID o Vale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-80 text-slate-900 focus:outline-none focus:border-[#2563eb] focus:bg-white font-medium"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">Criterio:</span>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb] font-semibold"
              >
                <option value="ALL">Todos los criterios</option>
                <option value="DV">Por No. de DV (1001-1025)</option>
                <option value="NOMBRE">Por Nombre de Persona</option>
                <option value="CREDITO">Por Identificador CréditoID</option>
                <option value="VALE">Por Folio de Vale</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">Sucursal:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb] font-semibold"
              >
                <option value="ALL">Todas las Sucursales</option>
                <option value="SALTILLO">Saltillo</option>
                <option value="TORREON">Torreón</option>
                <option value="MONCLOVA">Monclova</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando{' '}
              <strong className="text-[#2563eb]">
                {activeTab === 'creditos'
                  ? filteredCreditos.length
                  : filteredDistribuidores.length}
              </strong>{' '}
              coincidencias en Core
            </span>
          </div>
        </div>

        {/* Selected Record Detail Panel (When clicking Detalle) */}
        {selectedDv && (
          <div className="bg-[#eff4fc] border border-blue-200 rounded-2xl p-4 shadow-sm animate-in fade-in space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#2563eb]">
                  DISTRIBUIDORA #{selectedDv.noDist} • EXPEDIENTE CENTRAL
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedDv.nombreDistribuidor}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Sucursal {selectedDv.sucursal} • {selectedDv.zona} • Coordinador: <strong>{selectedDv.coordinador}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#facc15] text-slate-950">
                  NIVEL {selectedDv.nivel}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    selectedDv.estatus === 'ACTIVO'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedDv.estatus}
                </span>
                <button
                  onClick={() => setSelectedDv(null)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">Línea Autorizada:</span>
                <span className="font-black text-slate-900 font-mono text-base">
                  ${selectedDv.creditoLimite.toLocaleString('es-MX')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">Saldo Actual:</span>
                <span className="font-black text-rose-600 font-mono text-base">
                  ${selectedDv.saldoActual.toLocaleString('es-MX')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">Disponible Vales:</span>
                <span className="font-black text-[#16a34a] font-mono text-base">
                  ${selectedDv.disponible.toLocaleString('es-MX')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">LanaApp Móvil:</span>
                <span className="font-black text-[#2563eb] text-sm">
                  {selectedDv.tieneLanaApp ? '✓ Instalada & Activa' : 'Sin Aplicación'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Credito Detail Panel */}
        {selectedCredito && (
          <div className="bg-[#eff4fc] border border-blue-200 rounded-2xl p-4 shadow-sm animate-in fade-in space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#2563eb]">
                  CRÉDITO {selectedCredito.creditoId} • FOLIO DE VALE {selectedCredito.noVale}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Cliente: {selectedCredito.clienteNombre}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Distribuidora Responsable: #{selectedCredito.noDist} - {selectedCredito.distribuidorNombre}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToDispersion && (
                  <button
                    onClick={onNavigateToDispersion}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ver Dispersión STP</span>
                  </button>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {selectedCredito.estatus}
                </span>
                <button
                  onClick={() => setSelectedCredito(null)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">Monto Otorgado:</span>
                <span className="font-black text-slate-900 font-mono text-base">
                  ${selectedCredito.monto.toLocaleString('es-MX')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">Saldo Pendiente:</span>
                <span className="font-black text-rose-600 font-mono text-base">
                  ${selectedCredito.saldo.toLocaleString('es-MX')}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">Plazo Quincenas:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {selectedCredito.quincenasPlazo} quincenas
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block font-medium">Fecha Otorgamiento:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {selectedCredito.fechaOtorgamiento}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Table Container (Matching PersonasView & RHView) */}
        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-xs flex-1">
          {activeTab !== 'creditos' ? (
            /* DISTRIBUIDORAS TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">No. DV</th>
                    <th className="px-3.5 py-2.5">Nombre Distribuidor</th>
                    <th className="px-3.5 py-2.5">Sucursal</th>
                    <th className="px-3.5 py-2.5">Coordinador</th>
                    <th className="px-3.5 py-2.5">Nivel</th>
                    <th className="px-3.5 py-2.5">Estatus</th>
                    <th className="px-3.5 py-2.5">Línea Crédito</th>
                    <th className="px-3.5 py-2.5">Saldo Actual</th>
                    <th className="px-3.5 py-2.5">Disponible</th>
                    <th className="px-3.5 py-2.5">LanaApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDistribuidores.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-10 text-slate-400">
                        No se encontraron distribuidoras con los criterios de búsqueda ingresados
                      </td>
                    </tr>
                  ) : (
                    filteredDistribuidores.map((d) => {
                      const isSelected = selectedDv?.noDist === d.noDist;
                      return (
                        <tr
                          key={d.noDist}
                          onClick={() => {
                            setSelectedDv(d);
                            setSelectedCredito(null);
                          }}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-blue-50/40'
                          }`}
                        >
                          <td className="px-3.5 py-2 font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDv(d);
                                setSelectedCredito(null);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                            >
                              Detalle
                            </button>
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">
                            #{d.noDist}
                          </td>
                          <td className="px-3.5 py-2 font-bold text-slate-900">{d.nombreDistribuidor}</td>
                          <td className="px-3.5 py-2 text-slate-700">{d.sucursal}</td>
                          <td className="px-3.5 py-2 text-slate-600">{d.coordinador}</td>
                          <td className="px-3.5 py-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                              {d.nivel}
                            </span>
                          </td>
                          <td className="px-3.5 py-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                d.estatus === 'ACTIVO'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {d.estatus}
                            </span>
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-slate-800">
                            ${d.creditoLimite.toLocaleString('es-MX')}
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-rose-600">
                            ${d.saldoActual.toLocaleString('es-MX')}
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-emerald-700">
                            ${d.disponible.toLocaleString('es-MX')}
                          </td>
                          <td className="px-3.5 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                d.tieneLanaApp
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'text-slate-400'
                              }`}
                            >
                              {d.tieneLanaApp ? '✓ Activa' : 'No'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* CRÉDITOS Y VALES TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="px-3.5 py-2.5">Acciones</th>
                    <th className="px-3.5 py-2.5">Crédito ID</th>
                    <th className="px-3.5 py-2.5">No. Vale</th>
                    <th className="px-3.5 py-2.5">Cliente Acreditado</th>
                    <th className="px-3.5 py-2.5">No. DV</th>
                    <th className="px-3.5 py-2.5">Distribuidor Asignado</th>
                    <th className="px-3.5 py-2.5">Monto Otorgado</th>
                    <th className="px-3.5 py-2.5">Saldo Pendiente</th>
                    <th className="px-3.5 py-2.5">Plazo</th>
                    <th className="px-3.5 py-2.5">Fecha Alta</th>
                    <th className="px-3.5 py-2.5">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCreditos.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-10 text-slate-400">
                        No se encontraron créditos o vales con los criterios de búsqueda ingresados
                      </td>
                    </tr>
                  ) : (
                    filteredCreditos.map((c) => {
                      const isSelected = selectedCredito?.creditoId === c.creditoId;
                      return (
                        <tr
                          key={c.creditoId}
                          onClick={() => {
                            setSelectedCredito(c);
                            setSelectedDv(null);
                          }}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-blue-50/40'
                          }`}
                        >
                          <td className="px-3.5 py-2 font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCredito(c);
                                setSelectedDv(null);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                            >
                              Detalle
                            </button>
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">
                            {c.creditoId}
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-slate-800">
                            {c.noVale}
                          </td>
                          <td className="px-3.5 py-2 font-bold text-slate-900">{c.clienteNombre}</td>
                          <td className="px-3.5 py-2 font-mono font-bold text-blue-700">#{c.noDist}</td>
                          <td className="px-3.5 py-2 text-slate-700">{c.distribuidorNombre}</td>
                          <td className="px-3.5 py-2 font-mono font-bold text-slate-800">
                            ${c.monto.toLocaleString('es-MX')}
                          </td>
                          <td className="px-3.5 py-2 font-mono font-bold text-rose-600">
                            ${c.saldo.toLocaleString('es-MX')}
                          </td>
                          <td className="px-3.5 py-2 font-mono text-slate-600">
                            {c.quincenasPlazo} quincenas
                          </td>
                          <td className="px-3.5 py-2 font-mono text-slate-500">{c.fechaOtorgamiento}</td>
                          <td className="px-3.5 py-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {c.estatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
