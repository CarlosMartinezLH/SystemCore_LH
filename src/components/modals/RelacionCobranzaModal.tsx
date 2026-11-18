'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CarteraItem } from '@/lib/data/carteraData';
import { DistribuidorCore } from '@/types/core';
import {
  X,
  Printer,
  FileSpreadsheet,
  Download,
  Building2,
  Calendar,
  Layers,
  Award,
  Sparkles,
  Receipt,
  Info,
  DollarSign,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

export type DistribuidorParaRelacion = CarteraItem | DistribuidorCore | any;

export interface CreditoRelacionItem {
  id: string;
  fechaCanje: string;
  noVale: number | string;
  nombreCliente: string;
  plazo: string;
  dcto: number;
  valorVale: number;
  saldoCorriente: number;
  saldoVencido: number;
  valorCorte: number;
  pagoCliente: number;
  saldoDespuesPago: number;
  tipo: 'CLIENTE_FINAL' | 'VALE_DISTRIBUIDOR';
}

const DEFAULT_ITEMS_KAREN: CreditoRelacionItem[] = [
  // 15 Restructura Cliente Final
  { id: 'rel-1', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'PAOLA ALEJANDRA ONTIVEROS DIAZ', plazo: '2/16', dcto: 127.99, valorVale: 1276.96, saldoCorriente: 2167.1, saldoVencido: 19.83, valorCorte: 2167.1, pagoCliente: 162.98, saldoDespuesPago: 2004.12, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-2', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'IMELDA GUADALUPE RIVERA ARAUJO', plazo: '2/16', dcto: 63.14, valorVale: 623.36, saldoCorriente: 1297.56, saldoVencido: 11.87, valorCorte: 1297.56, pagoCliente: 97.58, saldoDespuesPago: 1199.98, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-3', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'SANDRA GUADALUPE ALANIS MENA', plazo: '2/16', dcto: 170.92, valorVale: 1684.96, saldoCorriente: 3256.62, saldoVencido: 29.8, valorCorte: 3256.62, pagoCliente: 244.92, saldoDespuesPago: 3011.7, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-4', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'ROBERTO JOSE OZAETA VILLARREAL', plazo: '2/16', dcto: 284.7, valorVale: 2808.32, saldoCorriente: 5084.62, saldoVencido: 46.53, valorCorte: 5084.62, pagoCliente: 382.4, saldoDespuesPago: 4702.22, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-5', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'PAOLA ALEJANDRA ONTIVEROS DIAZ', plazo: '2/16', dcto: 171.81, valorVale: 1711.36, saldoCorriente: 3211.44, saldoVencido: 29.39, valorCorte: 3211.44, pagoCliente: 241.53, saldoDespuesPago: 2969.91, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-6', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'BRIANDA ELIZABETH SANDOVAL MEZA', plazo: '2/16', dcto: 67.59, valorVale: 746.72, saldoCorriente: 1243.44, saldoVencido: 11.38, valorCorte: 1243.44, pagoCliente: 93.52, saldoDespuesPago: 1149.92, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-7', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'NOHEMI RODRIGUEZ BOLIVAR', plazo: '2/16', dcto: 286.1, valorVale: 2853.28, saldoCorriente: 5159.04, saldoVencido: 47.21, valorCorte: 5159.04, pagoCliente: 388.0, saldoDespuesPago: 4771.04, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-8', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'IVONNE SUGEY ENRIQUEZ MUÑOZ', plazo: '2/16', dcto: 328.86, valorVale: 3246.56, saldoCorriente: 6020.76, saldoVencido: 55.09, valorCorte: 6020.76, pagoCliente: 452.8, saldoDespuesPago: 5567.96, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-9', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'DELIA DENISSE GARCIA GARCIA', plazo: '2/16', dcto: 332.67, valorVale: 3278.24, saldoCorriente: 6196.52, saldoVencido: 56.7, valorCorte: 6196.52, pagoCliente: 466.02, saldoDespuesPago: 5730.5, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-10', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'VIRGINIA GABRIELA MARQUEZ GURROLA', plazo: '2/16', dcto: 189.93, valorVale: 1873.44, saldoCorriente: 3391.96, saldoVencido: 31.04, valorCorte: 3391.96, pagoCliente: 255.1, saldoDespuesPago: 3136.86, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-11', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'FELIPE DE JESUS MORALES MARQUEZ', plazo: '2/16', dcto: 189.93, valorVale: 1873.44, saldoCorriente: 3391.96, saldoVencido: 31.04, valorCorte: 3391.96, pagoCliente: 255.1, saldoDespuesPago: 3136.86, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-12', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'SANDRA GUADALUPE ALANIS MENA', plazo: '2/16', dcto: 179.04, valorVale: 1784.32, saldoCorriente: 3157.42, saldoVencido: 28.89, valorCorte: 3157.42, pagoCliente: 237.46, saldoDespuesPago: 2919.96, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-13', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'LUIS ANTONIO PABLO MARTINEZ', plazo: '2/16', dcto: 257.62, valorVale: 2569.28, saldoCorriente: 4645.52, saldoVencido: 42.51, valorCorte: 4645.52, pagoCliente: 349.38, saldoDespuesPago: 4296.14, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-14', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'NOHEMI RODRIGUEZ BOLIVAR', plazo: '2/16', dcto: 393.88, valorVale: 3925.28, saldoCorriente: 6946.62, saldoVencido: 63.57, valorCorte: 6946.62, pagoCliente: 522.44, saldoDespuesPago: 6424.19, tipo: 'CLIENTE_FINAL' },
  { id: 'rel-15', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'ROBERTO JOSE OZAETA VILLARREAL', plazo: '2/16', dcto: 314.86, valorVale: 3140.16, saldoCorriente: 5677.7, saldoVencido: 51.95, valorCorte: 5677.7, pagoCliente: 427.0, saldoDespuesPago: 5250.7, tipo: 'CLIENTE_FINAL' },

  // 2 Restructura Vale Distribuidor
  { id: 'rel-16', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'KAREN ADRIANA ONTIVEROS DIAZ', plazo: '2/16', dcto: 0.0, valorVale: 7193.92, saldoCorriente: 9358.92, saldoVencido: 85.64, valorCorte: 9358.92, pagoCliente: 703.86, saldoDespuesPago: 8655.06, tipo: 'VALE_DISTRIBUIDOR' },
  { id: 'rel-17', fechaCanje: '10/10/26', noVale: -1, nombreCliente: 'KAREN ADRIANA ONTIVEROS DIAZ', plazo: '2/16', dcto: 0.0, valorVale: 0.0, saldoCorriente: 84.0, saldoVencido: 0.77, valorCorte: 84.0, pagoCliente: 6.32, saldoDespuesPago: 77.68, tipo: 'VALE_DISTRIBUIDOR' },
];

interface RelacionCobranzaModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorParaRelacion;
}

export default function RelacionCobranzaModal({
  isOpen,
  onClose,
  distribuidor,
}: RelacionCobranzaModalProps) {
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

  const numDist = Number(distribuidor?.numeroDist ?? distribuidor?.noDist ?? 9601);
  const nombreDist = String(distribuidor?.nombreCompleto ?? distribuidor?.nombreDistribuidor ?? 'KAREN ADRIANA ONTIVEROS DIAZ');
  const sucursal = String(distribuidor?.sucursal ?? 'CHIHUAHUA');
  const zona = String(distribuidor?.zona ?? sucursal);
  const nivel = String(distribuidor?.distribuidorNivel ?? distribuidor?.nivel ?? 'PLATA');
  const saldoActual = Number(distribuidor?.saldoActual ?? 68791.1);
  const direccion = String(distribuidor?.direccion ?? `ANTON MAKARENCO 138 TIERRA Y LIBERTAD, ${sucursal}, ${zona}`);
  const lanapuntos = Number(distribuidor?.lanapuntos ?? 16125.0);

  // Items de crédito: adaptados
  const items = useMemo(() => {
    if (numDist === 9601 || nombreDist.toUpperCase().includes('KAREN')) {
      return DEFAULT_ITEMS_KAREN;
    }
    const factor = saldoActual > 0 ? saldoActual / 68791.1 : 1;
    return DEFAULT_ITEMS_KAREN.map((it) => {
      if (it.tipo === 'VALE_DISTRIBUIDOR') {
        return {
          ...it,
          nombreCliente: nombreDist,
          valorVale: Math.round(it.valorVale * factor * 100) / 100,
          saldoCorriente: Math.round(it.saldoCorriente * factor * 100) / 100,
          valorCorte: Math.round(it.valorCorte * factor * 100) / 100,
          pagoCliente: Math.round(it.pagoCliente * factor * 100) / 100,
          saldoDespuesPago: Math.round(it.saldoDespuesPago * factor * 100) / 100,
        };
      }
      return {
        ...it,
        valorVale: Math.round(it.valorVale * factor * 100) / 100,
        saldoCorriente: Math.round(it.saldoCorriente * factor * 100) / 100,
        saldoVencido: Math.round(it.saldoVencido * factor * 100) / 100,
        valorCorte: Math.round(it.valorCorte * factor * 100) / 100,
        pagoCliente: Math.round(it.pagoCliente * factor * 100) / 100,
        saldoDespuesPago: Math.round(it.saldoDespuesPago * factor * 100) / 100,
      };
    });
  }, [numDist, nombreDist, saldoActual]);

  const itemsClienteFinal = useMemo(() => items.filter((i) => i.tipo === 'CLIENTE_FINAL'), [items]);
  const itemsDistribuidor = useMemo(() => items.filter((i) => i.tipo === 'VALE_DISTRIBUIDOR'), [items]);

  // Subtotales
  const subtotalCF = useMemo(() => {
    return itemsClienteFinal.reduce(
      (acc, i) => ({
        saldoCorriente: acc.saldoCorriente + i.saldoCorriente,
        saldoVencido: acc.saldoVencido + i.saldoVencido,
        valorCorte: acc.valorCorte + i.valorCorte,
        pagoCliente: acc.pagoCliente + i.pagoCliente,
        saldoDespuesPago: acc.saldoDespuesPago + i.saldoDespuesPago,
      }),
      { saldoCorriente: 0, saldoVencido: 0, valorCorte: 0, pagoCliente: 0, saldoDespuesPago: 0 }
    );
  }, [itemsClienteFinal]);

  const subtotalVD = useMemo(() => {
    return itemsDistribuidor.reduce(
      (acc, i) => ({
        saldoCorriente: acc.saldoCorriente + i.saldoCorriente,
        saldoVencido: acc.saldoVencido + i.saldoVencido,
        valorCorte: acc.valorCorte + i.valorCorte,
        pagoCliente: acc.pagoCliente + i.pagoCliente,
        saldoDespuesPago: acc.saldoDespuesPago + i.saldoDespuesPago,
      }),
      { saldoCorriente: 0, saldoVencido: 0, valorCorte: 0, pagoCliente: 0, saldoDespuesPago: 0 }
    );
  }, [itemsDistribuidor]);

  // Totales generales
  const totalesGeneral = useMemo(() => {
    return {
      valorVale: 70291.2,
      totalVencido: subtotalCF.saldoVencido + subtotalVD.saldoVencido,
      totalPago: subtotalCF.pagoCliente + subtotalVD.pagoCliente,
      totalDespues: subtotalCF.saldoDespuesPago + subtotalVD.saldoDespuesPago,
    };
  }, [subtotalCF, subtotalVD]);

  // Escala de bonificaciones
  const escalaBonificaciones = useMemo(() => {
    const totalRelacion = totalesGeneral.totalPago > 0 ? totalesGeneral.totalPago : 5286.4;
    return [
      { fecha: '14/11/2026', valorTotal: totalRelacion, porc: '18.00%', porcNum: 0.18, banorteStp: 4682.0, clubpagoPaynet: 4693.0 },
      { fecha: '15/11/2026', valorTotal: totalRelacion, porc: '18.00%', porcNum: 0.18, banorteStp: 4682.0, clubpagoPaynet: 4693.0 },
      { fecha: '16/11/2026', valorTotal: totalRelacion, porc: '17.00%', porcNum: 0.17, banorteStp: 4716.0, clubpagoPaynet: 4727.0 },
      { fecha: '17/11/2026', valorTotal: totalRelacion, porc: '16.00%', porcNum: 0.16, banorteStp: 4749.0, clubpagoPaynet: 4760.0 },
      { fecha: '18/11/2026', valorTotal: totalRelacion, porc: '15.00%', porcNum: 0.15, banorteStp: 4783.0, clubpagoPaynet: 4794.0 },
    ].map((b) => {
      const descuento = Math.round(b.valorTotal * b.porcNum * 100) / 100;
      const neto = Math.round((b.valorTotal - descuento) * 100) / 100;
      return { ...b, descuento, neto };
    });
  }, [totalesGeneral]);

  // Exportar Relación a Excel
  const handleExportRelacionExcel = () => {
    const rowsCF = itemsClienteFinal.map((i) => ({
      Tipo: 'CLIENTE FINAL',
      'Fecha Canje': i.fechaCanje,
      'No Vale': i.noVale,
      'Nombre del cliente': i.nombreCliente,
      Plazo: i.plazo,
      Dcto: i.dcto,
      'Valor Vale': i.valorVale,
      'Saldo Corriente': i.saldoCorriente,
      'Saldo Vencido': i.saldoVencido,
      'Valor Corte': i.valorCorte,
      'Pago Cliente': i.pagoCliente,
      'Saldo después del pago': i.saldoDespuesPago,
    }));

    const rowsVD = itemsDistribuidor.map((i) => ({
      Tipo: 'VALE DISTRIBUIDOR',
      'Fecha Canje': i.fechaCanje,
      'No Vale': i.noVale,
      'Nombre del cliente': i.nombreCliente,
      Plazo: i.plazo,
      Dcto: i.dcto,
      'Valor Vale': i.valorVale,
      'Saldo Corriente': i.saldoCorriente,
      'Saldo Vencido': i.saldoVencido,
      'Valor Corte': i.valorCorte,
      'Pago Cliente': i.pagoCliente,
      'Saldo después del pago': i.saldoDespuesPago,
    }));

    const ws = XLSX.utils.json_to_sheet([...rowsCF, ...rowsVD]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relacion_Cobranza');
    XLSX.writeFile(wb, `relacion_cobranza_DV_${numDist}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #relacion-cobranza-print-area,
          #relacion-cobranza-print-area * {
            visibility: visible !important;
          }
          #relacion-cobranza-print-area {
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

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[92vh] font-sans print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Barra Superior con Controles (Moderna) */}
        <div className="sticky top-0 z-30 px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Documento Oficial
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  DV #{numDist}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-0.5">
                Relación de Cobranza Quincenal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportRelacionExcel}
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
              <span>Imprimir Relación</span>
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
        {/* DOCUMENTO: RELACION DE COBRANZA (DISEÑO MODERNO)          */}
        {/* ======================================================== */}
        <div
          id="relacion-cobranza-print-area"
          className="p-5 sm:p-8 space-y-4 overflow-y-auto text-slate-800 font-sans text-xs bg-[#f8fafc] flex-1 select-text"
        >
          {/* 1. Header con Logo Moderno, Sucursal y Fechas de Corte */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xs font-black tracking-wider text-base">
                LanAhora
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sucursal Operativa
                </span>
                <span className="text-sm font-extrabold text-slate-900 block">{sucursal}</span>
                <span className="text-[11px] text-slate-500 font-medium">{sucursal}, {zona}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha Corte</span>
                <strong className="text-slate-900 font-mono font-bold text-xs">08/11/2026</strong>
              </div>
              <div className="bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">Fecha Límite</span>
                <strong className="text-blue-900 font-mono font-bold text-xs">18/11/2026</strong>
              </div>
            </div>
          </div>

          {/* 2. Bloque de Datos de la Distribuidora */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 text-xs">
                  DV #{numDist}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    nivel === 'DIAMANTE'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : nivel === 'ORO'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : nivel === 'PLATA'
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-orange-50 text-orange-800 border-orange-200'
                  }`}
                >
                  Nivel {nivel}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">{nombreDist}</h3>
              <p className="text-[11px] text-slate-500 uppercase">{direccion}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 rounded-xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  LanaPuntos Acumulados
                </span>
                <span className="text-base font-black text-blue-900 font-mono">
                  {lanapuntos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                </span>
              </div>
            </div>
          </div>

          {/* 3. Tarjetas de Líneas de Crédito */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Vale Lana
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">Línea: <strong>$40,000.00</strong></span>
                <span className="text-sm font-extrabold text-emerald-600 font-mono">$1,595.80 disp.</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                LanaTienda
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">Línea: <strong>$15,000.00</strong></span>
                <span className="text-sm font-extrabold text-emerald-600 font-mono">$15,000.00 disp.</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Créditos Personales
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">Línea: <strong>$15,000.00</strong></span>
                <span className="text-sm font-extrabold text-emerald-600 font-mono">$15,000.00 disp.</span>
              </div>
            </div>
          </div>

          {/* 4. Subsección 1: RESTRUCTURA CLIENTE FINAL */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Restructura Cliente Final
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-700 border border-slate-200">
                  {itemsClienteFinal.length} registros
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-center">Canje</th>
                    <th className="px-3 py-2 text-center">No Vale</th>
                    <th className="px-3 py-2">Cliente Final</th>
                    <th className="px-3 py-2 text-center">Plazo</th>
                    <th className="px-3 py-2 text-right">Dcto</th>
                    <th className="px-3 py-2 text-right">Valor Vale</th>
                    <th className="px-3 py-2 text-right">Saldo Corriente</th>
                    <th className="px-3 py-2 text-right">Saldo Vencido</th>
                    <th className="px-3 py-2 text-right">Valor Corte</th>
                    <th className="px-3 py-2 text-right">Pago Cliente</th>
                    <th className="px-3 py-2 text-right">Saldo Después</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {itemsClienteFinal.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-500">{i.fechaCanje}</td>
                      <td className="px-3 py-2 text-center font-bold text-slate-700">{i.noVale}</td>
                      <td className="px-3 py-2 font-sans font-bold text-slate-900">{i.nombreCliente}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{i.plazo}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatMoney(i.dcto)}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(i.valorVale)}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">{formatMoney(i.saldoCorriente)}</td>
                      <td className={`px-3 py-2 text-right ${i.saldoVencido > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        {formatMoney(i.saldoVencido)}
                      </td>
                      <td className="px-3 py-2 text-right">{formatMoney(i.valorCorte)}</td>
                      <td className="px-3 py-2 text-right font-bold text-blue-700">{formatMoney(i.pagoCliente)}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{formatMoney(i.saldoDespuesPago)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs font-mono">
                  <tr>
                    <td colSpan={6} className="px-4 py-2 font-sans text-right text-slate-600 uppercase">
                      Total Restructura Cliente Final:
                    </td>
                    <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalCF.saldoCorriente)}</td>
                    <td className="px-3 py-2 text-right text-rose-600">{formatMoney(subtotalCF.saldoVencido)}</td>
                    <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalCF.valorCorte)}</td>
                    <td className="px-3 py-2 text-right text-blue-800 font-black">{formatMoney(subtotalCF.pagoCliente)}</td>
                    <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalCF.saldoDespuesPago)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5. Subsección 2: RESTRUCTURA VALE DISTRIBUIDOR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Restructura Vale Distribuidor
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-700 border border-slate-200">
                  {itemsDistribuidor.length} registros
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-center">Canje</th>
                    <th className="px-3 py-2 text-center">No Vale</th>
                    <th className="px-3 py-2">Cliente / Distribuidor</th>
                    <th className="px-3 py-2 text-center">Plazo</th>
                    <th className="px-3 py-2 text-right">Dcto</th>
                    <th className="px-3 py-2 text-right">Valor Vale</th>
                    <th className="px-3 py-2 text-right">Saldo Corriente</th>
                    <th className="px-3 py-2 text-right">Saldo Vencido</th>
                    <th className="px-3 py-2 text-right">Valor Corte</th>
                    <th className="px-3 py-2 text-right">Pago Cliente</th>
                    <th className="px-3 py-2 text-right">Saldo Después</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {itemsDistribuidor.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-500">{i.fechaCanje}</td>
                      <td className="px-3 py-2 text-center font-bold text-slate-700">{i.noVale}</td>
                      <td className="px-3 py-2 font-sans font-bold text-slate-900">{i.nombreCliente}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{i.plazo}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatMoney(i.dcto)}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(i.valorVale)}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">{formatMoney(i.saldoCorriente)}</td>
                      <td className={`px-3 py-2 text-right ${i.saldoVencido > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        {formatMoney(i.saldoVencido)}
                      </td>
                      <td className="px-3 py-2 text-right">{formatMoney(i.valorCorte)}</td>
                      <td className="px-3 py-2 text-right font-bold text-blue-700">{formatMoney(i.pagoCliente)}</td>
                      <td className="px-3 py-2 text-right text-slate-800">{formatMoney(i.saldoDespuesPago)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs font-mono">
                  <tr>
                    <td colSpan={6} className="px-4 py-2 font-sans text-right text-slate-600 uppercase">
                      Total Restructura Vale Distribuidor:
                    </td>
                    <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalVD.saldoCorriente)}</td>
                    <td className="px-3 py-2 text-right text-rose-600">{formatMoney(subtotalVD.saldoVencido)}</td>
                    <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalVD.valorCorte)}</td>
                    <td className="px-3 py-2 text-right text-blue-800 font-black">{formatMoney(subtotalVD.pagoCliente)}</td>
                    <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalVD.saldoDespuesPago)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 6. Fila de Totales Generales de la Relación */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4 font-mono">
            <div className="font-sans">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Total Cartera Cobrada
              </span>
              <span className="text-sm font-extrabold text-white">
                {items.length} Registros Activos
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Relación</span>
                <span className="text-sm font-bold text-white">{formatMoney(totalesGeneral.valorVale)}</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-300 uppercase font-bold block">Vencido</span>
                <span className="text-sm font-bold text-rose-300">{formatMoney(totalesGeneral.totalVencido)}</span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Pago Requerido</span>
                <span className="text-base font-black text-emerald-300">{formatMoney(totalesGeneral.totalPago)}</span>
              </div>
            </div>
          </div>

          {/* 7. Sección: BONIFICACIONES (ESCALA DE PRONTO PAGO) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Bonificaciones por Pronto Pago
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Escala de descuento calculada sobre el total de la relación
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
                <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-center">Fecha Límite</th>
                    <th className="px-3 py-2 text-right">Valor Total Relación</th>
                    <th className="px-3 py-2 text-center">% Dcto Base</th>
                    <th className="px-3 py-2 text-right">Descuento</th>
                    <th className="px-3 py-2 text-right">Neto a Pagar</th>
                    <th className="px-3 py-2 text-right">Banorte / STP</th>
                    <th className="px-3 py-2 text-right">ClubPago / Paynet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {escalaBonificaciones.map((b) => (
                    <tr key={b.fecha} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-900 font-bold">{b.fecha}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{formatMoney(b.valorTotal)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {b.porc}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-700 font-bold">{formatMoney(b.descuento)}</td>
                      <td className="px-3 py-2 text-right text-slate-900 font-black">{formatMoney(b.neto)}</td>
                      <td className="px-3 py-2 text-right font-black text-slate-900">{formatMoney(b.banorteStp)}</td>
                      <td className="px-3 py-2 text-right font-black text-slate-900">{formatMoney(b.clubpagoPaynet)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota Informativa */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Por cada transacción efectuada mediante <strong>ClubPago</strong> o <strong>Paynet</strong> se generará un cargo administrativo de <strong>$11.00 MXN</strong>.
            </span>
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
