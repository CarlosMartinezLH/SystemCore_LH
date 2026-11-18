'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CarteraItem } from '@/lib/data/carteraData';
import { UserSession } from '@/types/auth';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  FileText,
  Printer,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  MessageSquare,
  Upload,
  Calendar,
  Layers,
  Search,
  Building2,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Award,
  Wallet,
  Sparkles,
  Receipt,
  FileCheck,
  SlidersHorizontal,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

export interface CreditoDetalleRecord {
  contratoId: number;
  coordinador: string;
  creditoId: number;
  nombreDistribuid: string;
  distribuidorId: number;
  personaId: number;
  nombreCompleto: string;
  plazos: number;
  porcTasaMensual: string;
  producto: string;
  capital: number;
  interes: number;
  seguro: number;
  iva: number;
  importeTotal: number;
  abonos: number;
  pagoModa: number;
  saldoActual: number;
  diasAtraso: number;
  clasificacion: 'PRESTAMO PERSONAL DV' | 'VALE DE DINERO';
  estatus: 'ACTIVO' | 'LIQUIDADO' | 'CASTIGADO' | 'CANCELADO';
  fechaRegistro: string;
  fechaDesembolso: string;
  fechaUltimoPago: string;
  saldoAtrasado: number;
  diasAtrasoMax: number;
  movimientoId: number;
  usuarioRegistro: number;
  tipoPlazo: string;
  tipoDesembolso: string;
}

export interface AmortizacionPago {
  noPago: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  comision: number;
  seguro: number;
  cargo: number;
  iva: number;
  importeTotal: number;
  abonos: number;
  saldoActual: number;
  fechaLiquidacion?: string;
  diasAtraso: number;
  fechaPago?: string;
}

