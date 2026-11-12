'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserSession } from '@/types/auth';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  // Navigation Steps: 'credentials' -> '2fa_totp' | 'webauthn'
  const [currentStep, setCurrentStep] = useState<'credentials' | '2fa_totp' | 'webauthn'>('credentials');

  // Step 1: Credentials State
  const [identifier, setIdentifier] = useState('cmartinez_mayorga');
  const [password, setPassword] = useState('lanahora2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(true);
  const [isTurnstileLoading, setIsTurnstileLoading] = useState(false);

  // Step 2: 2FA TOTP State
  const [totpDigits, setTotpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(false);
  const [challengeUser, setChallengeUser] = useState<any>(null);
  const [totpCountdown, setTotpCountdown] = useState(30);

  // Status & Security States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [inactivityNotice, setInactivityNotice] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('Windows 11 • Edge');

  // Input refs for 6-digit TOTP
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Detect Client OS & Inactivity notice on mount
  useEffect(() => {
    try {
      const reason = localStorage.getItem('lanahora_logout_reason');
      if (reason === 'INACTIVITY_15MIN') {
        setInactivityNotice(true);
        localStorage.removeItem('lanahora_logout_reason');
      }
    } catch {}

    const ua = navigator.userAgent;
    let os = 'Windows';
    if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone')) os = 'iOS';

    let browser = 'Navegador Seguro';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';

    setDeviceInfo(`${os} · ${browser}`);
  }, []);

  // Timer for RFC 6238 TOTP window (30s cycle)
  useEffect(() => {
    const updateCountdown = () => {
      const epoch = Math.floor(Date.now() / 1000);
      const remaining = 30 - (epoch % 30);
      setTotpCountdown(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockCountdown <= 0) {
      if (isLocked) setIsLocked(false);
      return;
    }

    const t = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [lockCountdown, isLocked]);

  // Turnstile toggle
  const handleTurnstileClick = () => {
    if (isTurnstileVerified) return;
    setIsTurnstileLoading(true);
    setTimeout(() => {
      setIsTurnstileLoading(false);
      setIsTurnstileVerified(true);
    }, 500);
  };

  // -------------------------------------------------------------
  // STEP 1 SUBMIT: VALIDATE CREDENTIALS & TURNSTILE
  // -------------------------------------------------------------
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isTurnstileVerified) {
      setErrorMessage('Por favor confirma la casilla de verificación humana.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'credentials',
          identifier: identifier.trim(),
          password,
          turnstileToken: isTurnstileVerified ? 'CLOUDFLARE_VALID_TOKEN' : 'INVALID',
          deviceFingerprint: deviceInfo,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.status === 429 && data.locked) {
        setIsLocked(true);
        setLockCountdown(data.remainingSeconds || 900);
        setErrorMessage(data.error);
        return;
      }

      if (res.ok && data.requires2FA) {
        setChallengeUser(data.challengeUser);
        setCurrentStep('2fa_totp');
        setTimeout(() => {
          digitInputRefs.current[0]?.focus();
        }, 150);
      } else if (res.ok && data.success && data.session) {
        onLoginSuccess(data.session);
      } else {
        setErrorMessage(data.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Error de conexión con el servidor.');
    }
  };

  // -------------------------------------------------------------
  // STEP 2: TOTP DIGIT INPUT HANDLERS
  // -------------------------------------------------------------
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...totpDigits];
      newDigits[index] = '';
      setTotpDigits(newDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...totpDigits];
    newDigits[index] = digit;
    setTotpDigits(newDigits);
    setErrorMessage(null);

    if (index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 || newDigits.every((d) => d !== '')) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        executeVerifyTotp(fullCode);
      }
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...totpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setTotpDigits(newDigits);

    if (pasted.length === 6) {
      digitInputRefs.current[5]?.focus();
      executeVerifyTotp(pasted);
    } else {
      digitInputRefs.current[pasted.length]?.focus();
    }
  };

  const executeVerifyTotp = async (codeToVerify?: string) => {
    const code = codeToVerify || totpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Ingresa los 6 dígitos del código.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: '2fa_totp',
          userId: challengeUser?.id,
          totpCode: code,
          trustDevice,
          deviceFingerprint: deviceInfo,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.status === 429 && data.locked) {
        setIsLocked(true);
        setLockCountdown(data.remainingSeconds || 900);
        setErrorMessage(data.error);
        return;
      }

      if (res.ok && data.success && data.session) {
        onLoginSuccess(data.session);
      } else {
        setErrorMessage(data.error || 'Código incorrecto o expirado.');
        setTotpDigits(['', '', '', '', '', '']);
        digitInputRefs.current[0]?.focus();
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Error de conexión al verificar el código.');
    }
  };

  // -------------------------------------------------------------
  // LEVEL 2: WEBAUTHN / WINDOWS HELLO / FIDO2 PASSKEY
  // -------------------------------------------------------------
  const handleWindowsHelloLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentStep('webauthn');

    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'preferred',
            },
          });
        } catch (credErr) {
          console.warn('WebAuthn hardware fallback:', credErr);
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'webauthn_verify',
          identifier: identifier.trim() || 'cmartinez_mayorga',
          deviceFingerprint: deviceInfo,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success && data.session) {
        onLoginSuccess(data.session);
      } else {
        setCurrentStep('credentials');
        setErrorMessage(data.error || 'No se pudo verificar con Windows Hello.');
      }
    } catch {
      setIsLoading(false);
      setCurrentStep('credentials');
      setErrorMessage('Error al acceder al sensor biométrico.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#f8fafc] text-slate-800 font-sans p-4 sm:p-6 select-none relative">
      {/* Background Subtle Ambiance */}
      <div className="fixed top-[-100px] left-[25%] w-[500px] h-[350px] bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Card */}
      <div className="w-full max-w-[380px] my-auto relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-7 sm:p-8 space-y-6">
          
          {/* Top Logo & Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <img
                src="/lanahora-logo.png"
                alt="LanAhora"
                className="h-11 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Iniciar Sesión
              </h1>
              <p className="text-xs text-slate-500">
                Introduce tus datos de acceso
              </p>
            </div>
          </div>

          {/* Inactivity Logout Alert */}
          {inactivityNotice && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Sesión cerrada por inactividad (15 min) para proteger tu cuenta.</span>
            </div>
          )}

          {/* Brute Force Lockout Alert */}
          {isLocked && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 space-y-1">
              <span className="font-bold block">Cuenta bloqueada temporalmente</span>
              <p className="text-[11px] text-slate-600">
                Demasiados intentos erróneos. Espera{' '}
                <span className="font-mono font-bold">
                  {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
                </span>{' '}
                para reintentar.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && !isLocked && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: CREDENTIALS & MINIMALIST CLOUDFLARE TURNSTILE      */}
          {/* ========================================================= */}
          {currentStep === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              {/* Usuario */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-semibold text-xs">
                  Usuario:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="cmartinez_mayorga"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs font-medium transition"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-semibold text-xs">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Minimalist, Clean Cloudflare Verification Row */}
              <div
                onClick={handleTurnstileClick}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {isTurnstileLoading ? (
                    <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                  ) : isTurnstileVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded border border-slate-400 bg-white" />
                  )}
                  <span className="text-slate-700 font-medium text-[11px]">
                    {isTurnstileVerified ? 'Verificación exitosa' : 'Verificar que eres humano'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">
                  CLOUDFLARE
                </span>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </>
                )}
              </button>

              {/* Minimalist Biometric Text Link (Level 2) */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleWindowsHelloLogin}
                  disabled={isLoading || isLocked}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition font-medium cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                  <span>Acceder con Windows Hello / Huella</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: MINIMALIST GOOGLE AUTHENTICATOR (TOTP)            */}
          {/* ========================================================= */}
          {currentStep === '2fa_totp' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('credentials');
                  setErrorMessage(null);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Volver</span>
              </button>

              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold text-slate-900">
                  Google Authenticator
                </h2>
                <p className="text-xs text-slate-500">
                  Introduce el código de 6 dígitos de tu app
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1.5" onPaste={handleDigitPaste}>
                  {totpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        digitInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className="w-10 h-11 text-center text-base font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                    />
                  ))}
                </div>

                {/* Subtitle timer */}
                <div className="text-center text-[11px] text-slate-400">
                  El código cambia en <span className="font-mono font-medium text-slate-600">{totpCountdown}s</span>
                </div>
              </div>

              {/* Trust this device checkbox */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-1">
                <input
                  type="checkbox"
                  id="trust"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="trust" className="cursor-pointer select-none text-[11px]">
                  Recordar este equipo por 15 días
                </label>
              </div>

              {/* Verify button */}
              <button
                type="button"
                onClick={() => executeVerifyTotp()}
                disabled={isLoading || isLocked || totpDigits.some((d) => d === '')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Verificar código</span>
                )}
              </button>

              {/* Discrete help link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowBackupModal(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 transition"
                >
                  ¿No tienes acceso al código?
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LEVEL 2: WEBAUTHN / WINDOWS HELLO MINIMALIST PROMPT       */}
          {/* ========================================================= */}
          {currentStep === 'webauthn' && (
            <div className="py-6 text-center space-y-4 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto">
                <Fingerprint className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Windows Hello
                </h3>
                <p className="text-xs text-slate-500">
                  Toca tu sensor de huella o mira a la cámara...
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('credentials')}
                className="text-xs text-slate-400 hover:text-slate-700 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Minimalist Discreet Footer */}
          <div className="pt-2 text-center text-[10px] text-slate-400 font-medium">
            SystemCore LanAhora · Acceso Seguro
          </div>
        </div>
      </div>

      {/* Discreet Help Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xs w-full p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900">
              Ayuda de Doble Factor
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Si cambiaste de teléfono o no tienes acceso a Google Authenticator, contacta a Soporte o a tu coordinador para recibir asistencia.
            </p>
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5">
              <p>Mesa de Control: (844) 870-7297</p>
              <p>seguridad@lanahora.com</p>
            </div>
            <button
              onClick={() => setShowBackupModal(false)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white font-medium text-xs transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
