'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Search,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useCoreSync } from '@/context/CoreSyncContext';
import { buildSafeCsv } from '@/lib/utils/csv';

interface DistribuidorColocacion {
  noDist: number;
  nombre: string;
  sucursal: string;
  zona: string;
  nivel: 'DIAMANTE' | 'PLATINO' | 'ORO' | 'PLATA' | 'BRONCE';
  metaQuincenal: number;
  colocacionActual: number;
  valesColocados: number;
  cobranzaRecuperada: number;
  bonificacionGanada: number;
  colocacionQuincenaAnterior: number;
}

const INITIAL_COLOCACION: DistribuidorColocacion[] = [
  {
    noDist: 1002,
    nombre: 'BERTHA ALICIA TELLO LARA',
    sucursal: 'SALTILLO',
    zona: 'ZONA 1',
    nivel: 'DIAMANTE',
    metaQuincenal: 45000,
    colocacionActual: 48200,
    valesColocados: 12,
    cobranzaRecuperada: 10460,
    bonificacionGanada: 1882.80,
    colocacionQuincenaAnterior: 42000,
  },
  {
    noDist: 1012,
    nombre: 'OLGA ALICIA HERRERA AREVALO',
    sucursal: 'SALTILLO',
    zona: 'ZONA 4',
    nivel: 'DIAMANTE',
    metaQuincenal: 80000,
    colocacionActual: 84000,
    valesColocados: 19,
    cobranzaRecuperada: 16800,
    bonificacionGanada: 2688.00,
    colocacionQuincenaAnterior: 79000,
  },
  {
    noDist: 1003,
    nombre: 'LUCERO ESCAMILLA ORDOÑEZ',
    sucursal: 'SALTILLO',
    zona: 'ZONA 1',
    nivel: 'ORO',
    metaQuincenal: 25000,
    colocacionActual: 21500,
    valesColocados: 6,
    cobranzaRecuperada: 8200,
    bonificacionGanada: 1148.00,
    colocacionQuincenaAnterior: 24000,
  },
  {
    noDist: 1011,
    nombre: 'LAURA RODRIGUEZ MENDEZ',
    sucursal: 'SALTILLO',
    zona: 'ZONA 2',
    nivel: 'ORO',
    metaQuincenal: 20000,
    colocacionActual: 18900,
    valesColocados: 5,
    cobranzaRecuperada: 6500,
    bonificacionGanada: 1040.00,
    colocacionQuincenaAnterior: 17500,
  },
  {
    noDist: 1015,
    nombre: 'FLORENCIA ESPINOSA BETANCOURT',
    sucursal: 'MONCLOVA',
    zona: 'ZONA 1',
    nivel: 'PLATA',
    metaQuincenal: 15000,
    colocacionActual: 12400,
    valesColocados: 4,
    cobranzaRecuperada: 4100,
    bonificacionGanada: 492.00,
    colocacionQuincenaAnterior: 11000,
  },
];

