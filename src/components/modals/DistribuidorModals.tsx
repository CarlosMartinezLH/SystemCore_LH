'use client';

import React, { useState } from 'react';
import { DistribuidorCore } from '@/types/core';
import { formatMoney } from '@/lib/utils/formatters';
import {
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  Unlock,
  Users,
  CreditCard,
  Building,
} from 'lucide-react';

interface DVModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  onUpdateDistribuidor?: (updated: DistribuidorCore) => void;
}

// 1. ESTADO DE CUENTA DV (Oficial e Imprimible)
export function EstadoCuentaModal({ isOpen, onClose, distribuidor }: DVModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-2xl overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <FileText className="w-4 h-4 text-yellow-300" />
            <span>Estado de Cuenta Quincenal — DV #{distribuidor.noDist}</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-black text-lg text-slate-900">{distribuidor.nombreDistribuidor}</h3>
              <p className="text-slate-500 font-medium">
                Sucursal: {distribuidor.sucursal} • Coordinador: <strong>{distribuidor.coordinador}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Periodo</span>
              <span className="font-bold text-slate-900 text-sm">Quincena 20 (Nov 2026)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
              <span className="text-[10px] text-blue-700 font-bold block uppercase">Línea de Crédito</span>
              <span className="font-black font-mono text-base text-slate-900">{formatMoney(distribuidor.creditoLimite)}</span>
            </div>
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700 font-bold block uppercase">Saldo por Cobrar</span>
              <span className="font-black font-mono text-base text-rose-700">{formatMoney(distribuidor.saldoActual)}</span>
            </div>
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold block uppercase">Disponible Vales</span>
              <span className="font-black font-mono text-base text-emerald-700">{formatMoney(distribuidor.disponible)}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Desglose de Vales y Cobranza del Periodo</h4>
            <table className="w-full text-left text-xs border rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Folio Vale</th>
                  <th className="p-2.5">Cliente</th>
                  <th className="p-2.5">Monto Vale</th>
                  <th className="p-2.5">Pago Quincenal</th>
                  <th className="p-2.5">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono font-bold text-blue-700">V-50491</td>
                  <td className="p-2.5 font-semibold text-slate-900">MARIA GUADALUPE SANCHEZ</td>
                  <td className="p-2.5 font-mono">$6,000.00</td>
                  <td className="p-2.5 font-mono font-bold text-slate-900">$750.00</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">Al corriente</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono font-bold text-blue-700">V-49912</td>
                  <td className="p-2.5 font-semibold text-slate-900">FERNANDO LOPEZ MENDEZ</td>
                  <td className="p-2.5 font-mono">$4,000.00</td>
                  <td className="p-2.5 font-mono font-bold text-slate-900">$500.00</td>
                  <td className="p-2.5"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">Al corriente</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Generado desde el Core Central LanAhora</span>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow">
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Estado de Cuenta</span>
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

// 2. MENSAJES MASIVOS / BOTMAKER WHATSAPP
export function MensajesMasivosModal({ isOpen, onClose, distribuidor }: DVModalProps) {
  const [template, setTemplate] = useState('CORTE_QUINCENAL');
  const [mensaje, setMensaje] = useState(
    `Hola ${distribuidor.nombreDistribuidor}, te recordamos que el próximo corte de cobranza es este viernes. Tu saldo asignado es de ${formatMoney(distribuidor.saldoActual)}. Agradecemos tu puntualidad en LanAhora.`
  );
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  if (!isOpen) return null;

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-yellow-300" />
            <span>Envío de Notificación WhatsApp (Botmaker)</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {!enviado ? (
            <form onSubmit={handleEnviar} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Destinatario (Distribuidora)</label>
                <input
                  type="text"
                  disabled
                  value={`#${distribuidor.noDist} - ${distribuidor.nombreDistribuidor} (${distribuidor.telefono})`}
                  className="w-full p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Plantilla Autorizada por Meta</label>
                <select
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    if (e.target.value === 'CORTE_QUINCENAL') {
                      setMensaje(`Hola ${distribuidor.nombreDistribuidor}, te recordamos que el corte de cobranza es este viernes. Tu saldo asignado es de ${formatMoney(distribuidor.saldoActual)}.`);
                    } else if (e.target.value === 'AUMENTO_LINEA') {
                      setMensaje(`¡Felicidades ${distribuidor.nombreDistribuidor}! Por tu excelente historial en LanAhora tu línea ha sido incrementada a ${formatMoney(distribuidor.creditoLimite + 10000)}.`);
                    } else {
                      setMensaje(`Estimada ${distribuidor.nombreDistribuidor}, cuentas con un pago pendiente por ${formatMoney(distribuidor.saldoActual)}. Por favor comunícate a tu sucursal.`);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs"
                >
                  <option value="CORTE_QUINCENAL">Recordatorio de Corte Quincenal</option>
                  <option value="AUMENTO_LINEA">Aviso de Aumento de Línea de Crédito</option>
                  <option value="RECORDATORIO_PAGO">Aviso de Cobranza / Pago Vencido</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cuerpo del Mensaje WhatsApp</label>
                <textarea
                  rows={4}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{enviando ? 'Transmitiendo a WhatsApp API...' : 'Enviar Mensaje Vía Botmaker'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">¡Mensaje Entregado!</h4>
              <p className="text-slate-500 text-xs">
                El mensaje oficial de WhatsApp se ha entregado exitosamente al número <strong>{distribuidor.telefono}</strong>.
              </p>
              <button
                onClick={() => setEnviado(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Enviar Otro Mensaje
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

// 3. QUITAR FECHA CASTIGO (DESBLOQUEO DE DISTRIBUIDORA)
export function QuitarCastigoModal({ isOpen, onClose, distribuidor, onUpdateDistribuidor }: DVModalProps) {
  const [motivo, setMotivo] = useState('Convenio de pago acordado con supervisor');
  const [procesando, setProcesando] = useState(false);

  if (!isOpen) return null;

  const handleDesbloquear = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      if (onUpdateDistribuidor) {
        onUpdateDistribuidor({ ...distribuidor, estatus: 'ACTIVO', fechaCastigo: null });
      }
      alert(`✓ Castigo retirado con éxito para Distribuidora #${distribuidor.noDist}. La cuenta vuelve a estatus ACTIVO.`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Unlock className="w-4 h-4 text-white" />
            <span>Levantamiento de Castigo / Reactivación</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <span className="font-bold block text-sm">DV #{distribuidor.noDist} - {distribuidor.nombreDistribuidor}</span>
            <span className="text-[11px] block mt-0.5">Estatus actual: <strong>{distribuidor.estatus}</strong></span>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Motivo o Justificación del Levantamiento</label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              placeholder="Indica la justificación o convenio autorizado por Dirección..."
            />
          </div>

          <button
            onClick={handleDesbloquear}
            disabled={procesando}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow transition active:scale-95"
          >
            {procesando ? 'Procesando desbloqueo en Core...' : 'Confirmar Levantamiento de Castigo'}
          </button>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. NOTIFICACIÓN PUSH A LA APP DE LA DISTRIBUIDORA
export function NotificacionAppModal({ isOpen, onClose, distribuidor }: DVModalProps) {
  const [titulo, setTitulo] = useState('Nuevo Vale Disponible en tu App');
  const [cuerpo, setCuerpo] = useState('Tienes saldo listo para colocar vales entre tus clientes favoritos.');
  const [enviado, setEnviado] = useState(false);

  if (!isOpen) return null;

  const handleEnviarPush = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      alert('✓ Notificación Push enviada al dispositivo Android de la Distribuidora.');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Smartphone className="w-4 h-4 text-yellow-300" />
            <span>Enviar Notificación a App DV</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">✕</button>
        </div>

        <form onSubmit={handleEnviarPush} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Título de la Notificación</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mensaje en la Pantalla del Celular</label>
            <textarea
              rows={3}
              required
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow transition"
          >
            {enviado ? 'Enviando a Firebase Cloud Messaging...' : 'Enviar Push Notification'}
          </button>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

