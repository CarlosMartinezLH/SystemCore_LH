'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  User,
  Shield,
  Filter,
  Check,
  X,
  AlertCircle,
  Building,
  RefreshCw,
  Mail,
  Sliders,
  ChevronRight,
  Key,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Sucursal, InstitutionalUserConfig } from '@/types/configuracion';
import {
  UserRole,
  ALL_SYSTEM_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
  ActionPermissions,
} from '@/types/auth';

const ROLE_OPTIONS: { role: UserRole; label: string; defaultScope: 'ALL' | 'BRANCH' }[] = [
  { role: 'ADMINISTRADOR', label: 'Dirección General / Administrador', defaultScope: 'ALL' },
  { role: 'MESA_CREDITO', label: 'Mesa de Crédito & Riesgos (Nacional)', defaultScope: 'ALL' },
  { role: 'GERENTE_SUCURSAL', label: 'Gerente de Sucursal', defaultScope: 'BRANCH' },
  { role: 'COORDINADOR_COMERCIAL', label: 'Coordinador Comercial de Zona', defaultScope: 'ALL' },
  { role: 'COORDINADOR_NEGOCIOS', label: 'Coordinador de Negocios', defaultScope: 'BRANCH' },
  { role: 'ASESOR_CAMPO', label: 'Asesor de Campo (Fuerza de Ventas)', defaultScope: 'BRANCH' },
];

function getAuthHeaders(): HeadersInit {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('lanahora_user_session_v2') : null;
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        };
      }
    }
  } catch (e) {}
  return { 'Content-Type': 'application/json', 'x-dev-bypass': 'true' };
}

