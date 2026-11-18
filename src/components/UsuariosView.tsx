'use client';

import React, { useState, useMemo } from 'react';
import { UserSession } from '@/types/auth';
import {
  INITIAL_CATALOGO_USUARIOS,
  CatalogoUsuario,
} from '@/lib/data/catalogosData';
import {
  LISTA_PERFILES_OFICIALES,
  FUNCIONES_ESPECIALES_CLAVE,
  PerfilSistemaOficial,
  FuncionEspecialPermiso,
} from '@/lib/data/perfilesPermisosData';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Mail,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  ShieldCheck,
  KeyRound,
  Layers,
  ShieldAlert,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface UsuariosViewProps {
  currentUser?: UserSession | null;
}

export default function UsuariosView({ currentUser }: UsuariosViewProps) {
  const [vistaActiva, setVistaActiva] = useState<'usuarios' | 'rbac'>('usuarios');
  const [usuarios, setUsuarios] = useState<CatalogoUsuario[]>(INITIAL_CATALOGO_USUARIOS);
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [usuarioPerfilFilter, setUsuarioPerfilFilter] = useState('ALL');
  const [usuarioSucursalFilter, setUsuarioSucursalFilter] = useState('ALL');
  const [showRawPasswords, setShowRawPasswords] = useState(false);
  const [selectedUsuarioForEdit, setSelectedUsuarioForEdit] = useState<CatalogoUsuario | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // RBAC Matrix State
  const [rbacCategoryFilter, setRbacCategoryFilter] = useState<string>('ALL');
  const [rbacSearch, setRbacSearch] = useState<string>('');
  const [selectedPerfilId, setSelectedPerfilId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered RBAC Profiles
  const filteredPerfiles = useMemo(() => {
    return LISTA_PERFILES_OFICIALES.filter((p) => {
      if (rbacCategoryFilter !== 'ALL' && p.categoria !== rbacCategoryFilter) return false;
      if (!rbacSearch.trim()) return true;
      const q = rbacSearch.toLowerCase().trim();
      return (
        p.id.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      );
    });
  }, [rbacCategoryFilter, rbacSearch]);

  // Filtered RBAC Special Functions
  const filteredFunciones = useMemo(() => {
    return FUNCIONES_ESPECIALES_CLAVE.filter((f) => {
      if (selectedPerfilId && f.perfil !== selectedPerfilId) return false;
      if (!rbacSearch.trim()) return true;
      const q = rbacSearch.toLowerCase().trim();
      return f.funcion.toLowerCase().includes(q) || f.perfil.toLowerCase().includes(q);
    });
  }, [selectedPerfilId, rbacSearch]);

  // Filtered Usuarios
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

  // Exportar Matriz RBAC a Excel
  const handleExportRbacExcel = () => {
    const perfilesData = LISTA_PERFILES_OFICIALES.map((p) => ({
      ID_Perfil: p.id,
      Nombre_Perfil: p.nombre,
      Categoria: p.categoria,
      Descripcion: p.descripcion,
      Total_Permisos_Modulos: p.totalPermisosModulos,
      Funciones_Especiales: p.totalFuncionesEspeciales,
    }));
    const funcionesData = FUNCIONES_ESPECIALES_CLAVE.map((f) => ({
      ID_Funcion: f.id,
      Perfil: f.perfil,
      Funcion_Especial: f.funcion,
      Activo: f.activo ? 'SI' : 'NO',
    }));
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(perfilesData);
    const ws2 = XLSX.utils.json_to_sheet(funcionesData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Perfiles_Oficiales');
    XLSX.utils.book_append_sheet(wb, ws2, 'Funciones_Especiales_RBAC');
    XLSX.writeFile(wb, `matriz_rbac_perfiles_permisos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Matriz de Perfiles y Permisos RBAC exportada exitosamente.');
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* ======================================================== */}
      {/* 1. ENCABEZADO PRINCIPAL CON SELECTOR DE VISTA           */}
      {/* ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            {vistaActiva === 'usuarios' ? (
              <Users className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {vistaActiva === 'usuarios' ? 'Padrón de Usuarios' : 'Matriz Oficial de Perfiles & Permisos (RBAC)'}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {vistaActiva === 'usuarios'
                  ? `${usuarios.length} Registrados`
                  : `${LISTA_PERFILES_OFICIALES.length} Perfiles Oficiales`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {vistaActiva === 'usuarios'
                ? 'Administración de cuentas de acceso, facultades operativas y estados de conexión'
                : 'Definición de roles institucionales, alcance de módulos y auditoría de funciones especiales de alto riesgo'}
            </p>
          </div>
        </div>

        {/* Segmented Switcher & Sucursal Info */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setVistaActiva('usuarios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                vistaActiva === 'usuarios'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuarios ({usuarios.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setVistaActiva('rbac')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                vistaActiva === 'rbac'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Perfiles & RBAC ({LISTA_PERFILES_OFICIALES.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              Sucursal: {currentUser?.branch || 'Todas'}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. VISTA CONDICIONAL: USUARIOS O RBAC                    */}
      {/* ======================================================== */}
      {vistaActiva === 'usuarios' ? (
        <>
          {/* BARRA DE FILTROS Y ACCIONES PARA USUARIOS */}
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
              <select
                value={usuarioPerfilFilter}
                onChange={(e) => setUsuarioPerfilFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs cursor-pointer max-w-[180px] truncate"
              >
                <option value="ALL">Todos los Perfiles</option>
                {LISTA_PERFILES_OFICIALES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))}
              </select>

              <select
                value={usuarioSucursalFilter}
                onChange={(e) => setUsuarioSucursalFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Usuario</span>
              </button>
            </div>
          </div>

      {/* ======================================================== */}
      {/* 3. TABLA PRINCIPAL DE USUARIOS                           */}
      {/* ======================================================== */}
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
                <th className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span>Contraseña RAW</span>
                    <button
                      type="button"
                      onClick={() => setShowRawPasswords(!showRawPasswords)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showRawPasswords ? 'Ocultar contraseñas' : 'Ver contraseñas'}
                    >
                      {showRawPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </th>
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
                        className="text-blue-600 hover:underline font-bold cursor-pointer"
                        title="Editar usuario"
                      >
                        Editar
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleSendEmailAcceso(u)}
                        className="text-emerald-700 hover:underline font-bold cursor-pointer"
                        title="Enviar correo con accesos"
                      >
                        Enviar Correo
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleToggleBloqueoUsuario(u.usuarioId)}
                        className={`font-bold hover:underline cursor-pointer ${
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
                  <td className="px-3 py-2.5 font-mono text-center">
                    {showRawPasswords ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        delcar123
                      </span>
                    ) : (
                      <span className="text-slate-400">••••••••</span>
                    )}
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

                  {/* Todos los Coordinadores (Checkbox) */}
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={u.todosLosCoordinadores}
                      onChange={() => handleToggleTodosCoordinadores(u.usuarioId)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* Sucursal ID */}
                  <td className="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                    {u.sucursalId || '-'}
                  </td>

                  {/* Usuario ID Odco */}
                  <td className="px-3 py-2.5 font-mono text-slate-500">
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
    </>
  ) : (
    /* ======================================================== */
    /* 3. VISTA RBAC: CATÁLOGO DE PERFILES & MATRIZ DE PERMISOS */
    /* ======================================================== */
    <div className="space-y-4">
      {/* TARJETAS RESUMEN RBAC */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Perfiles Oficiales</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">16</div>
          <p className="text-[11px] text-slate-500 mt-0.5">En 6 categorías operativas</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Funciones Especiales</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">38 Reglas</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Auditoría estricta de seguridad</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Permisos a Módulos</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">&gt; 200</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Vistas y submenús habilitados</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Perfiles Legales / Riesgos</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">4 Críticos</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Abogados, Control y Analistas</p>
        </div>
      </div>

      {/* BARRA DE FILTROS Y ACCIONES RBAC */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por rol, descripción o función especial..."
            value={rbacSearch}
            onChange={(e) => setRbacSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
          {rbacSearch && (
            <button
              onClick={() => setRbacSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={rbacCategoryFilter}
              onChange={(e) => setRbacCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="DIRECCION">DIRECCION</option>
              <option value="GERENCIA">GERENCIA</option>
              <option value="OPERACIONES">OPERACIONES</option>
              <option value="LEGAL">LEGAL</option>
              <option value="RIESGOS">RIESGOS</option>
              <option value="ADMINISTRACION">ADMINISTRACION</option>
            </select>
          </div>

          {selectedPerfilId && (
            <button
              type="button"
              onClick={() => setSelectedPerfilId(null)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition cursor-pointer"
            >
              <span>Filtro: {selectedPerfilId}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={handleExportRbacExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Exportar Matriz RBAC a Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Matriz RBAC</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: MATRIZ DE PERFILES OFICIALES */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Catálogo Institucional de Perfiles de Puesto ({filteredPerfiles.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Roles extraídos de la base de datos SQL de producción con su alcance modular y facultades
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredPerfiles.map((p) => {
            const isSelected = selectedPerfilId === p.id;
            const badgeClass =
              p.categoria === 'DIRECCION'
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : p.categoria === 'GERENCIA'
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : p.categoria === 'OPERACIONES'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : p.categoria === 'LEGAL'
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : p.categoria === 'RIESGOS'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {p.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}
                    >
                      {p.categoria}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{p.nombre}</h4>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {p.descripcion}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-slate-500 font-semibold">
                    <span title="Total módulos">{p.totalPermisosModulos} mód.</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold" title="Funciones especiales">
                      {p.totalFuncionesEspeciales} esp.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPerfilId(isSelected ? null : p.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    {isSelected ? 'Ver Todos' : 'Ver Funciones'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: REGISTRO DE FUNCIONES ESPECIALES CRÍTICAS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>
                Registro de Funciones Especiales y Candados Operativos ({filteredFunciones.length})
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Permisos funcionales de alta sensibilidad (cancelación, reestructuras, asignación jurídica, modificaciones de crédito)
            </p>
          </div>

          {selectedPerfilId && (
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl font-bold">
              Filtrado por: {selectedPerfilId}
            </span>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3.5 py-3 w-16 text-center">ID</th>
                <th className="px-3.5 py-3 w-48">Perfil Asignado</th>
                <th className="px-3.5 py-3">Función Especial / Privilegio</th>
                <th className="px-3.5 py-3 w-32 text-center">Nivel de Riesgo</th>
                <th className="px-3.5 py-3 w-28 text-center">Estatus</th>
                <th className="px-3.5 py-3 w-28 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredFunciones.map((f) => {
                const isCritical =
                  f.funcion.includes('CANCELAR') ||
                  f.funcion.includes('BLOQUEA') ||
                  f.funcion.includes('LINEAS DE CREDITO') ||
                  f.funcion.includes('ASIGNAR ABOGADO') ||
                  f.funcion.includes('RECALCULAR');
                const isHigh =
                  f.funcion.includes('RESTRUTURA') ||
                  f.funcion.includes('MODIFICAR') ||
                  f.funcion.includes('CAMBIA') ||
                  f.funcion.includes('ASIGNAR VALERAS') ||
                  f.funcion.includes('VALIDAR');

                return (
                  <tr key={f.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-3.5 py-2.5 text-center font-mono text-slate-400 font-bold">
                      #{f.id}
                    </td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                        {f.perfil}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-xs text-slate-800 font-semibold">
                      {f.funcion}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : isHigh
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {isCritical ? 'CRÍTICO' : isHigh ? 'CONTROL ALTO' : 'OPERATIVO'}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Habilitado</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          showToast(
                            `Auditoría completada para regla #${f.id} (${f.funcion}) en perfil ${f.perfil}.`
                          )
                        }
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Auditar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* ======================================================== */}
      {/* 4. MODAL: NUEVO / EDITAR USUARIO                         */}
      {/* ======================================================== */}
      {(isNewUserModalOpen || selectedUsuarioForEdit) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{selectedUsuarioForEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsNewUserModalOpen(false);
                  setSelectedUsuarioForEdit(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Perfil / Rol</label>
                  <select
                    defaultValue={selectedUsuarioForEdit?.perfilUsuarioId || 'ASESOR DE CREDITO'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white cursor-pointer"
                  >
                    {LISTA_PERFILES_OFICIALES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.nombre}
                      </option>
                    ))}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    defaultValue={selectedUsuarioForEdit?.telefonoMovil || ''}
                    placeholder="8441234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sucursal Asignada</label>
                  <select
                    defaultValue={selectedUsuarioForEdit?.sucursalId || 'SALTILLO'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white cursor-pointer"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <span className="font-bold text-slate-700">Acceso a Todos los Coordinadores</span>
                <input
                  type="checkbox"
                  defaultChecked={selectedUsuarioForEdit?.todosLosCoordinadores ?? true}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewUserModalOpen(false);
                    setSelectedUsuarioForEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer active:scale-95"
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
