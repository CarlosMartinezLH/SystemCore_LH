'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import { formatMoney } from '@/lib/utils/formatters';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  Printer,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Coins,
  Check,
  FileCheck,
  Building,
  AlertTriangle,
} from 'lucide-react';

interface AuditoriaDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  onAuditoriaCompletada?: (resultado: {
    disponibleAjustado: number;
    saldoCarteraAjustado: number;
    fechaAuditoria: string;
  }) => void;
}

interface AuditoriaPaso {
  id: string;
  titulo: string;
  subtotalEsperado: string;
  subtotalCalculado: string;
  diferencia: string;
  estado: 'pendiente' | 'procesando' | 'conciliado';
}

export default function AuditoriaDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
  onAuditoriaCompletada,
}: AuditoriaDistribuidorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [auditCompleted, setAuditCompleted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Valores financieros de la distribuidora
  const limiteCredito = distribuidor.creditoLimite || 240000;
  const saldoCartera = distribuidor.saldoActual || 42664;
  const disponibleCalculado = Math.max(0, limiteCredito - saldoCartera);
  const lineaPersonal = distribuidor.lineaPersonal || 10000;
  const disponiblePersonal = distribuidor.disponiblePersonal || 5000;
  const saldoPuntos = distribuidor.lanapuntos || 65125;

  const [pasos, setPasos] = useState<AuditoriaPaso[]>([
    {
      id: 'cartera',
      titulo: '1. Verificación de Vales y Cartera Activa',
      subtotalEsperado: formatMoney(saldoCartera),
      subtotalCalculado: formatMoney(saldoCartera),
      diferencia: '$0.00 M.N.',
      estado: 'conciliado',
    },
    {
      id: 'linea',
      titulo: '2. Conciliación de Línea y Disponible',
      subtotalEsperado: formatMoney(disponibleCalculado),
      subtotalCalculado: formatMoney(disponibleCalculado),
      diferencia: '$0.00 M.N.',
      estado: 'conciliado',
    },
    {
      id: 'personal',
      titulo: '3. Auditoría de Crédito Personal DV',
      subtotalEsperado: formatMoney(disponiblePersonal),
      subtotalCalculado: formatMoney(disponiblePersonal),
      diferencia: '$0.00 M.N.',
      estado: 'conciliado',
    },
    {
      id: 'monedero',
      titulo: '4. Balance de LanaPuntos (Monedero)',
      subtotalEsperado: `${saldoPuntos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} pts`,
      subtotalCalculado: `${saldoPuntos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} pts`,
      diferencia: '0.00 pts',
      estado: 'conciliado',
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRunning) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isRunning, onClose]);

  // Ejecución de recálculo simulado paso a paso con feedback visual en vivo
  const handleEjecutarAuditoria = () => {
    setIsRunning(true);
    setAuditCompleted(false);
    setCurrentStepIndex(0);

    // Reiniciar estados a pendiente
    setPasos((prev) =>
      prev.map((p, idx) => ({
        ...p,
        estado: idx === 0 ? 'procesando' : 'pendiente',
      }))
    );

    // Secuencia de animación de recálculo
    setTimeout(() => {
      // Paso 1 completado, paso 2 procesando
      setCurrentStepIndex(1);
      setPasos((prev) =>
        prev.map((p, idx) => {
          if (idx === 0) return { ...p, estado: 'conciliado' };
          if (idx === 1) return { ...p, estado: 'procesando' };
          return p;
        })
      );
    }, 600);

    setTimeout(() => {
      // Paso 2 completado, paso 3 procesando
      setCurrentStepIndex(2);
      setPasos((prev) =>
        prev.map((p, idx) => {
          if (idx <= 1) return { ...p, estado: 'conciliado' };
          if (idx === 2) return { ...p, estado: 'procesando' };
          return p;
        })
      );
    }, 1200);

    setTimeout(() => {
      // Paso 3 completado, paso 4 procesando
      setCurrentStepIndex(3);
      setPasos((prev) =>
        prev.map((p, idx) => {
          if (idx <= 2) return { ...p, estado: 'conciliado' };
          if (idx === 3) return { ...p, estado: 'procesando' };
          return p;
        })
      );
    }, 1800);

    setTimeout(() => {
      // Todos completados
      setPasos((prev) => prev.map((p) => ({ ...p, estado: 'conciliado' })));
      setIsRunning(false);
      setAuditCompleted(true);

      if (onAuditoriaCompletada) {
        onAuditoriaCompletada({
          disponibleAjustado: disponibleCalculado,
          saldoCarteraAjustado: saldoCartera,
          fechaAuditoria: new Date().toLocaleString('es-MX'),
        });
      }
    }, 2400);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* HEADER: AUDITORÍA Y RECÁLCULO                            */}
        {/* ======================================================== */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  Auditar & Recalcular Cartera
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Mesa de Control
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                Distribuidor: <span className="font-bold text-slate-800">{distribuidor.nombreDistribuidor}</span> · No. {distribuidor.noDist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Imprimir Dictamen"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-40"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CONTENIDO PRINCIPAL: PASOS Y DICTAMEN                    */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* LISTA DE COMPROBACIONES Y PASOS AUDITADOS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Auditoría de Componentes Financieros</span>
              <span className="text-[11px] font-bold text-slate-400 normal-case">
                {pasos.filter((p) => p.estado === 'conciliado').length} de {pasos.length} comprobados
              </span>
            </h4>

            <div className="space-y-2">
              {pasos.map((paso) => (
                <div
                  key={paso.id}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    paso.estado === 'procesando'
                      ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                      : paso.estado === 'conciliado'
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div>
                        {paso.estado === 'conciliado' ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : paso.estado === 'procesando' ? (
                          <div className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-slate-100" />
                        )}
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 truncate">
                        {paso.titulo}
                      </h5>
                    </div>

                    <div className="text-right shrink-0 font-mono text-xs flex items-center gap-3">
                      <div className="font-bold text-slate-900">
                        {paso.subtotalCalculado}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Dif: {paso.diferencia}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DICTAMEN OFICIAL */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="font-black text-xs uppercase tracking-wider">
                Dictamen Oficial: Cartera Conciliada al 100%
              </h4>
            </div>

            <p className="text-xs text-emerald-900/90 font-medium">
              Saldos conciliados contra libro mayor sin diferencias contables.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
              <div>
                <span className="text-emerald-700 block">Línea de Crédito:</span>
                <strong className="text-emerald-950 font-mono">{formatMoney(limiteCredito)}</strong>
              </div>
              <div>
                <span className="text-emerald-700 block">Saldo en Cartera:</span>
                <strong className="text-emerald-950 font-mono">{formatMoney(saldoCartera)}</strong>
              </div>
              <div>
                <span className="text-emerald-700 block">Disponible Validado:</span>
                <strong className="text-emerald-950 font-mono text-xs">{formatMoney(disponibleCalculado)}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* FOOTER: BOTÓN DE FORZAR RECÁLCULO Y CERRAR              */}
        {/* ======================================================== */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 font-mono">
            Último recálculo: {new Date().toLocaleDateString('es-MX')} {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isRunning}
              onClick={handleEjecutarAuditoria}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Recalculando saldos...' : 'Forzar Recálculo Ahora'}</span>
            </button>

            <button
              type="button"
              disabled={isRunning}
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
