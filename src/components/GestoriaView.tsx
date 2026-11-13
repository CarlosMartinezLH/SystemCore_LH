'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  FileSpreadsheet,
  Building,
  User,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { buildSafeCsv } from '@/lib/utils/csv';
import { formatMoney } from '@/lib/utils/formatters';

export interface NotaGestoria {
  id: string;
  fechaHora: string;
  gestorNombre: string;
  tipoGestion: 'VISITA_DOMICILIARIA' | 'LLAMADA_TELEFONICA' | 'WHATSAPP' | 'CITATORIO_OFICIAL';
  resultado: 'PROMESA_DE_PAGO' | 'TITULAR_AUSENTE' | 'NEGOCIACION_EN_CURSO' | 'NEGATIVA_DE_PAGO' | 'CONVENIO_REESTRUCTURA';
  montoPrometido?: number;
  fechaCompromiso?: string;
  observaciones: string;
}

export interface CasoGestoria {
  id: string;
  noDist: number;
  distribuidorNombre: string;
  telefono: string;
  direccion: string;
  sucursal: string;
  saldoTotal: number;
  saldoVencido: number;
  diasAtraso: number;
  gestorAsignado: string;
  estatusCobranza: 'VISITA_PENDIENTE' | 'PROMESA_VIGENTE' | 'CONVENIO_ACTIVO' | 'PRE_JURIDICO';
  notas: NotaGestoria[];
}

const INITIAL_CASOS_GESTORIA: CasoGestoria[] = [
  {
    id: 'gest-001',
    noDist: 1012,
    distribuidorNombre: 'OLGA ALICIA HERRERA AREVALO',
    telefono: '844 665 5443',
    direccion: 'BLVD. ISIDRO LOPEZ 1890, COL. REPUBLICA, SALTILLO',
    sucursal: 'SALTILLO',
    saldoTotal: 84000,
    saldoVencido: 16800,
    diasAtraso: 12,
    gestorAsignado: 'Lic. Javier Estrada (Gestor Saltillo Poniente)',
    estatusCobranza: 'PROMESA_VIGENTE',
    notas: [
      {
        id: 'nota-101',
        fechaHora: '08/11/2026 11:20',
        gestorNombre: 'Lic. Javier Estrada',
        tipoGestion: 'VISITA_DOMICILIARIA',
        resultado: 'PROMESA_DE_PAGO',
        montoPrometido: 14112,
        fechaCompromiso: '15/11/2026',
        observaciones: 'Se visitó el domicilio particular. La DV confirma que liquidará vía SPEI antes de las 18:00 hrs para aprovechar su bonificación del 16%.',
      },
      {
        id: 'nota-102',
        fechaHora: '02/11/2026 09:45',
        gestorNombre: 'Lic. Javier Estrada',
        tipoGestion: 'LLAMADA_TELEFONICA',
        resultado: 'NEGOCIACION_EN_CURSO',
        observaciones: 'Refiere atraso temporal por cobro a clientes de vales en fábrica de Ramos Arizpe.',
      },
    ],
  },
  {
    id: 'gest-002',
    noDist: 1003,
    distribuidorNombre: 'LUCERO ESCAMILLA ORDOÑEZ',
    telefono: '844 912 3456',
    direccion: 'CALLE ZARAGOZA 410, CENTRO, SALTILLO',
    sucursal: 'SALTILLO',
    saldoTotal: 45000,
    saldoVencido: 8200,
    diasAtraso: 8,
    gestorAsignado: 'Lic. Javier Estrada (Gestor Saltillo Poniente)',
    estatusCobranza: 'VISITA_PENDIENTE',
    notas: [
      {
        id: 'nota-201',
        fechaHora: '06/11/2026 16:10',
        gestorNombre: 'Lic. Javier Estrada',
        tipoGestion: 'WHATSAPP',
        resultado: 'NEGOCIACION_EN_CURSO',
        observaciones: 'Se envió recordatorio con estado de cuenta y su CLABE virtual STP. Indica que tiene $5,000 en mano.',
      },
    ],
  },
  {
    id: 'gest-003',
    noDist: 1011,
    distribuidorNombre: 'LAURA RODRIGUEZ MENDEZ',
    telefono: '844 889 9001',
    direccion: 'AV. CONSTITUCION 780, COL. MORELOS, SALTILLO',
    sucursal: 'SALTILLO',
    saldoTotal: 32000,
    saldoVencido: 6500,
    diasAtraso: 18,
    gestorAsignado: 'Lic. Carmen Valdés (Gestora Saltillo Oriente)',
    estatusCobranza: 'PROMESA_VIGENTE',
    notas: [
      {
        id: 'nota-301',
        fechaHora: '07/11/2026 14:00',
        gestorNombre: 'Lic. Carmen Valdés',
        tipoGestion: 'VISITA_DOMICILIARIA',
        resultado: 'PROMESA_DE_PAGO',
        montoPrometido: 6500,
        fechaCompromiso: '12/11/2026',
        observaciones: 'Firma compromiso de pago por $6,500 en efectivo en sucursal o transferencia.',
      },
    ],
  },
  {
    id: 'gest-004',
    noDist: 1015,
    distribuidorNombre: 'FLORENCIA ESPINOSA BETANCOURT',
    telefono: '844 776 5432',
    direccion: 'CALLE 16 DE SEPTIEMBRE 220, MONCLOVA',
    sucursal: 'MONCLOVA',
    saldoTotal: 28000,
    saldoVencido: 4100,
    diasAtraso: 24,
    gestorAsignado: 'Lic. Roberto Morales (Gestor Monclova)',
    estatusCobranza: 'PRE_JURIDICO',
    notas: [
      {
        id: 'nota-401',
        fechaHora: '05/11/2026 10:15',
        gestorNombre: 'Lic. Roberto Morales',
        tipoGestion: 'CITATORIO_OFICIAL',
        resultado: 'TITULAR_AUSENTE',
        observaciones: 'Se dejó citatorio formal bajo puerta con familiar directo. Se requiere visita legal en 48 hrs.',
      },
    ],
  },
];

