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
      `"${p.nombre}"`,
      `"${p.apellidoPaterno}"`,
      `"${p.apellidoMaterno}"`,
      p.curp,
      p.rfc,
      p.pagareEstatusId,
      p.buroInternoEstatus,
      p.isDistribuidor ? 'SI' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `padron_personas_lanahora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-[#f0f4fa] text-slate-800 flex flex-col md:flex-row min-h-[calc(100vh-105px)] overflow-hidden font-sans">
      {/* LEFT SIDEBAR: OPCIONES */}
      <aside className="w-full md:w-64 bg-white border-r border-blue-100 p-3 flex flex-col justify-between overflow-y-auto shadow-sm">
        <div className="space-y-4">
          <div className="bg-[#eff4fc] rounded-2xl border border-blue-200 overflow-hidden shadow-xs">
            <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white px-4 py-2.5 text-xs font-black flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#facc15]" />
                Acciones de Persona
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.2 rounded-full font-bold">
                Core
              </span>
            </div>
            <div className="p-2 space-y-0.5 text-xs">
              {[
                { name: 'Captura de cliente', icon: UserPlus, highlight: true },
                { name: 'Solicitar buró', icon: ShieldCheck },
                { name: 'Establecer como distribuidor', icon: ArrowRightLeft },
                { name: 'Datos Bancarios (Nuevo)', icon: CreditCard },
                { name: 'Expediente digital', icon: FolderOpen },
                { name: 'Canjear Vale', icon: Barcode, highlight: true },
                { name: 'Imprimir Carta Prestanombres', icon: Printer },
                { name: 'Notas', icon: FileText },
                { name: 'Gestor Documental', icon: ExternalLink },
              ].map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleAction(opt.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2 font-medium ${
                    opt.highlight
                      ? 'bg-[#2563eb] text-white font-bold hover:bg-blue-700 shadow-xs'
                      : 'text-slate-700 hover:bg-blue-100/60 hover:text-blue-900'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exportar */}
          <div className="bg-[#eff4fc] rounded-2xl border border-blue-200 p-2">
            <button
              onClick={handleExportCSV}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-emerald-700 font-bold hover:bg-emerald-100/50 flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Padrón a Excel (CSV)</span>
            </button>
          </div>
        </div>

        {selectedPersona && (
          <div className="p-3 bg-[#eff4fc] rounded-2xl border border-blue-200 text-xs text-slate-700 mt-3">
            <span className="text-[10px] text-[#2563eb] font-bold block uppercase tracking-wider">
              Seleccionada:
            </span>
            <span className="font-mono text-slate-900 font-black block text-sm">
              ID #{selectedPersona.personaId}
            </span>
            <span className="truncate block font-bold text-slate-800 mt-0.5">
              {selectedPersona.nombre} {selectedPersona.apellidoPaterno}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              CURP: {selectedPersona.curp}
            </span>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA: Data Table */}
      <main className="flex-1 p-4 overflow-x-auto flex flex-col space-y-3">
        {/* Search & Stats Bar */}
        <div className="bg-white p-3 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por Nombre, CURP, PersonaID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-80 text-slate-900 focus:outline-none focus:border-[#2563eb] focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="text-[#2563eb]">{filtered.length}</strong> registros en padrón
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-xs flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-extrabold select-none">
              <tr>
                <th className="px-3.5 py-2.5">Acciones</th>
                <th className="px-3.5 py-2.5">Persona ID</th>
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
      </main>

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
