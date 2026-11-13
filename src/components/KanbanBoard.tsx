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
  selectedSucursal?: string;
  onSelectSucursal?: (sucursal: string) => void;
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
  selectedSucursal = 'GÓMEZ PALACIO',
  onSelectSucursal,
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
    return { letter: 'M', bg: 'bg-blue-600 text-white' };
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#f8fafc] text-slate-800 font-sans select-none">
      
      {/* ======================================================== */}
      {/* SUB-HEADER SUPERIOR EN BLANCO CORPORATIVO                */}
      {/* ======================================================== */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          {/* Botón [+ Nuevo] azul institucional */}
          <button
            type="button"
            onClick={() => onQuickAdd('contacto')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nuevo</span>
          </button>

          {/* Buscador de Oportunidades */}
          <div className="relative min-w-[200px] sm:min-w-[280px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Buscar prospecto o teléfono..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition font-normal"
            />
          </div>
        </div>

        {/* Derecha: Sucursal & Vistas */}
        <div className="flex items-center gap-2.5">
          {/* Selector de Sucursal Activa Seleccionable */}
          <div className="relative inline-flex items-center">
            <MapPin className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 pointer-events-none z-10" />
            <select
              value={selectedSucursal || 'GÓMEZ PALACIO'}
              onChange={(e) => onSelectSucursal && onSelectSucursal(e.target.value)}
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

          {/* Switcher de Vistas (Kanban activo / Lista) */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onToggleView && onToggleView('kanban')}
              className="px-2.5 py-1 rounded-md bg-white text-blue-600 shadow-2xs text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              title="Vista Tablero Kanban (activa)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleView && onToggleView('list')}
              className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-900 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              title="Cambiar a Vista Tabla"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABLERO KANBAN EN COLOR BLANCO / SLATE SUAVE             */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-4 pt-3 pb-2 bg-[#f8fafc]">
        <div className="inline-flex gap-4 min-w-full h-full pb-1">
          {STAGES.filter((s) => s.id !== 'perdido').map((stage) => {
            const stageProspects = prospects.filter((p) => p.stage === stage.id);
            const count = stageProspects.length;
            const isTargetDropZone = dragOverStage === stage.id;
            const alertCount = stageProspects.filter((p) => p.daysInStage > 0).length;

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-72 sm:w-80 flex-shrink-0 bg-slate-100/70 rounded-2xl border transition-all duration-150 flex flex-col h-full shadow-2xs overflow-hidden ${
                  isTargetDropZone
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/40'
                    : 'border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200 bg-white rounded-t-2xl shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-semibold text-xs text-slate-700 truncate max-w-[170px]">
                        {stage.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Pink Alert Pill (días de atraso en etapa) */}
                      {alertCount > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          {alertCount}
                        </span>
                      )}

                      {/* Contador total de la columna */}
                      <span className="text-[11px] font-normal text-slate-500 px-1.5 py-0.5 rounded-md bg-slate-100">
                        {count}
                      </span>

                      {/* Botón rápido + */}
                      <button
                        type="button"
                        onClick={() => onQuickAdd(stage.id)}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded transition cursor-pointer"
                        title={`Nuevo en ${stage.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cards List */}
                <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-0">
                  {/* Drop zone visual feedback */}
                  {isTargetDropZone && (
                    <div className="py-2.5 px-3 border border-dashed border-blue-400 bg-blue-50 text-blue-700 rounded-xl text-center text-xs font-medium flex items-center justify-center gap-2 animate-pulse">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Soltar en {stage.name}</span>
                    </div>
                  )}

                  {stageProspects.length === 0 && !isTargetDropZone ? (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/60">
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
                          className={`group bg-white hover:bg-slate-50/80 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden shadow-2xs hover:shadow-sm ${
                            isBeingDragged
                              ? 'opacity-30 border-dashed border-blue-400'
                              : prospect.coreSincronizado
                              ? 'border-emerald-300 hover:border-emerald-500'
                              : 'border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {/* Accent line si ya está en Core */}
                          {prospect.coreSincronizado && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                          )}

                          {/* Top: Nombre de Oportunidad */}
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-medium text-slate-800 group-hover:text-blue-600 transition line-clamp-1 flex-1">
                              {prospect.opportunityName}
                            </h4>
                            <span className="text-slate-300 group-hover:text-slate-500 transition shrink-0">
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Teléfono */}
                          {prospect.phone && (
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-normal">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{prospect.phone}</span>
                            </div>
                          )}

                          {/* Si está enlazado a Core Central */}
                          {prospect.coreSincronizado ? (
                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Core DV #{prospect.coreDistribuidorId}
                              </span>
                              {onVerPerfilCore && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onVerPerfilCore(prospect.coreDistribuidorId!);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-medium underline"
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
                                  className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[10px] flex items-center justify-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                                >
                                  <Zap className="w-3 h-3 fill-white" />
                                  <span>Pasar a Core Central</span>
                                </button>
                              </div>
                            )
                          )}

                          {/* Card Footer: Estrellas + Clock + Días Badge + Avatar */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs">
                            {/* Estrellas amarillas */}
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
                              <Clock className="w-3 h-3 text-slate-400 ml-1.5" />
                            </div>

                            {/* Días en etapa y Badge de Asesor */}
                            <div className="flex items-center gap-1.5">
                              {prospect.daysInStage > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  {prospect.daysInStage} d
                                </span>
                              )}

                              {/* Letra inicial del asesor */}
                              <div
                                title={prospect.advisorName}
                                className={`w-4 h-4 rounded text-[10px] font-medium flex items-center justify-center ${advBadge.bg}`}
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
