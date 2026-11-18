'use client';

import React, { useState, useMemo } from 'react';
import { UserSession } from '@/types/auth';
import {
  TotalesCarteraSucursalItem,
  INITIAL_TOTALES_CARTERA,
} from '@/lib/data/totalesCarteraData';
import {
  PieChart,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Building2,
  DollarSign,
  AlertTriangle,
  CreditCard,
  Wallet,
  X,
  ChevronRight,
  SlidersHorizontal,
  Check,
  TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

interface TotalesCarteraViewProps {
  currentUser?: UserSession | null;
  onNavigateToGlobal?: (sucursal?: string) => void;
}

export default function TotalesCarteraView({
  currentUser,
  onNavigateToGlobal,
}: TotalesCarteraViewProps) {
  const [data, setData] = useState<TotalesCarteraSucursalItem[]>(INITIAL_TOTALES_CARTERA);
  const [fechaVencimiento, setFechaVencimiento] = useState('2026-11-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Columnas visibles configurables
  const [visibleColumns, setVisibleColumns] = useState({
    numeroDistribuidores: true,
    importeTotal: true,
    saldoActual: true,
    saldoAtrasado: true,
    capital: true,
    interes: true,
    capitalPagado: true,
    lineaCredito: true,
    lineaCreditoDisp: true,
    lineaAdicional: true,
    seguro: true,
    capitalAtrasado: true,
    interesAtrasado: true,
    comisionAtrasada: false,
    seguroAtrasado: true,
    cargoAtrasado: false,
    ivaAtrasado: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtrado por buscador
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.sucursal.toLowerCase().includes(q) ||
        item.sucursalId.toString().includes(q)
    );
  }, [data, searchQuery]);

  // Totales Generales
  const totales = useMemo(() => {
    return filteredData.reduce(
      (acc, s) => ({
        distribuidores: acc.distribuidores + s.numeroDistribuidores,
        importeTotal: acc.importeTotal + s.importeTotal,
        saldoActual: acc.saldoActual + s.saldoActual,
        saldoAtrasado: acc.saldoAtrasado + s.saldoAtrasado,
        capital: acc.capital + s.capital,
        interes: acc.interes + s.interes,
        capitalPagado: acc.capitalPagado + s.capitalPagado,
        lineaCredito: acc.lineaCredito + s.lineaCredito,
        lineaCreditoDisp: acc.lineaCreditoDisp + s.lineaCreditoDisp,
        lineaAdicional: acc.lineaAdicional + s.lineaAdicional,
        seguro: acc.seguro + s.seguro,
        capitalAtrasado: acc.capitalAtrasado + s.capitalAtrasado,
        interesAtrasado: acc.interesAtrasado + s.interesAtrasado,
        comisionAtrasada: acc.comisionAtrasada + s.comisionAtrasada,
        seguroAtrasado: acc.seguroAtrasado + s.seguroAtrasado,
        cargoAtrasado: acc.cargoAtrasado + s.cargoAtrasado,
        ivaAtrasado: acc.ivaAtrasado + s.ivaAtrasado,
      }),
      {
        distribuidores: 0,
        importeTotal: 0,
        saldoActual: 0,
        saldoAtrasado: 0,
        capital: 0,
        interes: 0,
        capitalPagado: 0,
        lineaCredito: 0,
        lineaCreditoDisp: 0,
        lineaAdicional: 0,
        seguro: 0,
        capitalAtrasado: 0,
        interesAtrasado: 0,
        comisionAtrasada: 0,
        seguroAtrasado: 0,
        cargoAtrasado: 0,
        ivaAtrasado: 0,
      }
    );
  }, [filteredData]);

  // Exportar a Excel (SheetJS)
  const handleExportExcel = () => {
    const exportRows = filteredData.map((s) => ({
      'Sucursal ID': s.sucursalId,
      Sucursal: s.sucursal,
      'No. Distribuidores': s.numeroDistribuidores,
      'Importe Total': s.importeTotal,
      'Saldo Actual': s.saldoActual,
      'Saldo Atrasado': s.saldoAtrasado,
      Capital: s.capital,
      Interés: s.interes,
      'Capital Pagado': s.capitalPagado,
      'Línea Crédito': s.lineaCredito,
      'Línea Crédito Disp.': s.lineaCreditoDisp,
      'Línea Adicional': s.lineaAdicional,
      Seguro: s.seguro,
      'Capital Atrasado': s.capitalAtrasado,
      'Interés Atrasado': s.interesAtrasado,
      'Comisión Atrasada': s.comisionAtrasada,
      'Seguro Atrasado': s.seguroAtrasado,
      'Cargo Atrasado': s.cargoAtrasado,
      'IVA Atrasado': s.ivaAtrasado,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Totales_Cartera');
    XLSX.writeFile(wb, `totales_cartera_${fechaVencimiento}.xlsx`);
    showToast('✓ Archivo Excel descargado exitosamente.');
  };

  return (
    <div className="flex-1 bg-[#f8fafc] text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-3 sm:p-5 lg:p-6 space-y-4">
      {/* ======================================================== */}
      {/* 1. ENCABEZADO Y BARRA SUPERIOR DE ACCIONES               */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Cartera Central
                </span>
                <span className="text-[11px] text-slate-400">
                  Consolidado: <strong className="text-slate-700 font-bold">{filteredData.length} Sucursales</strong>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Totales De Cartera
              </h1>
            </div>
          </div>

          {/* Selector de Fecha de Vencimiento */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-bold">Fecha Vencimiento:</span>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="bg-transparent font-mono font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => showToast('Totales de cartera actualizados.')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Actualizar</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar a Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsColumnModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Personalizar Columnas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TARJETAS DE KPIS MACRO DE TOTALES                     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Importe Total Colocado
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-0.5">
              {formatMoney(totales.importeTotal)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {totales.distribuidores.toLocaleString()} distribuidores activos
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/80">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Actual Vigente
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono mt-0.5">
              {formatMoney(totales.saldoActual)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              Capital Base: {formatMoney(totales.capital)}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/80">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Atrasado / Mora
            </span>
            <div className="text-lg sm:text-xl font-black text-rose-700 font-mono mt-0.5">
              {formatMoney(totales.saldoAtrasado)}
            </div>
            <span className="text-[10px] text-rose-600 font-bold">
              Capital en mora: {formatMoney(totales.capitalAtrasado)}
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200/80">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Línea de Crédito Global
            </span>
            <div className="text-lg sm:text-xl font-black text-indigo-700 font-mono mt-0.5">
              {formatMoney(totales.lineaCredito)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Disponible: {formatMoney(totales.lineaCreditoDisp)}
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/80">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BARRA DE BÚSQUEDA Y FILTRADO                          */}
      {/* ======================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por Sucursal o ID de Sucursal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Haz clic en cualquier sucursal para consultar el detalle de su cartera.
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA PRINCIPAL DE TOTALES DE CARTERA POR SUCURSAL    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200 select-none z-10">
              <tr>
                <th className="px-3 py-2.5 text-center">ID</th>
                <th className="px-3 py-2.5">Sucursal</th>
                {visibleColumns.numeroDistribuidores && <th className="px-3 py-2.5 text-center">No. Distribuidores</th>}
                {visibleColumns.importeTotal && <th className="px-3 py-2.5 text-right">Importe Total</th>}
                {visibleColumns.saldoActual && <th className="px-3 py-2.5 text-right">Saldo Actual</th>}
                {visibleColumns.saldoAtrasado && <th className="px-3 py-2.5 text-right">Saldo Atrasado</th>}
                {visibleColumns.capital && <th className="px-3 py-2.5 text-right">Capital</th>}
                {visibleColumns.interes && <th className="px-3 py-2.5 text-right">Interés</th>}
                {visibleColumns.capitalPagado && <th className="px-3 py-2.5 text-right">Capital Pagado</th>}
                {visibleColumns.lineaCredito && <th className="px-3 py-2.5 text-right">Línea Crédito</th>}
                {visibleColumns.lineaCreditoDisp && <th className="px-3 py-2.5 text-right">Línea Disp.</th>}
                {visibleColumns.lineaAdicional && <th className="px-3 py-2.5 text-right">Línea Adicional</th>}
                {visibleColumns.seguro && <th className="px-3 py-2.5 text-right">Seguro</th>}
                {visibleColumns.capitalAtrasado && <th className="px-3 py-2.5 text-right text-rose-700">Capital Atrasado</th>}
                {visibleColumns.interesAtrasado && <th className="px-3 py-2.5 text-right text-rose-700">Interés Atrasado</th>}
                {visibleColumns.comisionAtrasada && <th className="px-3 py-2.5 text-right">Comisión Atrasada</th>}
                {visibleColumns.seguroAtrasado && <th className="px-3 py-2.5 text-right">Seguro Atrasado</th>}
                {visibleColumns.cargoAtrasado && <th className="px-3 py-2.5 text-right">Cargo Atrasado</th>}
                {visibleColumns.ivaAtrasado && <th className="px-3 py-2.5 text-right">IVA Atrasado</th>}
                <th className="px-3 py-2.5 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-12 text-center text-slate-400 font-sans">
                    No se encontraron sucursales que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredData.map((s) => {
                  const isSelected = selectedSucursalId === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSucursalId(s.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 font-semibold'
                          : 'hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      {/* ID */}
                      <td className="px-3 py-2 text-center text-slate-500 font-bold">{s.sucursalId}</td>

                      {/* Sucursal */}
                      <td className="px-3 py-2 font-sans font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{s.sucursal}</span>
                        </div>
                      </td>

                      {/* No. Distribuidores */}
                      {visibleColumns.numeroDistribuidores && (
                        <td className="px-3 py-2 text-center font-bold text-slate-800">
                          {s.numeroDistribuidores}
                        </td>
                      )}

                      {/* Importe Total */}
                      {visibleColumns.importeTotal && (
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {formatMoney(s.importeTotal)}
                        </td>
                      )}

                      {/* Saldo Actual */}
                      {visibleColumns.saldoActual && (
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {formatMoney(s.saldoActual)}
                        </td>
                      )}

                      {/* Saldo Atrasado */}
                      {visibleColumns.saldoAtrasado && (
                        <td className={`px-3 py-2 text-right font-bold ${s.saldoAtrasado > 0 ? 'text-rose-600 bg-rose-50/40' : 'text-slate-500'}`}>
                          {formatMoney(s.saldoAtrasado)}
                        </td>
                      )}

                      {/* Capital */}
                      {visibleColumns.capital && (
                        <td className="px-3 py-2 text-right text-slate-700">{formatMoney(s.capital)}</td>
                      )}

                      {/* Interes */}
                      {visibleColumns.interes && (
                        <td className="px-3 py-2 text-right text-slate-600">{formatMoney(s.interes)}</td>
                      )}

                      {/* Capital Pagado */}
                      {visibleColumns.capitalPagado && (
                        <td className="px-3 py-2 text-right text-emerald-700 font-bold">{formatMoney(s.capitalPagado)}</td>
                      )}

                      {/* Linea Credito */}
                      {visibleColumns.lineaCredito && (
                        <td className="px-3 py-2 text-right text-slate-700">{formatMoney(s.lineaCredito)}</td>
                      )}

                      {/* Linea Credito Disp */}
                      {visibleColumns.lineaCreditoDisp && (
                        <td className="px-3 py-2 text-right text-emerald-700 font-bold">{formatMoney(s.lineaCreditoDisp)}</td>
                      )}

                      {/* Linea Adicional */}
                      {visibleColumns.lineaAdicional && (
                        <td className="px-3 py-2 text-right text-slate-700">{formatMoney(s.lineaAdicional)}</td>
                      )}

                      {/* Seguro */}
                      {visibleColumns.seguro && (
                        <td className="px-3 py-2 text-right text-slate-600">{formatMoney(s.seguro)}</td>
                      )}

                      {/* Capital Atrasado */}
                      {visibleColumns.capitalAtrasado && (
                        <td className="px-3 py-2 text-right text-rose-700 font-bold">{formatMoney(s.capitalAtrasado)}</td>
                      )}

                      {/* Interes Atrasado */}
                      {visibleColumns.interesAtrasado && (
                        <td className="px-3 py-2 text-right text-rose-700 font-bold">{formatMoney(s.interesAtrasado)}</td>
                      )}

                      {/* Comision Atrasada */}
                      {visibleColumns.comisionAtrasada && (
                        <td className="px-3 py-2 text-right text-slate-400">{formatMoney(s.comisionAtrasada)}</td>
                      )}

                      {/* Seguro Atrasado */}
                      {visibleColumns.seguroAtrasado && (
                        <td className="px-3 py-2 text-right text-slate-600">{formatMoney(s.seguroAtrasado)}</td>
                      )}

                      {/* Cargo Atrasado */}
                      {visibleColumns.cargoAtrasado && (
                        <td className="px-3 py-2 text-right text-slate-400">{formatMoney(s.cargoAtrasado)}</td>
                      )}

                      {/* IVA Atrasado */}
                      {visibleColumns.ivaAtrasado && (
                        <td className="px-3 py-2 text-right text-slate-600">{formatMoney(s.ivaAtrasado)}</td>
                      )}

                      {/* Acciones */}
                      <td className="px-3 py-2 text-center font-sans">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateToGlobal) {
                              onNavigateToGlobal(s.sucursal);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold inline-flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
                          title={`Ver cartera detallada de ${s.sucursal}`}
                        >
                          <span>Ver Cartera</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Fila de Totales Generales */}
            <tfoot className="bg-slate-100 font-extrabold font-mono text-xs border-t-2 border-slate-300 text-slate-950">
              <tr>
                <td colSpan={2} className="px-4 py-2.5 font-sans text-right uppercase tracking-wider text-slate-700">
                  Totales de Cartera:
                </td>
                {visibleColumns.numeroDistribuidores && (
                  <td className="px-3 py-2.5 text-center text-slate-900 font-bold">
                    {totales.distribuidores.toLocaleString()}
                  </td>
                )}
                {visibleColumns.importeTotal && (
                  <td className="px-3 py-2.5 text-right text-slate-950">{formatMoney(totales.importeTotal)}</td>
                )}
                {visibleColumns.saldoActual && (
                  <td className="px-3 py-2.5 text-right text-slate-950">{formatMoney(totales.saldoActual)}</td>
                )}
                {visibleColumns.saldoAtrasado && (
                  <td className="px-3 py-2.5 text-right text-rose-700 bg-rose-50/70">{formatMoney(totales.saldoAtrasado)}</td>
                )}
                {visibleColumns.capital && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.capital)}</td>
                )}
                {visibleColumns.interes && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.interes)}</td>
                )}
                {visibleColumns.capitalPagado && (
                  <td className="px-3 py-2.5 text-right text-emerald-700">{formatMoney(totales.capitalPagado)}</td>
                )}
                {visibleColumns.lineaCredito && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.lineaCredito)}</td>
                )}
                {visibleColumns.lineaCreditoDisp && (
                  <td className="px-3 py-2.5 text-right text-emerald-700">{formatMoney(totales.lineaCreditoDisp)}</td>
                )}
                {visibleColumns.lineaAdicional && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.lineaAdicional)}</td>
                )}
                {visibleColumns.seguro && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.seguro)}</td>
                )}
                {visibleColumns.capitalAtrasado && (
                  <td className="px-3 py-2.5 text-right text-rose-700">{formatMoney(totales.capitalAtrasado)}</td>
                )}
                {visibleColumns.interesAtrasado && (
                  <td className="px-3 py-2.5 text-right text-rose-700">{formatMoney(totales.interesAtrasado)}</td>
                )}
                {visibleColumns.comisionAtrasada && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.comisionAtrasada)}</td>
                )}
                {visibleColumns.seguroAtrasado && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.seguroAtrasado)}</td>
                )}
                {visibleColumns.cargoAtrasado && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.cargoAtrasado)}</td>
                )}
                {visibleColumns.ivaAtrasado && (
                  <td className="px-3 py-2.5 text-right">{formatMoney(totales.ivaAtrasado)}</td>
                )}
                <td className="px-3 py-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: PERSONALIZAR COLUMNAS                             */}
      {/* ======================================================== */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Personalizar Columnas Visibles</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-2.5 text-xs max-h-[60vh] overflow-y-auto">
              {Object.entries(visibleColumns).map(([key, val]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer"
                >
                  <span className="font-semibold text-slate-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
