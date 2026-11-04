'use client';

import React, { useState } from 'react';
import { Search, AlertCircle, ShieldAlert, FileText, CheckCircle2, User, CreditCard } from 'lucide-react';
import { INITIAL_DISTRIBUIDORES, INITIAL_CREDITOS, INITIAL_PERSONAS } from '@/lib/data/coreData';
import { DistribuidorCore, CreditoCore } from '@/types/core';

interface CoreDashboardProps {
  onNavigateToPersonas: () => void;
  onNavigateToDistribuidores: () => void;
}

export default function CoreDashboard({
  onNavigateToPersonas,
  onNavigateToDistribuidores,
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
    <div className="flex-1 bg-[#f4f6f9] text-slate-800 p-4 sm:p-6 min-h-[calc(100vh-105px)]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* User Greeting & Top Actions Banner */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow">
              JC
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Bienvenido al Sistema Core LanAhora:</p>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                JOSE CARLOS MARTINEZ MAYORGA
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Abriendo bitácora y notas de gestoría y cobranza...')}
              className="px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Notas de gestoría
            </button>
            <button
              onClick={() => alert('Abriendo módulo seguro de Prevención de Lavado de Dinero (PLD)...')}
              className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Reportar Anónimamente PLD
            </button>
          </div>
        </div>

        {/* Central Search Box (Replica exacta de lanahora.financialsoft.com.mx/default.aspx) */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base">
              <Search className="w-5 h-5 text-blue-200" />
              <span>Buscador Central Core LanAhora</span>
            </div>
            <span className="text-xs bg-blue-800/80 px-2.5 py-1 rounded-full text-blue-100 border border-blue-400/30">
              Servicio FinancialSoft Conectado
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* 1. Buscar Distribuidor por Nombre */}
            <form onSubmit={handleSearchGeneral} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Buscar Distribuidores por Nombre:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. BERTHA ALICIA, OLGA HERRERA, LUCERO..."
                  value={searchGeneral}
                  onChange={(e) => setSearchGeneral(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {/* 2. Buscar por No. de DV */}
              <form onSubmit={handleSearchDv} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Buscar Distribuidor por No. de DV:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Ej. 1002"
                    value={searchDv}
                    onChange={(e) => setSearchDv(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* 3. Buscar Crédito por CreditoID */}
              <form onSubmit={handleSearchCredito} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Buscar Crédito por CreditoID:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Ej. CR-88901"
                    value={searchCreditoId}
                    onChange={(e) => setSearchCreditoId(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* 4. Buscar Crédito por No. Vale */}
              <form onSubmit={handleSearchVale} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Buscar Crédito por No. Vale:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Ej. V-50491"
                    value={searchVale}
                    onChange={(e) => setSearchVale(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Direct Navigation Links to Main Modules */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">Módulos principales del Core:</span>
              <div className="flex gap-2">
                <button
                  onClick={onNavigateToPersonas}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 text-xs font-semibold transition"
                >
                  Padrón de Personas (122,144 registros)
                </button>
                <button
                  onClick={onNavigateToDistribuidores}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-semibold transition"
                >
                  Padrón de Distribuidores (7,171 DV)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Display */}
        {searchExecuted && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              Resultados de la Búsqueda Core
            </h3>

            {dvResult ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-blue-600">
                      DISTRIBUIDORA #{dvResult.noDist}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {dvResult.nombreDistribuidor}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Sucursal {dvResult.sucursal} • {dvResult.zona} • Coordinador: {dvResult.coordinador}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        dvResult.estatus === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dvResult.estatus}
                    </span>
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800">
                      {dvResult.nivel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Línea de Crédito:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ${dvResult.creditoLimite.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Saldo Actual:</span>
                    <span className="font-bold text-rose-600 font-mono">
                      ${dvResult.saldoActual.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Disponible:</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      ${dvResult.disponible.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LanaApp Móvil:</span>
                    <span className="font-bold text-slate-800">
                      {dvResult.tieneLanaApp ? '✓ Activa' : 'Sin App'}
                    </span>
                  </div>
                </div>
              </div>
            ) : creditoResult ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-blue-600">
                      CRÉDITO {creditoResult.creditoId} • VALE {creditoResult.noVale}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      Cliente: {creditoResult.clienteNombre}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Distribuidora: #{creditoResult.noDist} - {creditoResult.distribuidorNombre}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      creditoResult.estatus === 'VIGENTE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {creditoResult.estatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Monto Otorgado:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ${creditoResult.monto.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Saldo Pendiente:</span>
                    <span className="font-bold text-rose-600 font-mono">
                      ${creditoResult.saldo.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Plazo Quincenas:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {creditoResult.quincenasPlazo} quincenas
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fecha Alta:</span>
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
