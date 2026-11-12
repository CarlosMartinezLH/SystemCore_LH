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
  ShieldAlert,
  Bell,
  Calendar,
  Sparkles,
  FileText,
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

  const moduleMeta: Record<
    ActiveAppModule,
    { category: string; title: string; subtitle: string }
  > = {
    core_dashboard: {
      category: 'Operaciones & Cartera',
      title: 'Buscador Core & Monitor de Cartera',
      subtitle: 'Hoy en 3 plazas · 10 créditos activos · $124,500.00 MXN en colocación',
    },
    crm: {
      category: 'Operaciones & Cartera',
      title: 'CRM & Tubería de Originación',
      subtitle: 'Embudo de prospectos, cotizaciones y conversión de solicitudes de crédito',
    },
    mesa_credito: {
      category: 'Operaciones & Cartera',
      title: 'Mesa de Crédito & Dictaminación de Riesgo',
      subtitle: 'Evaluación de buró BC Score, validación dbo.CreditoGeneraCanje y aprobación de vales',
    },
    dispersion: {
      category: 'Operaciones & Cartera',
      title: 'Bancos, SPEI & Recepción Automática STP',
      subtitle: 'Monitoreo de transferencias SPEI entrantes, cascada a créditos y dispersión bancaria',
    },
    lanatienda: {
      category: 'Operaciones & Cartera',
      title: 'LanaTienda · Control de Pedidos',
      subtitle: 'Monitoreo de compras en línea, estatus logístico y factores de margen',
    },
    distribuidores: {
      category: 'Cobranza & Distribución',
      title: 'Padrón de Distribuidoras (DV)',
      subtitle: 'Líneas de crédito autorizadas, comisiones y saldos de colocación',
    },
    personas: {
      category: 'Padrón Central',
      title: 'Personas',
      subtitle: 'Padrón central de personas, expedientes, buró y estatus de pagarés',
    },
    gestoria: {
      category: 'Cobranza & Distribución',
      title: 'Gestoría & Notas de Cobranza Domiciliaria',
      subtitle: 'Asignación de cartera en mora, bitácora de gestores y seguimiento a promesas de pago',
    },
    reportes: {
      category: 'Reportes & Contabilidad',
      title: 'Reportes Ejecutivos & Colocación por Distribuidor',
      subtitle: 'Colocación quincenal por DV, vintage de morosidad, metas y exportación masiva',
    },
    contabilidad: {
      category: 'Reportes & Contabilidad',
      title: 'Contabilidad Core & Pólizas Automáticas',
      subtitle: 'Pólizas de ingresos, egresos y diario en línea, balanza de comprobación y conciliación',
    },
    pld: {
      category: 'Gobernanza & Cumplimiento',
      title: 'Buzón Confidencial PLD / FT & Fraude',
      subtitle: 'Reporte anónimo institucional de operaciones inusuales y cumplimiento normativo CNBV',
    },
    lanapp: {
      category: 'Red de Distribución',
      title: 'LanApp Móvil · Distribuidoras',
      subtitle: 'Simulador interactivo de emisión y canje de vales digitales en vivo',
    },
    asesores: {
      category: 'Red de Distribución',
      title: 'LH Asesores Móvil · Terminal de Campo',
      subtitle: 'Levantamiento de prospectos, biometría KYC y validación RENAPO en ruta',
    },
    reglas: {
      category: 'Gobernanza Financiera',
      title: 'Reglas del Negocio & Políticas Operativas',
      subtitle: 'Comisiones por corte, amortizaciones, seguros y motor dbo.CreditoGeneraCanje',
    },
    notificaciones: {
      category: 'Gobernanza Financiera',
      title: 'Centro de Alertas & Notificaciones Móviles',
      subtitle: 'Configuración de alertas de cobro de vales y recordatorios masivos para distribuidoras',
    },
    rh: {
      category: 'Administración Interna & RH',
      title: 'Capital Humano (Buk RH)',
      subtitle: 'Colaboradores, organigrama, checador GPS, vacaciones dignas, pre-nómina y evaluación OKR',
    },
    configuracion: {
      category: 'Administración Interna & RH',
      title: 'Configuración & Sucursales',
      subtitle: 'Administración de sucursales, usuarios institucionales, roles y asignaciones',
    },
    integraciones: {
      category: 'Gobernanza Financiera',
      title: 'Integraciones Core',
      subtitle: 'Servicios de conexión',
    },
  };

  const currentMeta = moduleMeta[activeModule] || {
    category: 'SystemCore',
    title: 'LanAhora Core',
    subtitle: 'Gestión Financiera Institucional',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
      {/* Left: Mobile Toggle & Page Title (Ballast Style) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight truncate leading-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: User Profile Avatar Pill */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser.avatarInitials || 'LH'}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
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
