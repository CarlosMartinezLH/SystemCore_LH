'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  FileText,
  Landmark,
  X,
  Sparkles,
} from 'lucide-react';
import { buildSafeCsv } from '@/lib/utils/csv';

interface AsientoRenglon {
  cuenta: string;
  nombreCuenta: string;
  debe: number;
  haber: number;
}

interface PolizaContable {
  id: string;
  folio: string;
  tipo: 'INGRESO' | 'EGRESO' | 'DIARIO';
  fecha: string;
  concepto: string;
  referenciaOperacion: string;
  debeTotal: number;
  haberTotal: number;
  estatus: 'CONTABILIZADA_AUTOMATICA';
  asientos: AsientoRenglon[];
}

const INITIAL_POLIZAS: PolizaContable[] = [
  {
    id: 'pol-001',
    folio: 'POL-ING-2026-11-0982',
    tipo: 'INGRESO',
    fecha: '09/11/2026',
    concepto: 'Cobranza SPEI STP Corte 15 - DV #1002 Bertha Alicia Tello Lara',
    referenciaOperacion: '2026110940012BBER00001002',
    debeTotal: 10460.0,
    haberTotal: 10460.0,
    estatus: 'CONTABILIZADA_AUTOMATICA',
    asientos: [
      { cuenta: '102-01-001', nombreCuenta: 'Bancos - STP Concentradora Cobranza (646)', debe: 8577.2, haber: 0 },
      { cuenta: '501-04-001', nombreCuenta: 'Gastos Financieros - Bonificaciones Pronto Pago DVs (18%)', debe: 1882.8, haber: 0 },
      { cuenta: '105-02-1002', nombreCuenta: 'Cartera de Crédito por Cobrar - DV #1002', debe: 0, haber: 10460.0 },
    ],
  },
  {
    id: 'pol-002',
    folio: 'POL-ING-2026-11-0983',
    tipo: 'INGRESO',
    fecha: '09/11/2026',
    concepto: 'Cobranza SPEI STP Corte 15 - DV #1012 Olga Alicia Herrera Arévalo',
    referenciaOperacion: '2026110940072BNOR00001012',
    debeTotal: 16800.0,
    haberTotal: 16800.0,
    estatus: 'CONTABILIZADA_AUTOMATICA',
    asientos: [
      { cuenta: '102-01-001', nombreCuenta: 'Bancos - STP Concentradora Cobranza (646)', debe: 14112.0, haber: 0 },
      { cuenta: '501-04-001', nombreCuenta: 'Gastos Financieros - Bonificaciones Pronto Pago DVs (16%)', debe: 2688.0, haber: 0 },
      { cuenta: '105-02-1012', nombreCuenta: 'Cartera de Crédito por Cobrar - DV #1012', debe: 0, haber: 16800.0 },
    ],
  },
  {
    id: 'pol-003',
    folio: 'POL-EGR-2026-11-0412',
    tipo: 'EGRESO',
    fecha: '09/11/2026',
    concepto: 'Desembolso Dispersión STP Vale #V-172809 a José Carlos Martínez Mayorga',
    referenciaOperacion: 'STP844202611059912',
    debeTotal: 6500.0,
    haberTotal: 6500.0,
    estatus: 'CONTABILIZADA_AUTOMATICA',
    asientos: [
      { cuenta: '105-01-001', nombreCuenta: 'Cartera de Crédito Otorgada - Clientes Finales', debe: 6500.0, haber: 0 },
      { cuenta: '102-01-002', nombreCuenta: 'Bancos - STP Dispersión Saliente', debe: 0, haber: 6500.0 },
    ],
  },
  {
    id: 'pol-004',
    folio: 'POL-EGR-2026-11-0413',
    tipo: 'EGRESO',
    fecha: '08/11/2026',
    concepto: 'Desembolso Dispersión STP Vale #V-50491 a María Guadalupe Sánchez',
    referenciaOperacion: 'LAN2026110400192',
    debeTotal: 6000.0,
    haberTotal: 6000.0,
    estatus: 'CONTABILIZADA_AUTOMATICA',
    asientos: [
      { cuenta: '105-01-001', nombreCuenta: 'Cartera de Crédito Otorgada - Clientes Finales', debe: 6000.0, haber: 0 },
      { cuenta: '102-01-002', nombreCuenta: 'Bancos - STP Dispersión Saliente', debe: 0, haber: 6000.0 },
    ],
  },
  {
    id: 'pol-005',
    folio: 'POL-DIA-2026-11-0105',
    tipo: 'DIARIO',
    fecha: '07/11/2026',
    concepto: 'Devengación de Intereses Ordinarios Quincena Noviembre 2026',
    referenciaOperacion: 'CORTE-2026-11-1',
    debeTotal: 42500.0,
    haberTotal: 42500.0,
    estatus: 'CONTABILIZADA_AUTOMATICA',
    asientos: [
      { cuenta: '105-03-001', nombreCuenta: 'Intereses por Cobrar Cartera Vigente', debe: 42500.0, haber: 0 },
      { cuenta: '401-01-001', nombreCuenta: 'Ingresos por Intereses Ordinarios de Crédito', debe: 0, haber: 42500.0 },
    ],
  },
];

