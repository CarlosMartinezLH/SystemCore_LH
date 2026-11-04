'use client';

import React from 'react';
import { Prospect } from '@/types/crm';
import { STAGES } from '@/lib/data/initialData';
import { Clock, Phone, Mail, User } from 'lucide-react';

interface TableViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
}

export default function TableView({ prospects, onSelectProspect }: TableViewProps) {
  const getStageName = (stageId: string) => {
    return STAGES.find((s) => s.id === stageId)?.name || stageId;
  };

  return (
    <div className="flex-1 p-4 bg-[#0f1117] min-h-[calc(100vh-105px)] overflow-x-auto">
      <div className="bg-[#171a23] rounded-lg border border-slate-800 overflow-hidden shadow">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#1f2430] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Oportunidad / Prospecto</th>
              <th className="px-4 py-3">Etapa</th>
              <th className="px-4 py-3">CURP / RFC</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Perfil Asignado</th>
              <th className="px-4 py-3">Asesor</th>
              <th className="px-4 py-3 text-right">Días</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  No se encontraron prospectos con los filtros actuales
                </td>
              </tr>
            ) : (
              prospects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProspect(p)}
                  className="hover:bg-[#202534] cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium text-slate-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold text-[10px]">
                      {p.firstName ? p.firstName.charAt(0) : 'P'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{p.opportunityName}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.firstName} {p.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-teal-300 border border-teal-500/30">
                      {getStageName(p.stage)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                    <div>{p.curp || '—'}</div>
                    <div className="text-slate-500">{p.rfc || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{p.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {p.origin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.assignedProfile !== 'SIN_ASIGNAR' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {p.assignedProfile}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center">
                        {p.advisorName.charAt(0)}
                      </div>
                      <span>{p.advisorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {p.daysInStage}d
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

