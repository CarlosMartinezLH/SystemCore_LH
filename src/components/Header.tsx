'use client';

import React from 'react';
import {
  Clock,
  MessageSquare,
  Sparkles,
  ChevronDown,
  Layers,
  Search,
  Filter,
  Users,
  Briefcase,
  SearchCheck,
  UserCheck,
} from 'lucide-react';

export type ActiveAppModule = 'crm' | 'core_dashboard' | 'personas' | 'distribuidores' | 'rh';

interface HeaderProps {
  activeModule: ActiveAppModule;
  onModuleChange: (mod: ActiveAppModule) => void;
  currentView: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
  onOpenNewLead: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  activeModule,
  onModuleChange,
  currentView,
  onViewChange,
  onOpenNewLead,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#161922] text-slate-100 border-b border-slate-800 shadow-md">
      {/* Top Main Navigation Bar */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* Logo / App Name */}
          <div
            onClick={() => onModuleChange('core_dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-sm">
              LH
            </div>
            <span className="font-semibold text-base tracking-wide text-white flex items-center gap-2">
              SystemCore <span className="text-xs font-normal px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">LanAhora</span>
            </span>
          </div>

          {/* Menus Principales: CRM + Core Modules + RH */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => onModuleChange('crm')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeModule === 'crm'
                  ? 'bg-teal-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CRM Originación</span>
            </button>

            <button
              onClick={() => onModuleChange('core_dashboard')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeModule === 'core_dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5" />
              <span>Core Buscador</span>
            </button>

            <button
              onClick={() => onModuleChange('personas')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeModule === 'personas'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Personas</span>
            </button>

            <button
              onClick={() => onModuleChange('distribuidores')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeModule === 'distribuidores'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Distribuidores (DV)</span>
            </button>

            <button
              onClick={() => onModuleChange('rh')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeModule === 'rh'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-indigo-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Capital Humano & GPS (Buk)</span>
            </button>
          </nav>
        </div>

        {/* Right Action Icons & User Info */}
        <div className="flex items-center gap-3">
          <button
            title="Asistente IA"
            className="p-1.5 text-purple-400 hover:bg-white/10 rounded-lg transition"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              title="Mensajes"
              className="p-1.5 text-slate-300 hover:bg-white/10 rounded-lg transition"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              3
            </span>
          </div>
          <button
            title="Actividades"
            className="p-1.5 text-slate-300 hover:bg-white/10 rounded-lg transition"
          >
            <Clock className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1" />

          {/* User badge */}
          <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer transition">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              JC
            </div>
            <span className="text-xs text-slate-200 font-medium hidden sm:inline">
              JOSE CARLOS MARTINEZ MAYORGA
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Mobile navigation tab-bar */}
      <div className="lg:hidden px-3 py-1.5 bg-[#1a1e28] border-t border-slate-800 flex items-center justify-around text-xs overflow-x-auto gap-2">
        <button
          onClick={() => onModuleChange('crm')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeModule === 'crm' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400'}`}
        >
          CRM
        </button>
        <button
          onClick={() => onModuleChange('core_dashboard')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeModule === 'core_dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Buscador Core
        </button>
        <button
          onClick={() => onModuleChange('personas')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeModule === 'personas' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Personas
        </button>
        <button
          onClick={() => onModuleChange('distribuidores')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeModule === 'distribuidores' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
        >
          Distribuidores
        </button>
        <button
          onClick={() => onModuleChange('rh')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeModule === 'rh' ? 'bg-indigo-600 text-white font-bold' : 'text-indigo-300'}`}
        >
          RH & GPS
        </button>
      </div>

      {/* Sub-bar / Actions & Filter Bar for CRM */}
      {activeModule === 'crm' && (
        <div className="px-4 py-2.5 bg-[#1e222d] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewLead}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow transition active:scale-95"
            >
              <span className="text-base font-bold leading-none">+</span>
              Nuevo Prospecto
            </button>

            <h1 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Flujo de Prospección
              <span className="text-xs font-normal text-slate-400">
                (Originación DV Odoo)
              </span>
            </h1>
          </div>

          {/* Search, Filter and View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar prospecto por nombre, CURP..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded bg-slate-900/80 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 w-52 sm:w-64"
              />
            </div>

            {/* View Toggles (Kanban / List) */}
            <div className="flex items-center rounded border border-slate-700 bg-slate-900/60 p-0.5">
              <button
                onClick={() => onViewChange('kanban')}
                title="Vista Kanban"
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  currentView === 'kanban'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onViewChange('list')}
                title="Vista de Lista"
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  currentView === 'list'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
