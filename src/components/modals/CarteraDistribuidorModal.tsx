'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore, CreditoHistorialPersona } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import { formatMoney } from '@/lib/utils/formatters';
import {
  X,
  Search,
  FileSpreadsheet,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Layers,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Datos auténticos basados en el sistema (DV #1035 DIANA YANET PEREZ MARTINEZ)
const DEFAULT_CARTERA_DV_ITEMS: CreditoHistorialPersona[] = [
  // 1. CREDITO PROTECCION RELACION
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 429144,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 2606,
    nombreCompleto: 'DIANA YANET PEREZ MARTINEZ',
    plazos: 1,
    porcTasaMensual: 0.0,
    producto: 'VALE 0 QUINCENA(S)',
    capital: 0.0,
    interes: 0.0,
    seguro: 90.0,
    iva: 0.0,
    importeTotal: 90.0,
    abonos: 0.0,
    pagoModa: 0.0,
    saldoActual: 90.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-05-15',
    fechaHoraDesembolso: '2026-05-15',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 0,
    capitalPagado: 0,
    capitalPendiente: 0,
    interesPendiente: 0,
    seguroPendiente: 90,
    ivaPendiente: 0,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'DIGITAL',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-06-15',
    fechaUltimoPlazo: '2026-11-30',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Protección relación de cobranza',
    sucursal: 'SALTILLO',
    tipo: 'PROTECCION',
    clasificacionDesc: 'CREDITO PROTECCION RELACION',
  },

  // 2. PRESTAMO PERSONAL DV
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 398837,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 2606,
    nombreCompleto: 'DIANA YANET PEREZ MARTINEZ',
    plazos: 8,
    porcTasaMensual: 0.0,
    producto: 'VALE 8 QUINCENA(S) DISTRIBUIDOR',
    capital: 16500.0,
    interes: 3982.76,
    seguro: 480.0,
    iva: 637.24,
    importeTotal: 21600.0,
    abonos: 13500.0,
    pagoModa: 2700.0,
    saldoActual: 8100.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-06-01',
    fechaHoraDesembolso: '2026-06-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 101,
    capitalPagado: 10312.5,
    capitalPendiente: 6187.5,
    interesPendiente: 1493.53,
    seguroPendiente: 180,
    ivaPendiente: 238.97,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-06-15',
    fechaUltimoPlazo: '2026-09-30',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Préstamo personal a distribuidora',
    sucursal: 'SALTILLO',
    tipo: 'PERSONAL',
    clasificacionDesc: 'PRESTAMO PERSONAL DV',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 420094,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 2606,
    nombreCompleto: 'DIANA YANET PEREZ MARTINEZ',
    plazos: 8,
    porcTasaMensual: 0.0,
    producto: 'VALE 8 QUINCENA(S) DISTRIBUIDOR',
    capital: 16500.0,
    interes: 3982.76,
    seguro: 480.0,
    iva: 637.24,
    importeTotal: 21600.0,
    abonos: 2700.0,
    pagoModa: 2700.0,
    saldoActual: 18900.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-09-15',
    fechaHoraDesembolso: '2026-09-15',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 102,
    capitalPagado: 2062.5,
    capitalPendiente: 14437.5,
    interesPendiente: 3484.92,
    seguroPendiente: 420,
    ivaPendiente: 557.58,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-09-30',
    fechaUltimoPlazo: '2027-01-15',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Préstamo personal de apoyo DV',
    sucursal: 'SALTILLO',
    tipo: 'PERSONAL',
    clasificacionDesc: 'PRESTAMO PERSONAL DV',
  },

  // 3. VALE DE DINERO (Clientes Finales)
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 340521,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 39047,
    nombreCompleto: 'ADRIANA PATRICIA RODRIGUEZ SALAS',
    plazos: 16,
    porcTasaMensual: 0.0,
    producto: 'VALE 16 QUINCENA(S)',
    capital: 13000.0,
    interes: 8089.65,
    seguro: 960.0,
    iva: 1294.34,
    importeTotal: 23344.0,
    abonos: 21885.0,
    pagoModa: 1459.0,
    saldoActual: 1459.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-03-01',
    fechaHoraDesembolso: '2026-03-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 340521,
    capitalPagado: 12187.5,
    capitalPendiente: 812.5,
    interesPendiente: 505.6,
    seguroPendiente: 60,
    ivaPendiente: 80.9,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-03-15',
    fechaUltimoPlazo: '2026-10-31',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Vale de dinero cliente final',
    sucursal: 'SALTILLO',
    tipo: 'VALE_DINERO',
    clasificacionDesc: 'VALE DE DINERO',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 344944,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 9010,
    nombreCompleto: 'LIDIA MAGDALENA RODRIGUEZ GARCIA',
    plazos: 16,
    porcTasaMensual: 0.0,
    producto: 'VALE 16 QUINCENA(S)',
    capital: 13000.0,
    interes: 8089.65,
    seguro: 960.0,
    iva: 1294.34,
    importeTotal: 23344.0,
    abonos: 20426.0,
    pagoModa: 1459.0,
    saldoActual: 2918.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-03-15',
    fechaHoraDesembolso: '2026-03-15',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 344944,
    capitalPagado: 11375.0,
    capitalPendiente: 1625.0,
    interesPendiente: 1011.2,
    seguroPendiente: 120,
    ivaPendiente: 161.8,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-04-01',
    fechaUltimoPlazo: '2026-11-15',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Vale de dinero cliente final',
    sucursal: 'SALTILLO',
    tipo: 'VALE_DINERO',
    clasificacionDesc: 'VALE DE DINERO',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 355717,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 26687,
    nombreCompleto: 'NORA PATRICIA GAYTAN VARGAS',
    plazos: 14,
    porcTasaMensual: 0.0,
    producto: 'VALE 14 QUINCENA(S)',
    capital: 9000.0,
    interes: 5432.76,
    seguro: 840.0,
    iva: 869.24,
    importeTotal: 16142.0,
    abonos: 14989.0,
    pagoModa: 1153.0,
    saldoActual: 1153.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-04-01',
    fechaHoraDesembolso: '2026-04-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 355717,
    capitalPagado: 8357.14,
    capitalPendiente: 642.86,
    interesPendiente: 388.05,
    seguroPendiente: 60,
    ivaPendiente: 62.09,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-04-15',
    fechaUltimoPlazo: '2026-10-31',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Vale de dinero cliente final',
    sucursal: 'SALTILLO',
    tipo: 'VALE_DINERO',
    clasificacionDesc: 'VALE DE DINERO',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 354964,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 27907,
    nombreCompleto: 'ANGEL EDUARDO DE LA CRUZ ALVARADO',
    plazos: 16,
    porcTasaMensual: 0.0,
    producto: 'VALE 16 QUINCENA(S)',
    capital: 15000.0,
    interes: 9331.03,
    seguro: 960.0,
    iva: 1492.96,
    importeTotal: 26784.0,
    abonos: 21762.0,
    pagoModa: 1674.0,
    saldoActual: 5022.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-05-01',
    fechaHoraDesembolso: '2026-05-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 354964,
    capitalPagado: 12187.5,
    capitalPendiente: 2812.5,
    interesPendiente: 1749.57,
    seguroPendiente: 180,
    ivaPendiente: 279.93,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-05-15',
    fechaUltimoPlazo: '2026-12-31',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Vale de dinero cliente final',
    sucursal: 'SALTILLO',
    tipo: 'VALE_DINERO',
    clasificacionDesc: 'VALE DE DINERO',
  },
  {
    contratoId: 2605,
    coordinador: 'REYNA ELIZABETH GUTIERREZ ROSALES',
    creditoId: 354984,
    nombreDistribuidor: 'DIANA YANET PEREZ MARTINEZ',
    distribuidorId: 1035,
    personaId: 101105,
    nombreCompleto: 'JULIO CESAR VELAZQUEZ',
    plazos: 16,
    porcTasaMensual: 0.0,
    producto: 'VALE 16 QUINCENA(S)',
    capital: 15000.0,
    interes: 9331.03,
    seguro: 960.0,
    iva: 1492.96,
    importeTotal: 26784.0,
    abonos: 21762.0,
    pagoModa: 1674.0,
    saldoActual: 5022.0,
    diasAtraso: 0,
    saldoAtrasado: 0,
    fechaHoraRegistro: '2026-05-01',
    fechaHoraDesembolso: '2026-05-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 354984,
    capitalPagado: 12187.5,
    capitalPendiente: 2812.5,
    interesPendiente: 1749.57,
    seguroPendiente: 180,
    ivaPendiente: 279.93,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'VALE',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-05-15',
    fechaUltimoPlazo: '2026-12-31',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Vale de dinero cliente final',
    sucursal: 'SALTILLO',
    tipo: 'VALE_DINERO',
    clasificacionDesc: 'VALE DE DINERO',
  },
];

