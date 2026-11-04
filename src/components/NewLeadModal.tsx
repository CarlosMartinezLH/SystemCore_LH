'use client';

import React, { useState } from 'react';
import { StageId, OriginType } from '@/types/crm';
import { X, UserPlus } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#171a23] border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#1f2430]">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <UserPlus className="w-4 h-4 text-teal-400" />
            <span>Nuevo Prospecto (Lead)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Nombre de la Oportunidad
            </label>
            <input
              type="text"
              placeholder="Ej. CONSULTA MESA o LORENA DE LA TORRE / 871..."
              value={opportunityName}
              onChange={(e) => setOpportunityName(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Si se deja vacío, se generará con el nombre y teléfono.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nombre(s) *</label>
              <input
                type="text"
                required
                placeholder="Ej. MARIA ELENA"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Apellidos *</label>
              <input
                type="text"
                required
                placeholder="Ej. GARCIA LOPEZ"
                value={lastName}
                onChange={(e) => setLastName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Teléfono Móvil *</label>
            <input
              type="tel"
              required
              placeholder="10 dígitos (ej. 8711234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Origen de Captación</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value as OriginType)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="CAMBACEO">CAMBACEO TRADICIONAL</option>
              <option value="COMERCIOS">COMERCIOS (SECTORES INEGI)</option>
              <option value="PLANTON">PLANTÓN (PUNTOS ESTRATÉGICOS)</option>
              <option value="TELEMARKETING">TELEMARKETING</option>
              <option value="DISTRIBUIDOR">REFERIDO POR DV (DISTRIBUIDOR)</option>
              <option value="COORDINADOR DE NEGOCIOS">COORDINADOR DE NEGOCIOS</option>
              <option value="RECONSULTA">RECONSULTA</option>
              <option value="OTRO">OTRO</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-medium shadow transition"
            >
              Crear Prospecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
