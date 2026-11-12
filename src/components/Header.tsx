'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserSession } from '@/types/auth';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  ClipboardCheck,
  Briefcase,
  Receipt,
  BarChart3,
  Filter,
  ShoppingBag,
  ShieldAlert,
  Smartphone,
  Sliders,
  Bell,
  Building,
  Layers,
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
  description?: string;
}

const PRIMARY_MODULES: NavModuleItem[] = [
  { id: 'core_dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'personas', name: 'Personas', icon: Users },
  { id: 'distribuidores', name: 'Distribuidoras', icon: UserCheck },
  { id: 'mesa_credito', name: 'Mesa Crédito', icon: ClipboardCheck },
  { id: 'dispersion', name: 'Bancos & SPEI', icon: CreditCard },
  { id: 'gestoria', name: 'Gestoría', icon: Briefcase },
  { id: 'contabilidad', name: 'Contabilidad', icon: Receipt },
  { id: 'reportes', name: 'Reportes', icon: BarChart3 },
];

const SECONDARY_MODULES: NavModuleItem[] = [
  { id: 'crm', name: 'CRM Originación', icon: Filter, description: 'Prospectos, cotizaciones y conversión' },
  { id: 'lanatienda', name: 'LanaTienda', icon: ShoppingBag, description: 'Pedidos y comercio electrónico' },
  { id: 'pld', name: 'Buzón PLD', icon: ShieldAlert, description: 'Prevención de lavado y cumplimiento' },
  { id: 'lanapp', name: 'LanApp Móvil', icon: Smartphone, description: 'Simulador de vales digitales' },
  { id: 'asesores', name: 'LH Asesores', icon: Briefcase, description: 'Terminal de campo y KYC' },
  { id: 'reglas', name: 'Reglas de Negocio', icon: Sliders, description: 'Políticas y motor CreditoGeneraCanje' },
  { id: 'notificaciones', name: 'Notificaciones', icon: Bell, description: 'Alertas móviles y recordatorios' },
  { id: 'rh', name: 'Capital Humano (Buk)', icon: Users, description: 'Colaboradores, organigrama y nómina' },
  { id: 'configuracion', name: 'Configuración', icon: Building, description: 'Sucursales, usuarios y roles' },
  { id: 'integraciones', name: 'Integraciones', icon: Layers, description: 'Servicios Core y conexiones' },
];

export default function Header({
  currentUser,
  activeModule,
  onModuleChange,
  onLogout,
  onToggleMobile,
}: HeaderProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeSecondary = SECONDARY_MODULES.find((m) => m.id === activeModule);

  const handleSelectModule = (mod: ActiveAppModule) => {
    onModuleChange(mod);
    setMoreDropdownOpen(false);
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
          <div className="h-5 w-px bg-slate-200 hidden xl:block" />
        </div>

        {/* Center: Main Horizontal Menu (Top Navigation Bar) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {PRIMARY_MODULES.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectModule(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 font-semibold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}

          {/* Dropdown "Más Módulos" */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              type="button"
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`px-2.5 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 font-semibold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                activeSecondary
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{activeSecondary ? activeSecondary.name : 'Más'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Módulos Adicionales
                </div>
                <div className="space-y-0.5 max-h-[70vh] overflow-y-auto">
                  {SECONDARY_MODULES.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectModule(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight truncate">{item.name}</p>
                          {item.description && (
                            <p className={`text-[10px] leading-tight truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (When on small screens) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-3 animate-in fade-in">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Módulos Principales
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRIMARY_MODULES.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left cursor-pointer ${
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

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Más Módulos
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {SECONDARY_MODULES.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left cursor-pointer ${
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
        </div>
      )}
    </header>
  );
}