// 9 Créditos auténticos de María Sujey Ponce Maldonado (Contrato 8749 / DV 9832)
const CREDITOS_SUJEY: CreditoDetalleRecord[] = [
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 415663,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 64211,
    nombreCompleto: 'MARIA SUJEY PONCE MALDONADO',
    plazos: 10,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 10 QUINCENA(S) DISTRIBUIDOR',
    capital: 10000.0,
    interes: 2586.21,
    seguro: 600.0,
    iva: 413.79,
    importeTotal: 13600.0,
    abonos: 1756.7,
    pagoModa: 1360.0,
    saldoActual: 11843.3,
    diasAtraso: 13,
    clasificacion: 'PRESTAMO PERSONAL DV',
    estatus: 'ACTIVO',
    fechaRegistro: '12/08/2026',
    fechaDesembolso: '12/08/2026',
    fechaUltimoPago: '14/11/2026',
    saldoAtrasado: 1360.0,
    diasAtrasoMax: 13,
    movimientoId: 608922,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 414409,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 105857,
    nombreCompleto: 'ABRAHAM JACOB BALBUENA ARZAGA',
    plazos: 16,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 16 QUINCENA(S)',
    capital: 3500.0,
    interes: 2182.76,
    seguro: 960.0,
    iva: 349.24,
    importeTotal: 6992.0,
    abonos: 564.5,
    pagoModa: 437.0,
    saldoActual: 6427.5,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '05/08/2026',
    fechaDesembolso: '05/08/2026',
    fechaUltimoPago: '15/10/2026',
    saldoAtrasado: 437.0,
    diasAtrasoMax: 13,
    movimientoId: 604112,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 378379,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 107488,
    nombreCompleto: 'ANA VELIA MALDONADO DELGADO',
    plazos: 16,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 16 QUINCENA(S)',
    capital: 1500.0,
    interes: 941.38,
    seguro: 960.0,
    iva: 150.62,
    importeTotal: 3552.0,
    abonos: 1840.8,
    pagoModa: 222.0,
    saldoActual: 1711.2,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '20/05/2026',
    fechaDesembolso: '20/05/2026',
    fechaUltimoPago: '15/11/2026',
    saldoAtrasado: 222.0,
    diasAtrasoMax: 13,
    movimientoId: 574892,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 378499,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 107537,
    nombreCompleto: 'MARTIN GUERRERO MEZA',
    plazos: 16,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 16 QUINCENA(S)',
    capital: 3500.0,
    interes: 2182.76,
    seguro: 960.0,
    iva: 349.24,
    importeTotal: 6992.0,
    abonos: 3623.5,
    pagoModa: 437.0,
    saldoActual: 3368.5,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '22/05/2026',
    fechaDesembolso: '22/05/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 437.0,
    diasAtrasoMax: 13,
    movimientoId: 576011,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 376494,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 106587,
    nombreCompleto: 'GUADALUPE MARISOL PONCE MALDONADO',
    plazos: 16,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 16 QUINCENA(S)',
    capital: 5500.0,
    interes: 3424.14,
    seguro: 960.0,
    iva: 547.86,
    importeTotal: 10432.0,
    abonos: 5406.2,
    pagoModa: 652.0,
    saldoActual: 5025.8,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '10/05/2026',
    fechaDesembolso: '10/05/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 652.0,
    diasAtrasoMax: 13,
    movimientoId: 569800,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 383007,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 108328,
    nombreCompleto: 'EVELYN AMANDA DOMINGUEZ JURADO',
    plazos: 12,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 12 QUINCENA(S)',
    capital: 3000.0,
    interes: 1706.9,
    seguro: 720.0,
    iva: 273.1,
    importeTotal: 5700.0,
    abonos: 3463.6,
    pagoModa: 475.0,
    saldoActual: 2236.4,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '18/06/2026',
    fechaDesembolso: '18/06/2026',
    fechaUltimoPago: '15/11/2026',
    saldoAtrasado: 475.0,
    diasAtrasoMax: 13,
    movimientoId: 585400,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 382064,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 108047,
    nombreCompleto: 'JUAN MANUEL BALBUENA PORTILLO',
    plazos: 16,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 16 QUINCENA(S)',
    capital: 5000.0,
    interes: 3110.34,
    seguro: 960.0,
    iva: 497.66,
    importeTotal: 9568.0,
    abonos: 4360.4,
    pagoModa: 598.0,
    saldoActual: 5207.6,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '12/06/2026',
    fechaDesembolso: '12/06/2026',
    fechaUltimoPago: '15/11/2026',
    saldoAtrasado: 598.0,
    diasAtrasoMax: 13,
    movimientoId: 582100,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 381824,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 107910,
    nombreCompleto: 'YOLANDA ALEJANDRA MALDONADO DELGADO',
    plazos: 16,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 16 QUINCENA(S)',
    capital: 6000.0,
    interes: 3724.14,
    seguro: 960.0,
    iva: 595.86,
    importeTotal: 11280.0,
    abonos: 5140.6,
    pagoModa: 705.0,
    saldoActual: 6139.4,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '08/06/2026',
    fechaDesembolso: '08/06/2026',
    fechaUltimoPago: '15/11/2026',
    saldoAtrasado: 705.0,
    diasAtrasoMax: 13,
    movimientoId: 580911,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
  {
    contratoId: 8749,
    coordinador: 'ANTONIO RIOS CIGALA',
    creditoId: 381633,
    nombreDistribuid: 'MARIA SUJEY PONCE MALDONADO',
    distribuidorId: 9832,
    personaId: 107522,
    nombreCompleto: 'ARELY APODACA GALINDO',
    plazos: 16,
    porcTasaMensual: '0.00 %',
    producto: 'VALE 16 QUINCENA(S)',
    capital: 7500.0,
    interes: 4665.52,
    seguro: 960.0,
    iva: 746.48,
    importeTotal: 13872.0,
    abonos: 6321.9,
    pagoModa: 867.0,
    saldoActual: 7550.1,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '06/06/2026',
    fechaDesembolso: '06/06/2026',
    fechaUltimoPago: '15/11/2026',
    saldoAtrasado: 867.0,
    diasAtrasoMax: 13,
    movimientoId: 579800,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
];

// Generador de pagos de amortización quincenal para Crédito 415663
function generarAmortizacion(credito: CreditoDetalleRecord): AmortizacionPago[] {
  const cuota = credito.pagoModa;
  const plazos = credito.plazos;
  const capitalPorCuota = Math.round((credito.capital / plazos) * 100) / 100;
  const interesPorCuota = Math.round((credito.interes / plazos) * 100) / 100;
  const seguroPorCuota = Math.round((credito.seguro / plazos) * 100) / 100;
  const ivaPorCuota = Math.round((credito.iva / plazos) * 100) / 100;

  const amort: AmortizacionPago[] = [];
  let saldo = credito.importeTotal;

  for (let i = 1; i <= plazos; i++) {
    const isPagada = i === 1;
    const abono = isPagada ? credito.abonos : 0;
    saldo = Math.max(0, saldo - (isPagada ? abono : 0));

    const diaVenc = i % 2 === 1 ? '15' : '30';
    const mesIdx = Math.floor((i - 1) / 2) + 8; // Desde agosto
    const mesStr = mesIdx <= 9 ? `0${mesIdx}` : `${mesIdx}`;

    amort.push({
      noPago: i,
      fechaVencimiento: `${diaVenc}/${mesStr}/2026`,
      capital: capitalPorCuota,
      interes: interesPorCuota,
      comision: 0.0,
      seguro: seguroPorCuota,
      cargo: 0.0,
      iva: ivaPorCuota,
      importeTotal: cuota,
      abonos: abono,
      saldoActual: isPagada ? saldo : cuota,
      fechaLiquidacion: isPagada ? '14/11/2026' : undefined,
      diasAtraso: i === 2 ? credito.diasAtraso : 0,
      fechaPago: isPagada ? '14/11/2026' : undefined,
    });
  }

  return amort;
}

interface DetallesCarteraModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: CarteraItem | any;
  currentUser?: UserSession | null;
}

