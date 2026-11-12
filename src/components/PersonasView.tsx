'use client';

import React, { useState } from 'react';
import {
  PersonaCore,
  CategoriaPersona,
  getCategoriaPersona,
  getCategoriaInfo,
} from '@/types/core';
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

  // Category Filter ('TODOS' | 'CF' | 'DV' | 'AV' | 'CO')
  const [categoryFilter, setCategoryFilter] = useState<'TODOS' | CategoriaPersona>('TODOS');

  // Counts by category
  const countCF = personas.filter((p) => getCategoriaPersona(p) === 'CF').length;
  const countDV = personas.filter((p) => getCategoriaPersona(p) === 'DV').length;
  const countAV = personas.filter((p) => getCategoriaPersona(p) === 'AV').length;
  const countCO = personas.filter((p) => getCategoriaPersona(p) === 'CO').length;

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
      // Category filter
      if (categoryFilter !== 'TODOS') {
        const cat = getCategoriaPersona(p);
        if (cat !== categoryFilter) return false;
      }

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
    if (persona.isDistribuidor || getCategoriaPersona(persona) === 'DV') {
      alert(`La persona ${persona.nombre} ya cuenta con estatus de Distribuidora activa (DV #${persona.distribuidorId || 1025}).`);
      return;
    }
    const confirmPromote = window.confirm(
      `¿Deseas promover a ${persona.nombre} ${persona.apellidoPaterno} como Distribuidora oficial en el Core?`
    );
    if (!confirmPromote) return;

    updatePersona({ ...persona, isDistribuidor: true, categoria: 'DV', distribuidorId: 1025 });
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

      {/* Main Workspace: Full-Width Table 100% */}
      <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-6 pb-4 overflow-hidden">
        {/* Table Canvas: Takes 100% full width and height */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Table Header Stats & Category Filter */}
          <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60 shrink-0">
            <span className="text-xs text-slate-600 font-medium">
              Mostrando <strong className="text-slate-900 font-bold">{filtered.length}</strong> de {personas.length} personas registradas
            </span>

            {/* Category Segmented Filter */}
            <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg border border-slate-300/60 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCategoryFilter('TODOS')}
                className={`px-2.5 py-1 rounded-md transition ${categoryFilter === 'TODOS' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Todos ({personas.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('CF')}
                className={`px-2 py-1 rounded-md transition flex items-center gap-1.5 ${categoryFilter === 'CF' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>CF · Cliente Final ({countCF})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('DV')}
                className={`px-2 py-1 rounded-md transition flex items-center gap-1.5 ${categoryFilter === 'DV' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>DV · Distribuidora ({countDV})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('AV')}
                className={`px-2 py-1 rounded-md transition flex items-center gap-1.5 ${categoryFilter === 'AV' ? 'bg-white text-amber-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>AV · Aval ({countAV})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('CO')}
                className={`px-2 py-1 rounded-md transition flex items-center gap-1.5 ${categoryFilter === 'CO' ? 'bg-white text-purple-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>CO · Cónyuge ({countCO})</span>
              </button>
            </div>
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
                  <th className="px-3 py-2.5 text-center sticky right-0 bg-slate-100 z-10 shadow-[-1px_0_0_0_#e2e8f0]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-slate-400">
                      No se encontraron personas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const isSelected = selectedPersonaId === p.personaId;
                    const catPersona = getCategoriaPersona(p);
                    const catInfo = getCategoriaInfo(catPersona);

                    return (
                      <tr
                        key={p.personaId}
                        onClick={() => setSelectedPersonaId(p.personaId)}
                        className={`cursor-pointer transition-colors group ${
                          isSelected
                            ? 'bg-blue-50/70 font-semibold'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Persona ID */}
                        <td className="px-2.5 py-2 font-mono font-bold text-slate-900">
                          {p.personaId}
                        </td>

                        {/* Nombre con Categoría Visual */}
                        <td className="px-2.5 py-2 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider border font-mono shrink-0 shadow-2xs ${catInfo.badgeClass}`}
                              title={`${catInfo.code} - ${catInfo.label}`}
                            >
                              {catInfo.code}
                            </span>
                            <span>{p.nombre}</span>
                          </div>
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

                        {/* Acciones: Editar Cliente Modal */}
                        <td
                          className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-1px_0_0_0_#f1f5f9]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPersonaId(p.personaId);
                            setActiveModal('editar');
                          }}
                        >
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1 border border-blue-200 transition active:scale-95 shadow-2xs"
                            title="Editar datos y gestionar cliente"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedPersona && (
        <>
          <SolicitarBuroModal
            isOpen={activeModal === 'buro'}
            onClose={() => setActiveModal('editar')}
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
            initialTab="editar"
            notes={internalNotes[selectedPersona.personaId] || []}
            onAddNote={(text) => {
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
                  { text, date: nowStr },
                  ...(prev[selectedPersona.personaId] || []),
                ],
              }));
            }}
            onLaunchCanje={() => setActiveModal('canjear')}
            onLaunchBuro={() => setActiveModal('buro')}
            onLaunchBancarios={() => setActiveModal('bancarios')}
            onLaunchExpediente={() => setActiveModal('expediente')}
            onLaunchPrestanombres={() => setActiveModal('prestanombres')}
            onPromoteToDv={(persona) => handlePromoteToDv(persona)}
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
          setActiveModal('editar');
        }}
      />
    </div>
  );
}
