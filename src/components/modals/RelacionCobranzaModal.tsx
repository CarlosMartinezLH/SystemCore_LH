'use client';

import React from 'react';
import { DistribuidorCore } from '@/types/core';
import { Printer, Download, X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface RelacionCobranzaModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor?: DistribuidorCore | null;
}

export default function RelacionCobranzaModal({
  isOpen,
  onClose,
  distribuidor,
}: RelacionCobranzaModalProps) {
  if (!isOpen) return null;

  const dv = distribuidor || {
    noDist: 1053,
    nombreDistribuidor: 'YOLANDA TORRES MARTINEZ',
    sucursal: 'SALTILLO',
    nivel: 'PLATA',
    telefono: '(844) 870-7297',
    direccion: 'DEL VALLE 419 , CP. 25294, TERRALTA, SALTILLO, COAHUILA DE ZARAGOZA',
    lanapuntos: 41125.0,
    creditoLimite: 240000.0,
    disponible: 204633.2,
    lineaLanaTienda: 15000.0,
    disponibleLanaTienda: 15000.0,
    lineaPersonal: 10000.0,
    disponiblePersonal: 5000.0,
  };

  // Vales de Dinero (Matching exact Image 3 from legacy system)
  const valesDinero = [
    {
      fechaCanje: '24/07/26',
      noVale: '-1',
      cliente: 'ESPERANZA MARINA BUSTAMANTE SALAS',
      plazo: '7/10',
      dcto: 1213.79,
      valorVale: 8000.0,
      saldoCorriente: 5360.0,
      saldoVencido: 0.0,
      valorCorte: 5360.0,
      pagoCliente: 1340.0,
      saldoDespuesPago: 4020.0,
    },
    {
      fechaCanje: '24/07/26',
      noVale: '-1',
      cliente: 'ERIKA LUNA GUTIERREZ',
      plazo: '7/12',
      dcto: 1176.72,
      valorVale: 9000.0,
      saldoCorriente: 7830.0,
      saldoVencido: 0.0,
      valorCorte: 7830.0,
      pagoCliente: 1305.0,
      saldoDespuesPago: 6525.0,
    },
    {
      fechaCanje: '03/08/26',
      noVale: '-1',
      cliente: 'ALEJANDRA GUILLEN BUSTAMANTE',
      plazo: '7/12',
      dcto: 1176.72,
      valorVale: 9000.0,
      saldoCorriente: 7830.0,
      saldoVencido: 0.0,
      valorCorte: 7830.0,
      pagoCliente: 1305.0,
      saldoDespuesPago: 6525.0,
    },
    {
      fechaCanje: '10/08/26',
      noVale: '-1',
      cliente: 'ANA CECILIA AGUILERA HERNANDEZ',
      plazo: '6/10',
      dcto: 1365.52,
      valorVale: 9000.0,
      saldoCorriente: 7500.0,
      saldoVencido: 0.0,
      valorCorte: 7500.0,
      pagoCliente: 1500.0,
      saldoDespuesPago: 6000.0,
    },
    {
      fechaCanje: '18/08/26',
      noVale: '-1',
      cliente: 'PAOLA ELIZABETH MORALES RAMIREZ',
      plazo: '6/8',
      dcto: 1448.28,
      valorVale: 8000.0,
      saldoCorriente: 4740.0,
      saldoVencido: 0.0,
      valorCorte: 4740.0,
      pagoCliente: 1580.0,
      saldoDespuesPago: 3160.0,
    },
    {
      fechaCanje: '27/08/26',
      noVale: '-1',
      cliente: 'LAURA GUADALUPE BUSTAMANTE SALAS',
      plazo: '5/12',
      dcto: 1308.05,
      valorVale: 10000.0,
      saldoCorriente: 11552.0,
      saldoVencido: 0.0,
      valorCorte: 11552.0,
      pagoCliente: 1444.0,
      saldoDespuesPago: 10108.0,
    },
    {
      fechaCanje: '25/10/26',
      noVale: '-1',
      cliente: 'ANDREA ALARCON BUSTAMANTE',
      plazo: '1/10',
      dcto: 1365.52,
      valorVale: 9000.0,
      saldoCorriente: 15000.0,
      saldoVencido: 0.0,
      valorCorte: 15000.0,
      pagoCliente: 1500.0,
      saldoDespuesPago: 13500.0,
    },
  ];

  const totalValesSaldoCorriente = 59811.99;
  const totalValesPagoCliente = 9974.0;
  const totalValesSaldoDespues = 49837.99;

  // Préstamo Personal DV
  const prestamoPersonal = {
    fechaCanje: '10/08/26',
    noVale: '0',
    cliente: dv.nombreDistribuidor,
    plazo: '6/10',
    dcto: 0.0,
    valorVale: 10000.0,
    saldoCorriente: 6800.0,
    saldoVencido: 0.0,
    valorCorte: 6800.0,
    pagoCliente: 1360.0,
    saldoDespuesPago: 5440.0,
  };

  // Crédito Protección Relación (Seguro)
  const seguro = {
    fechaCanje: '09/11/26',
    noVale: '-1',
    cliente: 'SEGURO',
    plazo: '1/1',
    dcto: 0.0,
    valorVale: 0.0,
    saldoCorriente: 90.0,
    saldoVencido: 0.0,
    valorCorte: 90.0,
    pagoCliente: 90.0,
    saldoDespuesPago: 0.0,
  };

  const totalGeneralSaldoCorriente = 66701.99;
  const totalGeneralValorCorte = 66701.99;
  const totalGeneralPagoCliente = 11424.0;
  const totalGeneralSaldoDespues = 55277.99;

  // Bonificaciones (18.00% escala 30-15)
  const bonificaciones = [
    { fecha: '14/11/2026', valorTotal: 11424.0, pctDcto: '18.00%', descuento: 1629.83, neto: 9795.0, banorteStp: 9795.0, paynet: 9806.0 },
    { fecha: '15/11/2026', valorTotal: 11424.0, pctDcto: '18.00%', descuento: 1629.83, neto: 9795.0, banorteStp: 9795.0, paynet: 9806.0 },
    { fecha: '16/11/2026', valorTotal: 11424.0, pctDcto: '18.00%', descuento: 1629.83, neto: 9795.0, banorteStp: 9795.0, paynet: 9806.0 },
    { fecha: '17/11/2026', valorTotal: 11424.0, pctDcto: '18.00%', descuento: 1629.83, neto: 9795.0, banorteStp: 9795.0, paynet: 9806.0 },
    { fecha: '18/11/2026', valorTotal: 11424.0, pctDcto: '18.00%', descuento: 1629.83, neto: 9795.0, banorteStp: 9795.0, paynet: 9806.0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden animate-in fade-in max-h-[96vh] flex flex-col print:shadow-none print:border-none print:max-h-none print:w-full">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-900 font-black text-xs flex items-center justify-center">
              RC
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">
                Relación de Cobranza Oficial · DV #{dv.noDist}
              </h2>
              <p className="text-[10px] text-slate-300 font-medium">
                Corte Quincenal 08/11/2026 — Límite de Pago 18/11/2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Visualizador PDF Legacy (Replica de Imagen 1) */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-700 shrink-0 print:hidden select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] font-mono">
              <span>1 de 2</span>
              <span className="text-slate-400">▾</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 font-bold">
              <button className="px-1.5 py-0.5 hover:bg-slate-200 rounded">◀</button>
              <button className="px-1.5 py-0.5 hover:bg-slate-200 rounded">▶</button>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px]">
              <span>Página Completa</span>
              <span className="text-slate-400">▾</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 font-bold text-xs">
              <button className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded">＋</button>
              <button className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded">－</button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
              title="Imprimir"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
              title="Descargar PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body (Exact replica of Image 5) */}
        <div className="p-6 lg:p-8 space-y-4 overflow-y-auto text-[11px] font-sans text-slate-900 bg-white leading-tight print:p-0 print:text-[10px]">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-300 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300 flex items-center justify-center font-black text-amber-800 text-sm">
                LH
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                  LanAhora
                  <span className="text-xs font-normal text-slate-500 italic">¡en Ti confiamos!</span>
                </h1>
                <p className="text-[10px] font-semibold text-slate-600 mt-0.5">
                  Suc.: {dv.sucursal.toUpperCase()}, COAHUILA
                </p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
                RELACION DE COBRANZA
              </h2>
              <div className="inline-grid grid-cols-2 gap-2 mt-1 border border-slate-300 text-center rounded-sm overflow-hidden text-[10px]">
                <div className="bg-slate-100 p-1 border-r border-slate-300">
                  <span className="font-bold text-slate-600 block">FECHA CORTE</span>
                  <span className="font-mono font-bold text-slate-900">08/11/2026</span>
                </div>
                <div className="bg-slate-100 p-1">
                  <span className="font-bold text-slate-600 block">FECHA LIMITE</span>
                  <span className="font-mono font-bold text-rose-700">18/11/2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* DV Info Box & Credit Lines Table */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            {/* DV Identification Box */}
            <div className="md:col-span-7 border border-slate-300 p-2.5 rounded-sm bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="font-black text-xs sm:text-sm text-slate-900 block">
                  {dv.noDist} {dv.nombreDistribuidor}
                </span>
                <span className="text-[10px] text-slate-600 block mt-0.5">
                  {dv.direccion || 'DEL VALLE 419 TERRALTA, SALTILLO, COAHUILA DE ZARAGOZA'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 mt-2 text-[10px]">
                <span>
                  <strong className="text-slate-500">NIVEL:</strong>{' '}
                  <span className="font-black text-slate-900 uppercase">{dv.nivel}</span>
                </span>
                <span>
                  <strong className="text-slate-500">LANAPUNTOS:</strong>{' '}
                  <span className="font-black text-blue-700 font-mono">
                    {(dv.lanapuntos || 41125).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </span>
              </div>
            </div>

            {/* Credit Lines Summary Table */}
            <div className="md:col-span-5 border border-slate-300 rounded-sm overflow-hidden text-[10px]">
              <table className="w-full text-center">
                <thead className="bg-slate-200 text-slate-700 font-black border-b border-slate-300">
                  <tr>
                    <th className="py-1 px-1.5 text-left">PRODUCTO</th>
                    <th className="py-1 px-1.5 text-right">LINEA DE CREDITO</th>
                    <th className="py-1 px-1.5 text-right">DISPONIBLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                  <tr>
                    <td className="py-1 px-1.5 text-left font-sans font-bold">VALE LANA</td>
                    <td className="py-1 px-1.5 text-right">
                      {(dv.creditoLimite || 240000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1 px-1.5 text-right font-bold text-emerald-700">
                      {(dv.disponible || 204633.2).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-1.5 text-left font-sans font-bold">LANATIENDA</td>
                    <td className="py-1 px-1.5 text-right">
                      {(dv.lineaLanaTienda || 15000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1 px-1.5 text-right font-bold text-emerald-700">
                      {(dv.disponibleLanaTienda || 15000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-1.5 text-left font-sans font-bold">CREDITO PERSONALES</td>
                    <td className="py-1 px-1.5 text-right">
                      {(dv.lineaPersonal || 10000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1 px-1.5 text-right font-bold text-emerald-700">
                      {(dv.disponiblePersonal || 5000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: CREDITOS */}
          <div className="border-t-2 border-slate-800 pt-2">
            <h3 className="text-center font-black tracking-widest text-slate-900 text-xs uppercase mb-1">
              CREDITOS
            </h3>

            {/* Table 1: VALE DE DINERO */}
            <div className="mb-3">
              <div className="bg-slate-100 font-black text-slate-800 px-2 py-0.5 border border-slate-300 text-[10px] uppercase">
                VALE DE DINERO
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead className="bg-slate-200/90 text-slate-700 font-black text-[9px] text-center border-b border-slate-300">
                    <tr>
                      <th className="p-1 border-r border-slate-300">Fecha Canje</th>
                      <th className="p-1 border-r border-slate-300">No Vale</th>
                      <th className="p-1 border-r border-slate-300 text-left">Nombre del cliente</th>
                      <th className="p-1 border-r border-slate-300">Plazo</th>
                      <th className="p-1 border-r border-slate-300 text-right">Dcto</th>
                      <th className="p-1 border-r border-slate-300 text-right">Valor Vale</th>
                      <th className="p-1 border-r border-slate-300 text-right">Saldo Corriente</th>
                      <th className="p-1 border-r border-slate-300 text-right">Saldo Vencido</th>
                      <th className="p-1 border-r border-slate-300 text-right">Valor Corte</th>
                      <th className="p-1 border-r border-slate-300 text-right">Pago Cliente</th>
                      <th className="p-1 text-right">Saldo después del pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {valesDinero.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50 font-mono text-[9.5px]">
                        <td className="p-1 text-center border-r border-slate-200">{v.fechaCanje}</td>
                        <td className="p-1 text-center border-r border-slate-200">{v.noVale}</td>
                        <td className="p-1 text-left font-sans font-bold border-r border-slate-200 truncate max-w-[200px]">
                          {v.cliente}
                        </td>
                        <td className="p-1 text-center border-r border-slate-200">{v.plazo}</td>
                        <td className="p-1 text-right border-r border-slate-200">
                          {v.dcto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1 text-right border-r border-slate-200">
                          {v.valorVale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1 text-right border-r border-slate-200 font-bold">
                          {v.saldoCorriente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1 text-right border-r border-slate-200">
                          {v.saldoVencido.toFixed(2)}
                        </td>
                        <td className="p-1 text-right border-r border-slate-200 font-bold">
                          {v.valorCorte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1 text-right border-r border-slate-200 font-bold text-blue-900">
                          {v.pagoCliente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1 text-right font-bold text-slate-700">
                          {v.saldoDespuesPago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-mono font-bold text-[10px] border-t-2 border-slate-300">
                      <td colSpan={6} className="p-1 font-sans text-left border-r border-slate-300">
                        Registros: 7 &nbsp;&nbsp;&nbsp;&nbsp; Total VALE DE DINERO
                      </td>
                      <td className="p-1 text-right border-r border-slate-300">
                        {totalValesSaldoCorriente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right border-r border-slate-300">0.00</td>
                      <td className="p-1 text-right border-r border-slate-300">
                        {totalValesSaldoCorriente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right border-r border-slate-300 text-blue-900">
                        {totalValesPagoCliente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right">
                        {totalValesSaldoDespues.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Table 2: PRESTAMO PERSONAL DV */}
            <div className="mb-3">
              <div className="bg-slate-100 font-black text-slate-800 px-2 py-0.5 border border-slate-300 text-[10px] uppercase">
                PRESTAMO PERSONAL DV
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <tbody className="text-slate-800 font-mono text-[9.5px]">
                    <tr className="hover:bg-slate-50">
                      <td className="p-1 text-center border-r border-slate-200 w-[70px]">
                        {prestamoPersonal.fechaCanje}
                      </td>
                      <td className="p-1 text-center border-r border-slate-200 w-[45px]">
                        {prestamoPersonal.noVale}
                      </td>
                      <td className="p-1 text-left font-sans font-bold border-r border-slate-200 max-w-[200px]">
                        {prestamoPersonal.cliente}
                      </td>
                      <td className="p-1 text-center border-r border-slate-200 w-[45px]">
                        {prestamoPersonal.plazo}
                      </td>
                      <td className="p-1 text-right border-r border-slate-200 w-[65px]">0.00</td>
                      <td className="p-1 text-right border-r border-slate-200 w-[80px]">
                        {prestamoPersonal.valorVale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right border-r border-slate-200 font-bold w-[90px]">
                        {prestamoPersonal.saldoCorriente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right border-r border-slate-200 w-[70px]">0.00</td>
                      <td className="p-1 text-right border-r border-slate-200 font-bold w-[90px]">
                        {prestamoPersonal.valorCorte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right border-r border-slate-200 font-bold text-blue-900 w-[80px]">
                        {prestamoPersonal.pagoCliente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right font-bold text-slate-700 w-[100px]">
                        {prestamoPersonal.saldoDespuesPago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-mono font-bold text-[10px] border-t border-slate-300">
                      <td colSpan={6} className="p-1 font-sans text-left border-r border-slate-300">
                        Registros: 1 &nbsp;&nbsp;&nbsp;&nbsp; Total PRESTAMO PERSONAL DV
                      </td>
                      <td className="p-1 text-right border-r border-slate-300">
                        {prestamoPersonal.saldoCorriente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right border-r border-slate-300">0.00</td>
                      <td className="p-1 text-right border-r border-slate-300">
                        {prestamoPersonal.valorCorte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right border-r border-slate-300 text-blue-900">
                        {prestamoPersonal.pagoCliente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 text-right">
                        {prestamoPersonal.saldoDespuesPago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Table 3: CREDITO PROTECCION RELACION (Seguro) */}
            <div className="mb-3">
              <div className="bg-slate-100 font-black text-slate-800 px-2 py-0.5 border border-slate-300 text-[10px] uppercase">
                CREDITO PROTECCION RELACION
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <tbody className="text-slate-800 font-mono text-[9.5px]">
                    <tr className="hover:bg-slate-50">
                      <td className="p-1 text-center border-r border-slate-200 w-[70px]">{seguro.fechaCanje}</td>
                      <td className="p-1 text-center border-r border-slate-200 w-[45px]">{seguro.noVale}</td>
                      <td className="p-1 text-left font-sans font-bold border-r border-slate-200 max-w-[200px]">
                        {seguro.cliente}
                      </td>
                      <td className="p-1 text-center border-r border-slate-200 w-[45px]">{seguro.plazo}</td>
                      <td className="p-1 text-right border-r border-slate-200 w-[65px]">0.00</td>
                      <td className="p-1 text-right border-r border-slate-200 w-[80px]">0.00</td>
                      <td className="p-1 text-right border-r border-slate-200 font-bold w-[90px]">90.00</td>
                      <td className="p-1 text-right border-r border-slate-200 w-[70px]">0.00</td>
                      <td className="p-1 text-right border-r border-slate-200 font-bold w-[90px]">90.00</td>
                      <td className="p-1 text-right border-r border-slate-200 font-bold text-blue-900 w-[80px]">90.00</td>
                      <td className="p-1 text-right font-bold text-slate-700 w-[100px]">0.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-mono font-bold text-[10px] border-t border-slate-300">
                      <td colSpan={6} className="p-1 font-sans text-left border-r border-slate-300">
                        Registros: 1 &nbsp;&nbsp;&nbsp;&nbsp; Total CREDITO PROTECCION RELACION
                      </td>
                      <td className="p-1 text-right border-r border-slate-300">90.00</td>
                      <td className="p-1 text-right border-r border-slate-300">0.00</td>
                      <td className="p-1 text-right border-r border-slate-300">90.00</td>
                      <td className="p-1 text-right border-r border-slate-300 text-blue-900">90.00</td>
                      <td className="p-1 text-right">0.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* TOTALES GENERALES (Row Registros: 9) */}
            <div className="bg-slate-200/90 border-2 border-slate-400 p-1.5 font-mono font-black text-[10px] text-slate-900 flex flex-wrap items-center justify-between">
              <span className="font-sans text-xs">
                Registros: <strong>9</strong> &nbsp;&nbsp;&nbsp;&nbsp; TOTALES:
              </span>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <span className="text-[9px] text-slate-600 block uppercase font-sans">Saldo Corriente</span>
                  <span>{totalGeneralSaldoCorriente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-600 block uppercase font-sans">Saldo Vencido</span>
                  <span>0.00</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-600 block uppercase font-sans">Valor Corte</span>
                  <span>{totalGeneralValorCorte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  <span className="text-[9px] text-blue-800 block uppercase font-sans">Base a Liquidar</span>
                  <span className="text-blue-900 text-xs">
                    ${totalGeneralPagoCliente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-600 block uppercase font-sans">Saldo después de pago</span>
                  <span>{totalGeneralSaldoDespues.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: BONIFICACIONES (Escala de descuento 30-15 oficial) */}
          <div className="border-t-2 border-slate-800 pt-2 space-y-1">
            <h3 className="text-center font-black tracking-widest text-slate-900 text-xs uppercase">
              BONIFICACIONES
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-center text-[10px]">
                <thead className="bg-slate-200 text-slate-800 font-black border-b border-slate-300 text-[9.5px]">
                  <tr>
                    <th className="p-1 border-r border-slate-300">FECHA</th>
                    <th className="p-1 border-r border-slate-300">VALOR TOTAL DE RELACIÓN</th>
                    <th className="p-1 border-r border-slate-300">% DCTO BASE</th>
                    <th className="p-1 border-r border-slate-300">DESCUENTO</th>
                    <th className="p-1 border-r border-slate-300">NETO</th>
                    <th className="p-1 border-r border-slate-300">BANORTE/STP</th>
                    <th className="p-1">CLUBPAGO/PAYNET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[9.5px]">
                  {bonificaciones.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-1 font-bold border-r border-slate-200">{b.fecha}</td>
                      <td className="p-1 border-r border-slate-200">
                        {b.valorTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 font-bold text-blue-700 border-r border-slate-200">{b.pctDcto}</td>
                      <td className="p-1 font-bold text-emerald-700 border-r border-slate-200">
                        {b.descuento.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 font-black text-slate-900 border-r border-slate-200">
                        {b.neto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 font-black text-blue-900 border-r border-slate-200">
                        ${b.banorteStp.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1 font-black text-slate-900">
                        ${b.paynet.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footnote matching Image 5 */}
            <p className="text-[10px] text-slate-600 italic font-medium pt-1">
              * Por cada transacción efectuada mediante clubpago o paynet se generará un cargo de $11 pesos.
            </p>
          </div>
        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 print:hidden text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Documento generado con firmas electrónicas del Core LanAhora v1.16</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
