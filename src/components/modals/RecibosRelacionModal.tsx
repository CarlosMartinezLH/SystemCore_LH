'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import { UserSession } from '@/types/auth';
import { Printer, X, Search, FileSpreadsheet, Scissors, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ReciboTalonPago {
  id: string | number;
  sucursal: string;
  distribuidorId: number;
  distribuidorNombre: string;
  clienteId: number | string;
  clienteNombre: string;
  fechaPago: string;
  importeTotal: number;
  saldoAnterior: number;
  saldoNuevo: number;
  pago: number;
  saldoVencido: number;
  plazoActual: number;
  plazosTotales: number;
  creditoId: number;
  folio: number | string;
  fechaCanje: string;
}

// Datos auténticos basados en el reporte oficial de LanAhora (Foto REP=5 DistribuidorID=1012)
const RECIBOS_EJEMPLO_BASE: ReciboTalonPago[] = [
  {
    id: 1,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 51251,
    clienteNombre: 'SARA SOFIA RODRIGUEZ RIOS',
    fechaPago: '15/11/2026',
    importeTotal: 10200.0,
    saldoAnterior: 9562.5,
    saldoNuevo: 8925.0,
    pago: 637.5,
    saldoVencido: 0.0,
    plazoActual: 2,
    plazosTotales: 16,
    creditoId: 422615,
    folio: -1,
    fechaCanje: '23/10/2026',
  },
  {
    id: 2,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 83684,
    clienteNombre: 'ADRIAN RAMIREZ NIETO',
    fechaPago: '15/11/2026',
    importeTotal: 9336.0,
    saldoAnterior: 8752.5,
    saldoNuevo: 8169.0,
    pago: 583.5,
    saldoVencido: 0.0,
    plazoActual: 2,
    plazosTotales: 16,
    creditoId: 422616,
    folio: -1,
    fechaCanje: '23/10/2026',
  },
  {
    id: 3,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 18516,
    clienteNombre: 'CLAUDIA CATALINA RAMIREZ UDAVE',
    fechaPago: '15/11/2026',
    importeTotal: 10680.96,
    saldoAnterior: 10013.5,
    saldoNuevo: 9345.9,
    pago: 667.6,
    saldoVencido: 0.0,
    plazoActual: 2,
    plazosTotales: 16,
    creditoId: 422617,
    folio: -1,
    fechaCanje: '23/10/2026',
  },
  {
    id: 4,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 14076,
    clienteNombre: 'OLGA ALICIA HERRERA AREVALO',
    fechaPago: '15/11/2026',
    importeTotal: 7067.04,
    saldoAnterior: 6625.3,
    saldoNuevo: 6183.6,
    pago: 441.7,
    saldoVencido: 0.0,
    plazoActual: 2,
    plazosTotales: 16,
    creditoId: 422618,
    folio: -1,
    fechaCanje: '23/10/2026',
  },
  {
    id: 5,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 39047,
    clienteNombre: 'ADRIANA PATRICIA RODRIGUEZ SALAS',
    fechaPago: '15/11/2026',
    importeTotal: 12000.0,
    saldoAnterior: 11250.0,
    saldoNuevo: 10500.0,
    pago: 750.0,
    saldoVencido: 0.0,
    plazoActual: 3,
    plazosTotales: 16,
    creditoId: 422619,
    folio: -1,
    fechaCanje: '15/10/2026',
  },
  {
    id: 6,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 9010,
    clienteNombre: 'LIDIA MAGDALENA RODRIGUEZ GARCIA',
    fechaPago: '15/11/2026',
    importeTotal: 8500.0,
    saldoAnterior: 7968.75,
    saldoNuevo: 7437.5,
    pago: 531.25,
    saldoVencido: 0.0,
    plazoActual: 4,
    plazosTotales: 16,
    creditoId: 422620,
    folio: -1,
    fechaCanje: '01/10/2026',
  },
  {
    id: 7,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 26687,
    clienteNombre: 'NORA PATRICIA GAYTAN VARGAS',
    fechaPago: '15/11/2026',
    importeTotal: 11500.0,
    saldoAnterior: 9857.14,
    saldoNuevo: 9035.71,
    pago: 821.43,
    saldoVencido: 0.0,
    plazoActual: 5,
    plazosTotales: 14,
    creditoId: 422621,
    folio: -1,
    fechaCanje: '15/09/2026',
  },
  {
    id: 8,
    sucursal: 'SALTILLO',
    distribuidorId: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    clienteId: 27907,
    clienteNombre: 'ANGEL EDUARDO DE LA CRUZ ALVARADO',
    fechaPago: '15/11/2026',
    importeTotal: 15000.0,
    saldoAnterior: 13125.0,
    saldoNuevo: 12187.5,
    pago: 937.5,
    saldoVencido: 0.0,
    plazoActual: 3,
    plazosTotales: 16,
    creditoId: 422622,
    folio: -1,
    fechaCanje: '15/10/2026',
  },
];

interface RecibosRelacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  currentUser?: UserSession | null;
}

