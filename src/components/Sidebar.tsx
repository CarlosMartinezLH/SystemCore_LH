'use client';

import React from 'react';
import { ActiveAppModule } from './Header';
import { UserSession } from '@/types/auth';
import {
  LayoutDashboard,
  Filter,
  CreditCard,
  Users,
  Briefcase,
  UserCheck,
  Server,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  ShoppingBag,
} from 'lucide-react';

interface SidebarProps {
  activeModule: ActiveAppModule;
  onModuleChange: (mod: ActiveAppModule) => void;
  currentUser: UserSession;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveAppModule;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  hasPulse?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export default function Sidebar({
  activeModule,
  onModuleChange,
  currentUser,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navSections: NavSection[] = [
    {
      label: 'Operaciones & Vales',
      items: [
        {
          id: 'core_dashboard',
          name: 'Buscador & Cartera',
          icon: LayoutDashboard,
        },
        {
          id: 'crm',
          name: 'CRM Originación',
          icon: Filter,
        },
        {
          id: 'dispersion',
          name: 'Dispersión STP',
          icon: CreditCard,
        },
        {
          id: 'lanatienda',
          name: 'LanaTienda (E-Com)',
          icon: ShoppingBag,
          badge: '16 Qnas',
          badgeColor: 'bg-amber-400 text-slate-950 font-black',
        },
      ],
    },
    {
      label: 'Directorio & Gestión',
      items: [
        {
          id: 'personas',
          name: 'Personas & KYC',
          icon: Users,
        },
        {
          id: 'distribuidores',
          name: 'Distribuidores (DV)',
          icon: Briefcase,
        },
        {
          id: 'rh',
          name: 'Capital Humano & GPS',
          icon: UserCheck,
        },
      ],
    },
    /*
    {
      label: 'Infraestructura',
      items: [
        {
          id: 'integraciones',
          name: 'Nubarium & STP ESB',
          icon: Server,
          hasPulse: true,
        },
      ],
    },
    */
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between bg-white text-slate-800 border-r border-slate-200 transition-all duration-300 ease-in-out shrink-0 select-none shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo Brand Header */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100">
            <div
              onClick={() => onModuleChange('core_dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            >
              {isCollapsed ? (
                <img
                  src="/lanahora-icon.png"
                  alt="LanAhora"
                  className="w-10 h-10 object-contain group-hover:scale-105 transition shrink-0"
                />
              ) : (
                <div className="flex items-center min-w-0">
                  <img
                    src="/lanahora-logo.png"
                    alt="LanAhora"
                    className="h-9 w-auto max-w-[170px] object-contain group-hover:scale-105 transition shrink-0"
                  />
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition"
              title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="px-3 py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-165px)]">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {section.label}
                  </p>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onModuleChange(item.id);
                          onCloseMobile();
                        }}
                        title={isCollapsed ? item.name : undefined}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          {!isCollapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : item.badgeColor
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.hasPulse && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80">
          <div
            className={`flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs ${
              isCollapsed ? 'flex-col gap-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#facc15] text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {currentUser.avatarInitials || 'LH'}
              </div>

              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 font-medium">
                    <Building className="w-2.5 h-2.5 text-blue-600 inline shrink-0" />
                    {currentUser.branch || 'Matriz'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
