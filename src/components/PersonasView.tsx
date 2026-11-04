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
    <div className="flex-1 bg-[#f0f4fa] text-slate-800 flex flex-col md:flex-row min-h-[calc(100vh-105px)] overflow-hidden font-sans">
      {/* LEFT SIDEBAR: OPCIONES (Estilo LanAhora Blue) */}
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
              onClick={() => alert('Exportando padrón de personas a formato Microsoft Excel (.xlsx)...')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs text-emerald-700 font-bold hover:bg-emerald-100/50 flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Padrón a Excel</span>
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
        {/* Top Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-blue-500" />
            <input
              type="text"
              placeholder="Buscar por Nombre, CURP, PersonaID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563eb] bg-white text-slate-900"
            />
          </div>

          <div className="text-xs text-slate-500">
            Mostrando <span className="font-black text-[#2563eb] font-mono">{filtered.length}</span> registros en padrón
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-blue-100 overflow-x-auto shadow-md flex-1">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-[#1d4ed8] text-white font-bold border-b border-blue-700 text-[11px] uppercase tracking-wider select-none">
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
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isSelected = p.personaId === selectedPersonaId;
                return (
                  <tr
                    key={p.personaId}
                    onClick={() => setSelectedPersonaId(p.personaId)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50 font-bold text-blue-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPersonaId(p.personaId);
                          alert(`Editar persona ID: ${p.personaId}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563eb] text-[10px] font-bold border border-blue-200"
                      >
                        Editar
                      </button>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#2563eb]">
                      #{p.personaId}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{p.nombre} {p.nombreAdicional || ''}</td>
                    <td className="p-3">{p.apellidoPaterno}</td>
                    <td className="p-3">{p.apellidoMaterno}</td>
                    <td className="p-3 font-mono text-slate-500">{p.fechaNacimiento}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.pagareEstatusId === 'FIRMADO EN BLANCO'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.pagareEstatusId === 'SIN PAGARE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.pagareEstatusId}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-right text-slate-900 font-bold">
                      ${p.pagareCantidad.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      {p.curp}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      {p.rfc}
                    </td>
                    <td className="p-3 text-center text-slate-500">{p.sexoId}</td>
                    <td className="p-3">
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
                    <td className="p-3 text-slate-500 max-w-xs truncate" title={p.observaciones}>
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
