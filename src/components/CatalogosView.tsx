'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';
import { CoordinadorCore } from '@/types/core';
import { INITIAL_COORDINADORES } from '@/lib/data/coreData';
import {
  INITIAL_CATALOGO_USUARIOS,
  CatalogoUsuario,
  INITIAL_CATALOGO_SUCURSALES,
  CatalogoSucursalItem,
} from '@/lib/data/catalogosData';
import {
  Users,
  Building2,
  UserCheck,
  Search,
  Plus,
  Edit2,
  Mail,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Check,
  X,
  Layers,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

export type CatalogoTab = 'sucursales' | 'usuarios' | 'coordinadores';

// 3 Catálogos principales solicitados: Sucursales, Usuarios y Coordinadores
export const CATALOGOS_TABS: { id: CatalogoTab; label: string; icon: any }[] = [
  { id: 'sucursales', label: 'Sucursales', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'coordinadores', label: 'Coordinadores', icon: UserCheck },
];

interface CatalogosViewProps {
  currentUser: UserSession;
  initialTab?: CatalogoTab;
  onNavigateToDistribuidores?: () => void;
}

export default function CatalogosView({
  currentUser,
  initialTab = 'sucursales',
  onNavigateToDistribuidores,
}: CatalogosViewProps) {
  const { distribuidores } = useCoreSync();
  const [activeTab, setActiveTab] = useState<CatalogoTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // State: Sucursales
  const [sucursales, setSucursales] = useState<CatalogoSucursalItem[]>(INITIAL_CATALOGO_SUCURSALES);
  const [sucursalSearch, setSucursalSearch] = useState('');

  // State: Usuarios
  const [usuarios, setUsuarios] = useState<CatalogoUsuario[]>(INITIAL_CATALOGO_USUARIOS);
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [usuarioPerfilFilter, setUsuarioPerfilFilter] = useState('ALL');
  const [usuarioSucursalFilter, setUsuarioSucursalFilter] = useState('ALL');
  const [showRawPasswords, setShowRawPasswords] = useState(false);
  const [selectedUsuarioForEdit, setSelectedUsuarioForEdit] = useState<CatalogoUsuario | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // State: Coordinadores
  const [coordinadores, setCoordinadores] = useState<CoordinadorCore[]>(INITIAL_COORDINADORES);
  const [coordSearch, setCoordSearch] = useState('');

  // General Filtered Usuarios (Tab 5)
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      if (usuarioPerfilFilter !== 'ALL' && u.perfilUsuarioId !== usuarioPerfilFilter) return false;
      if (usuarioSucursalFilter !== 'ALL' && u.sucursalId !== usuarioSucursalFilter) return false;
      if (!usuarioSearch.trim()) return true;
      const q = usuarioSearch.toLowerCase().trim();
      return (
        u.usuario.toLowerCase().includes(q) ||
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.telefonoMovil.includes(q) ||
        u.perfilUsuarioId.toLowerCase().includes(q) ||
        u.sucursalId.toLowerCase().includes(q) ||
        String(u.usuarioId).includes(q)
      );
    });
  }, [usuarios, usuarioSearch, usuarioPerfilFilter, usuarioSucursalFilter]);

  // Toggle Bloqueo de Usuario
  const handleToggleBloqueoUsuario = (usuarioId: number) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.usuarioId === usuarioId) {
          const next = !u.bloqueado;
          showToast(
            `Usuario "${u.usuario}" (${u.nombre}) ${next ? 'BLOQUEADO' : 'HABILITADO'}.`,
            next ? 'error' : 'success'
          );
          return { ...u, bloqueado: next };
        }
        return u;
      })
    );
  };

  // Toggle Todos los Coordinadores
  const handleToggleTodosCoordinadores = (usuarioId: number) => {
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.usuarioId === usuarioId) {
          return { ...u, todosLosCoordinadores: !u.todosLosCoordinadores };
        }
        return u;
      })
    );
  };

  // Enviar Correo de Activación / Reseteo
  const handleSendEmailAcceso = (u: CatalogoUsuario) => {
    showToast(`✓ Correo de acceso enviado exitosamente a ${u.correo}`);
  };

  // Exportar Usuarios a Excel
  const handleExportUsuariosExcel = () => {
    const data = filteredUsuarios.map((u) => ({
      Usuario_ID: u.usuarioId,
      Perfil: u.perfilUsuarioId,
      Usuario: u.usuario,
      Nombre: u.nombre,
      Correo: u.correo,
      Telefono: u.telefonoMovil,
      Bloqueado: u.bloqueado ? 'SI' : 'NO',
      Todos_Los_Coordinadores: u.todosLosCoordinadores ? 'SI' : 'NO',
      Sucursal: u.sucursalId,
      Usuario_Odco: u.usuarioIdOdco || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, `catalogo_usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Catálogo de Usuarios exportado exitosamente.');
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-3 sm:p-5 lg:p-6 space-y-4">
      {/* =========================================================================
          1. HEADER PRINCIPAL Y NAVEGACIÓN DE CATÁLOGOS (IDÉNTICO AL RESTO DEL CORE)
         ========================================================================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Sistema Core • Catálogos
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-500">
                Sucursal: {currentUser?.branch || 'Todas'}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              Administración de Catálogos
            </h1>
          </div>
        </div>

        {/* Tab Switcher Segmented Control (Diseño institucional idéntico a CoordinadoresView, ConfiguracionView, etc.) */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1 text-xs select-none shrink-0 overflow-x-auto">
          {CATALOGOS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count =
              tab.id === 'sucursales'
                ? sucursales.length
                : tab.id === 'usuarios'
                ? usuarios.length
                : coordinadores.length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={tab.label}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? tab.id === 'sucursales'
                        ? 'text-blue-600'
                        : tab.id === 'usuarios'
                        ? 'text-indigo-600'
                        : 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? tab.id === 'sucursales'
                        ? 'bg-blue-50 text-blue-700'
                        : tab.id === 'usuarios'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. CONTENIDO DINÁMICO POR PESTAÑA
         ========================================================================= */}

      {/* -----------------------------------------------------------------------
          TAB 5: USUARIOS (REPLICA EXACTA DE LA IMAGEN 2)
         ----------------------------------------------------------------------- */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Barra de Filtros y Acciones */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Introduzca el texto a buscar (usuario, nombre, correo, teléfono)..."
                value={usuarioSearch}
                onChange={(e) => setUsuarioSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {usuarioSearch && (
                <button
                  onClick={() => setUsuarioSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
              <select
                value={usuarioPerfilFilter}
                onChange={(e) => setUsuarioPerfilFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs"
              >
                <option value="ALL">Todos los Perfiles</option>
                <option value="Admin">Admin</option>
                <option value="Analista">Analista</option>
                <option value="ASESOR DE CREDITO">ASESOR DE CREDITO</option>
                <option value="Gerente de Sucursal">Gerente de Sucursal</option>
                <option value="Gerente de zona">Gerente de zona</option>
                <option value="Ejecutiva de Canjes">Ejecutiva de Canjes</option>
              </select>

              <select
                value={usuarioSucursalFilter}
                onChange={(e) => setUsuarioSucursalFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs"
              >
                <option value="ALL">Todas las Sucursales</option>
                <option value="SALTILLO">SALTILLO</option>
                <option value="DURANGO">DURANGO</option>
                <option value="GOMEZ PALACIO">GOMEZ PALACIO</option>
                <option value="MATRIZ">MATRIZ</option>
              </select>

              <button
                type="button"
                onClick={handleExportUsuariosExcel}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                title="Exportar a Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exportar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewUserModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>
            </div>
          </div>

          {/* TABLA PRINCIPAL DE USUARIOS (COLUMNAS IDÉNTICAS A IMAGEN 2) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3 py-3 text-center w-28">Acciones</th>
                    <th className="px-3 py-3 w-20 text-center">Usuario ID</th>
                    <th className="px-3 py-3">Perfil Usuario ID</th>
                    <th className="px-3 py-3">Usuario</th>
                    <th className="px-3 py-3">Nombre</th>
                    <th className="px-3 py-3">Correo</th>
                    <th className="px-3 py-3">Contraseña RAW</th>
                    <th className="px-3 py-3">Teléfono Móvil</th>
                    <th className="px-3 py-3 text-center w-20">Bloqueado</th>
                    <th className="px-3 py-3 text-center w-28">Todos Coord.</th>
                    <th className="px-3 py-3">Sucursal ID</th>
                    <th className="px-3 py-3">Usuario ID Odco</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredUsuarios.map((u) => (
                    <tr
                      key={u.usuarioId}
                      className={`hover:bg-blue-50/40 transition ${
                        u.bloqueado ? 'bg-rose-50/30 text-slate-400' : ''
                      }`}
                    >
                      {/* Acciones: Editar, Enviar Correo, Habilita */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setSelectedUsuarioForEdit(u)}
                            className="text-blue-600 hover:underline font-bold"
                            title="Editar usuario"
                          >
                            Editar
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleSendEmailAcceso(u)}
                            className="text-emerald-700 hover:underline font-bold"
                            title="Enviar correo con accesos"
                          >
                            Enviar Correo
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleToggleBloqueoUsuario(u.usuarioId)}
                            className={`font-bold hover:underline ${
                              u.bloqueado ? 'text-amber-600' : 'text-slate-500'
                            }`}
                            title={u.bloqueado ? 'Habilitar usuario' : 'Bloquear usuario'}
                          >
                            {u.bloqueado ? 'Habilita' : 'Bloquea'}
                          </button>
                        </div>
                      </td>

                      {/* Usuario ID */}
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-900">
                        {u.usuarioId}
                      </td>

                      {/* Perfil Usuario ID */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {u.perfilUsuarioId}
                        </span>
                      </td>

                      {/* Usuario (Login) */}
                      <td className="px-3 py-2.5 font-bold text-slate-900 font-mono">
                        {u.usuario}
                      </td>

                      {/* Nombre Completo */}
                      <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                        {u.nombre}
                      </td>

                      {/* Correo Electrónico */}
                      <td className="px-3 py-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {u.correo}
                      </td>

                      {/* Contraseña RAW */}
                      <td className="px-3 py-2.5 font-mono text-slate-400 text-center">
                        ••••••••
                      </td>

                      {/* Teléfono Móvil */}
                      <td className="px-3 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                        {u.telefonoMovil || '-'}
                      </td>

                      {/* Bloqueado (Checkbox) */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={u.bloqueado}
                          onChange={() => handleToggleBloqueoUsuario(u.usuarioId)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>

                      {/* Todos Los Coordinadores (Checkbox) */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={u.todosLosCoordinadores}
                          onChange={() => handleToggleTodosCoordinadores(u.usuarioId)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Sucursal ID */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {u.sucursalId ? (
                          <span className="font-bold text-slate-800">{u.sucursalId}</span>
                        ) : (
                          <span className="text-slate-400 italic">Global</span>
                        )}
                      </td>

                      {/* Usuario ID Odco */}
                      <td className="px-3 py-2.5 font-mono text-slate-500 text-[11px]">
                        {u.usuarioIdOdco || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación estilo sistema anterior */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div>
                <span>Página 1 de 1 ({filteredUsuarios.length} elementos)</span>
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <button
                  type="button"
                  disabled
                  className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]"
                >
                  &lt; Anterior
                </button>
                <span className="px-2 py-1 bg-blue-600 text-white rounded font-bold text-[11px]">
                  1
                </span>
                <button
                  type="button"
                  disabled
                  className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[11px]"
                >
                  Siguiente &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 1: COORDINADORES
         ----------------------------------------------------------------------- */}
      {activeTab === 'coordinadores' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar coordinador por clave, nombre o sucursal..."
                value={coordSearch}
                onChange={(e) => setCoordSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <span className="font-bold text-slate-700">{coordinadores.length} Coordinadores Registrados</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="px-3 py-3">Clave</th>
                  <th className="px-3 py-3">Nombre</th>
                  <th className="px-3 py-3">Sucursal</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Teléfono</th>
                  <th className="px-3 py-3">DVs Asignadas</th>
                  <th className="px-3 py-3">Cartera Activa</th>
                  <th className="px-3 py-3 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coordinadores
                  .filter((c) => !coordSearch || c.nombre.toLowerCase().includes(coordSearch.toLowerCase()))
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-700">{c.id}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{c.nombre}</td>
                      <td className="px-3 py-2.5">{c.sucursal}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-600">{c.tipoCoordinador || 'NORMAL'}</td>
                      <td className="px-3 py-2.5 font-mono">{c.telefono}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">{c.totalDistribuidores || 0}</td>
                      <td className="px-3 py-2.5 font-bold text-emerald-700">{formatMoney(c.carteraActiva || 0)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB: SUCURSALES
         ----------------------------------------------------------------------- */}
      {activeTab === 'sucursales' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Catálogo Oficial de Sucursales LanAhora</h3>
            <span className="font-bold text-blue-700">{sucursales.length} Sucursales Activas</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="px-3 py-3">Clave</th>
                  <th className="px-3 py-3">Nombre Sucursal</th>
                  <th className="px-3 py-3">Ciudad / Estado</th>
                  <th className="px-3 py-3">Dirección</th>
                  <th className="px-3 py-3">Teléfono</th>
                  <th className="px-3 py-3 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sucursales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-mono font-bold text-blue-700">{s.id}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{s.name}</td>
                    <td className="px-3 py-2.5">{s.city}, {s.state}</td>
                    <td className="px-3 py-2.5 text-slate-500">{s.address}</td>
                    <td className="px-3 py-2.5 font-mono">{s.phone}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NUEVO / EDITAR USUARIO (Tab 5)
         ========================================================================= */}
      {(isNewUserModalOpen || selectedUsuarioForEdit) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedUsuarioForEdit ? `Editar Usuario: ${selectedUsuarioForEdit.usuario}` : 'Nuevo Usuario del Sistema'}
              </h3>
              <button
                onClick={() => {
                  setIsNewUserModalOpen(false);
                  setSelectedUsuarioForEdit(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(
                  selectedUsuarioForEdit
                    ? 'Usuario actualizado correctamente.'
                    : 'Usuario registrado exitosamente en el Core.'
                );
                setIsNewUserModalOpen(false);
                setSelectedUsuarioForEdit(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de Usuario (Login)</label>
                  <input
                    type="text"
                    required
                    defaultValue={selectedUsuarioForEdit?.usuario || ''}
                    placeholder="ej. agarcia"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Perfil / Rol</label>
                  <select
                    defaultValue={selectedUsuarioForEdit?.perfilUsuarioId || 'ASESOR DE CREDITO'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Analista">Analista</option>
                    <option value="ASESOR DE CREDITO">ASESOR DE CREDITO</option>
                    <option value="Gerente de Sucursal">Gerente de Sucursal</option>
                    <option value="Gerente de zona">Gerente de zona</option>
                    <option value="Ejecutiva de Canjes">Ejecutiva de Canjes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  defaultValue={selectedUsuarioForEdit?.nombre || ''}
                  placeholder="ej. Adrian Garcia Lopez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Institucional</label>
                  <input
                    type="email"
                    required
                    defaultValue={selectedUsuarioForEdit?.correo || ''}
                    placeholder="usuario@lanahora.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    defaultValue={selectedUsuarioForEdit?.telefonoMovil || ''}
                    placeholder="8441234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sucursal Asignada</label>
                  <select
                    defaultValue={selectedUsuarioForEdit?.sucursalId || 'SALTILLO'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="SALTILLO">SALTILLO</option>
                    <option value="DURANGO">DURANGO</option>
                    <option value="GOMEZ PALACIO">GOMEZ PALACIO</option>
                    <option value="MONTERREY">MONTERREY</option>
                    <option value="MATRIZ">MATRIZ (GLOBAL)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Usuario ID Odco</label>
                  <input
                    type="text"
                    defaultValue={selectedUsuarioForEdit?.usuarioIdOdco || ''}
                    placeholder="OD-XX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <span className="font-bold text-slate-700">Acceso a Todos los Coordinadores</span>
                <input
                  type="checkbox"
                  defaultChecked={selectedUsuarioForEdit?.todosLosCoordinadores ?? true}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewUserModalOpen(false);
                    setSelectedUsuarioForEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-100" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