interface CarteraDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  onOpenDetallePerfil?: (distribuidor: DistribuidorCore) => void;
}

export default function CarteraDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
  onOpenDetallePerfil,
}: CarteraDistribuidorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Filtrado de créditos por búsqueda
  const filteredCredits = DEFAULT_CARTERA_DV_ITEMS.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      c.nombreCompleto.toLowerCase().includes(q) ||
      c.creditoId.toString().includes(q) ||
      c.producto.toLowerCase().includes(q) ||
      (c.clasificacionDesc && c.clasificacionDesc.toLowerCase().includes(q)) ||
      (c.observacion && c.observacion.toLowerCase().includes(q))
    );
  });

  // Agrupamiento por Clasificación de Crédito
  const grouped = filteredCredits.reduce((acc, item) => {
    const key = item.clasificacionDesc || 'VALE DE DINERO';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CreditoHistorialPersona[]>);

  // Totales Generales
  const grandTotals = filteredCredits.reduce(
    (acc, item) => {
      acc.capital += item.capital;
      acc.interes += item.interes;
      acc.seguro += item.seguro;
      acc.iva += item.iva;
      acc.importeTotal += item.importeTotal;
      acc.abonos += item.abonos;
      acc.pagoModa += item.pagoModa;
      acc.saldoActual += item.saldoActual;
      return acc;
    },
    {
      capital: 0,
      interes: 0,
      seguro: 0,
      iva: 0,
      importeTotal: 0,
      abonos: 0,
      pagoModa: 0,
      saldoActual: 0,
    }
  );

  const handleExportXLS = () => {
    const rows = filteredCredits.map((c) => ({
      'Contrato ID': c.contratoId,
      Coordinador: c.coordinador,
      'Crédito ID': c.creditoId,
      'Nombre Distribuidor': c.nombreDistribuidor,
      'Distribuidor ID': c.distribuidorId,
      'Persona ID': c.personaId,
      'Nombre Completo': c.nombreCompleto,
      Plazos: c.plazos,
      'Porc Tasa': `${c.porcTasaMensual}%`,
      Producto: c.producto,
      Capital: c.capital,
      Interés: c.interes,
      Seguro: c.seguro,
      IVA: c.iva,
      'Importe Total': c.importeTotal,
      Abonos: c.abonos,
      'Pago Moda': c.pagoModa,
      'Saldo Actual': c.saldoActual,
      'Días Atraso': c.diasAtraso,
      Clasificación: c.clasificacionDesc,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cartera DV');
    XLSX.writeFile(
      workbook,
      `Cartera_DV_${distribuidor.noDist}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-3 md:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-[98vw] max-w-[99vw] h-[95vh] max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        {/* Header Superior del Modal (IDÉNTICO a Personas/EditarClienteModal) */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/lanahora-logo-transparent.png"
              alt="LanAhora"
              className="h-7 w-auto object-contain"
            />
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                Cartera de Clientes · {distribuidor.nombreDistribuidor}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                DV #{distribuidor.noDist}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {distribuidor.estatus} · {distribuidor.nivel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDetallePerfil && (
              <button
                type="button"
                onClick={() => onOpenDetallePerfil(distribuidor)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Ver Detalle / Perfil
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen Financiero de la Cartera */}
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Línea de Crédito</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              {formatMoney(distribuidor.creditoLimite)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Saldo Cartera Vigente</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              {formatMoney(grandTotals.saldoActual)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Saldo Disponible</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono">
              {formatMoney(distribuidor.disponible)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Créditos / Vales</span>
            <span className="text-sm font-extrabold text-blue-700 font-mono">
              {filteredCredits.length} activos
            </span>
          </div>
        </div>

        {/* Toolbar de Búsqueda y Exportación */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cliente, vale, crédito o clasificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportXLS}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>

        {/* Tabla Agrupada con Scroll */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200 z-10">
              <tr>
                <th className="px-3 py-2.5">Contrato</th>
                <th className="px-3 py-2.5">Crédito ID</th>
                <th className="px-3 py-2.5">Cliente Final / DV</th>
                <th className="px-3 py-2.5 text-center">Plazos</th>
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
            <tbody className="divide-y divide-slate-100 font-medium">
              {Object.entries(grouped).map(([groupName, items]) => {
                const isCollapsed = !!collapsedGroups[groupName];

                // Subtotales del grupo
                const subCapital = items.reduce((acc, c) => acc + c.capital, 0);
                const subInteres = items.reduce((acc, c) => acc + c.interes, 0);
                const subSeguro = items.reduce((acc, c) => acc + c.seguro, 0);
                const subIva = items.reduce((acc, c) => acc + c.iva, 0);
                const subImporte = items.reduce((acc, c) => acc + c.importeTotal, 0);
                const subAbonos = items.reduce((acc, c) => acc + c.abonos, 0);
                const subPagoModa = items.reduce((acc, c) => acc + c.pagoModa, 0);
                const subSaldo = items.reduce((acc, c) => acc + c.saldoActual, 0);

                return (
                  <React.Fragment key={groupName}>
                    {/* Fila Encabezado de Grupo */}
                    <tr
                      onClick={() => toggleGroup(groupName)}
                      className="bg-slate-100 font-bold text-slate-900 cursor-pointer hover:bg-slate-200/80 transition select-none"
                    >
                      <td colSpan={14} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className="font-extrabold text-xs tracking-wide">
                            {groupName}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                            {items.length} {items.length === 1 ? 'crédito' : 'créditos'}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Filas de Créditos dentro del Grupo */}
                    {!isCollapsed &&
                      items.map((c) => (
                        <tr key={c.creditoId} className="hover:bg-slate-50 transition bg-white">
                          <td className="px-3 py-2 font-mono text-slate-600 text-center">
                            #{c.contratoId}
                          </td>
                          <td className="px-3 py-2 font-mono font-bold text-blue-600">
                            #{c.creditoId}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {c.nombreCompleto}
                          </td>
                          <td className="px-3 py-2 text-center font-mono">
                            {c.plazos}
                          </td>
                          <td className="px-3 py-2 text-slate-700 text-[11px]">
                            {c.producto}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {formatMoney(c.capital)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {formatMoney(c.interes)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {formatMoney(c.seguro)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {formatMoney(c.iva)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                            {formatMoney(c.importeTotal)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-600 font-semibold">
                            {formatMoney(c.abonos)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-slate-700">
                            {formatMoney(c.pagoModa)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                            {formatMoney(c.saldoActual)}
                          </td>
                          <td className="px-3 py-2 text-center font-mono font-bold text-emerald-600">
                            {c.diasAtraso}
                          </td>
                        </tr>
                      ))}

                    {/* Fila Subtotal del Grupo */}
                    {!isCollapsed && (
                      <tr className="bg-slate-50/80 font-bold border-b border-slate-200 text-xs">
                        <td colSpan={5} className="px-3 py-2 text-right text-slate-600">
                          Subtotal {groupName}:
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {formatMoney(subCapital)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {formatMoney(subInteres)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {formatMoney(subSeguro)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {formatMoney(subIva)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                          {formatMoney(subImporte)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-700">
                          {formatMoney(subAbonos)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {formatMoney(subPagoModa)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">
                          {formatMoney(subSaldo)}
                        </td>
                        <td className="px-3 py-2"></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Fila Gran Total al Fondo */}
            <tfoot className="sticky bottom-0 bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300 text-xs shadow-md">
              <tr>
                <td colSpan={5} className="px-3 py-2.5 text-right text-slate-800">
                  TOTAL GENERAL CARTERA:
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  {formatMoney(grandTotals.capital)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  {formatMoney(grandTotals.interes)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  {formatMoney(grandTotals.seguro)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  {formatMoney(grandTotals.iva)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-slate-950 font-black">
                  {formatMoney(grandTotals.importeTotal)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-emerald-800 font-bold">
                  {formatMoney(grandTotals.abonos)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  {formatMoney(grandTotals.pagoModa)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-blue-900 font-black">
                  {formatMoney(grandTotals.saldoActual)}
                </td>
                <td className="px-3 py-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>
            Mostrando <strong>{filteredCredits.length}</strong> créditos vigentes de la distribuidora
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
