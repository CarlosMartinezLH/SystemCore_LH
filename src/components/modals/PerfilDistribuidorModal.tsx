'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DistribuidorCore, NotaClienteCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  X,
  Search,
  Pencil,
  CheckCircle2,
  Printer,
  FileText,
  Clock,
  RefreshCw,
  CreditCard,
  ShoppingBag,
  DollarSign,
  UserCheck,
  Building,
  Phone,
  MapPin,
  AlertTriangle,
  FileCheck,
  Tag,
  ShieldCheck,
  Award,
  SlidersHorizontal,
  Briefcase,
  Layers,
  Send,
  Download,
  Receipt,
  ExternalLink,
  Scissors,
  Coins,
  FolderOpen,
} from 'lucide-react';
import EstadoCuentaDistribuidorModal from './EstadoCuentaDistribuidorModal';
import RecibosRelacionModal from './RecibosRelacionModal';
import ContratoAperturaModal from './ContratoAperturaModal';
import CarteraDistribuidorModal from './CarteraDistribuidorModal';
import HistorialCreditosDistribuidorModal from './HistorialCreditosDistribuidorModal';
import CreditoPersonaDVModal from './CreditoPersonaDVModal';
import LanaPuntosModal from './LanaPuntosModal';
import AuditoriaDistribuidorModal from './AuditoriaDistribuidorModal';
import ExpedienteDistribuidorModal from './ExpedienteDistribuidorModal';
import AutorizarIngresoAppModal from './AutorizarIngresoAppModal';

interface PerfilDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  initialTab?: 'detalle' | 'opciones' | 'notas';
  onSelectDv?: (noDist: number) => void;
  onOpenCartera?: (distribuidor: DistribuidorCore) => void;
  onOpenRelacion?: (distribuidor: DistribuidorCore) => void;
  onOpenEstadoCuenta?: (distribuidor: DistribuidorCore) => void;
  onOpenCastigo?: (distribuidor: DistribuidorCore) => void;
}

