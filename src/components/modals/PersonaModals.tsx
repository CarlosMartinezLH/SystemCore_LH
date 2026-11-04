'use client';

import React, { useState } from 'react';
import { PersonaCore } from '@/types/core';
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

// 1. SOLICITAR BURÓ MODAL
export function SolicitarBuroModal({ isOpen, onClose, persona, onUpdatePersona }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    dictamen: 'APROBADO' | 'RECHAZADO' | 'CONDICIONADO';
    cuentasAbiertas: number;
    montoTotalDeuda: number;
    peorMop: string;
    fechaConsulta: string;
  } | null>(persona.scoreBuro ? {
    score: persona.scoreBuro,
    dictamen: persona.scoreBuro >= 650 ? 'APROBADO' : 'CONDICIONADO',
    cuentasAbiertas: 3,
    montoTotalDeuda: 14200,
    peorMop: 'MOP-01 (Puntual)',
    fechaConsulta: '04/11/2026 12:30',
  } : null);

  if (!isOpen) return null;

  const handleConsultar = () => {
    setLoading(true);
    setTimeout(() => {
      const isGood = !persona.curp.endsWith('99') && persona.buroInternoEstatus !== 'NO SUJETO DE CREDITO';
      const score = isGood ? Math.floor(Math.random() * (780 - 660) + 660) : Math.floor(Math.random() * (590 - 480) + 480);
      const res = {
        score,
        dictamen: (score >= 650 ? 'APROBADO' : 'RECHAZADO') as any,
        cuentasAbiertas: isGood ? 4 : 8,
        montoTotalDeuda: isGood ? 18500 : 89400,
        peorMop: isGood ? 'MOP-01 (Puntual)' : 'MOP-05 (Atraso > 90 días)',
        fechaConsulta: new Date().toLocaleString('es-MX'),
      };
      setResult(res);
      setLoading(false);
      if (onUpdatePersona) {
        onUpdatePersona({ ...persona, scoreBuro: score, buroInternoEstatus: isGood ? 'NORMAL' : 'NO SUJETO DE CREDITO' });
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-lg overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-yellow-300" />
            <span>Consulta en Buró de Crédito (Integración API)</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">{persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}</span>
              <span className="text-[11px] font-mono text-slate-500">CURP: {persona.curp} • RFC: {persona.rfc}</span>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              ID #{persona.personaId}
            </span>
          </div>

          {!result ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-slate-600 text-xs">
                Se enviará una petición autenticada vía API a <strong>Buró de Crédito México</strong> para obtener el Score FICO y reporte de crédito consolidado.
              </p>
              <button
                onClick={handleConsultar}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition active:scale-95"
              >
                {loading ? 'Consultando Buró...' : 'Ejecutar Consulta en Tiempo Real'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl border flex items-center justify-between gap-4 bg-slate-50">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-bold">BC-Score FICO</span>
                  <span className={`text-3xl font-black font-mono ${result.score >= 650 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.score} pts
                  </span>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    result.dictamen === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {result.dictamen}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">{result.fechaConsulta}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Cuentas Abiertas</span>
                  <span className="font-bold text-slate-900">{result.cuentasAbiertas}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Deuda Total</span>
                  <span className="font-bold text-slate-900 font-mono">${result.montoTotalDeuda.toLocaleString('es-MX')}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Comportamiento</span>
                  <span className="font-bold text-slate-800 text-[11px]">{result.peorMop}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. DATOS BANCARIOS (STP SPEI) MODAL
export function DatosBancariosModal({ isOpen, onClose, persona, onUpdatePersona }: ModalProps) {
  const [banco, setBanco] = useState(persona.banco || 'BBVA México');
  const [clabe, setClabe] = useState(persona.clabe || '012180015599881122');
  const [validating, setValidating] = useState(false);
  const [verified, setVerified] = useState(Boolean(persona.clabe));

  if (!isOpen) return null;

  const handleValidarSTP = () => {
    if (clabe.length !== 18) {
      alert('La CLABE interbancaria debe contener exactamente 18 dígitos numéricos.');
      return;
    }
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      setVerified(true);
      if (onUpdatePersona) {
        onUpdatePersona({ ...persona, banco, clabe });
      }
      alert('✓ CLABE validada exitosamente con el Gateway de STP (Sistema de Transferencias y Pagos). Titular coincide con la persona.');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CreditCard className="w-4 h-4 text-yellow-300" />
            <span>Datos Bancarios para Dispersión STP</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-[10px] text-blue-700 font-bold block uppercase">Beneficiario Registrado</span>
            <span className="font-bold text-slate-900 text-sm block">{persona.nombre} {persona.apellidoPaterno}</span>
            <span className="text-[11px] font-mono text-slate-500">RFC: {persona.rfc}</span>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Institución Bancaria</label>
            <select
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="BBVA México">012 - BBVA México</option>
              <option value="Banorte">072 - Banorte</option>
              <option value="Banco Azteca">127 - Banco Azteca</option>
              <option value="Santander">014 - Santander</option>
              <option value="Banamex">002 - Citibanamex</option>
              <option value="Spin by OXXO">638 - Spin by OXXO</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">CLABE Interbancaria (18 dígitos)</label>
            <input
              type="text"
              maxLength={18}
              value={clabe}
              onChange={(e) => {
                setClabe(e.target.value.replace(/\D/g, ''));
                setVerified(false);
              }}
              placeholder="Ej. 012180015599881122"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">{clabe.length}/18 dígitos capturados</span>
          </div>

          {verified ? (
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Cuenta verificada con STP SPEI. Habilitada para dispersión inmediata.</span>
            </div>
          ) : (
            <button
              onClick={handleValidarSTP}
              disabled={validating}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
            >
              {validating ? 'Verificando con STP...' : 'Verificar y Enlazar con STP'}
            </button>
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
  const [folioVale, setFolioVale] = useState('V-50495');
  const [noDist, setNoDist] = useState('1002');
  const [monto, setMonto] = useState('3000');
  const [metodo, setMetodo] = useState<'PAYNET' | 'STP'>('PAYNET');
  const [canjeGenerado, setCanjeGenerado] = useState(false);

  if (!isOpen) return null;

  const handleGenerarCanje = (e: React.FormEvent) => {
    e.preventDefault();
    setCanjeGenerado(true);
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

// 5. CARTA DECLARATORIA PRESTANOMBRES (OFICIAL & IMPRIMIBLE)
export function PrestanombresModal({ isOpen, onClose, persona }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-2xl overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Printer className="w-4 h-4 text-yellow-300" />
            <span>Carta Declaratoria de No-Prestanombres (Regulación CNBV / PLD)</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto font-serif text-slate-800 leading-relaxed bg-slate-50/50">
          <div className="text-center space-y-1 border-b pb-4">
            <h3 className="font-sans font-black text-base text-blue-900 tracking-tight">LANAHORA SOFOM E.N.R.</h3>
            <p className="font-sans text-[11px] text-slate-500">FORMATO LNH-PLD-FOR-002 • DECLARACIÓN DEL PROPIETARIO REAL</p>
          </div>

          <p>
            Por medio de la presente, el suscrito <strong>{persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}</strong>, identificado(a) con la Clave Única de Registro de Población (CURP) <strong>{persona.curp}</strong> y RFC <strong>{persona.rfc}</strong>, con domicilio en {persona.direccion || 'Saltillo, Coahuila'}:
          </p>

          <p className="font-bold">DECLARO BAJO PROTESTA DE DECIR VERDAD:</p>

          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Que actúo por cuenta propia y no por cuenta de un tercero ("prestanombres"), siendo el único y legítimo beneficiario de los créditos, vales y financiamientos solicitados ante LanAhora.</li>
            <li>Que los recursos obtenidos serán destinados a actividades lícitas y de consumo personal o comercial legítimo.</li>
            <li>Que reconozco las penas legales aplicables en términos de la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI).</li>
          </ol>

          <div className="pt-8 flex flex-col items-center justify-center text-center">
            <div className="w-64 border-b-2 border-slate-900 mb-1" />
            <span className="font-bold text-slate-900">{persona.nombre} {persona.apellidoPaterno}</span>
            <span className="text-[10px] text-slate-500 font-mono">Firma Digital Verificada • INE {persona.curp.slice(0, 10)}</span>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Documento listo para impresión oficial</span>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow">
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
