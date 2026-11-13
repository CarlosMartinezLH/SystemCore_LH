'use client';

import React, { useState } from 'react';
import { STAGES } from '@/lib/data/initialData';
import { Prospect, StageId } from '@/types/crm';
import {
  Star,
  Clock,
  Plus,
  Phone,
  GripVertical,
  CheckCircle2,
  ArrowRight,
  Zap,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface KanbanBoardProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onQuickAdd: (stage: StageId) => void;
  onMoveStage?: (prospectId: string, newStage: StageId) => void;
  onPasarACore?: (prospectId: string) => void;
  onVerPerfilCore?: (distribuidorId: number) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onToggleView?: (view: 'kanban' | 'list') => void;
}

export default function KanbanBoard({
  prospects,
  onSelectProspect,
  onQuickAdd,
  onMoveStage,
  onPasarACore,
  onVerPerfilCore,
  searchQuery = '',
  onSearchChange,
  onToggleView,
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

  // Helper para obtener inicial y color del asesor
  const getAdvisorBadge = (advisorName: string) => {
    const first = advisorName?.trim().charAt(0).toUpperCase() || 'M';
    if (first === 'E') {
      return { letter: 'E', bg: 'bg-emerald-600 text-white' };
    }
    if (first === 'I') {
      return { letter: 'i', bg: 'bg-slate-500 text-white font-mono' };
    }
    return { letter: 'M', bg: 'bg-teal-600 text-white' };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#161822] text-slate-100 font-sans select-none">
      
      {/* ======================================================== */}
      {/* SUB-HEADER ESTILO ODOO CRM                               */}
      {/* ======================================================== */}
      <div className="px-4 py-2.5 bg-[#1f222e] border-b border-[#2d3242] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Botón [+ Nuevo] púrpura oficial */}
          <button
            type="button"
            onClick={() => onQuickAdd('contacto')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[#714b67] hover:bg-[#86597b] text-white shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nuevo</span>
          </button>

          {/* Menú Flujo */}
          <div className="relative hidden sm:flex items-center">
            <button
              type="button"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Flujo</span>
              <Settings className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Buscador de Oportunidades */}
          <div className="relative min-w-[200px] sm:min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Buscar prospecto o teléfono..."
              className="w-full pl-8 pr-3 py-1 bg-[#13151d] border border-[#2d3242] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Derecha: Sucursal & Vistas */}
        <div className="flex items-center gap-2.5">
          {/* Sucursal activa */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#282d3d] border border-[#383f54] text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-bold">Gómez Palacio</span>
          </div>

          {/* Switcher de Vistas (Kanban activo / Lista) */}
          <div className="flex items-center bg-[#13151d] border border-[#2d3242] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onToggleView && onToggleView('kanban')}
              className="p-1.5 rounded bg-teal-600 text-white shadow-xs transition cursor-pointer"
              title="Vista Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleView && onToggleView('list')}
              className="p-1.5 rounded text-slate-400 hover:text-white transition cursor-pointer"
              title="Vista Lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABLERO KANBAN                                           */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-4 min-h-0">
        <div className="inline-flex gap-3.5 min-w-full items-start pb-4 h-full">
          {STAGES.filter((s) => s.id !== 'perdido').map((stage) => {
            const stageProspects = prospects.filter((p) => p.stage === stage.id);
            const count = stageProspects.length;
            const isTargetDropZone = dragOverStage === stage.id;

            // Cantidad de prospectos con alertas de días (pink pill estilo Odoo)
            const alertCount = stageProspects.filter((p) => p.daysInStage > 0).length;

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-72 sm:w-80 flex-shrink-0 bg-[#1e222e] rounded-xl border transition-all duration-150 flex flex-col max-h-full ${
                  isTargetDropZone
                    ? 'border-teal-500 ring-2 ring-teal-500/30 bg-[#232838]'
                    : 'border-[#2d3242]'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-[#2d3242] bg-[#222634] rounded-t-xl shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-bold text-xs tracking-wide text-white uppercase truncate max-w-[170px]">
                        {stage.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Pink Alert Pill (días de atraso en etapa estilo Odoo) */}
                      {alertCount > 0 && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-[#e91e63] text-white">
                          {alertCount}
                        </span>
                      )}

                      {/* Contador total de la columna */}
                      <span className="text-[11px] font-bold text-slate-400">
                        {count}
                      </span>

                      {/* Botón rápido + */}
                      <button
                        type="button"
                        onClick={() => onQuickAdd(stage.id)}
                        className="p-1 hover:bg-slate-700/60 text-slate-400 hover:text-white rounded transition cursor-pointer"
                        title={`Nuevo en ${stage.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cards List */}
                <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[140px] max-h-[calc(100vh-190px)]">
                  {/* Drop zone visual feedback */}
                  {isTargetDropZone && (
                    <div className="py-2.5 px-3 border border-dashed border-teal-400/80 bg-teal-500/10 text-teal-300 rounded-lg text-center text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Soltar en {stage.name}</span>
                    </div>
                  )}

                  {stageProspects.length === 0 && !isTargetDropZone ? (
                    <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-[#2d3242] rounded-lg">
                      Sin prospectos
                    </div>
                  ) : (
                    stageProspects.map((prospect) => {
                      const isBeingDragged = draggedProspectId === prospect.id;
                      const advBadge = getAdvisorBadge(prospect.advisorName);

                      return (
                        <div
                          key={prospect.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, prospect.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onSelectProspect(prospect)}
                          className={`group bg-[#2a2f3e] hover:bg-[#32384a] rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${
                            isBeingDragged
                              ? 'opacity-30 border-dashed border-teal-400'
                              : prospect.coreSincronizado
                              ? 'border-emerald-500/50 hover:border-emerald-400'
                              : 'border-[#373e52] hover:border-slate-500'
                          }`}
                        >
                          {/* Accent line si ya está en Core */}
                          {prospect.coreSincronizado && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400" />
                          )}

                          {/* Top: Nombre de Oportunidad */}
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-extrabold text-white group-hover:text-teal-300 transition line-clamp-1 flex-1 tracking-tight">
                              {prospect.opportunityName}
                            </h4>
                            <span className="text-slate-500 group-hover:text-slate-300 transition shrink-0">
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Si está enlazado a Core Central */}
                          {prospect.coreSincronizado ? (
                            <div className="mt-1.5 flex items-center justify-between text-[10px]">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Core DV #{prospect.coreDistribuidorId}
                              </span>
                              {onVerPerfilCore && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onVerPerfilCore(prospect.coreDistribuidorId!);
                                  }}
                                  className="text-slate-400 hover:text-white underline"
                                >
                                  Ver Perfil
                                </button>
                              )}
                            </div>
                          ) : (
                            /* Botón rápido "Pasar a Core" en etapa de Activación o Legales */
                            (stage.id === 'activacion' || stage.id === 'legales') && onPasarACore && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPasarACore(prospect.id);
                                  }}
                                  className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                                >
                                  <Zap className="w-3 h-3 fill-white" />
                                  <span>Pasar a Core Central</span>
                                </button>
                              </div>
                            )
                          )}

                          {/* Card Footer: Estrellas + Clock + Pink Pill Días + Avatar */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#373e52] text-xs">
                            {/* Estrellas amarillas */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= prospect.priorityStars
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-slate-600'
                                  }`}
                                />
                              ))}
                              <Clock className="w-3 h-3 text-slate-500 ml-1.5" />
                            </div>

                            {/* Días en etapa (Pink Pill) y Badge de Asesor */}
                            <div className="flex items-center gap-1.5">
                              {prospect.daysInStage > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#e91e63] text-white">
                                  {prospect.daysInStage} d
                                </span>
                              )}

                              {/* Letra inicial del asesor: Verde E / Teal M */}
                              <div
                                title={prospect.advisorName}
                                className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${advBadge.bg}`}
                              >
                                {advBadge.letter}
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
    </div>
  );
}