export default function PerfilDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
  initialTab = 'detalle',
  onSelectDv,
  onOpenCartera,
  onOpenRelacion,
  onOpenEstadoCuenta,
  onOpenCastigo,
}: PerfilDistribuidorModalProps) {
  const { distribuidores, updateDistribuidor } = useCoreSync();

  const [activeTab, setActiveTab] = useState<'detalle' | 'opciones' | 'notas'>(initialTab || 'detalle');
  const [isCarteraModalOpen, setIsCarteraModalOpen] = useState(false);
  const [currentDv, setCurrentDv] = useState<DistribuidorCore>(distribuidor);
  const [isEditing, setIsEditing] = useState(false);
  const [isEstadoCuentaModalOpen, setIsEstadoCuentaModalOpen] = useState(false);
  const [isRecibosModalOpen, setIsRecibosModalOpen] = useState(false);
  const [isContratoModalOpen, setIsContratoModalOpen] = useState(false);
  const [isHistorialCreditosOpen, setIsHistorialCreditosOpen] = useState(false);
  const [isCreditoPersonalModalOpen, setIsCreditoPersonalModalOpen] = useState(false);
  const [isLanaPuntosModalOpen, setIsLanaPuntosModalOpen] = useState(false);
  const [isAuditoriaModalOpen, setIsAuditoriaModalOpen] = useState(false);
  const [isExpedienteModalOpen, setIsExpedienteModalOpen] = useState(false);
  const [isAutIngresoAppModalOpen, setIsAutIngresoAppModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DistribuidorCore>>({});
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);


  // Notas internas de la distribuidora
  const [internalNotes, setInternalNotes] = useState<NotaClienteCore[]>([
    {
      id: 'note-dv-1',
      text: 'Distribuidora clasificada como AAA con excelente historial de cobranza y cumplimiento.',
      date: '12/11/2026 10:30',
      author: 'Lic. Sandra Morales',
      authorRole: 'Mesa de Control',
      modulo: 'Crédito y Cartera',
      avatarInitials: 'SM',
    },
    {
      id: 'note-dv-2',
      text: 'Línea de crédito incrementada a $195,000.00 autorizada por Gerencia de Operaciones.',
      date: '28/09/2026 16:45',
      author: 'Carlos Martínez Mayorga',
      authorRole: 'Dirección General',
      modulo: 'Mesa de Crédito',
      avatarInitials: 'CM',
    },
  ]);
  const [noteInput, setNoteInput] = useState('');

  // Control de apertura y distribuidor para evitar resetear activeTab en cada actualización o polling
  const prevOpenRef = useRef<boolean>(false);
  const prevDistNoRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      return;
    }

    const isNewOpen = !prevOpenRef.current;
    const isNewDist = prevDistNoRef.current !== distribuidor?.noDist;

    if (distribuidor && (isNewOpen || isNewDist)) {
      prevOpenRef.current = true;
      prevDistNoRef.current = distribuidor.noDist;

      setActiveTab(initialTab || 'detalle');
      setCurrentDv(distribuidor);
      setFormData(distribuidor);
    }
  }, [isOpen, distribuidor, initialTab]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleSaveData = () => {
    const updated: DistribuidorCore = {
      ...currentDv,
      ...formData,
    };
    setCurrentDv(updated);
    updateDistribuidor(updated);
    setIsEditing(false);
    showToast(`Datos de DV #${updated.noDist} guardados exitosamente.`);
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const newNote: NotaClienteCore = {
      id: `note-${Date.now()}`,
      text: noteInput.trim(),
      date: new Date().toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      author: 'Usuario Sistema',
      authorRole: 'Mesa de Control',
      modulo: 'Distribuidores',
      avatarInitials: 'US',
    };
    setInternalNotes([newNote, ...internalNotes]);
    setNoteInput('');
    showToast('Nota registrada en la bitácora.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl xl:max-w-7xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        {/* Header Superior del Modal (IDÉNTICO a EditarClienteModal) */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/lanahora-logo-transparent.png"
              alt="LanAhora"
              className="h-7 w-auto object-contain"
            />
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                {currentDv.nombreDistribuidor}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                DV #{currentDv.noDist}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 shadow-2xs ${
                  currentDv.estatus === 'ACTIVO'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentDv.estatus === 'REESTRUCTURA'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span className="font-mono font-black">{currentDv.estatus}</span>
                <span className="font-semibold">· {currentDv.nivel}</span>
              </span>
            </div>
          </div>

          {/* Segmented Tabs Switcher (IDÉNTICO a EditarClienteModal) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-300/60 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('detalle')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'detalle'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Detalle & Datos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('opciones')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'opciones'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Opciones & Operación</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notas')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'notas'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Bitácora & Notas</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación Toast */}
        {noticeMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>✓ {noticeMessage}</span>
            <button onClick={() => setNoticeMessage(null)} className="text-emerald-700 font-black cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Contenido con scroll dinámico según pestaña activa */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs bg-[#f8fafc]">
          {/* TAB 1: DETALLE & DATOS */}
          {activeTab === 'detalle' && (
            <div className="space-y-4">
              {/* Tarjetas de Resumen Financiero Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Línea de Crédito</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ${currentDv.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Saldo Actual</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ${(currentDv.saldoActual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Disponible</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">
                    ${currentDv.disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">Vales Activos</span>
                  <span className="text-base font-extrabold text-blue-700 font-mono">
                    {currentDv.valesActivos || 32}
                  </span>
                </div>
              </div>

              {/* Accesos Rápidos Principales: Cartera de Clientes, Estado de Cuenta y Talones de Pago */}
              <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-1">
                  Módulos de Distribuidor:
                </span>
                <button
                  type="button"
                  onClick={() => { if (onOpenCartera) onOpenCartera(currentDv); else setIsCarteraModalOpen(true); }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 border border-emerald-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ver Cartera de Clientes ({currentDv.valesActivos || 32} vales)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEstadoCuentaModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs inline-flex items-center gap-1.5 border border-blue-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-700" />
                  <span>Generar Estado de Cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecibosModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs inline-flex items-center gap-1.5 border border-purple-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-purple-700" />
                  <span>Talones de Pago (Relación Recibos)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsContratoModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs inline-flex items-center gap-1.5 border border-amber-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Contrato de Apertura</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('opciones')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 border border-slate-200 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  <span>Opciones & Operación</span>
                </button>
              </div>

              {/* Formulario Estructurado en 3 Tarjetas Modernas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Tarjeta 1: Información de Distribución */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Datos de Distribución</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Nombre Distribuidor:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.nombreDistribuidor || '' : currentDv.nombreDistribuidor}
                      onChange={(e) => setFormData({ ...formData, nombreDistribuidor: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold text-slate-900 ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">No. Dist:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.noDist}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Contrato ID:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.contratoId || 2606}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Estatus:</label>
                      <select
                        disabled={!isEditing}
                        value={isEditing ? formData.estatus || currentDv.estatus : currentDv.estatus}
                        onChange={(e) => setFormData({ ...formData, estatus: e.target.value as any })}
                        className={`w-full px-2 py-1.5 border rounded-lg text-xs font-bold ${
                          isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                        } text-slate-800`}
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="CANCELADO">CANCELADO</option>
                        <option value="REESTRUCTURA">REESTRUCTURA</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Nivel:</label>
                      <select
                        disabled={!isEditing}
                        value={isEditing ? formData.nivel || currentDv.nivel : currentDv.nivel}
                        onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                        className={`w-full px-2 py-1.5 border rounded-lg text-xs font-bold ${
                          isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                        } text-slate-800`}
                      >
                        <option value="BRONCE">BRONCE</option>
                        <option value="PLATA">PLATA</option>
                        <option value="ORO">ORO</option>
                        <option value="DIAMANTE">DIAMANTE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Perfil Operativo:</label>
                    <select
                      disabled={!isEditing}
                      value={isEditing ? formData.perfil || currentDv.perfil : currentDv.perfil || 'Distribuidor AAA'}
                      onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                      className={`w-full px-2 py-1.5 border rounded-lg text-xs ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    >
                      <option value="Distribuidor AAA">Distribuidor AAA</option>
                      <option value="Distribuidor AA">Distribuidor AA</option>
                      <option value="Distribuidor A">Distribuidor A</option>
                    </select>
                  </div>
                </div>

                {/* Tarjeta 2: Red Territorial & Coordinación */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Red Territorial & Asignación</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Coordinador:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.coordinador || '' : currentDv.coordinador}
                      onChange={(e) => setFormData({ ...formData, coordinador: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Sucursal:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.sucursal || '' : currentDv.sucursal}
                      onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Zona:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.zona || currentDv.zonaId || '-'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Subzona:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.subzona || currentDv.subzonaId || '-'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Gestor:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.gestor || '0'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Promotor:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.promotor || 'SIN PROMOTOR'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-700 text-center truncate"
                      />
                    </div>
                  </div>
                </div>

                {/* Tarjeta 3: Contacto & Domicilio */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Contacto & Domicilio</span>
                  </h3>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Dirección:</label>
                    <textarea
                      rows={2}
                      disabled={!isEditing}
                      value={isEditing ? formData.direccion || '' : currentDv.direccion || 'PRIV FRANCISCO HERRERA GARZA 115 , CP. 25015, FUNDADORES, SALTILLO'}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Teléfono Móvil:</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.telefono || '' : currentDv.telefono || '8444101285'}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono ${
                        isEditing ? 'bg-white border-blue-500' : 'bg-slate-50 border-slate-200'
                      } text-slate-800`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">CURP:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.curp || 'MACE750312MCO'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 truncate"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">LanaApp:</label>
                      <input
                        type="text"
                        disabled
                        value={currentDv.tieneLanaApp ? 'ACTIVA' : 'INACTIVA'}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-100 text-center text-emerald-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Validación Institucional & Acciones de Guardado */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-wrap text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Usuario Valida:</span>{' '}
                    <strong className="text-slate-900">{currentDv.usuarioValida || 'Sistema'}</strong>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-slate-500 font-medium">Fecha Validación:</span>{' '}
                    <strong className="text-slate-900 font-mono">{currentDv.fechaValidacion || '02/04/2023 16:41:26'}</strong>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-slate-500 font-medium">Consolidación:</span>{' '}
                    <span className="text-slate-600 font-medium">{currentDv.usuarioConsolida || 'NO VALIDADO AÚN'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsContratoModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Validar Contrato</span>
                  </button>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Modificar Datos</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveData}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Guardar Cambios</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPCIONES & OPERACIÓN (Agrupadas en 4 tarjetas de alto nivel) */}
          {activeTab === 'opciones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tarjeta 1: Cobranza & Documentos */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Documentos Oficiales & Cobranza
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenRelacion) onOpenRelacion(currentDv);
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Relación de Cobranza</span>
                    <span className="text-[10px] text-slate-500">Hoja quincenal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEstadoCuentaModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Estado de Cuenta</span>
                    <span className="text-[10px] text-slate-500">Reporte con descuentos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecibosModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Recibos de Relación</span>
                    <span className="text-[10px] text-slate-500">Talones de pago quincenales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsContratoModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs">Contrato de Apertura</span>
                    <span className="text-[10px] text-slate-500">Expediente legal completo</span>
                  </button>
                </div>
              </div>

              {/* Tarjeta 2: Cartera & Créditos */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Cartera, Líneas & Créditos
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { if (onOpenCartera) onOpenCartera(currentDv); else setIsCarteraModalOpen(true); }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Cartera de Clientes</span>
                    <span className="text-[10px] text-slate-500">Detalle de vales emitidos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHistorialCreditosOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Historial Créditos</span>
                    <span className="text-[10px] text-slate-500">Amortizaciones y pagos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCreditoPersonalModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">Crédito Personal DV</span>
                    <span className="text-[10px] text-slate-500">Préstamo directo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLanaPuntosModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 hover:text-amber-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs">LanaPuntos</span>
                    <span className="text-[10px] text-slate-500">Monedero y bonificaciones</span>
                  </button>
                </div>
              </div>

              {/* Tarjeta 3: Supervisión & Auditoría */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Supervisión & Auditoría
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAuditoriaModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Auditar & Recalcular</span>
                    <span className="text-[10px] text-slate-500">Conciliación de cartera y saldos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExpedienteModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Expediente Digital</span>
                    <span className="text-[10px] text-slate-500">Documentos, contratos y anexos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAutIngresoAppModalOpen(true)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Aut. Ingreso APP</span>
                    <span className="text-[10px] text-slate-500">Resetear acceso móvil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Cuestionario de visita ocular cargado.')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-purple-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Building className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs">Encuesta Visita Ocular</span>
                    <span className="text-[10px] text-slate-500">Cotejo domiciliario</span>
                  </button>
                </div>
              </div>

              {/* Tarjeta 4: Canales & Gestión Operativa */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Convenios & Gestión Operativa
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCastigo) onOpenCastigo(currentDv);
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 hover:text-amber-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs">Convenio / Castigo</span>
                    <span className="text-[10px] text-slate-500">Levantar penalización</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Abriendo cálculo de crédito personalizado...')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 hover:text-amber-900 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs">Crédito Personalizado</span>
                    <span className="text-[10px] text-slate-500">Esquema especial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const gestor = prompt('Ingrese nuevo gestor asignado:', currentDv.gestor || '0');
                      if (gestor !== null) {
                        const up = { ...currentDv, gestor };
                        setCurrentDv(up);
                        updateDistribuidor(up);
                        showToast(`Gestor actualizado a: ${gestor}`);
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <UserCheck className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-xs">Cambiar Gestor</span>
                    <span className="text-[10px] text-slate-500">Reasignar cobrador</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const coord = prompt('Ingrese nuevo coordinador asignado:', currentDv.coordinador);
                      if (coord !== null) {
                        const up = { ...currentDv, coordinador: coord };
                        setCurrentDv(up);
                        updateDistribuidor(up);
                        showToast(`Coordinador actualizado a: ${coord}`);
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Award className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-xs">Cambiar Coordinador</span>
                    <span className="text-[10px] text-slate-500">Reasignar cartera</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BITÁCORA & NOTAS (IDÉNTICO a EditarClienteModal) */}
          {activeTab === 'notas' && (
            <div className="space-y-4">
              {/* Formulario de Agregar Nota */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Registrar Nueva Nota Interna</span>
                </h3>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Escriba comentarios sobre acuerdos, pagos, llamadas o incidencias de la distribuidora..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>

              {/* Lista de Notas Históricas */}
              <div className="space-y-2">
                {internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200 font-mono">
                      {note.avatarInitials}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{note.author}</span>
                          <span className="text-[10px] text-slate-500 font-medium">({note.authorRole})</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {note.modulo}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{note.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-normal leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Independiente de Estado de Cuenta Imprimible */}
      {isEstadoCuentaModalOpen && (
        <EstadoCuentaDistribuidorModal
          isOpen={isEstadoCuentaModalOpen}
          onClose={() => setIsEstadoCuentaModalOpen(false)}
          distribuidor={currentDv}
        />
      )}

      {/* Modal Oficial de Relación de Recibos / Talones de Pago */}
      {isRecibosModalOpen && (
        <RecibosRelacionModal
          isOpen={isRecibosModalOpen}
          onClose={() => setIsRecibosModalOpen(false)}
          distribuidor={currentDv}
        />
      )}

      {/* Modal Oficial de Contrato de Apertura de Crédito */}
      {isContratoModalOpen && (
        <ContratoAperturaModal
          isOpen={isContratoModalOpen}
          onClose={() => setIsContratoModalOpen(false)}
          distribuidor={currentDv}
        />
      )}

      {/* Modal Oficial de Cartera de Clientes */}
      {isCarteraModalOpen && (
        <CarteraDistribuidorModal
          isOpen={isCarteraModalOpen}
          onClose={() => setIsCarteraModalOpen(false)}
          distribuidor={currentDv}
        />
      )}

      {/* Modal Oficial de Historial de Créditos */}
      {isHistorialCreditosOpen && (
        <HistorialCreditosDistribuidorModal
          isOpen={isHistorialCreditosOpen}
          onClose={() => setIsHistorialCreditosOpen(false)}
          distribuidor={currentDv}
        />
      )}

      {/* Modal Oficial de Crédito Personal DV (Préstamo Directo 8 y 10 Quincenas) */}
      {isCreditoPersonalModalOpen && (
        <CreditoPersonaDVModal
          isOpen={isCreditoPersonalModalOpen}
          onClose={() => setIsCreditoPersonalModalOpen(false)}
          distribuidor={currentDv}
          onCreditoGenerado={(nuevoCredito) => {
            const dispActual = currentDv.disponiblePersonal ?? (currentDv.lineaPersonal ? currentDv.lineaPersonal * 0.5 : 10000);
            const nuevoDisponible = Math.max(0, dispActual - nuevoCredito.capital);
            const updated: DistribuidorCore = {
              ...currentDv,
              disponiblePersonal: nuevoDisponible,
            };
            setCurrentDv(updated);
            if (updateDistribuidor) {
              updateDistribuidor(updated);
            }
            showToast(`Crédito Personal #${nuevoCredito.creditoId} generado exitosamente por $${nuevoCredito.capital.toLocaleString('es-MX')} a ${nuevoCredito.plazos} quincenas`);
          }}
        />
      )}

      {/* Modal Oficial de Monedero / LanaPuntos */}
      {isLanaPuntosModalOpen && (
        <LanaPuntosModal
          isOpen={isLanaPuntosModalOpen}
          onClose={() => setIsLanaPuntosModalOpen(false)}
          distribuidor={currentDv}
        />
      )}

      {/* Modal Oficial de Auditoría & Recálculo de Cartera */}
      {isAuditoriaModalOpen && (
        <AuditoriaDistribuidorModal
          isOpen={isAuditoriaModalOpen}
          onClose={() => setIsAuditoriaModalOpen(false)}
          distribuidor={currentDv}
          onAuditoriaCompletada={(res) => {
            showToast(`Auditoría finalizada: Cartera y disponible conciliados al 100%`);
          }}
        />
      )}

      {/* Modal Oficial de Expediente Digital de la Distribuidora */}
      {isExpedienteModalOpen && (
        <ExpedienteDistribuidorModal
          isOpen={isExpedienteModalOpen}
          onClose={() => setIsExpedienteModalOpen(false)}
          distribuidor={currentDv}
          onOpenContratoApertura={() => {
            setIsExpedienteModalOpen(false);
            setIsContratoModalOpen(true);
          }}
        />
      )}

      {/* Modal Oficial de Autorizar Ingreso APP / Resetear Acceso Móvil */}
      {isAutIngresoAppModalOpen && (
        <AutorizarIngresoAppModal
          isOpen={isAutIngresoAppModalOpen}
          onClose={() => setIsAutIngresoAppModalOpen(false)}
          distribuidor={currentDv}
          onAccesoReseteado={(res) => {
            const updated = { ...currentDv, tieneLanaApp: true };
            setCurrentDv(updated);
            updateDistribuidor(updated);
            setInternalNotes((prev) => [
              {
                id: `note-app-${Date.now()}`,
                text: `Acceso a LanaApp reseteado y autorizado (Folio ${res.folio}). Dispositivo previo desvinculado. Resultado: OK.`,
                date: res.fecha,
                author: 'Sistema / Operaciones',
                authorRole: 'Mesa de Control',
                modulo: 'LanaApp Móvil',
                avatarInitials: 'AP',
              },
              ...prev,
            ]);
            showToast(`Acceso a LanaApp reseteado (Resultado: OK)`);
          }}
        />
      )}
    </div>
  );
}
