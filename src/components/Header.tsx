'use client';

import React, { useState } from 'react';
import { UserSession } from '@/types/auth';
import {
  Search,
  Plus,
  Building,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
  Bell,
} from 'lucide-react';

export type ActiveAppModule =
  | 'crm'
  | 'core_dashboard'
  | 'personas'
  | 'distribuidores'
  | 'rh'
  | 'dispersion'
  | 'integraciones'
  | 'configuracion'
  | 'lanatienda';

interface HeaderProps {
  currentUser: UserSession;
  activeModule: ActiveAppModule;
  onModuleChange: (mod: ActiveAppModule) => void;
  onLogout: () => void;
  onOpenNewLead?: () => void;
  onToggleMobile?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export default function Header({
  currentUser,
  activeModule,
  onModuleChange,
  onLogout,
  onOpenNewLead,
  onToggleMobile,
  searchQuery = '',
  onSearchChange,
}: HeaderProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const moduleMeta: Record<ActiveAppModule, { title: string; subtitle: string }> = {
    core_dashboard: {
      title: 'Buscador Core & Cartera',
      subtitle: 'Consulta de créditos, vales y balance de colocación en vivo',
    },
    crm: {
      title: 'CRM & Originación',
      subtitle: 'Embudo de prospectos, cotizaciones y conversión de solicitudes',
    },
    dispersion: {
      title: 'Dispersión & Pagos STP (SPEI)',
      subtitle: 'Monitoreo de transferencias SPEI en tiempo real y conciliación',
    },
    personas: {
      title: 'Directorio de Personas & Clientes',
      subtitle: 'Expedientes integrales, validación RENAPO en vivo y SAT 69-B',
    },
    distribuidores: {
      title: 'Distribuidores de Vales (DV)',
      subtitle: 'Líneas de crédito autorizadas, comisiones y saldos de colocación',
    },
    rh: {
      title: 'Capital Humano & Monitoreo GPS',
      subtitle: 'Asesores de campo, geolocalización de rutas y sucursales',
    },
    integraciones: {
      title: 'Integraciones ESB & Servicios Core',
      subtitle: 'Monitoreo de APIs: Nubarium Biometrics, SAT, RENAPO y STP SPEI',
    },
    configuracion: {
      title: 'Configuración del Sistema Core',
      subtitle: 'Administración de sucursales, usuarios institucionales, roles y asignaciones',
    },
    lanatienda: {
      title: 'LanaTienda · Control de Pedidos',
      subtitle: 'Monitoreo de compras en línea, estatus logístico y validación de entregas',
    },
  };

  const currentMeta = moduleMeta[activeModule] || {
    title: 'SystemCore LanAhora',
    subtitle: 'Gestión Financiera Institucional',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3 flex items-center justify-between gap-4 shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight truncate">
            {currentMeta.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Omnibar Search, Live Status, Quick Action & User Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Omnibar Search */}
        <div className="relative hidden md:block w-52 lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Buscar vale, crédito, folio o CURP..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Quick Action Button (Only visible within CRM module) */}
        {activeModule === 'crm' && onOpenNewLead && (
          <button
            onClick={onOpenNewLead}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Prospecto</span>
          </button>
        )}

        {/* User Profile Badge & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition text-slate-800"
          >
            <div className="w-7 h-7 rounded-lg bg-[#facc15] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              {currentUser.avatarInitials || 'LH'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block max-w-[120px] truncate leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block">
                {currentUser.branch || 'Matriz'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.roleLabel || 'Administrador'}
                </span>
              </div>

              <div className="py-1 text-xs text-slate-600">
                <div className="px-3 py-1.5 text-[11px] flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sucursal: {currentUser.branch || 'Matriz'}</span>
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
    </header>
  );
}
