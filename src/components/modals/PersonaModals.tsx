'use client';

import React, { useState } from 'react';
import { PersonaCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  X,
  ShieldCheck,
  CreditCard,
  Camera,
  FolderOpen,
  FileText,
  Printer,
  ArrowRightLeft,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  User,
  Barcode,
  Sparkles,
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCore;
  onUpdatePersona?: (updated: PersonaCore) => void;
}

import SolicitarBuroModal from './SolicitarBuroModal';
import DatosBancariosPersonaView from './DatosBancariosPersonaView';
export { SolicitarBuroModal };

// 2. DATOS BANCARIOS MODAL
export function DatosBancariosModal({ isOpen, onClose, persona, onUpdatePersona }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header con botón cerrar */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Datos Bancarios</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo con la vista legacy completa */}
        <div className="flex-1 overflow-y-auto p-5">
          <DatosBancariosPersonaView
            persona={persona}
            onUpdatePersona={onUpdatePersona}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. EXPEDIENTE DIGITAL & DOCUMENTOS MODAL
export function ExpedienteDigitalModal({ isOpen, onClose, persona }: ModalProps) {
  if (!isOpen) return null;

  const docs = [
    { name: 'Identificación Oficial INE (Frente y Reverso)', tipo: 'PDF / IMG', status: 'VALIDADO', fecha: '28/10/2026' },
    { name: 'Comprobante de Domicilio (Agua/Luz)', tipo: 'PDF', status: 'VALIDADO', fecha: '28/10/2026' },
    { name: 'Constancia de Situación Fiscal (SAT)', tipo: 'PDF', status: 'VALIDADO', fecha: '28/10/2026' },
    { name: 'Pagaré Digital Firmado', tipo: 'PDF', status: persona.pagareEstatusId === 'SIN PAGARE' ? 'PENDIENTE' : 'VALIDADO', fecha: '29/10/2026' },
    { name: 'Carta Declaratoria Prestanombres', tipo: 'PDF', status: 'VALIDADO', fecha: '29/10/2026' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-lg overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <FolderOpen className="w-4 h-4 text-yellow-300" />
            <span>Expediente Digital del Cliente (Nextcloud Storage)</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="font-bold text-slate-900 block">{persona.nombre} {persona.apellidoPaterno}</span>
            <span className="text-[11px] font-mono text-slate-500">ID #{persona.personaId} • CURP: {persona.curp}</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {docs.map((d, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">{d.name}</div>
                  <div className="text-[10px] text-slate-400">{d.tipo} • Subido el {d.fecha}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.status === 'VALIDADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {d.status}
                  </span>
                  <button
                    onClick={() => alert(`Visualizando documento digital: ${d.name}`)}
                    className="px-2 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                  >
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. CANJEAR VALE MODAL (Paynet & STP)
export function CanjearValeModal({ isOpen, onClose, persona }: ModalProps) {
  const { registrarCanje } = useCoreSync();
  const [folioVale, setFolioVale] = useState('V-50495');
  const [noDist, setNoDist] = useState('1002');
  const [monto, setMonto] = useState('3000');
  const [metodo, setMetodo] = useState<'PAYNET' | 'STP'>('PAYNET');
  const [canjeGenerado, setCanjeGenerado] = useState(false);

  if (!isOpen) return null;

  const handleGenerarCanje = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarCanje({
        folio: folioVale,
        personaId: persona.personaId,
        clienteNombre: `${persona.nombre} ${persona.apellidoPaterno}`,
        distribuidorId: Number(noDist),
        monto: Number(monto),
        metodo,
        curp: persona.curp,
      });
      setCanjeGenerado(true);
    } catch (err) {
      alert('Error procesando canje: ' + (err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Barcode className="w-4 h-4 text-yellow-300" />
            <span>Canje de Vale Digital LanAhora</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {!canjeGenerado ? (
            <form onSubmit={handleGenerarCanje} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Beneficiario / Cliente Final</label>
                <input
                  type="text"
                  disabled
                  value={`${persona.nombre} ${persona.apellidoPaterno} (${persona.curp})`}
                  className="w-full p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Folio de Vale</label>
                  <input
                    type="text"
                    required
                    value={folioVale}
                    onChange={(e) => setFolioVale(e.target.value.toUpperCase())}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">No. Distribuidor (DV)</label>
                  <input
                    type="number"
                    required
                    value={noDist}
                    onChange={(e) => setNoDist(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Monto a Canjear ($ MXN)</label>
                <input
                  type="number"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Canal de Desembolso</label>
                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="PAYNET">Código de Barras Paynet (Retiro en 7-Eleven / Farmacias)</option>
                  <option value="STP">Transferencia Inmediata SPEI (STP)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black shadow transition"
              >
                Autorizar y Canjear Vale
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center animate-in fade-in">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <h4 className="font-black text-slate-900 text-sm">¡Vale Canjeado Exitosamente!</h4>
                <p className="text-slate-600 text-xs mt-1">
                  Folio {folioVale} por <strong>${Number(monto).toLocaleString('es-MX')} MXN</strong> asignado a #{noDist}.
                </p>
                <div className="mt-3 p-3 bg-white rounded-xl border border-dashed border-emerald-300 font-mono">
                  <span className="text-[10px] text-slate-400 block">Referencia Paynet / SPEI:</span>
                  <span className="text-lg font-black tracking-widest text-blue-700">9281 0029 4810 9921</span>
                </div>
              </div>

              <button
                onClick={() => setCanjeGenerado(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Canjear Otro Vale
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import CartaPrestanombresModal from './CartaPrestanombresModal';
export { CartaPrestanombresModal };

// 5. CARTA DECLARATORIA PRESTANOMBRES (OFICIAL & IMPRIMIBLE)
export function PrestanombresModal({ isOpen, onClose, persona }: ModalProps) {
  return (
    <CartaPrestanombresModal
      isOpen={isOpen}
      onClose={onClose}
      persona={persona}
    />
  );
}

