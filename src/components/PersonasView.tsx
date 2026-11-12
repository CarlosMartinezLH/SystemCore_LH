'use client';

import React, { useState } from 'react';
import { PersonaCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  UserPlus,
  Search,
  FileSpreadsheet,
  FileText,
  CreditCard,
  FolderOpen,
  ArrowRightLeft,
  ShieldCheck,
  Barcode,
  Printer,
  Sparkles,
  X,
  Copy,
  Check,
  ChevronRight,
  Phone,
  Calendar,
  AlertCircle,
  Clock,
  Send,
  Building,
  User,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  SolicitarBuroModal,
  DatosBancariosModal,
  ExpedienteDigitalModal,
  CanjearValeModal,
  PrestanombresModal,
} from './modals/PersonaModals';
import CapturaClienteModal from './modals/CapturaClienteModal';
import { buildSafeCsv } from '@/lib/utils/csv';

export default function PersonasView() {
  const { personas, registrarCliente, updatePersona } = useCoreSync();

  // NO auto-selection: starts as null so user sees a clean table
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);

  // Filters & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [filterPagare, setFilterPagare] = useState<'ALL' | 'FIRMADO' | 'SIN_PAGARE'>('ALL');
  const [filterBuro, setFilterBuro] = useState<'ALL' | 'NORMAL' | 'ALERTA'>('ALL');

  // Inspector Panel Tab ('opciones' | 'expediente' | 'bitacora')
  const [inspectorTab, setInspectorTab] = useState<'opciones' | 'expediente' | 'bitacora'>('opciones');

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'buro' | 'bancarios' | 'expediente' | 'canjear' | 'prestanombres' | 'captura' | null
  >(null);

  // Internal Notes per persona
  const [internalNotes, setInternalNotes] = useState<Record<number, { text: string; date: string }[]>>({
    122144: [
      { text: 'Cliente validado en mesa de crédito.', date: '12/11/2026 09:15' },
      { text: 'Pagaré digital ratificado en sucursal.', date: '11/11/2026 14:30' },
    ],
    122143: [
      { text: 'Antecedente en Buró de Crédito por mora en financiera externa.', date: '10/11/2026 11:20' },
    ],
  });
  const [newNoteText, setNewNoteText] = useState('');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedPersona = selectedPersonaId
    ? personas.find((p) => p.personaId === selectedPersonaId) || null
    : null;

  // Filtered persons
  const filtered = personas.filter((p) => {
    // Search term
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      const fullName = `${p.nombre} ${p.nombreAdicional || ''} ${p.apellidoPaterno} ${p.apellidoMaterno}`.toLowerCase();
      const matchText =
        fullName.includes(q) ||
        p.curp.toLowerCase().includes(q) ||
        p.personaId.toString().includes(q) ||
        (p.telefono && p.telefono.includes(q));
      if (!matchText) return false;
    }

    // Pagaré filter
    if (filterPagare === 'FIRMADO' && p.pagareEstatusId !== 'FIRMADO EN BLANCO') {
      return false;
    }
    if (filterPagare === 'SIN_PAGARE' && p.pagareEstatusId !== 'SIN PAGARE') {
      return false;
    }

    // Buró filter
    if (filterBuro === 'NORMAL' && p.buroInternoEstatus !== 'NORMAL') {
      return false;
    }
    if (filterBuro === 'ALERTA' && p.buroInternoEstatus === 'NORMAL') {
      return false;
    }

    return true;
  }).sort((a, b) => b.personaId - a.personaId);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handlePromoteToDv = (persona: PersonaCore) => {
    if (persona.isDistribuidor) {
      alert(`La persona ${persona.nombre} ya cuenta con estatus de Distribuidora activa (DV #${persona.distribuidorId || 1025}).`);
      return;
    }
    const confirmPromote = window.confirm(
      `¿Deseas promover a ${persona.nombre} ${persona.apellidoPaterno} como Distribuidora oficial en el Core?`
    );
    if (!confirmPromote) return;

    updatePersona({ ...persona, isDistribuidor: true, distribuidorId: 1025 });
    alert(`✓ ¡Éxito! ${persona.nombre} ${persona.apellidoPaterno} ha sido registrada como Distribuidora oficial en el Core (DV #1025).`);
  };

  const handleAddNote = () => {
    if (!selectedPersona || !newNoteText.trim()) return;
    const nowStr = new Date().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setInternalNotes((prev) => ({
      ...prev,
      [selectedPersona.personaId]: [
        { text: newNoteText.trim(), date: nowStr },
        ...(prev[selectedPersona.personaId] || []),
      ],
    }));
    setNewNoteText('');
  };

  const handleExportCSV = () => {
    const headers = [
      'Persona ID',
      'Nombre',
      'Nombre Adicional',
      'Apellido Paterno',
      'Apellido Materno',
      'Fecha Nacimiento',
      'pagare Estatus Id',
      'pagare Cantidad',
      'CURP',
      'RFC',
      'Sexo ID',
      'Buro Interno Esta',
      'Observaciones',
      'saldo Actual',
      'capital Vencido',
    ];
    const rows = personas.map((p) => [
      p.personaId,
      p.nombre,
      p.nombreAdicional || '',
      p.apellidoPaterno,
      p.apellidoMaterno || '',
      p.fechaNacimiento,
      p.pagareEstatusId,
      (p.pagareCantidad || 0).toFixed(4),
      p.curp,
      p.rfc || '',
      p.sexoId,
      p.buroInternoEstatus,
      p.observaciones || '',
      p.saldoActual || '',
      p.capitalVencido || '',
    ]);
    const csvContent = buildSafeCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `padron_personas_lanahora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-[#f8fafc] text-slate-800 flex flex-col min-h-0 overflow-hidden font-sans">
      {/* Top Controls Toolbar: Búsqueda, Filtros y Acciones Globales */}
      <div className="px-4 lg:px-6 pt-4 pb-3">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Search Box */}
          <div className="flex-1 relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por Nombre, CURP, Teléfono o ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition font-medium"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Center: Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Filter by Pagaré */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setFilterPagare('ALL')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterPagare === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Todos ({personas.length})
              </button>
              <button
                onClick={() => setFilterPagare('FIRMADO')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterPagare === 'FIRMADO'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Con Pagaré
              </button>
              <button
                onClick={() => setFilterPagare('SIN_PAGARE')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterPagare === 'SIN_PAGARE'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Sin Pagaré
              </button>
            </div>

            {/* Filter by Buró */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setFilterBuro('ALL')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterBuro === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Buró: Todos
              </button>
              <button
                onClick={() => setFilterBuro('NORMAL')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterBuro === 'NORMAL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setFilterBuro('ALERTA')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterBuro === 'ALERTA'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Alerta
              </button>
            </div>
          </div>

          {/* Right: Primary CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 transition active:scale-95 shadow-2xs"
              title="Descargar padrón en formato Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => setActiveModal('captura')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Captura de Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Table on the left, Inspector on the right */}
      <div className="flex-1 flex min-h-0 px-4 lg:px-6 pb-4 gap-4 overflow-hidden">
        {/* Table Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Table Header Stats */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="text-slate-900 font-bold">{filtered.length}</strong> de {personas.length} personas registradas
            </span>
            {selectedPersona && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Seleccionado: <strong className="text-slate-900 font-semibold">{selectedPersona.nombre} {selectedPersona.apellidoPaterno}</strong>
              </span>
            )}
          </div>

          {/* Scrollable Data Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200 z-10">
                <tr>
                  <th className="px-3.5 py-3 text-center">
                    <button
                      onClick={() => setActiveModal('captura')}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-extrabold normal-case text-xs"
                    >
                      Nuevo
                    </button>
                  </th>
                  <th className="px-3 py-3">Persona ID</th>
                  <th className="px-3.5 py-3">Nombre</th>
                  <th className="px-3 py-3">Nombre Adicional</th>
                  <th className="px-3.5 py-3">Apellido Paterno</th>
                  <th className="px-3.5 py-3">Apellido Materno</th>
                  <th className="px-3 py-3">Fecha Nacimiento</th>
                  <th className="px-3 py-3">pagare Estatus Id</th>
                  <th className="px-3 py-3 text-right">pagare Cantidad</th>
                  <th className="px-3.5 py-3">CURP</th>
                  <th className="px-3.5 py-3">RFC</th>
                  <th className="px-3 py-3">Sexo ID</th>
                  <th className="px-3 py-3">Buro Interno Esta</th>
                  <th className="px-3.5 py-3">Observaciones</th>
                  <th className="px-3.5 py-3 text-right">saldo Actual</th>
                  <th className="px-3.5 py-3 text-right">capital Vencido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-12 text-center text-slate-400">
                      No se encontraron personas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const isSelected = selectedPersonaId === p.personaId;

                    return (
                      <tr
                        key={p.personaId}
                        onClick={() => setSelectedPersonaId(p.personaId)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-300 font-semibold'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Editar */}
                        <td className="px-3.5 py-2.5 text-center" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPersonaId(p.personaId);
                        }}>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-bold text-xs"
                          >
                            Editar
                          </button>
                        </td>

                        {/* Persona ID */}
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                          {p.personaId}
                        </td>

                        {/* Nombre */}
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">
                          {p.nombre}
                        </td>

                        {/* Nombre Adicional */}
                        <td className="px-3 py-2.5 text-slate-600">
                          {p.nombreAdicional || ''}
                        </td>

                        {/* Apellido Paterno */}
                        <td className="px-3.5 py-2.5 text-slate-900 font-semibold">
                          {p.apellidoPaterno}
                        </td>

                        {/* Apellido Materno */}
                        <td className="px-3.5 py-2.5 text-slate-700">
                          {p.apellidoMaterno || ''}
                        </td>

                        {/* Fecha Nacimiento */}
                        <td className="px-3 py-2.5 font-mono text-slate-700">
                          {p.fechaNacimiento}
                        </td>

                        {/* pagare Estatus Id */}
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.pagareEstatusId === 'FIRMADO EN BLANCO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.pagareEstatusId === 'SIN PAGARE'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.pagareEstatusId}
                          </span>
                        </td>

                        {/* pagare Cantidad */}
                        <td className="px-3 py-2.5 font-mono text-right text-slate-700">
                          {(p.pagareCantidad || 0).toFixed(4)}
                        </td>

                        {/* CURP */}
                        <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-800 font-semibold">
                          {p.curp}
                        </td>

                        {/* RFC */}
                        <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-700">
                          {p.rfc || ''}
                        </td>

                        {/* Sexo ID */}
                        <td className="px-3 py-2.5 text-slate-700">
                          {p.sexoId}
                        </td>

                        {/* Buro Interno Esta */}
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.buroInternoEstatus === 'NORMAL'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {p.buroInternoEstatus}
                          </span>
                        </td>

                        {/* Observaciones */}
                        <td className="px-3.5 py-2.5 text-slate-600 max-w-[220px] truncate text-[11px]">
                          {p.observaciones || ''}
                        </td>

                        {/* saldo Actual */}
                        <td className="px-3.5 py-2.5 font-mono text-right font-bold text-slate-900">
                          {p.saldoActual
                            ? `$${p.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                            : ''}
                        </td>

                        {/* capital Vencido */}
                        <td className="px-3.5 py-2.5 font-mono text-right font-bold text-rose-600">
                          {p.capitalVencido
                            ? `$${p.capitalVencido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                            : ''}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Inspector / Detail Panel (Aesthetic like user's reference image) */}
        {selectedPersona && (
          <aside className="w-full lg:w-[410px] bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-right-4 duration-200">
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {`${selectedPersona.nombre.charAt(0)}${selectedPersona.apellidoPaterno.charAt(0)}`.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold text-slate-900 truncate leading-snug">
                    {selectedPersona.nombre} {selectedPersona.apellidoPaterno} {selectedPersona.apellidoMaterno}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      ID #{selectedPersona.personaId}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">·</span>
                    <span className="text-[10px] font-bold text-slate-600">
                      {selectedPersona.sexoId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedPersonaId(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
                title="Cerrar panel de opciones"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Pill Tabs (Inspector Switcher) */}
            <div className="p-3 border-b border-slate-100">
              <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setInspectorTab('opciones')}
                  className={`py-1.5 rounded-lg text-center transition ${
                    inspectorTab === 'opciones'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Opciones
                </button>
                <button
                  onClick={() => setInspectorTab('expediente')}
                  className={`py-1.5 rounded-lg text-center transition ${
                    inspectorTab === 'expediente'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Expediente
                </button>
                <button
                  onClick={() => setInspectorTab('bitacora')}
                  className={`py-1.5 rounded-lg text-center transition ${
                    inspectorTab === 'bitacora'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Notas ({internalNotes[selectedPersona.personaId]?.length || 0})
                </button>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* TAB 1: OPCIONES Y ACCIONES */}
              {inspectorTab === 'opciones' && (
                <>
                  {/* Primary Action Button: Canjear Vale */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setActiveModal('canjear')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
                    >
                      <Barcode className="w-4 h-4" />
                      <span>Canjear Vale a este Cliente</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      Inicia validación biométrica y dispersión bancaria
                    </p>
                  </div>

                  {/* Quick Action Cards Grid */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Gestión del Cliente
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Solicitar Buró */}
                      <button
                        onClick={() => setActiveModal('buro')}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <ShieldCheck className="w-4 h-4 text-slate-700" />
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              selectedPersona.scoreBuro
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {selectedPersona.scoreBuro ? `${selectedPersona.scoreBuro} pts` : 'API'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Solicitar Buró</p>
                          <p className="text-[10px] text-slate-500">Consulta Score FICO</p>
                        </div>
                      </button>

                      {/* Expediente Digital */}
                      <button
                        onClick={() => setActiveModal('expediente')}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <FolderOpen className="w-4 h-4 text-slate-700" />
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            Digital
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Expediente</p>
                          <p className="text-[10px] text-slate-500">INE, Domicilio, KYC</p>
                        </div>
                      </button>

                      {/* Datos Bancarios */}
                      <button
                        onClick={() => setActiveModal('bancarios')}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <CreditCard className="w-4 h-4 text-slate-700" />
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                            STP SPEI
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Datos Bancarios</p>
                          <p className="text-[10px] text-slate-500">CLABE y Tarjetas</p>
                        </div>
                      </button>

                      {/* Carta Prestanombres */}
                      <button
                        onClick={() => setActiveModal('prestanombres')}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-left transition flex flex-col justify-between group"
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <Printer className="w-4 h-4 text-slate-700" />
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            CNBV
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Prestanombres</p>
                          <p className="text-[10px] text-slate-500">Carta Declaratoria</p>
                        </div>
                      </button>
                    </div>

                    {/* Asignar Distribuidor (Full width action) */}
                    <button
                      onClick={() => handlePromoteToDv(selectedPersona)}
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                        selectedPersona.isDistribuidor
                          ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ArrowRightLeft className="w-4 h-4 text-slate-600" />
                        <div>
                          <p className="font-bold text-xs">
                            {selectedPersona.isDistribuidor
                              ? `Distribuidora Activa (DV #${selectedPersona.distribuidorId || 1025})`
                              : 'Asignar como Distribuidora (DV)'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {selectedPersona.isDistribuidor
                              ? 'Cuenta con línea de crédito habilitada'
                              : 'Promover al padrón de colocación'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Ficha Rápida del Cliente */}
                  <div className="pt-2 space-y-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Datos de Identificación
                    </span>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
                      {/* CURP with Copy */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">CURP:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {selectedPersona.curp}
                          </span>
                          <button
                            onClick={() => handleCopy(selectedPersona.curp, 'curp')}
                            className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-700 transition"
                            title="Copiar CURP"
                          >
                            {copiedKey === 'curp' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* RFC with Copy */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">RFC:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {selectedPersona.rfc}
                          </span>
                          <button
                            onClick={() => handleCopy(selectedPersona.rfc, 'rfc')}
                            className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-700 transition"
                            title="Copiar RFC"
                          >
                            {copiedKey === 'rfc' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Teléfono */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Teléfono:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {selectedPersona.telefono || '844-120-3344'}
                        </span>
                      </div>

                      {/* Fecha Nacimiento */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Fecha Nac.:</span>
                        <span className="font-mono text-slate-700">
                          {selectedPersona.fechaNacimiento}
                        </span>
                      </div>

                      {/* Pagaré Status */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-medium">Pagaré:</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block">
                            ${selectedPersona.pagareCantidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {selectedPersona.pagareEstatusId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: EXPEDIENTE DIGITAL */}
              {inspectorTab === 'expediente' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Documentos Integrados
                    </span>
                    <button
                      onClick={() => setActiveModal('expediente')}
                      className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
                    >
                      <span>Abrir visor</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* INE Document */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          INE
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Identificación Oficial (INE)</p>
                          <p className="text-[10px] text-slate-500 font-mono">Frente y Reverso cotejado</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Vigente
                      </span>
                    </div>

                    {/* Comprobante Domicilio */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          CFE
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Comprobante de Domicilio</p>
                          <p className="text-[10px] text-slate-500 font-mono">Antigüedad &lt; 3 meses</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Validado
                      </span>
                    </div>

                    {/* Pagaré Ratificado */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          DOC
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Pagaré Legal en Blanco</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {selectedPersona.pagareEstatusId}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedPersona.pagareEstatusId === 'FIRMADO EN BLANCO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {selectedPersona.pagareEstatusId === 'FIRMADO EN BLANCO' ? 'Firmado' : 'Faltante'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('expediente')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
                  >
                    Gestionar Documentos y Subir Nuevos
                  </button>
                </div>
              )}

              {/* TAB 3: BITÁCORA Y NOTAS INTERNAS */}
              {inspectorTab === 'bitacora' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Historial de Seguimiento
                  </span>

                  {/* List of notes */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(internalNotes[selectedPersona.personaId] || []).length === 0 ? (
                      <p className="text-slate-400 text-xs text-center py-4">
                        Sin notas registradas para este cliente.
                      </p>
                    ) : (
                      internalNotes[selectedPersona.personaId].map((note, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-xs space-y-1"
                        >
                          <p className="leading-snug">{note.text}</p>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{note.date}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add note input */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Escribe una nota interna para este cliente..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition bg-slate-50 focus:bg-white"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNoteText.trim()}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Agregar Nota</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* MODALS */}
      {selectedPersona && (
        <>
          <SolicitarBuroModal
            isOpen={activeModal === 'buro'}
            onClose={() => setActiveModal(null)}
            persona={selectedPersona}
            onUpdatePersona={(up) => {
              updatePersona(up);
            }}
          />

          <DatosBancariosModal
            isOpen={activeModal === 'bancarios'}
            onClose={() => setActiveModal(null)}
            persona={selectedPersona}
            onUpdatePersona={(up) => {
              updatePersona(up);
            }}
          />

          <ExpedienteDigitalModal
            isOpen={activeModal === 'expediente'}
            onClose={() => setActiveModal(null)}
            persona={selectedPersona}
          />

          <CanjearValeModal
            isOpen={activeModal === 'canjear'}
            onClose={() => setActiveModal(null)}
            persona={selectedPersona}
          />

          <PrestanombresModal
            isOpen={activeModal === 'prestanombres'}
            onClose={() => setActiveModal(null)}
            persona={selectedPersona}
          />
        </>
      )}

      {/* Captura de Cliente Modal (Fiel a la pantalla del sistema anterior con Cliente y Buro) */}
      <CapturaClienteModal
        isOpen={activeModal === 'captura'}
        onClose={() => setActiveModal(null)}
        onSuccess={(newPersonaId) => {
          setSelectedPersonaId(newPersonaId);
          setActiveModal(null);
        }}
      />
    </div>
  );
}
