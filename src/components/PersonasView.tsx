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
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface PersonasViewProps {
  onEstablishAsDistributor?: (persona: PersonaCore) => void;
}

export default function PersonasView({ onEstablishAsDistributor }: PersonasViewProps) {
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
    alert(`Ejecutando acción: "${actionName}" para PersonaID: ${selectedPersona.personaId} (${selectedPersona.nombre} ${selectedPersona.apellidoPaterno})`);
  };

  return (
    <div className="flex-1 bg-[#eceef2] text-slate-800 flex flex-col md:flex-row min-h-[calc(100vh-105px)] overflow-hidden font-sans">
      {/* LEFT SIDEBAR: OPCIONES (Exacto al sidebar de Financialsoft) */}
      <aside className="w-full md:w-56 bg-[#f7f8fa] border-r border-slate-300 p-2 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-3">
          <div className="border border-slate-300 rounded overflow-hidden shadow-sm bg-white">
            <div className="bg-[#435970] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
              <span>Opciones</span>
              <span className="text-[10px] text-slate-300">Core</span>
            </div>
            <div className="p-1 space-y-0.5 text-xs">
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
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                    opt.highlight
                      ? 'bg-blue-50 text-blue-700 font-bold hover:bg-blue-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <opt.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exportar */}
          <div className="border border-slate-300 rounded overflow-hidden shadow-sm bg-white">
            <div className="bg-[#435970] text-white px-3 py-1.5 text-xs font-bold">
              Exportar
            </div>
            <div className="p-1">
              <button
                onClick={() => alert('Exportando padrón de personas a formato Microsoft Excel (.xlsx)...')}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs text-emerald-700 font-semibold hover:bg-emerald-50 flex items-center gap-2 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar a Excel</span>
              </button>
            </div>
          </div>
        </div>

        {selectedPersona && (
          <div className="p-2 bg-slate-200/80 rounded border border-slate-300 text-[11px] text-slate-700 mt-3">
            <span className="font-bold block text-slate-900">Seleccionado:</span>
            <span>ID: {selectedPersona.personaId}</span>
            <br />
            <span className="truncate block font-medium">
              {selectedPersona.nombre} {selectedPersona.apellidoPaterno}
            </span>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA: Data Table */}
      <main className="flex-1 p-3 overflow-x-auto flex flex-col">
        {/* Top Filter Bar */}
        <div className="bg-white p-2.5 rounded-t border border-slate-300 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Introduzca el texto a buscar (Nombre, CURP, PersonaID)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-slate-50"
            />
          </div>

          <div className="text-xs text-slate-500">
            Mostrando <span className="font-bold text-slate-800">{filtered.length}</span> personas en el padrón
          </div>
        </div>

        {/* Data Table (Replica exacta de la pantalla de Financialsoft) */}
        <div className="bg-white border-x border-b border-slate-300 overflow-x-auto shadow-sm flex-1">
          <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
            <thead className="bg-[#e4e7ed] text-slate-700 font-semibold border-b border-slate-300 select-none">
              <tr>
                <th className="p-2 border-r border-slate-300 text-center">Acciones</th>
                <th className="p-2 border-r border-slate-300">Persona ID</th>
                <th className="p-2 border-r border-slate-300">Nombre</th>
                <th className="p-2 border-r border-slate-300">Nombre Adicional</th>
                <th className="p-2 border-r border-slate-300">Apellido Paterno</th>
                <th className="p-2 border-r border-slate-300">Apellido Materno</th>
                <th className="p-2 border-r border-slate-300">Fecha Nacimiento</th>
                <th className="p-2 border-r border-slate-300">pagare Estatus Id</th>
                <th className="p-2 border-r border-slate-300">pagare Cantidad</th>
                <th className="p-2 border-r border-slate-300">CURP</th>
                <th className="p-2 border-r border-slate-300">RFC</th>
                <th className="p-2 border-r border-slate-300">Sexo ID</th>
                <th className="p-2 border-r border-slate-300">Buro Interno Estatus</th>
                <th className="p-2">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((p) => {
                const isSelected = p.personaId === selectedPersonaId;
                return (
                  <tr
                    key={p.personaId}
                    onClick={() => setSelectedPersonaId(p.personaId)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-100 font-medium text-slate-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="p-1.5 border-r border-slate-200 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPersonaId(p.personaId);
                          alert(`Editar persona ID: ${p.personaId}`);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold border border-slate-300"
                      >
                        Editar
                      </button>
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-blue-700">
                      {p.personaId}
                    </td>
                    <td className="p-2 border-r border-slate-200">{p.nombre}</td>
                    <td className="p-2 border-r border-slate-200">{p.nombreAdicional || ''}</td>
                    <td className="p-2 border-r border-slate-200">{p.apellidoPaterno}</td>
                    <td className="p-2 border-r border-slate-200">{p.apellidoMaterno}</td>
                    <td className="p-2 border-r border-slate-200 font-mono">{p.fechaNacimiento}</td>
                    <td className="p-2 border-r border-slate-200">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
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
                    <td className="p-2 border-r border-slate-200 font-mono text-right">
                      {p.pagareCantidad.toFixed(4)}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono text-[10px]">
                      {p.curp}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-mono text-[10px]">
                      {p.rfc}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">{p.sexoId}</td>
                    <td className="p-2 border-r border-slate-200">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          p.buroInternoEstatus === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.buroInternoEstatus}
                      </span>
                    </td>
                    <td className="p-2 text-slate-500 max-w-xs truncate" title={p.observaciones}>
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

