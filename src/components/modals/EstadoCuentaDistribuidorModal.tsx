'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import { CarteraItem } from '@/lib/data/carteraData';
import { UserSession } from '@/types/auth';
import {
  Printer,
  X,
  FileSpreadsheet,
  FileText,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MapPin,
  UserCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

export type DistribuidorParaEstado = CarteraItem | DistribuidorCore | any;

interface UltimoPagoItem {
  fecha: string;
  aplicadoFecha: string;
  aplicado: number;
  efectivo: number;
  bonif: number;
  movId: number | string;
  movBonif: number | string;
  porcBonif: string;
}

const ULTIMOS_PAGOS_KAREN: UltimoPagoItem[] = [
  { fecha: '13/nov./2026', aplicadoFecha: '13/nov./2026', aplicado: 1500.0, efectivo: 1500.0, bonif: 0.0, movId: 665382, movBonif: '', porcBonif: '0.00%' },
  { fecha: '21/oct./2026', aplicadoFecha: '21/oct./2026', aplicado: 4000.0, efectivo: 4000.0, bonif: 0.0, movId: 652920, movBonif: '', porcBonif: '0.00%' },
  { fecha: '10/oct./2026', aplicadoFecha: '10/oct./2026', aplicado: 74290.9, efectivo: 74290.9, bonif: 0.0, movId: 644261, movBonif: '', porcBonif: '0.00%' },
  { fecha: '05/oct./2026', aplicadoFecha: '05/oct./2026', aplicado: 3500.0, efectivo: 3500.0, bonif: 0.0, movId: 642364, movBonif: '', porcBonif: '0.00%' },
  { fecha: '18/sep./2026', aplicadoFecha: '18/sep./2026', aplicado: 1500.0, efectivo: 1500.0, bonif: 0.0, movId: 632101, movBonif: '', porcBonif: '0.00%' },
  { fecha: '15/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 38684.0, efectivo: 38684.0, bonif: 0.0, movId: 627782, movBonif: '', porcBonif: '0.00%' },
  { fecha: '11/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 1000.0, efectivo: 1000.0, bonif: 0.0, movId: 627889, movBonif: '', porcBonif: '0.00%' },
  { fecha: '11/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 2000.0, efectivo: 2000.0, bonif: 0.0, movId: 627890, movBonif: '', porcBonif: '0.00%' },
  { fecha: '09/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 1000.0, efectivo: 1000.0, bonif: 0.0, movId: 627888, movBonif: '', porcBonif: '0.00%' },
  { fecha: '06/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 2000.0, efectivo: 2000.0, bonif: 0.0, movId: 627886, movBonif: '', porcBonif: '0.00%' },
  { fecha: '22/ago./2026', aplicadoFecha: '22/ago./2026', aplicado: 2500.0, efectivo: 2500.0, bonif: 0.0, movId: 615062, movBonif: '', porcBonif: '0.00%' },
  { fecha: '22/ago./2026', aplicadoFecha: '22/ago./2026', aplicado: 333.0, efectivo: 333.0, bonif: 0.0, movId: 615082, movBonif: '', porcBonif: '0.00%' },
  { fecha: '22/ago./2026', aplicadoFecha: '24/ago./2026', aplicado: 1258.98, efectivo: 489.49, bonif: 769.49, movId: 615246, movBonif: '615247', porcBonif: '61.12%' },
  { fecha: '18/ago./2026', aplicadoFecha: '18/ago./2026', aplicado: 6300.0, efectivo: 6300.0, bonif: 0.0, movId: 612454, movBonif: '', porcBonif: '0.00%' },
  { fecha: '01/ago./2026', aplicadoFecha: '01/ago./2026', aplicado: 2000.0, efectivo: 2000.0, bonif: 0.0, movId: 600701, movBonif: '', porcBonif: '0.00%' },
  { fecha: '01/ago./2026', aplicadoFecha: '01/ago./2026', aplicado: 5100.0, efectivo: 5100.0, bonif: 0.0, movId: 601742, movBonif: '', porcBonif: '0.00%' },
  { fecha: '01/ago./2026', aplicadoFecha: '01/ago./2026', aplicado: 524.0, efectivo: 524.0, bonif: 0.0, movId: 601746, movBonif: '', porcBonif: '0.00%' },
  { fecha: '01/ago./2026', aplicadoFecha: '01/ago./2026', aplicado: 1200.32, efectivo: 80.0, bonif: 1120.33, movId: 601802, movBonif: '601803', porcBonif: '93.34%' },
  { fecha: '17/jul./2026', aplicadoFecha: '17/jul./2026', aplicado: 4819.42, efectivo: 3765.0, bonif: 1054.42, movId: 592142, movBonif: '592143', porcBonif: '21.88%' },
  { fecha: '15/jul./2026', aplicadoFecha: '15/jul./2026', aplicado: 4000.0, efectivo: 4000.0, bonif: 0.0, movId: 589577, movBonif: '', porcBonif: '0.00%' },
  { fecha: '30/jun./2026', aplicadoFecha: '30/jun./2026', aplicado: 8186.27, efectivo: 7088.0, bonif: 1098.27, movId: 580243, movBonif: '580244', porcBonif: '13.42%' },
  { fecha: '20/jun./2026', aplicadoFecha: '20/jun./2026', aplicado: 1845.0, efectivo: 1845.0, bonif: 0.0, movId: 575241, movBonif: '', porcBonif: '0.00%' },
  { fecha: '20/jun./2026', aplicadoFecha: '22/jun./2026', aplicado: 933.0, efectivo: 65.99, bonif: 867.01, movId: 575514, movBonif: '575515', porcBonif: '92.93%' },
  { fecha: '17/jun./2026', aplicadoFecha: '17/jun./2026', aplicado: 6000.0, efectivo: 6000.0, bonif: 0.0, movId: 573227, movBonif: '', porcBonif: '0.00%' },
  { fecha: '12/jun./2026', aplicadoFecha: '12/jun./2026', aplicado: 974.0, efectivo: 974.0, bonif: 0.0, movId: 567697, movBonif: '', porcBonif: '0.00%' },
  { fecha: '11/jun./2026', aplicadoFecha: '11/jun./2026', aplicado: 1000.0, efectivo: 1000.0, bonif: 0.0, movId: 567604, movBonif: '', porcBonif: '0.00%' },
];

const PROXIMO_PAGO_KAREN = {
  vencimiento: '20/nov./2026',
  importe: 4643.2,
  saldo: 3786.4,
  abonos: 856.8,
  pagoAnt3Dias: 3104.85,
  pagoAnt2Dias: 3104.85,
  pagoAnt1Dia: 3142.71,
  pagoVencimiento: 3180.58,
  pagoAtrasado: 0.0,
};

interface EstadoCuentaDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorParaEstado;
  currentUser?: UserSession | null;
}

export default function EstadoCuentaDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
  currentUser,
}: EstadoCuentaDistribuidorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const noDist = Number(distribuidor?.numeroDist ?? distribuidor?.noDist ?? 9601);
  const nombreDist = String(distribuidor?.nombreCompleto ?? distribuidor?.nombreDistribuidor ?? 'KAREN ADRIANA ONTIVEROS DIAZ').toUpperCase();
  const rawCoord = String(distribuidor?.coordinador ?? 'ANTONIO RIOS CIGALA').toUpperCase();
  const coordinador = rawCoord.startsWith('290') ? rawCoord : `290 - ${rawCoord}`;
  const direccion = String(distribuidor?.direccion || 'ANTON MAKARENCO 138 TIERRA Y LIBERTAD, CHIHUAHUA, CHIHUAHUA');
  const telefono = String(distribuidor?.telefono ? `(614) ${distribuidor?.telefono}` : '(614) 750-4619 / (614) 407-4804');

  const lineaCredito = Number(distribuidor?.creditoLimite ?? 40000.0);
  const disponible = Number(distribuidor?.disponible ?? 2415.3);
  const valesActivos = Number(distribuidor?.valesActivos ?? 17);
  const saldoActual = Number(distribuidor?.saldoActual ?? 68791.1);
  const saldoAtraso = Number(distribuidor?.saldoAtrasado ?? 0.0);
  const diasAtraso = Number(distribuidor?.diasAtraso ?? 0);

  const nombreUsuarioImprime = currentUser?.name ? currentUser.name.toUpperCase() : 'JOSE CARLOS MARTINEZ MAYORGA';
  const fechaActual = '17/11/2026 05:55:57 p. m.';

  // Exportar Excel
  const handleExportExcel = () => {
    const rowsExport = ULTIMOS_PAGOS_KAREN.map((p) => ({
      'Fecha Pago': p.fecha,
      'Fecha Aplicado': p.aplicadoFecha,
      'Monto Aplicado': p.aplicado,
      'Pago Efectivo': p.efectivo,
      Bonificación: p.bonif,
      'Movimiento ID': p.movId,
      'Movimiento ID Bonificación': p.movBonif,
      'Porcentaje Bonificación': p.porcBonif,
    }));

    const ws = XLSX.utils.json_to_sheet(rowsExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ultimos_Pagos');
    XLSX.writeFile(wb, `estado_cuenta_DV_${noDist}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #estado-cuenta-print-area,
          #estado-cuenta-print-area * {
            visibility: visible !important;
          }
          #estado-cuenta-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>

      {/* Tarjeta Modal Principal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[92vh] font-sans print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Barra Superior con Controles (Moderna) */}
        <div className="sticky top-0 z-30 px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Documento Oficial
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  DV #{noDist}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-0.5">
                Estado de Cuenta del Distribuidor
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
              title="Descargar en formato Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
              title="Imprimir documento oficial"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Estado</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DOCUMENTO: ESTADO DE CUENTA (DISEÑO MODERNO)             */}
        {/* ======================================================== */}
        <div
          id="estado-cuenta-print-area"
          className="p-5 sm:p-8 space-y-4 overflow-y-auto text-slate-900 font-sans text-xs bg-[#f8fafc] flex-1 select-text"
        >
          {/* 1. Header con Logo Moderno y Metadatos de Emisión */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xs font-black tracking-wider text-base">
                LanAhora
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sistema Central de Distribución
                </span>
                <span className="text-sm font-extrabold text-slate-900 block">Estado de Cuenta Integral</span>
                <span className="text-[11px] text-slate-500 font-medium">Sucursal Chihuahua • Chihuahua, MX</span>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operador / Emisión</span>
                <strong className="text-slate-900 font-bold text-xs block">{nombreUsuarioImprime}</strong>
                <span className="text-[11px] text-slate-500 font-mono">{fechaActual}</span>
              </div>
            </div>
          </div>

          {/* 2. Bloque de Datos del Distribuidor */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 text-xs">
                    Distribuidor #{noDist}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">• Persona ID #{noDist}</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-1">
                  {nombreDist}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordinador Asignado</span>
                <strong className="text-slate-800 text-xs">{coordinador}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Dirección Registrada:</span>
                <span className="text-slate-700 font-medium">{direccion}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Teléfonos de Contacto:</span>
                <span className="text-slate-700 font-mono font-medium">{telefono}</span>
              </div>
            </div>
          </div>

          {/* 3. Fila de Métricas Financieras (6 Tarjetas KPI) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Línea de Crédito
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {formatMoney(lineaCredito)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Disponible
              </span>
              <span className="text-sm font-extrabold text-emerald-600 font-mono">
                {formatMoney(disponible)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Vales Activos
              </span>
              <span className="text-sm font-extrabold text-blue-700 font-mono">
                {valesActivos} vales
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Saldo Actual
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {formatMoney(saldoActual)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Saldo Atraso
              </span>
              <span className={`text-sm font-extrabold font-mono ${saldoAtraso > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {formatMoney(saldoAtraso)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Días Atraso
              </span>
              <span className={`text-sm font-extrabold font-mono ${diasAtraso > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {diasAtraso} días
              </span>
            </div>
          </div>

          {/* 4. SECCIÓN: PRÓXIMOS PAGOS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Próximos Pagos Programados
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Fecha Vencimiento: <strong className="text-slate-900">{PROXIMO_PAGO_KAREN.vencimiento}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-center">Vencimiento</th>
                    <th className="px-3 py-2 text-right">Importe Total</th>
                    <th className="px-3 py-2 text-right">Saldo Actual</th>
                    <th className="px-3 py-2 text-right">Abonos</th>
                    <th className="px-3 py-2 text-right text-emerald-700">Pago Ant. 3 Días</th>
                    <th className="px-3 py-2 text-right text-emerald-700">Pago Ant. 2 Días</th>
                    <th className="px-3 py-2 text-right text-emerald-700">Pago Ant. 1 Día</th>
                    <th className="px-3 py-2 text-right font-bold text-blue-700">Pago Vencimiento</th>
                    <th className="px-3 py-2 text-right text-rose-600">Pago Atrasado</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 text-center font-bold text-slate-900">{PROXIMO_PAGO_KAREN.vencimiento}</td>
                    <td className="px-3 py-2 text-right font-bold text-slate-800">{formatMoney(PROXIMO_PAGO_KAREN.importe)}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{formatMoney(PROXIMO_PAGO_KAREN.saldo)}</td>
                    <td className="px-3 py-2 text-right text-emerald-700 font-bold">{formatMoney(PROXIMO_PAGO_KAREN.abonos)}</td>
                    <td className="px-3 py-2 text-right text-emerald-700 font-bold">{formatMoney(PROXIMO_PAGO_KAREN.pagoAnt3Dias)}</td>
                    <td className="px-3 py-2 text-right text-emerald-700 font-bold">{formatMoney(PROXIMO_PAGO_KAREN.pagoAnt2Dias)}</td>
                    <td className="px-3 py-2 text-right text-emerald-700 font-bold">{formatMoney(PROXIMO_PAGO_KAREN.pagoAnt1Dia)}</td>
                    <td className="px-3 py-2 text-right font-black text-blue-700">{formatMoney(PROXIMO_PAGO_KAREN.pagoVencimiento)}</td>
                    <td className="px-3 py-2 text-right text-rose-600">{formatMoney(PROXIMO_PAGO_KAREN.pagoAtrasado)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. SECCIÓN: ÚLTIMOS PAGOS (HISTORIAL DE 26 MOVIMIENTOS) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Historial de Últimos Pagos Registrados
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-700 border border-slate-200">
                  {ULTIMOS_PAGOS_KAREN.length} movimientos
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
                <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-3 py-2 text-center">Fecha Pago</th>
                    <th className="px-3 py-2 text-center">Aplicado</th>
                    <th className="px-3 py-2 text-right">Monto Aplicado</th>
                    <th className="px-3 py-2 text-right">Pago Efectivo</th>
                    <th className="px-3 py-2 text-right">Bonificación</th>
                    <th className="px-3 py-2 text-center">Movimiento ID</th>
                    <th className="px-3 py-2 text-center">Mov. Bonif.</th>
                    <th className="px-3 py-2 text-center">% Bonificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {ULTIMOS_PAGOS_KAREN.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-600">{p.fecha}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{p.aplicadoFecha}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">{formatMoney(p.aplicado)}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-700">{formatMoney(p.efectivo)}</td>
                      <td className={`px-3 py-2 text-right ${p.bonif > 0 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                        {formatMoney(p.bonif)}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600">#{p.movId}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{p.movBonif ? `#${p.movBonif}` : '-'}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.porcBonif !== '0.00%'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'text-slate-400'
                          }`}
                        >
                          {p.porcBonif}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex justify-end print:hidden shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition active:scale-95 shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen || !mounted || !distribuidor) return null;

  return createPortal(modalContent, document.body);
}
