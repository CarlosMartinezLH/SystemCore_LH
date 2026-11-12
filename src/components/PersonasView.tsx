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
  Pencil,
} from 'lucide-react';
import {
  SolicitarBuroModal,
  DatosBancariosModal,
  ExpedienteDigitalModal,
  CanjearValeModal,
  PrestanombresModal,
} from './modals/PersonaModals';
import CapturaClienteModal from './modals/CapturaClienteModal';
import EditarClienteModal from './modals/EditarClienteModal';
import { buildSafeCsv } from '@/lib/utils/csv';

export default function PersonasView() {
  const { personas, registrarCliente, updatePersona } = useCoreSync();

  // NO auto-selection: starts as null so user sees a clean table
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);

  // Search
  const [searchFilter, setSearchFilter] = useState('');

  // Inspector Panel Tab ('opciones' | 'expediente' | 'bitacora')
  const [inspectorTab, setInspectorTab] = useState<'opciones' | 'expediente' | 'bitacora'>('opciones');

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'buro' | 'bancarios' | 'expediente' | 'canjear' | 'prestanombres' | 'captura' | 'editar' | null
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
  const filtered = personas
    .filter((p) => {
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

      return true;
    })
    .sort((a, b) => b.personaId - a.personaId);

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

      {/* Main Workspace: Full-Width Table on top, Docked Inspector at bottom */}
      <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-6 pb-3 gap-3 overflow-hidden">
        {/* Table Canvas: Takes 100% full width */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Table Header Stats */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="text-slate-900 font-bold">{filtered.length}</strong> de {personas.length} personas registradas
            </span>
            {selectedPersona ? (
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span>Cliente activo en panel inferior:</span>
                <strong className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedPersona.nombre} {selectedPersona.apellidoPaterno} (ID #{selectedPersona.personaId})
                </strong>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                💡 Haz clic en cualquier persona para abrir sus opciones y gestión abajo
              </span>
            )}
          </div>

          {/* Scrollable Data Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200 z-10">
                <tr>
                  <th className="px-2.5 py-2.5">Persona ID</th>
                  <th className="px-2.5 py-2.5">Nombre</th>
                  <th className="px-2.5 py-2.5">Nombre Adicional</th>
                  <th className="px-2.5 py-2.5">Apellido Paterno</th>
                  <th className="px-2.5 py-2.5">Apellido Materno</th>
                  <th className="px-2.5 py-2.5">Fecha Nacimiento</th>
                  <th className="px-2.5 py-2.5">pagare Estatus Id</th>
                  <th className="px-2.5 py-2.5 text-right">pagare Cantidad</th>
                  <th className="px-2.5 py-2.5 min-w-[170px]">CURP</th>
                  <th className="px-2.5 py-2.5">RFC</th>
                  <th className="px-2.5 py-2.5">Sexo ID</th>
                  <th className="px-2.5 py-2.5">Buro Interno Esta</th>
                  <th className="px-2.5 py-2.5">Observaciones</th>
                  <th className="px-2.5 py-2.5 text-right">saldo Actual</th>
                  <th className="px-2.5 py-2.5 text-right">capital Vencido</th>
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
                        {/* Persona ID */}
                        <td className="px-2.5 py-2 font-mono font-bold text-slate-900">
                          {p.personaId}
                        </td>

                        {/* Nombre */}
                        <td className="px-2.5 py-2 font-bold text-slate-900">
                          {p.nombre}
                        </td>

                        {/* Nombre Adicional */}
                        <td className="px-2.5 py-2 text-slate-600">
                          {p.nombreAdicional || ''}
                        </td>

                        {/* Apellido Paterno */}
                        <td className="px-2.5 py-2 text-slate-900 font-semibold">
                          {p.apellidoPaterno}
                        </td>

                        {/* Apellido Materno */}
                        <td className="px-2.5 py-2 text-slate-700">
                          {p.apellidoMaterno || ''}
                        </td>

                        {/* Fecha Nacimiento */}
                        <td className="px-2.5 py-2 font-mono text-slate-700">
                          {p.fechaNacimiento}
                        </td>

                        {/* pagare Estatus Id */}
                        <td className="px-2.5 py-2">
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
                        <td className="px-2.5 py-2 font-mono text-right text-slate-700">
                          {(p.pagareCantidad || 0).toFixed(4)}
                        </td>

                        {/* CURP */}
                        <td className="px-2.5 py-2 font-mono text-[11px] text-slate-800 font-semibold min-w-[170px]">
                          {p.curp}
                        </td>

                        {/* RFC */}
                        <td className="px-2.5 py-2 font-mono text-[11px] text-slate-700">
                          {p.rfc || ''}
                        </td>

                        {/* Sexo ID */}
                        <td className="px-2.5 py-2 text-slate-700">
                          {p.sexoId}
                        </td>

                        {/* Buro Interno Esta */}
                        <td className="px-2.5 py-2">
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
                        <td className="px-2.5 py-2 text-slate-600 max-w-[220px] truncate text-[11px]">
                          {p.observaciones || ''}
                        </td>

                        {/* saldo Actual */}
                        <td className="px-2.5 py-2 font-mono text-right font-bold text-slate-900">
                          {p.saldoActual
                            ? `$${p.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                            : ''}
                        </td>

                        {/* capital Vencido */}
                        <td className="px-2.5 py-2 font-mono text-right font-bold text-rose-600">
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

        {/* Bottom Inspector Panel: Spreads horizontally across full screen width */}
        {selectedPersona && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
            {/* Header / Top Bar of the Bottom Dock */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              {/* Left: Persona identity & Quick Edit */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                  {`${selectedPersona.nombre.charAt(0)}${selectedPersona.apellidoPaterno.charAt(0)}`.toUpperCase()}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 truncate">
                    {selectedPersona.nombre} {selectedPersona.apellidoPaterno} {selectedPersona.apellidoMaterno}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    ID #{selectedPersona.personaId}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {selectedPersona.sexoId}
                  </span>
                  <button
                    onClick={() => setActiveModal('editar')}
                    className="ml-1 px-2.5 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1 border border-blue-200 transition active:scale-95"
                    title="Editar los 40 campos del cliente"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Editar Cliente</span>
                  </button>
                </div>
              </div>

              {/* Center: Tabs Switcher */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/60 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setInspectorTab('opciones')}
                  className={`px-3 py-1 rounded-md transition text-[11px] ${
                    inspectorTab === 'opciones'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Opciones y Gestión
                </button>
                <button
                  onClick={() => setInspectorTab('expediente')}
                  className={`px-3 py-1 rounded-md transition text-[11px] ${
                    inspectorTab === 'expediente'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Expediente Digital
                </button>
                <button
                  onClick={() => setInspectorTab('bitacora')}
                  className={`px-3 py-1 rounded-md transition text-[11px] ${
                    inspectorTab === 'bitacora'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Notas ({internalNotes[selectedPersona.personaId]?.length || 0})
                </button>
              </div>

              {/* Right: Close button */}
              <button
                onClick={() => setSelectedPersonaId(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
                title="Cerrar panel inferior"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body of Bottom Dock */}
            <div className="p-3 overflow-y-auto max-h-[220px]">
              {inspectorTab === 'opciones' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                  {/* Left Column (3 cols): Primary Canjear Vale CTA + Promo DV */}
                  <div className="md:col-span-3 flex flex-col justify-between gap-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70">
                    <button
                      onClick={() => setActiveModal('canjear')}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                    >
                      <Barcode className="w-4 h-4" />
                      <span>Canjear Vale a este Cliente</span>
                    </button>

                    <button
                      onClick={() => handlePromoteToDv(selectedPersona)}
                      className={`w-full p-1.5 rounded-lg border text-left transition flex items-center justify-between text-xs ${
                        selectedPersona.isDistribuidor
                          ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-bold'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">
                          {selectedPersona.isDistribuidor
                            ? `DV Activa (#${selectedPersona.distribuidorId || 1025})`
                            : 'Asignar como Distribuidora (DV)'}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>

                  {/* Middle Column (5 cols): Quick Action Cards Grid */}
                  <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Solicitar Buró */}
                    <button
                      onClick={() => setActiveModal('buro')}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
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
                        <p className="text-[10px] text-slate-500">Score FICO</p>
                      </div>
                    </button>

                    {/* Expediente Digital */}
                    <button
                      onClick={() => setActiveModal('expediente')}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <FolderOpen className="w-4 h-4 text-slate-700" />
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Digital
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Expediente</p>
                        <p className="text-[10px] text-slate-500">INE, KYC</p>
                      </div>
                    </button>

                    {/* Datos Bancarios */}
                    <button
                      onClick={() => setActiveModal('bancarios')}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <CreditCard className="w-4 h-4 text-slate-700" />
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                          STP
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Datos Bancarios</p>
                        <p className="text-[10px] text-slate-500">CLABE/SPEI</p>
                      </div>
                    </button>

                    {/* Prestanombres */}
                    <button
                      onClick={() => setActiveModal('prestanombres')}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Printer className="w-4 h-4 text-slate-700" />
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          CNBV
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Prestanombres</p>
                        <p className="text-[10px] text-slate-500">Declaratoria</p>
                      </div>
                    </button>
                  </div>

                  {/* Right Column (4 cols): Ficha rápida horizontal */}
                  <div className="md:col-span-4 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-xs space-y-1.5 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-medium">CURP: </span>
                        <span className="font-mono font-bold text-slate-900">{selectedPersona.curp}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">RFC: </span>
                        <span className="font-mono font-bold text-slate-900">{selectedPersona.rfc || 'S/D'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Tel: </span>
                        <span className="font-mono font-bold text-slate-900">{selectedPersona.telefono || '(844) 120-3344'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Nac: </span>
                        <span className="font-mono text-slate-800">{selectedPersona.fechaNacimiento}</span>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Pagaré:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          ${(selectedPersona.pagareCantidad || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                          {selectedPersona.pagareEstatusId}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveModal('editar')}
                        className="text-blue-600 hover:text-blue-800 font-bold text-[11px] hover:underline flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Ver los 40 campos</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expediente Tab */}
              {inspectorTab === 'expediente' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2 items-center">
                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        INE
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Identificación Oficial</p>
                        <p className="text-[10px] text-slate-500 font-mono">Frente y Reverso</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                      Vigente
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        CFE
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Comprobante Domicilio</p>
                        <p className="text-[10px] text-slate-500 font-mono">&lt; 3 meses</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                      Validado
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        DOC
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Pagaré Legal</p>
                        <p className="text-[10px] text-slate-500 font-mono">{selectedPersona.pagareEstatusId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                      Firmado
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveModal('expediente')}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition border border-blue-200 flex items-center justify-center gap-1.5"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Abrir Visor de Expediente</span>
                  </button>
                </div>
              )}

              {/* Bitácora Tab */}
              {inspectorTab === 'bitacora' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-8 flex gap-2 overflow-x-auto py-1">
                    {(internalNotes[selectedPersona.personaId] || []).length === 0 ? (
                      <p className="text-slate-400 text-xs py-2">Sin notas registradas para este cliente.</p>
                    ) : (
                      internalNotes[selectedPersona.personaId].map((note, idx) => (
                        <div key={idx} className="min-w-[240px] p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-xs shrink-0">
                          <p className="leading-snug truncate">{note.text}</p>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{note.date}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="md:col-span-4 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nueva nota para este cliente..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNoteText.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

          <EditarClienteModal
            isOpen={activeModal === 'editar'}
            onClose={() => setActiveModal(null)}
            persona={selectedPersona}
            onSuccess={(up) => {
              updatePersona(up);
            }}
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
