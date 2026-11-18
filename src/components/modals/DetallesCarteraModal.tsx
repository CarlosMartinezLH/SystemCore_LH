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
    capital: 10000.00,
    interes: 2586.21,
    seguro: 600.00,
    iva: 413.79,
    importeTotal: 13600.00,
    abonos: 1756.70,
    pagoModa: 1360.00,
    saldoActual: 11843.30,
    diasAtraso: 13,
    clasificacion: 'PRESTAMO PERSONAL DV',
    estatus: 'ACTIVO',
    fechaRegistro: '03/10/2026',
    fechaDesembolso: '03/10/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 963.30,
    diasAtrasoMax: 21,
    movimientoId: 641073,
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
    capital: 3500.00,
    interes: 2182.76,
    seguro: 960.00,
    iva: 349.24,
    importeTotal: 6992.00,
    abonos: 564.50,
    pagoModa: 437.00,
    saldoActual: 6427.50,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '15/09/2026',
    fechaDesembolso: '15/09/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 437.00,
    diasAtrasoMax: 13,
    movimientoId: 631020,
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
    capital: 1500.00,
    interes: 941.38,
    seguro: 960.00,
    iva: 150.62,
    importeTotal: 3552.00,
    abonos: 1840.80,
    pagoModa: 222.00,
    saldoActual: 1711.20,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '20/05/2026',
    fechaDesembolso: '20/05/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 222.00,
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
    capital: 3500.00,
    interes: 2182.76,
    seguro: 960.00,
    iva: 349.24,
    importeTotal: 6992.00,
    abonos: 3623.50,
    pagoModa: 437.00,
    saldoActual: 3368.50,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '22/05/2026',
    fechaDesembolso: '22/05/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 437.00,
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
    capital: 5500.00,
    interes: 3424.14,
    seguro: 960.00,
    iva: 547.86,
    importeTotal: 10432.00,
    abonos: 5406.20,
    pagoModa: 652.00,
    saldoActual: 5025.80,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '10/05/2026',
    fechaDesembolso: '10/05/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 652.00,
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
    capital: 3000.00,
    interes: 1706.90,
    seguro: 720.00,
    iva: 273.10,
    importeTotal: 5700.00,
    abonos: 3463.60,
    pagoModa: 475.00,
    saldoActual: 2236.40,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '18/06/2026',
    fechaDesembolso: '18/06/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 475.00,
    diasAtrasoMax: 13,
    movimientoId: 588214,
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
    capital: 5000.00,
    interes: 3110.34,
    seguro: 960.00,
    iva: 497.66,
    importeTotal: 9568.00,
    abonos: 4360.40,
    pagoModa: 598.00,
    saldoActual: 5207.60,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '12/06/2026',
    fechaDesembolso: '12/06/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 598.00,
    diasAtrasoMax: 13,
    movimientoId: 585412,
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
    capital: 6000.00,
    interes: 3724.14,
    seguro: 960.00,
    iva: 595.86,
    importeTotal: 11280.00,
    abonos: 5140.60,
    pagoModa: 705.00,
    saldoActual: 6139.40,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '10/06/2026',
    fechaDesembolso: '10/06/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 705.00,
    diasAtrasoMax: 13,
    movimientoId: 584309,
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
    capital: 7500.00,
    interes: 4665.52,
    seguro: 960.00,
    iva: 746.48,
    importeTotal: 13872.00,
    abonos: 6321.90,
    pagoModa: 867.00,
    saldoActual: 7550.10,
    diasAtraso: 13,
    clasificacion: 'VALE DE DINERO',
    estatus: 'ACTIVO',
    fechaRegistro: '05/06/2026',
    fechaDesembolso: '05/06/2026',
    fechaUltimoPago: '16/11/2026',
    saldoAtrasado: 867.00,
    diasAtrasoMax: 13,
    movimientoId: 582104,
    usuarioRegistro: 605,
    tipoPlazo: 'QUINCENAL',
    tipoDesembolso: 'SPEI STP',
  },
];

