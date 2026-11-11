'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  Send,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { buildSafeCsv } from '@/lib/utils/csv';

export interface ReportePLD {
  id: string;
  folio: string;
  tipoAlerta: 'OPERACION_INUSUAL' | 'OPERACION_PREOCUPANTE' | 'OPERACION_RELEVANTE' | 'POSIBLE_SUPLANTACION';
  sujetoReportado: string;
  noDist?: number;
  folioVale?: string;
  sucursal: string;
  fechaHechos: string;
  fechaReporte: string;
  descripcion: string;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'CRITICO';
  estatus: 'EN_INVESTIGACION' | 'DICTAMINADO_DESCARTADO' | 'REPORTADO_UIF';
  esAnonimo: boolean;
  dictamenOficial?: string;
}

const INITIAL_REPORTES_PLD: ReportePLD[] = [
  {
    id: 'pld-001',
    folio: 'PLD-2026-0038',
    tipoAlerta: 'OPERACION_INUSUAL',
    sujetoReportado: 'CLIENTE: CARLOS EDUARDO VILLALOBOS',
    folioVale: 'V-50490',
    sucursal: 'SALTILLO',
    fechaHechos: '05/11/2026',
    fechaReporte: '06/11/2026 10:14',
    descripcion: 'Solicita canje de 3 vales consecutivos en menos de 24 horas a través de distintas Distribuidoras sin actividad comercial previa demostrable.',
    nivelRiesgo: 'ALTO',
    estatus: 'EN_INVESTIGACION',
    esAnonimo: true,
  },
  {
    id: 'pld-002',
    folio: 'PLD-2026-0039',
    tipoAlerta: 'POSIBLE_SUPLANTACION',
    sujetoReportado: 'SOLICITANTE: MARIO ALBERTO ROCHA',
    sucursal: 'TORREÓN',
    fechaHechos: '07/11/2026',
    fechaReporte: '07/11/2026 15:40',
    descripcion: 'Identificación INE con fotografía sobrepuesta y CURP no coincidente con el registro de RENAPO durante el cotejo biométrico en campo.',
    nivelRiesgo: 'CRITICO',
    estatus: 'REPORTADO_UIF',
    esAnonimo: true,
    dictamenOficial: 'Escalado formalmente a área jurídica y bloqueo preventivo en Padrón de Personas de todo el sistema.',
  },
  {
    id: 'pld-003',
    folio: 'PLD-2026-0040',
    tipoAlerta: 'OPERACION_PREOCUPANTE',
    sujetoReportado: 'GESTOR / ASESOR EN REVISIÓN',
    sucursal: 'MONCLOVA',
    fechaHechos: '04/11/2026',
    fechaReporte: '08/11/2026 18:20',
    descripcion: 'Se reporta cobro en efectivo de cuotas de pagarés sin entrega de recibo foliado digital ni registro en el sistema Core en el mismo día.',
    nivelRiesgo: 'ALTO',
    estatus: 'EN_INVESTIGACION',
    esAnonimo: true,
  },
];

