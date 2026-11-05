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
  Building,
  CreditCard,
} from 'lucide-react';

export type ActiveAppModule = 'crm' | 'core_dashboard' | 'personas' | 'distribuidores' | 'rh' | 'dispersion' | 'integraciones' | 'lanapp';

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
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1e40af] text-white shadow-md border-b border-blue-400/30">
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Brand Logo & System Name */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onModuleChange('core_dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Logo Badge in Sunny Yellow */}
            <div className="w-10 h-10 rounded-2xl bg-[#facc15] text-slate-950 font-black text-base flex items-center justify-center shadow-md shadow-black/10 group-hover:scale-105 transition">
              LH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white drop-shadow-xs">
                  LanAhora
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-yellow-200 border border-white/30">
                  SystemCore
                </span>
              </div>
              <p className="text-[11px] text-yellow-300 font-bold italic -mt-0.5">
                ¡En Ti confiamos!
              </p>
            </div>
          </div>

          {/* Unified Desktop Navigation Tabs (Inspirado en el menú del portal LanAhora) */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => onModuleChange('crm')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'crm'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CRM & Originación</span>
            </button>

            <button
              onClick={() => onModuleChange('core_dashboard')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'core_dashboard'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5" />
              <span>Buscador Core</span>
            </button>

            <button
              onClick={() => onModuleChange('personas')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'personas'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Personas</span>
            </button>

            <button
              onClick={() => onModuleChange('distribuidores')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'distribuidores'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Distribuidores (DV)</span>
            </button>

            <button
              onClick={() => onModuleChange('rh')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'rh'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Capital Humano & GPS</span>
            </button>

            <button
              onClick={() => onModuleChange('dispersion')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'dispersion'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Dispersión & Pagos</span>
            </button>

            <button
              onClick={() => onModuleChange('integraciones')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'integraciones'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Integraciones (ESB)</span>
            </button>

            <button
              onClick={() => onModuleChange('lanapp')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeModule === 'lanapp'
                  ? 'bg-[#facc15] text-slate-950 shadow-md font-black'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>LanApp (Vales)</span>
            </button>
          </nav>
        </div>

        {/* Right Tools & User Session */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewLead}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95"
          >
            <span className="text-sm leading-none">+</span>
            <span>Nuevo Prospecto</span>
          </button>

          <div className="h-6 w-px bg-white/30 mx-1 hidden sm:block" />

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition text-white"
            >
              <div className="w-7 h-7 rounded-full bg-[#facc15] text-slate-950 font-black text-xs flex items-center justify-center shadow">
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-white block max-w-[140px] truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-yellow-300 font-medium block">
                  {currentUser.branch}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 border border-blue-100 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {currentUser.roleLabel}
                  </span>
                </div>

                <div className="py-1 text-xs text-slate-600">
                  <div className="px-3 py-1.5 text-[11px] flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sucursal: {currentUser.branch}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-2 transition"
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

      {/* Sub-bar Navigation for Mobile Screens */}
      <div className="xl:hidden px-3 py-2 bg-[#1b43bc] border-t border-blue-400/20 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => onModuleChange('crm')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'crm' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          CRM Originación
        </button>
        <button
          onClick={() => onModuleChange('core_dashboard')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'core_dashboard' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          Buscador Core
        </button>
        <button
          onClick={() => onModuleChange('personas')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'personas' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          Personas
        </button>
        <button
          onClick={() => onModuleChange('distribuidores')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'distribuidores' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          Distribuidores
        </button>
        <button
          onClick={() => onModuleChange('rh')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'rh' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          RH & GPS
        </button>
        <button
          onClick={() => onModuleChange('dispersion')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'dispersion' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          Dispersión STP
        </button>
        <button
          onClick={() => onModuleChange('integraciones')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'integraciones' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          Integraciones ESB
        </button>
        <button
          onClick={() => onModuleChange('lanapp')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeModule === 'lanapp' ? 'bg-[#facc15] text-slate-950' : 'text-white/80'
          }`}
        >
          LanApp Vales
        </button>
      </div>
    </header>
  );
}
