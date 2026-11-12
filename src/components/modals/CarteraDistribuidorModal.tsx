'use client';

import React, { useState, useMemo } from 'react';
import { DistribuidorCore, CreditoHistorialPersona } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
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
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Datos auténticos basados en el sistema anterior (DV #1035 DIANA YANET PEREZ MARTINEZ)
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
    tipoDesembolso: 'SPEI',
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
    observacion: 'Préstamo personal quincenal',
    sucursal: 'SALTILLO',
    tipo: 'PRESTAMO_PERSONAL',
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
    fechaHoraRegistro: '2026-09-01',
    fechaHoraDesembolso: '2026-09-01',
    fechaHoraUltimoPago: '2026-10-31',
    valeCanje: 102,
    capitalPagado: 2062.5,
    capitalPendiente: 14437.5,
    interesPendiente: 3484.91,
    seguroPendiente: 420,
    ivaPendiente: 557.59,
    usuarioIdRegistro: 1,
    nomUsuarioRegistro: 'Sistema',
    pagosAtrasados: 0,
    tipoDesembolso: 'SPEI',
    estatus: 'ACTIVO',
    pagareEstatusDesc: 'FIRMADO',
    fechaPrimerPlazo: '2026-09-15',
    fechaUltimoPlazo: '2026-12-31',
    capitalAtrasado: 0,
    interesAtrasado: 0,
    comisionAtrasado: 0,
    seguroAtrasado: 0,
    cargoAtrasado: 0,
    ivaAtrasado: 0,
    observacion: 'Préstamo personal 2do ciclo',
    sucursal: 'SALTILLO',
    tipo: 'PRESTAMO_PERSONAL',
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
    fechaHoraRegistro: '2026-04-15',
    fechaHoraDesembolso: '2026-04-15',
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
    fechaPrimerPlazo: '2026-05-01',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Filtrado de créditos de cartera
  const filteredCredits = DEFAULT_CARTERA_DV_ITEMS.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.nombreCompleto.toLowerCase().includes(q) ||
      item.creditoId.toString().includes(q) ||
      item.personaId.toString().includes(q) ||
      item.producto.toLowerCase().includes(q) ||
      item.clasificacionDesc.toLowerCase().includes(q)
    );
  });

  // Agrupación por credito Clasificacion Desc
  const grouped = filteredCredits.reduce((acc, item) => {
    const key = item.clasificacionDesc || 'VALE DE DINERO';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CreditoHistorialPersona[]>);

  // Totales Generales
  const grandTotals = useMemo(() => {
    return filteredCredits.reduce(
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
  }, [filteredCredits]);

  // Exportar a Excel
  const handleExportXLS = () => {
    const rows = filteredCredits.map((c) => ({
      'Contrato ID': c.contratoId,
      Coordinador: c.coordinador,
      'Credito ID': c.creditoId,
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
      `cartera_dv_${distribuidor.noDist}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        {/* Barra Superior de Herramientas de Cartera */}
        <div className="bg-white p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Distribuidor:</span>
            <input
              type="text"
              disabled
              value={distribuidor.noDist}
              className="w-20 px-2 py-1 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded text-slate-900 text-center"
            />
            <button
              type="button"
              onClick={() => {
                if (onOpenDetallePerfil) onOpenDetallePerfil(distribuidor);
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded text-xs font-bold transition cursor-pointer"
            >
              Ver Detalles
            </button>
            <span className="text-xs font-bold text-slate-900 ml-2 hidden sm:inline">
              {distribuidor.nombreDistribuidor}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => alert('Generando convenio para DV...')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-semibold transition"
            >
              Generar convenio
            </button>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-semibold transition"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleExportXLS}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-semibold transition flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar a excel</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Personalización de columnas disponible')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded text-xs font-semibold transition"
            >
              Personalizar Columnas
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Búsqueda */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Introduzca el texto a buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 px-3 py-1 text-xs rounded focus:outline-none focus:border-blue-500 font-medium text-slate-900"
          />
        </div>

        {/* Píldora de Agrupamiento Activo */}
        <div className="bg-slate-100/90 px-4 py-1.5 border-b border-slate-200 flex items-center gap-2 text-xs shrink-0">
          <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-300 px-2 py-0.5 rounded shadow-2xs inline-flex items-center gap-1">
            <span>credito Clasificacion Desc</span>
            <span className="text-[9px] text-slate-400 font-mono">▲</span>
          </span>
          <span className="text-[11px] text-slate-400">
            (Arrastre una columna aquí para agrupar por dicha columna)
          </span>
        </div>

        {/* Tabla Agrupada con Scroll */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
            <thead className="sticky top-0 bg-slate-200 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-300 z-10">
              <tr>
                <th className="p-2 border-r border-slate-300">Contrato ID</th>
                <th className="p-2 border-r border-slate-300">Coordinador</th>
                <th className="p-2 border-r border-slate-300">Credito ID</th>
                <th className="p-2 border-r border-slate-300">Nombre Distribuidor</th>
                <th className="p-2 border-r border-slate-300">Distribuidor ID</th>
                <th className="p-2 border-r border-slate-300">Persona ID</th>
                <th className="p-2 border-r border-slate-300">Nombre Completo</th>
                <th className="p-2 border-r border-slate-300 text-center">Plazos</th>
                <th className="p-2 border-r border-slate-300 text-center">Porc Tasa Mensual</th>
                <th className="p-2 border-r border-slate-300">Producto</th>
                <th className="p-2 border-r border-slate-300 text-right">Capital</th>
                <th className="p-2 border-r border-slate-300 text-right">Interes</th>
                <th className="p-2 border-r border-slate-300 text-right">Seguro</th>
                <th className="p-2 border-r border-slate-300 text-right">IVA</th>
                <th className="p-2 border-r border-slate-300 text-right">Importe Total</th>
                <th className="p-2 border-r border-slate-300 text-right">Abonos</th>
                <th className="p-2 border-r border-slate-300 text-right">Pago Moda</th>
                <th className="p-2 border-r border-slate-300 text-right">Saldo Actual</th>
                <th className="p-2 text-center">Dias Atraso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
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
                      className="bg-slate-300/80 font-bold text-slate-900 cursor-pointer hover:bg-slate-300 transition select-none"
                    >
                      <td colSpan={19} className="p-2">
                        <div className="flex items-center gap-1.5">
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span>
                            credito Clasificacion Desc: <strong>{groupName}</strong>
                          </span>
                          <span className="text-slate-500 font-normal">
                            ({items.length} créditos)
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Filas de Créditos dentro del Grupo */}
                    {!isCollapsed &&
                      items.map((c) => (
                        <tr key={c.creditoId} className="hover:bg-blue-50/40 transition bg-white">
                          <td className="p-2 border-r border-slate-200 font-mono text-center">
                            {c.contratoId}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-800">
                            {c.coordinador}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-mono font-bold text-blue-600 hover:underline cursor-pointer">
                            {c.creditoId}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                            {c.nombreDistribuidor}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-mono text-center text-slate-600">
                            {c.distribuidorId}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-mono text-center text-slate-600">
                            {c.personaId}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                            {c.nombreCompleto}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">
                            {c.plazos}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">
                            {c.porcTasaMensual.toFixed(2)} %
                          </td>
                          <td className="p-2 border-r border-slate-200 font-mono text-slate-700">
                            {c.producto}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {c.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {c.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {c.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {c.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                            {c.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono text-emerald-700 font-semibold">
                            {c.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {c.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-blue-700">
                            {c.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-slate-700">
                            {c.diasAtraso}
                          </td>
                        </tr>
                      ))}

                    {/* Fila Subtotal del Grupo */}
                    {!isCollapsed && (
                      <tr className="bg-slate-100 font-bold border-b-2 border-slate-300 text-[11px]">
                        <td colSpan={10} className="p-2 text-right border-r border-slate-200">
                          Subtotal {groupName}:
                        </td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">
                          {subCapital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">
                          {subInteres.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">
                          {subSeguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">
                          {subIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-900 border-r border-slate-200">
                          {subImporte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-800 border-r border-slate-200">
                          {subAbonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono border-r border-slate-200">
                          {subPagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono text-blue-800 border-r border-slate-200">
                          {subSaldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2"></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Fila Gran Total al Fondo */}
            <tfoot className="sticky bottom-0 bg-slate-200/95 font-extrabold text-slate-900 border-t-2 border-slate-400 text-xs shadow-md">
              <tr>
                <td colSpan={10} className="p-2.5 text-right border-r border-slate-300">
                  TOTAL GENERAL CARTERA:
                </td>
                <td className="p-2.5 text-right font-mono border-r border-slate-300">
                  {grandTotals.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono border-r border-slate-300">
                  {grandTotals.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono border-r border-slate-300">
                  {grandTotals.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono border-r border-slate-300">
                  {grandTotals.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono text-slate-950 border-r border-slate-300">
                  {grandTotals.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono text-emerald-900 border-r border-slate-300">
                  {grandTotals.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono border-r border-slate-300">
                  {grandTotals.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono text-blue-900 border-r border-slate-300">
                  {grandTotals.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>
            Mostrando <strong>{filteredCredits.length}</strong> créditos vigentes de la distribuidora
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
          >
            Volver a Distribuidores
          </button>
        </div>
      </div>
    </div>
  );
}
