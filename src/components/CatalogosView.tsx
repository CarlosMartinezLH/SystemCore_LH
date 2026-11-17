'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  CoordinadorCore,
  AccesoCoordinador,
  FuncionUsuario,
} from '@/types/core';
import {
  INITIAL_COORDINADORES,
  INITIAL_ACCESOS_COORDINADOR,
  INITIAL_FUNCIONES_USUARIO,
  CAT_FUNCIONES_DISPONIBLES,
} from '@/lib/data/coreData';
import {
  INITIAL_CATALOGO_USUARIOS,
  CatalogoUsuario,
  INITIAL_TIPOS_DOCUMENTO,
  TipoDocumento,
  INITIAL_CONDICIONES_PRODUCTO,
  CondicionProducto,
  INITIAL_CUENTAS_BANCARIAS,
  CuentaBancaria,
  INITIAL_POLITICAS_EDAD,
  PoliticaEdad,
  INITIAL_NIVELES_DISTRIBUIDOR,
  NivelDistribuidor,
  INITIAL_RELACION_CORTES,
  RelacionCorte,
  INITIAL_COMISIONES,
  ComisionEsquema,
  INITIAL_GESTORES,
  GestorCobranza,
  INITIAL_ACCESOS_COORD_SUCURSAL,
  AccesoCoordinadorSucursal,
  INITIAL_PERMISOS_MODULO_PERFIL,
  PermisoModuloPerfil,
  INITIAL_CATALOGO_SUCURSALES,
  CatalogoSucursalItem,
} from '@/lib/data/catalogosData';
import {
  Users,
  Building2,
  FileText,
  CreditCard,
  Calendar,
  Award,
  Clock,
  Percent,
  UserCheck,
  ShieldCheck,
  KeyRound,
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
  ChevronRight,
  Eye,
  EyeOff,
  Link2,
  ShieldAlert,
  SlidersHorizontal,
  ChevronLeft,
  ArrowUpDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMoney } from '@/lib/utils/formatters';

export type CatalogoTab =
  | 'coordinadores'
  | 'accesos_coordinador'
  | 'funciones_usuario'
  | 'sucursales'
  | 'usuarios'
  | 'tipos_documento'
  | 'condiciones_producto'
  | 'cuentas_bancarias'
  | 'politicas_edad'
  | 'niveles_distribuidor'
  | 'relacion_cortes'
  | 'comisiones'
  | 'gestores'
  | 'accesos_coordinadores_sucursal'
  | 'permiso_modulo_perfil';

interface CatalogosViewProps {
  currentUser: UserSession;
  initialTab?: CatalogoTab;
  onNavigateToDistribuidores?: () => void;
}

// 15 Pestañas oficiales en el orden exacto del sistema legado (Imagen 2)
export const CATALOGOS_TABS: { id: CatalogoTab; label: string; icon: any }[] = [
  { id: 'coordinadores', label: 'Coordinadores', icon: UserCheck },
  { id: 'accesos_coordinador', label: 'Accesos x Coordinador', icon: Link2 },
  { id: 'funciones_usuario', label: 'Funciones x Usuario', icon: ShieldCheck },
  { id: 'sucursales', label: 'Sucursales', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'tipos_documento', label: 'Tipos Documento', icon: FileText },
  { id: 'condiciones_producto', label: 'Condiciones de producto', icon: CreditCard },
  { id: 'cuentas_bancarias', label: 'Cuentas Bancarias', icon: Building2 },
  { id: 'politicas_edad', label: 'Políticas Edad', icon: Calendar },
  { id: 'niveles_distribuidor', label: 'Niveles Distribuidor', icon: Award },
  { id: 'relacion_cortes', label: 'Relación Cortes Tabla Días', icon: Clock },
  { id: 'comisiones', label: 'Comisiones', icon: Percent },
  { id: 'gestores', label: 'Gestores', icon: UserCheck },
  { id: 'accesos_coordinadores_sucursal', label: 'Accesos Coordinadores Sucursal', icon: Layers },
  { id: 'permiso_modulo_perfil', label: 'Permiso módulo x Perfil', icon: KeyRound },
];