export default function GestoriaView() {
  const [casos, setCasos] = useState<CasoGestoria[]>(INITIAL_CASOS_GESTORIA);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterRangoMora, setFilterRangoMora] = useState<string>('TODOS');
  const [filterSucursal, setFilterSucursal] = useState<string>('TODAS');

  // Modal Nueva Nota
  const [selectedCasoForNote, setSelectedCasoForNote] = useState<CasoGestoria | null>(null);
  const [notaTipo, setNotaTipo] = useState<NotaGestoria['tipoGestion']>('VISITA_DOMICILIARIA');
  const [notaResultado, setNotaResultado] = useState<NotaGestoria['resultado']>('PROMESA_DE_PAGO');
  const [notaMontoPrometido, setNotaMontoPrometido] = useState<number>(5000);
  const [notaFechaCompromiso, setNotaFechaCompromiso] = useState<string>('2026-11-15');
  const [notaObservaciones, setNotaObservaciones] = useState<string>('');

  // Modal Timeline de Notas
  const [selectedCasoHistory, setSelectedCasoHistory] = useState<CasoGestoria | null>(null);

  const handleOpenNewNote = (caso: CasoGestoria) => {
    setSelectedCasoForNote(caso);
    setNotaTipo('VISITA_DOMICILIARIA');
    setNotaResultado('PROMESA_DE_PAGO');
    setNotaMontoPrometido(caso.saldoVencido);
    setNotaFechaCompromiso('2026-11-15');
    setNotaObservaciones('');
  };

  const handleSaveNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCasoForNote) return;

    const nuevaNota: NotaGestoria = {
      id: `nota-${Date.now()}`,
      fechaHora: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
      gestorNombre: selectedCasoForNote.gestorAsignado.split('(')[0].trim(),
      tipoGestion: notaTipo,
      resultado: notaResultado,
      montoPrometido: notaResultado === 'PROMESA_DE_PAGO' ? notaMontoPrometido : undefined,
      fechaCompromiso: notaResultado === 'PROMESA_DE_PAGO' ? notaFechaCompromiso : undefined,
      observaciones: notaObservaciones,
    };

    setCasos((prev) =>
      prev.map((c) => {
        if (c.id === selectedCasoForNote.id) {
          return {
            ...c,
            estatusCobranza:
              notaResultado === 'PROMESA_DE_PAGO'
                ? 'PROMESA_VIGENTE'
                : notaResultado === 'CONVENIO_REESTRUCTURA'
                ? 'CONVENIO_ACTIVO'
                : c.estatusCobranza,
            notas: [nuevaNota, ...c.notas],
          };
        }
        return c;
      })
    );

    setSelectedCasoForNote(null);
  };

  // Filtered List
  const filteredCasos = useMemo(() => {
    return casos.filter((c) => {
      if (filterSucursal !== 'TODAS' && c.sucursal !== filterSucursal) return false;
      if (filterRangoMora === '1_15' && (c.diasAtraso < 1 || c.diasAtraso > 15)) return false;
      if (filterRangoMora === '16_30' && (c.diasAtraso < 16 || c.diasAtraso > 30)) return false;
      if (filterRangoMora === '31_MAS' && c.diasAtraso < 31) return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          c.distribuidorNombre.toLowerCase().includes(q) ||
          c.noDist.toString().includes(q) ||
          c.direccion.toLowerCase().includes(q) ||
          c.gestorAsignado.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [casos, filterSucursal, filterRangoMora, searchFilter]);

  // KPIs
  const carteraVencidaTotal = useMemo(() => casos.reduce((acc, c) => acc + c.saldoVencido, 0), [casos]);
  const promesasVigentesMonto = useMemo(() => {
    return casos.reduce((acc, c) => {
      const p = c.notas.find((n) => n.resultado === 'PROMESA_DE_PAGO');
      return acc + (p?.montoPrometido || 0);
    }, 0);
  }, [casos]);

  const handleExportCSV = () => {
    const headers = [
      'No DV',
      'Distribuidora',
      'Teléfono',
      'Dirección',
      'Sucursal',
      'Saldo Total',
      'Saldo Vencido',
      'Días Mora',
      'Gestor Asignado',
      'Estatus Cobranza',
      'Última Nota Gestoría',
    ];
    const rows = casos.map((c) => [
      c.noDist,
      c.distribuidorNombre,
      c.telefono,
      c.direccion,
      c.sucursal,
      c.saldoTotal,
      c.saldoVencido,
      c.diasAtraso,
      c.gestorAsignado,
      c.estatusCobranza,
      c.notas[0]?.observaciones || 'Sin notas registradas',
    ]);
    const csvContent = buildSafeCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gestoria_cobranza_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-5">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cartera en Gestión</div>
            <div className="text-xl font-black text-rose-600 mt-1">
              {formatMoney(carteraVencidaTotal)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{casos.length} Cuentas con atraso</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Promesas de Pago</div>
            <div className="text-xl font-black text-emerald-700 mt-1">
              {formatMoney(promesasVigentesMonto)}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Compromisos semana corriente</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Efectividad Gestoría</div>
            <div className="text-xl font-black text-slate-900 mt-1">91.4%</div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Recuperación domiciliaria</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Notas Registradas</div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {casos.reduce((acc, c) => acc + c.notas.length, 0)} Bitácoras
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Trazabilidad oficial de cobro</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <FileText className="w-5 h-5" />
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
              placeholder="Buscar por DV, dirección o gestor..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={filterRangoMora}
            onChange={(e) => setFilterRangoMora(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="TODOS">Todos los Rangos de Mora</option>
            <option value="1_15">1 a 15 Días (Quincena 1)</option>
            <option value="16_30">16 a 30 Días (Quincena 2)</option>
            <option value="31_MAS">31+ Días (Cobranza Extrajudicial)</option>
          </select>

          <select
            value={filterSucursal}
            onChange={(e) => setFilterSucursal(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="TODAS">Todas las Sucursales</option>
            <option value="SALTILLO">Saltillo</option>
            <option value="MONCLOVA">Monclova</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exportar Bitácora</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
              <tr>
                <th className="py-3 px-3.5">Acciones</th>
                <th className="py-3 px-3.5">No. DV</th>
                <th className="py-3 px-3.5">Distribuidora</th>
                <th className="py-3 px-3.5 text-right">Saldo Exigible Vencido</th>
                <th className="py-3 px-3.5 text-center">Días Mora</th>
                <th className="py-3 px-3.5">Gestor Responsable</th>
                <th className="py-3 px-3.5">Última Nota Registrada</th>
                <th className="py-3 px-3.5 text-center">Estatus Cobranza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredCasos.map((c) => {
                const ultimaNota = c.notas[0];
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenNewNote(c)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition flex items-center gap-1 border border-blue-200 shadow-2xs"
                          title="Agregar nueva nota de cobranza o visita"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Nota</span>
                        </button>
                        <button
                          onClick={() => setSelectedCasoHistory(c)}
                          className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center gap-1"
                          title="Ver historial de notas"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Historial ({c.notas.length})</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">#{c.noDist}</td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-extrabold text-slate-900">{c.distribuidorNombre}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{c.telefono}</span>
                        <span>•</span>
                        <span>{c.sucursal}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-black text-rose-600 text-right text-xs">
                      {formatMoney(c.saldoVencido)}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.diasAtraso <= 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {c.diasAtraso} días
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 font-medium">{c.gestorAsignado}</td>
                    <td className="py-2.5 px-3.5 max-w-xs">
                      {ultimaNota ? (
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <span>{ultimaNota.fechaHora}</span>
                            <span>•</span>
                            <span className="text-blue-600">{ultimaNota.tipoGestion.replace('_', ' ')}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 truncate font-medium">
                            {ultimaNota.observaciones}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sin notas</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.estatusCobranza === 'PROMESA_VIGENTE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : c.estatusCobranza === 'PRE_JURIDICO'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.estatusCobranza.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Nota de Gestoría */}
      {selectedCasoForNote && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Registrar Nota de Gestoría: DV #{selectedCasoForNote.noDist}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCasoForNote(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNota} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{selectedCasoForNote.distribuidorNombre}</div>
                <div className="text-[11px] text-slate-500">{selectedCasoForNote.direccion}</div>
                <div className="text-[11px] font-mono text-rose-600 font-bold mt-1">
                  Saldo Vencido Exigible: {formatMoney(selectedCasoForNote.saldoVencido)} ({selectedCasoForNote.diasAtraso} días mora)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Gestión *</label>
                  <select
                    value={notaTipo}
                    onChange={(e) => setNotaTipo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="VISITA_DOMICILIARIA">Visita Domiciliaria en Campo</option>
                    <option value="LLAMADA_TELEFONICA">Llamada Telefónica</option>
                    <option value="WHATSAPP">WhatsApp de Cobranza</option>
                    <option value="CITATORIO_OFICIAL">Citatorio Formal Escrito</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resultado de la Gestión *</label>
                  <select
                    value={notaResultado}
                    onChange={(e) => setNotaResultado(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="PROMESA_DE_PAGO">Promesa de Pago</option>
                    <option value="TITULAR_AUSENTE">Titular Ausente</option>
                    <option value="NEGOCIACION_EN_CURSO">Negociación en Curso</option>
                    <option value="CONVENIO_REESTRUCTURA">Convenio de Reestructura</option>
                    <option value="NEGATIVA_DE_PAGO">Negativa de Pago</option>
                  </select>
                </div>
              </div>

              {notaResultado === 'PROMESA_DE_PAGO' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Monto Prometido ($ MXN) *</label>
                    <input
                      type="number"
                      value={notaMontoPrometido}
                      onChange={(e) => setNotaMontoPrometido(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Fecha Compromiso *</label>
                    <input
                      type="date"
                      value={notaFechaCompromiso}
                      onChange={(e) => setNotaFechaCompromiso(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones Detalladas del Gestor *</label>
                <textarea
                  rows={3}
                  value={notaObservaciones}
                  onChange={(e) => setNotaObservaciones(e.target.value)}
                  placeholder="Detallar lo platicado con la Distribuidora, motivos del atraso y acuerdos pactados..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCasoForNote(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Guardar Nota en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial de Notas */}
      {selectedCasoHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Bitácora de Notas: {selectedCasoHistory.distribuidorNombre}
                </h3>
                <p className="text-[11px] text-slate-500">Historial cronológico de visitas y acuerdos de cobranza.</p>
              </div>
              <button
                onClick={() => setSelectedCasoHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedCasoHistory.notas.map((nota) => (
                <div key={nota.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900">{nota.tipoGestion.replace('_', ' ')}</span>
                    <span className="text-[10px] font-mono text-slate-500">{nota.fechaHora}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {nota.resultado.replace('_', ' ')}
                    </span>
                    {nota.montoPrometido && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                        Promesa: {formatMoney(nota.montoPrometido)} ({nota.fechaCompromiso})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 text-[11px] font-medium pt-1">{nota.observaciones}</p>
                  <div className="text-[10px] text-slate-400 font-semibold pt-0.5">Gestor: {nota.gestorNombre}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCasoHistory(null)}
                className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
              >
                Cerrar Bitácora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
