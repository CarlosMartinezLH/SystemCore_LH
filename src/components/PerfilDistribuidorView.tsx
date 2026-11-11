'use client';

import React, { useState } from 'react';
import { DistribuidorCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  Search,
  Edit,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  UserCheck,
  CreditCard,
  ShoppingBag,
  Award,
  ShieldCheck,
  Lock,
  Phone,
  MapPin,
  Calendar,
  Building,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import RelacionCobranzaModal from './modals/RelacionCobranzaModal';
import { EstadoCuentaModal, MensajesMasivosModal, QuitarCastigoModal } from './modals/DistribuidorModals';

interface PerfilDistribuidorViewProps {
  distribuidor?: DistribuidorCore | null;
  onBack?: () => void;
  onNavigateToGestoria?: () => void;
}

export default function PerfilDistribuidorView({
  distribuidor,
  onBack,
  onNavigateToGestoria,
}: PerfilDistribuidorViewProps) {
  const { distribuidores, updateDistribuidor } = useCoreSync();

  const defaultDv = distribuidores.find((d) => d.noDist === 1053) || distribuidores[0];
  const [currentDv, setCurrentDv] = useState<DistribuidorCore>(distribuidor || defaultDv);

  const [searchDvNumber, setSearchDvNumber] = useState<string>(currentDv.noDist.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [editedDv, setEditedDv] = useState<DistribuidorCore>(currentDv);

  // Modals state
  const [isRelacionOpen, setIsRelacionOpen] = useState(false);
  const [isEstadoCuentaOpen, setIsEstadoCuentaOpen] = useState(false);
  const [isMensajesOpen, setIsMensajesOpen] = useState(false);
  const [isCastigoOpen, setIsCastigoOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  const handleLookupDv = () => {
    const num = parseInt(searchDvNumber.trim(), 10);
    if (isNaN(num)) return;
    const found = distribuidores.find((d) => d.noDist === num);
    if (found) {
      setCurrentDv(found);
      setEditedDv(found);
      setActiveNotice(`Distribuidora #${found.noDist} cargada correctamente.`);
      setTimeout(() => setActiveNotice(null), 3000);
    } else {
      alert(`No se encontró distribuidora con el número #${num}.`);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentDv(editedDv);
    updateDistribuidor(editedDv);
    setIsEditing(false);
    setActiveNotice(`Datos de la distribuidora #${editedDv.noDist} actualizados con éxito.`);
    setTimeout(() => setActiveNotice(null), 3000);
  };

  const handleActionClick = (actionName: string) => {
    if (actionName === 'Relación') {
      setIsRelacionOpen(true);
    } else if (actionName === 'Estado de Cuenta') {
      setIsEstadoCuentaOpen(true);
    } else if (actionName === 'Notas') {
      if (onNavigateToGestoria) {
        onNavigateToGestoria();
      } else {
        setActiveNotice(`Abriendo notas de gestoría para DV #${currentDv.noDist}...`);
        setTimeout(() => setActiveNotice(null), 3000);
      }
    } else if (actionName === 'Contrato' || actionName === 'Recibos de Relación') {
      setIsRelacionOpen(true);
    } else if (actionName === 'Convenio' || actionName === 'Quitar Castigo') {
      setIsCastigoOpen(true);
    } else {
      setActiveNotice(`Opción "${actionName}" ejecutada para DV #${currentDv.noDist} (${currentDv.nombreDistribuidor}).`);
      setTimeout(() => setActiveNotice(null), 3500);
    }
  };

  return (
    <div className="w-full p-4 lg:p-8 space-y-6 bg-[#f8fafc] min-h-[calc(100vh-60px)] font-sans">
      {/* 1. Header de Navegación & Lookup */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a Cartera</span>
            </button>
          )}
          <div>
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Perfil del Distribuidor
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Expediente central, líneas autorizadas, validaciones y opciones operativas
            </p>
          </div>
        </div>

        {/* Buscador Rápido de DV */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Buscar DV:</span>
          <div className="flex items-center">
            <input
              type="number"
              value={searchDvNumber}
              onChange={(e) => setSearchDvNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookupDv()}
              className="w-28 px-3 py-2 rounded-l-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="Ej. 1053"
            />
            <button
              onClick={handleLookupDv}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-r-xl text-xs font-bold transition flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Notificación Rápida */}
      {activeNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <span>✓ {activeNotice}</span>
          <button onClick={() => setActiveNotice(null)} className="text-emerald-700 font-black">
            ✕
          </button>
        </div>
      )}

      {/* 2. Hero Card de la Distribuidora */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            {currentDv.nombreDistribuidor.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {currentDv.nombreDistribuidor}
              </h2>
              <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                DV #{currentDv.noDist}
              </span>
              <span className="font-bold text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {currentDv.estatus}
              </span>
              <span className="font-bold text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                Nivel {currentDv.nivel}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Contrato #{currentDv.contratoId || 520} · Coordinador: <strong>{currentDv.coordinador}</strong> · Sucursal: <strong>{currentDv.sucursal}</strong>
            </p>
          </div>
        </div>

        {/* Resumen Financiero de Líneas en Píldoras */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left min-w-[130px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Línea de Crédito
            </span>
            <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
              ${currentDv.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-left min-w-[130px]">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Disponible Vales
            </span>
            <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
              ${currentDv.disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-left min-w-[130px]">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              LanaPuntos
            </span>
            <span className="text-base font-black text-blue-800 font-mono mt-0.5 block">
              {(currentDv.lanapuntos || 41125).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Botón Principal: Relación de Cobranza */}
          <button
            onClick={() => setIsRelacionOpen(true)}
            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95"
            title="Emitir relación de cobranza oficial del corte"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Relación de Cobranza</span>
          </button>
        </div>
      </div>

      {/* 3. Grid de Dos Columnas: Formulario de Datos + Centro de Operaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda (8 cols): Datos Generales & Validación */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Datos Generales */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Datos Generales & Asignación de Cartera
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>Modificar Datos</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditedDv(currentDv);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={isEditing ? editedDv.nombreDistribuidor : currentDv.nombreDistribuidor}
                  onChange={(e) => setEditedDv({ ...editedDv, nombreDistribuidor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:bg-slate-50/60 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">No. Distribuidor (DV)</label>
                <input
                  type="text"
                  disabled
                  value={`DV #${currentDv.noDist}`}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Contrato ID</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={isEditing ? (editedDv.contratoId || 520) : (currentDv.contratoId || 520)}
                  onChange={(e) => setEditedDv({ ...editedDv, contratoId: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Línea de Crédito Principal</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={
                    isEditing
                      ? editedDv.creditoLimite
                      : `$${currentDv.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                  }
                  onChange={(e) => setEditedDv({ ...editedDv, creditoLimite: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Línea Adicional</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={
                    isEditing
                      ? (editedDv.lineaAdicional || 15000)
                      : `$${(currentDv.lineaAdicional || 15000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                  }
                  onChange={(e) => setEditedDv({ ...editedDv, lineaAdicional: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nivel</label>
                <select
                  disabled={!isEditing}
                  value={isEditing ? editedDv.nivel : currentDv.nivel}
                  onChange={(e) => setEditedDv({ ...editedDv, nivel: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs"
                >
                  <option value="BRONCE">BRONCE</option>
                  <option value="PLATA">PLATA</option>
                  <option value="ORO">ORO</option>
                  <option value="DIAMANTE">DIAMANTE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Coordinador Asignado</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={isEditing ? editedDv.coordinador : currentDv.coordinador}
                  onChange={(e) => setEditedDv({ ...editedDv, coordinador: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Gestor de Cobranza</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={isEditing ? (editedDv.gestor || '0') : (currentDv.gestor || '0')}
                  onChange={(e) => setEditedDv({ ...editedDv, gestor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Teléfono</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={isEditing ? editedDv.telefono : currentDv.telefono}
                  onChange={(e) => setEditedDv({ ...editedDv, telefono: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-slate-500 font-semibold mb-1">Domicilio Registrado</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={
                    isEditing
                      ? (editedDv.direccion || '')
                      : (currentDv.direccion || 'DEL VALLE 419 , CP. 25294, TERRALTA, SALTILLO, COAHUILA DE ZARAGOZA')
                  }
                  onChange={(e) => setEditedDv({ ...editedDv, direccion: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Card: Validación Institucional */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Validación y Consolidación del Contrato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs items-center">
              <div>
                <span className="text-slate-500 font-medium block">Usuario Valida</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{currentDv.usuarioValida || 'Sistema'}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Fecha Validación</span>
                <span className="font-mono text-slate-700 mt-0.5 block">{currentDv.fechaValidacion || '02/04/2023 16:41:26'}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Usuario Consolida</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{currentDv.usuarioConsolida || 'Sistema'}</span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block">Fecha Consolidación</span>
                <span className="font-mono text-slate-700 mt-0.5 block">{currentDv.fechaConsolidacion || '02/04/2023 16:41:26'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (4 cols): Opciones de Gestión y Operaciones */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Opciones & Operaciones
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Acciones autorizadas para DV #{currentDv.noDist}
              </p>
            </div>

            {/* Grupo 1: Cobranza & Estados de Cuenta */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Cobranza & Reportes
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleActionClick('Relación')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between transition shadow-xs active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Relación de Cobranza (Oficial)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">PDF</span>
                </button>

                <button
                  onClick={() => handleActionClick('Estado de Cuenta')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Estado de Cuenta Quincenal</span>
                  </span>
                </button>

                <button
                  onClick={() => handleActionClick('Notas')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Notas de Gestoría & Bitácora</span>
                  </span>
                </button>

                <button
                  onClick={() => handleActionClick('Recalcular Relación')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Recalcular Relación & Bonificación</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Grupo 2: Expediente & Solicitudes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Expediente & Validaciones
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleActionClick('Expediente y Valeras')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Valeras & Dossier
                </button>
                <button
                  onClick={() => handleActionClick('Historial Créditos')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Historial Créditos
                </button>
                <button
                  onClick={() => handleActionClick('Solicitar aumento de línea')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Aumento de Línea
                </button>
                <button
                  onClick={() => handleActionClick('Solicitud crédito')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Solicitud Crédito
                </button>
                <button
                  onClick={() => handleActionClick('Vista ocular')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Vista Ocular
                </button>
                <button
                  onClick={() => handleActionClick('Auditar')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Auditar Cuenta
                </button>
              </div>
            </div>

            {/* Grupo 3: Líneas & Programas */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Financiamiento & Programas
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleActionClick('Crédito Personal')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Crédito Personal
                </button>
                <button
                  onClick={() => handleActionClick('Tiendita')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  LanaTienda
                </button>
                <button
                  onClick={() => handleActionClick('Lanapuntos')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  LanaPuntos
                </button>
                <button
                  onClick={() => handleActionClick('Convenio')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-left transition"
                >
                  Convenio de Pago
                </button>
              </div>
            </div>

            {/* Grupo 4: Reasignaciones */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleActionClick('Cambiar gestor')}
                className="flex-1 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] transition text-center"
              >
                Cambiar Gestor
              </button>
              <button
                onClick={() => handleActionClick('Cambiar coordinador')}
                className="flex-1 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] transition text-center"
              >
                Cambiar Coord.
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales Interactivos */}
      <RelacionCobranzaModal
        isOpen={isRelacionOpen}
        onClose={() => setIsRelacionOpen(false)}
        distribuidor={currentDv}
      />

      <EstadoCuentaModal
        isOpen={isEstadoCuentaOpen}
        onClose={() => setIsEstadoCuentaOpen(false)}
        distribuidor={currentDv}
      />

      <QuitarCastigoModal
        isOpen={isCastigoOpen}
        onClose={() => setIsCastigoOpen(false)}
        distribuidor={currentDv}
        onUpdateDistribuidor={(updated) => {
          setCurrentDv(updated);
          updateDistribuidor(updated);
        }}
      />
    </div>
  );
}
