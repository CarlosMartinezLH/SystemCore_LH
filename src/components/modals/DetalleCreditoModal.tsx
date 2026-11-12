'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  DollarSign,
  User,
  Shield,
  Layers,
  TrendingUp,
  Receipt,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CreditoHistorialItem } from './HistorialCreditosDistribuidorModal';
import { generarAmortizaciones } from '@/lib/data/historialCreditosData';
import { AmortizacionCuota } from '@/types/core';

interface DetalleCreditoModalProps {
  isOpen: boolean;
  onClose: () => void;
  credito: CreditoHistorialItem | null;
  distribuidorNombre?: string;
  distribuidorNo?: number;
}

export default function DetalleCreditoModal({
  isOpen,
  onClose,
  credito,
  distribuidorNombre = 'DISTRIBUIDOR',
  distribuidorNo = 1053,
}: DetalleCreditoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'desglose' | 'amortizacion'>('desglose');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || !credito) return null;

  // Generar tabla de amortización simulada calculada con la fórmula oficial
  const amortizaciones: AmortizacionCuota[] = generarAmortizaciones(
    credito.importeTotal,
    credito.plazos,
    credito.fechaDesembolso || '05/12/2026'
  );

  // Si el crédito está liquidado, marcar las cuotas como pagadas
  const amortizacionesAjustadas = amortizaciones.map((cuota, idx) => {
    if (credito.estatus === 'LIQUIDADO') {
      return { ...cuota, estatus: 'PAGADO' as const };
    }
    // Si tiene abonos parciales, calcular cuántas cuotas se han cubierto
    const montoCubierto = cuota.cuotaTotal * (idx + 1);
    if (credito.abonos >= montoCubierto) {
      return { ...cuota, estatus: 'PAGADO' as const };
    }
    return cuota;
  });

  const porcentajePagado = credito.importeTotal > 0
    ? Math.min(100, Math.round((credito.abonos / credito.importeTotal) * 100))
    : 100;

  const handleExportExcel = () => {
    // 1. Resumen general
    const generalData = [
      { Concepto: 'Crédito ID', Valor: credito.creditoId },
      { Concepto: 'Estatus', Valor: credito.estatus },
      { Concepto: 'Cliente', Valor: credito.nombreCompleto },
      { Concepto: 'Persona ID', Valor: credito.personaId },
      { Concepto: 'Distribuidor', Valor: `${distribuidorNombre} (#${distribuidorNo})` },
      { Concepto: 'Plazos', Valor: `${credito.plazos} Quincenas` },
      { Concepto: 'Fecha Registro', Valor: credito.fechaRegistro },
      { Concepto: 'Fecha Desembolso', Valor: credito.fechaDesembolso },
      { Concepto: 'Capital', Valor: credito.capital },
      { Concepto: 'Interés', Valor: credito.interes },
      { Concepto: 'Prot. Saldo (Seguro)', Valor: credito.protSaldo },
      { Concepto: 'Comisión', Valor: credito.comision },
      { Concepto: 'Cargo', Valor: credito.cargo },
      { Concepto: 'IVA', Valor: credito.iva },
      { Concepto: 'Importe Total', Valor: credito.importeTotal },
      { Concepto: 'Abonos Realizados', Valor: credito.abonos },
      { Concepto: 'Saldo Actual', Valor: credito.saldoActual },
      { Concepto: 'Días Atraso', Valor: credito.diasAtraso },
    ];

    // 2. Tabla de amortización
    const amortData = amortizacionesAjustadas.map((a) => ({
      'No. Pago': a.numeroPago,
      'Fecha Vencimiento': a.fechaVencimiento,
      'Cuota Quincenal': a.cuotaTotal,
      Capital: a.capital,
      Interés: a.interes,
      Seguro: a.seguro,
      IVA: a.iva,
      'Saldo Restante': a.saldoRestante,
      Estatus: a.estatus,
    }));

    const wb = XLSX.utils.book_new();
    const wsGeneral = XLSX.utils.json_to_sheet(generalData);
    const wsAmort = XLSX.utils.json_to_sheet(amortData);

    XLSX.utils.book_append_sheet(wb, wsGeneral, 'Resumen Crédito');
    XLSX.utils.book_append_sheet(wb, wsAmort, 'Amortización');

    XLSX.writeFile(wb, `Detalle_Credito_${credito.creditoId}_LanAhora.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* HEADER                                                   */}
        {/* ======================================================== */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                  Detalle del Crédito #{credito.creditoId}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    credito.estatus === 'ACTIVO'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {credito.estatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                Cliente: <span className="font-bold text-slate-800">{credito.nombreCompleto}</span> · ID: <span className="font-mono">{credito.personaId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KPI CARDS: 4 INDICADORES FINANCIEROS CLAVE               */}
        {/* ======================================================== */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Capital */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Capital Otorgado
              </span>
              <p className="text-lg font-black font-mono text-slate-900 mt-0.5">
                ${credito.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500">Monto financiado</span>
            </div>

            {/* Total del Crédito */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Importe Total
              </span>
              <p className="text-lg font-black font-mono text-blue-900 mt-0.5">
                ${credito.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-blue-600 font-medium">Con interés e IVA</span>
            </div>

            {/* Abonos */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Abonos
              </span>
              <p className="text-lg font-black font-mono text-emerald-700 mt-0.5">
                ${credito.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">
                {porcentajePagado}% cubierto
              </span>
            </div>

            {/* Saldo Pendiente */}
            <div className={`p-3 rounded-xl border ${
              credito.saldoActual > 0
                ? 'bg-amber-50/60 border-amber-200/80'
                : 'bg-slate-50 border-slate-200/80'
            }`}>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Saldo Actual
              </span>
              <p className="text-lg font-black font-mono text-amber-900 mt-0.5">
                ${credito.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-amber-700 font-medium">
                {credito.saldoActual === 0 ? 'Liquidado al 100%' : 'Por amortizar'}
              </span>
            </div>
          </div>

          {/* Barra de Progreso de Amortización */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
              <span>Progreso de Pago</span>
              <span>{porcentajePagado}% (${credito.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} de ${credito.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })})</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  porcentajePagado >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${porcentajePagado}%` }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TABS SELECTOR                                            */}
        {/* ======================================================== */}
        <div className="px-6 pt-2 bg-slate-50 border-b border-slate-200 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('desglose')}
            className={`px-4 py-2 font-bold text-xs rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'desglose'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            Desglose Financiero & Datos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('amortizacion')}
            className={`px-4 py-2 font-bold text-xs rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'amortizacion'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            Tabla de Amortización ({credito.plazos} Quincenas)
          </button>
        </div>

        {/* ======================================================== */}
        {/* CONTENIDO DE LAS PESTAÑAS (SCROLL INTERNO)               */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'desglose' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* FICHA TÉCNICA Y OPERATIVA */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Información Operativa
                </h4>

                <dl className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Cliente Final:</dt>
                    <dd className="font-bold text-slate-900 text-right">{credito.nombreCompleto}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Persona ID:</dt>
                    <dd className="font-mono font-bold text-slate-800">{credito.personaId}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Distribuidor:</dt>
                    <dd className="font-bold text-slate-800">{distribuidorNombre} (#{distribuidorNo})</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Plazos Pactados:</dt>
                    <dd className="font-bold text-blue-700">{credito.plazos} Quincenas</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Fecha de Registro:</dt>
                    <dd className="font-mono text-slate-700">{credito.fechaRegistro}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Fecha de Desembolso:</dt>
                    <dd className="font-mono text-slate-700">{credito.fechaDesembolso}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Días de Atraso Actual:</dt>
                    <dd className={`font-mono font-bold ${credito.diasAtraso > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {credito.diasAtraso} días
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-500 font-medium">Días de Atraso Máximo:</dt>
                    <dd className="font-mono text-slate-600">{credito.diasAtrasoMax} días</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-slate-500 font-medium">Saldo Atrasado:</dt>
                    <dd className="font-mono font-bold text-slate-800">${credito.saldoAtrasado.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              {/* DESGLOSE CONTABLE COMPLETO (COLUMNAS REMOVIDAS DE LA TABLA) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Desglose Contable Detallado
                </h4>

                <dl className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-600 font-medium">Capital Solicitado:</dt>
                    <dd className="font-mono font-bold text-slate-900">
                      ${credito.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-600 font-medium">Interés Ordinario:</dt>
                    <dd className="font-mono font-bold text-slate-800">
                      ${credito.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-600 font-medium">Protección de Saldo (Seguro):</dt>
                    <dd className="font-mono font-bold text-slate-800">
                      ${credito.protSaldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-600 font-medium">Comisión por Apertura:</dt>
                    <dd className="font-mono text-slate-600">
                      ${credito.comision.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-600 font-medium">Cargos Administrativos:</dt>
                    <dd className="font-mono text-slate-600">
                      ${credito.cargo.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <dt className="text-slate-600 font-medium">IVA (16%):</dt>
                    <dd className="font-mono font-bold text-slate-800">
                      ${credito.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>

                  <div className="flex justify-between py-2 border-t-2 border-slate-200 mt-2 font-black text-slate-950 bg-slate-50/80 px-2 rounded-lg">
                    <dt className="uppercase tracking-wide">Importe Total:</dt>
                    <dd className="font-mono text-blue-950 text-sm">
                      ${credito.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>

                  <div className="flex justify-between py-1.5 px-2 text-emerald-800 font-bold">
                    <dt>Menos: Total Abonos:</dt>
                    <dd className="font-mono">
                      -${credito.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>

                  <div className="flex justify-between py-2 border-t border-slate-200 font-black text-amber-900 bg-amber-50/80 px-2 rounded-lg text-sm">
                    <dt className="uppercase tracking-wide">Saldo Actual por Liquidar:</dt>
                    <dd className="font-mono">
                      ${credito.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                </dl>
              </div>

            </div>
          ) : (
            /* TABLA DE AMORTIZACIÓN */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Plan de {credito.plazos} Pagos Quincenales
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Cuota promedio: <strong className="text-slate-900 font-mono">${(credito.importeTotal / credito.plazos).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>

              <div className="overflow-x-auto max-h-[420px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2 text-center"># Pago</th>
                      <th className="px-3 py-2">Vencimiento</th>
                      <th className="px-3 py-2 text-right">Capital</th>
                      <th className="px-3 py-2 text-right">Interés</th>
                      <th className="px-3 py-2 text-right">Seguro</th>
                      <th className="px-3 py-2 text-right">IVA</th>
                      <th className="px-3 py-2 text-right font-black text-slate-900">Cuota Quincenal</th>
                      <th className="px-3 py-2 text-right">Saldo Restante</th>
                      <th className="px-3 py-2 text-center">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {amortizacionesAjustadas.map((a) => (
                      <tr key={a.numeroPago} className="hover:bg-blue-50/40 transition duration-75">
                        <td className="px-3 py-2 text-center font-mono font-bold text-slate-600">
                          {a.numeroPago} / {credito.plazos}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-700">
                          {a.fechaVencimiento}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">
                          ${a.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">
                          ${a.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">
                          ${a.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">
                          ${a.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-950 bg-slate-50/50">
                          ${a.cuotaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-800">
                          ${a.saldoRestante.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.estatus === 'PAGADO'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {a.estatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* FOOTER                                                   */}
        {/* ======================================================== */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            Crédito emitido bajo la plataforma financiera oficial LanAhora.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
          >
            Cerrar Detalle
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
