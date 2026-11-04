'use client';

import React from 'react';
import { Prospect } from '@/types/crm';
import { STAGES } from '@/lib/data/initialData';
import { Clock, Phone, Mail, User, ShieldCheck } from 'lucide-react';

interface TableViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
}

export default function TableView({ prospects, onSelectProspect }: TableViewProps) {
  const getStageName = (stageId: string) => {
    return STAGES.find((s) => s.id === stageId)?.name || stageId;
  };

  return (
    <div className="flex-1 p-4 bg-[#f0f4fa] min-h-[calc(100vh-105px)] overflow-x-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Listado Maestro de Prospectos</h2>
            <p className="text-xs text-slate-500">Visualización tabular de originación LanAhora</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {prospects.length} Registros
          </span>
        </div>

        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-[#2563eb] text-white uppercase text-[10px] tracking-wider font-bold">
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
  );
}
