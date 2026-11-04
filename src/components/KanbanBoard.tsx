'use client';

import React from 'react';
import { STAGES } from '@/lib/data/initialData';
import { Prospect, StageId } from '@/types/crm';
import { Star, Clock, Plus, Phone } from 'lucide-react';

interface KanbanBoardProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onQuickAdd: (stage: StageId) => void;
  onMoveStage?: (prospectId: string, newStage: StageId) => void;
}

export default function KanbanBoard({
  prospects,
  onSelectProspect,
  onQuickAdd,
}: KanbanBoardProps) {
  return (
    <div className="flex-1 overflow-x-auto p-4 bg-[#f0f4fa] min-h-[calc(100vh-105px)] font-sans">
      <div className="inline-flex gap-4 min-w-full items-start pb-6">
        {STAGES.map((stage) => {
          const stageProspects = prospects.filter((p) => p.stage === stage.id);
          const count = stageProspects.length;

          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0 bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col max-h-[calc(100vh-130px)]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-blue-100 flex items-center justify-between sticky top-0 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 z-10 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs text-blue-950 tracking-wide uppercase">
                    {stage.name}
                  </h3>
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      count > 0
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <button
                  onClick={() => onQuickAdd(stage.id)}
                  title={`Agregar a ${stage.name}`}
                  className="p-1 hover:bg-white text-[#2563eb] rounded-lg transition"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Cards List */}
              <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 bg-[#f8faff]/60">
                {stageProspects.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-blue-200 rounded-xl bg-white/50">
                    Sin prospectos en esta etapa
                  </div>
                ) : (
                  stageProspects.map((prospect) => (
                    <div
                      key={prospect.id}
                      onClick={() => onSelectProspect(prospect)}
                      className="group cursor-pointer bg-white hover:bg-blue-50/40 border border-blue-100 hover:border-[#2563eb] rounded-xl p-3.5 transition shadow-xs hover:shadow-md relative overflow-hidden active:scale-[0.99]"
                    >
                      {/* Left color bar for approved */}
                      {prospect.assignedProfile !== 'SIN_ASIGNAR' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#facc15]" />
                      )}

                      {/* Opportunity Name */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#2563eb] transition line-clamp-1">
                          {prospect.opportunityName}
                        </h4>
                      </div>

                      {/* Contact Phone */}
                      {prospect.phone && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-mono">
                          <Phone className="w-3 h-3 text-[#2563eb]" />
                          <span>{prospect.phone}</span>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {prospect.assignedProfile !== 'SIN_ASIGNAR' && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#facc15] text-slate-950 shadow-xs">
                            {prospect.assignedProfile}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                          {prospect.origin}
                        </span>
                        {prospect.financialCurpStatus === 'VALIDO' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                            CURP Válida
                          </span>
                        )}
                      </div>

                      {/* Card Footer: Stars + Days Badge + Advisor Avatar */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= prospect.priorityStars
                                  ? 'text-[#facc15] fill-[#facc15]'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prospect.daysInStage > 15
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{prospect.daysInStage} d</span>
                          </div>

                          <div
                            title={prospect.advisorName}
                            className="w-5 h-5 rounded-full bg-[#2563eb] text-white font-black text-[10px] flex items-center justify-center shadow-xs"
                          >
                            {prospect.advisorName.charAt(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
