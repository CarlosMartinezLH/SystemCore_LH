'use client';

import React, { useState, useEffect } from 'react';
import { UserSession } from '@/types/auth';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('carlos_martinez@lanahora.com');
  const [password, setPassword] = useState('lanahora2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKeycloakLive, setIsKeycloakLive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        setIsKeycloakLive(data.available === true);
      })
      .catch(() => {
        setIsKeycloakLive(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.session) {
        setIsLoading(false);
        onLoginSuccess(data.session);
      } else {
        setIsLoading(false);
        setErrorMessage(data.error || 'Credenciales inválidas. Verifique su correo institucional y contraseña.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Error de conexión al servidor de autenticación.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 text-slate-800 font-sans p-4 sm:p-8">
      {/* Main Centered Authentication Card */}
      <div className="w-full max-w-md my-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-300/40 p-8 sm:p-10 space-y-6">
          {/* Logo */}
          <div className="flex justify-center pb-2">
            <img
              src="/lanahora-logo.png"
              alt="LanAhora"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Keycloak SSO Status Indicator */}
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isKeycloakLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="font-semibold text-slate-700">
                {isKeycloakLive ? 'Keycloak SSO Activo • Realm: LanAhora' : 'Autenticación Institucional'}
              </span>
            </div>
            {isKeycloakLive && (
              <a
                href="http://localhost:8080/admin/master/console/"
                target="_blank"
                rel="noreferrer"
                title="Abrir Consola de Administración Keycloak"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold text-[10px]"
              >
                Admin <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="usuario@lanahora.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-[#facc15] hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm shadow-md shadow-amber-300/40 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Validando con Keycloak OIDC...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Compliance Footer */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>OIDC 2.0 • Tokens Criptográficos RS256</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
