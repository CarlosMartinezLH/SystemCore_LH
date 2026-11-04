'use client';

import React from 'react';
import { STAGES } from '@/lib/data/initialData';
import { Prospect, StageId } from '@/types/crm';
import { Star, Clock, Plus, Phone, AlertCircle } from 'lucide-react';

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
    <div className="flex-1 overflow-x-auto p-4 bg-[#0f1117] min-h-[calc(100vh-105px)]">
      <div className="inline-flex gap-4 min-w-full items-start pb-6">
        {STAGES.map((stage) => {
          const stageProspects = prospects.filter((p) => p.stage === stage.id);
          const count = stageProspects.length;

          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0 bg-[#171a23] rounded-lg border border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-130px)]"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#171a23] z-10 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-xs text-slate-200 tracking-wide uppercase">
                    {stage.name}
                  </h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      count > 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <button
                  onClick={() => onQuickAdd(stage.id)}
                  title={`Agregar a ${stage.name}`}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards List */}
              <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                {stageProspects.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-md">
                    Sin prospectos en esta etapa
                  </div>
                ) : (
                  stageProspects.map((prospect) => (
                    <div
                      key={prospect.id}
                      onClick={() => onSelectProspect(prospect)}
                      className="group cursor-pointer bg-[#202430] hover:bg-[#282d3c] border border-slate-700/60 hover:border-teal-500/60 rounded-md p-3 transition shadow-sm hover:shadow relative overflow-hidden"
                    >
                      {/* Left color bar for approved or active items */}
                      {prospect.assignedProfile !== 'SIN_ASIGNAR' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400" />
                      )}

                      {/* Opportunity Name */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-100 group-hover:text-teal-300 transition line-clamp-1">
                          {prospect.opportunityName}
                        </h4>
                      </div>

                      {/* Contact / Phone info if exists */}
                      {prospect.phone && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{prospect.phone}</span>
                        </div>
                      )}

                      {/* Profile or Origin Tag */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {prospect.assignedProfile !== 'SIN_ASIGNAR' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {prospect.assignedProfile}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {prospect.origin}
                        </span>
                        {prospect.financialCurpStatus === 'VALIDO' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            CURP Válida
                          </span>
                        )}
                      </div>

                      {/* Card Footer: Stars + Days Badge + Advisor Avatar */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/40 text-xs">
                        {/* Rating Stars (Odoo style) */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= prospect.priorityStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Days in stage badge */}
                          <div
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              prospect.daysInStage > 15
                                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{prospect.daysInStage} d</span>
                          </div>

                          {/* Advisor Avatar */}
                          <div
                            title={prospect.advisorName}
                            className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center border border-purple-400/30"
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
