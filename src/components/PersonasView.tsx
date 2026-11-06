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
  Camera,
  FolderOpen,
  ArrowRightLeft,
  Edit,
  ShieldCheck,
  ExternalLink,
  Users,
  CheckCircle2,
  Barcode,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  SolicitarBuroModal,
  DatosBancariosModal,
  ExpedienteDigitalModal,
  CanjearValeModal,
  PrestanombresModal,
} from './modals/PersonaModals';
import { buildSafeCsv } from '@/lib/utils/csv';

export default function PersonasView() {
  const { personas, registrarCliente, updatePersona } = useCoreSync();
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(122144);
  const [searchFilter, setSearchFilter] = useState('');

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'buro' | 'bancarios' | 'expediente' | 'canjear' | 'prestanombres' | 'captura' | 'notas' | null
  >(null);

  // New Client Form
  const [newNombre, setNewNombre] = useState('');
  const [newApellidos, setNewApellidos] = useState('');
  const [newCurp, setNewCurp] = useState('');
  const [newTelefono, setNewTelefono] = useState('');

  // Internal Notes State
  const [internalNotes, setInternalNotes] = useState<Record<number, string[]>>({
    122144: ['Cliente validado en mesa de crédito.', 'Pagaré digital pendiente de ratificación.'],
    122143: ['Antecedente en Buró de Crédito por mora en financiera externa.'],
  });
  const [newNoteText, setNewNoteText] = useState('');

  const selectedPersona = personas.find((p) => p.personaId === selectedPersonaId) || personas[0];

  const filtered = personas.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const fullName = `${p.nombre} ${p.nombreAdicional || ''} ${p.apellidoPaterno} ${p.apellidoMaterno}`.toLowerCase();
    return (
      fullName.includes(q) ||
      p.curp.toLowerCase().includes(q) ||
      p.personaId.toString().includes(q)
    );
  });

  const handleAction = (actionName: string) => {
    if (!selectedPersona) return;

    if (actionName === 'Solicitar buró') {
      setActiveModal('buro');
    } else if (actionName === 'Datos Bancarios (Nuevo)') {
      setActiveModal('bancarios');
    } else if (actionName === 'Expediente digital') {
      setActiveModal('expediente');
    } else if (actionName === 'Canjear Vale') {
      setActiveModal('canjear');
    } else if (actionName === 'Imprimir Carta Prestanombres') {
      setActiveModal('prestanombres');
    } else if (actionName === 'Captura de cliente') {
      setActiveModal('captura');
    } else if (actionName === 'Notas') {
      setActiveModal('notas');
    } else if (actionName === 'Establecer como distribuidor') {
      if (selectedPersona.isDistribuidor) {
        alert(`La persona ${selectedPersona.nombre} ya cuenta con estatus de Distribuidora activa.`);
        return;
      }
      updatePersona({ ...selectedPersona, isDistribuidor: true, distribuidorId: 1025 });
      alert(`✓ ¡Éxito! ${selectedPersona.nombre} ${selectedPersona.apellidoPaterno} ha sido promovida a Distribuidora oficial en el Core (DV #1025).`);
    } else if (actionName === 'Gestor Documental') {
      alert(`Sincronización con Gestor Documental completada para ${selectedPersona.nombre}. Expediente digital al día.`);
    } else {
      alert(`Módulo "${actionName}" ejecutado con éxito para ${selectedPersona.nombre}.`);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim() || !newCurp.trim()) return;

    try {
      const res = await registrarCliente({
        nombre: newNombre.trim(),
        apellidoPaterno: newApellidos.trim(),
        curp: newCurp.trim(),
        telefono: newTelefono.trim(),
      });
      if (res?.result?.nuevaPersona) {
        setSelectedPersonaId(res.result.nuevaPersona.personaId);
      }
      setActiveModal(null);
      setNewNombre('');
      setNewApellidos('');
      setNewCurp('');
      setNewTelefono('');
      alert(`✓ Cliente registrado exitosamente en el Padrón Core y sincronizado con CRM.`);
    } catch (err) {
      alert('Error registrando cliente: ' + (err as Error).message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['PersonaID', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'CURP', 'RFC', 'Pagaré Estatus', 'Buró Estatus', 'Distribuidor'];
    const rows = personas.map((p) => [
      p.personaId,
      p.nombre,
      p.apellidoPaterno,
      p.apellidoMaterno,
      p.curp,
      p.rfc,
      p.pagareEstatusId,
      p.buroInternoEstatus,
      p.isDistribuidor ? 'SI' : 'NO',
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
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* Top Action Toolbar: Botones de Acción sobre la pantalla */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Actions Group */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAction('Captura de cliente')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Captura de Cliente</span>
          </button>

          <button
            onClick={() => handleAction('Canjear Vale')}
            className="px-3.5 py-2 rounded-xl bg-[#facc15] hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Barcode className="w-3.5 h-3.5 text-slate-950" />
            <span>Canjear Vale</span>
          </button>

          <button
            onClick={() => handleAction('Solicitar buró')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Solicitar Buró</span>
          </button>

          <button
            onClick={() => handleAction('Expediente digital')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Expediente</span>
          </button>

          <button
            onClick={() => handleAction('Datos Bancarios (Nuevo)')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Datos Bancarios</span>
          </button>

          <button
            onClick={() => handleAction('Establecer como distribuidor')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Asignar DV</span>
          </button>

          <button
            onClick={() => handleAction('Imprimir Carta Prestanombres')}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Carta Prestanombres</span>
          </button>
        </div>

        {/* Right: Export Excel Button */}
        <div>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Selected Persona Floating Indicator */}
      {selectedPersona && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              #{selectedPersona.personaId}
            </span>
            <div>
              <span className="font-extrabold text-slate-900 text-sm">
                {selectedPersona.nombre} {selectedPersona.apellidoPaterno} {selectedPersona.apellidoMaterno}
              </span>
              <span className="text-slate-500 block text-[11px] font-mono">
                CURP: {selectedPersona.curp} • Tel: {selectedPersona.telefono || '871-120-3344'} • RFC: {selectedPersona.rfc}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('Canjear Vale')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
            >
              Canjear Vale a este Cliente
            </button>
            <button
              onClick={() => handleAction('Expediente digital')}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-50 transition"
            >
              Ver Expediente
            </button>
          </div>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Nombre, CURP, PersonaID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-72 md:w-96 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Mostrando <strong className="text-blue-700 font-bold">{filtered.length}</strong> registros en padrón
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex-1">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold select-none border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-3">Acciones</th>
              <th className="px-3.5 py-3">Persona ID</th>
                <th className="px-3.5 py-2.5">Nombre</th>
                <th className="px-3.5 py-2.5">Apellido Paterno</th>
                <th className="px-3.5 py-2.5">Apellido Materno</th>
                <th className="px-3.5 py-2.5">Fecha Nacimiento</th>
                <th className="px-3.5 py-2.5">Pagaré Estatus</th>
                <th className="px-3.5 py-2.5">Pagaré Cantidad</th>
                <th className="px-3.5 py-2.5">CURP</th>
                <th className="px-3.5 py-2.5">RFC</th>
                <th className="px-3.5 py-2.5">Sexo</th>
                <th className="px-3.5 py-2.5">Buró Interno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isSelected = selectedPersonaId === p.personaId;
                return (
                  <tr
                    key={p.personaId}
                    onClick={() => setSelectedPersonaId(p.personaId)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-blue-50/40'
                    }`}
                  >
                    <td className="px-3.5 py-2 font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPersonaId(p.personaId);
                          setActiveModal('buro');
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                      >
                        Buró
                      </button>
                    </td>
                    <td className="px-3.5 py-2 font-mono font-bold text-[#2563eb]">
                      #{p.personaId}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-slate-900">{p.nombre}</td>
                    <td className="px-3.5 py-2 text-slate-800">{p.apellidoPaterno}</td>
                    <td className="px-3.5 py-2 text-slate-800">{p.apellidoMaterno}</td>
                    <td className="px-3.5 py-2 font-mono text-slate-600">{p.fechaNacimiento}</td>
                    <td className="px-3.5 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.pagareEstatusId === 'FIRMADO EN BLANCO'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.pagareEstatusId === 'SIN PAGARE'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.pagareEstatusId}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-800">
                      ${p.pagareCantidad.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-[11px] font-semibold text-slate-700">
                      {p.curp}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">
                      {p.rfc}
                    </td>
                    <td className="px-3.5 py-2 text-slate-600">{p.sexoId}</td>
                    <td className="px-3.5 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.buroInternoEstatus === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.buroInternoEstatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      {/* MODALS */}
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

      {/* Captura de Cliente Modal */}
      {activeModal === 'captura' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <UserPlus className="w-4 h-4 text-yellow-300" />
                <span>Captura de Nuevo Cliente en Core</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre(s) *</label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 uppercase font-bold"
                  placeholder="Ej. LAURA ELENA"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={newApellidos}
                  onChange={(e) => setNewApellidos(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 uppercase font-bold"
                  placeholder="Ej. RAMIREZ CASTILLO"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">CURP Oficial (18 caracteres) *</label>
                <input
                  type="text"
                  maxLength={18}
                  required
                  value={newCurp}
                  onChange={(e) => setNewCurp(e.target.value.toUpperCase())}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold"
                  placeholder="RACL900101MCLRR02"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Teléfono Móvil (10 dígitos)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  placeholder="8441234567"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Guardar en Core
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notas Drawer Modal */}
      {activeModal === 'notas' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FileText className="w-4 h-4 text-yellow-300" />
                <span>Bitácora de Notas — {selectedPersona.nombre}</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/80 hover:text-white p-1">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(internalNotes[selectedPersona.personaId] || ['Sin notas registradas aún.']).map((note, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                    {note}
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <textarea
                  rows={2}
                  placeholder="Agregar nueva nota de seguimiento..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                />
                <button
                  onClick={() => {
                    if (!newNoteText.trim()) return;
                    setInternalNotes({
                      ...internalNotes,
                      [selectedPersona.personaId]: [
                        ...(internalNotes[selectedPersona.personaId] || []),
                        newNoteText.trim(),
                      ],
                    });
                    setNewNoteText('');
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Guardar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
