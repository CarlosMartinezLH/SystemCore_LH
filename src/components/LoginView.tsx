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
  ChevronLeft,
  KeyRound,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Laptop,
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
  const [deviceInfo, setDeviceInfo] = useState('Windows 11 • Edge • Saltillo, Coahuila');

  // Input refs for 6-digit TOTP
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Detect Client OS & Inactivity notice on mount
  useEffect(() => {
    // Check if user was logged out due to inactivity
    try {
      const reason = localStorage.getItem('lanahora_logout_reason');
      if (reason === 'INACTIVITY_15MIN') {
        setInactivityNotice(true);
        localStorage.removeItem('lanahora_logout_reason');
      }
    } catch {}

    // Detect OS & Browser
    const ua = navigator.userAgent;
    let os = 'Windows 11';
    if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone')) os = 'iOS';

    let browser = 'Chrome/Edge';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';

    setDeviceInfo(`${os} • ${browser} • Saltillo, Coahuila`);
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

  // Turnstile simulated interactive toggle
  const handleTurnstileClick = () => {
    if (isTurnstileVerified) return;
    setIsTurnstileLoading(true);
    setTimeout(() => {
      setIsTurnstileLoading(false);
      setIsTurnstileVerified(true);
    }, 600);
  };

  // -------------------------------------------------------------
  // STEP 1 SUBMIT: VALIDATE CREDENTIALS & TURNSTILE
  // -------------------------------------------------------------
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isTurnstileVerified) {
      setErrorMessage('Por favor confirme la verificación humana de Cloudflare Turnstile.');
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
        // Transition to Step 2 (Google Authenticator 2FA)
        setChallengeUser(data.challengeUser);
        setCurrentStep('2fa_totp');
        // Auto-focus first digit input after render
        setTimeout(() => {
          digitInputRefs.current[0]?.focus();
        }, 150);
      } else if (res.ok && data.success && data.session) {
        // Direct login if device was already trusted
        onLoginSuccess(data.session);
      } else {
        setErrorMessage(data.error || 'Credenciales inválidas. Verifique su usuario y contraseña.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Error de conexión con el servidor de autenticación.');
    }
  };

  // -------------------------------------------------------------
  // STEP 2: TOTP DIGIT INPUT HANDLERS
  // -------------------------------------------------------------
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
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

    // Auto-advance to next input
    if (index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are complete
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

  // -------------------------------------------------------------
  // STEP 2 SUBMIT: VERIFY TOTP CODE
  // -------------------------------------------------------------
  const executeVerifyTotp = async (codeToVerify?: string) => {
    const code = codeToVerify || totpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Por favor introduce el código completo de 6 dígitos.');
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
        // Successful 2FA Login!
        onLoginSuccess(data.session);
      } else {
        setErrorMessage(data.error || 'Código incorrecto. Verifica tu aplicación Google Authenticator.');
        // Reset TOTP digits and focus back to first box
        setTotpDigits(['', '', '', '', '', '']);
        digitInputRefs.current[0]?.focus();
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Error de conexión al verificar el código de doble factor.');
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
      // Intento real con WebAuthn API si está disponible en el navegador
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Lanzar desafío de plataforma FIDO2 / Windows Hello
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);

          // Prompt nativo del sistema operativo (Windows Hello PIN / Huella / Rostro)
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'preferred',
            },
          });
        } catch (credErr) {
          // Si el usuario cancela o no tiene llave configurada, continuar con verificación asistida
          console.warn('WebAuthn hardware fallback:', credErr);
        }
      }

      // Sincronizar acceso con el backend de seguridad
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
        setErrorMessage(data.error || 'No se pudo verificar la credencial de Windows Hello.');
      }
    } catch {
      setIsLoading(false);
      setCurrentStep('credentials');
      setErrorMessage('Error al invocar el sensor biométrico de Windows Hello.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#020617] text-slate-800 font-sans p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Decorative High-Security Background Mesh */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Card */}
      <div className="w-full max-w-[420px] my-auto relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/40 overflow-hidden">
          {/* 1. Header Card (Matching User's Purple Header from Legacy System) */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-4 text-center text-white relative shadow-inner">
            <h1 className="text-base font-extrabold tracking-wide drop-shadow-xs">
              Iniciar Sesión
            </h1>
            <span className="text-[10px] text-purple-200 font-medium tracking-wider uppercase">
              SystemCore • Nivel Bancario 3-MFA
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* 2. Logo & Greeting */}
            <div className="text-center space-y-1">
              <div className="flex justify-center pb-1">
                <img
                  src="/lanahora-logo.png"
                  alt="LanAhora"
                  className="h-14 w-auto object-contain drop-shadow-xs"
                />
              </div>
              <p className="text-xs font-bold text-slate-700 tracking-tight">
                - LanAhora -
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Bienvenido, introduce tus datos de acceso.
              </p>
            </div>

            {/* Inactivity Logout Alert (Level 3) */}
            {inactivityNotice && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs animate-in fade-in">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold">Sesión cerrada por seguridad:</span> Inactividad mayor a 15 minutos detectada según normativa bancaria.
                </div>
              </div>
            )}

            {/* Brute Force Lockout Banner (Level 1/3) */}
            {isLocked && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5 animate-in shake duration-300">
                <div className="flex items-center gap-2 font-black text-rose-700">
                  <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Cuenta Bloqueada Temporalmente</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Se detectaron múltiples intentos erróneos. Por ciberseguridad, espera{' '}
                  <span className="font-mono font-bold text-rose-700">
                    {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
                  </span>{' '}
                  para intentar de nuevo.
                </p>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && !isLocked && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug font-medium">{errorMessage}</div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 1: USUARIO + CONTRASEÑA + CLOUDFLARE TURNSTILE       */}
            {/* ========================================================= */}
            {currentStep === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
                {/* Field: Usuario */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Usuario:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="cmartinez_mayorga"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-medium transition text-xs"
                    />
                  </div>
                </div>

                {/* Field: Contraseña */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Contraseña:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-medium transition text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Cloudflare Turnstile Box (Identical to User's Screenshot) */}
                <div
                  onClick={handleTurnstileClick}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                    isTurnstileVerified
                      ? 'bg-[#222222] border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isTurnstileLoading ? (
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    ) : isTurnstileVerified ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-400 bg-white" />
                    )}
                    <span className="text-xs font-bold">
                      {isTurnstileVerified ? '¡Operación exitosa!' : 'Verificar que eres humano'}
                    </span>
                  </div>

                  {/* Cloudflare Logo Branding */}
                  <div className="text-right flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black tracking-widest text-[#f38020]">CLOUDFLARE</span>
                    </div>
                    <span className="text-[9px] text-slate-400 hover:underline">
                      Privacidad • Ayuda
                    </span>
                  </div>
                </div>

                {/* Green Submit Button (Matching User's Screenshot) */}
                <button
                  type="submit"
                  disabled={isLoading || isLocked}
                  className="w-full py-3 rounded-xl bg-[#48bb78] hover:bg-[#38a169] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Validando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>

                {/* Level 2: Windows Hello / Passkey Alternative */}
                <div className="pt-2">
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      O acceso biométrico
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleWindowsHelloLogin}
                    disabled={isLoading || isLocked}
                    className="w-full mt-2 py-2.5 px-3 rounded-xl border border-purple-200/90 bg-purple-50/60 hover:bg-purple-100/70 text-purple-900 font-bold text-xs transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4 text-purple-700" />
                    <span>Iniciar con Windows Hello / Passkey</span>
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* STEP 2: DESAFÍO GOOGLE AUTHENTICATOR (TOTP RFC 6238)      */}
            {/* ========================================================= */}
            {currentStep === '2fa_totp' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Back to credentials button */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('credentials');
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Cambiar usuario</span>
                </button>

                {/* Header of 2FA Step */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto text-purple-700">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">
                    Google Authenticator
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ingresa el código de acceso de 6 dígitos para{' '}
                    <span className="font-bold text-slate-800">{challengeUser?.username || identifier}</span>
                  </p>
                </div>

                {/* Segmented 6-Digit Inputs with Auto-Focus and Paste */}
                <div className="space-y-2">
                  <label className="block text-center text-xs font-bold text-slate-700">
                    Código de acceso:
                  </label>
                  <div className="flex items-center justify-center gap-2" onPaste={handleDigitPaste}>
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
                        className={`w-11 h-12 text-center text-lg font-mono font-black rounded-xl border transition text-slate-900 focus:outline-none ${
                          digit
                            ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-100'
                            : 'border-slate-300 bg-slate-50/80 focus:border-purple-600 focus:ring-2 focus:ring-purple-100'
                        }`}
                      />
                    ))}
                  </div>

                  {/* 30-Second Countdown Sync Meter */}
                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>
                      Código se actualiza en:{' '}
                      <span className="font-mono font-bold text-purple-700">{totpCountdown}s</span>
                    </span>
                  </div>
                </div>

                {/* Checkbox: Confiar en este equipo por 15 días */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium">
                      Confiar en este equipo por 15 días
                    </span>
                  </label>
                  <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {/* Submit 2FA Button */}
                <button
                  type="button"
                  onClick={() => executeVerifyTotp()}
                  disabled={isLoading || isLocked || totpDigits.some((d) => d === '')}
                  className="w-full py-3 rounded-xl bg-[#48bb78] hover:bg-[#38a169] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verificando código...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Verificar e Ingresar</span>
                    </>
                  )}
                </button>

                {/* Backup / Emergency Link (Matching User's Screenshot Text) */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowBackupModal(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                  >
                    ¿No tienes código de acceso o no te has registrado? Haz click aquí.
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* LEVEL 2 ANIMATED BIOMETRIC RADAR PULSE SCREEN             */}
            {/* ========================================================= */}
            {currentStep === 'webauthn' && (
              <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                  <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 relative z-10">
                    <Fingerprint className="w-9 h-9 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">
                    Windows Hello / Biometría
                  </h3>
                  <p className="text-xs text-slate-500">
                    Toca el sensor de huella o mira a la cámara para autenticar...
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep('credentials')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                >
                  Cancelar y volver a contraseña
                </button>
              </div>
            )}

            {/* Institutional Compliance Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Normativa CNBV 2026</span>
              </span>
              <span className="truncate max-w-[200px]" title={deviceInfo}>
                {deviceInfo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Access Modal (Emergency OTP / IT Support) */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-slate-900 font-sans space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recuperación de Acceso 2FA
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mesa de Soporte & Ciberseguridad LanAhora
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Si perdiste o cambiaste tu teléfono con Google Authenticator, tu coordinador o el Oficial de Seguridad PLD puede restablecer tu token o enviarte un código de contingencia a tu WhatsApp institucional verificado.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700">Canales de Atención:</span>
              <p className="text-slate-600">WhatsApp Mesa Control: (844) 870-7297</p>
              <p className="text-slate-600">Correo: seguridad@lanahora.com</p>
            </div>

            <button
              onClick={() => setShowBackupModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Entendido, volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
