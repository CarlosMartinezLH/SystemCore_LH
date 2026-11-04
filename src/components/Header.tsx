'use client';

import React, { useState } from 'react';
import { UserSession } from '@/types/auth';
import {
  Layers,
  SearchCheck,
  Users,
  Briefcase,
  UserCheck,
  Smartphone,
  LogOut,
  ChevronDown,
  Bell,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';

export type ActiveAppModule = 'crm' | 'core_dashboard' | 'personas' | 'distribuidores' | 'rh' | 'mobile_app';

interface HeaderProps {
  currentUser: UserSession;
  activeModule: ActiveAppModule;
  onModuleChange: (mod: ActiveAppModule) => void;
  onLogout: () => void;
  onOpenNewLead: () => void;
}

export default function Header({
  currentUser,
  activeModule,
  onModuleChange,
  onLogout,
  onOpenNewLead,
}: HeaderProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0c111d] text-slate-100 border-b border-slate-800/80 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & System Name */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onModuleChange('core_dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
              LH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  LanAhora
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  SystemCore
                </span>
              </div>
              <p className="text-[10px] text-amber-400/90 italic font-medium -mt-0.5">
                ¡En Ti confiamos!
              </p>
            </div>
          </div>

          {/* Unified Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => onModuleChange('mobile_app')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border ${
                activeModule === 'mobile_app'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-xs'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>App Móvil (Asesores)</span>
            </button>

            <button
              onClick={() => onModuleChange('crm')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border ${
                activeModule === 'crm'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold shadow-xs'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>CRM & Originación</span>
            </button>

            <button
              onClick={() => onModuleChange('core_dashboard')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border ${
                activeModule === 'core_dashboard'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold shadow-xs'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Buscador Core</span>
            </button>

            <button
              onClick={() => onModuleChange('personas')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border ${
                activeModule === 'personas'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold shadow-xs'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Personas</span>
            </button>

            <button
              onClick={() => onModuleChange('distribuidores')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border ${
                activeModule === 'distribuidores'
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold shadow-xs'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Distribuidores (DV)</span>
            </button>

            <button
              onClick={() => onModuleChange('rh')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border ${
                activeModule === 'rh'
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold shadow-xs'
                  : 'border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Capital Humano & GPS</span>
            </button>
          </nav>
        </div>

        {/* Right Tools & User Session */}
        <div className="flex items-center gap-3">
          {/* Quick Action Button for CRM */}
          <button
            onClick={onOpenNewLead}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition active:scale-95"
          >
            <span className="text-sm font-black">+</span>
            <span>Nuevo Prospecto</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-slate-200 block max-w-[140px] truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium block">
                  {currentUser.branch}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141b2d] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {currentUser.roleLabel}
                  </span>
                </div>

                <div className="py-1 text-xs text-slate-300">
                  <div className="px-3 py-1.5 text-[11px] text-slate-400 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sucursal: {currentUser.branch}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar Navigation for Small/Medium Screens */}
      <div className="xl:hidden px-3 py-2 bg-[#101726] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => onModuleChange('mobile_app')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeModule === 'mobile_app' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          📱 App Móvil
        </button>
        <button
          onClick={() => onModuleChange('crm')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeModule === 'crm' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300'
          }`}
        >
          CRM Originación
        </button>
        <button
          onClick={() => onModuleChange('core_dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeModule === 'core_dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
          }`}
        >
          Buscador Core
        </button>
        <button
          onClick={() => onModuleChange('personas')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeModule === 'personas' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
          }`}
        >
          Personas
        </button>
        <button
          onClick={() => onModuleChange('distribuidores')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeModule === 'distribuidores' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
          }`}
        >
          Distribuidores
        </button>
        <button
          onClick={() => onModuleChange('rh')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeModule === 'rh' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300'
          }`}
        >
          RH & GPS
        </button>
      </div>
    </header>
  );
}