export default function RecibosRelacionModal({
  isOpen,
  onClose,
  distribuidor,
  currentUser,
}: RecibosRelacionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  // Adaptar los recibos al distribuidor actual
  const recibos: ReciboTalonPago[] = RECIBOS_EJEMPLO_BASE.map((r) => ({
    ...r,
    distribuidorId: distribuidor.noDist,
    distribuidorNombre: distribuidor.nombreDistribuidor.toUpperCase(),
    sucursal: (distribuidor.sucursal || 'SALTILLO').toUpperCase(),
  }));

  const filteredRecibos = recibos.filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      r.clienteNombre.toLowerCase().includes(q) ||
      r.clienteId.toString().includes(q) ||
      r.creditoId.toString().includes(q)
    );
  });

  const handleExportExcel = () => {
    const rows = filteredRecibos.map((r) => ({
      'Fecha Pago': r.fechaPago,
      Sucursal: r.sucursal,
      'No. Dist': r.distribuidorId,
      Distribuidor: r.distribuidorNombre,
      'Cliente ID': r.clienteId,
      Cliente: r.clienteNombre,
      'Importe Total': r.importeTotal,
      'Saldo Anterior': r.saldoAnterior,
      'Saldo Nuevo': r.saldoNuevo,
      Pago: r.pago,
      'Saldo Vencido': r.saldoVencido,
      Plazo: `${r.plazoActual} / ${r.plazosTotales}`,
      'Crédito ID': r.creditoId,
      Folio: r.folio,
      'Fecha Canje': r.fechaCanje,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Talones de Pago');
    XLSX.writeFile(
      wb,
      `Talones_Pago_DV_${distribuidor.noDist}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-sans">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-recibos-relacion,
          #print-recibos-relacion * {
            visibility: visible !important;
          }
          #print-recibos-relacion {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-after-receipts {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Barra Superior de Herramientas (Oculta al imprimir) */}
        <div className="no-print px-5 py-3 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/lanahora-logo-transparent.png"
              alt="LanAhora"
              className="h-7 w-auto object-contain"
            />
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-slate-900 text-base tracking-tight">
                Relación de Recibos · Talones de Pago
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                DV #{distribuidor.noDist}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {distribuidor.nombreDistribuidor}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              title="Imprimir talones de pago para clientes"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Talones</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación informativa (no se imprime) */}
        <div className="no-print bg-blue-50/70 border-b border-blue-100 px-5 py-2 text-xs text-blue-900 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mostrando <strong>{filteredRecibos.length}</strong> talones de cobro. Formato oficial preparado para impresión quincenal a 2 columnas por hoja.
            </span>
          </div>
          <span className="text-[11px] font-mono text-blue-700">REP=5 · ReportViewer</span>
        </div>

        {/* Contenedor Imprimible: Hojas de Talones de Pago */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          <div
            id="print-recibos-relacion"
            className="max-w-[850px] mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200"
          >
            {/* Cuadrícula de 2 columnas de recibos, idéntica a la foto oficial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredRecibos.map((recibo) => (
                <div
                  key={recibo.id}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-3.5 bg-white relative flex flex-col justify-between hover:border-slate-400 transition"
                  style={{ minHeight: '235px' }}
                >
                  {/* Encabezado del Talón: Logo LanAhora + Fecha de Pago */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <img
                        src="/lanahora-logo-transparent.png"
                        alt="LanAhora"
                        className="h-7 w-auto object-contain"
                      />
                      <span className="text-[9px] font-bold text-amber-700 italic block leading-none">
                        ¡en Ti confiamos!
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        Fecha Pago:
                      </span>
                      <span className="text-xs font-black font-mono text-slate-900">
                        {recibo.fechaPago}
                      </span>
                    </div>
                  </div>

                  {/* Datos de Asignación y Cliente */}
                  <div className="space-y-1 py-1.5 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-medium">Sucursal:</span>
                      <span className="font-bold text-slate-900 uppercase">
                        {recibo.sucursal}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Distribuidor:</span>
                      <span className="font-bold text-slate-900 leading-tight block">
                        {recibo.distribuidorId} - {recibo.distribuidorNombre}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block">Cliente:</span>
                      <span className="font-extrabold text-slate-900 leading-tight block text-[11.5px]">
                        {recibo.clienteId} - {recibo.clienteNombre}
                      </span>
                    </div>
                  </div>

                  {/* Cuadrícula Financiera en 2 Columnas (Idéntica a la imagen) */}
                  <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-200/90 text-[10.5px] font-mono grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans font-medium text-[10px]">Importe Total:</span>
                      <span className="font-bold text-slate-900">
                        ${recibo.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans font-medium text-[10px]">Saldo Nuevo:</span>
                      <span className="font-bold text-slate-900">
                        ${recibo.saldoNuevo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans font-medium text-[10px]">Saldo Anterior:</span>
                      <span className="font-bold text-slate-800">
                        ${recibo.saldoAnterior.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-sans font-medium text-[10px]">Pago:</span>
                      <span className="font-black text-blue-700">
                        ${recibo.pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center col-span-2 pt-0.5 border-t border-slate-200">
                      <span className="text-slate-500 font-sans font-medium text-[10px]">Saldo Vencido:</span>
                      <span className="font-bold text-slate-700">
                        ${recibo.saldoVencido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Fila Inferior de Metadatos de Control */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                    <div>
                      <span className="text-slate-400">Plazo:</span>{' '}
                      <strong className="text-slate-900 font-mono">
                        {recibo.plazoActual} / {recibo.plazosTotales}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400">CreditoId:</span>{' '}
                      <strong className="text-blue-700 font-mono">
                        {recibo.creditoId}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400">Folio:</span>{' '}
                      <span className="font-mono text-slate-700">{recibo.folio}</span>
                    </div>

                    <div>
                      <span className="text-slate-400">Fecha Canje:</span>{' '}
                      <span className="font-mono text-slate-900 font-bold">{recibo.fechaCanje}</span>
                    </div>
                  </div>

                  {/* Icono de corte de tijeras estilizado en esquina */}
                  <div className="no-print absolute -top-2.5 -right-2 bg-white px-1 text-slate-400">
                    <Scissors className="w-3 h-3 rotate-90" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="no-print px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>
            {filteredRecibos.length} recibos generados para la distribuidora #{distribuidor.noDist}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