export default function DetallesCarteraModal({
  isOpen,
  onClose,
  distribuidor,
  currentUser,
}: DetallesCarteraModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'LISTA_CREDITOS' | 'FICHA_DETALLE'>('LISTA_CREDITOS');
  const [selectedCreditoId, setSelectedCreditoId] = useState<number | null>(415663);
  const [searchTexto, setSearchTexto] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Créditos adaptados
  const creditos: CreditoDetalleRecord[] = useMemo(() => {
    if (!distribuidor) return CREDITOS_SUJEY;
    const esSujey =
      distribuidor.numeroDist === 9832 ||
      distribuidor.contratoId === 8749 ||
      (distribuidor.nombreCompleto && distribuidor.nombreCompleto.toUpperCase().includes('SUJEY'));

    if (esSujey) return CREDITOS_SUJEY;

    return CREDITOS_SUJEY.map((c) => ({
      ...c,
      contratoId: distribuidor.contratoId || 6802,
      coordinador: distribuidor.coordinador || 'ANTONIO RIOS CIGALA',
      nombreDistribuid: distribuidor.nombreCompleto || 'DISTRIBUIDOR',
      distribuidorId: distribuidor.distribuidorId || 9601,
      sucursal: distribuidor.sucursal || 'CHIHUAHUA',
    }));
  }, [distribuidor]);

  // Créditos filtrados por búsqueda
  const creditosFiltrados = useMemo(() => {
    if (!searchTexto.trim()) return creditos;
    const q = searchTexto.toLowerCase().trim();
    return creditos.filter(
      (c) =>
        c.creditoId.toString().includes(q) ||
        c.nombreCompleto.toLowerCase().includes(q) ||
        c.producto.toLowerCase().includes(q) ||
        c.personaId.toString().includes(q)
    );
  }, [creditos, searchTexto]);

  // Agrupaciones
  const grupoPrestamoPersonal = useMemo(() => {
    return creditosFiltrados.filter((c) => c.clasificacion === 'PRESTAMO PERSONAL DV');
  }, [creditosFiltrados]);

  const grupoValesDinero = useMemo(() => {
    return creditosFiltrados.filter((c) => c.clasificacion === 'VALE DE DINERO');
  }, [creditosFiltrados]);

  // Crédito Activo para Ficha Detalle
  const creditoActivo = useMemo(() => {
    return creditos.find((c) => c.creditoId === selectedCreditoId) || creditos[0];
  }, [creditos, selectedCreditoId]);

  // Amortización del crédito activo
  const amortizacion = useMemo(() => {
    if (!creditoActivo) return [];
    return generarAmortizacion(creditoActivo);
  }, [creditoActivo]);

  // Subtotales
  const subtotalPrestamo = useMemo(() => {
    return grupoPrestamoPersonal.reduce(
      (acc, c) => ({
        capital: acc.capital + c.capital,
        interes: acc.interes + c.interes,
        seguro: acc.seguro + c.seguro,
        iva: acc.iva + c.iva,
        importeTotal: acc.importeTotal + c.importeTotal,
        abonos: acc.abonos + c.abonos,
        pagoModa: acc.pagoModa + c.pagoModa,
        saldoActual: acc.saldoActual + c.saldoActual,
      }),
      { capital: 0, interes: 0, seguro: 0, iva: 0, importeTotal: 0, abonos: 0, pagoModa: 0, saldoActual: 0 }
    );
  }, [grupoPrestamoPersonal]);

  const subtotalVales = useMemo(() => {
    return grupoValesDinero.reduce(
      (acc, c) => ({
        capital: acc.capital + c.capital,
        interes: acc.interes + c.interes,
        seguro: acc.seguro + c.seguro,
        iva: acc.iva + c.iva,
        importeTotal: acc.importeTotal + c.importeTotal,
        abonos: acc.abonos + c.abonos,
        pagoModa: acc.pagoModa + c.pagoModa,
        saldoActual: acc.saldoActual + c.saldoActual,
      }),
      { capital: 0, interes: 0, seguro: 0, iva: 0, importeTotal: 0, abonos: 0, pagoModa: 0, saldoActual: 0 }
    );
  }, [grupoValesDinero]);

  // Totales Generales
  const totales = useMemo(() => {
    return {
      capital: subtotalPrestamo.capital + subtotalVales.capital,
      interes: subtotalPrestamo.interes + subtotalVales.interes,
      seguro: subtotalPrestamo.seguro + subtotalVales.seguro,
      iva: subtotalPrestamo.iva + subtotalVales.iva,
      importeTotal: subtotalPrestamo.importeTotal + subtotalVales.importeTotal,
      abonos: subtotalPrestamo.abonos + subtotalVales.abonos,
      pagoModa: subtotalPrestamo.pagoModa + subtotalVales.pagoModa,
      saldoActual: subtotalPrestamo.saldoActual + subtotalVales.saldoActual,
    };
  }, [subtotalPrestamo, subtotalVales]);

  // Exportar Créditos a Excel
  const handleExportExcel = () => {
    const exportData = creditosFiltrados.map((c) => ({
      'Contrato ID': c.contratoId,
      Coordinador: c.coordinador,
      'Credito ID': c.creditoId,
      'Nombre Distribuid': c.nombreDistribuid,
      'Distribuidor ID': c.distribuidorId,
      'Persona ID': c.personaId,
      'Nombre Completo': c.nombreCompleto,
      Plazos: c.plazos,
      'Porc Tasa Mensual': c.porcTasaMensual,
      Producto: c.producto,
      Capital: c.capital,
      Interes: c.interes,
      Seguro: c.seguro,
      IVA: c.iva,
      'Importe Total': c.importeTotal,
      Abonos: c.abonos,
      'Pago Moda': c.pagoModa,
      'Saldo Actual': c.saldoActual,
      'Dias Atraso': c.diasAtraso,
      Clasificacion: c.clasificacion,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Creditos_Detalle');
    XLSX.writeFile(wb, `detalles_creditos_${distribuidor?.contratoId || 'cartera'}.xlsx`);
    showToast('✓ Archivo Excel generado exitosamente.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const nivel = distribuidor?.distribuidorNivel || distribuidor?.nivel || 'ORO';

  // ==========================================================
  // RENDERIZADO DEL MODAL (ESTILO MODERNO SYSTEMCORE)
  // ==========================================================
  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[92vh] font-sans">
        {/* ======================================================== */}
        {/* HEADER MODERNO UNIFICADO                                 */}
        {/* ======================================================== */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Detalle de Cartera
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
                <span className="text-xs font-mono font-bold text-slate-400">
                  Contrato #{distribuidor?.contratoId || 8749}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-0.5">
                {distribuidor?.nombreCompleto || 'MARIA SUJEY PONCE MALDONADO'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'FICHA_DETALLE' && (
              <button
                type="button"
                onClick={() => setViewMode('LISTA_CREDITOS')}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Lista de Créditos</span>
              </button>
            )}

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
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VISTA 1: LISTADO DE CRÉDITOS AGRUPADOS                   */}
        {/* ======================================================== */}
        {viewMode === 'LISTA_CREDITOS' ? (
          <div className="flex flex-col flex-1 min-h-0 bg-[#f8fafc]">
            {/* Toolbar Superior: Búsqueda y Botones Operacionales */}
            <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Buscador en Vivo */}
              <div className="relative flex-1 min-w-[260px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por Crédito ID, Cliente, Producto o Persona ID..."
                  value={searchTexto}
                  onChange={(e) => setSearchTexto(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchTexto && (
                  <button
                    type="button"
                    onClick={() => setSearchTexto('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botones de Acción Modernos */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedCreditoId) {
                      setSelectedCreditoId(creditos[0]?.creditoId || null);
                    }
                    setViewMode('FICHA_DETALLE');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha Técnica</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Propuesta de convenio de cartera generada.')}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Generar Convenio</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Créditos actualizados correctamente.')}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Rápidos */}
            <div className="px-5 pt-3 pb-1 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Importe Total Colocado
                </span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatMoney(totales.importeTotal)}
                </span>
                <span className="text-[10px] text-slate-500 block">{creditosFiltrados.length} créditos registrados</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Capital Base</span>
                <span className="text-base font-extrabold text-slate-800 font-mono">
                  {formatMoney(totales.capital)}
                </span>
                <span className="text-[10px] text-slate-500 block">Interés: {formatMoney(totales.interes)}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Abonos</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono">
                  {formatMoney(totales.abonos)}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Pagos aplicados</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Saldo Actual</span>
                <span className="text-base font-extrabold text-indigo-700 font-mono">
                  {formatMoney(totales.saldoActual)}
                </span>
                <span className="text-[10px] text-slate-500 block">Por recuperar</span>
              </div>
            </div>

            {/* Tabla Principal con Scroll y Secciones Agrupadas */}
            <div className="flex-1 overflow-auto px-5 py-3">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
                  <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200 select-none z-10">
                    <tr>
                      <th className="px-3 py-2.5 text-center">Contrato</th>
                      <th className="px-3 py-2.5">Coordinador</th>
                      <th className="px-3 py-2.5 text-center">Crédito ID</th>
                      <th className="px-3 py-2.5">Distribuidor</th>
                      <th className="px-3 py-2.5 text-center">Persona ID</th>
                      <th className="px-3 py-2.5">Cliente Final</th>
                      <th className="px-3 py-2.5 text-center">Plazos</th>
                      <th className="px-3 py-2.5 text-center">Tasa</th>
                      <th className="px-3 py-2.5">Producto</th>
                      <th className="px-3 py-2.5 text-right">Capital</th>
                      <th className="px-3 py-2.5 text-right">Interés</th>
                      <th className="px-3 py-2.5 text-right">Seguro</th>
                      <th className="px-3 py-2.5 text-right">IVA</th>
                      <th className="px-3 py-2.5 text-right">Importe Total</th>
                      <th className="px-3 py-2.5 text-right">Abonos</th>
                      <th className="px-3 py-2.5 text-right">Pago Moda</th>
                      <th className="px-3 py-2.5 text-right">Saldo Actual</th>
                      <th className="px-3 py-2.5 text-center">Días Atraso</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {/* SECCIÓN 1: PRÉSTAMO PERSONAL DV */}
                    {grupoPrestamoPersonal.length > 0 && (
                      <>
                        <tr className="bg-blue-50/70 border-y border-blue-200/80">
                          <td colSpan={18} className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                              <span className="text-xs font-black uppercase text-blue-900 tracking-wider">
                                Préstamo Personal DV
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-blue-700 border border-blue-200">
                                {grupoPrestamoPersonal.length} registro
                              </span>
                            </div>
                          </td>
                        </tr>
                        {grupoPrestamoPersonal.map((c) => {
                          const isSelected = selectedCreditoId === c.creditoId;
                          return (
                            <tr
                              key={c.creditoId}
                              onClick={() => setSelectedCreditoId(c.creditoId)}
                              onDoubleClick={() => {
                                setSelectedCreditoId(c.creditoId);
                                setViewMode('FICHA_DETALLE');
                              }}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/90 font-semibold' : 'hover:bg-slate-50/80 bg-white'
                              }`}
                            >
                              <td className="px-3 py-2 text-center font-mono text-slate-500">#{c.contratoId}</td>
                              <td className="px-3 py-2 text-slate-700">{c.coordinador}</td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCreditoId(c.creditoId);
                                    setViewMode('FICHA_DETALLE');
                                  }}
                                  className="font-mono font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200/80 inline-flex items-center gap-1 transition"
                                  title="Ver ficha técnica"
                                >
                                  <span>#{c.creditoId}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </td>
                              <td className="px-3 py-2 text-slate-800 font-bold">{c.nombreDistribuid}</td>
                              <td className="px-3 py-2 text-center font-mono text-slate-500">#{c.personaId}</td>
                              <td className="px-3 py-2 font-bold text-slate-900">{c.nombreCompleto}</td>
                              <td className="px-3 py-2 text-center font-mono">{c.plazos}</td>
                              <td className="px-3 py-2 text-center font-mono text-slate-500">{c.porcTasaMensual}</td>
                              <td className="px-3 py-2 text-slate-600 text-[11px]">{c.producto}</td>
                              <td className="px-3 py-2 text-right font-mono">{formatMoney(c.capital)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-600">{formatMoney(c.interes)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-600">{formatMoney(c.seguro)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-600">{formatMoney(c.iva)}</td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                                {formatMoney(c.importeTotal)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">
                                {formatMoney(c.abonos)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-slate-700">{formatMoney(c.pagoModa)}</td>
                              <td className="px-3 py-2 text-right font-mono font-black text-slate-900">
                                {formatMoney(c.saldoActual)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                    c.diasAtraso > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {c.diasAtraso} d
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Subtotal Préstamos Personales */}
                        <tr className="bg-slate-50/90 font-bold font-mono text-[11px] border-t border-b border-slate-200 text-slate-800">
                          <td colSpan={9} className="px-4 py-2 font-sans text-right text-slate-600">
                            Subtotal Préstamo Personal:
                          </td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalPrestamo.capital)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalPrestamo.interes)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalPrestamo.seguro)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalPrestamo.iva)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalPrestamo.importeTotal)}</td>
                          <td className="px-3 py-2 text-right text-emerald-700">{formatMoney(subtotalPrestamo.abonos)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalPrestamo.pagoModa)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalPrestamo.saldoActual)}</td>
                          <td className="px-3 py-2"></td>
                        </tr>
                      </>
                    )}

                    {/* SECCIÓN 2: VALES DE DINERO */}
                    {grupoValesDinero.length > 0 && (
                      <>
                        <tr className="bg-purple-50/70 border-y border-purple-200/80">
                          <td colSpan={18} className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-600" />
                              <span className="text-xs font-black uppercase text-purple-900 tracking-wider">
                                Vales de Dinero
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-purple-700 border border-purple-200">
                                {grupoValesDinero.length} vales
                              </span>
                            </div>
                          </td>
                        </tr>
                        {grupoValesDinero.map((c) => {
                          const isSelected = selectedCreditoId === c.creditoId;
                          return (
                            <tr
                              key={c.creditoId}
                              onClick={() => setSelectedCreditoId(c.creditoId)}
                              onDoubleClick={() => {
                                setSelectedCreditoId(c.creditoId);
                                setViewMode('FICHA_DETALLE');
                              }}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-purple-50/80 font-semibold' : 'hover:bg-slate-50/80 bg-white'
                              }`}
                            >
                              <td className="px-3 py-2 text-center font-mono text-slate-500">#{c.contratoId}</td>
                              <td className="px-3 py-2 text-slate-700">{c.coordinador}</td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCreditoId(c.creditoId);
                                    setViewMode('FICHA_DETALLE');
                                  }}
                                  className="font-mono font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200/80 inline-flex items-center gap-1 transition"
                                  title="Ver ficha técnica"
                                >
                                  <span>#{c.creditoId}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </td>
                              <td className="px-3 py-2 text-slate-800 font-bold">{c.nombreDistribuid}</td>
                              <td className="px-3 py-2 text-center font-mono text-slate-500">#{c.personaId}</td>
                              <td className="px-3 py-2 font-bold text-slate-900">{c.nombreCompleto}</td>
                              <td className="px-3 py-2 text-center font-mono">{c.plazos}</td>
                              <td className="px-3 py-2 text-center font-mono text-slate-500">{c.porcTasaMensual}</td>
                              <td className="px-3 py-2 text-slate-600 text-[11px]">{c.producto}</td>
                              <td className="px-3 py-2 text-right font-mono">{formatMoney(c.capital)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-600">{formatMoney(c.interes)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-600">{formatMoney(c.seguro)}</td>
                              <td className="px-3 py-2 text-right font-mono text-slate-600">{formatMoney(c.iva)}</td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                                {formatMoney(c.importeTotal)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">
                                {formatMoney(c.abonos)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-slate-700">{formatMoney(c.pagoModa)}</td>
                              <td className="px-3 py-2 text-right font-mono font-black text-slate-900">
                                {formatMoney(c.saldoActual)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                    c.diasAtraso > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {c.diasAtraso} d
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Subtotal Vales de Dinero */}
                        <tr className="bg-slate-50/90 font-bold font-mono text-[11px] border-t border-b border-slate-200 text-slate-800">
                          <td colSpan={9} className="px-4 py-2 font-sans text-right text-slate-600">
                            Subtotal Vales de Dinero:
                          </td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalVales.capital)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalVales.interes)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalVales.seguro)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalVales.iva)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalVales.importeTotal)}</td>
                          <td className="px-3 py-2 text-right text-emerald-700">{formatMoney(subtotalVales.abonos)}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(subtotalVales.pagoModa)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">{formatMoney(subtotalVales.saldoActual)}</td>
                          <td className="px-3 py-2"></td>
                        </tr>
                      </>
                    )}
                  </tbody>

                  {/* Fila de Totales Generales */}
                  <tfoot className="bg-slate-100 font-extrabold font-mono text-xs border-t-2 border-slate-300 text-slate-950">
                    <tr>
                      <td colSpan={9} className="px-4 py-2.5 font-sans text-right uppercase tracking-wider text-slate-700">
                        Total General de Créditos:
                      </td>
                      <td className="px-3 py-2.5 text-right">{formatMoney(totales.capital)}</td>
                      <td className="px-3 py-2.5 text-right">{formatMoney(totales.interes)}</td>
                      <td className="px-3 py-2.5 text-right">{formatMoney(totales.seguro)}</td>
                      <td className="px-3 py-2.5 text-right">{formatMoney(totales.iva)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-950">{formatMoney(totales.importeTotal)}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-700">{formatMoney(totales.abonos)}</td>
                      <td className="px-3 py-2.5 text-right">{formatMoney(totales.pagoModa)}</td>
                      <td className="px-3 py-2.5 text-right text-indigo-900">{formatMoney(totales.saldoActual)}</td>
                      <td className="px-3 py-2.5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VISTA 2: FICHA TÉCNICA DEL CRÉDITO Y AMORTIZACIÓN        */
          /* ======================================================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#f8fafc]">
            {/* Header de la Ficha Técnica */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('LISTA_CREDITOS')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Volver"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {creditoActivo.clasificacion}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Folio Crédito #{creditoActivo.creditoId}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                    {creditoActivo.nombreCompleto}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Estatus: {creditoActivo.estatus}
                </span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                  {creditoActivo.plazos} quincenas
                </span>
              </div>
            </div>

            {/* Resumen Financiero Macro del Crédito */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Importe Total</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatMoney(creditoActivo.importeTotal)}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Capital Colocado</span>
                <span className="text-base font-extrabold text-slate-800 font-mono">
                  {formatMoney(creditoActivo.capital)}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Total Abonos</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono">
                  {formatMoney(creditoActivo.abonos)}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Saldo Actual</span>
                <span className="text-base font-extrabold text-indigo-700 font-mono">
                  {formatMoney(creditoActivo.saldoActual)}
                </span>
              </div>
            </div>

            {/* Layout Principal: Opciones a la Izquierda y Amortización a la Derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Sidebar Lateral de Opciones (17 Botones) */}
              <div className="lg:col-span-3 space-y-2">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                    Opciones de Crédito
                  </span>

                  {[
                    { label: 'Imprimir Detalle', icon: Printer, action: () => window.print() },
                    { label: 'Actualizar', icon: RefreshCw, action: () => showToast('Datos actualizados.') },
                    { label: 'Cancelar', icon: X, action: () => showToast('Función protegida por permisos.') },
                    { label: 'Imprimir Simple', icon: Printer, action: () => window.print() },
                    { label: 'Aplicar Abono', icon: DollarSign, action: () => showToast('Abriendo pasarela de pago...') },
                    { label: 'Activar Crédito', icon: CheckCircle2, action: () => showToast('Crédito activo.') },
                    { label: 'Cambiar Desembolso', icon: SlidersHorizontal, action: () => showToast('Módulo de desembolso.') },
                    { label: 'Cambiar Persona', icon: UserCheck, action: () => showToast('Modificación de persona.') },
                    { label: 'Cambiar Pagaré', icon: FileText, action: () => showToast('Actualización de pagaré.') },
                    { label: 'Registrar Aclaración', icon: MessageSquare, action: () => showToast('Ticket de aclaración generado.') },
                    { label: 'Comisión de apertura', icon: DollarSign, action: () => showToast('Comisión validada.') },
                    { label: 'Agregar Seguro', icon: ShieldCheck, action: () => showToast('Póliza de seguro agregada.') },
                    { label: 'Ver Notas', icon: MessageSquare, action: () => showToast('Abriendo notas...') },
                    { label: 'Generar Convenio', icon: FileCheck, action: () => showToast('Propuesta generada.') },
                    { label: 'Relación de Cobranza', icon: Receipt, action: () => showToast('Abriendo relación...') },
                    { label: 'Imprimir Pagaré', icon: Printer, action: () => window.print() },
                    { label: 'Pagaré PDF', icon: FileText, action: () => showToast('Descargando Pagaré PDF...') },
                  ].map((btn, idx) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={btn.action}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 border border-transparent hover:border-slate-200 transition flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{btn.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contenido Principal Derecho: Ficha Técnica & Tabla de Amortización */}
              <div className="lg:col-span-9 space-y-4">
                {/* Parámetros del Crédito */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                    Parámetros Técnicos del Crédito:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Contrato ID:</span>
                      <strong className="font-mono text-slate-800">#{creditoActivo.contratoId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Sucursal:</span>
                      <strong className="text-slate-800">CHIHUAHUA</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Coordinador:</span>
                      <strong className="text-slate-800">{creditoActivo.coordinador}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Fecha Desembolso:</span>
                      <strong className="font-mono text-slate-800">{creditoActivo.fechaDesembolso}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Tipo de Plazo:</span>
                      <strong className="text-slate-800">{creditoActivo.tipoPlazo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Método Desembolso:</span>
                      <strong className="text-slate-800">{creditoActivo.tipoDesembolso}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Último Abono:</span>
                      <strong className="font-mono text-emerald-700">{creditoActivo.fechaUltimoPago}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold">Movimiento ID:</span>
                      <strong className="font-mono text-slate-800">#{creditoActivo.movimientoId}</strong>
                    </div>
                  </div>
                </div>

                {/* Tabla de Amortización Quincenal */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Tabla de Amortización ({amortizacion.length} Quincenas):
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Cuota Quincenal: <strong className="text-slate-900 font-bold">{formatMoney(creditoActivo.pagoModa)}</strong>
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-mono">
                      <thead className="bg-slate-100/90 text-slate-600 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 text-center">No Pago</th>
                          <th className="px-3 py-2 text-center">Vencimiento</th>
                          <th className="px-3 py-2 text-right">Capital</th>
                          <th className="px-3 py-2 text-right">Interés</th>
                          <th className="px-3 py-2 text-right">Seguro</th>
                          <th className="px-3 py-2 text-right">IVA</th>
                          <th className="px-3 py-2 text-right">Importe Total</th>
                          <th className="px-3 py-2 text-right">Abonos</th>
                          <th className="px-3 py-2 text-right">Saldo Actual</th>
                          <th className="px-3 py-2 text-center">Fecha Pago</th>
                          <th className="px-3 py-2 text-center">Días Atraso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {amortizacion.map((p) => (
                          <tr key={p.noPago} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-2 text-center font-bold text-slate-900">#{p.noPago}</td>
                            <td className="px-3 py-2 text-center text-slate-700">{p.fechaVencimiento}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(p.capital)}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(p.interes)}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(p.seguro)}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(p.iva)}</td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">{formatMoney(p.importeTotal)}</td>
                            <td className="px-3 py-2 text-right font-bold text-emerald-700">{formatMoney(p.abonos)}</td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">{formatMoney(p.saldoActual)}</td>
                            <td className="px-3 py-2 text-center text-slate-600">{p.fechaPago || '-'}</td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.diasAtraso > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {p.diasAtraso} d
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer del Modal */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>Sistema Central de Cartera • LanAhora</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition active:scale-95 shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );

  if (!isOpen || !mounted || !distribuidor) return null;

  return createPortal(modalContent, document.body);
}
