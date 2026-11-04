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
} from 'lucide-react';
import { INITIAL_DISTRIBUIDORES, INITIAL_CREDITOS } from '@/lib/data/coreData';
import { DistribuidorCore, CreditoCore } from '@/types/core';

interface CoreDashboardProps {
  onNavigateToPersonas: () => void;
  onNavigateToDistribuidores: () => void;
}

export default function CoreDashboard({
  onNavigateToPersonas,
  onNavigateToDistribuidores,
}: CoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<'todos' | 'distribuidores' | 'creditos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<'ALL' | 'DV' | 'CREDITO' | 'VALE' | 'NOMBRE'>('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Selected items for modal or quick inspector
  const [selectedDv, setSelectedDv] = useState<DistribuidorCore | null>(null);
  const [selectedCredito, setSelectedCredito] = useState<CreditoCore | null>(null);

  // Filter Distribuidores
  const filteredDistribuidores = INITIAL_DISTRIBUIDORES.filter((d) => {
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
  const filteredCreditos = INITIAL_CREDITOS.filter((c) => {
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
    <div className="flex-1 bg-[#f0f4fa] text-slate-800 flex flex-col md:flex-row min-h-[calc(100vh-105px)] overflow-hidden font-sans">
      {/* LEFT SIDEBAR: OPCIONES (Identical to PersonasView and RHView) */}
      <aside className="w-full md:w-64 bg-white border-r border-blue-100 p-3 flex flex-col justify-between overflow-y-auto shadow-sm">
        <div className="space-y-4">
          <div className="bg-[#eff4fc] rounded-2xl border border-blue-200 overflow-hidden shadow-xs">
            <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white px-4 py-2.5 text-xs font-black flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#facc15]" />
                Buscador Core
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.2 rounded-full font-bold">
                Financial
              </span>
            </div>
            <div className="p-2 space-y-0.5 text-xs">
              {[
                { id: 'todos', name: 'Búsqueda Global (Todos)', icon: Search, count: '7.1k' },
                { id: 'distribuidores', name: 'Distribuidores por DV', icon: Briefcase, count: INITIAL_DISTRIBUIDORES.length },
                { id: 'creditos', name: 'Créditos y Vales', icon: FileText, count: INITIAL_CREDITOS.length },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setActiveTab(opt.id as any);
                    setSelectedDv(null);
                    setSelectedCredito(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between font-medium ${
                    activeTab === opt.id
                      ? 'bg-[#2563eb] text-white font-bold hover:bg-blue-700 shadow-xs'
                      : 'text-slate-700 hover:bg-blue-100/60 hover:text-blue-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <opt.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{opt.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                      activeTab === opt.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              ))}

              <div className="pt-2 border-t border-blue-200/60 my-1 space-y-1">
                <button
                  onClick={onNavigateToPersonas}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-blue-100/60 font-semibold flex items-center gap-2 transition"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Padrón de Personas</span>
                </button>

                <button
                  onClick={onNavigateToDistribuidores}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-blue-100/60 font-semibold flex items-center gap-2 transition"
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Red de Distribuidores</span>
                </button>

                <button
                  onClick={() => alert('Abriendo bitácora y notas de gestoría...')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-blue-100/60 font-semibold flex items-center gap-2 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Notas de Gestoría</span>
                </button>

                <button
                  onClick={() => alert('Canal seguro y anónimo de Prevención de Lavado de Dinero (PLD) LanAhora')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold flex items-center gap-2 transition shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reportar Anónimo PLD</span>
                </button>
              </div>
            </div>
          </div>

          {/* Exportar */}
          <div className="bg-[#eff4fc] rounded-2xl border border-blue-200 p-2">
            <button
              onClick={() => alert('Exportando resultados de búsqueda en formato Microsoft Excel (.xlsx)...')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-emerald-700 font-bold hover:bg-emerald-100/50 flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Consulta a Excel</span>
            </button>
          </div>
        </div>

        {/* Selected Record or Status Card (Identical to PersonasView and RHView) */}
        <div className="p-3 bg-[#eff4fc] rounded-2xl border border-blue-200 text-xs text-slate-700 mt-3">
          {selectedDv ? (
            <div>
              <span className="text-[10px] text-[#2563eb] font-bold block uppercase tracking-wider">
                Distribuidora Seleccionada:
              </span>
              <span className="font-mono text-slate-900 font-black block text-sm">
                DV #{selectedDv.noDist}
              </span>
              <span className="truncate block font-bold text-slate-800 mt-0.5">
                {selectedDv.nombreDistribuidor}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {selectedDv.sucursal} • Nivel {selectedDv.nivel}
              </span>
              <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-bold">Línea: ${selectedDv.creditoLimite.toLocaleString('es-MX')}</span>
                <span className="text-rose-600 font-mono font-bold">Saldo: ${selectedDv.saldoActual.toLocaleString('es-MX')}</span>
              </div>
            </div>
          ) : selectedCredito ? (
            <div>
              <span className="text-[10px] text-[#2563eb] font-bold block uppercase tracking-wider">
                Crédito Seleccionado:
              </span>
              <span className="font-mono text-slate-900 font-black block text-sm">
                {selectedCredito.creditoId}
              </span>
              <span className="truncate block font-bold text-slate-800 mt-0.5">
                {selectedCredito.clienteNombre}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Vale {selectedCredito.noVale} • DV #{selectedCredito.noDist}
              </span>
              <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between text-[11px]">
                <span className="text-blue-700 font-bold">Monto: ${selectedCredito.monto.toLocaleString('es-MX')}</span>
                <span className="text-emerald-700 font-bold">✓ {selectedCredito.estatus}</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-[#2563eb] font-bold block uppercase tracking-wider">
                Servidor Core Central:
              </span>
              <span className="font-mono text-slate-900 font-black block text-sm">
                Financialsoft SQL
              </span>
              <span className="block font-semibold text-slate-700 mt-0.5">
                lanahora.financialsoft.com.mx
              </span>
              <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-bold">✓ Conexión en Línea</span>
                <span className="text-slate-500 font-mono">122,144 reg.</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA: Identical to PersonasView and RHView */}
      <main className="flex-1 p-4 overflow-x-auto flex flex-col space-y-3">
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
      </main>
    </div>
  );
}