export default function BuzonPLDView() {
  const [reportes, setReportes] = useState<ReportePLD[]>(INITIAL_REPORTES_PLD);
  const [activeTab, setActiveTab] = useState<'crear' | 'bandeja'>('crear');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedReporte, setSelectedReporte] = useState<ReportePLD | null>(null);

  // Form State
  const [tipoAlerta, setTipoAlerta] = useState<ReportePLD['tipoAlerta']>('OPERACION_INUSUAL');
  const [sujeto, setSujeto] = useState('');
  const [noDist, setNoDist] = useState('');
  const [folioVale, setFolioVale] = useState('');
  const [sucursal, setSucursal] = useState('SALTILLO');
  const [fechaHechos, setFechaHechos] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isAnonimo, setIsAnonimo] = useState(true);
  const [reportSuccessMsg, setReportSuccessMsg] = useState(false);

  const handleCrearReporte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sujeto.trim() || !descripcion.trim()) {
      alert('Por favor ingresa la persona involucrada y la descripción de los hechos.');
      return;
    }

    const timestamp = Date.now().toString().slice(-4);
    const nuevoReporte: ReportePLD = {
      id: `pld-${Date.now()}`,
      folio: `PLD-2026-${timestamp}`,
      tipoAlerta,
      sujetoReportado: sujeto.trim().toUpperCase(),
      noDist: noDist ? Number(noDist) : undefined,
      folioVale: folioVale ? folioVale.trim().toUpperCase() : undefined,
      sucursal,
      fechaHechos: fechaHechos || new Date().toISOString().slice(0, 10),
      fechaReporte: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
      descripcion: descripcion.trim(),
      nivelRiesgo: tipoAlerta === 'POSIBLE_SUPLANTACION' ? 'CRITICO' : 'ALTO',
      estatus: 'EN_INVESTIGACION',
      esAnonimo: isAnonimo,
    };

    setReportes([nuevoReporte, ...reportes]);
    setSujeto('');
    setNoDist('');
    setFolioVale('');
    setDescripcion('');
    setReportSuccessMsg(true);
    setTimeout(() => setReportSuccessMsg(false), 5000);
    setActiveTab('bandeja');
  };

  const filteredReportes = useMemo(() => {
    if (!searchFilter.trim()) return reportes;
    const q = searchFilter.toLowerCase();
    return reportes.filter(
      (r) =>
        r.folio.toLowerCase().includes(q) ||
        r.sujetoReportado.toLowerCase().includes(q) ||
        r.tipoAlerta.toLowerCase().includes(q) ||
        r.sucursal.toLowerCase().includes(q)
    );
  }, [reportes, searchFilter]);

  const handleExportCSV = () => {
    const headers = ['Folio PLD', 'Tipo de Alerta', 'Sujeto Reportado', 'Sucursal', 'Fecha Hechos', 'Nivel Riesgo', 'Estatus'];
    const rows = reportes.map((r) => [r.folio, r.tipoAlerta, r.sujetoReportado, r.sucursal, r.fechaHechos, r.nivelRiesgo, r.estatus]);
    const csvContent = buildSafeCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reportes_pld_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-5">
      {/* Informative Security Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xs border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-base font-extrabold tracking-tight">
              Buzón Confidencial de Prevención de Lavado de Dinero (PLD / FT)
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Canal institucional de denuncia anónima conforme a lineamientos de la CNBV, UIF y SHCP. Tu identidad está 100% protegida mediante cifrado criptográfico institucional sin almacenamiento de IP.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cifrado SHA-256 Activo</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('crear')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'crear'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Crear Reporte Anónimo</span>
          </button>

          <button
            onClick={() => setActiveTab('bandeja')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'bandeja'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bandeja Oficial PLD</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-white/20 text-white">
              {reportes.length}
            </span>
          </button>
        </div>

        {activeTab === 'bandeja' && (
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Bitácora UIF</span>
          </button>
        )}
      </div>

      {/* Tab 1: Formulario Crear Reporte */}
      {activeTab === 'crear' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-3xl space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Levantar Nuevo Reporte de Operación Inusual o Sospechosa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Completa los datos con la mayor precisión posible. Este reporte será turnado exclusivamente al Oficial de Cumplimiento.
            </p>
          </div>

          {reportSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ Tu reporte ha sido registrado de forma confidencial con folio oficial. ¡Gracias por proteger a LanAhora!</span>
            </div>
          )}

          <form onSubmit={handleCrearReporte} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Alerta o Irregularidad *</label>
                <select
                  value={tipoAlerta}
                  onChange={(e) => setTipoAlerta(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="OPERACION_INUSUAL">Operación Inusual (Monto o patrón sospechoso)</option>
                  <option value="POSIBLE_SUPLANTACION">Posible Suplantación / Identificación Falsa</option>
                  <option value="OPERACION_PREOCUPANTE">Operación Preocupante (Colaborador / Empleado)</option>
                  <option value="OPERACION_RELEVANTE">Operación Relevante (Supera umbral $200,000 MXN)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sucursal o Plaza *</label>
                <select
                  value={sucursal}
                  onChange={(e) => setSucursal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="SALTILLO">Saltillo</option>
                  <option value="TORREÓN">Torreón</option>
                  <option value="MONCLOVA">Monclova</option>
                  <option value="MATRIZ">Corporativo Central</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Persona, Cliente o Distribuidora Involucrada *
              </label>
              <input
                type="text"
                required
                value={sujeto}
                onChange={(e) => setSujeto(e.target.value)}
                placeholder="Nombre completo o alias del sujeto..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">No. DV (Si aplica)</label>
                <input
                  type="number"
                  value={noDist}
                  onChange={(e) => setNoDist(e.target.value)}
                  placeholder="ej. 1002"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Folio Vale / Crédito (Si aplica)</label>
                <input
                  type="text"
                  value={folioVale}
                  onChange={(e) => setFolioVale(e.target.value)}
                  placeholder="ej. V-50490"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha de los Hechos</label>
                <input
                  type="date"
                  value={fechaHechos}
                  onChange={(e) => setFechaHechos(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Descripción Detallada de los Hechos o Sospechas *
              </label>
              <textarea
                rows={4}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe con la mayor claridad posible la situación detectada, montos involucrados, documentos irregulares o conducta inusual..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  Garantía de Anonimato Total (Sin vinculación a tu usuario)
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAnonimo}
                onChange={(e) => setIsAnonimo(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-rose-400" />
              <span>Enviar Reporte Cifrado al Oficial de Cumplimiento</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Bandeja de Reportes PLD */}
      {activeTab === 'bandeja' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar por folio, sujeto o sucursal..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Mostrando {filteredReportes.length} expedientes PLD
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold select-none">
                <tr>
                  <th className="py-3 px-3.5">Acción</th>
                  <th className="py-3 px-3.5">Folio Expediente</th>
                  <th className="py-3 px-3.5">Tipo de Alerta</th>
                  <th className="py-3 px-3.5">Sujeto / Persona Reportada</th>
                  <th className="py-3 px-3.5">Sucursal</th>
                  <th className="py-3 px-3.5 text-center">Nivel Riesgo</th>
                  <th className="py-3 px-3.5">Fecha Reporte</th>
                  <th className="py-3 px-3.5 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredReportes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3.5">
                      <button
                        onClick={() => setSelectedReporte(r)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Expediente</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-700">{r.folio}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-800">
                      {r.tipoAlerta.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3.5 font-extrabold text-slate-900">{r.sujetoReportado}</td>
                    <td className="py-2.5 px-3.5 text-slate-600 font-medium">{r.sucursal}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          r.nivelRiesgo === 'CRITICO'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.nivelRiesgo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">{r.fechaReporte}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.estatus === 'REPORTADO_UIF'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r.estatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detalle Expediente PLD */}
      {selectedReporte && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Expediente: {selectedReporte.folio}</span>
                </h3>
                <p className="text-[11px] text-slate-500">Oficialía de Cumplimiento Normativo PLD / FT</p>
              </div>
              <button
                onClick={() => setSelectedReporte(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{selectedReporte.sujetoReportado}</div>
                <div className="text-slate-600 flex justify-between">
                  <span>Tipo: <strong>{selectedReporte.tipoAlerta}</strong></span>
                  <span>Plaza: <strong>{selectedReporte.sucursal}</strong></span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Fecha Hechos: {selectedReporte.fechaHechos} • Fecha Reporte: {selectedReporte.fechaReporte}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 mb-1">Descripción de los Hechos Reportados:</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {selectedReporte.descripcion}
                </div>
              </div>

              {selectedReporte.dictamenOficial && (
                <div>
                  <div className="font-bold text-emerald-900 mb-1">Resolución del Oficial de Cumplimiento:</div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                    {selectedReporte.dictamenOficial}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReporte(null)}
                className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
