'use client';

import React, { useState, useRef } from 'react';
import { PersonaCore } from '@/types/core';
import { X, CheckCircle2, ShieldCheck, Upload, AlertCircle } from 'lucide-react';

interface SolicitarBuroModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCore;
  onUpdatePersona?: (updated: PersonaCore) => void;
}

export default function SolicitarBuroModal({
  isOpen,
  onClose,
  persona,
  onUpdatePersona,
}: SolicitarBuroModalProps) {
  // File inputs
  const [reversoFileName, setReversoFileName] = useState<string>('');
  const [anversoFileName, setAnversoFileName] = useState<string>('');
  const reversoInputRef = useRef<HTMLInputElement>(null);
  const anversoInputRef = useRef<HTMLInputElement>(null);

  // Form inputs
  const [tipoDistribuidor, setTipoDistribuidor] = useState<string>('DISTRIBUIDORA TRADICIONAL');
  const [experiencia, setExperiencia] = useState<string>('1 A 3 AÑOS');
  const [montoIngresos, setMontoIngresos] = useState<string>(
    persona.ingresosMensuales ? Number(persona.ingresosMensuales).toFixed(2) : '0.00'
  );
  const [sucursal, setSucursal] = useState<string>('ZONA A - MATRIZ');
  const [observacion, setObservacion] = useState<string>(persona.observaciones || '');

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    score: number;
    folio: string;
    dictamen: 'APROBADO' | 'CONDICIONADO' | 'RECHAZADO';
  } | null>(null);

  if (!isOpen) return null;

  // Persona display string: "122776 - OSVALDO ANTONIO CHIQUETE RAMIREZ"
  const personaDisplay = `${persona.personaId} - ${persona.nombre}${
    persona.nombreAdicional ? ' ' + persona.nombreAdicional : ''
  } ${persona.apellidoPaterno} ${persona.apellidoMaterno}`.toUpperCase();

  const handleReversoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReversoFileName(file.name);
    }
  };

  const handleAnversoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnversoFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate real-time Buró scoring & registration
      await new Promise((res) => setTimeout(res, 600));

      const isClean = !persona.curp?.endsWith('99');
      const score = isClean
        ? Math.floor(Math.random() * (760 - 670) + 670)
        : Math.floor(Math.random() * (580 - 490) + 490);
      const dictamen = score >= 650 ? 'APROBADO' : 'CONDICIONADO';
      const folio = `BC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const updatedPersona: PersonaCore = {
        ...persona,
        scoreBuro: score,
        buroInternoEstatus: score >= 650 ? 'NORMAL' : 'NO SUJETO DE CREDITO',
        ingresosMensuales: parseFloat(montoIngresos) || persona.ingresosMensuales || 0,
        observaciones: observacion
          ? `${persona.observaciones ? persona.observaciones + ' | ' : ''}Buró solicitado (${folio}): ${observacion}`
          : persona.observaciones,
      };

      // Sync with backend API
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_CLIENTE',
          persona: updatedPersona,
          metadata: {
            tipoDistribuidor,
            experiencia,
            sucursal,
            montoIngresos: parseFloat(montoIngresos) || 0,
            folio,
            score,
            dictamen,
            anversoFileName,
            reversoFileName,
          },
        }),
      }).catch(() => {});

      if (onUpdatePersona) {
        onUpdatePersona(updatedPersona);
      }

      setFeedback({ score, folio, dictamen });
      setTimeout(() => {
        setIsSubmitting(false);
        setFeedback(null);
        onClose();
      }, 1400);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-[540px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">Solicitud de Buro</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800 transition p-1 text-sm font-bold"
            title="Cerrar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 text-xs space-y-3.5">
          {/* Persona Row */}
          <div className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="font-bold text-slate-700">Persona:</label>
            <input
              type="text"
              readOnly
              value={personaDisplay}
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-slate-50 text-slate-800 font-semibold text-xs uppercase cursor-default focus:outline-none"
            />
          </div>

          {/* Section Title: Identificación */}
          <div className="pt-1">
            <h4 className="font-bold text-slate-800 text-xs">Identificación</h4>
          </div>

          {/* Reverso Row */}
          <div className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="text-slate-700 font-medium">Reverso</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                placeholder=""
                value={reversoFileName}
                className="flex-1 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={() => reversoInputRef.current?.click()}
                className="px-3 py-1.5 rounded border border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs whitespace-nowrap transition active:scale-95 shadow-xs"
              >
                Examinar...
              </button>
              <input
                ref={reversoInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleReversoChange}
              />
            </div>
          </div>

          {/* Anverso Row */}
          <div className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="text-slate-700 font-medium">Anverso</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                placeholder=""
                value={anversoFileName}
                className="flex-1 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={() => anversoInputRef.current?.click()}
                className="px-3 py-1.5 rounded border border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs whitespace-nowrap transition active:scale-95 shadow-xs"
              >
                Examinar...
              </button>
              <input
                ref={anversoInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleAnversoChange}
              />
            </div>
          </div>

          {/* Tipo de distribuidor Row */}
          <div className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="text-slate-700 font-medium">Tipo de distribuidor</label>
            <select
              value={tipoDistribuidor}
              onChange={(e) => setTipoDistribuidor(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="DISTRIBUIDORA TRADICIONAL">DISTRIBUIDORA TRADICIONAL</option>
              <option value="DISTRIBUIDORA DIGITAL">DISTRIBUIDORA DIGITAL</option>
              <option value="DISTRIBUIDORA NUEVA">DISTRIBUIDORA NUEVA</option>
              <option value="CAMBIO DE ZONA">CAMBIO DE ZONA</option>
              <option value="REACTIVACIÓN">REACTIVACIÓN</option>
            </select>
          </div>

          {/* Experiencia Row */}
          <div className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="text-slate-700 font-medium">Experiencia</label>
            <select
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="SIN EXPERIENCIA">SIN EXPERIENCIA</option>
              <option value="MENOS DE 1 AÑO">MENOS DE 1 AÑO</option>
              <option value="1 A 3 AÑOS">1 A 3 AÑOS</option>
              <option value="3 A 5 AÑOS">3 A 5 AÑOS</option>
              <option value="MÁS DE 5 AÑOS">MÁS DE 5 AÑOS</option>
              <option value="EXPERIENCIA EN OTRAS VALERAS">EXPERIENCIA EN OTRAS VALERAS</option>
            </select>
          </div>

          {/* Monto de ingresos Row */}
          <div className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="text-slate-700 font-medium">Monto de ingresos</label>
            <input
              type="text"
              value={montoIngresos}
              onChange={(e) => setMontoIngresos(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Sucursal Row (Zonas A, B, C) */}
          <div className="grid grid-cols-[130px_1fr] items-center gap-3">
            <label className="text-slate-700 font-medium">Sucursal</label>
            <select
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ZONA A - MATRIZ">ZONA A - MATRIZ</option>
              <option value="ZONA B - NORTE">ZONA B - NORTE</option>
              <option value="ZONA C - SUR">ZONA C - SUR</option>
              <option value="ZONA A - GUADALAJARA">ZONA A - GUADALAJARA</option>
              <option value="ZONA B - MONTERREY">ZONA B - MONTERREY</option>
              <option value="ZONA C - TIJUANA">ZONA C - TIJUANA</option>
            </select>
          </div>

          {/* Observación Row */}
          <div className="space-y-1 pt-1">
            <label className="font-medium text-slate-700 block">Observación</label>
            <textarea
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 resize-y"
            />
          </div>

          {/* Success Banner */}
          {feedback && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Solicitud registrada · Folio {feedback.folio}</span>
              </div>
              <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Score FICO: {feedback.score} pts
              </span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 min-w-[80px]"
            >
              {isSubmitting ? 'Guardando...' : 'Aceptar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-medium text-xs transition"
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
