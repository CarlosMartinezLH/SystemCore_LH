'use client';

import React, { useState } from 'react';
import { UserSession, DEMO_USERS } from '@/types/auth';
import { Lock, Mail, Building2, ShieldCheck, ArrowRight, Smartphone, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('carlos_martinez@lanahora.com');
  const [password, setPassword] = useState('••••••••••••');
  const [branch, setBranch] = useState('Corporativo Saltillo');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoKey, setSelectedDemoKey] = useState<string>('admin');

  const handleDemoSelect = (key: string) => {
    setSelectedDemoKey(key);
    const demo = DEMO_USERS[key];
    if (demo) {
      setEmail(demo.email);
      setBranch(demo.branch);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = DEMO_USERS[selectedDemoKey] || DEMO_USERS.admin;
      setIsLoading(false);
      onLoginSuccess({
        ...user,
        branch,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0c1220] text-slate-100 font-sans">
      {/* Left Column: Visual Brand Experience */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#0c1220] via-[#111a2e] to-[#1e293b] border-r border-slate-800/80 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            LH
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              LanAhora <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Core 2.0</span>
            </h1>
            <p className="text-xs text-amber-400/90 font-medium italic">¡En Ti confiamos!</p>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistema Central Financiero Unificado</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Control integral de crédito por vales, red de distribuidores y prospección en calle.
          </h2>

          <div className="space-y-3 pt-2 text-sm text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <span>App móvil para prospección y recolección de expedientes en ruta.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <span>Validación de CURP y buró de crédito en tiempo real.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <span>Cartera activa de más de 7,100 distribuidoras y colocación digital.</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Acceso seguro encriptado • Cumplimiento CNBV y PLD</span>
        </div>
      </div>

      {/* Right Column: Interactive Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-7">
          {/* Header Mobile / Title */}
          <div>
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                LH
              </div>
              <div>
                <span className="font-bold text-lg text-white">LanAhora</span>
                <span className="block text-[10px] text-amber-400 italic">¡En Ti confiamos!</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa tus credenciales institucionales para acceder al SystemCore LanAhora.
            </p>
          </div>

          {/* Quick Persona Demo Switcher */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Acceso Rápido por Rol (Demostración):</span>
              <span className="text-[10px] text-amber-400 font-mono">1-Clic</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoSelect('admin')}
                className={`p-2 rounded-lg text-left transition border ${
                  selectedDemoKey === 'admin'
                    ? 'bg-amber-500/20 border-amber-500/60 text-white font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-[11px]">Director General</div>
                <div className="text-[10px] text-slate-400 truncate">J. Carlos Martínez</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('asesor')}
                className={`p-2 rounded-lg text-left transition border ${
                  selectedDemoKey === 'asesor'
                    ? 'bg-amber-500/20 border-amber-500/60 text-white font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1 text-emerald-400">
                  <Smartphone className="w-3 h-3" /> Asesor en Calle
                </div>
                <div className="text-[10px] text-slate-400 truncate">Cindy López (Móvil)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('coordinador')}
                className={`p-2 rounded-lg text-left transition border ${
                  selectedDemoKey === 'coordinador'
                    ? 'bg-amber-500/20 border-amber-500/60 text-white font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-[11px]">Coord. Comercial</div>
                <div className="text-[10px] text-slate-400 truncate">Esaú Espinoza</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('mesa')}
                className={`p-2 rounded-lg text-left transition border ${
                  selectedDemoKey === 'mesa'
                    ? 'bg-amber-500/20 border-amber-500/60 text-white font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-[11px]">Mesa de Crédito</div>
                <div className="text-[10px] text-slate-400 truncate">Lorena de la Torre</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email input */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Usuario o Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@lanahora.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium">Contraseña</label>
                <a
                  href="#olvide"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Para restablecer tu contraseña, contacta a Soporte de Sistemas Corporativo Saltillo.');
                  }}
                  className="text-amber-400 hover:underline text-[11px]"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Branch selector */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Sucursal o Centro Operativo
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 transition appearance-none cursor-pointer"
                >
                  <option value="Corporativo Saltillo">Corporativo Saltillo (Central)</option>
                  <option value="Saltillo Centro">Sucursal Saltillo Centro</option>
                  <option value="Torreón Matriz">Sucursal Torreón Matriz</option>
                  <option value="Monclova Foránea">Sucursal Monclova Foránea</option>
                </select>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="remember" className="text-slate-400 text-xs cursor-pointer">
                Mantener sesión activa en este equipo
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            Financiera LanAhora S.A. de C.V. SOFOM E.N.R. • v2.4.0
          </div>
        </div>
      </div>
    </div>
  );
}

