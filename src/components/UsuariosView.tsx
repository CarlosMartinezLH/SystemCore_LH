'use client';

import React, { useState, useMemo } from 'react';
import { UserSession } from '@/types/auth';
import {
  INITIAL_CATALOGO_USUARIOS,
  CatalogoUsuario,
} from '@/lib/data/catalogosData';
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
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface UsuariosViewProps {
  currentUser?: UserSession | null;
}

export default function UsuariosView({ currentUser }: UsuariosViewProps) {
  const [usuarios, setUsuarios] = useState<CatalogoUsuario[]>(INITIAL_CATALOGO_USUARIOS);
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [usuarioPerfilFilter, setUsuarioPerfilFilter] = useState('ALL');
  const [usuarioSucursalFilter, setUsuarioSucursalFilter] = useState('ALL');
  const [showRawPasswords, setShowRawPasswords] = useState(false);
  const [selectedUsuarioForEdit, setSelectedUsuarioForEdit] = useState<CatalogoUsuario | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

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

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* ======================================================== */}
      {/* 1. ENCABEZADO PRINCIPAL (SIN PESTAÑAS)                    */}
      {/* ======================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Catálogo de Usuarios
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {usuarios.length} Registrados
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Administración de cuentas de acceso, perfiles operativos y facultades de usuario
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Sucursal: {currentUser?.branch || 'Todas'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BARRA DE FILTROS Y ACCIONES                           */}
      {/* ======================================================== */}
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-xs cursor-pointer"
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
