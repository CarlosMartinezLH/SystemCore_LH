'use client';

import React, { useState } from 'react';
import { UserSession, DEMO_USERS } from '@/types/auth';
import { Lock, Mail, Building2, ShieldCheck, ArrowRight, Smartphone, Check } from 'lucide-react';

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
    <div className="min-h-screen w-full flex bg-[#eff4fc] text-slate-900 font-sans">
      {/* Left Column: Official LanAhora Brand Banner (Identical to their portal) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] text-white overflow-hidden shadow-2xl">
        {/* Glow Accent Circles */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#facc15] text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
            LH
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              LanAhora <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-yellow-200 border border-white/30 font-bold">SystemCore</span>
            </h1>
            <p className="text-sm text-yellow-300 font-extrabold italic">¡En Ti confiamos!</p>
          </div>
        </div>

        {/* Center Content: Exact value proposition from the company banner */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="bg-[#facc15] text-slate-950 px-6 py-4 rounded-3xl shadow-lg space-y-1">
            <h2 className="text-2xl font-black tracking-tight">
              ¡Sé parte de LanAhora!
            </h2>
            <p className="text-xs font-bold opacity-90">
              Iniciar tu negocio nunca fue tan fácil. Gestión y originación digital de distribuidores de vales.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold text-white">
            {[
              'App Móvil para prospección y armado de expedientes en ruta',
              'Validación inmediata de CURP y Buró de Crédito',
              'Control de asistencia con geolocalización GPS en calle',
              'Cartera activa de más de 7,100 distribuidores y vales digitales',
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#22c55e] text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow">
                  ✓
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-blue-100">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Financiera LanAhora S.A. de C.V. SOFOM E.N.R.</span>
        </div>
      </div>

      {/* Right Column: Clean White Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-blue-100 shadow-xl space-y-6">
          {/* Header */}
          <div>
            <div className="lg:hidden flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#facc15] text-slate-950 font-black text-base flex items-center justify-center shadow">
                LH
              </div>
              <div>
                <span className="font-black text-lg text-blue-800">LanAhora</span>
                <span className="block text-[11px] text-yellow-600 font-bold italic">¡En Ti confiamos!</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa tus credenciales para acceder a la plataforma central.
            </p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="p-3 rounded-2xl bg-[#eff4fc] border border-blue-100 space-y-2">
            <span className="text-[11px] font-bold text-blue-900 block">
              Prueba rápida por perfil institucional:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoSelect('admin')}
                className={`p-2 rounded-xl text-left transition border ${
                  selectedDemoKey === 'admin'
                    ? 'bg-[#2563eb] border-[#2563eb] text-white font-bold shadow'
                    : 'bg-white border-blue-200 text-slate-700 hover:bg-blue-50'
                }`}
              >
                <div className="font-extrabold text-[11px]">Director General</div>
                <div className="text-[10px] opacity-80 truncate">J. Carlos Martínez</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('asesor')}
                className={`p-2 rounded-xl text-left transition border ${
                  selectedDemoKey === 'asesor'
                    ? 'bg-[#2563eb] border-[#2563eb] text-white font-bold shadow'
                    : 'bg-white border-blue-200 text-slate-700 hover:bg-blue-50'
                }`}
              >
                <div className="font-extrabold text-[11px] flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-[#facc15]" /> Asesor Campo
                </div>
                <div className="text-[10px] opacity-80 truncate">Cindy López (Móvil)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('coordinador')}
                className={`p-2 rounded-xl text-left transition border ${
                  selectedDemoKey === 'coordinador'
                    ? 'bg-[#2563eb] border-[#2563eb] text-white font-bold shadow'
                    : 'bg-white border-blue-200 text-slate-700 hover:bg-blue-50'
                }`}
              >
                <div className="font-extrabold text-[11px]">Coord. Comercial</div>
                <div className="text-[10px] opacity-80 truncate">Esaú Espinoza</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('mesa')}
                className={`p-2 rounded-xl text-left transition border ${
                  selectedDemoKey === 'mesa'
                    ? 'bg-[#2563eb] border-[#2563eb] text-white font-bold shadow'
                    : 'bg-white border-blue-200 text-slate-700 hover:bg-blue-50'
                }`}
              >
                <div className="font-extrabold text-[11px]">Mesa de Crédito</div>
                <div className="text-[10px] opacity-80 truncate">Lorena de la Torre</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@lanahora.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Sucursal Operativa
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb] transition appearance-none cursor-pointer"
                >
                  <option value="Corporativo Saltillo">Corporativo Saltillo (Central)</option>
                  <option value="Saltillo Centro">Sucursal Saltillo Centro</option>
                  <option value="Torreón Matriz">Sucursal Torreón Matriz</option>
                  <option value="Monclova Foránea">Sucursal Monclova Foránea</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Validando...</span>
              ) : (
                <>
                  <span>Ingresar a LanAhora</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