// Generar Amortización de 10 Pagos exacta de la Imagen 2 para Crédito 415663
const AMORTIZACION_415663: AmortizacionPago[] = [
  { noPago: 1, fechaVencimiento: '15/10/2026', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 1360.00, saldoActual: 0.00, fechaLiquidacion: '10/11/2026', diasAtraso: 21, fechaPago: '10/11/2026 12:00:00' },
  { noPago: 2, fechaVencimiento: '31/10/2026', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 396.09, saldoActual: 963.91, fechaLiquidacion: '', diasAtraso: 13, fechaPago: '16/11/2026 12:00:00' },
  { noPago: 3, fechaVencimiento: '15/11/2026', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -2, fechaPago: '' },
  { noPago: 4, fechaVencimiento: '30/11/2026', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -17, fechaPago: '' },
  { noPago: 5, fechaVencimiento: '15/12/2026', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -32, fechaPago: '' },
  { noPago: 6, fechaVencimiento: '31/12/2026', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -48, fechaPago: '' },
  { noPago: 7, fechaVencimiento: '15/01/2027', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -63, fechaPago: '' },
  { noPago: 8, fechaVencimiento: '31/01/2027', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -79, fechaPago: '' },
  { noPago: 9, fechaVencimiento: '15/02/2027', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -94, fechaPago: '' },
  { noPago: 10, fechaVencimiento: '28/02/2027', capital: 1000.00, interes: 258.62, comision: 0.00, seguro: 60.00, cargo: 0.00, iva: 41.38, importeTotal: 1360.00, abonos: 0.00, saldoActual: 1360.00, fechaLiquidacion: '', diasAtraso: -107, fechaPago: '' },
];

interface DetallesCarteraModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: CarteraItem | null;
  currentUser?: UserSession | null;
}

