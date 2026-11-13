'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import { formatMoney } from '@/lib/utils/formatters';
import {
  X,
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Hash,
  User,
  Building,
  Sparkles,
  Receipt,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface NuevoCreditoPersonalResult {
  creditoId: number;
  personaId: number;
  distribuidorId: number;
  nombreCliente: string;
  condiciones: string;
  plazos: number;
  noCheque?: string;
  desembolso: string;
  capital: number;
  interes: number;
  seguro: number;
  iva: number;
  importeTotal: number;
  pagoQuincenal: number;
  fechaRegistro: string;
  fechaPrimerPago: string;
}

interface CreditoPersonaDVModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  onCreditoGenerado?: (credito: NuevoCreditoPersonalResult) => void;
}

export default function CreditoPersonaDVModal({
  isOpen,
  onClose,
  distribuidor,
  onCreditoGenerado,
}: CreditoPersonaDVModalProps) {
  const [mounted, setMounted] = useState(false);

  // Valores predeterminados del disponible y línea personal
  const lineaPersonal = distribuidor.lineaPersonal ?? 10000;
  const disponiblePersonal = distribuidor.disponiblePersonal ?? (distribuidor.lineaPersonal ? distribuidor.lineaPersonal * 0.5 : 10000);

  // Estados del formulario
  const [plazos, setPlazos] = useState<8 | 10>(8);
  const [condiciones, setCondiciones] = useState<string>('VALE 8 QUINCENA(S) DISTRIBUIDOR');
  const [noCheque, setNoCheque] = useState<string>('');
  const [desembolso, setDesembolso] = useState<string>('SPEI STP');
  
  // El usuario solicitó: "el monto debe darnoslo del disponible como credito personal de la distribuidora"
  const [importe, setImporte] = useState<number>(disponiblePersonal);
  const [errorMonto, setErrorMonto] = useState<string | null>(null);

  // Estado de éxito al generar crédito
  const [creditoGenerado, setCreditoGenerado] = useState<NuevoCreditoPersonalResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Al abrir el modal, inicializar el importe con el disponible de crédito personal
  useEffect(() => {
    if (isOpen) {
      setImporte(disponiblePersonal);
      setErrorMonto(null);
      setCreditoGenerado(null);
      setPlazos(8);
      setCondiciones('VALE 8 QUINCENA(S) DISTRIBUIDOR');
      setNoCheque('');
      setDesembolso('SPEI STP');
    }
  }, [isOpen, disponiblePersonal]);

  // Manejador de teclado Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Sincronizar plazos con condiciones
  const handleCondicionesChange = (val: string) => {
    setCondiciones(val);
    if (val.includes('10')) {
      setPlazos(10);
    } else {
      setPlazos(8);
    }
  };

  // Cálculo financiero oficial para Crédito Personal (8 o 10 quincenas)
  const calculoFinanciero = useMemo(() => {
    const capitalVal = Math.max(0, Number(importe) || 0);

    // Tasa oficial de crédito personal LanAhora:
    // Para 8 quincenas: Interés 44.8276%, Seguro $520.00 fijo por cada $5,000, IVA 16% sobre interés y seguro
    // Para 10 quincenas: Interés 56.0345%, Seguro $650.00 fijo, IVA 16%
    const factorInteres = plazos === 8 ? 0.448276 : 0.560345;
    const seguroUnit = plazos === 8 ? Math.round((capitalVal * 0.104) * 100) / 100 : Math.round((capitalVal * 0.130) * 100) / 100;
    
    const interes = Math.round((capitalVal * factorInteres) * 100) / 100;
    const seguro = seguroUnit;
    const subtotalGravable = interes + seguro;
    const iva = Math.round((subtotalGravable * 0.16) * 100) / 100;
    const importeTotal = Math.round((capitalVal + interes + seguro + iva) * 100) / 100;
    const pagoQuincenal = Math.round((importeTotal / plazos) * 100) / 100;

    return {
      capital: capitalVal,
      interes,
      seguro,
      iva,
      importeTotal,
      pagoQuincenal,
    };
  }, [importe, plazos]);

  // Validación del importe en tiempo real
  const handleImporteChange = (val: number) => {
    setImporte(val);
    if (val <= 0) {
      setErrorMonto('El importe a financiar debe ser mayor a $0.00');
    } else if (val > disponiblePersonal) {
      setErrorMonto(
        `El importe excede el saldo disponible de crédito personal (${formatMoney(disponiblePersonal)})`
      );
    } else {
      setErrorMonto(null);
    }
  };

  // Generar el Crédito Personal
  const handleGenerarCredito = () => {
    if (importe <= 0) {
      setErrorMonto('El importe a financiar debe ser mayor a $0.00');
      return;
    }
    if (importe > disponiblePersonal) {
      setErrorMonto(
        `El importe excede el saldo disponible de crédito personal (${formatMoney(disponiblePersonal)})`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Generar ID de crédito aleatorio dentro del rango oficial
      const nuevoFolio = Math.floor(432000 + Math.random() * 9000);
      const hoyStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      // Fecha estimada del primer pago (próxima quincena: 05 o 20)
      const fechaPrimerPagoStr = '05/12/2026';

      const nuevoCredito: NuevoCreditoPersonalResult = {
        creditoId: nuevoFolio,
        personaId: distribuidor.personaId || 14076,
        distribuidorId: distribuidor.noDist,
        nombreCliente: distribuidor.nombreDistribuidor,
        condiciones,
        plazos,
        noCheque: noCheque.trim() || undefined,
        desembolso,
        capital: calculoFinanciero.capital,
        interes: calculoFinanciero.interes,
        seguro: calculoFinanciero.seguro,
        iva: calculoFinanciero.iva,
        importeTotal: calculoFinanciero.importeTotal,
        pagoQuincenal: calculoFinanciero.pagoQuincenal,
        fechaRegistro: hoyStr,
        fechaPrimerPago: fechaPrimerPagoStr,
      };

      setCreditoGenerado(nuevoCredito);
      setIsSubmitting(false);

      if (onCreditoGenerado) {
        onCreditoGenerado(nuevoCredito);
      }
    }, 450);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* HEADER: CREDITO PERSONA DV                              */}
        {/* ======================================================== */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                Credito Persona DV
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Préstamo personal exclusivo para distribuidora
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* CONTENIDO DEL MODAL                                      */}
        {/* ======================================================== */}
        <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4">
          {creditoGenerado ? (
            /* VISTA DE ÉXITO TRAS GENERAR EL CRÉDITO */
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 tracking-tight">
                  ¡Crédito Personal Generado con Éxito!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Se ha registrado el crédito <strong className="font-mono text-blue-700">#{creditoGenerado.creditoId}</strong> y descontado de la línea personal.
                </p>
              </div>

              {/* Ficha Resumen de Emisión */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Distribuidora:</span>
                  <span className="font-bold text-slate-900">{creditoGenerado.nombreCliente}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Capital Financiado:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatMoney(creditoGenerado.capital)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Plazo Seleccionado:</span>
                  <span className="font-bold text-blue-700">{creditoGenerado.plazos} Quincenas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Pago Quincenal:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatMoney(creditoGenerado.pagoQuincenal)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Importe Total a Pagar:</span>
                  <span className="font-mono font-black text-slate-900">
                    {formatMoney(creditoGenerado.importeTotal)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Método Desembolso:</span>
                  <span className="font-bold text-slate-800">{creditoGenerado.desembolso}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                >
                  Aceptar y Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE CAPTURA IDÉNTICO A LA CAPTURA DEL USUARIO */
            <div className="space-y-3.5 text-xs">
              
              {/* BANNER INFORMATIVO DE DISPONIBLE DE CRÉDITO PERSONAL */}
              <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Disponible Crédito Personal DV
                  </span>
                  <p className="text-base font-black font-mono text-blue-950 mt-0.5">
                    {formatMoney(disponiblePersonal)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-medium block">Línea Personal</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {formatMoney(lineaPersonal)}
                  </span>
                </div>
              </div>

              {/* CAMPO 1: PersonaID */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="font-bold text-slate-700">PersonaID:</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    disabled
                    value={distribuidor.personaId || 14076}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 cursor-not-allowed shadow-2xs"
                  />
                </div>
              </div>

              {/* CAMPO 2: Nombre */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="font-bold text-slate-700">Nombre:</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    disabled
                    value={distribuidor.nombreDistribuidor}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 cursor-not-allowed truncate shadow-2xs"
                  />
                </div>
              </div>

              {/* CAMPO 3: DistribuidorID */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="font-bold text-slate-700">DistribuidorID:</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    disabled
                    value={distribuidor.noDist}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 cursor-not-allowed shadow-2xs"
                  />
                </div>
              </div>

              {/* CAMPO 4: Condiciones (Únicamente 8 y 10 Quincenas) */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="font-bold text-slate-700">
                  Condiciones:
                </label>
                <div className="col-span-2">
                  <select
                    value={condiciones}
                    onChange={(e) => handleCondicionesChange(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="VALE 8 QUINCENA(S) DISTRIBUIDOR">
                      VALE 8 QUINCENA(S) DISTRIBUIDOR
                    </option>
                    <option value="VALE 10 QUINCENA(S) DISTRIBUIDOR">
                      VALE 10 QUINCENA(S) DISTRIBUIDOR
                    </option>
                  </select>
                  <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
                    * Préstamo personal exclusivo de 8 y 10 quincenas
                  </span>
                </div>
              </div>

              {/* CAMPO 5: No Cheque */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="font-bold text-slate-700">No Cheque:</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="No. de cheque o referencia (opcional)"
                    value={noCheque}
                    onChange={(e) => setNoCheque(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* CAMPO 6: Desembolso */}
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="font-bold text-slate-700">Desembolso:</label>
                <div className="col-span-2">
                  <select
                    value={desembolso}
                    onChange={(e) => setDesembolso(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="SPEI STP">SPEI STP (Transferencia Interbancaria)</option>
                    <option value="EFECTIVO / CAJA">EFECTIVO / CAJA SUCURSAL</option>
                    <option value="CHEQUE NOMINATIVO">CHEQUE NOMINATIVO</option>
                  </select>
                </div>
              </div>

              {/* CAMPO 7: Importe (Prellenado con el disponible) */}
              <div className="grid grid-cols-3 items-start gap-3 pt-1">
                <label className="font-bold text-slate-700 pt-1.5">Importe:</label>
                <div className="col-span-2 space-y-1.5">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="500"
                      min="500"
                      max={disponiblePersonal}
                      value={importe || ''}
                      onChange={(e) => handleImporteChange(Number(e.target.value))}
                      className={`w-full pl-7 pr-3 py-1.5 border rounded-lg text-xs font-mono font-black text-slate-900 focus:outline-none shadow-2xs ${
                        errorMonto ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 bg-white focus:border-blue-500'
                      }`}
                    />
                  </div>

                  {/* Atajos de montos rápidos */}
                  <div className="flex flex-wrap gap-1">
                    {[2000, 3000, 5000].map((montoQuick) => (
                      <button
                        key={montoQuick}
                        type="button"
                        onClick={() => handleImporteChange(montoQuick)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                          importe === montoQuick
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {formatMoney(montoQuick)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleImporteChange(disponiblePersonal)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                        importe === disponiblePersonal
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                      title="Seleccionar todo el crédito disponible"
                    >
                      Disponible ({formatMoney(disponiblePersonal)})
                    </button>
                  </div>

                  {errorMonto && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMonto}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* CUADRO DE CÁLCULO ESTIMADO (PROYECCIÓN QUINCENAL) */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Pago Quincenal Estimado:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatMoney(calculoFinanciero.pagoQuincenal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Importe Total a Pagar ({plazos} qzas):</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatMoney(calculoFinanciero.importeTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-200/60 pt-1">
                  <span>Interés Ordinario + IVA:</span>
                  <span className="font-mono text-slate-700">
                    {formatMoney(calculoFinanciero.interes + calculoFinanciero.iva)}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* FOOTER: BOTONES CERRAR Y GENERAR CRÉDITO                */}
        {/* ======================================================== */}
        {!creditoGenerado && (
          <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleGenerarCredito}
              disabled={isSubmitting || !!errorMonto || importe <= 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <span>Generar Crédito</span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