export default function ReportesView() {
  const [activeTab, setActiveTab] = useState<'colocacion' | 'vintage' | 'comisiones'>('colocacion');
  const [searchFilter, setSearchFilter] = useState('');
  const [filterSucursal, setFilterSucursal] = useState<string>('TODAS');
  const [colocacionData] = useState<DistribuidorColocacion[]>(INITIAL_COLOCACION);

  // Filtered List
  const filteredColocacion = useMemo(() => {
    return colocacionData.filter((c) => {
      if (filterSucursal !== 'TODAS' && c.sucursal !== filterSucursal) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return c.nombre.toLowerCase().includes(q) || c.noDist.toString().includes(q) || c.zona.toLowerCase().includes(q);
      }
      return true;
    });
  }, [colocacionData, filterSucursal, searchFilter]);

  // Totals
  const totalColocacion = useMemo(() => colocacionData.reduce((acc, c) => acc + c.colocacionActual, 0), [colocacionData]);
  const totalMeta = useMemo(() => colocacionData.reduce((acc, c) => acc + c.metaQuincenal, 0), [colocacionData]);
  const totalVales = useMemo(() => colocacionData.reduce((acc, c) => acc + c.valesColocados, 0), [colocacionData]);
  const totalBonificaciones = useMemo(() => colocacionData.reduce((acc, c) => acc + c.bonificacionGanada, 0), [colocacionData]);
  const porcentajeCumplimiento = Math.round((totalColocacion / totalMeta) * 100);

  const handleExportCSV = () => {
    if (activeTab === 'colocacion') {
      const headers = [
        'No DV',
        'Distribuidora',
        'Sucursal',
        'Zona',
        'Nivel',
        'Meta Quincenal',
        'Colocación Quincenal',
        'Vales Emitidos',
        '% Cumplimiento',
        'Cobranza Recuperada',
        'Bonificación Pagada',
      ];
      const rows = colocacionData.map((c) => [
        c.noDist,
        c.nombre,
        c.sucursal,
        c.zona,
        c.nivel,
        c.metaQuincenal,
        c.colocacionActual,
        c.valesColocados,
        `${Math.round((c.colocacionActual / c.metaQuincenal) * 100)}%`,
        c.cobranzaRecuperada,
        c.bonificacionGanada,
      ]);
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_colocacion_dv_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Sucursal', 'Cartera Vigente', 'Cartera Vencida', 'Índice Morosidad IMOR', 'Colocación Quincenal'];
      const rows = [
        ['Saltillo Poniente', '850000', '35000', '4.1%', '48200'],
        ['Saltillo Oriente', '620000', '28000', '4.5%', '38000'],
        ['Torreón Centro', '490000', '32000', '6.5%', '28500'],
        ['Monclova', '310000', '18000', '5.8%', '16400'],
      ];
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_vintage_morosidad_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-5">
      {/* Top Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Colocación Quincenal</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              ${totalColocacion.toLocaleString('es-MX')}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8.4% vs Quincena Anterior</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cumplimiento de Meta</div>
            <div className="text-xl font-black text-emerald-700 mt-1">{porcentajeCumplimiento}%</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Meta: ${totalMeta.toLocaleString('es-MX')}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vales Colocados</div>
            <div className="text-xl font-black text-slate-900 mt-1">{totalVales} Vales</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Ticket Promedio: $4,077 MXN</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bonificaciones Pagadas</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              ${totalBonificaciones.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Escala Oficial 30-15</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs and Toolbar */}
      <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('colocacion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'colocacion'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Colocación por Distribuidor</span>
          </button>

          <button
            onClick={() => setActiveTab('vintage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'vintage'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Índice de Morosidad (IMOR)</span>
          </button>

          <button
            onClick={() => setActiveTab('comisiones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'comisiones'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Bonificaciones por Escala 30-15</span>
          </button>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exportar Reporte a Excel</span>
        </button>
      </div>

      {/* Main Table for Tab 1: Colocación por Distribuidor */}
      {activeTab === 'colocacion' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar por DV, nombre o zona..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <select
              value={filterSucursal}
              onChange={(e) => setFilterSucursal(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="TODAS">Todas las Sucursales</option>
              <option value="SALTILLO">Saltillo</option>
              <option value="MONCLOVA">Monclova</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
                <tr>
                  <th className="py-3 px-3.5">No. DV</th>
                  <th className="py-3 px-3.5">Distribuidora</th>
                  <th className="py-3 px-3.5">Sucursal / Zona</th>
                  <th className="py-3 px-3.5 text-center">Nivel</th>
                  <th className="py-3 px-3.5 text-right">Meta Quincenal</th>
                  <th className="py-3 px-3.5 text-right">Colocación Quincenal</th>
                  <th className="py-3 px-3.5 text-center">Vales</th>
                  <th className="py-3 px-3.5 text-center">% Cumplimiento</th>
                  <th className="py-3 px-3.5 text-right">Cobranza Recuperada</th>
                  <th className="py-3 px-3.5 text-right">Bonificación Ganada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredColocacion.map((c) => {
                  const pct = Math.round((c.colocacionActual / c.metaQuincenal) * 100);
                  return (
                    <tr key={c.noDist} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900">#{c.noDist}</td>
                      <td className="py-3 px-3.5 font-extrabold text-slate-900">{c.nombre}</td>
                      <td className="py-3 px-3.5 text-slate-600 font-medium">
                        {c.sucursal} • <span className="text-slate-400">{c.zona}</span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                          {c.nivel}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-500 text-right">
                        ${c.metaQuincenal.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-black text-slate-900 text-right text-xs">
                        ${c.colocacionActual.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-slate-700">{c.valesColocados}</td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 100 ? 'bg-emerald-500' : pct >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold text-[11px] ${
                              pct >= 100 ? 'text-emerald-700' : pct >= 80 ? 'text-blue-700' : 'text-amber-700'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-emerald-700 text-right">
                        ${c.cobranzaRecuperada.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-blue-700 text-right">
                        ${c.bonificacionGanada.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vintage e Índice de Morosidad */}
      {activeTab === 'vintage' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Índice de Cartera Vencida (ICV / IMOR) por Sucursal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { sucursal: 'Saltillo Poniente', cartera: '$850,000', vencida: '$35,000', imor: '4.1%', estatus: 'EXCELENTE' },
              { sucursal: 'Saltillo Oriente', cartera: '$620,000', vencida: '$28,000', imor: '4.5%', estatus: 'BUENO' },
              { sucursal: 'Torreón Centro', cartera: '$490,000', vencida: '$32,000', imor: '6.5%', estatus: 'REGULAR' },
              { sucursal: 'Monclova', cartera: '$310,000', vencida: '$18,000', imor: '5.8%', estatus: 'BUENO' },
            ].map((s) => (
              <div key={s.sucursal} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="font-black text-slate-900 text-sm">{s.sucursal}</div>
                <div className="text-xs text-slate-500">Cartera: <strong>{s.cartera}</strong></div>
                <div className="text-xs text-rose-600">Vencida: <strong>{s.vencida}</strong></div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">IMOR Oficial</span>
                  <span className="text-sm font-black text-blue-700 font-mono">{s.imor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Bonificaciones Escala 30-15 */}
      {activeTab === 'comisiones' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Resumen de Bonificaciones Liquidadas a Distribuidoras por Escala 30-15
          </h3>
          <p className="text-xs text-slate-500">
            Reglas oficiales auditadas: El monto se acredita inmediatamente al crédito quincenal de la Distribuidora.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">Élite D-AAA (18% - 10%)</div>
              <div className="text-xl font-black text-emerald-900">$4,570.80 MXN</div>
              <div className="text-[10px] text-emerald-700">2 Distribuidoras beneficiadas</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
              <div className="text-[11px] font-bold text-blue-800 uppercase">D-AA & E-AAA (16% - 8%)</div>
              <div className="text-xl font-black text-blue-900">$2,188.00 MXN</div>
              <div className="text-[10px] text-blue-700">2 Distribuidoras beneficiadas</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-slate-700 uppercase">Emprendedora E-A (12% - 4%)</div>
              <div className="text-xl font-black text-slate-900">$492.00 MXN</div>
              <div className="text-[10px] text-slate-500">1 Distribuidora beneficiada</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