export default function DetallesCarteraModal({
  isOpen,
  onClose,
  distribuidor,
  currentUser,
}: DetallesCarteraModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCreditoId, setSelectedCreditoId] = useState<number | null>(null);
  const [searchTexto, setSearchTexto] = useState('');
  const [viewMode, setViewMode] = useState<'LISTA_CREDITOS' | 'FICHA_DETALLE'>('LISTA_CREDITOS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Lista de créditos adaptada según el distribuidor
  const creditos = useMemo(() => {
    if (!distribuidor) return CREDITOS_SUJEY;

    if (distribuidor.numeroDist === 9832 || distribuidor.nombreCompleto.includes('SUJEY')) {
      return CREDITOS_SUJEY;
    }

    // Para Karen Adriana Ontiveros u otros distribuidores
    const isKaren = distribuidor.numeroDist === 9601 || distribuidor.nombreCompleto.includes('KAREN');
    const factor = distribuidor.saldoActual > 0 ? distribuidor.saldoActual / 78585.78 : 1;

    return CREDITOS_SUJEY.map((c, idx) => {
      if (idx === 0) {
        return {
          ...c,
          contratoId: distribuidor.contratoId,
          coordinador: distribuidor.coordinador,
          creditoId: isKaren ? 391200 : c.creditoId,
          nombreDistribuid: distribuidor.nombreCompleto,
          distribuidorId: distribuidor.numeroDist,
          personaId: distribuidor.personaId,
          nombreCompleto: distribuidor.nombreCompleto,
          capital: Math.round(c.capital * factor * 100) / 100,
          interes: Math.round(c.interes * factor * 100) / 100,
          seguro: Math.round(c.seguro * factor * 100) / 100,
          iva: Math.round(c.iva * factor * 100) / 100,
          importeTotal: Math.round(c.importeTotal * factor * 100) / 100,
          abonos: Math.round(c.abonos * factor * 100) / 100,
          saldoActual: Math.round(c.saldoActual * factor * 100) / 100,
        };
      }
      return {
        ...c,
        contratoId: distribuidor.contratoId,
        coordinador: distribuidor.coordinador,
        nombreDistribuid: distribuidor.nombreCompleto,
        distribuidorId: distribuidor.numeroDist,
        capital: Math.round(c.capital * factor * 100) / 100,
        interes: Math.round(c.interes * factor * 100) / 100,
        seguro: Math.round(c.seguro * factor * 100) / 100,
        iva: Math.round(c.iva * factor * 100) / 100,
        importeTotal: Math.round(c.importeTotal * factor * 100) / 100,
        abonos: Math.round(c.abonos * factor * 100) / 100,
        saldoActual: Math.round(c.saldoActual * factor * 100) / 100,
      };
    });
  }, [distribuidor]);

  // Crédito activo en la Ficha Técnica (Vista 2)
  const creditoActivo = useMemo(() => {
    if (!selectedCreditoId) return creditos[0];
    return creditos.find((c) => c.creditoId === selectedCreditoId) || creditos[0];
  }, [creditos, selectedCreditoId]);

  // Amortización calculada para el crédito activo
  const amortizacion = useMemo(() => {
    if (creditoActivo.creditoId === 415663) {
      return AMORTIZACION_415663;
    }
    const cuotaCapital = Math.round((creditoActivo.capital / creditoActivo.plazos) * 100) / 100;
    const cuotaInteres = Math.round((creditoActivo.interes / creditoActivo.plazos) * 100) / 100;
    const cuotaSeguro = Math.round((creditoActivo.seguro / creditoActivo.plazos) * 100) / 100;
    const cuotaIVA = Math.round((creditoActivo.iva / creditoActivo.plazos) * 100) / 100;
    const cuotaTotal = cuotaCapital + cuotaInteres + cuotaSeguro + cuotaIVA;

    const filas: AmortizacionPago[] = [];
    let saldo = creditoActivo.importeTotal;

    for (let i = 1; i <= creditoActivo.plazos; i++) {
      const pagado = i === 1 ? cuotaTotal : i === 2 ? Math.round(cuotaTotal * 0.3 * 100) / 100 : 0.00;
      saldo = Math.max(0, Math.round((saldo - pagado) * 100) / 100);

      filas.push({
        noPago: i,
        fechaVencimiento: `${i <= 2 ? '15' : '30'}/${(10 + Math.floor((i - 1) / 2)) % 12 || 12}/2026`,
        capital: cuotaCapital,
        interes: cuotaInteres,
        comision: 0.00,
        seguro: cuotaSeguro,
        cargo: 0.00,
        iva: cuotaIVA,
        importeTotal: cuotaTotal,
        abonos: pagado,
        saldoActual: saldo,
        fechaLiquidacion: i === 1 ? '10/11/2026' : '',
        diasAtraso: i === 1 ? 21 : i === 2 ? 13 : -(i * 15 - 15),
        fechaPago: i === 1 ? '10/11/2026 12:00:00' : i === 2 ? '16/11/2026 12:00:00' : '',
      });
    }
    return filas;
  }, [creditoActivo]);

  // Filtrado de Créditos en Vista 1
  const creditosFiltrados = useMemo(() => {
    if (!searchTexto.trim()) return creditos;
    const q = searchTexto.toLowerCase();
    return creditos.filter(
      (c) =>
        c.nombreCompleto.toLowerCase().includes(q) ||
        String(c.creditoId).includes(q) ||
        c.producto.toLowerCase().includes(q) ||
        c.clasificacion.toLowerCase().includes(q)
    );
  }, [creditos, searchTexto]);

  // Grupos por Clasificación
  const grupoPrestamoPersonal = useMemo(
    () => creditosFiltrados.filter((c) => c.clasificacion === 'PRESTAMO PERSONAL DV'),
    [creditosFiltrados]
  );
  const grupoValesDinero = useMemo(
    () => creditosFiltrados.filter((c) => c.clasificacion === 'VALE DE DINERO'),
    [creditosFiltrados]
  );

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
      'Coordinador': c.coordinador,
      'Credito ID': c.creditoId,
      'Nombre Distribuid': c.nombreDistribuid,
      'Distribuidor ID': c.distribuidorId,
      'Persona ID': c.personaId,
      'Nombre Completo': c.nombreCompleto,
      'Plazos': c.plazos,
      'Porc Tasa Mensual': c.porcTasaMensual,
      'Producto': c.producto,
      'Capital': c.capital,
      'Interes': c.interes,
      'Seguro': c.seguro,
      'IVA': c.iva,
      'Importe Total': c.importeTotal,
      'Abonos': c.abonos,
      'pago Moda': c.pagoModa,
      'Saldo Actual': c.saldoActual,
      'Dias Atraso': c.diasAtraso,
      'Clasificacion': c.clasificacion,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Creditos_Detalle');
    XLSX.writeFile(wb, `detalles_creditos_${distribuidor?.contratoId || 'cartera'}.xlsx`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================================
  // RENDERIZADO DEL MODAL
  // ==========================================================
  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1400px] my-auto overflow-hidden border border-slate-300 flex flex-col max-h-[94vh]">
        {/* ======================================================== */}
        {/* VISTA 1: LISTADO DE CRÉDITOS AGRUPADOS (IMAGEN 1)        */}
        {/* ======================================================== */}
        {viewMode === 'LISTA_CREDITOS' ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Barra Superior con Distribuidor y Botones */}
            <div className="bg-slate-100 border-b border-slate-300 p-3 sm:px-4 space-y-2.5 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-mono text-xs sm:text-sm font-bold text-slate-800">
                  <span>Distribuidor: </span>
                  <strong className="text-slate-950 font-black">
                    {distribuidor?.nombreCompleto || 'MARIA SUJEY PONCE MALDONADO'}
                  </strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedCreditoId) {
                        setSelectedCreditoId(creditos[0]?.creditoId || null);
                      }
                      setViewMode('FICHA_DETALLE');
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                    title="Ver ficha técnica completa del crédito seleccionado"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Generando propuesta de convenio de cartera...')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95"
                  >
                    <span>Generar convenio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Actualizando datos de créditos...')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-blue-600" />
                    <span>Actualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>Exportar a excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Personalización de columnas guardada.')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95"
                  >
                    <span>Personalizar Columnas</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Buscador Universal */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Introduzca el texto a buscar..."
                  value={searchTexto}
                  onChange={(e) => setSearchTexto(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
                />
                {searchTexto && (
                  <button
                    type="button"
                    onClick={() => setSearchTexto('')}
                    className="absolute right-2 top-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Agrupación DevExpress */}
            <div className="bg-slate-200/80 px-3 py-1 text-[11px] font-bold text-slate-700 border-b border-slate-300 flex items-center gap-1 select-none">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-300 shadow-2xs flex items-center gap-1 text-[10px]">
                <span>credito Clasificacion Desc</span>
                <span className="text-slate-400">▲</span>
              </span>
            </div>

            {/* Grid de Créditos con Grupos y Subtotales */}
            <div className="flex-1 overflow-auto bg-white min-h-[350px]">
              <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap font-mono">
                <thead className="sticky top-0 bg-slate-200 text-slate-800 font-bold border-b border-slate-300 text-[10px] uppercase select-none z-10 shadow-2xs">
                  <tr>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-center">Contrato ID</th>
                    <th className="p-1.5 px-2 border-r border-slate-300">Coordinador</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-center">Credito ID</th>
                    <th className="p-1.5 px-2 border-r border-slate-300">Nombre Distribuid</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-center">Distribuidor ID</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-center">Persona ID</th>
                    <th className="p-1.5 px-2 border-r border-slate-300">Nombre Completo</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-center">Plazos</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-center">Porc Tasa Mensual</th>
                    <th className="p-1.5 px-2 border-r border-slate-300">Producto</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">Capital</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">Interes</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">Seguro</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">IVA</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">Importe Total</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">Abonos</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">pago Moda</th>
                    <th className="p-1.5 px-2 border-r border-slate-300 text-right">Saldo Actual</th>
                    <th className="p-1.5 px-2 text-center">Dias Atraso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* ======================================================== */}
                  {/* GRUPO 1: PRESTAMO PERSONAL DV                            */}
                  {/* ======================================================== */}
                  {grupoPrestamoPersonal.length > 0 && (
                    <>
                      <tr className="bg-slate-300/80 font-bold text-slate-800 text-[10px]">
                        <td colSpan={19} className="p-1 px-3">
                          credito Clasificacion Desc: PRESTAMO PERSONAL DV
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
                              isSelected ? 'bg-blue-100 font-bold' : 'hover:bg-blue-50/50 bg-white'
                            }`}
                          >
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.contratoId}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200">{c.coordinador}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCreditoId(c.creditoId);
                                  setViewMode('FICHA_DETALLE');
                                }}
                                className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                              >
                                {c.creditoId}
                              </button>
                            </td>
                            <td className="p-1.5 px-2 border-r border-slate-200">{c.nombreDistribuid}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.distribuidorId}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.personaId}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 font-sans font-bold text-slate-900">{c.nombreCompleto}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.plazos}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.porcTasaMensual}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-[10px]">{c.producto}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right font-bold">{c.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right text-emerald-700">{c.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right font-black text-slate-900">{c.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 text-center font-bold text-rose-600">{c.diasAtraso}</td>
                          </tr>
                        );
                      })}
                      {/* Subtotal Fila PRESTAMO PERSONAL DV */}
                      <tr className="bg-slate-100 font-black border-t border-b border-slate-300 text-[10px]">
                        <td colSpan={10} className="p-1 px-3 text-right"></td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalPrestamo.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                      </tr>
                    </>
                  )}

                  {/* ======================================================== */}
                  {/* GRUPO 2: VALE DE DINERO                                  */}
                  {/* ======================================================== */}
                  {grupoValesDinero.length > 0 && (
                    <>
                      <tr className="bg-slate-300/80 font-bold text-slate-800 text-[10px]">
                        <td colSpan={19} className="p-1 px-3">
                          credito Clasificacion Desc: VALE DE DINERO
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
                              isSelected ? 'bg-blue-100 font-bold' : 'hover:bg-blue-50/50 bg-white'
                            }`}
                          >
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.contratoId}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200">{c.coordinador}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCreditoId(c.creditoId);
                                  setViewMode('FICHA_DETALLE');
                                }}
                                className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                              >
                                {c.creditoId}
                              </button>
                            </td>
                            <td className="p-1.5 px-2 border-r border-slate-200">{c.nombreDistribuid}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.distribuidorId}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.personaId}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 font-sans font-bold text-slate-900">{c.nombreCompleto}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.plazos}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-center">{c.porcTasaMensual}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-[10px]">{c.producto}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right font-bold">{c.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right text-emerald-700">{c.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right">{c.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 border-r border-slate-200 text-right font-black text-slate-900">{c.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 px-2 text-center font-bold text-rose-600">{c.diasAtraso}</td>
                          </tr>
                        );
                      })}
                      {/* Subtotal Fila VALE DE DINERO */}
                      <tr className="bg-slate-100 font-black border-t border-b border-slate-300 text-[10px]">
                        <td colSpan={10} className="p-1 px-3 text-right"></td>
                        <td className="p-1 px-2 text-right">{subtotalVales.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalVales.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalVales.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalVales.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalVales.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalVales.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalVales.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 px-2 text-right">{subtotalVales.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                      </tr>
                    </>
                  )}
                </tbody>
                {/* Footer de Totales Globales */}
                <tfoot className="sticky bottom-0 bg-slate-200 font-black border-t-2 border-slate-400 text-[10px] text-slate-900 shadow-lg">
                  <tr>
                    <td colSpan={10} className="p-2 px-3 text-right uppercase tracking-wider font-bold">
                      TOTALES ({creditosFiltrados.length} CRÉDITOS):
                    </td>
                    <td className="p-2 px-2 text-right">{totales.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 px-2 text-right">{totales.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 px-2 text-right">{totales.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 px-2 text-right">{totales.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 px-2 text-right text-blue-900">{totales.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 px-2 text-right text-emerald-800">{totales.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 px-2 text-right">{totales.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 px-2 text-right text-rose-900">{totales.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer de la Vista 1 */}
            <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="font-mono text-[11px]">
                <span>Página 1 de 1 ({creditosFiltrados.length} elementos) | Core LanAhora</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer transition active:scale-95 shadow-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VISTA 2: FICHA DE DETALLE DEL CRÉDITO (IMAGEN 2)         */
          /* ======================================================== */
          <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
            {/* Barra Superior con Botón de Regreso y Título */}
            <div className="bg-slate-100 border-b border-slate-300 p-2.5 sm:px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('LISTA_CREDITOS')}
                  className="px-3 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Lista de Créditos</span>
                </button>
                <div className="font-mono text-xs font-bold text-slate-800">
                  <span>Crédito ID: </span>
                  <strong className="text-blue-700 font-black">#{creditoActivo.creditoId}</strong>
                  <span className="mx-2">·</span>
                  <span>{creditoActivo.nombreCompleto}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout Dividido: Opciones a la Izquierda + Ficha Técnica y Tabla a la Derecha */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Panel Izquierdo: Opciones (Imagen 2) */}
              <div className="w-52 bg-slate-100 border-r border-slate-300 p-2 overflow-y-auto shrink-0 select-none text-xs space-y-1">
                <div className="bg-slate-200 px-2 py-1 font-bold text-slate-800 border-b border-slate-300 flex items-center justify-between text-[11px] mb-1">
                  <span>Opciones</span>
                  <span className="text-[10px] text-slate-500">▲</span>
                </div>

                {[
                  { label: 'Imprimir Detalle', action: () => window.print() },
                  { label: 'Actualizar', action: () => showToast('Actualizando datos...') },
                  { label: 'Cancelar', action: () => setViewMode('LISTA_CREDITOS') },
                  { label: 'Imprimir Simple', action: () => window.print() },
                  { label: 'Aplicar Abono', action: () => showToast('Abriendo ventana de abonos...') },
                  { label: 'Activar Crédito', action: () => showToast('El crédito ya está ACTIVO.') },
                  { label: 'Cambiar Desembolso', action: () => showToast('Opción de desembolso.') },
                  { label: 'Cambiar Persona', action: () => showToast('Cambio de titular.') },
                  { label: 'Autoriza cambio de dispersión', action: () => showToast('Autorización registrada.') },
                  { label: 'Suspende Crédito', action: () => showToast('Crédito suspendido.') },
                  { label: 'Reactiva Crédito', action: () => showToast('Crédito reactivado.') },
                  { label: 'Liquidación anticipada CF', action: () => showToast('Calculando liquidación anticipada...') },
                  { label: 'Subir documento', action: () => showToast('Abriendo gestor de documentos...') },
                  { label: 'Documentos registrados', action: () => showToast('Listando pagarés y contratos...') },
                  { label: 'STP detalle', action: () => showToast('Consultando tracking SPEI en STP...') },
                  { label: 'Enviar SMS', action: () => showToast('SMS de recordatorio enviado.') },
                  { label: 'Pagos Detalle', action: () => showToast('Amortización cargada.') },
                ].map((op, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={op.action}
                    className="w-full text-left px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-white hover:text-blue-700 rounded transition border border-transparent hover:border-slate-300 cursor-pointer"
                  >
                    {op.label}
                  </button>
                ))}
              </div>

              {/* Panel Derecho: Ficha de Campos y Tabla de Amortización */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {/* Cuadrícula de Campos de Cabecera (Imagen 2) */}
                <div className="border border-slate-300 rounded p-3 text-[11px] font-mono bg-slate-50/50 space-y-1.5">
                  {/* Fila 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Contrato ID:</span>
                      <input readOnly value={creditoActivo.contratoId} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-bold" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Credito ID:</span>
                      <input readOnly value={creditoActivo.creditoId} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-bold text-blue-700" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Estatus:</span>
                      <input readOnly value={creditoActivo.estatus} className="flex-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-black px-2 py-0.5 rounded text-xs" />
                    </div>
                  </div>

                  {/* Fila 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Persona ID:</span>
                      <input readOnly value={creditoActivo.personaId} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center sm:col-span-2">
                      <span className="w-28 text-slate-500 font-bold">Nombre Completo:</span>
                      <input readOnly value={creditoActivo.nombreCompleto} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-bold font-sans" />
                    </div>
                  </div>

                  {/* Fila 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Capital:</span>
                      <input readOnly value={creditoActivo.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-bold" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Interes:</span>
                      <input readOnly value={creditoActivo.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Comision:</span>
                      <input readOnly value="0.00" className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                  </div>

                  {/* Fila 4 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Seguro:</span>
                      <input readOnly value={creditoActivo.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Cargo:</span>
                      <input readOnly value="0.00" className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">IVA:</span>
                      <input readOnly value={creditoActivo.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                  </div>

                  {/* Fila 5 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Importe Total:</span>
                      <input readOnly value={creditoActivo.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-bold text-blue-900" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Abonos:</span>
                      <input readOnly value={creditoActivo.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs text-emerald-700 font-bold" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Saldo Actual:</span>
                      <input readOnly value={creditoActivo.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-black text-rose-700" />
                    </div>
                  </div>

                  {/* Fila 6 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Dias Atraso:</span>
                      <input readOnly value={creditoActivo.diasAtraso} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-bold text-rose-600" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Dias Atraso Max:</span>
                      <input readOnly value={creditoActivo.diasAtrasoMax} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Saldo Atrasado:</span>
                      <input readOnly value={creditoActivo.saldoAtrasado.toLocaleString('es-MX', { minimumFractionDigits: 2 })} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs font-bold text-rose-600" />
                    </div>
                  </div>

                  {/* Fila 7 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Fecha Registro:</span>
                      <input readOnly value={creditoActivo.fechaRegistro} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Fecha Desembolso:</span>
                      <input readOnly value={creditoActivo.fechaDesembolso} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Fecha Ultimo Pago:</span>
                      <input readOnly value={creditoActivo.fechaUltimoPago} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                  </div>

                  {/* Fila 8: Producto y Desembolso */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Producto:</span>
                      <input readOnly value={creditoActivo.producto} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Tipo Plazo:</span>
                      <input readOnly value={creditoActivo.tipoPlazo} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-slate-500 font-bold">Tipo Desembolso:</span>
                      <input readOnly value={creditoActivo.tipoDesembolso} className="flex-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs" />
                    </div>
                  </div>
                </div>

                {/* Tabla de Amortización Quincenal (Imagen 2) */}
                <div className="space-y-1">
                  <div className="bg-slate-200 px-3 py-1 font-bold text-slate-800 border border-slate-300 text-xs flex justify-between items-center">
                    <span>TABLA DE AMORTIZACIÓN Y PAGOS ({amortizacion.length} QUINCENAS)</span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3 h-3 text-blue-600" />
                      <span>Imprimir Tabla</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-300 rounded">
                    <table className="w-full text-left text-[11px] border-collapse font-mono whitespace-nowrap">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-300 text-[10px]">
                        <tr>
                          <th className="p-1 px-2 text-center">No Pago</th>
                          <th className="p-1 px-2 text-center">Fecha Vencimient</th>
                          <th className="p-1 px-2 text-right">Capital</th>
                          <th className="p-1 px-2 text-right">Interes</th>
                          <th className="p-1 px-2 text-right">Comision</th>
                          <th className="p-1 px-2 text-right">Seguro</th>
                          <th className="p-1 px-2 text-right">Cargo</th>
                          <th className="p-1 px-2 text-right">IVA</th>
                          <th className="p-1 px-2 text-right">Importe Total</th>
                          <th className="p-1 px-2 text-right">Abonos</th>
                          <th className="p-1 px-2 text-right">Saldo Actual</th>
                          <th className="p-1 px-2 text-center">Fecha Liquidacion</th>
                          <th className="p-1 px-2 text-center">Dias Atraso</th>
                          <th className="p-1 px-2 text-center">Fecha de Pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {amortizacion.map((p) => (
                          <tr key={p.noPago} className="hover:bg-slate-50">
                            <td className="p-1 px-2 text-center font-bold text-slate-900">{p.noPago}</td>
                            <td className="p-1 px-2 text-center text-slate-700">{p.fechaVencimiento}</td>
                            <td className="p-1 px-2 text-right">{p.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1 px-2 text-right">{p.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1 px-2 text-right">{p.comision.toFixed(2)}</td>
                            <td className="p-1 px-2 text-right">{p.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1 px-2 text-right">{p.cargo.toFixed(2)}</td>
                            <td className="p-1 px-2 text-right">{p.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1 px-2 text-right font-bold text-slate-900">{p.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1 px-2 text-right font-bold text-emerald-700">{p.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1 px-2 text-right font-bold text-slate-900">{p.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-1 px-2 text-center text-slate-600">{p.fechaLiquidacion || ''}</td>
                            <td className={`p-1 px-2 text-center font-bold ${p.diasAtraso > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                              {p.diasAtraso}
                            </td>
                            <td className="p-1 px-2 text-center text-slate-600">{p.fechaPago || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer de la Vista 2 */}
            <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('LISTA_CREDITOS')}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Lista de Créditos</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer transition active:scale-95 shadow-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
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
