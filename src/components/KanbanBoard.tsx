'use client';

import React, { useState } from 'react';
import { STAGES } from '@/lib/data/initialData';
import { Prospect, StageId } from '@/types/crm';
import { Star, Clock, Plus, Phone, GripVertical, CheckCircle2, ArrowRight } from 'lucide-react';

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
  onMoveStage,
}: KanbanBoardProps) {
  const [draggedProspectId, setDraggedProspectId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<StageId | null>(null);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, prospectId: string) => {
    e.dataTransfer.setData('text/plain', prospectId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProspectId(prospectId);
  };

  const handleDragEnd = () => {
    setDraggedProspectId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = (e: React.DragEvent, stageId: StageId) => {
    // Only clear if leaving the column completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverStage === stageId) {
        setDragOverStage(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    const prospectId = e.dataTransfer.getData('text/plain') || draggedProspectId;
    if (prospectId && onMoveStage) {
      onMoveStage(prospectId, stageId);
    }
    setDraggedProspectId(null);
    setDragOverStage(null);
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 lg:p-6 bg-[#f8fafc] min-h-[calc(100vh-105px)] font-sans select-none">
      <div className="inline-flex gap-4 min-w-full items-start pb-6">
        {STAGES.map((stage) => {
          const stageProspects = prospects.filter((p) => p.stage === stage.id);
          const count = stageProspects.length;
          const isTargetDropZone = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`w-80 flex-shrink-0 bg-white rounded-2xl border transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col max-h-[calc(100vh-130px)] ${
                isTargetDropZone
                  ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/20 scale-[1.01]'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b flex items-center justify-between sticky top-0 backdrop-blur-xs z-10 rounded-t-2xl transition-colors ${
                  isTargetDropZone
                    ? 'bg-blue-50/90 border-blue-200 text-blue-900'
                    : 'bg-slate-50/80 border-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs tracking-wider uppercase">
                    {stage.name}
                  </h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition ${
                      isTargetDropZone
                        ? 'bg-blue-600 text-white shadow-xs'
                        : count > 0
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <button
                  onClick={() => onQuickAdd(stage.id)}
                  title={`Agregar nuevo prospecto a ${stage.name}`}
                  className="p-1 hover:bg-slate-200/60 text-slate-600 rounded-lg transition active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Cards List */}
              <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/40">
                {/* Visual Drop Target Highlight when dragging over this column */}
                {isTargetDropZone && (
                  <div className="py-3 px-4 border-2 border-dashed border-blue-400 bg-blue-100/40 text-blue-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>Soltar aquí para mover a {stage.name}</span>
                  </div>
                )}

                {stageProspects.length === 0 && !isTargetDropZone ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/70">
                    Sin prospectos en esta etapa
                  </div>
                ) : (
                  stageProspects.map((prospect) => {
                    const isBeingDragged = draggedProspectId === prospect.id;

                    return (
                      <div
                        key={prospect.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, prospect.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectProspect(prospect)}
                        className={`group bg-white rounded-xl p-3.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative overflow-hidden border cursor-grab active:cursor-grabbing ${
                          isBeingDragged
                            ? 'opacity-40 scale-[0.98] border-dashed border-blue-400 bg-blue-50/30'
                            : 'hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300 hover:shadow-md active:scale-[0.99]'
                        }`}
                      >
                        {/* Profile Bar indicator */}
                        {prospect.assignedProfile !== 'SIN_ASIGNAR' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                        )}

                        {/* Top: Opportunity Name & Drag Handle Grip */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1 flex-1">
                            {prospect.opportunityName}
                          </h4>
                          <span
                            className="text-slate-300 group-hover:text-slate-500 transition shrink-0 p-0.5"
                            title="Arrastra para mover de etapa"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {/* Contact Phone */}
                        {prospect.phone && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{prospect.phone}</span>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {prospect.assignedProfile !== 'SIN_ASIGNAR' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80">
                              {prospect.assignedProfile}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70 font-medium">
                            {prospect.origin}
                          </span>
                          {prospect.financialCurpStatus === 'VALIDO' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>CURP Válida</span>
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
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                prospect.daysInStage > 15
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{prospect.daysInStage} d</span>
                            </div>

                            <div
                              title={prospect.advisorName}
                              className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shadow-xs"
                            >
                              {prospect.advisorName ? prospect.advisorName.charAt(0) : 'A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