export default function CatalogosView({
  currentUser,
  initialTab = 'usuarios',
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

  // State: Tab 1 (Coordinadores)
  const [coordinadores, setCoordinadores] = useState<CoordinadorCore[]>(INITIAL_COORDINADORES);
  const [coordSearch, setCoordSearch] = useState('');
  const [coordSucursalFilter, setCoordSucursalFilter] = useState('ALL');

  // State: Tab 2 (Accesos x Coordinador)
  const [accesos, setAccesos] = useState<AccesoCoordinador[]>(INITIAL_ACCESOS_COORDINADOR);
  const [accesoSearch, setAccesoSearch] = useState('');

  // State: Tab 3 (Funciones x Usuario)
  const [funciones, setFunciones] = useState<FuncionUsuario[]>(INITIAL_FUNCIONES_USUARIO);
  const [funcionSearch, setFuncionSearch] = useState('');
  const [funcionUserFilter, setFuncionUserFilter] = useState('ALL');

  // State: Tab 4 (Sucursales)
  const [sucursales, setSucursales] = useState<CatalogoSucursalItem[]>(INITIAL_CATALOGO_SUCURSALES);
  const [sucursalSearch, setSucursalSearch] = useState('');

  // State: Tab 5 (Usuarios - Exacto Imagen 2)
  const [usuarios, setUsuarios] = useState<CatalogoUsuario[]>(INITIAL_CATALOGO_USUARIOS);
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [usuarioPerfilFilter, setUsuarioPerfilFilter] = useState('ALL');
  const [usuarioSucursalFilter, setUsuarioSucursalFilter] = useState('ALL');
  const [showRawPasswords, setShowRawPasswords] = useState(false);
  const [selectedUsuarioForEdit, setSelectedUsuarioForEdit] = useState<CatalogoUsuario | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // State: Tab 6 a 15
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>(INITIAL_TIPOS_DOCUMENTO);
  const [condiciones, setCondiciones] = useState<CondicionProducto[]>(INITIAL_CONDICIONES_PRODUCTO);
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>(INITIAL_CUENTAS_BANCARIAS);
  const [politicasEdad, setPoliticasEdad] = useState<PoliticaEdad[]>(INITIAL_POLITICAS_EDAD);
  const [nivelesDv, setNivelesDv] = useState<NivelDistribuidor[]>(INITIAL_NIVELES_DISTRIBUIDOR);
  const [cortes, setCortes] = useState<RelacionCorte[]>(INITIAL_RELACION_CORTES);
  const [comisiones, setComisiones] = useState<ComisionEsquema[]>(INITIAL_COMISIONES);
  const [gestores, setGestores] = useState<GestorCobranza[]>(INITIAL_GESTORES);
  const [accesosCoordSuc, setAccesosCoordSuc] = useState<AccesoCoordinadorSucursal[]>(INITIAL_ACCESOS_COORD_SUCURSAL);
  const [permisosPerfil, setPermisosPerfil] = useState<PermisoModuloPerfil[]>(INITIAL_PERMISOS_MODULO_PERFIL);

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
          1. HEADER PRINCIPAL DEL MÓDULO CATÁLOGOS
         ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Sistema Core • Catálogos Institucionales
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Administración de Catálogos Maestros
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">15 Catálogos Disponibles</span>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Sucursal: {currentUser?.branch || 'Todas'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. TAB BAR DE 15 PESTAÑAS (EN EL ORDEN EXACTO DE LA IMAGEN 2)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1 text-xs select-none">
          {CATALOGOS_TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
                title={tab.label}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'usuarios' && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {usuarios.length}
                  </span>
                )}
                {tab.id === 'coordinadores' && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {coordinadores.length}
                  </span>
                )}
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
          TAB 2: ACCESOS X COORDINADOR
         ----------------------------------------------------------------------- */}
      {activeTab === 'accesos_coordinador' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-600" />
              <span>Vincular Usuario del Sistema con Coordinador Operativo</span>
            </h3>
            <p className="text-xs text-slate-600">
              Permite que el sistema filtre automáticamente la cartera y los vales cuando el usuario inicia sesión.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="px-3 py-3">ID Mapeo</th>
                  <th className="px-3 py-3">Coordinador Operativo</th>
                  <th className="px-3 py-3">Usuario del Sistema</th>
                  <th className="px-3 py-3">Fecha Asignación</th>
                  <th className="px-3 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accesos.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-mono text-slate-500">{a.id}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{a.coordinadorNombre}</td>
                    <td className="px-3 py-2.5 font-semibold text-indigo-700">{a.usuarioNombre}</td>
                    <td className="px-3 py-2.5 text-slate-500">{a.fechaAsignacion}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => showToast(`Acceso ${a.id} desvinculado`, 'error')}
                        className="text-rose-600 hover:underline font-bold"
                      >
                        Desvincular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 3: FUNCIONES X USUARIO
         ----------------------------------------------------------------------- */}
      {activeTab === 'funciones_usuario' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Matriz de Facultades y Permisos Especiales por Usuario
            </h3>
            <p className="text-xs text-slate-500 mt-1">17 Permisos de autorización bancaria y operativa.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="px-3 py-3">Usuario</th>
                  <th className="px-3 py-3">Facultad / Permiso</th>
                  <th className="px-3 py-3">Descripción</th>
                  <th className="px-3 py-3 text-center">Habilitado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {funciones.slice(0, 20).map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{f.usuarioNombre}</td>
                    <td className="px-3 py-2.5 font-bold text-blue-700">{f.funcionNombre}</td>
                    <td className="px-3 py-2.5 text-slate-500">{f.descripcion || '-'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => {
                          setFunciones((prev) =>
                            prev.map((item) => (item.id === f.id ? { ...item, permiso: !item.permiso } : item))
                          );
                          showToast(`Permiso actualizado.`);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          f.permiso
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {f.permiso ? 'ACTIVO' : 'DENEGADO'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 4: SUCURSALES
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

      {/* -----------------------------------------------------------------------
          TAB 6: TIPOS DE DOCUMENTO
         ----------------------------------------------------------------------- */}
      {activeTab === 'tipos_documento' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Documentos Requeridos en Expedientes KYC y Crédito</h3>
            <span className="text-slate-500">{tiposDoc.length} Documentos Configurados</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Código</th>
                <th className="px-3 py-2.5">Nombre del Documento</th>
                <th className="px-3 py-2.5">Aplica Para</th>
                <th className="px-3 py-2.5">Formatos</th>
                <th className="px-3 py-2.5 text-center">Obligatorio</th>
                <th className="px-3 py-2.5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tiposDoc.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-mono text-blue-700 font-bold">{d.codigo}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{d.nombre}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-600">{d.aplicaA}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">{d.formatos}</td>
                  <td className="px-3 py-2.5 text-center">
                    {d.obligatorio ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        OBLIGATORIO
                      </span>
                    ) : (
                      <span className="text-slate-400">Opcional</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {d.estatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 7: CONDICIONES DE PRODUCTO
         ----------------------------------------------------------------------- */}
      {activeTab === 'condiciones_producto' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Condiciones y Tasas de Productos Financieros</h3>
            <span className="text-slate-500">{condiciones.length} Productos</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Código</th>
                <th className="px-3 py-2.5">Producto</th>
                <th className="px-3 py-2.5">Plazo</th>
                <th className="px-3 py-2.5">Tasa Quincenal</th>
                <th className="px-3 py-2.5">Monto Mínimo</th>
                <th className="px-3 py-2.5">Monto Máximo</th>
                <th className="px-3 py-2.5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {condiciones.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-mono font-bold text-blue-700">{c.codigo}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{c.nombre}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800">{c.plazoQuincenas} Quincenas</td>
                  <td className="px-3 py-2.5 font-bold text-blue-600">{c.tasaQuincenalPct}%</td>
                  <td className="px-3 py-2.5 font-mono">{formatMoney(c.montoMinimo)}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-emerald-700">{formatMoney(c.montoMaximo)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {c.estatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 8: CUENTAS BANCARIAS
         ----------------------------------------------------------------------- */}
      {activeTab === 'cuentas_bancarias' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Cuentas Concentradoras y de Dispersión SPEI</h3>
            <span className="text-slate-500">{cuentasBancarias.length} Cuentas</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Banco</th>
                <th className="px-3 py-2.5">CLABE Interbancaria</th>
                <th className="px-3 py-2.5">Titular Institucional</th>
                <th className="px-3 py-2.5">Uso Oficial</th>
                <th className="px-3 py-2.5">Saldo Disponible</th>
                <th className="px-3 py-2.5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuentasBancarias.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-slate-900">{b.banco}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-blue-700">{b.clabe}</td>
                  <td className="px-3 py-2.5 text-slate-600">{b.titular}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {b.tipoUso}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700 font-mono">{formatMoney(b.saldoDisponible)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {b.estatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 9: POLÍTICAS DE EDAD
         ----------------------------------------------------------------------- */}
      {activeTab === 'politicas_edad' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Políticas de Edad para Otorgamiento de Crédito</h3>
            <span className="text-slate-500">{politicasEdad.length} Políticas</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Perfil</th>
                <th className="px-3 py-2.5">Descripción</th>
                <th className="px-3 py-2.5 text-center">Edad Mínima</th>
                <th className="px-3 py-2.5 text-center">Edad Máx. Otorgamiento</th>
                <th className="px-3 py-2.5 text-center">Edad Máx. Renovación</th>
                <th className="px-3 py-2.5 text-center">Autorización Especial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {politicasEdad.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-blue-700 font-mono">{p.perfil}</td>
                  <td className="px-3 py-2.5 text-slate-700">{p.descripcion}</td>
                  <td className="px-3 py-2.5 text-center font-bold">{p.edadMinima} años</td>
                  <td className="px-3 py-2.5 text-center font-bold text-slate-900">{p.edadMaximaOtorgamiento} años</td>
                  <td className="px-3 py-2.5 text-center font-bold text-emerald-700">{p.edadMaximaRenovacion} años</td>
                  <td className="px-3 py-2.5 text-center">
                    {p.requiereAutorizacionMesa ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Requiere Mesa
                      </span>
                    ) : (
                      <span className="text-slate-400">Automático</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 10: NIVELES DISTRIBUIDOR
         ----------------------------------------------------------------------- */}
      {activeTab === 'niveles_distribuidor' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Escalamiento de Niveles para Distribuidoras (DVs)</h3>
            <span className="text-slate-500">5 Niveles Oficiales</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Nivel</th>
                <th className="px-3 py-2.5">Límite Base de Crédito</th>
                <th className="px-3 py-2.5">Vales Máximos</th>
                <th className="px-3 py-2.5">% Comisión Cobranza</th>
                <th className="px-3 py-2.5">% Descuento Pronto Pago</th>
                <th className="px-3 py-2.5">Beneficio LanaTienda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nivelesDv.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                      {n.nivel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-bold font-mono text-slate-900">{formatMoney(n.limiteBase)}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-700">{n.valesMaximos} Vales</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700">{n.tasaComisionCobranzaPct}%</td>
                  <td className="px-3 py-2.5 font-bold text-blue-600">{n.descuentoProntoPagoPct}%</td>
                  <td className="px-3 py-2.5 text-slate-600">{n.beneficioLanaTienda}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 11: RELACIÓN CORTES TABLA DÍAS
         ----------------------------------------------------------------------- */}
      {activeTab === 'relacion_cortes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Calendario Oficial de Cortes y Vencimientos Quincenales</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Quincena</th>
                <th className="px-3 py-2.5">Día de Corte Oficial</th>
                <th className="px-3 py-2.5">Día Límite de Pago</th>
                <th className="px-3 py-2.5 text-center">Días de Gracia</th>
                <th className="px-3 py-2.5 text-center">Moratorios a partir del</th>
                <th className="px-3 py-2.5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cortes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-blue-700">Quincena {c.quincenaNumero}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{c.diaCorte}</td>
                  <td className="px-3 py-2.5 font-semibold text-emerald-700">{c.diaLimitePago}</td>
                  <td className="px-3 py-2.5 text-center font-bold">{c.diasGracia} días</td>
                  <td className="px-3 py-2.5 text-center font-bold text-rose-600">Día {c.aplicaMoratoriosDesdeDia}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {c.estatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 12: COMISIONES
         ----------------------------------------------------------------------- */}
      {activeTab === 'comisiones' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Tabulador de Comisiones y Bonos por Cobranza</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Concepto</th>
                <th className="px-3 py-2.5">% Recuperación Mínima</th>
                <th className="px-3 py-2.5">% Recuperación Máxima</th>
                <th className="px-3 py-2.5">% Comisión DV</th>
                <th className="px-3 py-2.5">% Bono Coordinador</th>
                <th className="px-3 py-2.5 text-center">Periodicidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comisiones.map((cm) => (
                <tr key={cm.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-slate-900">{cm.concepto}</td>
                  <td className="px-3 py-2.5 font-bold text-blue-700">{cm.rangoRecuperacionMinPct}%</td>
                  <td className="px-3 py-2.5 font-bold text-blue-700">{cm.rangoRecuperacionMaxPct}%</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700">{cm.comisionDistribuidoraPct}%</td>
                  <td className="px-3 py-2.5 font-bold text-indigo-700">{cm.bonoCoordinadorPct}%</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{cm.periodicidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 13: GESTORES
         ----------------------------------------------------------------------- */}
      {activeTab === 'gestores' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Catálogo de Gestores de Cobranza Domiciliaria</h3>
            <span className="text-slate-500">{gestores.length} Gestores Activos</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Código</th>
                <th className="px-3 py-2.5">Nombre del Gestor</th>
                <th className="px-3 py-2.5">Sucursal</th>
                <th className="px-3 py-2.5">Teléfono</th>
                <th className="px-3 py-2.5">Cuentas Asignadas</th>
                <th className="px-3 py-2.5">Cartera en Mora</th>
                <th className="px-3 py-2.5">% Efectividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gestores.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-mono font-bold text-blue-700">{g.codigoGestor}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{g.nombre}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-700">{g.sucursalId}</td>
                  <td className="px-3 py-2.5 font-mono">{g.telefono}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800">{g.cuentasEnGestion} cuentas</td>
                  <td className="px-3 py-2.5 font-bold text-rose-700 font-mono">{formatMoney(g.carteraMoraAsignada)}</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700">{g.porcentajeRecuperacion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 14: ACCESOS COORDINADORES SUCURSAL
         ----------------------------------------------------------------------- */}
      {activeTab === 'accesos_coordinadores_sucursal' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Asignación Multirregión de Coordinadores por Sucursal</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">Coordinador</th>
                <th className="px-3 py-2.5">Sucursal Matriz</th>
                <th className="px-3 py-2.5">Sucursales Secundarias Autorizadas</th>
                <th className="px-3 py-2.5">Fecha Asignación</th>
                <th className="px-3 py-2.5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accesosCoordSuc.map((ac) => (
                <tr key={ac.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-mono text-slate-500">{ac.id}</td>
                  <td className="px-3 py-2.5 font-bold text-slate-900">{ac.coordinadorNombre}</td>
                  <td className="px-3 py-2.5 font-bold text-blue-700">{ac.sucursalMatriz}</td>
                  <td className="px-3 py-2.5">
                    {ac.sucursalesSecundarias.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {ac.sucursalesSecundarias.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Ninguna</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{ac.fechaAsignacion}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {ac.estatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 15: PERMISO MÓDULO X PERFIL
         ----------------------------------------------------------------------- */}
      {activeTab === 'permiso_modulo_perfil' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
            <h3 className="font-bold text-slate-900">Matriz de Acceso por Rol (Role-Based Access Control RBAC)</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="px-3 py-2.5">Perfil / Rol</th>
                <th className="px-3 py-2.5">Módulo Permitido</th>
                <th className="px-3 py-2.5 text-center">Ver</th>
                <th className="px-3 py-2.5 text-center">Crear</th>
                <th className="px-3 py-2.5 text-center">Editar</th>
                <th className="px-3 py-2.5 text-center">Eliminar</th>
                <th className="px-3 py-2.5 text-center">Requiere MFA OTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permisosPerfil.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-blue-700">{p.perfil}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-800">{p.modulo}</td>
                  <td className="px-3 py-2.5 text-center">{p.puedeVer ? '✓' : '-'}</td>
                  <td className="px-3 py-2.5 text-center">{p.puedeCrear ? '✓' : '-'}</td>
                  <td className="px-3 py-2.5 text-center">{p.puedeEditar ? '✓' : '-'}</td>
                  <td className="px-3 py-2.5 text-center">{p.puedeEliminar ? '✓' : '-'}</td>
                  <td className="px-3 py-2.5 text-center">
                    {p.requiereMFA ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        OTP Obligatorio
                      </span>
                    ) : (
                      <span className="text-slate-400">Estándar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
