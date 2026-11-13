'use client';

import React from 'react';
import { Prospect, StageId } from '@/types/crm';
import { STAGES } from '@/lib/data/initialData';
import { Clock, Phone, Mail, User, ShieldCheck, MapPin, ChevronDown, LayoutGrid, List, Plus, Search } from 'lucide-react';

interface TableViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onToggleView?: (view: 'kanban' | 'list') => void;
  selectedSucursal?: string;
  onSelectSucursal?: (sucursal: string) => void;
  onQuickAdd?: (stage: StageId) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export default function TableView({
  prospects,
  onSelectProspect,
  onToggleView,
  selectedSucursal = 'GÓMEZ PALACIO',
  onSelectSucursal,
  onQuickAdd,
  searchQuery = '',
  onSearchChange,
}: TableViewProps) {
  const getStageName = (stageId: string) => {
    return STAGES.find((s) => s.id === stageId)?.name || stageId;
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#f8fafc] text-slate-800 font-sans select-none">
      
      {/* ======================================================== */}
      {/* SUB-HEADER SUPERIOR EN BLANCO CORPORATIVO                */}
      {/* ======================================================== */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          {/* Botón [+ Nuevo] azul institucional */}
          {onQuickAdd && (
            <button
              type="button"
              onClick={() => onQuickAdd('contacto')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nuevo</span>
            </button>
          )}

          {/* Botón directo para regresar a Kanban */}
          {onToggleView && (
            <button
              type="button"
              onClick={() => onToggleView('kanban')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Regresar a vista Tablero Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
              <span>Ver en Kanban</span>
            </button>
          )}

          {/* Buscador de Oportunidades */}
          {onSearchChange && (
            <div className="relative min-w-[200px] sm:min-w-[280px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar prospecto o teléfono..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition font-normal"
              />
            </div>
          )}
        </div>

        {/* Derecha: Sucursal & Switcher de Vistas */}
        <div className="flex items-center gap-2.5">
          {/* Selector de Sucursal Activa */}
          {onSelectSucursal && (
            <div className="relative inline-flex items-center">
              <MapPin className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 pointer-events-none z-10" />
              <select
                value={selectedSucursal || 'GÓMEZ PALACIO'}
                onChange={(e) => onSelectSucursal(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition shadow-2xs"
                title="Seleccionar sucursal activa"
              >
                <option value="GÓMEZ PALACIO">Gómez Palacio</option>
                <option value="TORREÓN">Torreón Centro</option>
                <option value="SALTILLO">Saltillo Centro</option>
                <option value="MONCLOVA">Monclova</option>
                <option value="RAMOS ARIZPE">Ramos Arizpe</option>
                <option value="TODAS">Todas las Sucursales</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          )}

          {/* Switcher de Vistas (Kanban / Tabla) */}
          {onToggleView && (
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onToggleView('kanban')}
                className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-900 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                title="Cambiar a Vista Tablero Kanban"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleView('list')}
                className="px-2.5 py-1 rounded-md bg-white text-blue-600 shadow-2xs text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                title="Vista Tabla activa"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONTENIDO TABLA PRINCIPAL                                */}
      {/* ======================================================== */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Listado Maestro de Prospectos</h2>
              <p className="text-xs text-slate-500 font-medium">Visualización tabular de CRM LanAhora</p>
            </div>
            <span className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
              {prospects.length} Registros
            </span>
          </div>

        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="px-4 py-3">Oportunidad / Prospecto</th>
              <th className="px-4 py-3">Etapa Actual</th>
              <th className="px-4 py-3">CURP / RFC</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Perfil Asignado</th>
              <th className="px-4 py-3">Asesor de Crédito</th>
              <th className="px-4 py-3 text-right">Antigüedad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  No se encontraron prospectos con los filtros actuales
                </td>
              </tr>
            ) : (
              prospects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProspect(p)}
                  className="hover:bg-blue-50/60 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {p.firstName ? p.firstName.charAt(0) : 'P'}
                    </div>
                    <div>
                      <div className="font-bold text-blue-700 hover:underline">{p.opportunityName}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.firstName} {p.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      {getStageName(p.stage)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                    <div className="font-semibold">{p.curp || '—'}</div>
                    <div className="text-slate-400 text-[10px]">{p.rfc || ''}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{p.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {p.origin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.assignedProfile !== 'SIN_ASIGNAR' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {p.assignedProfile}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold">
                        A
                      </span>
                      <span>{p.advisorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {p.daysInStage} d
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
