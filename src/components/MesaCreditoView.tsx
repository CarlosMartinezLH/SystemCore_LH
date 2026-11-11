'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Building,
  ShieldCheck,
  FileText,
  Filter,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  Percent,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCoreSync } from '@/context/CoreSyncContext';
import { buildSafeCsv } from '@/lib/utils/csv';

interface SolicitudCredito {
  id: string;
  folioVale: string;
  clienteNombre: string;
  clienteCurp: string;
  clienteTelefono: string;
  noDist: number;
  distribuidorNombre: string;
  lineaDisponibleDV: number;
  montoSolicitado: number;
  plazos: number;
  tipoProducto: 'VALE_LANA' | 'LANATIENDA' | 'PERSONAL_DV';
  scoreBuro: number;
  estatusBuro: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'RIESGOSO';
  validacionReglas: 'APROBADO_SISTEMA' | 'REQUIERE_DICTAMEN' | 'RECHAZO_AUTOMATICO';
  estatusDictamen: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CONDICIONADO';
  fechaSolicitud: string;
  sucursal: string;
  analistaAsignado?: string;
  montoAutorizado?: number;
  notasDictamen?: string;
}

const INITIAL_SOLICITUDES: SolicitudCredito[] = [
  {
    id: 'sol-001',
    folioVale: 'V-50498',
    clienteNombre: 'MARTHA PATRICIA CASTILLO LOPEZ',
    clienteCurp: 'CALM880415MCLRR02',
    clienteTelefono: '844 190 2831',
    noDist: 1002,
    distribuidorNombre: 'BERTHA ALICIA TELLO LARA',
    lineaDisponibleDV: 37260,
    montoSolicitado: 6000,
    plazos: 8,
    tipoProducto: 'VALE_LANA',
    scoreBuro: 685,
    estatusBuro: 'EXCELENTE',
    validacionReglas: 'APROBADO_SISTEMA',
    estatusDictamen: 'PENDIENTE',
    fechaSolicitud: '09/11/2026 14:15',
    sucursal: 'SALTILLO',
  },
  {
    id: 'sol-002',
    folioVale: 'V-50499',
    clienteNombre: 'ROBERTO CARLOS MENDEZ SOTO',
    clienteCurp: 'MESR820921HCLRR09',
    clienteTelefono: '844 551 8840',
    noDist: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    lineaDisponibleDV: 82800,
    montoSolicitado: 8000,
    plazos: 10,
    tipoProducto: 'VALE_LANA',
    scoreBuro: 620,
    estatusBuro: 'BUENO',
    validacionReglas: 'APROBADO_SISTEMA',
    estatusDictamen: 'PENDIENTE',
    fechaSolicitud: '09/11/2026 15:02',
    sucursal: 'SALTILLO',
  },
  {
    id: 'sol-003',
    folioVale: 'V-50500',
    clienteNombre: 'SANDRA IVETH VILLARREAL GOMEZ',
    clienteCurp: 'VIGS910312MCLRR04',
    clienteTelefono: '871 229 1102',
    noDist: 1003,
    distribuidorNombre: 'LUCERO ESCAMILLA ORDOÑEZ',
    lineaDisponibleDV: 21500,
    montoSolicitado: 4500,
    plazos: 6,
    tipoProducto: 'LANATIENDA',
    scoreBuro: 590,
    estatusBuro: 'REGULAR',
    validacionReglas: 'REQUIERE_DICTAMEN',
    estatusDictamen: 'PENDIENTE',
    fechaSolicitud: '09/11/2026 15:28',
    sucursal: 'TORREÓN',
  },
  {
    id: 'sol-004',
    folioVale: 'V-50482',
    clienteNombre: 'FRANCISCO JAVIER OVIEDO RAMOS',
    clienteCurp: 'OVRF790704HCLRR01',
    clienteTelefono: '844 883 9102',
    noDist: 1011,
    distribuidorNombre: 'LAURA RODRIGUEZ MENDEZ',
    lineaDisponibleDV: 21100,
    montoSolicitado: 10000,
    plazos: 12,
    tipoProducto: 'VALE_LANA',
    scoreBuro: 540,
    estatusBuro: 'RIESGOSO',
    validacionReglas: 'REQUIERE_DICTAMEN',
    estatusDictamen: 'CONDICIONADO',
    montoAutorizado: 6000,
    fechaSolicitud: '09/11/2026 11:10',
    sucursal: 'SALTILLO',
    analistaAsignado: 'Mesa Riesgos Central',
    notasDictamen: 'Aprobado condicionado a reducción a $6,000 por score BC en 540.',
  },
  {
    id: 'sol-005',
    folioVale: 'V-50470',
    clienteNombre: 'GUADALUPE CECILIA ALVARADO REYES',
    clienteCurp: 'AARG860519MCLRR07',
    clienteTelefono: '844 332 9901',
    noDist: 1015,
    distribuidorNombre: 'FLORENCIA ESPINOSA BETANCOURT',
    lineaDisponibleDV: 18000,
    montoSolicitado: 5000,
    plazos: 6,
    tipoProducto: 'VALE_LANA',
    scoreBuro: 710,
    estatusBuro: 'EXCELENTE',
    validacionReglas: 'APROBADO_SISTEMA',
    estatusDictamen: 'APROBADO',
    montoAutorizado: 5000,
    fechaSolicitud: '09/11/2026 09:40',
    sucursal: 'SALTILLO',
    analistaAsignado: 'Mesa Riesgos Central',
    notasDictamen: 'Aprobado monto solicitado al 100%. Buró excelente.',
  },
];

