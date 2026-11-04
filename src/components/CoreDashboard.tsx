'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, FileText, Smartphone, Users, Briefcase } from 'lucide-react';
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
    <div className="flex-1 bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 min-h-[calc(100vh-105px)] font-sans">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Welcome Executive Banner in LanAhora Royal Blue */}
        <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white rounded-3xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#facc15] text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
              LH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Mesa de Control & Búsqueda Central Core
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#facc15] text-slate-950">
                  En Línea
                </span>
              </div>
              <p className="text-xs text-yellow-200 mt-0.5 font-medium">
                Consulta instantánea de distribuidoras, folios de vales y cartera global LanAhora.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onNavigateToMobileApp && (
              <button
                onClick={onNavigateToMobileApp}
                className="px-4 py-2.5 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>App Móvil de Asesores</span>
              </button>
            )}

            <button
              onClick={() => alert('Abriendo notas de gestoría...')}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notas de Gestoría</span>
            </button>

            <button
              onClick={() => alert('Módulo de Prevención de Lavado de Dinero (PLD)')}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
              <span>Reportar PLD</span>
            </button>
          </div>
        </div>

        {/* Central Search Card */}
        <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-950">
              <Search className="w-4 h-4 text-[#2563eb]" />
              <span>Localizador de Distribuidores y Créditos</span>
            </div>
            <span className="text-[11px] font-mono text-blue-700 font-bold">
              Padrón: 7,171 DVs • 122,144 Personas
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Search by Name */}
            <form onSubmit={handleSearchGeneral} className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Buscar Distribuidora por Nombre Completo:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. BERTHA ALICIA, OLGA HERRERA, LUCERO..."
                  value={searchGeneral}
                  onChange={(e) => setSearchGeneral(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
              </div>
            </form>

            {/* Quick 3 Field Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {/* DV number */}
              <form onSubmit={handleSearchDv} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Por No. de Distribuidor (DV):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Ej. 1002"
                    value={searchDv}
                    onChange={(e) => setSearchDv(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Credito ID */}
              <form onSubmit={handleSearchCredito} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Por Identificador de Crédito (CreditoID):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. CR-88901"
                    value={searchCreditoId}
                    onChange={(e) => setSearchCreditoId(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Vale number */}
              <form onSubmit={handleSearchVale} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Por Folio de Vale:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. V-50491"
                    value={searchVale}
                    onChange={(e) => setSearchVale(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Navigation Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Accesos directos a catálogos:</span>
              <div className="flex gap-2">
                <button
                  onClick={onNavigateToPersonas}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Padrón de Personas</span>
                </button>
                <button
                  onClick={onNavigateToDistribuidores}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition"
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
          <div className="bg-white rounded-3xl border border-blue-100 p-6 space-y-4 shadow-xl animate-in fade-in">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Resultados de la Consulta Core
            </h3>

            {dvResult ? (
              <div className="p-5 rounded-2xl bg-[#eff4fc] border border-blue-200 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#2563eb]">
                      DISTRIBUIDORA #{dvResult.noDist}
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      {dvResult.nombreDistribuidor}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Sucursal {dvResult.sucursal} • {dvResult.zona} • Coordinador: {dvResult.coordinador}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        dvResult.estatus === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dvResult.estatus}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-[#facc15] text-slate-950">
                      NIVEL {dvResult.nivel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-200/60 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Línea de Crédito:</span>
                    <span className="font-black text-slate-900 font-mono text-base">
                      ${dvResult.creditoLimite.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Saldo Actual:</span>
                    <span className="font-black text-rose-600 font-mono text-base">
                      ${dvResult.saldoActual.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Disponible:</span>
                    <span className="font-black text-[#16a34a] font-mono text-base">
                      ${dvResult.disponible.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">LanaApp Móvil:</span>
                    <span className="font-bold text-slate-800">
                      {dvResult.tieneLanaApp ? '✓ Activa' : 'Sin App'}
                    </span>
                  </div>
                </div>
              </div>
            ) : creditoResult ? (
              <div className="p-5 rounded-2xl bg-[#eff4fc] border border-blue-200 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#2563eb]">
                      CRÉDITO {creditoResult.creditoId} • VALE {creditoResult.noVale}
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Cliente: {creditoResult.clienteNombre}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Distribuidora: #{creditoResult.noDist} - {creditoResult.distribuidorNombre}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      creditoResult.estatus === 'VIGENTE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {creditoResult.estatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-200/60 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Monto Otorgado:</span>
                    <span className="font-black text-slate-900 font-mono text-base">
                      ${creditoResult.monto.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Saldo Pendiente:</span>
                    <span className="font-black text-rose-600 font-mono text-base">
                      ${creditoResult.saldo.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Plazo Quincenas:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {creditoResult.quincenasPlazo} quincenas
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Fecha Alta:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {creditoResult.fechaOtorgamiento}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No se encontraron registros en el Core con los criterios ingresados.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
