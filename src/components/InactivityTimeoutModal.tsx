'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Clock, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';

interface InactivityTimeoutModalProps {
  onLogout: () => void;
  // Configurable timeout in seconds (Default: 900s = 15 minutes as per SOFOM / CNBV standards)
  timeoutSeconds?: number;
  // Warning duration before logout in seconds (Default: 120s = 2 minutes)
  warningDurationSeconds?: number;
}

export default function InactivityTimeoutModal({
  onLogout,
  timeoutSeconds = 900, // 15 minutos
  warningDurationSeconds = 120, // 2 minutos de advertencia
}: InactivityTimeoutModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingWarningSeconds, setRemainingWarningSeconds] = useState(warningDurationSeconds);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setRemainingWarningSeconds(warningDurationSeconds);
    }
  }, [showWarning, warningDurationSeconds]);

  // Global activity listeners
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleUserActivity = () => {
      // Throttle activity updates to once per 2 seconds
      if (Date.now() - lastActivityRef.current > 2000) {
        lastActivityRef.current = Date.now();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Heartbeat ticker to evaluate idle time every second
    timerRef.current = setInterval(() => {
      const idleTimeSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const thresholdWarning = timeoutSeconds - warningDurationSeconds;

      if (idleTimeSeconds >= timeoutSeconds) {
        // Log out immediately
        try {
          localStorage.setItem('lanahora_logout_reason', 'INACTIVITY_15MIN');
        } catch {}
        onLogout();
      } else if (idleTimeSeconds >= thresholdWarning) {
        setShowWarning(true);
        setRemainingWarningSeconds(timeoutSeconds - idleTimeSeconds);
      } else {
        if (showWarning) setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onLogout, timeoutSeconds, warningDurationSeconds, showWarning]);

  // Keep session active button
  const handleKeepAlive = () => {
    resetActivity();
    // Refresh timestamp
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRemainingWarningSeconds(warningDurationSeconds);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-900 font-sans space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Top Warning Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-600">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Aviso de Inactividad de Sesión
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Por normativa de ciberseguridad financiera (CNBV / SOFOM), tu sesión se cerrará automáticamente si no detectamos actividad.
            </p>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Tiempo restante de sesión:</span>
          </div>
          <div className="text-xl font-mono font-black text-rose-600 bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
            {Math.floor(remainingWarningSeconds / 60)}:
            {(remainingWarningSeconds % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={handleKeepAlive}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/20 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Continuar Trabajando</span>
          </button>
          <button
            onClick={onLogout}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
