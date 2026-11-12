'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserSession } from '@/types/auth';
import {
  LayoutDashboard,
  Users,
  Building,
  ChevronDown,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export type ActiveAppModule =
  | 'crm'
  | 'core_dashboard'
  | 'mesa_credito'
  | 'personas'
  | 'distribuidores'
  | 'gestoria'
  | 'reportes'
  | 'contabilidad'
  | 'pld'
  | 'rh'
  | 'dispersion'
  | 'integraciones'
  | 'configuracion'
  | 'lanatienda'
  | 'notificaciones'
  | 'lanapp'
  | 'asesores'
  | 'reglas';

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

interface NavModuleItem {
  id: ActiveAppModule;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Menú principal simplificado: de momento solo Dashboard y Personas
const PRIMARY_MODULES: NavModuleItem[] = [
  { id: 'core_dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'personas', name: 'Personas', icon: Users },
];

export default function Header({
  currentUser,
  activeModule,
  onModuleChange,
  onLogout,
  onToggleMobile,
}: HeaderProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectModule = (mod: ActiveAppModule) => {
    onModuleChange(mod);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs select-none transition-all">
      <div className="w-full px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between gap-2 lg:gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => handleSelectModule('core_dashboard')}
            className="flex items-center cursor-pointer transition hover:opacity-90"
            title="Ir a Dashboard Principal"
          >
            <img
              src="/lanahora-logo.png"
              alt="LanAhora Core"
              className="h-7 max-h-7 object-contain"
            />
          </div>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
        </div>

        {/* Center: Main Horizontal Menu (Únicamente Dashboard y Personas) */}
        <nav className="flex items-center gap-1.5 py-0.5">
          {PRIMARY_MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectModule(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 font-bold transition active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: User Profile & Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User Profile Avatar Pill */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {currentUser.avatarInitials || 'LH'}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">
                  {currentUser.role.toLowerCase()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {currentUser.roleLabel || 'Administrador'}
                  </span>
                </div>

                <div className="py-1 text-xs text-slate-600">
                  <div className="px-3 py-1.5 text-[11px] flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">Sucursal: {currentUser.branch || 'Matriz'}</span>
                  </div>
                  <div className="px-3 py-1.5 text-[11px] flex items-center gap-2 text-emerald-700 bg-emerald-50/60 mx-1.5 rounded-lg border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">
                      {currentUser.mfaMethod === 'WEBAUTHN_PASSKEY'
                        ? '2FA: Windows Hello'
                        : '2FA: Google Authenticator'}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (onToggleMobile) onToggleMobile();
            }}
            className="sm:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Solo Dashboard y Personas) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-2 animate-in fade-in">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos Activos
          </p>
          <div className="flex flex-col gap-1.5">
            {PRIMARY_MODULES.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectModule(item.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