export default function ContabilidadView() {
  const [activeTab, setActiveTab] = useState<'polizas' | 'balanza' | 'conciliacion'>('polizas');
  const [polizas] = useState<PolizaContable[]>(INITIAL_POLIZAS);
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPoliza, setSelectedPoliza] = useState<PolizaContable | null>(null);

  // Filtered List
  const filteredPolizas = useMemo(() => {
    return polizas.filter((p) => {
      if (filterTipo !== 'TODOS' && p.tipo !== filterTipo) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          p.folio.toLowerCase().includes(q) ||
          p.concepto.toLowerCase().includes(q) ||
          p.referenciaOperacion.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [polizas, filterTipo, searchFilter]);

  // Totals
  const totalIngresos = useMemo(
    () => polizas.filter((p) => p.tipo === 'INGRESO').reduce((acc, p) => acc + p.debeTotal, 0),
    [polizas]
  );
  const totalEgresos = useMemo(
    () => polizas.filter((p) => p.tipo === 'EGRESO').reduce((acc, p) => acc + p.debeTotal, 0),
    [polizas]
  );

  const handleExportCSV = () => {
    if (activeTab === 'polizas') {
      const headers = ['Folio Póliza', 'Tipo', 'Fecha', 'Concepto', 'Referencia Operación', 'Debe Total', 'Haber Total', 'Estatus'];
      const rows = polizas.map((p) => [
        p.folio,
        p.tipo,
        p.fecha,
        p.concepto,
        p.referenciaOperacion,
        p.debeTotal,
        p.haberTotal,
        p.estatus,
      ]);
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `polizas_contables_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Cuenta', 'Nombre de Cuenta', 'Saldo Inicial', 'Cargos Debe', 'Abonos Haber', 'Saldo Final'];
      const rows = [
        ['102-01-001', 'Bancos Concentradora STP', '1500000.00', '27260.00', '12500.00', '1514760.00'],
        ['105-01-001', 'Cartera de Crédito Otorgada', '3200000.00', '12500.00', '27260.00', '3185240.00'],
        ['501-04-001', 'Bonificaciones Pronto Pago DVs', '45200.00', '4570.80', '0.00', '49770.80'],
      ];
      const csvContent = buildSafeCsv(headers, rows);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `balanza_comprobacion_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-5">
      {/* Top Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cobranza Contabilizada</div>
            <div className="text-xl font-black text-emerald-700 mt-1">
              ${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Pólizas de Ingreso SPEI</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dispersiones Colocación</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              ${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Pólizas de Egreso STP</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cuadratura Contable</div>
            <div className="text-xl font-black text-slate-900 mt-1">100.0%</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Debe = Haber (Sumas Iguales)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Conciliación STP (646)</div>
            <div className="text-xl font-black text-slate-900 mt-1">Diferencia $0.00</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Cuentas cuadradas en vivo</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs and Toolbar */}
      <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('polizas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'polizas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Pólizas en Línea</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-white/20 text-white">
              {polizas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('balanza')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'balanza'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Balanza de Comprobación</span>
          </button>

          <button
            onClick={() => setActiveTab('conciliacion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'conciliacion'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Conciliación STP</span>
          </button>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exportar Pólizas a Excel</span>
        </button>
      </div>

      {/* Main Table for Tab 1: Pólizas Contables */}
      {activeTab === 'polizas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar por folio, concepto o referencia..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="TODOS">Todos los Tipos de Póliza</option>
              <option value="INGRESO">Pólizas de Ingreso (Cobranza)</option>
              <option value="EGRESO">Pólizas de Egreso (Dispersión)</option>
              <option value="DIARIO">Pólizas de Diario</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
                <tr>
                  <th className="py-3 px-3.5">Acción</th>
                  <th className="py-3 px-3.5">Folio Póliza</th>
                  <th className="py-3 px-3.5 text-center">Tipo</th>
                  <th className="py-3 px-3.5">Fecha</th>
                  <th className="py-3 px-3.5">Concepto Contable</th>
                  <th className="py-3 px-3.5">Referencia de Operación</th>
                  <th className="py-3 px-3.5 text-right">Cargos (Debe)</th>
                  <th className="py-3 px-3.5 text-right">Abonos (Haber)</th>
                  <th className="py-3 px-3.5 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredPolizas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3.5">
                      <button
                        onClick={() => setSelectedPoliza(p)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition flex items-center gap-1 border border-blue-200 shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Asiento</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">{p.folio}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          p.tipo === 'INGRESO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.tipo === 'EGRESO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600">{p.fecha}</td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900 max-w-sm truncate">{p.concepto}</td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500">{p.referenciaOperacion}</td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 text-right">
                      ${p.debeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 text-right">
                      ${p.haberTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Automática
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Balanza de Comprobación */}
      {activeTab === 'balanza' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Balanza de Comprobación Contable Quincenal</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Cuenta</th>
                  <th className="py-2.5 px-3">Nombre de Cuenta</th>
                  <th className="py-2.5 px-3 text-right">Saldo Inicial</th>
                  <th className="py-2.5 px-3 text-right">Cargos Debe</th>
                  <th className="py-2.5 px-3 text-right">Abonos Haber</th>
                  <th className="py-2.5 px-3 text-right">Saldo Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-blue-700">102-01-001</td>
                  <td className="py-2.5 px-3 font-sans font-semibold">Bancos Concentradora STP (646)</td>
                  <td className="py-2.5 px-3 text-right">$1,500,000.00</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">$22,689.20</td>
                  <td className="py-2.5 px-3 text-right text-rose-700">$12,500.00</td>
                  <td className="py-2.5 px-3 text-right font-black">$1,510,189.20</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-blue-700">105-02-000</td>
                  <td className="py-2.5 px-3 font-sans font-semibold">Cartera de Crédito por Cobrar Distribuidoras</td>
                  <td className="py-2.5 px-3 text-right">$3,200,000.00</td>
                  <td className="py-2.5 px-3 text-right">$12,500.00</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">$27,260.00</td>
                  <td className="py-2.5 px-3 text-right font-black">$3,185,240.00</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-blue-700">501-04-001</td>
                  <td className="py-2.5 px-3 font-sans font-semibold">Bonificaciones Concedidas por Pronto Pago (30-15)</td>
                  <td className="py-2.5 px-3 text-right">$45,200.00</td>
                  <td className="py-2.5 px-3 text-right text-blue-700 font-bold">$4,570.80</td>
                  <td className="py-2.5 px-3 text-right">$0.00</td>
                  <td className="py-2.5 px-3 text-right font-black">$49,770.80</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Conciliación Bancaria STP */}
      {activeTab === 'conciliacion' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Conciliación Bancaria STP (Institución 646)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Saldo en Extracto STP</div>
              <div className="text-xl font-black text-slate-900 mt-1">$1,510,189.20 MXN</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Saldo en Libros Core</div>
              <div className="text-xl font-black text-slate-900 mt-1">$1,510,189.20 MXN</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-emerald-800 font-bold uppercase">Diferencia de Conciliación</div>
              <div className="text-xl font-black text-emerald-700 mt-1">$0.00 MXN (100% Cuadrado)</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Asiento Contable */}
      {selectedPoliza && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span>Póliza Contable: {selectedPoliza.folio}</span>
                </h3>
                <p className="text-[11px] text-slate-500">{selectedPoliza.concepto}</p>
              </div>
              <button
                onClick={() => setSelectedPoliza(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Cuenta</th>
                      <th className="py-2 px-3 font-sans">Concepto de Cuenta</th>
                      <th className="py-2 px-3 text-right">Debe ($)</th>
                      <th className="py-2 px-3 text-right">Haber ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPoliza.asientos.map((a, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold text-blue-700">{a.cuenta}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{a.nombreCuenta}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {a.debe > 0 ? `$${a.debe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {a.haber > 0 ? `$${a.haber.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-black">
                    <tr>
                      <td colSpan={2} className="py-2 px-3 font-sans uppercase text-right">Sumas Iguales:</td>
                      <td className="py-2 px-3 text-right text-emerald-700">
                        ${selectedPoliza.debeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-700">
                        ${selectedPoliza.haberTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex justify-between pt-1">
                <span>Referencia: {selectedPoliza.referenciaOperacion}</span>
                <span>Fecha Contabilización: {selectedPoliza.fecha}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPoliza(null)}
                className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
              >
                Cerrar Póliza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