export default function ConfiguracionView() {
  const [activeTab, setActiveTab] = useState<'sucursales' | 'usuarios' | 'roles'>('usuarios');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [usuarios, setUsuarios] = useState<InstitutionalUserConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchSucursal, setSearchSucursal] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');
  const [filterBranchForUser, setFilterBranchForUser] = useState<string>('TODAS');

  // Modals for Sucursales
  const [isSucursalModalOpen, setIsSucursalModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [sucursalClave, setSucursalClave] = useState('');
  const [sucursalNombre, setSucursalNombre] = useState('');
  const [sucursalDireccion, setSucursalDireccion] = useState('');
  const [sucursalCiudad, setSucursalCiudad] = useState('Saltillo');
  const [sucursalEstado, setSucursalEstado] = useState('Coahuila');
  const [sucursalTelefono, setSucursalTelefono] = useState('');
  const [sucursalResponsable, setSucursalResponsable] = useState('');
  const [sucursalEstatus, setSucursalEstatus] = useState<'ACTIVA' | 'INACTIVA'>('ACTIVA');

  // Modals for Usuarios & Permisos
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<InstitutionalUserConfig | null>(null);
  const [usuarioName, setUsuarioName] = useState('');
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [usuarioPassword, setUsuarioPassword] = useState('lanahora2026');
  const [showPassword, setShowPassword] = useState(false);
  const [usuarioPuesto, setUsuarioPuesto] = useState('');
  const [usuarioRole, setUsuarioRole] = useState<UserRole>('ASESOR_CAMPO');
  const [usuarioBranch, setUsuarioBranch] = useState('');
  const [usuarioBranchScope, setUsuarioBranchScope] = useState<'ALL' | 'BRANCH'>('BRANCH');
  const [usuarioTelefono, setUsuarioTelefono] = useState('');
  const [usuarioEstatus, setUsuarioEstatus] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [usuarioAllowedModules, setUsuarioAllowedModules] = useState<string[]>(
    DEFAULT_ROLE_PERMISSIONS.ASESOR_CAMPO.allowedModules
  );
  const [usuarioPermissions, setUsuarioPermissions] = useState<ActionPermissions>(
    DEFAULT_ROLE_PERMISSIONS.ASESOR_CAMPO.permissions
  );

  // Alerts
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Load data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSuc, resUsr] = await Promise.all([
        fetch('/api/configuracion/sucursales', { headers: getAuthHeaders() }),
        fetch('/api/configuracion/usuarios', { headers: getAuthHeaders() }),
      ]);
      const dataSuc = await resSuc.json();
      const dataUsr = await resUsr.json();

      if (dataSuc.success) setSucursales(dataSuc.sucursales);
      if (dataUsr.success) setUsuarios(dataUsr.usuarios);
    } catch (err) {
      console.log('Error fetching configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute users per branch
  const usersCountByBranch = useMemo(() => {
    const map: Record<string, number> = {};
    usuarios.forEach((u) => {
      map[u.branch] = (map[u.branch] || 0) + 1;
    });
    return map;
  }, [usuarios]);

  // --- SUCURSALES ACTIONS ---
  const handleOpenNewSucursal = () => {
    setEditingSucursal(null);
    setSucursalClave(`SUC-00${sucursales.length + 1}`);
    setSucursalNombre('');
    setSucursalDireccion('');
    setSucursalCiudad('Saltillo');
    setSucursalEstado('Coahuila');
    setSucursalTelefono('');
    setSucursalResponsable('');
    setSucursalEstatus('ACTIVA');
    setIsSucursalModalOpen(true);
  };

  const handleOpenEditSucursal = (suc: Sucursal) => {
    setEditingSucursal(suc);
    setSucursalClave(suc.clave);
    setSucursalNombre(suc.nombre);
    setSucursalDireccion(suc.direccion);
    setSucursalCiudad(suc.ciudad);
    setSucursalEstado(suc.estado);
    setSucursalTelefono(suc.telefono);
    setSucursalResponsable(suc.responsable);
    setSucursalEstatus(suc.estatus);
    setIsSucursalModalOpen(true);
  };

  const handleSaveSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sucursalNombre.trim() || !sucursalClave.trim()) {
      showNotification('La clave y el nombre de la sucursal son requeridos.', 'error');
      return;
    }

    try {
      if (editingSucursal) {
        // Edit
        const res = await fetch(`/api/configuracion/sucursales/${editingSucursal.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            clave: sucursalClave.trim().toUpperCase(),
            nombre: sucursalNombre.trim(),
            direccion: sucursalDireccion.trim(),
            ciudad: sucursalCiudad.trim(),
            estado: sucursalEstado.trim(),
            telefono: sucursalTelefono.trim(),
            responsable: sucursalResponsable.trim(),
            estatus: sucursalEstatus,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSucursales((prev) =>
            prev.map((s) => (s.id === editingSucursal.id ? data.sucursal : s))
          );
          // Actualizar usuarios si cambió el nombre
          if (editingSucursal.nombre !== sucursalNombre.trim()) {
            setUsuarios((prev) =>
              prev.map((u) =>
                u.branch === editingSucursal.nombre ? { ...u, branch: sucursalNombre.trim() } : u
              )
            );
          }
          showNotification(`Sucursal "${sucursalNombre}" actualizada correctamente.`);
          setIsSucursalModalOpen(false);
        }
      } else {
        // Create new
        const res = await fetch('/api/configuracion/sucursales', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            clave: sucursalClave.trim().toUpperCase(),
            nombre: sucursalNombre.trim(),
            direccion: sucursalDireccion.trim(),
            ciudad: sucursalCiudad.trim(),
            estado: sucursalEstado.trim(),
            telefono: sucursalTelefono.trim(),
            responsable: sucursalResponsable.trim(),
            estatus: sucursalEstatus,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSucursales((prev) => [data.sucursal, ...prev]);
          showNotification(`Nueva sucursal "${sucursalNombre}" creada exitosamente.`);
          setIsSucursalModalOpen(false);
        }
      }
    } catch {
      showNotification('Error de conexión al procesar la sucursal.', 'error');
    }
  };

  const handleToggleSucursal = async (suc: Sucursal) => {
    try {
      const res = await fetch(`/api/configuracion/sucursales/${suc.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'toggleEstatus' }),
      });
      const data = await res.json();
      if (data.success) {
        setSucursales((prev) =>
          prev.map((s) => (s.id === suc.id ? data.sucursal : s))
        );
        showNotification(
          `Sucursal "${suc.nombre}" ahora está ${data.sucursal.estatus === 'ACTIVA' ? 'Activada' : 'Desactivada'}.`
        );
      }
    } catch {
      showNotification('Error al cambiar estatus de sucursal.', 'error');
    }
  };

  const handleDeleteSucursal = async (suc: Sucursal) => {
    const confirm = window.confirm(
      `¿Estás seguro de eliminar la sucursal "${suc.nombre}"? Los usuarios asignados a ella serán transferidos a "Corporativo Saltillo".`
    );
    if (!confirm) return;

    try {
      const res = await fetch(`/api/configuracion/sucursales/${suc.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSucursales((prev) => prev.filter((s) => s.id !== suc.id));
        setUsuarios((prev) =>
          prev.map((u) =>
            u.branch === suc.nombre ? { ...u, branch: 'Corporativo Saltillo' } : u
          )
        );
        showNotification(`Sucursal "${suc.nombre}" eliminada correctamente.`);
      }
    } catch {
      showNotification('Error al eliminar sucursal.', 'error');
    }
  };

  // --- USUARIOS ACTIONS ---
  const handleOpenNewUsuario = () => {
    setEditingUsuario(null);
    setUsuarioName('');
    setUsuarioEmail('');
    setUsuarioPassword('lanahora2026');
    setShowPassword(false);
    setUsuarioPuesto('Asesor de Campo');
    setUsuarioRole('ASESOR_CAMPO');
    setUsuarioBranch(sucursales[0]?.nombre || 'Corporativo Saltillo');
    setUsuarioBranchScope('BRANCH');
    setUsuarioTelefono('');
    setUsuarioEstatus('ACTIVO');
    setUsuarioAllowedModules(DEFAULT_ROLE_PERMISSIONS.ASESOR_CAMPO.allowedModules);
    setUsuarioPermissions(DEFAULT_ROLE_PERMISSIONS.ASESOR_CAMPO.permissions);
    setIsUsuarioModalOpen(true);
  };

  const handleOpenEditUsuario = (usr: InstitutionalUserConfig) => {
    setEditingUsuario(usr);
    setUsuarioName(usr.name);
    setUsuarioEmail(usr.email);
    setUsuarioPassword(usr.password || 'lanahora2026');
    setShowPassword(false);
    setUsuarioPuesto(usr.puesto || usr.roleLabel);
    setUsuarioRole(usr.role);
    setUsuarioBranch(usr.branch);
    setUsuarioBranchScope(usr.branchScope);
    setUsuarioTelefono(usr.telefono || '');
    setUsuarioEstatus(usr.estatus);
    setUsuarioAllowedModules(
      usr.allowedModules && usr.allowedModules.length > 0
        ? usr.allowedModules
        : DEFAULT_ROLE_PERMISSIONS[usr.role]?.allowedModules || []
    );
    setUsuarioPermissions(
      usr.permissions || DEFAULT_ROLE_PERMISSIONS[usr.role]?.permissions || {
        canApproveLoans: false,
        canDisperseSPEI: false,
        canEditRules: false,
        canManageUsers: false,
        canViewPayroll: false,
        canExportData: false,
      }
    );
    setIsUsuarioModalOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setUsuarioRole(role);
    const selected = ROLE_OPTIONS.find((r) => r.role === role);
    if (selected) {
      setUsuarioPuesto(selected.label);
      setUsuarioBranchScope(selected.defaultScope);
    }
    const defaults = DEFAULT_ROLE_PERMISSIONS[role];
    if (defaults) {
      setUsuarioAllowedModules(defaults.allowedModules);
      setUsuarioPermissions(defaults.permissions);
    }
  };

  const handleToggleModule = (modId: string) => {
    setUsuarioAllowedModules((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );
  };

  const handleTogglePermission = (key: keyof ActionPermissions) => {
    setUsuarioPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllModules = () => {
    setUsuarioAllowedModules(ALL_SYSTEM_MODULES.map((m) => m.id));
  };

  const handleResetModulesToDefault = () => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[usuarioRole];
    if (defaults) {
      setUsuarioAllowedModules(defaults.allowedModules);
      setUsuarioPermissions(defaults.permissions);
    }
  };

  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioName.trim() || !usuarioEmail.trim() || !usuarioBranch.trim()) {
      showNotification('Nombre, correo electrónico y sucursal son obligatorios.', 'error');
      return;
    }

    const selectedRole = ROLE_OPTIONS.find((r) => r.role === usuarioRole);

    try {
      if (editingUsuario) {
        // Edit
        const res = await fetch(`/api/configuracion/usuarios/${editingUsuario.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: usuarioName.trim().toUpperCase(),
            email: usuarioEmail.trim().toLowerCase(),
            password: usuarioPassword,
            puesto: usuarioPuesto.trim(),
            role: usuarioRole,
            roleLabel: selectedRole?.label || usuarioPuesto,
            branch: usuarioBranch,
            branchScope: usuarioBranchScope,
            telefono: usuarioTelefono.trim(),
            estatus: usuarioEstatus,
            allowedModules: usuarioAllowedModules,
            permissions: usuarioPermissions,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setUsuarios((prev) =>
            prev.map((u) => (u.id === editingUsuario.id ? data.usuario : u))
          );
          showNotification(`Usuario "${usuarioName}" y sus permisos actualizados exitosamente.`);
          setIsUsuarioModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch('/api/configuracion/usuarios', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: usuarioName.trim().toUpperCase(),
            email: usuarioEmail.trim().toLowerCase(),
            password: usuarioPassword,
            puesto: usuarioPuesto.trim(),
            role: usuarioRole,
            roleLabel: selectedRole?.label || usuarioPuesto,
            branch: usuarioBranch,
            branchScope: usuarioBranchScope,
            telefono: usuarioTelefono.trim(),
            estatus: usuarioEstatus,
            allowedModules: usuarioAllowedModules,
            permissions: usuarioPermissions,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setUsuarios((prev) => [data.usuario, ...prev]);
          showNotification(`Nuevo usuario "${usuarioName}" creado con permisos asignados para ${usuarioBranch}.`);
          setIsUsuarioModalOpen(false);
        }
      }
    } catch {
      showNotification('Error de conexión al procesar el usuario.', 'error');
    }
  };

  const handleToggleUsuario = async (usr: InstitutionalUserConfig) => {
    try {
      const res = await fetch(`/api/configuracion/usuarios/${usr.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'toggleEstatus' }),
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === usr.id ? data.usuario : u))
        );
        showNotification(
          `Usuario "${usr.name}" ahora está ${data.usuario.estatus === 'ACTIVO' ? 'Activo' : 'Inactivo'}.`
        );
      }
    } catch {
      showNotification('Error al cambiar estatus del usuario.', 'error');
    }
  };

  const handleDeleteUsuario = async (usr: InstitutionalUserConfig) => {
    const confirm = window.confirm(`¿Estás seguro de eliminar el usuario "${usr.name}" (${usr.email})?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/configuracion/usuarios/${usr.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios((prev) => prev.filter((u) => u.id !== usr.id));
        showNotification(`Usuario "${usr.name}" eliminado del sistema.`);
      }
    } catch {
      showNotification('Error al eliminar usuario.', 'error');
    }
  };

  // Filtered Sucursales
  const filteredSucursales = useMemo(() => {
    return sucursales.filter(
      (s) =>
        s.nombre.toLowerCase().includes(searchSucursal.toLowerCase()) ||
        s.clave.toLowerCase().includes(searchSucursal.toLowerCase()) ||
        s.responsable.toLowerCase().includes(searchSucursal.toLowerCase()) ||
        s.ciudad.toLowerCase().includes(searchSucursal.toLowerCase())
    );
  }, [sucursales, searchSucursal]);

  // Filtered Usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchBranch = filterBranchForUser === 'TODAS' || u.branch === filterBranchForUser;
      const matchSearch =
        u.name.toLowerCase().includes(searchUsuario.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUsuario.toLowerCase()) ||
        u.puesto.toLowerCase().includes(searchUsuario.toLowerCase()) ||
        u.branch.toLowerCase().includes(searchUsuario.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [usuarios, searchUsuario, filterBranchForUser]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Configuración del Sistema Core
              </h1>
              <p className="text-xs text-slate-500">
                Administración de catálogo de sucursales, usuarios institucionales, roles y alcances
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sucursales')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'sucursales'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Sucursales ({sucursales.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'usuarios'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Asignaciones ({usuarios.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'roles'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Matriz de Roles & Permisos</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SUBMÓDULO DE SUCURSALES */}
      {/* ========================================================= */}
      {activeTab === 'sucursales' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Top Actions & Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchSucursal}
                onChange={(e) => setSearchSucursal(e.target.value)}
                placeholder="Buscar por nombre, clave, encargado o ciudad..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            <button
              onClick={handleOpenNewSucursal}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Dar de Alta Nueva Sucursal</span>
            </button>
          </div>

          {/* Sucursales Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Clave</th>
                    <th className="py-3 px-4">Nombre de Sucursal</th>
                    <th className="py-3 px-4">Dirección & Ciudad</th>
                    <th className="py-3 px-4">Responsable / Encargado</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4 text-center">Usuarios Asignados</th>
                    <th className="py-3 px-4 text-center">Estatus</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSucursales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No se encontraron sucursales registradas con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    filteredSucursales.map((suc) => {
                      const count = usersCountByBranch[suc.nombre] || 0;
                      return (
                        <tr key={suc.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {suc.clave}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-blue-600" />
                              <span>{suc.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{suc.direccion}</div>
                            <div className="text-[10px] text-slate-400">
                              {suc.ciudad}, {suc.estado}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {suc.responsable || 'Sin asignar'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {suc.telefono || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                              {count} colaboradores
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleSucursal(suc)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 mx-auto ${
                                suc.estatus === 'ACTIVA'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                              title="Clic para cambiar estatus"
                            >
                              <Power className="w-3 h-3" />
                              <span>{suc.estatus}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditSucursal(suc)}
                                className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition"
                                title="Editar datos o nombre de sucursal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSucursal(suc)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg transition"
                                title="Quitar sucursal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SUBMÓDULO DE USUARIOS & ASIGNACIONES */}
      {/* ========================================================= */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Top Actions & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 w-full sm:max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUsuario}
                  onChange={(e) => setSearchUsuario(e.target.value)}
                  placeholder="Buscar usuario por nombre, correo, puesto o sucursal..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              {/* Filter by Sucursal */}
              <div className="shrink-0">
                <select
                  value={filterBranchForUser}
                  onChange={(e) => setFilterBranchForUser(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="TODAS">Todas las Sucursales</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleOpenNewUsuario}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Dar de Alta Nuevo Usuario</span>
            </button>
          </div>

          {/* Usuarios Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Correo Institucional</th>
                    <th className="py-3 px-4">Puesto / Rol</th>
                    <th className="py-3 px-4">Sucursal Asignada</th>
                    <th className="py-3 px-4 text-center">Alcance</th>
                    <th className="py-3 px-4">Módulos & Permisos</th>
                    <th className="py-3 px-4 text-center">Estatus</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No se encontraron usuarios con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsuarios.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {usr.avatarInitials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{usr.name}</div>
                              {usr.telefono && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Tel: {usr.telefono}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600 font-mono text-[11px]">
                          {usr.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-0.5 rounded-lg text-[10px]">
                            {usr.roleLabel || usr.puesto}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{usr.branch}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              usr.branchScope === 'ALL'
                                ? 'bg-amber-100 text-amber-900 font-black'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {usr.branchScope === 'ALL' ? 'GLOBAL (ALL)' : 'SUCURSAL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            <div className="flex items-center gap-1 flex-wrap">
                              {usr.role === 'ADMINISTRADOR' ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white shadow-2xs">
                                  Acceso Total (10 Módulos)
                                </span>
                              ) : usr.allowedModules && usr.allowedModules.length > 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                  {usr.allowedModules.length} Módulos Activos
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Por defecto del rol</span>
                              )}
                            </div>
                            {usr.permissions && (
                              <div className="flex items-center gap-1 flex-wrap text-[9px] font-mono">
                                {usr.permissions.canApproveLoans && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200" title="Mesa de Crédito">
                                    Aprobador
                                  </span>
                                )}
                                {usr.permissions.canDisperseSPEI && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200" title="Dispersión SPEI STP">
                                    SPEI STP
                                  </span>
                                )}
                                {usr.permissions.canViewPayroll && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200" title="Ver Nóminas RH">
                                    Nómina RH
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleUsuario(usr)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 mx-auto ${
                              usr.estatus === 'ACTIVO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title="Clic para cambiar estatus"
                          >
                            <Power className="w-3 h-3" />
                            <span>{usr.estatus}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditUsuario(usr)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition"
                              title="Editar usuario o reasignar sucursal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUsuario(usr)}
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg transition"
                              title="Quitar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUBMÓDULO DE MATRIZ DE ROLES & PERMISOS */}
      {/* ========================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Matriz Institucional de Roles y Permisos de Módulos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reglas de acceso por perfil, alcance geográfico (Global vs Sucursal) y capacidades operativas de riesgo.
              </p>
            </div>
            <button
              onClick={handleOpenNewUsuario}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Usuario con Rol</span>
            </button>
          </div>

          {/* Matrix Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Rol Institucional</th>
                    <th className="py-3.5 px-4 text-center">Alcance Sucursal</th>
                    <th className="py-3.5 px-4">Módulos Asignados por Defecto</th>
                    <th className="py-3.5 px-3 text-center">Aprobar Crédito</th>
                    <th className="py-3.5 px-3 text-center">Dispersar SPEI</th>
                    <th className="py-3.5 px-3 text-center">Editar Reglas</th>
                    <th className="py-3.5 px-3 text-center">Ver Nómina RH</th>
                    <th className="py-3.5 px-3 text-center">Exportar Excel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {ROLE_OPTIONS.map((opt) => {
                    const defaults = DEFAULT_ROLE_PERMISSIONS[opt.role];
                    const perms = defaults?.permissions;
                    const mods = defaults?.allowedModules || [];

                    return (
                      <tr key={opt.role} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200/60">
                              {opt.role.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{opt.label}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{opt.role}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              opt.defaultScope === 'ALL'
                                ? 'bg-amber-100 text-amber-900 font-black'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.defaultScope === 'ALL' ? 'GLOBAL (ALL)' : 'SUCURSAL'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {opt.role === 'ADMINISTRADOR' ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                                Acceso Total (10 Módulos)
                              </span>
                            ) : (
                              <>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                  {mods.length} Módulos
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium truncate">
                                  {mods.slice(0, 3).join(', ')}...
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {perms?.canApproveLoans ? (
                            <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {perms?.canDisperseSPEI ? (
                            <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {perms?.canEditRules ? (
                            <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {perms?.canViewPayroll ? (
                            <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {perms?.canExportData ? (
                            <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                              <X className="w-3 h-3" />
                            </span>
                          )}
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

      {/* ========================================================= */}
      {/* MODAL: SUCURSAL (ALTA Y EDICIÓN) */}
      {/* ========================================================= */}
      {isSucursalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingSucursal ? 'Editar Sucursal' : 'Dar de Alta Nueva Sucursal'}
                </h3>
              </div>
              <button
                onClick={() => setIsSucursalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSucursal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clave de Sucursal *</label>
                  <input
                    type="text"
                    value={sucursalClave}
                    onChange={(e) => setSucursalClave(e.target.value)}
                    placeholder="ej. SUC-006"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estatus Inicial</label>
                  <select
                    value={sucursalEstatus}
                    onChange={(e) => setSucursalEstatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="INACTIVA">INACTIVA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre de la Sucursal *</label>
                <input
                  type="text"
                  value={sucursalNombre}
                  onChange={(e) => setSucursalNombre(e.target.value)}
                  placeholder="ej. Saltillo Poniente, Monclova Centro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección Completa</label>
                <input
                  type="text"
                  value={sucursalDireccion}
                  onChange={(e) => setSucursalDireccion(e.target.value)}
                  placeholder="Calle, número, colonia, referencias..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={sucursalCiudad}
                    onChange={(e) => setSucursalCiudad(e.target.value)}
                    placeholder="Saltillo, Torreón, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado</label>
                  <input
                    type="text"
                    value={sucursalEstado}
                    onChange={(e) => setSucursalEstado(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={sucursalTelefono}
                    onChange={(e) => setSucursalTelefono(e.target.value)}
                    placeholder="844 123 4567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsable / Encargado</label>
                  <input
                    type="text"
                    value={sucursalResponsable}
                    onChange={(e) => setSucursalResponsable(e.target.value)}
                    placeholder="Nombre del Gerente"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSucursalModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {editingSucursal ? 'Guardar Cambios' : 'Registrar Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: USUARIO (ALTA, EDICIÓN Y ASIGNACIÓN DE SUCURSAL & PERMISOS) */}
      {/* ========================================================= */}
      {isUsuarioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 border border-slate-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingUsuario ? 'Editar Usuario y Permisos de Módulos' : 'Dar de Alta Nuevo Usuario con Credenciales'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Definición de perfil, asignación de sucursal, contraseña y matriz granular de accesos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUsuarioModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUsuario} className="space-y-4 text-xs">
              {/* Información Personal y Credenciales */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Datos de Acceso y Credenciales</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={usuarioName}
                    onChange={(e) => setUsuarioName(e.target.value)}
                    placeholder="ej. MARÍA FERNANDA RÍOS"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Correo Institucional *</label>
                    <input
                      type="email"
                      value={usuarioEmail}
                      onChange={(e) => setUsuarioEmail(e.target.value)}
                      placeholder="usuario@lanahora.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contraseña de Acceso *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={usuarioPassword}
                        onChange={(e) => setUsuarioPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Teléfono Celular / WhatsApp</label>
                    <input
                      type="text"
                      value={usuarioTelefono}
                      onChange={(e) => setUsuarioTelefono(e.target.value)}
                      placeholder="844 555 1234"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estatus del Usuario</label>
                    <select
                      value={usuarioEstatus}
                      onChange={(e) => setUsuarioEstatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ACTIVO">ACTIVO (Acceso Autorizado)</option>
                      <option value="INACTIVO">INACTIVO (Acceso Bloqueado)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rol Institucional y Sucursal */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rol Operativo y Sucursal Asignada</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rol Institucional *</label>
                    <select
                      value={usuarioRole}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.role} value={opt.role}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Puesto Personalizado</label>
                    <input
                      type="text"
                      value={usuarioPuesto}
                      onChange={(e) => setUsuarioPuesto(e.target.value)}
                      placeholder="Puesto o cargo"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>

                {/* ASIGNACIÓN DE SUCURSAL DINÁMICA */}
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                  <label className="block font-bold text-blue-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Sucursal Base Asignada *</span>
                  </label>
                  <select
                    value={usuarioBranch}
                    onChange={(e) => setUsuarioBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre} ({s.clave}) {s.estatus === 'INACTIVA' ? '— [Inactiva]' : ''}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-600 font-semibold">Alcance Operativo:</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-slate-700 font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="branchScope"
                          checked={usuarioBranchScope === 'BRANCH'}
                          onChange={() => setUsuarioBranchScope('BRANCH')}
                          className="text-blue-600"
                        />
                        <span>Solo Sucursal ({usuarioBranch || 'Asignada'})</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-700 font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="branchScope"
                          checked={usuarioBranchScope === 'ALL'}
                          onChange={() => setUsuarioBranchScope('ALL')}
                          className="text-blue-600"
                        />
                        <span>Global (Todas las Sucursales)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ASIGNACIÓN GRANULAR DE MÓDULOS */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                      Módulos Permitidos en Plataforma
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                      {usuarioAllowedModules.length} de {ALL_SYSTEM_MODULES.length} activos
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllModules}
                      className="px-2.5 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 rounded-lg transition border border-blue-200"
                    >
                      Marcar Todos
                    </button>
                    <button
                      type="button"
                      onClick={handleResetModulesToDefault}
                      className="px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition border border-slate-200"
                    >
                      Por Defecto ({usuarioRole.slice(0, 8)})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ALL_SYSTEM_MODULES.map((mod) => {
                    const isChecked = usuarioAllowedModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-blue-50/80 border-blue-300 text-slate-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleModule(mod.id)}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate">{mod.name}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold bg-slate-200/70 text-slate-600 shrink-0">
                              {mod.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{mod.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* CAPACIDADES Y PERMISOS DE RIESGO */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                    Permisos de Riesgo y Operación Crítica
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      usuarioPermissions.canApproveLoans
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={usuarioPermissions.canApproveLoans}
                      onChange={() => handleTogglePermission('canApproveLoans')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs">Aprobación de Créditos</div>
                      <div className="text-[10px] text-slate-500">Mesa de control, validación de buró y dictamen.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      usuarioPermissions.canDisperseSPEI
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={usuarioPermissions.canDisperseSPEI}
                      onChange={() => handleTogglePermission('canDisperseSPEI')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs">Dispersión SPEI STP</div>
                      <div className="text-[10px] text-slate-500">Envío masivo o individual de fondeo bancario.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      usuarioPermissions.canEditRules
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={usuarioPermissions.canEditRules}
                      onChange={() => handleTogglePermission('canEditRules')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs">Editar Reglas y Bonificaciones</div>
                      <div className="text-[10px] text-slate-500">Modificar tablas de comisiones, plazos y seguros.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      usuarioPermissions.canManageUsers
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={usuarioPermissions.canManageUsers}
                      onChange={() => handleTogglePermission('canManageUsers')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs">Gestión de Usuarios y Roles</div>
                      <div className="text-[10px] text-slate-500">Crear cuentas, cambiar roles y resetear accesos.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      usuarioPermissions.canViewPayroll
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={usuarioPermissions.canViewPayroll}
                      onChange={() => handleTogglePermission('canViewPayroll')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs">Nómina y Comisiones RH</div>
                      <div className="text-[10px] text-slate-500">Acceso a tabuladores de sueldo y comisiones de asesores.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      usuarioPermissions.canExportData
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={usuarioPermissions.canExportData}
                      onChange={() => handleTogglePermission('canExportData')}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs">Exportación Contable y Reportes</div>
                      <div className="text-[10px] text-slate-500">Descarga masiva de carteras, pólizas y pagos en Excel.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUsuarioModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingUsuario ? 'Guardar Cambios de Usuario' : 'Registrar Nuevo Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

