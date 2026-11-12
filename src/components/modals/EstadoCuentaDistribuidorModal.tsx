'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import { UserSession } from '@/types/auth';
import { Printer, X, FileText } from 'lucide-react';

interface EstadoCuentaDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
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

  if (!isOpen || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const nombreUsuarioImprime = currentUser?.name || 'JOSE CARLOS MARTINEZ MAYORGA';
  const fechaActual = '12/11/2026 04:02:38 p. m.';

  const noDist = distribuidor.noDist;
  const nombreDist = distribuidor.nombreDistribuidor.toUpperCase();
  const coordinador = distribuidor.coordinador ? `207 ${distribuidor.coordinador.toUpperCase()}` : '207 REYNA ELIZABETH GUTIERREZ ROSALES';
  const direccion = distribuidor.direccion || 'NO DEFINIDA OLGA MORENO 784 IGNACIO ZARAGOZA, SALTILLO, COAHUILA DE ZARAGOZA';
  const telefono = distribuidor.telefono ? `(844) ${distribuidor.telefono}/(844) 340-1591/( ) -` : '(844) 413-7673/(844) 340-1591/( ) -';

  const lineaCredito = distribuidor.creditoLimite || 195000.0;
  const disponible = distribuidor.disponible || 30223.4;
  const valesActivos = 32.0;
  const saldoActual = distribuidor.saldoActual || 325936.96;

  // Próximo pago
  const proximoPago = {
    vencimiento: '20/nov./2026',
    importe: 40409.0,
    saldo: 40409.0,
    abonos: 0.0,
    pagoAnt3Dias: 33135.38,
    pagoAnt2Dias: 33135.38,
    pagoAnt1Dia: 33539.47,
    pagoVencimiento: 33943.56,
    pagoAtrasado: 0.0,
  };

  // Historial de últimos pagos auténticos de la captura
  const ultimosPagos = [
    { fecha: '31/oct./2026', aplicadoFecha: '31/oct./2026', aplicado: 15484.0, efectivo: 15484.0, bonif: 0.0, movId: 658040, movBonif: '', porcBonif: '0.00%' },
    { fecha: '31/oct./2026', aplicadoFecha: '31/oct./2026', aplicado: 20381.0, efectivo: 15484.0, bonif: 4897.0, movId: 658206, movBonif: '658207', porcBonif: '24.03%' },
    { fecha: '14/oct./2026', aplicadoFecha: '14/oct./2026', aplicado: 35839.0, efectivo: 30960.0, bonif: 4879.0, movId: 645247, movBonif: '645248', porcBonif: '13.61%' },
    { fecha: '30/sep./2026', aplicadoFecha: '01/oct./2026', aplicado: 36975.0, efectivo: 31913.0, bonif: 5062.0, movId: 637770, movBonif: '637771', porcBonif: '13.69%' },
    { fecha: '15/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 17000.0, efectivo: 17000.0, bonif: 0.0, movId: 628093, movBonif: '', porcBonif: '0.00%' },
    { fecha: '15/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 10000.0, efectivo: 10000.0, bonif: 0.0, movId: 628122, movBonif: '', porcBonif: '0.00%' },
    { fecha: '15/sep./2026', aplicadoFecha: '15/sep./2026', aplicado: 11487.0, efectivo: 6179.0, bonif: 5307.99, movId: 628168, movBonif: '628169', porcBonif: '46.21%' },
    { fecha: '31/ago./2026', aplicadoFecha: '31/ago./2026', aplicado: 10000.0, efectivo: 10000.0, bonif: 0.0, movId: 619155, movBonif: '', porcBonif: '0.00%' },
    { fecha: '31/ago./2026', aplicadoFecha: '31/ago./2026', aplicado: 10379.0, efectivo: 10379.0, bonif: 0.0, movId: 619166, movBonif: '', porcBonif: '0.00%' },
    { fecha: '31/ago./2026', aplicadoFecha: '31/ago./2026', aplicado: 14760.0, efectivo: 10000.0, bonif: 4760.0, movId: 619194, movBonif: '619195', porcBonif: '32.25%' },
    { fecha: '15/ago./2026', aplicadoFecha: '15/ago./2026', aplicado: 16000.0, efectivo: 16000.0, bonif: 0.0, movId: 608617, movBonif: '', porcBonif: '0.00%' },
    { fecha: '15/ago./2026', aplicadoFecha: '15/ago./2026', aplicado: 21135.0, efectivo: 16021.0, bonif: 5114.0, movId: 608636, movBonif: '608637', porcBonif: '24.20%' },
    { fecha: '31/jul./2026', aplicadoFecha: '31/jul./2026', aplicado: 21000.0, efectivo: 21000.0, bonif: 0.0, movId: 598933, movBonif: '', porcBonif: '0.00%' },
    { fecha: '31/jul./2026', aplicadoFecha: '31/jul./2026', aplicado: 8000.0, efectivo: 8000.0, bonif: 0.0, movId: 598945, movBonif: '', porcBonif: '0.00%' },
    { fecha: '31/jul./2026', aplicadoFecha: '31/jul./2026', aplicado: 8134.99, efectivo: 3021.0, bonif: 5113.99, movId: 598952, movBonif: '598953', porcBonif: '62.86%' },
    { fecha: '20/jul./2026', aplicadoFecha: '20/jul./2026', aplicado: 11.0, efectivo: 11.0, bonif: 0.0, movId: 593516, movBonif: '', porcBonif: '0.00%' },
    { fecha: '18/jul./2026', aplicadoFecha: '20/jul./2026', aplicado: 5387.0, efectivo: 897.2, bonif: 4489.8, movId: 593765, movBonif: '593766', porcBonif: '83.35%' },
    { fecha: '15/jul./2026', aplicadoFecha: '15/jul./2026', aplicado: 33411.0, efectivo: 33411.0, bonif: 0.0, movId: 589040, movBonif: '', porcBonif: '0.00%' },
    { fecha: '30/jun./2026', aplicadoFecha: '30/jun./2026', aplicado: 36322.0, efectivo: 31326.0, bonif: 4996.0, movId: 579978, movBonif: '579979', porcBonif: '13.75%' },
    { fecha: '15/jun./2026', aplicadoFecha: '15/jun./2026', aplicado: 9712.0, efectivo: 9712.0, bonif: 0.0, movId: 569702, movBonif: '', porcBonif: '0.00%' },
    { fecha: '15/jun./2026', aplicadoFecha: '15/jun./2026', aplicado: 10900.0, efectivo: 10900.0, bonif: 0.0, movId: 569720, movBonif: '', porcBonif: '0.00%' },
    { fecha: '15/jun./2026', aplicadoFecha: '15/jun./2026', aplicado: 12340.0, efectivo: 7800.0, bonif: 4540.0, movId: 569738, movBonif: '569739', porcBonif: '36.79%' },
    { fecha: '30/may./2026', aplicadoFecha: '30/may./2026', aplicado: 33221.0, efectivo: 28636.0, bonif: 4585.0, movId: 560176, movBonif: '560177', porcBonif: '13.80%' },
    { fecha: '15/may./2026', aplicadoFecha: '15/may./2026', aplicado: 7000.0, efectivo: 7000.0, bonif: 0.0, movId: 551918, movBonif: '', porcBonif: '0.00%' },
    { fecha: '15/may./2026', aplicadoFecha: '15/may./2026', aplicado: 4560.0, efectivo: 4560.0, bonif: 0.0, movId: 551962, movBonif: '', porcBonif: '0.00%' },
    { fecha: '15/may./2026', aplicadoFecha: '15/may./2026', aplicado: 19223.34, efectivo: 15000.0, bonif: 4223.34, movId: 551981, movBonif: '551982', porcBonif: '21.97%' },
    { fecha: '30/abr./2026', aplicadoFecha: '30/abr./2026', aplicado: 32081.66, efectivo: 27730.0, bonif: 4351.66, movId: 542898, movBonif: '542899', porcBonif: '13.56%' },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
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

      {/* Barra de control superior fija */}
      <header className="sticky top-0 z-30 shrink-0 bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-2">
              <span>Estado de Cuenta Oficial</span>
              <span className="font-mono text-[11px] font-normal text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                DV #{noDist}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              {nombreDist} · LanAhora Core
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Cerrar visor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Área del Documento con Scroll */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center bg-slate-900/60">
        <div
          id="estado-cuenta-print-area"
          className="bg-white text-slate-900 rounded-none sm:rounded-xl shadow-2xl p-6 sm:p-10 w-full max-w-[850px] space-y-4 font-sans text-xs border border-slate-300"
        >
          {/* Header del Estado de Cuenta */}
          <div className="flex items-start justify-between pb-2 border-b border-slate-300">
            <div>
              <img
                src="/lanahora-logo.png"
                alt="LanAhora"
                className="h-10 object-contain"
              />
            </div>
            <div className="text-right">
              <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
                ESTADO DE CUENTA
              </h1>
              <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                <div>{nombreUsuarioImprime}</div>
                <div>{fechaActual}</div>
              </div>
            </div>
          </div>

          {/* Bloque Distribuidor */}
          <div className="grid grid-cols-12 gap-2 text-[11px] leading-tight">
            <div className="col-span-6 space-y-0.5">
              <div>
                <span className="font-bold text-slate-700">DISTRIBUIDOR: </span>
                <span className="font-bold text-slate-950">{nombreDist}</span>
              </div>
              <div className="pt-1">
                <span className="font-bold text-slate-700">DIRECCION: </span>
                <span className="text-slate-800 text-[10px]">{direccion}</span>
              </div>
            </div>

            <div className="col-span-6 space-y-0.5 text-right sm:text-left">
              <div className="grid grid-cols-2">
                <div>
                  <span className="font-bold text-slate-700">DISTRIBUIDORID: </span>
                  <span className="font-mono text-slate-950">{noDist}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">NO DISTRIBUIDOR: </span>
                  <span className="font-mono text-slate-950">{noDist}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700">COORDINADOR: </span>
                <span className="text-slate-900 font-medium">{coordinador}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">TELEFONO: </span>
                <span className="font-mono text-slate-800">{telefono}</span>
              </div>
            </div>
          </div>

          {/* Fila de Métricas Financieras */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 pb-2 border-t border-b border-slate-200 text-center font-mono">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">LINEA DE CREDITO</span>
              <span className="text-xs font-bold text-slate-900">{lineaCredito.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">DISPONIBLE</span>
              <span className="text-xs font-bold text-slate-900">{disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">VALES ACTIVOS</span>
              <span className="text-xs font-bold text-slate-900">{valesActivos.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">SALDO ACTUAL</span>
              <span className="text-xs font-bold text-slate-900">{saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">SALDO ATRASO</span>
              <span className="text-xs font-bold text-slate-900">0.00</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase block">DIAS ATRASO</span>
              <span className="text-xs font-bold text-slate-900">0.00</span>
            </div>
          </div>

          {/* SECCIÓN 1: PROXIMOS PAGOS */}
          <div className="space-y-1">
            <div className="bg-black text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 text-center">
              PROXIMOS PAGOS
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-1">VENCIMIENTO</th>
                    <th className="p-1 text-right">IMPORTE</th>
                    <th className="p-1 text-right">SALDO</th>
                    <th className="p-1 text-right">ABONOS</th>
                    <th className="p-1 text-right">PAGO ANT. 3 DIAS</th>
                    <th className="p-1 text-right">PAGO ANT. 2 DIAS</th>
                    <th className="p-1 text-right">PAGO ANT. 1 DIAS</th>
                    <th className="p-1 text-right">PAGO VENCIMIENTO</th>
                    <th className="p-1 text-right">PAGO ATRASADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                  <tr>
                    <td className="p-1 font-sans">{proximoPago.vencimiento}</td>
                    <td className="p-1 text-right">{proximoPago.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">{proximoPago.saldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">{proximoPago.abonos.toFixed(2)}</td>
                    <td className="p-1 text-right font-bold text-emerald-700">{proximoPago.pagoAnt3Dias.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">{proximoPago.pagoAnt2Dias.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">{proximoPago.pagoAnt1Dia.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">{proximoPago.pagoVencimiento.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">{proximoPago.pagoAtrasado.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: ULTIMOS PAGOS */}
          <div className="space-y-1 pt-1">
            <div className="bg-black text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 text-center">
              ULTIMOS PAGOS
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-300">
                  <tr>
                    <th className="p-1">FECHA PAGO</th>
                    <th className="p-1">APLICADO</th>
                    <th className="p-1 text-right">APLICADO</th>
                    <th className="p-1 text-right">PAGO EFECTIVO</th>
                    <th className="p-1 text-right">BONIFICACION</th>
                    <th className="p-1 text-center">MOVIMIENTO ID</th>
                    <th className="p-1 text-center">MOVIMIENTO ID BONIFICACION</th>
                    <th className="p-1 text-right">PORCENTAJE BONIFICACION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                  {ultimosPagos.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-1 font-sans">{p.fecha}</td>
                      <td className="p-1 font-sans">{p.aplicadoFecha}</td>
                      <td className="p-1 text-right">{p.aplicado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1 text-right">{p.efectivo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1 text-right">{p.bonif.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1 text-center">{p.movId}</td>
                      <td className="p-1 text-center">{p.movBonif || ''}</td>
                      <td className="p-1 text-right">{p.porcBonif}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie de página oficial */}
          <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>LANAHORA FINANCIERA · EN TI CONFIAMOS</span>
            <span>DOCUMENTO OFICIAL DE CORTE QUINCENAL</span>
          </div>
        </div>
      </main>
    </div>
  );

  return createPortal(modalContent, document.body);
}
