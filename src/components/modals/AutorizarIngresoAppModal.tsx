'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import {
  X,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Lock,
  Phone,
  Radio,
  Send,
} from 'lucide-react';

interface AutorizarIngresoAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  onAccesoReseteado?: (resultado: {
    folio: string;
    fecha: string;
    estatus: 'OK';
    telefono: string;
  }) => void;
}

export default function AutorizarIngresoAppModal({
  isOpen,
  onClose,
  distribuidor,
  onAccesoReseteado,
}: AutorizarIngresoAppModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultadoOk, setResultadoOk] = useState(false);
  const [timestamp, setTimestamp] = useState<string>('');
  const [folioAuth, setFolioAuth] = useState<string>('');

  // Opciones operativas del reseteo
  const [desvincularDispositivo, setDesvincularDispositivo] = useState(true);
  const [desbloquearIntentos, setDesbloquearIntentos] = useState(true);
  const [enviarSms, setEnviarSms] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setResultadoOk(false);
      setIsProcessing(false);
      const now = new Date();
      setTimestamp(
        now.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
      setFolioAuth(`AUTH-APP-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen, distribuidor.noDist]);

  if (!isOpen || !mounted) return null;

  const handleEjecutarReset = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const fechaFinal =
        now.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) +
        ' ' +
        now.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      setTimestamp(fechaFinal);
      setIsProcessing(false);
      setResultadoOk(true);

      if (onAccesoReseteado) {
        onAccesoReseteado({
          folio: folioAuth,
          fecha: fechaFinal,
          estatus: 'OK',
          telefono: distribuidor.telefono || '8444101285',
        });
      }
    }, 450);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* HEADER                                                   */}
        {/* ======================================================== */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                {resultadoOk ? 'Resultado' : 'Autorizar Ingreso APP'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                No. {distribuidor.noDist} · {distribuidor.nombreDistribuidor}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* CONTENIDO DEL MODAL                                      */}
        {/* ======================================================== */}
        <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4">
          {!resultadoOk ? (
            <>
              {/* Resumen de Acceso de la Distribuidora */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Estatus Móvil
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    LanaApp Vinculada
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">Teléfono Celular:</span>
                    <strong className="text-slate-800 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {distribuidor.telefono || '(844) 459-3523'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">Dispositivo Actual:</span>
                    <strong className="text-slate-800 truncate block">
                      Android (Sesión Activa)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Acciones a ejecutar al autorizar */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Acciones de Autorización & Reseteo:
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={desvincularDispositivo}
                      onChange={(e) => setDesvincularDispositivo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">Desvincular dispositivo móvil actual</span>
                      <span className="text-[10px] text-slate-500">
                        Cierra la sesión previa y libera el identificador del equipo.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={desbloquearIntentos}
                      onChange={(e) => setDesbloquearIntentos(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">Restablecer intentos y PIN de acceso</span>
                      <span className="text-[10px] text-slate-500">
                        Elimina bloqueos por contraseña o intentos fallidos.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={enviarSms}
                      onChange={(e) => setEnviarSms(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">Notificar por SMS al número registrado</span>
                      <span className="text-[10px] text-slate-500">
                        Envía confirmación al móvil {distribuidor.telefono || '(844) 459-3523'}.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* ======================================================== */
            /* VISTA RESULTADO: OK (Fiel al sistema original)           */
            /* ======================================================== */
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">
                    Resultado: <span className="text-emerald-600">OK</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    El acceso a la aplicación ha sido reseteado y autorizado correctamente.
                  </p>
                </div>
              </div>

              {/* Ficha técnica de confirmación */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Folio de Autorización:</span>
                  <strong className="font-mono text-slate-800">{folioAuth}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Fecha y Hora:</span>
                  <strong className="font-mono text-slate-800">{timestamp}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Línea Telefónica:</span>
                  <strong className="font-mono text-slate-800">{distribuidor.telefono || '(844) 459-3523'}</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Estatus del Dispositivo:</span>
                  <span className="font-bold text-emerald-700">Desvinculado / Listo para nuevo ingreso</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* FOOTER ACCIONES                                          */}
        {/* ======================================================== */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          {!resultadoOk ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleEjecutarReset}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Autorizar Ingreso APP</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
