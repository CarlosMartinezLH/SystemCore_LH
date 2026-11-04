'use client';

import React, { useState } from 'react';
import { StageId, OriginType } from '@/types/crm';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStage: StageId;
  onCreate: (leadData: {
    opportunityName: string;
    firstName: string;
    lastName: string;
    phone: string;
    origin: OriginType;
    stage: StageId;
  }) => void;
}

export default function NewLeadModal({
  isOpen,
  onClose,
  defaultStage,
  onCreate,
}: NewLeadModalProps) {
  const [opportunityName, setOpportunityName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [origin, setOrigin] = useState<OriginType>('CAMBACEO');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityName.trim() && (!firstName.trim() || !lastName.trim())) return;

    const opName = opportunityName.trim()
      ? opportunityName.trim().toUpperCase()
      : `${firstName.trim()} ${lastName.trim()}${phone ? ` / ${phone.trim()}` : ''}`.toUpperCase();

    onCreate({
      opportunityName: opName,
      firstName: firstName.trim().toUpperCase(),
      lastName: lastName.trim().toUpperCase(),
      phone: phone.trim(),
      origin,
      stage: defaultStage || 'contacto',
    });

    setOpportunityName('');
    setFirstName('');
    setLastName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header with LanAhora Royal Blue */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-blue-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Nuevo Prospecto (Lead)</h3>
              <p className="text-[11px] text-blue-100">Originación de Distribuidora de Vales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nombre de la Oportunidad (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: LORENA DE LA TORRE / 8717253770"
              value={opportunityName}
              onChange={(e) => setOpportunityName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Si se deja vacío, se generará con el nombre completo y teléfono.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nombre(s) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nombre(s)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition uppercase"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Apellidos <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Apellidos"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Teléfono Celular (10 dígitos)
            </label>
            <input
              type="tel"
              placeholder="Ej: 8711234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Origen del Prospecto
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value as OriginType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            >
              <option value="CAMBACEO">Cambaceo (Prospección en campo)</option>
              <option value="REDES_SOCIALES">Redes Sociales (Facebook / Instagram)</option>
              <option value="REFERIDO">Referido por otra Distribuidora</option>
              <option value="SUCURSAL">Visita espontánea en Sucursal</option>
              <option value="CALL_CENTER">Call Center / Campaña Inbound</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold transition shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>Crear Oportunidad</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
