'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Search,
  FileSpreadsheet,
  RefreshCw,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

export interface ColocacionDistribuidorItem {
  distribuidorId: number;
  numeroDist: number;
  nombreCompleto: string;
  coordinador: string;
  sucursal: string;
  nivelId: 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';
  fechaHoraRegis: string;
  capital: number;
  interes: number;
  seguro: number;
  importeTotal: number;
  noCreditosColoc: number;
  distribuidorNuev: boolean;
  plazos: number;
  tasaInteres: number;
  creditoClasificacion: string[];
  telefonoMovil: string;
}

const INITIAL_COLOCACION_DISTRIBUIDORES: ColocacionDistribuidorItem[] = [
  // MAZATLÁN / ALBERTO PONCE DURAN (Datos oficiales de la pantalla legacy)
  {
    distribuidorId: 7185,
    numeroDist: 7185,
    nombreCompleto: 'NAYELIT PEREGRINO CABRERA',
    coordinador: 'ALBERTO PONCE DURAN',
    sucursal: 'MAZATLAN',
    nivelId: 'BRONCE',
    fechaHoraRegis: '02/04/2023',
    capital: 15570.90,
    interes: 0.00,
    seguro: 0.00,
    importeTotal: 15570.90,
    noCreditosColoc: 1,
    distribuidorNuev: false,
    plazos: 5,
    tasaInteres: 14,
    creditoClasificacion: [
      'VALE DE DINERO',
      'PRESTAMO PERSONAL DV',
      'LANATIENDA CLIENTE FINAL',
      'LANATIENDA DISTRIBUIDOR',
      'PRESTAMO DE EMPLEADOS',
      'PRESTAQUITA',
      'KITS DV',
    ],
    telefonoMovil: '(669) 149-4398',
  },
  {
    distribuidorId: 7714,
    numeroDist: 7714,
    nombreCompleto: 'MARTINA ISABEL DE LA CRUZ XX',
    coordinador: 'ALBERTO PONCE DURAN',
    sucursal: 'MAZATLAN',
    nivelId: 'BRONCE',
    fechaHoraRegis: '20/08/2025',
    capital: 23696.38,
    interes: 0.00,
    seguro: 0.00,
    importeTotal: 23696.38,
    noCreditosColoc: 1,
    distribuidorNuev: false,
    plazos: 11,
    tasaInteres: 14,
    creditoClasificacion: [
      'VALE DE DINERO',
      'PRESTAMO PERSONAL DV',
      'LANATIENDA CLIENTE FINAL',
      'LANATIENDA DISTRIBUIDOR',
      'PRESTAMO DE EMPLEADOS',
      'PRESTAQUITA',
      'KITS DV',
    ],
    telefonoMovil: '(669) 152-1102',
  },
  {
    distribuidorId: 7722,
    numeroDist: 7722,
    nombreCompleto: 'MARIA NATIVIDAD DE LA ROSA SANCHEZ',
    coordinador: 'ALBERTO PONCE DURAN',
    sucursal: 'MAZATLAN',
    nivelId: 'BRONCE',
    fechaHoraRegis: '25/08/2025',
    capital: 20807.00,
    interes: 0.00,
    seguro: 0.00,
    importeTotal: 20807.00,
    noCreditosColoc: 1,
    distribuidorNuev: false,
    plazos: 11,
    tasaInteres: 14,
    creditoClasificacion: [
      'VALE DE DINERO',
      'PRESTAMO PERSONAL DV',
      'LANATIENDA CLIENTE FINAL',
      'LANATIENDA DISTRIBUIDOR',
      'PRESTAMO DE EMPLEADOS',
    ],
    telefonoMovil: '(669) 163-8550',
  },
  {
    distribuidorId: 7810,
    numeroDist: 7810,
    nombreCompleto: 'CAROLINA BUSTAMANTE RIOS',
    coordinador: 'ALBERTO PONCE DURAN',
    sucursal: 'MAZATLAN',
    nivelId: 'PLATA',
    fechaHoraRegis: '10/01/2026',
    capital: 32400.00,
    interes: 4210.00,
    seguro: 960.00,
    importeTotal: 37570.00,
    noCreditosColoc: 2,
    distribuidorNuev: false,
    plazos: 14,
    tasaInteres: 14,
    creditoClasificacion: ['VALE DE DINERO', 'LANATIENDA CLIENTE FINAL'],
    telefonoMovil: '(669) 982-3411',
  },

  // CHIHUAHUA / ANTONIO RIOS CIGALA
  {
    distribuidorId: 9601,
    numeroDist: 9601,
    nombreCompleto: 'KAREN ADRIANA ONTIVEROS DIAZ',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    nivelId: 'PLATA',
    fechaHoraRegis: '15/01/2024',
    capital: 40000.00,
    interes: 5420.00,
    seguro: 1200.00,
    importeTotal: 46620.00,
    noCreditosColoc: 3,
    distribuidorNuev: false,
    plazos: 16,
    tasaInteres: 14,
    creditoClasificacion: ['VALE DE DINERO', 'LANATIENDA CLIENTE FINAL'],
    telefonoMovil: '(614) 279-9832',
  },
  {
    distribuidorId: 9832,
    numeroDist: 9832,
    nombreCompleto: 'MARIA SUJEY PONCE MALDONADO',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    nivelId: 'ORO',
    fechaHoraRegis: '03/10/2026',
    capital: 67500.00,
    interes: 37718.96,
    seguro: 13080.00,
    importeTotal: 124333.98,
    noCreditosColoc: 17,
    distribuidorNuev: false,
    plazos: 16,
    tasaInteres: 16,
    creditoClasificacion: ['VALE DE DINERO', 'PRESTAMO PERSONAL DV'],
    telefonoMovil: '(614) 188-4509',
  },
  {
    distribuidorId: 9420,
    numeroDist: 9420,
    nombreCompleto: 'ANA BERTHA VALLES CHAVEZ',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    nivelId: 'BRONCE',
    fechaHoraRegis: '18/02/2026',
    capital: 18500.00,
    interes: 2600.00,
    seguro: 720.00,
    importeTotal: 21820.00,
    noCreditosColoc: 1,
    distribuidorNuev: true,
    plazos: 10,
    tasaInteres: 14,
    creditoClasificacion: ['VALE DE DINERO'],
    telefonoMovil: '(614) 512-9901',
  },

  // SALTILLO / ALEJANDRO DOMINGUEZ
  {
    distribuidorId: 1002,
    numeroDist: 1002,
    nombreCompleto: 'BERTHA ALICIA TELLO LARA',
    coordinador: 'ALEJANDRO DOMINGUEZ',
    sucursal: 'SALTILLO',
    nivelId: 'DIAMANTE',
    fechaHoraRegis: '12/03/2022',
    capital: 48200.00,
    interes: 8600.00,
    seguro: 1500.00,
    importeTotal: 58300.00,
    noCreditosColoc: 12,
    distribuidorNuev: false,
    plazos: 16,
    tasaInteres: 12,
    creditoClasificacion: ['VALE DE DINERO', 'PRESTAMO PERSONAL DV'],
    telefonoMovil: '(844) 345-6789',
  },
  {
    distribuidorId: 1015,
    numeroDist: 1015,
    nombreCompleto: 'FLORENCIA ESPINOSA BETANCOURT',
    coordinador: 'ALEJANDRO DOMINGUEZ',
    sucursal: 'SALTILLO',
    nivelId: 'PLATA',
    fechaHoraRegis: '14/07/2023',
    capital: 28400.00,
    interes: 4100.00,
    seguro: 900.00,
    importeTotal: 33400.00,
    noCreditosColoc: 4,
    distribuidorNuev: false,
    plazos: 12,
    tasaInteres: 14,
    creditoClasificacion: ['VALE DE DINERO', 'LANATIENDA CLIENTE FINAL'],
    telefonoMovil: '(844) 621-4402',
  },

  // DURANGO / SERGIO MONTALVO GOMEZ
  {
    distribuidorId: 1012,
    numeroDist: 1012,
    nombreCompleto: 'OLGA ALICIA HERRERA AREVALO',
    coordinador: 'SERGIO MONTALVO GOMEZ',
    sucursal: 'DURANGO',
    nivelId: 'DIAMANTE',
    fechaHoraRegis: '08/09/2023',
    capital: 84000.00,
    interes: 14200.00,
    seguro: 2800.00,
    importeTotal: 101000.00,
    noCreditosColoc: 19,
    distribuidorNuev: false,
    plazos: 16,
    tasaInteres: 12,
    creditoClasificacion: ['VALE DE DINERO', 'LANATIENDA CLIENTE FINAL'],
    telefonoMovil: '(618) 555-1234',
  },
];

