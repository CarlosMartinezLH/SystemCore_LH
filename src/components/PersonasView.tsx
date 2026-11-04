'use client';

import React, { useState } from 'react';
import { PersonaCore } from '@/types/core';
import { INITIAL_PERSONAS } from '@/lib/data/coreData';
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
} from 'lucide-react';

export default function PersonasView() {
  const [personas, setPersonas] = useState<PersonaCore[]>(INITIAL_PERSONAS);
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(122144);
  const [searchFilter, setSearchFilter] = useState('');

  const selectedPersona = personas.find((p) => p.personaId === selectedPersonaId);

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
    if (!selectedPersona) {
      alert('Por favor selecciona primero una persona en la tabla.');
      return;
    }
    if (actionName === 'Establecer como distribuidor') {
      if (selectedPersona.isDistribuidor) {
        alert(`La persona ${selectedPersona.nombre} ya es distribuidora activa.`);
        return;
      }
      const updated = personas.map((p) =>
        p.personaId === selectedPersona.personaId
          ? { ...p, isDistribuidor: true, distribuidorId: 1025 }
          : p
      );
      setPersonas(updated);
      alert(`✓ ¡Éxito! ${selectedPersona.nombre} ${selectedPersona.apellidoPaterno} ha sido promovida a Distribuidora oficial en el Core (DV #1025).`);
      return;
    }
    alert(`Ejecutando acción: "${actionName}" para PersonaID: ${selectedPersona.personaId}`);
  };

  return (
    <div className="flex-1 bg-[#0c101c] text-slate-100 flex flex-col md:flex-row min-h-[calc(100vh-105px)] overflow-hidden font-sans">
      {/* LEFT SIDEBAR: OPCIONES (Estilo unificado LanAhora) */}
      <aside className="w-full md:w-64 bg-[#111728] border-r border-slate-800 p-3 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-[#172138] rounded-xl border border-slate-700/80 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3.5 py-2 text-xs font-black flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Acciones de Persona
              </span>
              <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.2 rounded font-mono">
                Core
              </span>
            </div>
            <div className="p-1.5 space-y-0.5 text-xs">
              {[
                { name: 'Captura de cliente', icon: UserPlus },
                { name: 'Solicitar buró', icon: ShieldCheck },
                { name: 'Establecer como distribuidor', icon: ArrowRightLeft, highlight: true },
                { name: 'Historial Créditos', icon: CreditCard },
                { name: 'Datos Bancarios (Nuevo)', icon: CreditCard },
                { name: 'Registrar Foto Persona', icon: Camera },
                { name: 'Expediente digital', icon: FolderOpen },
                { name: 'Canjear Vale', icon: FileText },
                { name: 'Solicitud de Crédito', icon: FileText },
                { name: 'Imprimir Carta Prestanombres', icon: FileText },
                { name: 'Relaciona Con Distribuidor', icon: ArrowRightLeft },
                { name: 'Solicitar cambio de datos', icon: Edit },
                { name: 'Notas', icon: FileText },
                { name: 'Documentos Odoo', icon: ExternalLink, highlight: true },
              ].map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleAction(opt.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
                    opt.highlight
                      ? 'bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exportar */}
          <div className="bg-[#172138] rounded-xl border border-slate-700/80 p-2">
            <button
              onClick={() => alert('Exportando padrón de personas a formato Microsoft Excel (.xlsx)...')}
              className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-emerald-400 font-bold hover:bg-emerald-500/10 flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Padrón a Excel</span>
            </button>
          </div>
        </div>

        {selectedPersona && (
          <div className="p-3 bg-[#172138] rounded-xl border border-slate-700 text-xs text-slate-300 mt-3">
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
              Persona Seleccionada:
            </span>
            <span className="font-mono text-white font-bold block text-sm">
              ID #{selectedPersona.personaId}
            </span>
            <span className="truncate block font-semibold text-slate-200 mt-0.5">
              {selectedPersona.nombre} {selectedPersona.apellidoPaterno}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              CURP: {selectedPersona.curp}
            </span>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA: Data Table */}
      <main className="flex-1 p-4 overflow-x-auto flex flex-col space-y-3">
        {/* Top Filter Bar */}
        <div className="bg-[#131a2b] p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nombre, CURP, PersonaID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 bg-[#0c101c] text-white placeholder:text-slate-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Mostrando <span className="font-bold text-amber-400 font-mono">{filtered.length}</span> registros en padrón activo
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#131a2b] rounded-xl border border-slate-800 overflow-x-auto shadow-xl flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-[#172138] text-slate-300 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
              <tr>
                <th className="p-3 text-center">Acciones</th>
                <th className="p-3">Persona ID</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Apellido Paterno</th>
                <th className="p-3">Apellido Materno</th>
                <th className="p-3">Fecha Nacimiento</th>
                <th className="p-3">Pagaré Estatus</th>
                <th className="p-3 text-right">Pagaré Cantidad</th>
                <th className="p-3">CURP</th>
                <th className="p-3">RFC</th>
                <th className="p-3 text-center">Sexo</th>
                <th className="p-3">Buró Interno</th>
                <th className="p-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((p) => {
                const isSelected = p.personaId === selectedPersonaId;
                return (
                  <tr
                    key={p.personaId}
                    onClick={() => setSelectedPersonaId(p.personaId)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-500/15 font-semibold text-white'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <td className="p-2.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPersonaId(p.personaId);
                          alert(`Editar persona ID: ${p.personaId}`);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition"
                      >
                        Editar
                      </button>
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      #{p.personaId}
                    </td>
                    <td className="p-3 font-medium text-white">{p.nombre} {p.nombreAdicional || ''}</td>
                    <td className="p-3">{p.apellidoPaterno}</td>
                    <td className="p-3">{p.apellidoMaterno}</td>
                    <td className="p-3 font-mono text-slate-400">{p.fechaNacimiento}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.pagareEstatusId === 'FIRMADO EN BLANCO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.pagareEstatusId === 'SIN PAGARE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.pagareEstatusId}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-right text-slate-200 font-bold">
                      ${p.pagareCantidad.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300">
                      {p.curp}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {p.rfc}
                    </td>
                    <td className="p-3 text-center text-slate-400">{p.sexoId}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.buroInternoEstatus === 'NORMAL'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {p.buroInternoEstatus}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 max-w-xs truncate" title={p.observaciones}>
                      {p.observaciones || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
