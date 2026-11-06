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
          badge: 'Live',
          badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
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
          badge: 'SPEI',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
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
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between bg-slate-950 text-white border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo Brand Header */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80">
            <div
              onClick={() => onModuleChange('core_dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Gold LanAhora Logo Badge */}
              <div className="w-10 h-10 rounded-2xl bg-[#facc15] text-slate-950 font-black text-base flex items-center justify-center shadow-lg shadow-amber-400/20 group-hover:scale-105 transition shrink-0">
                LH
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-white truncate">
                      LanAhora
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 border border-blue-500/30">
                      Core
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 font-medium italic -mt-0.5 truncate">
                    ¡En Ti confiamos!
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
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
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)]">
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
                            ? 'bg-blue-600 text-white shadow-md font-bold'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
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
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}
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
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div
            className={`flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 ${
              isCollapsed ? 'flex-col gap-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#facc15] text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {currentUser.avatarInitials || 'LH'}
              </div>

              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white leading-tight truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <Building className="w-2.5 h-2.5 text-blue-400 inline shrink-0" />
                    {currentUser.branch || 'Matriz'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 p-1.5 rounded-lg transition"
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
