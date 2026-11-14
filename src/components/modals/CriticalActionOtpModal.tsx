'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Clock,
  RefreshCw,
  X,
  AlertTriangle,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface CriticalActionOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'DISPERSION_STP' | 'DELETE_USER' | 'DELETE_SUCURSAL';
  actionTitle: string;
  actionDetails: string;
  userEmail?: string;
  onSuccess: (verifiedToken: string) => Promise<void> | void;
}

export default function CriticalActionOtpModal({
  isOpen,
  onClose,
  actionType,
  actionTitle,
  actionDetails,
  userEmail = 'admin@lanahora.com',
  onSuccess,
}: CriticalActionOtpModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string>('c***@lanahora.com');
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutos
  const inputRef = useRef<HTMLInputElement>(null);

  // Solicitar código al abrir el modal
  const handleRequestCode = async () => {
    setRequesting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/critical-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dev-bypass': 'true' },
        body: JSON.stringify({
          mode: 'request',
          email: userEmail,
          actionType,
          details: actionDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.emailMasked);
        setTimeLeft(data.expiresInSeconds || 600);
      } else {
        setError(data.error || 'No se pudo generar el código de verificación.');
      }
    } catch {
      setError('Error de conexión al solicitar el código al servidor.');
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      handleRequestCode();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Contador de expiración
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  // Formato mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Validar y ejecutar acción
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError('Introduce el código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/critical-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dev-bypass': 'true' },
        body: JSON.stringify({
          mode: 'verify',
          email: userEmail,
          actionType,
          code: code.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.verifiedToken) {
        await onSuccess(data.verifiedToken);
        onClose();
      } else {
        setError(data.error || 'Código incorrecto o expirado.');
      }
    } catch (err: any) {
      setError('Error al procesar la verificación: ' + (err.message || 'Error de red'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Cabecera de Seguridad */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200/60">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Autorización de Seguridad
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 inline-block mt-0.5">
                Operación Crítica Requerida
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <form onSubmit={handleVerify} className="p-6 space-y-4 text-xs">
          {/* Tarjeta resumen de la operación crítica */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {actionTitle}
            </div>
            <div className="font-extrabold text-slate-900 text-sm leading-snug break-words">
              {actionDetails}
            </div>
          </div>

          {/* Mensaje de envío a correo */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900">
            <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-medium text-[11px]">
                Por política de ciberseguridad, se envió un código de 6 dígitos a tu correo:
              </span>
              <div className="font-bold text-xs font-mono text-blue-700 mt-0.5">
                {maskedEmail}
              </div>
            </div>
          </div>


          {/* Input del Código de 6 Dígitos */}
          <div className="space-y-1.5 text-center pt-1">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Ingresa el código de 6 dígitos
            </label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(val);
                if (error) setError(null);
              }}
              placeholder="••••••"
              className="w-full text-center py-3 text-2xl font-mono font-black tracking-[0.4em] bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:bg-white focus:border-blue-600 text-slate-900 transition"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Temporizador y Reenvío */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Expira en: <strong className="font-mono text-slate-700">{formatTime(timeLeft)}</strong></span>
            </div>
            <button
              type="button"
              disabled={requesting}
              onClick={handleRequestCode}
              className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${requesting ? 'animate-spin' : ''}`} />
              <span>Reenviar código</span>
            </button>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={code.length !== 6 || loading}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold transition shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Autorizar y Procesar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
