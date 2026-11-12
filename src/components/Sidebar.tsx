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
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Sliders,
  ShoppingBag,
  Bell,
  HeartHandshake,
  Layers,
  Sparkles,
  ClipboardCheck,
  FileText,
  BarChart3,
  Receipt,
  ShieldAlert,
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
      label: 'Módulos Activos',
      items: [
        {
          id: 'core_dashboard',
          name: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'personas',
          name: 'Personas',
          icon: Users,
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element (Ballast Aesthetic con Difuminado Frosted Glass) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between bg-white/90 backdrop-blur-lg text-slate-700 border-r border-slate-200/80 transition-all duration-300 ease-in-out shrink-0 select-none shadow-[1px_0_3px_rgba(0,0,0,0.02)] ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand Header & Workspace Selector */}
        <div className="flex flex-col">
          {/* Logo brand */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <div
              onClick={() => onModuleChange('core_dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
              title="Ir a Buscador Core"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-black text-xs">
                LH
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 leading-none">
                  <span className="text-sm font-extrabold text-slate-900 tracking-tight">LanAhora</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">Fintech Core v1.16</span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-slate-100/70 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition"
              title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Navigation Groups con Filtro de Permisos por Rol y Módulo */}
          <div className="px-3 py-3 space-y-4 overflow-y-auto max-h-[calc(100vh-190px)] no-scrollbar">
            {navSections.map((section, idx) => {
              const isModulePermitted = (modId: ActiveAppModule) => {
                if (!currentUser) return true;
                if (currentUser.role === 'ADMINISTRADOR') return true;
                if (currentUser.allowedModules && currentUser.allowedModules.length > 0) {
                  return currentUser.allowedModules.includes(modId);
                }
                return true;
              };

              const visibleItems = section.items.filter((item) => isModulePermitted(item.id));
              if (visibleItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-0.5">
                  {!isCollapsed && (
                    <p className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {section.label}
                    </p>
                  )}

                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
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
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition group ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-xs font-bold'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition ${
                                isActive
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:text-slate-700'
                              }`}
                            />
                            {!isCollapsed && (
                              <span className="truncate">{item.name}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: User Profile Card (Dana Okafor Ballast Style) */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div
            className={`flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 ${
              isCollapsed ? 'flex-col gap-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.avatarInitials || 'LH'}
              </div>

              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {currentUser.branch || 'Matriz'} · {currentUser.roleLabel || 'Admin'}
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