export default function MesaCreditoView() {
  const { creditos } = useCoreSync();
  const [solicitudes, setSolicitudes] = useState<SolicitudCredito[]>(INITIAL_SOLICITUDES);
  const [filterEstatus, setFilterEstatus] = useState<string>('TODOS');
  const [filterSucursal, setFilterSucursal] = useState<string>('TODAS');
  const [searchFilter, setSearchFilter] = useState('');

  // Underwriting Modal
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudCredito | null>(null);
  const [dictamenDecision, setDictamenDecision] = useState<'APROBAR' | 'CONDICIONAR' | 'RECHAZAR'>('APROBAR');
  const [dictamenMonto, setDictamenMonto] = useState<number>(0);
  const [dictamenNotas, setDictamenNotas] = useState<string>('');

  const handleOpenDictamen = (sol: SolicitudCredito) => {
    setSelectedSolicitud(sol);
    setDictamenDecision('APROBAR');
    setDictamenMonto(sol.montoSolicitado);
    setDictamenNotas('Cumple parámetros normativos de riesgo y política de crédito.');
  };

  const handleGuardarDictamen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSolicitud) return;

    setSolicitudes((prev) =>
      prev.map((s) => {
        if (s.id === selectedSolicitud.id) {
          return {
            ...s,
            estatusDictamen:
              dictamenDecision === 'APROBAR'
                ? 'APROBADO'
                : dictamenDecision === 'CONDICIONAR'
                ? 'CONDICIONADO'
                : 'RECHAZADO',
            montoAutorizado: dictamenDecision === 'RECHAZAR' ? 0 : dictamenMonto,
            notasDictamen: dictamenNotas,
            analistaAsignado: 'Mesa de Crédito Central',
          };
        }
        return s;
      })
    );

    setSelectedSolicitud(null);
  };

  // Filtered List
  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((s) => {
      if (filterEstatus !== 'TODOS' && s.estatusDictamen !== filterEstatus) return false;
      if (filterSucursal !== 'TODAS' && s.sucursal !== filterSucursal) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          s.clienteNombre.toLowerCase().includes(q) ||
          s.folioVale.toLowerCase().includes(q) ||
          s.distribuidorNombre.toLowerCase().includes(q) ||
          s.clienteCurp.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [solicitudes, filterEstatus, filterSucursal, searchFilter]);

  // KPIs
  const pendientesCount = useMemo(() => solicitudes.filter((s) => s.estatusDictamen === 'PENDIENTE').length, [solicitudes]);
  const aprobadasCount = useMemo(() => solicitudes.filter((s) => s.estatusDictamen === 'APROBADO' || s.estatusDictamen === 'CONDICIONADO').length, [solicitudes]);
  const rechazadasCount = useMemo(() => solicitudes.filter((s) => s.estatusDictamen === 'RECHAZADO').length, [solicitudes]);
  const montoPendiente = useMemo(
    () => solicitudes.filter((s) => s.estatusDictamen === 'PENDIENTE').reduce((acc, s) => acc + s.montoSolicitado, 0),
    [solicitudes]
  );

  const handleExportCSV = () => {
    const headers = [
      'Folio Vale',
      'Cliente Acreditado',
      'CURP',
      'Distribuidora Aval',
      'No DV',
      'Monto Solicitado',
      'Plazos',
      'Score Buró',
      'Estatus Buró',
      'Validación Sistema',
      'Estatus Dictamen',
      'Monto Autorizado',
      'Sucursal',
    ];
    const rows = solicitudes.map((s) => [
      s.folioVale,
      s.clienteNombre,
      s.clienteCurp,
      s.distribuidorNombre,
      s.noDist,
      s.montoSolicitado,
      s.plazos,
      s.scoreBuro,
      s.estatusBuro,
      s.validacionReglas,
      s.estatusDictamen,
      s.montoAutorizado || s.montoSolicitado,
      s.sucursal,
    ]);
    const csvContent = buildSafeCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mesa_credito_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-5">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Por Dictaminar</div>
            <div className="text-xl font-black text-amber-600 mt-1">{pendientesCount} Solicitudes</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">${montoPendiente.toLocaleString('es-MX')} en revisión</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aprobadas Hoy</div>
            <div className="text-xl font-black text-emerald-700 mt-1">{aprobadasCount} Créditos</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Tasa de Aprobación: 89.2%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rechazadas por Riesgo</div>
            <div className="text-xl font-black text-rose-600 mt-1">{rechazadasCount} Solicitudes</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Score bajo o lista negra</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiempo Promedio Dictamen</div>
            <div className="text-xl font-black text-slate-900 mt-1">3.8 Minutos</div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Motor dbo.CreditoGeneraCanje</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por cliente, vale o distribuidora..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="TODOS">Todos los Estatus</option>
            <option value="PENDIENTE">Pendientes de Dictamen</option>
            <option value="APROBADO">Aprobados</option>
            <option value="CONDICIONADO">Condicionados</option>
            <option value="RECHAZADO">Rechazados</option>
          </select>

          <select
            value={filterSucursal}
            onChange={(e) => setFilterSucursal(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="TODAS">Todas las Sucursales</option>
            <option value="SALTILLO">Saltillo</option>
            <option value="TORREÓN">Torreón</option>
            <option value="MONCLOVA">Monclova</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exportar Cartera</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
              <tr>
                <th className="py-3 px-3.5">Acción</th>
                <th className="py-3 px-3.5">Folio Vale</th>
                <th className="py-3 px-3.5">Cliente Solicitante</th>
                <th className="py-3 px-3.5">Distribuidora Aval</th>
                <th className="py-3 px-3.5 text-right">Monto Solicitado</th>
                <th className="py-3 px-3.5 text-center">Plazo</th>
                <th className="py-3 px-3.5 text-center">Buró BC Score</th>
                <th className="py-3 px-3.5 text-center">Validación Reglas</th>
                <th className="py-3 px-3.5 text-center">Dictamen</th>
                <th className="py-3 px-3.5">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredSolicitudes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3.5">
                    {s.estatusDictamen === 'PENDIENTE' ? (
                      <button
                        onClick={() => handleOpenDictamen(s)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1 shadow-2xs"
                      >
                        <ClipboardCheck className="w-3 h-3" />
                        <span>Dictaminar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenDictamen(s)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Dictamen</span>
                      </button>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">{s.folioVale}</td>
                  <td className="py-2.5 px-3.5">
                    <div className="font-extrabold text-slate-900">{s.clienteNombre}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.clienteCurp}</div>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="font-bold text-slate-800">{s.distribuidorNombre}</div>
                    <div className="text-[10px] text-slate-400">
                      DV #{s.noDist} • Disponible: ${s.lineaDisponibleDV.toLocaleString('es-MX')}
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono font-black text-slate-900 text-right text-xs">
                    ${s.montoSolicitado.toLocaleString('es-MX')}
                  </td>
                  <td className="py-2.5 px-3.5 text-center font-bold text-slate-700">{s.plazos} Qnas</td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        s.scoreBuro >= 650
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : s.scoreBuro >= 580
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {s.scoreBuro} pts ({s.estatusBuro})
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.validacionReglas === 'APROBADO_SISTEMA'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {s.validacionReglas === 'APROBADO_SISTEMA' ? '✓ Cumple Políticas de Crédito' : '⚠ Requiere Análisis'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.estatusDictamen === 'APROBADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.estatusDictamen === 'CONDICIONADO'
                          ? 'bg-amber-100 text-amber-800'
                          : s.estatusDictamen === 'RECHAZADO'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.estatusDictamen}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">{s.fechaSolicitud}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Underwriting / Dictamen */}
      {selectedSolicitud && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Dictamen de Mesa de Control: {selectedSolicitud.folioVale}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSolicitud(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarDictamen} className="space-y-4 text-xs">
              {/* Resumen del Solicitante */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-black text-sm text-slate-900">{selectedSolicitud.clienteNombre}</div>
                    <div className="text-slate-500 font-mono text-[11px]">CURP: {selectedSolicitud.clienteCurp}</div>
                    <div className="text-slate-500 text-[11px]">Tel: {selectedSolicitud.clienteTelefono}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Score Buró de Crédito</span>
                    <div className="text-base font-black text-emerald-600 font-mono">{selectedSolicitud.scoreBuro} pts</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px]">
                  <span>Distribuidora Aval: <strong>{selectedSolicitud.distribuidorNombre}</strong></span>
                  <span>Disponible DV: <strong className="text-blue-700">${selectedSolicitud.lineaDisponibleDV.toLocaleString('es-MX')}</strong></span>
                </div>
              </div>

              {/* Parámetros del Crédito */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Monto Solicitado</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    ${selectedSolicitud.montoSolicitado.toLocaleString('es-MX')}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Plazo</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{selectedSolicitud.plazos} Quincenas</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Producto</div>
                  <div className="text-sm font-black text-blue-700 mt-0.5">{selectedSolicitud.tipoProducto}</div>
                </div>
              </div>

              {/* Decisión de Mesa */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-slate-700">Resolución de la Mesa de Crédito *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDictamenDecision('APROBAR');
                      setDictamenMonto(selectedSolicitud.montoSolicitado);
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      dictamenDecision === 'APROBAR'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Aprobar 100%
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDictamenDecision('CONDICIONAR');
                      setDictamenMonto(Math.round(selectedSolicitud.montoSolicitado * 0.7));
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      dictamenDecision === 'CONDICIONAR'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    ⚠ Condicionar Monto
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDictamenDecision('RECHAZAR');
                      setDictamenMonto(0);
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      dictamenDecision === 'RECHAZAR'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    ✕ Rechazar
                  </button>
                </div>

                {dictamenDecision === 'CONDICIONAR' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Monto Autorizado Ajustado ($ MXN) *</label>
                    <input
                      type="number"
                      value={dictamenMonto}
                      onChange={(e) => setDictamenMonto(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observaciones y Justificación del Dictamen *</label>
                  <textarea
                    rows={3}
                    value={dictamenNotas}
                    onChange={(e) => setDictamenNotas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSolicitud(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Confirmar Dictamen Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
