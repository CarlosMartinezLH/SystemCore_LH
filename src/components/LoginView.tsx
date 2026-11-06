'use client';

import React, { useState } from 'react';
import { UserSession, INSTITUTIONAL_USERS } from '@/types/auth';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('carlos_martinez@lanahora.com');
  const [password, setPassword] = useState('lanahora2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      // Match by exact email and password
      const matchedUser = INSTITUTIONAL_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && (u.password === password || !u.password)
      );

      if (matchedUser) {
        setIsLoading(false);
        onLoginSuccess(matchedUser);
      } else {
        setIsLoading(false);
        setErrorMessage('Credenciales inválidas. Verifique su correo institucional y contraseña.');
      }
    }, 500);
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
              className="w-full py-3 rounded-2xl bg-[#facc15] hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm shadow-md shadow-amber-300/40 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a SystemCore</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Institutional Legal Footer */}
      <div className="w-full max-w-md text-center py-2 space-y-1">
        <p className="text-[11px] text-slate-500 font-medium">
          Financiera LanAhora S.A. de C.V. SOFOM E.N.R.
        </p>
        <p className="text-[10px] text-slate-400">
          Uso exclusivo para personal autorizado. Todos los accesos son monitoreados.
        </p>
      </div>
    </div>
  );
}
