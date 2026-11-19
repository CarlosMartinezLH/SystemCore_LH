'use client';

import React, { useState } from 'react';
import { UserSession } from '@/types/auth';
import {
  Headphones,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Send,
  User,
  Phone,
  Building,
  ShieldCheck,
  FileText,
  ExternalLink,
  ChevronRight,
  Smile,
  Paperclip,
  CheckCheck,
  Award,
  Zap,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';

interface FloatingSupportWidgetProps {
  currentUser?: UserSession | null;
  onOpenFullScreen?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'distribuidora' | 'soporte';
  senderName: string;
  text: string;
  time: string;
  attachment?: {
    type: 'comprobante_spei' | 'foto_vale' | 'pdf';
    title: string;
    ref?: string;
  };
}

interface Ticket {
  id: string;
  dvNumber: string;
  dvName: string;
  branch: string;
  phone: string;
  level: string;
  category: 'COBRANZA_SPEI' | 'LINEA_CREDITO' | 'LANATIENDA' | 'VALERA' | 'GENERAL';
  subject: string;
  status: 'CHAT_ACTIVO' | 'ABIERTO' | 'EN_REVISION' | 'RESUELTO';
  priority: 'ALTA' | 'MEDIA' | 'NORMAL';
  updatedAt: string;
  unread: number;
  saldoDisponible: number;
  proximoCobro: number;
  messages: ChatMessage[];
}

export default function FloatingSupportWidget({ currentUser }: FloatingSupportWidgetProps) {
  // Estado de visibilidad de la ventana emergente
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Toggle del Asistente En Línea
  const [isAgentOnline, setIsAgentOnline] = useState(true);

  // Pestaña activa dentro del widget: 'chat' | 'tickets' | 'horarios'
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'horarios'>('chat');

  // Configuración de Horas Laborales
  const [laborHours, setLaborHours] = useState({
    weekdays: '08:00 - 19:00',
    saturdays: '09:00 - 14:00',
    timezone: 'Saltillo / Tiempo del Centro (CST)',
  });
  const [savedNotice, setSavedNotice] = useState(false);

  // Filtros de Tickets
  const [ticketFilter, setTicketFilter] = useState<'TODOS' | 'CHAT_ACTIVO' | 'EN_REVISION' | 'RESUELTO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Mensaje en redacción
  const [replyText, setReplyText] = useState('');

  // Modal para ver comprobante SPEI
  const [showingAttachment, setShowingAttachment] = useState<ChatMessage['attachment'] | null>(null);

  // Lista de Tickets
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TK-1082',
      dvNumber: '1004',
      dvName: 'Concepción Montelongo',
      branch: 'Saltillo (Victoria)',
      phone: '844-329-8471',
      level: 'PLATA 10%',
      category: 'COBRANZA_SPEI',
      subject: 'Aclaración de abono Vale #88412 vía SPEI STP',
      status: 'CHAT_ACTIVO',
      priority: 'ALTA',
      updatedAt: 'Hace 2 min',
      unread: 1,
      saldoDisponible: 26843.10,
      proximoCobro: 1598.08,
      messages: [
        {
          id: 'm1',
          sender: 'soporte',
          senderName: 'Carlos Martínez (Soporte LanAhora)',
          text: '¡Hola Concepción! Gusto en saludarte. ¿En qué podemos apoyarte con tu relación de cobranza o dispersión hoy?',
          time: '10:12 AM',
        },
        {
          id: 'm2',
          sender: 'distribuidora',
          senderName: 'Concepción Montelongo (DV 1004)',
          text: 'Hola Carlos, acabo de registrar el comprobante de pago de mi cliente José Efraín Vázquez (Vale #88412 por $162.98). ¿Me confirmas si ya se liberó en mi línea disponible?',
          time: '10:14 AM',
          attachment: {
            type: 'comprobante_spei',
            title: 'Comprobante SPEI STP #88412.pdf',
            ref: 'STP-88412-20261119-0922',
          },
        },
        {
          id: 'm3',
          sender: 'soporte',
          senderName: 'Carlos Martínez (Soporte LanAhora)',
          text: 'Revisado en tiempo real Concepción. El abono de $162.98 entró por STP y ya está conciliado en el Sistema Core. Tu línea ValeLana ya tiene $26,843.10 libres para nuevos vales.',
          time: '10:15 AM',
        },
        {
          id: 'm4',
          sender: 'distribuidora',
          senderName: 'Concepción Montelongo (DV 1004)',
          text: '¡Excelente atención tan rápida! Ya me apareció reflejado en la LanApp. Muchas gracias.',
          time: '10:16 AM',
        },
      ],
    },
    {
      id: 'TK-1080',
      dvNumber: '1022',
      dvName: 'Rosa Linda Mora Flores',
      branch: 'Saltillo (Allende)',
      phone: '844-551-9022',
      level: 'ORO 12%',
      category: 'LINEA_CREDITO',
      subject: 'Solicitud de incremento de línea ValeLana a $55,000',
      status: 'EN_REVISION',
      priority: 'MEDIA',
      updatedAt: 'Hoy 09:15 AM',
      unread: 0,
      saldoDisponible: 8200.00,
      proximoCobro: 6020.76,
      messages: [
        {
          id: 'r1',
          sender: 'distribuidora',
          senderName: 'Rosa Linda Mora (DV 1022)',
          text: 'Buenos días, ya alcancé el 95% de colocación de mis vales. ¿Podemos revisar el incremento a Nivel Oro con mi coordinador José Miguel?',
          time: '09:15 AM',
        },
        {
          id: 'r2',
          sender: 'soporte',
          senderName: 'Mesa de Crédito LanAhora',
          text: 'Hola Rosa Linda, tu comportamiento en las últimas 6 quincenas es impecable. Tu expediente ya está turnado a Mesa de Crédito para autorizar la línea hoy mismo.',
          time: '09:20 AM',
        },
      ],
    },
    {
      id: 'TK-1077',
      dvNumber: '1004',
      dvName: 'Concepción Montelongo',
      branch: 'Saltillo (Victoria)',
      phone: '844-329-8471',
      level: 'PLATA 10%',
      category: 'VALERA',
      subject: 'Reposición de Valera Física (50 folios)',
      status: 'RESUELTO',
      priority: 'NORMAL',
      updatedAt: 'Ayer 18:30',
      unread: 0,
      saldoDisponible: 26843.10,
      proximoCobro: 1598.08,
      messages: [
        {
          id: 'v1',
          sender: 'distribuidora',
          senderName: 'Concepción Montelongo (DV 1004)',
          text: 'Solicito nueva valera física folios 88450 al 88500 para entrega en sucursal Saltillo Victoria.',
          time: 'Ayer 17:00',
        },
        {
          id: 'v2',
          sender: 'soporte',
          senderName: 'Carlos Martínez (Soporte LanAhora)',
          text: 'Valera entregada por tu coordinador José Miguel González. Folios activados en el sistema core. Caso cerrado.',
          time: 'Ayer 18:30',
        },
      ],
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>('TK-1082');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Enviar mensaje
  const handleSendMessage = () => {
    if (!replyText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'soporte',
      senderName: currentUser ? `${currentUser.name} (Soporte)` : 'Carlos Martínez (Soporte)',
      text: replyText.trim(),
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            updatedAt: 'Justo ahora',
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    setReplyText('');
  };

  // Enviar respuesta rápida (Macro)
  const handleQuickMacro = (text: string) => {
    setReplyText(text);
  };

  // Filtrado de tickets
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'CHAT_ACTIVO' && t.status !== 'CHAT_ACTIVO') return false;
    if (ticketFilter === 'EN_REVISION' && t.status !== 'EN_REVISION') return false;
    if (ticketFilter === 'RESUELTO' && t.status !== 'RESUELTO') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchDv = t.dvName.toLowerCase().includes(q) || t.dvNumber.includes(q);
      const matchSubject = t.subject.toLowerCase().includes(q);
      return matchId || matchDv || matchSubject;
    }
    return true;
  });

  const totalUnread = tickets.reduce((acc, t) => acc + t.unread, 0);

  return (
    <>
      {/* ======================================================== */}
      {/* BOTÓN FLOTANTE TRIGGER (CUANDO ESTÁ CERRADO O MINIMIZADO) */}
      {/* ======================================================== */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            style={{
              backgroundColor: '#162A60',
              background: 'linear-gradient(135deg, #162A60 0%, #1E3A8A 100%)',
              boxShadow: '0 14px 38px -4px rgba(15, 23, 42, 0.55), 0 8px 16px -2px rgba(15, 23, 42, 0.35)',
            }}
            className="group relative flex items-center gap-3.5 px-5 py-3.5 text-white rounded-full hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-amber-400/40 cursor-pointer"
            title="Abrir Chat de Soporte & Mesa de Ayuda"
          >
            {/* Indicador de Estado En Línea */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-amber-300 shadow-inner">
                <Headphones className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-200" />
              </div>
              <span
                style={{ backgroundColor: isAgentOnline ? '#10B981' : '#94A3B8' }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#162A60] shadow-sm flex items-center justify-center"
              >
                {isAgentOnline && (
                  <span className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                )}
              </span>
            </div>

            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black tracking-wide text-white drop-shadow-xs">
                  Soporte en Vivo
                </span>
                {totalUnread > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10.5px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {totalUnread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  style={{ backgroundColor: isAgentOnline ? '#34D399' : '#94A3B8' }}
                  className="w-2 h-2 rounded-full"
                />
                <span className="text-[11px] text-amber-200/90 font-bold">
                  {isAgentOnline ? 'Estoy en línea' : 'Modo ausente'}
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* VENTANA EMERGENTE FLOTANTE (POPUP CHAT)                   */}
      {/* ======================================================== */}
      {isOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 25px 65px -12px rgba(15, 23, 42, 0.5), 0 0 0 1px rgba(15, 23, 42, 0.12)',
          }}
          className={`fixed bottom-6 right-6 z-[9999] w-[420px] sm:w-[460px] ${
            isMinimized ? 'h-[62px]' : 'h-[650px] max-h-[88vh]'
          } max-w-[95vw] rounded-2xl border-2 border-slate-300 flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5`}
        >
          {/* HEADER PRINCIPAL DE LA VENTANA FLOTANTE */}
          <div
            style={{
              backgroundColor: '#162A60',
              background: 'linear-gradient(135deg, #162A60 0%, #1A3275 50%, #1E3A8A 100%)',
            }}
            className="text-white p-3.5 flex items-center justify-between shrink-0 shadow-sm border-b border-blue-900"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                  <Headphones className="w-4 h-4" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#162A60] ${
                    isAgentOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-white tracking-wide">Mesa de Soporte</h3>
                  {/* Switch para marcar "Estoy en Línea" */}
                  <button
                    type="button"
                    onClick={() => setIsAgentOnline(!isAgentOnline)}
                    className={`text-[9.5px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer ${
                      isAgentOnline
                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title="Clic para cambiar tu estado de disponibilidad ante las distribuidoras"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAgentOnline ? 'bg-white animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    {isAgentOnline ? 'EN LÍNEA' : 'AUSENTE'}
                  </button>
                </div>
                <p className="text-[10px] text-blue-200 font-medium">
                  Atención Distribuidoras • Suc. Saltillo Victoria
                </p>
              </div>
            </div>

            {/* Controles: Minimizar y Cerrar */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition"
                title="Cerrar ventana de soporte"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CONTENIDO INTERNO (SI NO ESTÁ MINIMIZADO) */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              {/* BARRA DE HORARIO OFICIAL */}
              <div className="bg-slate-100/90 border-b border-slate-200 px-3.5 py-1.5 flex items-center justify-between text-[10.5px] text-slate-600 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span className="font-bold text-slate-800">Horario Oficial:</span>
                  <span>L-V 08:00 - 19:00 • Sáb 09:00 - 14:00 (Saltillo)</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-1.5 py-0.5 rounded">
                  Abierto
                </span>
              </div>

              {/* PESTAÑAS INTERNAS DEL WIDGET */}
              <div className="flex border-b border-slate-200 bg-white px-2 pt-1 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'chat'
                      ? 'border-blue-700 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat en Vivo</span>
                  {selectedTicket.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-700 text-white text-[9px] font-black flex items-center justify-center">
                      {selectedTicket.unread}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'tickets'
                      ? 'border-blue-700 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Tickets ({tickets.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('horarios')}
                  className={`py-2 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1 transition ${
                    activeTab === 'horarios'
                      ? 'border-blue-700 text-blue-700 bg-blue-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                  title="Configuración de horarios laborales"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Horarios</span>
                </button>
              </div>

              {/* VISTA 1: CHAT EN VIVO */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Tarjeta de Resumen del Cliente Conectado */}
                  <div className="bg-white border-b border-slate-200 px-3.5 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        CM
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">
                            {selectedTicket.dvName}
                          </span>
                          <span className="text-[9.5px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded">
                            DV {selectedTicket.dvNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {selectedTicket.branch} • Línea Disp: $
                          {selectedTicket.saldoDisponible.toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Chat Activo
                    </span>
                  </div>

                  {/* Asunto del Ticket Activo */}
                  <div className="bg-blue-50/60 border-b border-blue-100 px-3.5 py-1.5 flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1 text-blue-900 font-bold truncate">
                      <span className="font-black text-blue-800">{selectedTicket.id}:</span>
                      <span className="truncate">{selectedTicket.subject}</span>
                    </div>
                    <span className="text-[9.5px] text-blue-600 font-semibold shrink-0 ml-2">
                      {selectedTicket.updatedAt}
                    </span>
                  </div>

                  {/* FLUJO DE MENSAJES (SCROLLABLE) */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                    {selectedTicket.messages.map((msg) => {
                      const isSupport = msg.sender === 'soporte';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1 text-[9.5px] text-slate-400 mb-0.5 px-1">
                            <span className="font-semibold text-slate-600">{msg.senderName}</span>
                            <span>•</span>
                            <span>{msg.time}</span>
                          </div>

                          <div
                            style={
                              isSupport
                                ? { backgroundColor: '#1E3A8A', color: '#ffffff' }
                                : { backgroundColor: '#ffffff' }
                            }
                            className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-xs leading-relaxed ${
                              isSupport
                                ? 'text-white rounded-tr-xs'
                                : 'text-slate-800 border border-slate-200 rounded-tl-xs'
                            }`}
                          >
                            <p>{msg.text}</p>

                            {/* Adjunto si existe */}
                            {msg.attachment && (
                              <div
                                onClick={() => setShowingAttachment(msg.attachment)}
                                className={`mt-2 p-2 rounded-xl flex items-center justify-between gap-2 border cursor-pointer transition ${
                                  isSupport
                                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    : 'bg-slate-50 border-slate-200 text-blue-900 hover:bg-blue-50'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <FileText className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                  <span className="text-[10px] font-bold truncate">
                                    {msg.attachment.title}
                                  </span>
                                </div>
                                <span className="text-[9px] underline font-extrabold shrink-0">
                                  Ver SPEI
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* RESPUESTAS RÁPIDAS (MACROS) */}
                  <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <span className="text-[9.5px] font-bold text-slate-400 shrink-0">Atajos:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickMacro(
                          'Abono SPEI de $162.98 conciliado en Core. Línea liberada para nuevos vales.'
                        )
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition shrink-0 cursor-pointer"
                    >
                      ✅ Validar SPEI
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickMacro(
                          'Tu solicitud de ampliación de línea se encuentra en revisión con Mesa de Crédito.'
                        )
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition shrink-0 cursor-pointer"
                    >
                      💳 Mesa de Crédito
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickMacro(
                          'Estimada distribuidora, estamos fuera del horario laboral. Tu caso se atenderá a primera hora (08:00 hrs).'
                        )
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 transition shrink-0 cursor-pointer"
                    >
                      🌙 Fuera de Horario
                    </button>
                  </div>

                  {/* INPUT PARA ESCRIBIR MENSAJE */}
                  <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe una respuesta a Concepción..."
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-slate-50"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="p-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* VISTA 2: LISTA DE TICKETS */}
              {activeTab === 'tickets' && (
                <div className="flex-1 flex flex-col min-h-0 p-3 space-y-2.5 overflow-y-auto">
                  {/* Buscador */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar ticket, DV o asunto..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  {/* Filtros */}
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {(['TODOS', 'CHAT_ACTIVO', 'EN_REVISION', 'RESUELTO'] as const).map((fil) => (
                      <button
                        key={fil}
                        type="button"
                        onClick={() => setTicketFilter(fil)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition cursor-pointer shrink-0 ${
                          ticketFilter === fil
                            ? 'bg-blue-700 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {fil === 'TODOS'
                          ? 'Todos'
                          : fil === 'CHAT_ACTIVO'
                          ? 'En Chat'
                          : fil === 'EN_REVISION'
                          ? 'En Revisión'
                          : 'Resueltos'}
                      </button>
                    ))}
                  </div>

                  {/* Tarjetas de Tickets */}
                  <div className="space-y-2">
                    {filteredTickets.map((t) => {
                      const isSelected = t.id === selectedTicketId;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedTicketId(t.id);
                            setActiveTab('chat');
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-blue-900">{t.id}</span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                t.status === 'CHAT_ACTIVO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'EN_REVISION'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {t.status === 'CHAT_ACTIVO'
                                ? '● Chat Activo'
                                : t.status === 'EN_REVISION'
                                ? 'En Revisión'
                                : 'Resuelto'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1 mb-0.5">
                            {t.subject}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>
                              {t.dvName} (DV {t.dvNumber})
                            </span>
                            <span>{t.updatedAt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VISTA 3: CONFIGURACIÓN DE HORARIOS */}
              {activeTab === 'horarios' && (
                <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3.5 overflow-y-auto bg-white">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 mb-1">
                      Horarios Oficiales de Atención
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Este horario se visualiza directamente en la LanApp de las distribuidoras.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-black text-slate-700 block mb-1">
                        Lunes a Viernes:
                      </label>
                      <input
                        type="text"
                        value={laborHours.weekdays}
                        onChange={(e) =>
                          setLaborHours({ ...laborHours, weekdays: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-700 block mb-1">
                        Sábados:
                      </label>
                      <input
                        type="text"
                        value={laborHours.saturdays}
                        onChange={(e) =>
                          setLaborHours({ ...laborHours, saturdays: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-700 block mb-1">
                        Zona Horaria:
                      </label>
                      <input
                        type="text"
                        value={laborHours.timezone}
                        onChange={(e) =>
                          setLaborHours({ ...laborHours, timezone: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                    <p className="font-bold text-slate-800">
                      Disponibilidad Actual de la Plataforma:
                    </p>
                    <p className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Dentro del Horario de Atención al Distribuidor
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSavedNotice(true);
                      setTimeout(() => setSavedNotice(false), 3000);
                    }}
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    {savedNotice ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>¡Horario Guardado!</span>
                      </>
                    ) : (
                      <span>Guardar Horarios de Soporte</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DETALLE DE COMPROBANTE SPEI STP ATTACHMENT         */}
      {/* ======================================================== */}
      {showingAttachment && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Comprobante SPEI Validado</h4>
                  <p className="text-[11px] text-slate-500">Conciliación STP Sistema Core</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowingAttachment(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Folio Vale:</span>
                <span className="font-black text-slate-900">#88412</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente Final:</span>
                <span className="font-bold text-slate-900">José Efraín Vázquez Sosa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distribuidora:</span>
                <span className="font-bold text-slate-900">Concepción Montelongo (DV 1004)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monto del Abono:</span>
                <span className="font-black text-emerald-700 text-sm">$162.98 MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clave Rastreo STP:</span>
                <span className="font-mono text-[10.5px] text-slate-700">
                  {showingAttachment.ref}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estatus en Core:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  LIQUIDADO / CONCILIADO
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowingAttachment(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Cerrar Vista de Comprobante
            </button>
          </div>
        </div>
      )}
    </>
  );
}
