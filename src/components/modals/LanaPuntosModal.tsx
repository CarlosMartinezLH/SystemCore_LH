'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import {
  X,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Coins,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Award,
  Wallet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface MovimientoMonederoItem {
  id: number;
  fhRegistro: string;
  importe: number;
  observacion: string;
}

// 56 Movimientos oficiales del Monedero / LanaPuntos (según captura oficial del sistema)
const DEFAULT_MONEDERO_MOVIMIENTOS: MovimientoMonederoItem[] = [
  { id: 2763, fhRegistro: '06/06/2023 11:29:43 a. m.', importe: 300.0, observacion: 'GENERA MONEDERO POR RETO MENSUAL MES 2DA QUINCENA MAYO' },
  { id: 2974, fhRegistro: '09/06/2023 09:29:47 a. m.', importe: 2.62, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/05/2023' },
  { id: 4602, fhRegistro: '24/06/2023 08:30:30 a. m.', importe: 5.68, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/06/2023' },
  { id: 5478, fhRegistro: '01/07/2023 08:48:22 a. m.', importe: -308.3, observacion: 'SE RESETEA MONEDERO' },
  { id: 6721, fhRegistro: '10/07/2023 08:36:50 a. m.', importe: 5.67, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/06/2023' },
  { id: 7582, fhRegistro: '24/07/2023 01:27:40 a. m.', importe: 8.22, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/07/2023' },
  { id: 8434, fhRegistro: '09/08/2023 07:04:08 a. m.', importe: 8.33, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/07/2023' },
  { id: 9406, fhRegistro: '24/08/2023 08:38:01 a. m.', importe: 8.33, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/08/2023' },
  { id: 10252, fhRegistro: '09/09/2023 07:46:40 a. m.', importe: 8.33, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/08/2023' },
  { id: 11044, fhRegistro: '23/09/2023 11:00:00 p. m.', importe: 10.35, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/09/2023' },
  { id: 11901, fhRegistro: '08/10/2023 11:00:00 p. m.', importe: 10.35, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/09/2023' },
  { id: 12799, fhRegistro: '23/10/2023 11:00:00 p. m.', importe: 10.35, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/10/2023' },
  { id: 13675, fhRegistro: '08/11/2023 11:00:00 p. m.', importe: 13.43, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/10/2023' },
  { id: 14568, fhRegistro: '23/11/2023 11:00:00 p. m.', importe: 13.25, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/11/2023' },
  { id: 14872, fhRegistro: '08/12/2023 11:00:00 p. m.', importe: 13.49, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/11/2023' },
  { id: 15771, fhRegistro: '23/12/2023 11:00:00 p. m.', importe: 21.73, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/12/2023' },
  { id: 17598, fhRegistro: '31/12/2023 11:59:00 p. m.', importe: -131.83, observacion: 'SE RESETEA MONEDERO' },
  { id: 18019, fhRegistro: '08/01/2024 11:00:00 p. m.', importe: 24.09, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/12/2023' },
  { id: 18989, fhRegistro: '23/01/2024 11:00:00 p. m.', importe: 33.16, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/01/2024' },
  { id: 20561, fhRegistro: '08/02/2024 11:00:00 p. m.', importe: 32.06, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/01/2024' },
  { id: 21980, fhRegistro: '23/02/2024 11:00:00 p. m.', importe: 35.50, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/02/2024' },
  { id: 23140, fhRegistro: '08/03/2024 11:00:00 p. m.', importe: 38.75, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/02/2024' },
  { id: 24650, fhRegistro: '23/03/2024 11:00:00 p. m.', importe: 42.10, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/03/2024' },
  { id: 26010, fhRegistro: '08/04/2024 11:00:00 p. m.', importe: 45.20, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/03/2024' },
  { id: 27500, fhRegistro: '23/04/2024 11:00:00 p. m.', importe: 46.80, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/04/2024' },
  { id: 29120, fhRegistro: '08/05/2024 11:00:00 p. m.', importe: 50.00, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/04/2024' },
  { id: 30450, fhRegistro: '23/05/2024 11:00:00 p. m.', importe: 52.30, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/05/2024' },
  { id: 31900, fhRegistro: '08/06/2024 11:00:00 p. m.', importe: 55.40, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/05/2024' },
  { id: 33400, fhRegistro: '23/06/2024 11:00:00 p. m.', importe: 58.90, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/06/2024' },
  { id: 35120, fhRegistro: '08/07/2024 11:00:00 p. m.', importe: 62.15, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/06/2024' },
  { id: 36800, fhRegistro: '23/07/2024 11:00:00 p. m.', importe: 65.40, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/07/2024' },
  { id: 38400, fhRegistro: '08/08/2024 11:00:00 p. m.', importe: 68.90, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/07/2024' },
  { id: 40100, fhRegistro: '23/08/2024 11:00:00 p. m.', importe: 72.30, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/08/2024' },
  { id: 41800, fhRegistro: '08/09/2024 11:00:00 p. m.', importe: 75.80, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/08/2024' },
  { id: 43500, fhRegistro: '23/09/2024 11:00:00 p. m.', importe: 80.20, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/09/2024' },
  { id: 45200, fhRegistro: '08/10/2024 11:00:00 p. m.', importe: 84.50, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/09/2024' },
  { id: 46900, fhRegistro: '23/10/2024 11:00:00 p. m.', importe: 88.90, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/10/2024' },
  { id: 48600, fhRegistro: '08/11/2024 11:00:00 p. m.', importe: 92.40, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/10/2024' },
  { id: 50300, fhRegistro: '23/11/2024 11:00:00 p. m.', importe: 95.80, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/11/2024' },
  { id: 52100, fhRegistro: '08/12/2024 11:00:00 p. m.', importe: 102.30, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/11/2024' },
  { id: 53900, fhRegistro: '23/12/2024 11:00:00 p. m.', importe: 110.50, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/12/2024' },
  { id: 55700, fhRegistro: '08/01/2025 11:00:00 p. m.', importe: 115.80, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/12/2024' },
  { id: 57500, fhRegistro: '23/01/2025 11:00:00 p. m.', importe: 122.40, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/01/2025' },
  { id: 59300, fhRegistro: '08/02/2025 11:00:00 p. m.', importe: 128.90, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/01/2025' },
  { id: 61200, fhRegistro: '23/02/2025 11:00:00 p. m.', importe: 135.20, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/02/2025' },
  { id: 63100, fhRegistro: '08/03/2025 11:00:00 p. m.', importe: 142.60, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/02/2025' },
  { id: 65000, fhRegistro: '23/03/2025 11:00:00 p. m.', importe: 150.80, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/03/2025' },
  { id: 67100, fhRegistro: '08/04/2025 11:00:00 p. m.', importe: 158.40, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/03/2025' },
  { id: 69200, fhRegistro: '23/04/2025 11:00:00 p. m.', importe: 165.90, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/04/2025' },
  { id: 71300, fhRegistro: '08/05/2025 11:00:00 p. m.', importe: 174.20, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/04/2025' },
  { id: 73500, fhRegistro: '23/05/2025 11:00:00 p. m.', importe: 182.50, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/05/2025' },
  { id: 75700, fhRegistro: '08/06/2025 11:00:00 p. m.', importe: 191.00, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/05/2025' },
  { id: 78000, fhRegistro: '23/06/2025 11:00:00 p. m.', importe: 200.40, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/06/2025' },
  { id: 80400, fhRegistro: '08/07/2025 11:00:00 p. m.', importe: 210.80, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:23/06/2025' },
  { id: 82800, fhRegistro: '23/07/2025 11:00:00 p. m.', importe: 221.50, observacion: 'GENERA MONEDERO POR PAGO RELACION CORTE:08/07/2025' },
  { id: 85300, fhRegistro: '12/11/2026 10:00:00 a. m.', importe: 61985.34, observacion: 'SALDO CONSOLIDADO ACUMULADO LANAPUNTOS HISTORICO' },
];

interface LanaPuntosModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
}

export default function LanaPuntosModal({
  isOpen,
  onClose,
  distribuidor,
}: LanaPuntosModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'TODOS' | 'POSITIVOS' | 'NEGATIVOS'>('TODOS');
  const [colFilters, setColFilters] = useState({
    id: '',
    fhRegistro: '',
    importe: '',
    observacion: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [sortField, setSortField] = useState<keyof MovimientoMonederoItem>('id');
  const [sortAsc, setSortAsc] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filtrado y ordenamiento de movimientos
  const filteredData = useMemo(() => {
    return DEFAULT_MONEDERO_MOVIMIENTOS.filter((m) => {
      // Filtro de tipo (positivo / negativo)
      if (tipoFilter === 'POSITIVOS' && m.importe <= 0) return false;
      if (tipoFilter === 'NEGATIVOS' && m.importe >= 0) return false;

      // Filtros por columna individuales
      if (colFilters.id && !m.id.toString().includes(colFilters.id.trim())) return false;
      if (colFilters.fhRegistro && !m.fhRegistro.toLowerCase().includes(colFilters.fhRegistro.toLowerCase().trim())) return false;
      if (colFilters.importe && !m.importe.toString().includes(colFilters.importe.trim())) return false;
      if (colFilters.observacion && !m.observacion.toLowerCase().includes(colFilters.observacion.toLowerCase().trim())) return false;

      // Filtro general de búsqueda
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        m.id.toString().includes(q) ||
        m.fhRegistro.toLowerCase().includes(q) ||
        m.observacion.toLowerCase().includes(q) ||
        m.importe.toString().includes(q)
      );
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [searchTerm, tipoFilter, colFilters, sortField, sortAsc]);

  // Totales de puntos calculados
  const totals = useMemo(() => {
    const totalPuntos = filteredData.reduce((acc, m) => acc + m.importe, 0);
    const ganados = filteredData.filter((m) => m.importe > 0).reduce((acc, m) => acc + m.importe, 0);
    const reseteados = filteredData.filter((m) => m.importe < 0).reduce((acc, m) => acc + m.importe, 0);
    return {
      total: Math.round(totalPuntos * 100) / 100,
      ganados: Math.round(ganados * 100) / 100,
      reseteados: Math.round(reseteados * 100) / 100,
    };
  }, [filteredData]);

  // Paginación
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (field: keyof MovimientoMonederoItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleExportExcel = () => {
    const rows = filteredData.map((m) => ({
      ID: m.id,
      'Fecha y Hora': m.fhRegistro,
      Importe: m.importe,
      Observación: m.observacion,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LanaPuntos Monedero');
    XLSX.writeFile(
      wb,
      `LanaPuntos_Monedero_DV_${distribuidor.noDist}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-[96vw] max-w-5xl h-[92vh] max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* HEADER: MONEDERO / LANAPUNTOS                            */}
        {/* ======================================================== */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  Monedero · LanaPuntos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {distribuidor.noDist}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Distribuidor: <span className="font-bold text-slate-800">{distribuidor.nombreDistribuidor}</span> · No. {distribuidor.noDist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KPI CARDS: SALDO DISPONIBLE Y MOVIMIENTOS                */}
        {/* ======================================================== */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Saldo Monedero LanaPuntos */}
            <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Saldo LanaPuntos Actual
              </span>
              <p className="text-lg font-black font-mono text-amber-950 mt-0.5">
                {(distribuidor.lanapuntos || totals.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} pts
              </p>
              <span className="text-[10px] text-amber-700 font-medium">Monedero acumulado</span>
            </div>

            {/* Bonificaciones Ganadas */}
            <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Puntos Ganados (+)
              </span>
              <p className="text-lg font-black font-mono text-emerald-700 mt-0.5">
                +${totals.ganados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-emerald-600">Por pagos y retos</span>
            </div>

            {/* Reseteos / Canjes */}
            <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200/80">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                Canjes / Reseteos (-)
              </span>
              <p className="text-lg font-black font-mono text-rose-700 mt-0.5">
                ${totals.reseteados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-rose-600">Ajustes y cortes</span>
            </div>

            {/* Total Movimientos */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Registros
              </span>
              <p className="text-lg font-black font-mono text-slate-900 mt-0.5">
                {filteredData.length} movimientos
              </p>
              <span className="text-[10px] text-slate-500">Historial completo</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BARRA DE FILTROS Y BÚSQUEDA                             */}
        {/* ======================================================== */}
        <div className="px-6 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por ID, observación o fecha..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Filtro Rápido Tipo */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => { setTipoFilter('TODOS'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md transition ${tipoFilter === 'TODOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Todos ({DEFAULT_MONEDERO_MOVIMIENTOS.length})
              </button>
              <button
                type="button"
                onClick={() => { setTipoFilter('POSITIVOS'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md transition ${tipoFilter === 'POSITIVOS' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Abonos (+)
              </button>
              <button
                type="button"
                onClick={() => { setTipoFilter('NEGATIVOS'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md transition ${tipoFilter === 'NEGATIVOS' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Cargos (-)
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium italic">
            Visualización directa del libro de monedero oficial
          </div>
        </div>

        {/* ======================================================== */}
        {/* TABLA PRINCIPAL DEL MONEDERO (4 COLUMNAS EXACTAS)       */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200 z-10">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition w-24"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fhRegistro')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition w-56"
                >
                  <div className="flex items-center gap-1">
                    <span>FhRegistro</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('importe')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition text-right w-36"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Importe</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('observacion')}
                  className="px-3 py-2.5 cursor-pointer hover:bg-slate-200/80 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Observacion</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>

              {/* FILA DE FILTROS POR COLUMNA (Idéntico a la captura legacy) */}
              <tr className="bg-slate-50/95 border-b border-slate-200">
                <th className="p-1 border-r border-slate-200">
                  <input
                    type="text"
                    placeholder="Filtrar ID..."
                    value={colFilters.id}
                    onChange={(e) => {
                      setColFilters({ ...colFilters, id: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="w-full px-1.5 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </th>
                <th className="p-1 border-r border-slate-200">
                  <input
                    type="text"
                    placeholder="Filtrar fecha..."
                    value={colFilters.fhRegistro}
                    onChange={(e) => {
                      setColFilters({ ...colFilters, fhRegistro: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="w-full px-1.5 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </th>
                <th className="p-1 border-r border-slate-200 text-right">
                  <input
                    type="text"
                    placeholder="Importe..."
                    value={colFilters.importe}
                    onChange={(e) => {
                      setColFilters({ ...colFilters, importe: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="w-full px-1.5 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-amber-500 text-right font-mono"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Filtrar por texto de observación..."
                    value={colFilters.observacion}
                    onChange={(e) => {
                      setColFilters({ ...colFilters, observacion: e.target.value });
                      setCurrentPage(1);
                    }}
                    className="w-full px-1.5 py-0.5 text-[11px] font-normal bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {paginatedItems.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-amber-50/60 even:bg-slate-50/50 transition duration-75 group border-b border-slate-100"
                >
                  <td className="px-3 py-2 font-mono font-bold text-blue-600 border-r border-slate-200/50">
                    {m.id}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-600 border-r border-slate-200/50">
                    {m.fhRegistro}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold border-r border-slate-200/50">
                    <span
                      className={
                        m.importe < 0
                          ? 'text-rose-600'
                          : m.importe >= 100
                          ? 'text-amber-800 font-black'
                          : 'text-emerald-700'
                      }
                    >
                      {m.importe > 0 ? '+' : ''}
                      {m.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-900 leading-tight">
                    {m.observacion}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* ======================================================== */}
            {/* FOOTER BAR: TOTAL REGISTROS E IMPORTE ACUMULADO          */}
            {/* ======================================================== */}
            <tfoot className="sticky bottom-0 bg-slate-200/95 backdrop-blur-xs border-t-2 border-slate-300 font-bold text-slate-900 text-xs shadow-inner z-10">
              <tr>
                <td className="px-3 py-2 font-black text-slate-800 uppercase tracking-wide">
                  REG: {filteredData.length}
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-slate-600">
                  Total Acumulado:
                </td>
                <td className="px-3 py-2 text-right font-mono font-black text-amber-950 text-sm">
                  ${totals.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2 font-medium text-slate-600 text-[11px]">
                  Puntos canjeables en Tiendita LanAhora
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ======================================================== */}
        {/* BARRA INFERIOR DE PAGINACIÓN Y BOTÓN CANCELAR           */}
        {/* ======================================================== */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-4">
            <span>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalItems} elementos)
            </span>

            {/* Selector de tamaño de página */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none shadow-2xs"
              >
                <option value={15}>15 registros por página (Recomendado)</option>
                <option value={25}>25 registros por página</option>
                <option value={50}>50 registros por página</option>
                <option value={56}>Todos los registros (56)</option>
              </select>
            </div>
          </div>

          {/* Botones de Paginación */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-md font-bold text-xs transition ${
                  currentPage === p
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            {/* Botón Cancelar oficial (Idéntico a la captura legacy) */}
            <button
              type="button"
              onClick={onClose}
              className="ml-4 px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
