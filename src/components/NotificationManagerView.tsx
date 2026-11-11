'use client';

import React, { useState } from 'react';
import { useCoreSync } from '@/context/CoreSyncContext';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Sliders,
  Sparkles,
  Users,
  Search,
  MessageSquare,
  RefreshCw,
  Calendar,
  DollarSign,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import {
  NotificationCategory,
  NotificationTarget,
  MobileNotification,
  NotificationRuleConfig,
} from '@/types/notifications';

interface NotificationManagerViewProps {
  onOpenLanApp?: () => void;
}

export default function NotificationManagerView({ onOpenLanApp }: NotificationManagerViewProps) {
  const {
    notifications,
    notificationRules,
    mobileNotificationAccepted,
    distribuidores,
    sendNotification,
    updateNotificationRules,
    setMobileNotificationPermission,
  } = useCoreSync();

  const [activeTab, setActiveTab] = useState<'reglas' | 'broadcast' | 'historial'>('reglas');
  const [savingRules, setSavingRules] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Local state for rules editing
  const [rules, setRules] = useState<NotificationRuleConfig>(notificationRules);

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState<NotificationTarget>('TODAS_DISTRIBUIDORAS');
  const [broadcastCategory, setBroadcastCategory] = useState<NotificationCategory>('RECORDATORIO_PAGO');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [selectedDistId, setSelectedDistId] = useState<number>(1002);
  const [isSending, setIsSending] = useState(false);

  // History search filter
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODAS');

  const playAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const showNotificationSuccess = (msg: string) => {
    setSuccessToast(msg);
    playAudioChime();
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSaveRules = async () => {
    setSavingRules(true);
    try {
      await updateNotificationRules(rules);
      showNotificationSuccess('Reglas y plantillas de alertas guardadas y sincronizadas.');
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRules(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    setIsSending(true);
    try {
      const selectedDist = distribuidores.find((d) => d.noDist === selectedDistId);
      const recipientName =
        broadcastTarget === 'DISTRIBUIDORA_INDIVIDUAL'
          ? selectedDist?.nombreDistribuidor || `Distribuidora #${selectedDistId}`
          : broadcastTarget === 'ASESORES_CAMPO'
          ? 'Fuerza de Ventas en Campo'
          : 'Todas las Distribuidoras (Red LanAhora)';

      await sendNotification({
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        category: broadcastCategory,
        target: broadcastTarget,
        targetId: broadcastTarget === 'DISTRIBUIDORA_INDIVIDUAL' ? selectedDistId : undefined,
        recipientName,
        meta: {
          diasRestantes: broadcastCategory === 'RECORDATORIO_PAGO' ? rules.diasAnticipacionCorte : undefined,
          fechaCorte: '15 de Noviembre',
        },
      });

      showNotificationSuccess('¡Notificación enviada en vivo a los dispositivos móviles!');
      setBroadcastTitle('');
      setBroadcastBody('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleTriggerQuickPaymentReminder = async () => {
    setIsSending(true);
    try {
      await sendNotification({
        title: '📅 Recordatorio: Fecha Límite de Pago Quincenal',
        body: `Faltan ${rules.diasAnticipacionCorte} días para tu corte quincenal. Liquida a tiempo para asegurar tu bonificación del ${rules.bonificacionPorcentaje}% en comisiones.`,
        category: 'RECORDATORIO_PAGO',
        target: 'TODAS_DISTRIBUIDORAS',
        recipientName: 'Todas las Distribuidoras',
        amount: 4280,
        meta: {
          diasRestantes: rules.diasAnticipacionCorte,
          fechaCorte: '15 de Noviembre',
        },
      });
      showNotificationSuccess(`¡Recordatorio masivo de pago emitido a todas las distribuidoras!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulateVoucherAlert = async () => {
    setIsSending(true);
    try {
      const dist = distribuidores[0] || { noDist: 1002, nombreDistribuidor: 'BERTHA ALICIA TELLO LARA', disponible: 25000 };
      const folioSim = `V-${Math.floor(10000 + Math.random() * 90000)}`;
      const montoSim = 2500;
      await sendNotification({
        title: `¡Vale #${folioSim} Cobrado con Éxito!`,
        body: `Tu cliente MARÍA DEL CARMEN LÓPEZ concluyó el canje digital por $${montoSim.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN. Tu saldo disponible actual es $${(dist.disponible || 25000).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.`,
        category: 'COBRO_VALE',
        target: 'TODAS_DISTRIBUIDORAS',
        targetId: dist.noDist,
        recipientName: dist.nombreDistribuidor,
        amount: montoSim,
        folio: folioSim,
        meta: {
          clienteNombre: 'MARÍA DEL CARMEN LÓPEZ',
          saldoDisponible: dist.disponible || 25000,
        },
      });
      showNotificationSuccess(`¡Alerta de cobro de vale simulada y enviada a LanApp!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulatePaymentAlert = async () => {
    setIsSending(true);
    try {
      const dist = distribuidores[0] || { noDist: 1002, nombreDistribuidor: 'BERTHA ALICIA TELLO LARA', disponible: 25000 };
      const montoAbono = 1800;
      await sendNotification({
        title: '¡Abono Registrado con Éxito!',
        body: `Se confirmó la recepción de tu pago por $${montoAbono.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN vía Paynet / SPEI. Tu saldo para colocación ha sido liberado.`,
        category: 'RECORDATORIO_PAGO',
        target: 'TODAS_DISTRIBUIDORAS',
        targetId: dist.noDist,
        recipientName: dist.nombreDistribuidor,
        amount: montoAbono,
        meta: {
          medioPago: 'STP_SPEI',
          nuevoDisponible: (dist.disponible || 25000) + montoAbono,
        },
      });
      showNotificationSuccess('¡Notificación de abono registrada y enviada a móviles!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      !searchFilter.trim() ||
      n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      n.body.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (n.recipientName && n.recipientName.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (n.folio && n.folio.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesCategory = categoryFilter === 'TODAS' || n.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full p-4 lg:p-6 space-y-5">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Encabezado Ejecutivo Limpio */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Centro de Alertas & Notificaciones
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configura alertas automáticas de cobro de vales digitales en tiempo real, recordatorios preventivos de fechas límite de pago y difusión de comunicados oficiales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTriggerQuickPaymentReminder}
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Lanzar Recordatorio de Pago
            </button>
            <button
              onClick={handleSimulateVoucherAlert}
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              Simular Vale Cobrado ($2,500)
            </button>
            <button
              onClick={handleSimulatePaymentAlert}
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              Simular Abono ($1,800)
            </button>
          </div>
        </div>

        {/* KPI Cards Strip Limpio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block">Total Notificaciones</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{notifications.length}</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 100% Entregadas
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block">Aceptación Push</span>
            <div className="flex items-center justify-between">
              <span className={`text-xl font-black mt-0.5 block ${mobileNotificationAccepted ? 'text-emerald-600' : 'text-amber-600'}`}>
                {mobileNotificationAccepted ? 'Activo' : 'Pendiente'}
              </span>
              <button
                type="button"
                onClick={() => setMobileNotificationPermission(!mobileNotificationAccepted)}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition font-bold shadow-2xs"
              >
                {mobileNotificationAccepted ? 'Revocar' : 'Autorizar'}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-blue-600" /> Canal de Alertas
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block">Cobro de Vales</span>
            <span className="text-xl font-black text-emerald-600 mt-0.5 block">
              {rules.alertCobroValeEnabled ? 'En Vivo' : 'Desactivado'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
              Push + SMS + Servidor
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-bold block">Recordatorio Preventivo</span>
            <span className="text-xl font-black text-blue-600 mt-0.5 block">
              {rules.diasAnticipacionCorte} Días Antes
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
              Corte quincenal ({rules.bonificacionPorcentaje}% bonif.)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('reglas')}
          className={`pb-3 px-4 font-bold text-sm transition flex items-center gap-2 border-b-2 ${
            activeTab === 'reglas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Reglas de Alertas Automáticas
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 px-4 font-bold text-sm transition flex items-center gap-2 border-b-2 ${
            activeTab === 'broadcast'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Emisión Manual / Broadcast Push
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`pb-3 px-4 font-bold text-sm transition flex items-center gap-2 border-b-2 ${
            activeTab === 'historial'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Historial de Notificaciones ({notifications.length})
        </button>
      </div>

      {/* TAB 1: REGLAS AUTOMÁTICAS */}
      {activeTab === 'reglas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Regla 1: Cobro de Vales Digitales */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    💰
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      1. Alerta Instantánea al Cobrarse un Vale Digital
                    </h3>
                    <p className="text-xs text-slate-500">
                      Se dispara inmediatamente cuando el cliente final concluye el canje con firma digital y dispersión STP.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rules.alertCobroValeEnabled}
                    onChange={(e) =>
                      setRules((prev) => ({ ...prev, alertCobroValeEnabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {rules.alertCobroValeEnabled && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-6">
                    <span className="text-xs font-bold text-slate-700">Canales de entrega:</span>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.alertCobroValeCanalPush}
                        onChange={(e) =>
                          setRules((prev) => ({ ...prev, alertCobroValeCanalPush: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      Push Móvil (LanApp)
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.alertCobroValeCanalSms}
                        onChange={(e) =>
                          setRules((prev) => ({ ...prev, alertCobroValeCanalSms: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      Mensaje SMS Celular
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.alertCobroValeCanalWhatsApp}
                        onChange={(e) =>
                          setRules((prev) => ({ ...prev, alertCobroValeCanalWhatsApp: e.target.checked }))
                        }
                        className="rounded text-blue-600"
                      />
                      WhatsApp Notifier
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plantilla de Mensaje para la Distribuidora:
                    </label>
                    <textarea
                      rows={2}
                      value={rules.plantillaCobroVale}
                      onChange={(e) =>
                        setRules((prev) => ({ ...prev, plantillaCobroVale: e.target.value }))
                      }
                      className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Variables dinámicas soportadas: <code className="text-blue-600 font-bold">{'{FOLIO}'}</code>, <code className="text-blue-600 font-bold">{'{MONTO}'}</code>, <code className="text-blue-600 font-bold">{'{CLIENTE}'}</code>, <code className="text-blue-600 font-bold">{'{DISPONIBLE}'}</code>.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Regla 2: Recordatorios Preventivos de Pago a Distribuidoras */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    📅
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      2. Recordatorio Preventivo de Pago a Distribuidoras
                    </h3>
                    <p className="text-xs text-slate-500">
                      Notifica con días de antelación al corte quincenal para asegurar la cobranza y conservar comisiones/bonificaciones.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rules.alertRecordatorioPagoEnabled}
                    onChange={(e) =>
                      setRules((prev) => ({ ...prev, alertRecordatorioPagoEnabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {rules.alertRecordatorioPagoEnabled && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Anticipación al Corte:
                      </label>
                      <select
                        value={rules.diasAnticipacionCorte}
                        onChange={(e) =>
                          setRules((prev) => ({ ...prev, diasAnticipacionCorte: Number(e.target.value) }))
                        }
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50"
                      >
                        <option value={1}>1 Día Antes (Urgente)</option>
                        <option value={2}>2 Días Antes</option>
                        <option value={3}>3 Días Antes (Recomendado)</option>
                        <option value={5}>5 Días Antes (Preventivo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hora Programada de Envío:
                      </label>
                      <input
                        type="time"
                        value={rules.horaDisparoRecordatorio}
                        onChange={(e) =>
                          setRules((prev) => ({ ...prev, horaDisparoRecordatorio: e.target.value }))
                        }
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bonificación a Proteger (%):
                      </label>
                      <input
                        type="number"
                        value={rules.bonificacionPorcentaje}
                        onChange={(e) =>
                          setRules((prev) => ({ ...prev, bonificacionPorcentaje: Number(e.target.value) }))
                        }
                        className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mensaje Recordatorio Push:
                    </label>
                    <textarea
                      rows={2}
                      value={rules.mensajeRecordatorio}
                      onChange={(e) =>
                        setRules((prev) => ({ ...prev, mensajeRecordatorio: e.target.value }))
                      }
                      className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Variables: <code className="text-blue-600 font-bold">{'{DIAS}'}</code>, <code className="text-blue-600 font-bold">{'{FECHA_CORTE}'}</code>, <code className="text-blue-600 font-bold">{'{BONIF}'}</code>.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Regla 3: Alertas de Dispersión STP & LanaTienda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Alerta Dispersión STP SPEI</h4>
                    <p className="text-[11px] text-slate-500">Notificar clave de rastreo bancaria</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.alertDispersionEnabled}
                  onChange={(e) =>
                    setRules((prev) => ({ ...prev, alertDispersionEnabled: e.target.checked }))
                  }
                  className="rounded text-purple-600 w-4 h-4"
                />
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    🛍️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Avisos LanaTienda</h4>
                    <p className="text-[11px] text-slate-500">Promociones a 16 quincenas</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.alertPromocionesEnabled}
                  onChange={(e) =>
                    setRules((prev) => ({ ...prev, alertPromocionesEnabled: e.target.checked }))
                  }
                  className="rounded text-amber-600 w-4 h-4"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSaveRules}
                disabled={savingRules}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                {savingRules ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Guardar Configuración de Alertas
              </button>
            </div>
          </div>

          {/* Right Preview Column (Phone Simulator Preview) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                Vista Previa de Notificación Móvil
              </h4>

              {/* Mock Mobile Push Notification Banner */}
              <div className="bg-slate-50 text-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-400 flex items-center justify-center text-xs">
                      🐑
                    </div>
                    <span className="text-[11px] font-black tracking-tight text-slate-900">LANAPP</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Ahora</span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-black text-slate-900">
                    {rules.alertCobroValeEnabled
                      ? '¡Vale #V-89412 Cobrado con Éxito!'
                      : 'Notificación de Prueba'}
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Tu cliente MARÍA DEL CARMEN LÓPEZ canjeó un vale digital por $2,500.00 MXN. Tu nuevo saldo disponible es $25,000.00 MXN.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-200 text-[10px] text-blue-600 font-bold">
                  <span>Toca para ver pagaré y recibo</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Payment Reminder Preview */}
              <div className="bg-slate-50 text-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                      📅
                    </div>
                    <span className="text-[11px] font-black tracking-tight text-slate-900">LANAPP RECORDATORIO</span>
                  </div>
                  <span className="text-[10px] text-slate-400">9:30 AM</span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-black text-blue-700">
                    Fecha Límite de Pago Quincenal ({rules.diasAnticipacionCorte} días)
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Tu pago quincenal vence el 15 de Noviembre. Liquida a tiempo para conservar tu bonificación del {rules.bonificacionPorcentaje}%.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 text-xs text-blue-800 space-y-1.5 border border-blue-100">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  Protocolo de Aceptación
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Al abrir LanApp, la distribuidora recibe un diálogo nativo para **Aceptar Notificaciones**. Una vez aceptadas, el estado se refleja automáticamente como verificado en el Core.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST MANUAL */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/90 shadow-sm max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Emitir Notificación Manual en Vivo
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Envía un aviso push emergente de inmediato a todas las distribuidoras o a una en específico.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destinatarios:</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as NotificationTarget)}
                  className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                >
                  <option value="TODAS_DISTRIBUIDORAS">Todas las Distribuidoras</option>
                  <option value="DISTRIBUIDORA_INDIVIDUAL">Distribuidora Individual</option>
                  <option value="ASESORES_CAMPO">Asesores de Campo (LH Asesores)</option>
                  <option value="TODOS">Todos los Usuarios Móviles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría:</label>
                <select
                  value={broadcastCategory}
                  onChange={(e) => setBroadcastCategory(e.target.value as NotificationCategory)}
                  className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                >
                  <option value="RECORDATORIO_PAGO">📅 Recordatorio de Pago</option>
                  <option value="COBRO_VALE">💰 Cobro de Vale Digital</option>
                  <option value="DISPERSION_STP">⚡ Dispersión STP</option>
                  <option value="PROMOCION_TIENDA">🛍️ Promoción LanaTienda</option>
                  <option value="AVISO_INSTITUCIONAL">📢 Comunicado Institucional</option>
                </select>
              </div>
            </div>

            {broadcastTarget === 'DISTRIBUIDORA_INDIVIDUAL' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seleccionar Distribuidora:
                </label>
                <select
                  value={selectedDistId}
                  onChange={(e) => setSelectedDistId(Number(e.target.value))}
                  className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                >
                  {distribuidores.map((d) => (
                    <option key={d.noDist} value={d.noDist}>
                      #{d.noDist} - {d.nombreDistribuidor} (Saldo: ${d.saldoActual.toLocaleString('es-MX')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Notificación:</label>
              <input
                type="text"
                placeholder="Ej: ⚠️ Tu fecha de pago vence mañana"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                required
                className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje Detallado:</label>
              <textarea
                rows={3}
                placeholder="Escribe el mensaje que verán las distribuidoras en la pantalla de su teléfono..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar Notificación Push Ahora
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: HISTORIAL DE NOTIFICACIONES */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en historial..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50"
              >
                <option value="TODAS">Todas las categorías</option>
                <option value="COBRO_VALE">Cobro de Vale</option>
                <option value="RECORDATORIO_PAGO">Recordatorio de Pago</option>
                <option value="DISPERSION_STP">Dispersión STP</option>
                <option value="PROMOCION_TIENDA">Promoción Tienda</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-semibold">
              Mostrando {filteredNotifications.length} de {notifications.length} envíos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Destinatario</th>
                  <th className="py-3 px-4">Título & Mensaje</th>
                  <th className="py-3 px-4 text-center">Estado de Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                          n.category === 'COBRO_VALE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : n.category === 'RECORDATORIO_PAGO'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : n.category === 'DISPERSION_STP'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {n.category === 'COBRO_VALE'
                          ? '💰 Cobro Vale'
                          : n.category === 'RECORDATORIO_PAGO'
                          ? '📅 Pago Quincena'
                          : n.category === 'DISPERSION_STP'
                          ? '⚡ SPEI'
                          : '📢 Aviso'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {n.recipientName || 'Todas las Distribuidoras'}
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-slate-900">{n.title}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{n.body}</div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Entregada
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
