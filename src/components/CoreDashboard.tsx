'use client';

import React, { useState } from 'react';
import {
  Search,
  Users,
  Briefcase,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { DistribuidorCore, CreditoCore } from '@/types/core';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';
import PerfilDistribuidorView from './PerfilDistribuidorView';
import RelacionCobranzaModal from './modals/RelacionCobranzaModal';

interface CoreDashboardProps {
  onNavigateToPersonas: () => void;
  onNavigateToDistribuidores: () => void;
  onNavigateToDispersion?: () => void;
  onNavigateToGestoria?: () => void;
  onNavigateToPLD?: () => void;
  currentUser?: UserSession | null;
}

const normalizeZona = (val: string | undefined): 'ZONA A' | 'ZONA B' | 'ZONA C' => {
  if (!val) return 'ZONA A';
  const u = val.toUpperCase();
  if (u.includes('ZONA B') || u.includes('TORRE') || u === 'ZONA_B' || u === 'B') return 'ZONA B';
  if (u.includes('ZONA C') || u.includes('MONCLOVA') || u === 'ZONA_C' || u === 'C') return 'ZONA C';
  return 'ZONA A';
};

const formatZonaLabel = (val: string | undefined): string => {
  const z = normalizeZona(val);
  if (z === 'ZONA A') return 'Zona A';
  if (z === 'ZONA B') return 'Zona B';
  if (z === 'ZONA C') return 'Zona C';
  return 'Zona A';
};

export default function CoreDashboard({
  onNavigateToPersonas,
  onNavigateToDistribuidores,
  onNavigateToDispersion,
  onNavigateToGestoria,
  onNavigateToPLD,
  currentUser,
}: CoreDashboardProps) {
  const { creditos, distribuidores } = useCoreSync();
  const [activeTab, setActiveTab] = useState<'todos' | 'distribuidores' | 'creditos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  // Perfil del Distribuidor y Relación de Cobranza
  const [activePerfilDv, setActivePerfilDv] = useState<DistribuidorCore | null>(null);
  const [activeRelacionDv, setActiveRelacionDv] = useState<DistribuidorCore | null>(null);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 900);
  };

  // Filtrado de Distribuidores
  const filteredDistribuidores = distribuidores.filter((d) => {
    if (currentUser && currentUser.branchScope === 'BRANCH') {
      const uB = currentUser.branch.toUpperCase();
      const dB = (d.sucursal || '').toUpperCase();
      const match =
        ((uB.includes('ZONA A') || uB.includes('SALTILLO')) && (dB.includes('ZONA A') || dB.includes('SALTILLO'))) ||
        ((uB.includes('ZONA B') || uB.includes('TORRE')) && (dB.includes('ZONA B') || dB.includes('TORRE'))) ||
        ((uB.includes('ZONA C') || uB.includes('MONCLOVA')) && (dB.includes('ZONA C') || dB.includes('MONCLOVA')));
      if (!match) return false;
    }

    const dvZona = normalizeZona(d.sucursal);
    const matchBranch = selectedBranch === 'ALL' || dvZona === selectedBranch;
    if (!matchBranch) return false;
    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase().trim();
    return (
      d.nombreDistribuidor.toLowerCase().includes(q) ||
      d.noDist.toString().includes(q) ||
      d.coordinador.toLowerCase().includes(q) ||
      d.sucursal.toLowerCase().includes(q) ||
      dvZona.toLowerCase().includes(q) ||
      formatZonaLabel(d.sucursal).toLowerCase().includes(q)
    );
  });

  // Filtrado de Créditos
  const filteredCreditos = creditos.filter((c) => {
    const cZona = normalizeZona(c.sucursal);
    const matchBranch = selectedBranch === 'ALL' || cZona === selectedBranch;
    if (!matchBranch) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();

    return (
      c.creditoId.toLowerCase().includes(q) ||
      c.noVale.toLowerCase().includes(q) ||
      c.clienteNombre.toLowerCase().includes(q) ||
      c.distribuidorNombre.toLowerCase().includes(q) ||
      c.noDist.toString().includes(q) ||
      cZona.toLowerCase().includes(q) ||
      formatZonaLabel(c.sucursal).toLowerCase().includes(q)
    );
  });

  const totalColocacion = creditos.reduce((acc, c) => acc + (c.monto || 0), 0);
  const totalLinea = distribuidores.reduce((acc, d) => acc + (d.creditoLimite || 0), 0);

  // Si está viendo el perfil de una distribuidora, se muestra la vista completa y limpia
  if (activePerfilDv) {
    return (
      <PerfilDistribuidorView
        distribuidor={activePerfilDv}
        onBack={() => setActivePerfilDv(null)}
        onNavigateToGestoria={onNavigateToGestoria}
      />
    );
  }

  return (
    <div className="w-full p-4 lg:p-8 space-y-6 bg-[#f8fafc] min-h-[calc(100vh-60px)] font-sans">
      {/* 1. Header Toolbar Unificado: Búsqueda Global, Filtros y Acciones */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Barra de Búsqueda Inteligente (Unificada) */}
        <div className="flex-1 relative min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por DV (ej. 1053), No. Vale, CreditoID, Cliente o Distribuidora..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition font-medium"
          />
        </div>

        {/* Controles de Filtro: Pestañas + Selector de Sucursal */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Pestañas de filtrado de contenido */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'todos'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({distribuidores.length + creditos.length})
            </button>
            <button
              onClick={() => setActiveTab('distribuidores')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'distribuidores'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Distribuidoras ({distribuidores.length})
            </button>
            <button
              onClick={() => setActiveTab('creditos')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'creditos'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vales & Créditos ({creditos.length})
            </button>
          </div>

          {/* Selector de Zona */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white transition cursor-pointer"
          >
            <option value="ALL">Todas las Zonas</option>
            <option value="ZONA A">Zona A</option>
            <option value="ZONA B">Zona B</option>
            <option value="ZONA C">Zona C</option>
          </select>

          {/* Botón Sincronizar */}
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition flex items-center justify-center active:scale-95"
            title="Refrescar cartera en vivo"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Tarjetas KPI de Estado Ejecutivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Colocación en Cartera
            </span>
            <span className="text-xl lg:text-2xl font-black text-slate-900 font-mono mt-1 block">
              ${totalColocacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {creditos.length} Vales vigentes
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Líneas Autorizadas
            </span>
            <span className="text-xl lg:text-2xl font-black text-slate-900 font-mono mt-1 block">
              ${totalLinea.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {distribuidores.length} Distribuidoras activas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Índice de Recuperación
            </span>
            <span className="text-xl lg:text-2xl font-black text-emerald-600 font-mono mt-1 block">
              95.4%
            </span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Comisiones 30-15 al corriente
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Zonas en Operación
            </span>
            <span className="text-xl lg:text-2xl font-black text-slate-900 mt-1 block">
              3 Zonas
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Zona A · Zona B · Zona C
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Tabla Principal de Cartera (Limpia, Espaciosa y de Alta Legibilidad) */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'distribuidores'
                ? 'Padrón de Distribuidoras (DV)'
                : activeTab === 'creditos'
                ? 'Vales y Créditos en Cartera'
                : 'Padrón y Cartera Integral'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Haz clic en cualquier fila para consultar el perfil completo o emitir la relación de cobranza
            </p>
          </div>

          {/* Acceso Rápido Directo a DV #1053 Yolanda Torres */}
          <button
            onClick={() => {
              const dv1053 = distribuidores.find((d) => d.noDist === 1053);
              if (dv1053) setActivePerfilDv(dv1053);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver DV #1053 Yolanda Torres</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Identificador</th>
                <th className="py-3 px-4">Titular / Nombre</th>
                <th className="py-3 px-4">Zona</th>
                <th className="py-3 px-4 text-right">Línea / Monto</th>
                <th className="py-3 px-4 text-right">Disponible / Saldo</th>
                <th className="py-3 px-4 text-center">Estatus</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {/* Filas de Distribuidoras */}
              {activeTab !== 'creditos' &&
                filteredDistribuidores.map((dv) => (
                  <tr
                    key={`dv-${dv.noDist}`}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setActivePerfilDv(dv)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      DV #{dv.noDist}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block text-sm">
                        {dv.nombreDistribuidor}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Coord: {dv.coordinador} · Nivel {dv.nivel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {formatZonaLabel(dv.sucursal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${dv.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ${dv.disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {dv.estatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActivePerfilDv(dv)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
                          title="Abrir perfil completo"
                        >
                          Perfil
                        </button>
                        <button
                          onClick={() => setActiveRelacionDv(dv)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-xs"
                          title="Abrir relación de cobranza quincenal"
                        >
                          Relación
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* Filas de Créditos y Vales */}
              {activeTab !== 'distribuidores' &&
                filteredCreditos.map((c) => (
                  <tr key={`cr-${c.creditoId}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {c.creditoId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block text-sm">
                        {c.clienteNombre}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Vale #{c.noVale} · DV #{c.noDist} ({c.distribuidorNombre})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {formatZonaLabel(c.sucursal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${c.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      ${c.saldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {c.estatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-slate-400 font-mono text-[11px]">
                        {c.quincenasPlazo} quincenas
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relación de Cobranza Oficial Modal */}
      <RelacionCobranzaModal
        isOpen={!!activeRelacionDv}
        onClose={() => setActiveRelacionDv(null)}
        distribuidor={activeRelacionDv}
      />
    </div>
  );
}