const CLASIFICACIONES_DISPONIBLES = [
  'VALE DE DINERO',
  'PRESTAMO PERSONAL DV',
  'LANATIENDA CLIENTE FINAL',
  'LANATIENDA DISTRIBUIDOR',
  'PRESTAMO DE EMPLEADOS',
  'PRESTAQUITA',
  'KITS DV',
];

export default function ReportesView() {
  // Filtros del Reporte
  const [fechaInicial, setFechaInicial] = useState('01/11/2026');
  const [fechaFinal, setFechaFinal] = useState('30/11/2026');
  const [selectedClasificaciones, setSelectedClasificaciones] = useState<string[]>([
    'VALE DE DINERO',
    'PRESTAMO PERSONAL DV',
    'LANATIENDA CLIENTE FINAL',
  ]);
  const [searchFilter, setSearchFilter] = useState('');
  const [groupByCoordinador, setGroupByCoordinador] = useState(true);
  const [groupBySucursal, setGroupBySucursal] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Modal de Personalizar Columnas
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    distribuidorId: true,
    numeroDist: true,
    nombreCompleto: true,
    nivelId: true,
    fechaHoraRegis: true,
    capital: true,
    interes: true,
    seguro: true,
    importeTotal: true,
    noCreditosColoc: true,
    distribuidorNuev: true,
    plazos: true,
    tasaInteres: true,
    creditoClasificacion: true,
    telefonoMovil: true,
  });

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleClasificacion = (clasif: string) => {
    setSelectedClasificaciones((prev) =>
      prev.includes(clasif) ? prev.filter((c) => c !== clasif) : [...prev, clasif]
    );
  };

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Filtered List
  const filteredData = useMemo(() => {
    return INITIAL_COLOCACION_DISTRIBUIDORES.filter((item) => {
      // Classification filter
      if (selectedClasificaciones.length > 0) {
        const matchesClass = item.creditoClasificacion.some((c) =>
          selectedClasificaciones.includes(c)
        );
        if (!matchesClass) return false;
      }

      // Search query
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        return (
          item.nombreCompleto.toLowerCase().includes(q) ||
          String(item.distribuidorId).includes(q) ||
          String(item.numeroDist).includes(q) ||
          item.coordinador.toLowerCase().includes(q) ||
          item.sucursal.toLowerCase().includes(q) ||
          item.telefonoMovil.includes(q) ||
          item.nivelId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedClasificaciones, searchFilter]);

  // Grouped Hierarchically by Coordinador -> Sucursal
  const groupedData = useMemo(() => {
    const groups: {
      coordinador: string;
      sucursal: string;
      items: ColocacionDistribuidorItem[];
      subtotalCapital: number;
      subtotalInteres: number;
      subtotalSeguro: number;
      subtotalImporte: number;
      subtotalCreditos: number;
    }[] = [];

    const map = new Map<string, ColocacionDistribuidorItem[]>();

    filteredData.forEach((item) => {
      const key = `${item.coordinador}___${item.sucursal}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    });

    map.forEach((items, key) => {
      const [coordinador, sucursal] = key.split('___');
      const subtotalCapital = items.reduce((acc, i) => acc + i.capital, 0);
      const subtotalInteres = items.reduce((acc, i) => acc + i.interes, 0);
      const subtotalSeguro = items.reduce((acc, i) => acc + i.seguro, 0);
      const subtotalImporte = items.reduce((acc, i) => acc + i.importeTotal, 0);
      const subtotalCreditos = items.reduce((acc, i) => acc + i.noCreditosColoc, 0);

      groups.push({
        coordinador,
        sucursal,
        items,
        subtotalCapital,
        subtotalInteres,
        subtotalSeguro,
        subtotalImporte,
        subtotalCreditos,
      });
    });

    return groups;
  }, [filteredData]);

  // Totales consolidados de la pantalla legacy
  const legacyTotales = {
    capital: 20879887.01,
    interes: 10053031.83,
    seguro: 2208220.00,
    importe: 34749622.83,
    creditos: 3099,
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportRows = filteredData.map((item) => ({
      Coordinador: item.coordinador,
      Sucursal: item.sucursal,
      Distribuidor_ID: item.distribuidorId,
      Numero_Dist: item.numeroDist,
      Nombre_Completo: item.nombreCompleto,
      Nivel_ID: item.nivelId,
      Fecha_Hora_Regis: item.fechaHoraRegis,
      Capital: item.capital,
      Interes: item.interes,
      Seguro: item.seguro,
      Importe_Total: item.importeTotal,
      No_Creditos_Coloc: item.noCreditosColoc,
      Distribuidor_Nuevo: item.distribuidorNuev ? 'SI' : 'NO',
      Plazos: item.plazos,
      Tasa_Interes: item.tasaInteres,
      Credito_Clasificacion: item.creditoClasificacion.join(', '),
      Telefono_Movil: item.telefonoMovil,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Colocacion_Distribuidor');
    XLSX.writeFile(
      wb,
      `reporte_colocacion_por_distribuidor_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('✓ Reporte de Colocación exportado a Excel exitosamente.');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4 text-slate-800 bg-slate-50">
      {/* ======================================================== */}
      {/* 1. ENCABEZADO LIMPIO (SIN MENÚS INTERNOS NI PESTAÑAS)     */}
      {/* ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Colocación Por Distribuidor
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Reporte Oficial
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidado de colocación quincenal de cartera agrupado por coordinador, plaza y producto
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BARRA DE FILTROS: FECHAS, CLASIFICACIÓN Y ACCIONES    */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Fechas Inicial y Final */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600">Fecha Inicial:</span>
              <input
                type="text"
                value={fechaInicial}
                onChange={(e) => setFechaInicial(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-800 w-28 text-center"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-600">Fecha Final:</span>
              <input
                type="text"
                value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-800 w-28 text-center"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => showToast('✓ Datos de colocación actualizados')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Actualizar</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar a excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCustomizeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Personalizar Columnas</span>
            </button>
          </div>
        </div>

        {/* Clasificación Multi-Select con Checkboxes */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-start gap-3">
          <span className="text-xs font-bold text-slate-700 pt-1">Clasificación:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {CLASIFICACIONES_DISPONIBLES.map((c) => {
              const isChecked = selectedClasificaciones.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleClasificacion(c)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-3 h-3 rounded text-blue-600 pointer-events-none"
                  />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BUSCADOR Y CHIPS DE AGRUPACIÓN (COORDINADOR, SUCURSAL) */}
      {/* ======================================================== */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Introduzca el texto a buscar (DV, nombre, teléfono, coordinador, sucursal)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chips de Agrupación Drag & Drop */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="text-[11px] text-slate-400 italic">
            Arrastre una columna aquí para agrupar por dicha columna:
          </span>
          <div className="flex items-center gap-1.5">
            <span
              onClick={() => setGroupByCoordinador(!groupByCoordinador)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition ${
                groupByCoordinador
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-white text-slate-400 border-dashed border-slate-200'
              }`}
              title="Clic para activar/desactivar agrupación por Coordinador"
            >
              <span>Coordinador</span>
              <span>▲</span>
            </span>
            <span
              onClick={() => setGroupBySucursal(!groupBySucursal)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition ${
                groupBySucursal
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-white text-slate-400 border-dashed border-slate-200'
              }`}
              title="Clic para activar/desactivar agrupación por Sucursal"
            >
              <span>Sucursal</span>
              <span>▲</span>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA PRINCIPAL DE COLOCACIÓN POR DISTRIBUIDOR        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                {visibleColumns.distribuidorId && (
                  <th className="px-3 py-3 w-24 text-center">Distribuidor ID</th>
                )}
                {visibleColumns.numeroDist && (
                  <th className="px-3 py-3 w-24 text-center">Numero Dist</th>
                )}
                {visibleColumns.nombreCompleto && (
                  <th className="px-3 py-3 min-w-[220px]">Nombre Completo</th>
                )}
                {visibleColumns.nivelId && (
                  <th className="px-3 py-3 w-20 text-center">Nivel ID</th>
                )}
                {visibleColumns.fechaHoraRegis && (
                  <th className="px-3 py-3 w-28 text-center">Fecha Hora Regis</th>
                )}
                {visibleColumns.capital && (
                  <th className="px-3 py-3 text-right">Capital</th>
                )}
                {visibleColumns.interes && (
                  <th className="px-3 py-3 text-right">Interes</th>
                )}
                {visibleColumns.seguro && (
                  <th className="px-3 py-3 text-right">Seguro</th>
                )}
                {visibleColumns.importeTotal && (
                  <th className="px-3 py-3 text-right">Importe Total</th>
                )}
                {visibleColumns.noCreditosColoc && (
                  <th className="px-3 py-3 text-center w-24">No Creditos Coloc</th>
                )}
                {visibleColumns.distribuidorNuev && (
                  <th className="px-3 py-3 text-center w-24">Distribuidor Nuev</th>
                )}
                {visibleColumns.plazos && (
                  <th className="px-3 py-3 text-center w-16">Plazos</th>
                )}
                {visibleColumns.tasaInteres && (
                  <th className="px-3 py-3 text-center w-20">Tasa Interes</th>
                )}
                {visibleColumns.creditoClasificacion && (
                  <th className="px-3 py-3 min-w-[240px]">credito Clasificaci</th>
                )}
                {visibleColumns.telefonoMovil && (
                  <th className="px-3 py-3 w-32">Telefono Movil</th>
                )}
              </tr>
            </thead>

            <tbody className="text-slate-700 font-medium text-xs">
              {groupedData.map((group) => {
                const groupKey = `${group.coordinador}___${group.sucursal}`;
                const isCollapsed = collapsedGroups[groupKey];

                return (
                  <React.Fragment key={groupKey}>
                    {/* ENCABEZADO DE GRUPO: COORDINADOR Y SUCURSAL */}
                    <tr
                      onClick={() => toggleGroupCollapse(groupKey)}
                      className="bg-slate-100/90 border-t border-b border-slate-200 font-bold text-slate-800 cursor-pointer hover:bg-slate-200/70 transition select-none"
                    >
                      <td colSpan={15} className="px-3 py-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span>{isCollapsed ? '▶' : '▼'}</span>
                            <span className="text-slate-900 uppercase">
                              Coordinador: {group.coordinador}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-blue-700 font-bold uppercase">
                              Sucursal: {group.sucursal}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                              {group.items.length} Distribuidora(s)
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
                            <span>Subtotal Capital: {formatMoney(group.subtotalCapital)}</span>
                            <span>•</span>
                            <span>Total: {formatMoney(group.subtotalImporte)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* FILAS DE DISTRIBUIDORAS DEL GRUPO */}
                    {!isCollapsed &&
                      group.items.map((item) => {
                        const badgeColor =
                          item.nivelId === 'DIAMANTE'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : item.nivelId === 'ORO'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : item.nivelId === 'PLATA'
                            ? 'bg-slate-100 text-slate-800 border-slate-200'
                            : 'bg-orange-100 text-orange-800 border-orange-200';

                        return (
                          <tr
                            key={item.distribuidorId}
                            className="hover:bg-blue-50/30 transition border-b border-slate-100"
                          >
                            {visibleColumns.distribuidorId && (
                              <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-900">
                                {item.distribuidorId}
                              </td>
                            )}
                            {visibleColumns.numeroDist && (
                              <td className="px-3 py-2.5 text-center font-mono text-slate-700">
                                {item.numeroDist}
                              </td>
                            )}
                            {visibleColumns.nombreCompleto && (
                              <td className="px-3 py-2.5 font-bold text-slate-900 uppercase">
                                {item.nombreCompleto}
                              </td>
                            )}
                            {visibleColumns.nivelId && (
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}
                                >
                                  {item.nivelId}
                                </span>
                              </td>
                            )}
                            {visibleColumns.fechaHoraRegis && (
                              <td className="px-3 py-2.5 text-center font-mono text-slate-600 whitespace-nowrap">
                                {item.fechaHoraRegis}
                              </td>
                            )}
                            {visibleColumns.capital && (
                              <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-800">
                                {formatMoney(item.capital)}
                              </td>
                            )}
                            {visibleColumns.interes && (
                              <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                                {formatMoney(item.interes)}
                              </td>
                            )}
                            {visibleColumns.seguro && (
                              <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                                {formatMoney(item.seguro)}
                              </td>
                            )}
                            {visibleColumns.importeTotal && (
                              <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900">
                                {formatMoney(item.importeTotal)}
                              </td>
                            )}
                            {visibleColumns.noCreditosColoc && (
                              <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                                {item.noCreditosColoc}
                              </td>
                            )}
                            {visibleColumns.distribuidorNuev && (
                              <td className="px-3 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={item.distribuidorNuev}
                                  readOnly
                                  className="w-3.5 h-3.5 rounded text-blue-600 pointer-events-none"
                                />
                              </td>
                            )}
                            {visibleColumns.plazos && (
                              <td className="px-3 py-2.5 text-center font-semibold text-slate-700">
                                {item.plazos}
                              </td>
                            )}
                            {visibleColumns.tasaInteres && (
                              <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-700">
                                {item.tasaInteres}%
                              </td>
                            )}
                            {visibleColumns.creditoClasificacion && (
                              <td className="px-3 py-2.5 text-[11px] text-slate-600 max-w-xs leading-relaxed">
                                {item.creditoClasificacion.join(', ')}
                              </td>
                            )}
                            {visibleColumns.telefonoMovil && (
                              <td className="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                                {item.telefonoMovil}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* FILA DE TOTALES GENERALES DEL REPORTE */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-mono font-bold text-slate-900 text-xs">
              <tr>
                <td colSpan={5} className="px-3 py-3 text-right uppercase font-sans">
                  Totales Globales de Cartera Colocada:
                </td>
                {visibleColumns.capital && (
                  <td className="px-3 py-3 text-right font-black text-slate-900">
                    {formatMoney(legacyTotales.capital)}
                  </td>
                )}
                {visibleColumns.interes && (
                  <td className="px-3 py-3 text-right font-black text-slate-900">
                    {formatMoney(legacyTotales.interes)}
                  </td>
                )}
                {visibleColumns.seguro && (
                  <td className="px-3 py-3 text-right font-black text-slate-900">
                    {formatMoney(legacyTotales.seguro)}
                  </td>
                )}
                {visibleColumns.importeTotal && (
                  <td className="px-3 py-3 text-right font-black text-blue-900 text-sm">
                    {formatMoney(legacyTotales.importe)}
                  </td>
                )}
                {visibleColumns.noCreditosColoc && (
                  <td className="px-3 py-3 text-center font-black text-slate-900">
                    {legacyTotales.creditos.toLocaleString()}
                  </td>
                )}
                <td colSpan={5} className="px-3 py-3 text-slate-400 font-normal font-sans">
                  (1,328 elementos consolidados)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* BARRA DE PAGINACIÓN ESTILO SISTEMA ANTERIOR */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span>Página 1 de 27 (1328 elementos)</span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              className="text-blue-600 hover:underline font-bold cursor-pointer"
              onClick={() => showToast('Generador de filtros avanzado')}
            >
              Crear filtro
            </button>
          </div>

          <div className="flex items-center gap-1 font-semibold">
            <button
              type="button"
              disabled
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]"
            >
              &lt;&lt;
            </button>
            <button
              type="button"
              disabled
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]"
            >
              &lt;
            </button>
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold text-[11px]">
              1
            </span>
            <button
              type="button"
              onClick={() => showToast('Navegando a página 2')}
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => showToast('Navegando a página 3')}
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => showToast('Navegando a página 4')}
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer"
            >
              4
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              type="button"
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer"
            >
              26
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer"
            >
              27
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer"
            >
              &gt;
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] cursor-pointer"
            >
              &gt;&gt;
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold cursor-pointer"
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: PERSONALIZAR COLUMNAS                         */}
      {/* ======================================================== */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Personalizar Columnas del Reporte</span>
              </h3>
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2 text-xs">
              {Object.entries({
                distribuidorId: 'Distribuidor ID',
                numeroDist: 'Numero Dist',
                nombreCompleto: 'Nombre Completo',
                nivelId: 'Nivel ID',
                fechaHoraRegis: 'Fecha Hora Regis',
                capital: 'Capital',
                interes: 'Interes',
                seguro: 'Seguro',
                importeTotal: 'Importe Total',
                noCreditosColoc: 'No Creditos Coloc',
                distribuidorNuev: 'Distribuidor Nuev',
                plazos: 'Plazos',
                tasaInteres: 'Tasa Interes',
                creditoClasificacion: 'credito Clasificaci',
                telefonoMovil: 'Telefono Movil',
              }).map(([key, label]) => {
                const k = key as keyof typeof visibleColumns;
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border hover:bg-slate-100 cursor-pointer"
                  >
                    <span className="font-bold text-slate-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={visibleColumns[k]}
                      onChange={() =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [k]: !prev[k],
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </label>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                Aplicar Columnas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border animate-in slide-in-from-bottom-3 duration-200 bg-slate-900 text-white border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
