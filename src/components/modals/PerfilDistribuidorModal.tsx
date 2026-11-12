'use client';

import React, { useState, useEffect } from 'react';
import { DistribuidorCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  X,
  Search,
  Edit2,
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
} from 'lucide-react';

interface PerfilDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  onSelectDv?: (noDist: number) => void;
  onOpenCartera?: (distribuidor: DistribuidorCore) => void;
  onOpenRelacion?: (distribuidor: DistribuidorCore) => void;
  onOpenEstadoCuenta?: (distribuidor: DistribuidorCore) => void;
  onOpenNotas?: (distribuidor: DistribuidorCore) => void;
  onOpenCastigo?: (distribuidor: DistribuidorCore) => void;
}

export default function PerfilDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
  onSelectDv,
  onOpenCartera,
  onOpenRelacion,
  onOpenEstadoCuenta,
  onOpenNotas,
  onOpenCastigo,
}: PerfilDistribuidorModalProps) {
  const { distribuidores, updateDistribuidor } = useCoreSync();

  const [currentDv, setCurrentDv] = useState<DistribuidorCore>(distribuidor);
  const [searchDvInput, setSearchDvInput] = useState<string>(distribuidor.noDist.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<DistribuidorCore>>({});
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDv(distribuidor);
    setSearchDvInput(distribuidor.noDist.toString());
    setEditFormData(distribuidor);
  }, [distribuidor]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleLookupDv = () => {
    const num = parseInt(searchDvInput.trim(), 10);
    if (isNaN(num)) return;
    const found = distribuidores.find((d) => d.noDist === num);
    if (found) {
      setCurrentDv(found);
      setEditFormData(found);
      if (onSelectDv) onSelectDv(found.noDist);
      showToast(`Distribuidora #${found.noDist} cargada.`);
    } else {
      alert(`No se encontró distribuidora con el número #${num}.`);
    }
  };

  const handleSaveData = () => {
    const updated = {
      ...currentDv,
      ...editFormData,
    } as DistribuidorCore;
    setCurrentDv(updated);
    updateDistribuidor(updated);
    setIsEditing(false);
    showToast(`Datos de DV #${updated.noDist} actualizados exitosamente.`);
  };

  const handleActionButton = (btnName: string) => {
    if (btnName === 'Relación') {
      if (onOpenRelacion) onOpenRelacion(currentDv);
      else showToast('Abriendo Relación de Cobro...');
    } else if (btnName === 'Estado de Cuenta') {
      if (onOpenEstadoCuenta) onOpenEstadoCuenta(currentDv);
      else showToast('Abriendo Estado de Cuenta...');
    } else if (btnName === 'Notas') {
      if (onOpenNotas) onOpenNotas(currentDv);
      else showToast('Abriendo Notas de la distribuidora...');
    } else if (btnName === 'Convenio' || btnName === 'Quitar Castigo') {
      if (onOpenCastigo) onOpenCastigo(currentDv);
      else showToast('Abriendo Gestión de Convenio / Castigo...');
    } else if (btnName === 'Líneas de crédito' || btnName === 'Historial Créditos') {
      if (onOpenCartera) onOpenCartera(currentDv);
      else showToast(`Abriendo ${btnName}...`);
    } else {
      showToast(`Acción: "${btnName}" ejecutada para DV #${currentDv.noDist}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden text-slate-800 font-sans">
        {/* Header Superior del Modal */}
        <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Perfil del Distribuidor
            </h2>
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              ID: {currentDv.noDist}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación rápida */}
        {noticeMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>✓ {noticeMessage}</span>
            <button onClick={() => setNoticeMessage(null)} className="text-emerald-700 font-black">
              ✕
            </button>
          </div>
        )}

        {/* Contenido con scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Fila 1: DistribuidorID, Número, Nombre Distribuidor, ContratoID, Estatus */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                DistribuidorID:
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={searchDvInput}
                  onChange={(e) => setSearchDvInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupDv()}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white focus:outline-none focus:border-blue-600 text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleLookupDv}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700 transition shrink-0"
                  title="Buscar por ID"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Número:</label>
              <input
                type="text"
                disabled
                value={currentDv.noDist}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nombre Distribuidor:
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? editFormData.nombreDistribuidor || '' : currentDv.nombreDistribuidor}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, nombreDistribuidor: e.target.value })
                }
                className={`w-full px-2.5 py-1.5 border rounded text-xs font-bold text-slate-900 ${
                  isEditing ? 'bg-white border-blue-500' : 'bg-slate-100 border-slate-200'
                }`}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">ContratoID:</label>
              <input
                type="text"
                disabled
                value={currentDv.contratoId || 2606}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono bg-slate-100 text-slate-700 text-center"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Estatus:</label>
              <select
                disabled={!isEditing}
                value={isEditing ? editFormData.estatus || currentDv.estatus : currentDv.estatus}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, estatus: e.target.value as any })
                }
                className={`w-full px-2 py-1.5 border rounded text-xs font-bold ${
                  isEditing ? 'bg-white border-blue-500' : 'bg-slate-100 border-slate-200'
                } text-slate-800`}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="CANCELADO">CANCELADO</option>
                <option value="REESTRUCTURA">REESTRUCTURA</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Línea de Crédito, Línea Adi., Nivel, Coordinador, Gestor */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Línea de Crédito:
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={
                  isEditing
                    ? editFormData.creditoLimite || currentDv.creditoLimite
                    : currentDv.creditoLimite.toLocaleString('es-MX', { minimumFractionDigits: 2 })
                }
                onChange={(e) =>
                  setEditFormData({ ...editFormData, creditoLimite: Number(e.target.value) || 0 })
                }
                className={`w-full px-2 py-1.5 border rounded text-xs font-mono font-bold ${
                  isEditing ? 'bg-white border-blue-500' : 'bg-slate-100 border-slate-200'
                } text-slate-900 text-right`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Línea de Crédito Adi.:
              </label>
              <input
                type="text"
                disabled
                value={(currentDv.lineaAdicional || 0).toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono bg-slate-100 text-slate-700 text-right"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nivel:</label>
              <select
                disabled={!isEditing}
                value={isEditing ? editFormData.nivel || currentDv.nivel : currentDv.nivel}
                onChange={(e) => setEditFormData({ ...editFormData, nivel: e.target.value as any })}
                className={`w-full px-2 py-1.5 border rounded text-xs font-bold ${
                  isEditing ? 'bg-white border-blue-500' : 'bg-slate-100 border-slate-200'
                } text-slate-800`}
              >
                <option value="BRONCE">BRONCE</option>
                <option value="PLATA">PLATA</option>
                <option value="ORO">ORO</option>
                <option value="DIAMANTE">DIAMANTE</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Coordinador:</label>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? editFormData.coordinador || '' : currentDv.coordinador}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, coordinador: e.target.value })
                }
                className={`w-full px-2.5 py-1.5 border rounded text-xs font-bold ${
                  isEditing ? 'bg-white border-blue-500' : 'bg-slate-100 border-slate-200'
                } text-slate-800`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Gestor:</label>
              <input
                type="text"
                disabled
                value={currentDv.gestor || '0'}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-100 text-slate-700 text-center"
              />
            </div>
          </div>

          {/* Fila 3: Zona, SubZona */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Zona:</label>
              <input
                type="text"
                disabled
                value={currentDv.zona || currentDv.zonaId || '0'}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-100 text-slate-700"
              />
            </div>
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">SubZona:</label>
              <input
                type="text"
                disabled
                value={currentDv.subzona || currentDv.subzonaId || ''}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-100 text-slate-700"
              />
            </div>
          </div>

          {/* Fila 4: Promotor, Dirección, Teléfono, ID */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Promotor:</label>
              <input
                type="text"
                disabled
                value={currentDv.promotor || 'SIN PROMOTOR'}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-100 text-slate-700"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Dirección:</label>
              <input
                type="text"
                disabled={!isEditing}
                value={
                  isEditing
                    ? editFormData.direccion || ''
                    : currentDv.direccion ||
                      'PRIV FRANCISCO HERRERA GARZA 115 , CP. 25015, FUNDADORES, SALTILLO,'
                }
                onChange={(e) => setEditFormData({ ...editFormData, direccion: e.target.value })}
                className={`w-full px-2 py-1.5 border rounded text-xs text-slate-800 ${
                  isEditing ? 'bg-white border-blue-500' : 'bg-slate-100 border-slate-200'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Teléfono:</label>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? editFormData.telefono || '' : currentDv.telefono || '8444101285'}
                onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                className={`w-full px-2 py-1.5 border rounded text-xs font-mono ${
                  isEditing ? 'bg-white border-blue-500' : 'bg-slate-100 border-slate-200'
                } text-slate-800`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">ID:</label>
              <input
                type="text"
                disabled
                value={currentDv.noDist}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 text-center"
              />
            </div>
          </div>

          {/* Botones de acción intermedia: Buscar por Nombre, Modificar Datos */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const name = prompt('Ingrese nombre de la distribuidora a buscar:');
                if (name && name.trim()) {
                  const q = name.toLowerCase().trim();
                  const found = distribuidores.find((d) =>
                    d.nombreDistribuidor.toLowerCase().includes(q)
                  );
                  if (found) {
                    setCurrentDv(found);
                    setEditFormData(found);
                    setSearchDvInput(found.noDist.toString());
                    if (onSelectDv) onSelectDv(found.noDist);
                    showToast(`DV #${found.noDist} seleccionada.`);
                  } else {
                    alert('No se encontró ninguna distribuidora con ese nombre.');
                  }
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar por Nombre</span>
            </button>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modificar Datos Distribuidor</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveData}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Sección Validación */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
              Validación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Usuario Valida:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentDv.usuarioValida || 'Sistema'}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white text-slate-700"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Fecha Validación:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentDv.fechaValidacion || '02/04/2023 16:41:26'}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white text-slate-700 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Usuario Consolida:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentDv.usuarioConsolida || 'NO VALIDADO AUN'}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white text-slate-700"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end items-end pt-3 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleActionButton('Validar Contrato')}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Validar Contrato</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sección Opciones (Botones de Colores Exactos de la Foto) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
              Opciones
            </span>

            {/* Fila 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleActionButton('Relación')}
                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Relación</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Notas')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Notas</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Contrato')}
                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Contrato</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Recibos de Relación')}
                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Recibos de Relación</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Estado de Cuenta')}
                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Estado de Cuenta</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Expediente y Valeras')}
                className="px-2.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Expediente y Valeras</span>
              </button>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleActionButton('Historial Créditos')}
                className="px-2.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Historial Créditos</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Auditar')}
                className="px-2.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Auditar</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Recalcular Relación')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recalcular Relación</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Crédito Personal')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Crédito Personal</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Líneas de crédito')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Líneas de crédito</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Tiendita')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Tiendita</span>
              </button>
            </div>

            {/* Fila 3 */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleActionButton('Solicitar Validación')}
                className="px-2.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Solicitar Validación</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Solicitar aumento de línea')}
                className="px-2.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">Solicitar aumento...</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Aut. Ingreso APP')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Aut. Ingreso APP</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Vista ocular')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Vista ocular</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Solicitud crédito')}
                className="px-2.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Solicitud crédito</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Lanapuntos')}
                className="px-2.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Lanapuntos</span>
              </button>
            </div>

            {/* Fila 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleActionButton('Encuesta visita ocular')}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Encuesta visita ocular</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Encuesta solicitud de crédito')}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Encuesta solicitud de crédito</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Marcar cartera legal')}
                className="px-3 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                <span>Marcar cartera legal</span>
              </button>
            </div>

            {/* Fila 5 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleActionButton('Convenio')}
                className="px-2.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Convenio</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Crédito Personalizado')}
                className="px-2.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Crédito Personalizado</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Cambiar gestor')}
                className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Cambiar gestor</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionButton('Cambiar coordinador')}
                className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Cambiar coordinador</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            LanAhora ERP · Expediente Central DV #{currentDv.noDist}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
