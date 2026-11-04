'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, FileText, Smartphone, Users, Briefcase, ArrowRight } from 'lucide-react';
import { INITIAL_DISTRIBUIDORES, INITIAL_CREDITOS } from '@/lib/data/coreData';
import { DistribuidorCore, CreditoCore } from '@/types/core';

interface CoreDashboardProps {
  onNavigateToPersonas: () => void;
  onNavigateToDistribuidores: () => void;
  onNavigateToMobileApp?: () => void;
}

export default function CoreDashboard({
  onNavigateToPersonas,
  onNavigateToDistribuidores,
  onNavigateToMobileApp,
}: CoreDashboardProps) {
  const [searchDv, setSearchDv] = useState('');
  const [searchCreditoId, setSearchCreditoId] = useState('');
  const [searchVale, setSearchVale] = useState('');
  const [searchGeneral, setSearchGeneral] = useState('');

  const [dvResult, setDvResult] = useState<DistribuidorCore | null>(null);
  const [creditoResult, setCreditoResult] = useState<CreditoCore | null>(null);
  const [searchExecuted, setSearchExecuted] = useState(false);

  const handleSearchDv = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchDv.trim()) return;
    const found = INITIAL_DISTRIBUIDORES.find((d) => d.noDist === Number(searchDv.trim()));
    setDvResult(found || null);
    setCreditoResult(null);
    setSearchExecuted(true);
  };

  const handleSearchCredito = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCreditoId.trim()) return;
    const found = INITIAL_CREDITOS.find(
      (c) => c.creditoId.toLowerCase() === searchCreditoId.trim().toLowerCase()
    );
    setCreditoResult(found || null);
    setDvResult(null);
    setSearchExecuted(true);
  };

  const handleSearchVale = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchVale.trim()) return;
    const found = INITIAL_CREDITOS.find(
      (c) => c.noVale.toLowerCase() === searchVale.trim().toLowerCase()
    );
    setCreditoResult(found || null);
    setDvResult(null);
    setSearchExecuted(true);
  };

  const handleSearchGeneral = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchGeneral.trim()) return;
    const q = searchGeneral.toLowerCase().trim();
    const foundDv = INITIAL_DISTRIBUIDORES.find((d) =>
      d.nombreDistribuidor.toLowerCase().includes(q)
    );
    if (foundDv) {
      setDvResult(foundDv);
      setCreditoResult(null);
    } else {
      setDvResult(null);
    }
    setSearchExecuted(true);
  };

  return (
    <div className="flex-1 bg-[#0c101c] text-slate-100 p-4 sm:p-6 min-h-[calc(100vh-105px)] font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Executive Banner */}
        <div className="bg-[#131a2b] rounded-2xl border border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              LH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Mesa de Control & Búsqueda Central Core
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  En Línea
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Consulta instantánea de distribuidoras, folios de vales y cartera global.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onNavigateToMobileApp && (
              <button
                onClick={onNavigateToMobileApp}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>App Móvil de Asesores</span>
              </button>
            )}

            <button
              onClick={() => alert('Abriendo bitácora y notas de gestoría y cobranza...')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notas de Gestoría</span>
            </button>

            <button
              onClick={() => alert('Módulo de Prevención de Lavado de Dinero (PLD)')}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Reportar PLD</span>
            </button>
          </div>
        </div>

        {/* Central Search Card */}
        <div className="bg-[#131a2b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-gradient-to-r from-[#172138] to-[#141b2d] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Localizador de Distribuidores y Créditos</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Padrón: 7,171 DVs • 122,144 Personas
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Search by Name */}
            <form onSubmit={handleSearchGeneral} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Buscar Distribuidora por Nombre Completo:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. BERTHA ALICIA, OLGA HERRERA, LUCERO..."
                  value={searchGeneral}
                  onChange={(e) => setSearchGeneral(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0c101c] border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
              </div>
            </form>

            {/* Quick 3 Field Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800/80">
              {/* DV number */}
              <form onSubmit={handleSearchDv} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Por No. de Distribuidor (DV):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Ej. 1002"
                    value={searchDv}
                    onChange={(e) => setSearchDv(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0c101c] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Credito ID */}
              <form onSubmit={handleSearchCredito} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Por Identificador de Crédito (CreditoID):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. CR-88901"
                    value={searchCreditoId}
                    onChange={(e) => setSearchCreditoId(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0c101c] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Vale number */}
              <form onSubmit={handleSearchVale} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Por Folio de Vale:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. V-50491"
                    value={searchVale}
                    onChange={(e) => setSearchVale(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0c101c] border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Navigation Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">Accesos directos a catálogos:</span>
              <div className="flex gap-2">
                <button
                  onClick={onNavigateToPersonas}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Padrón de Personas</span>
                </button>
                <button
                  onClick={onNavigateToDistribuidores}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Red de Distribuidores</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        {searchExecuted && (
          <div className="bg-[#131a2b] rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl animate-in fade-in">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
              Resultados de la Consulta Core
            </h3>

            {dvResult ? (
              <div className="p-4 rounded-xl bg-[#172138] border border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      DISTRIBUIDORA #{dvResult.noDist}
                    </span>
                    <h4 className="text-base font-bold text-white">
                      {dvResult.nombreDistribuidor}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Sucursal {dvResult.sucursal} • {dvResult.zona} • Coordinador: {dvResult.coordinador}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        dvResult.estatus === 'ACTIVO'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {dvResult.estatus}
                    </span>
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dvResult.nivel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Línea de Crédito:</span>
                    <span className="font-bold text-white font-mono text-sm">
                      ${dvResult.creditoLimite.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Saldo Actual:</span>
                    <span className="font-bold text-rose-400 font-mono text-sm">
                      ${dvResult.saldoActual.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Disponible:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      ${dvResult.disponible.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">LanaApp Móvil:</span>
                    <span className="font-bold text-slate-200">
                      {dvResult.tieneLanaApp ? '✓ Activa' : 'Sin App'}
                    </span>
                  </div>
                </div>
              </div>
            ) : creditoResult ? (
              <div className="p-4 rounded-xl bg-[#172138] border border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      CRÉDITO {creditoResult.creditoId} • VALE {creditoResult.noVale}
                    </span>
                    <h4 className="text-base font-bold text-white">
                      Cliente: {creditoResult.clienteNombre}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Distribuidora: #{creditoResult.noDist} - {creditoResult.distribuidorNombre}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      creditoResult.estatus === 'VIGENTE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {creditoResult.estatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Monto Otorgado:</span>
                    <span className="font-bold text-white font-mono text-sm">
                      ${creditoResult.monto.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Saldo Pendiente:</span>
                    <span className="font-bold text-rose-400 font-mono text-sm">
                      ${creditoResult.saldo.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Plazo Quincenas:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {creditoResult.quincenasPlazo} quincenas
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Fecha Alta:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {creditoResult.fechaOtorgamiento}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No se encontraron registros en el Core con los criterios ingresados.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
