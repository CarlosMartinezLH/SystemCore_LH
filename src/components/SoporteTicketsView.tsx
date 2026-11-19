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
} from 'lucide-react';

interface SoporteTicketsViewProps {
  currentUser: UserSession;
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

export default function SoporteTicketsView({ currentUser }: SoporteTicketsViewProps) {
  // Toggle del Asistente En Línea
  const [isAgentOnline, setIsAgentOnline] = useState(true);

  // Configuración de Horas Laborales
  const [laborHours, setLaborHours] = useState({
    weekdays: '08:00 - 19:00',
    saturdays: '09:00 - 14:00',
    timezone: 'Saltillo / Tiempo del Centro (CST)',
  });

  // Filtros de Tickets
  const [activeFilter, setActiveFilter] = useState<'TODOS' | 'CHAT_ACTIVO' | 'ABIERTO' | 'RESUELTO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Mensaje en redacción
  const [replyText, setReplyText] = useState('');

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
          text: 'Hola Rosa Linda, tu historial de pago en las últimas 6 quincenas es perfecto. Se turnó el expediente a Mesa de Crédito para autorizar $55,000 hoy antes de las 14:00 hrs.',
          time: '09:20 AM',
        },
      ],
    },
    {
      id: 'TK-1079',
      dvNumber: '1040',
      dvName: 'Carlos Alberto Dávila Ramos',
      branch: 'Saltillo (Centro)',
      phone: '844-893-1104',
      level: 'PLATA 10%',
      category: 'LANATIENDA',
      subject: 'Validación de vale en Mueblería La Fama Saltillo',
      status: 'ABIERTO',
      priority: 'MEDIA',
      updatedAt: 'Hoy 08:40 AM',
      unread: 1,
      saldoDisponible: 17500.00,
      proximoCobro: 3256.62,
      messages: [
        {
          id: 'c1',
          sender: 'distribuidora',
          senderName: 'Carlos Alberto Dávila',
          text: 'Hola, mi cliente está en Mueblería La Fama de calle Victoria y piden confirmar el código de autorización de LanaTienda.',
          time: '08:40 AM',
        },
      ],
    },
    {
      id: 'TK-1077',
      dvNumber: '1035',
      dvName: 'María Elena Garza Rivas',
      branch: 'Ramos Arizpe',
      phone: '844-120-4389',
      level: 'PLATA 10%',
      category: 'VALERA',
      subject: 'Reposición de Valera Física (50 folios nuevos)',
      status: 'RESUELTO',
      priority: 'NORMAL',
      updatedAt: 'Ayer 18:30',
      unread: 0,
      saldoDisponible: 12400.00,
      proximoCobro: 4645.52,
      messages: [
        {
          id: 'g1',
          sender: 'distribuidora',
          senderName: 'María Elena Garza',
          text: 'Solicito nueva valera física folios 88450 al 88500 para entregar en sucursal Ramos Arizpe.',
          time: 'Ayer 17:00',
        },
        {
          id: 'g2',
          sender: 'soporte',
          senderName: 'Carlos Martínez (Soporte LanAhora)',
          text: 'Valera registrada y entregada por tu coordinador José Miguel con firma de resguardo. Ticket cerrado con éxito.',
          time: 'Ayer 18:30',
        },
      ],
    },
  ]);

  // Ticket actualmente seleccionado en consola
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TK-1082');
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Enviar mensaje en el chat
  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || replyText;
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'soporte',
      senderName: `${currentUser.name} (Soporte LanAhora)`,
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: 'CHAT_ACTIVO',
            updatedAt: 'Justo ahora',
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    if (!customText) setReplyText('');
  };

  // Marcar ticket como resuelto
  const handleResolveTicket = () => {
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: 'RESUELTO', updatedAt: 'Justo ahora' } : t))
    );
  };

  // Filtrado de tickets
  const filteredTickets = tickets.filter((t) => {
    if (activeFilter === 'CHAT_ACTIVO' && t.status !== 'CHAT_ACTIVO') return false;
    if (activeFilter === 'ABIERTO' && t.status !== 'ABIERTO' && t.status !== 'EN_REVISION') return false;
    if (activeFilter === 'RESUELTO' && t.status !== 'RESUELTO') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.dvName.toLowerCase().includes(q) ||
        t.dvNumber.includes(q) ||
        t.subject.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* BARRA SUPERIOR: ESTADO EN LÍNEA, HORAS LABORALES Y KPIS */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-3.5 shadow-2xs shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Título & Estado En Línea */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#162A60] to-[#1E3A8A] text-amber-300 flex items-center justify-center shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#162A60] tracking-tight">
                  Mesa de Ayuda & Soporte en Línea
                </h2>
                {/* Switch Interactivo: En Línea vs Ausente */}
                <button
                  onClick={() => setIsAgentOnline(!isAgentOnline)}
                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                    isAgentOnline
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Haz clic para cambiar tu disponibilidad visible en LanApp"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAgentOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{isAgentOnline ? 'ESTOY EN LÍNEA' : 'MODO AUSENTE'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isAgentOnline
                  ? 'Las Distribuidoras ven "En línea ahora" en su LanApp móvil • Atendiendo desde Saltillo'
                  : 'Modo fuera de horario activado. Los tickets entrarán a bandeja de espera.'}
              </p>
            </div>
          </div>

          {/* Horas Laborales y KPIs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Badge de Horario Laboral */}
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Horario Laboral Oficial
                </span>
                <span className="text-[11.5px] font-black text-slate-800">
                  L-V: {laborHours.weekdays} • Sáb: {laborHours.saturdays}
                </span>
              </div>
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">
                Saltillo
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9.5px] text-emerald-700 font-bold uppercase block">En Chat Activo</span>
                <span className="text-sm font-black text-emerald-800">2 distribuidoras</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[9.5px] text-amber-700 font-bold uppercase block">Abiertos</span>
                <span className="text-sm font-black text-amber-800">3 tickets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: 2 PANELES (BANDEJA DE TICKETS A LA IZQ / CONSOLA DE CHAT A LA DER) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* PANEL IZQUIERDO: BANDEJA DE TICKETS */}
        <div className="w-80 md:w-96 bg-white border-r border-slate-200/90 flex flex-col shrink-0">
          {/* Buscador de Tickets */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ticket, DV # o nombre..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#162A60] transition"
              />
            </div>

            {/* Filtros de Pestaña */}
            <div className="flex gap-1 mt-2.5 overflow-x-auto no-scrollbar">
              {[
                { key: 'TODOS', label: 'Todos', count: tickets.length },
                { key: 'CHAT_ACTIVO', label: 'En Chat', count: tickets.filter((t) => t.status === 'CHAT_ACTIVO').length },
                { key: 'ABIERTO', label: 'Pendientes', count: tickets.filter((t) => t.status === 'ABIERTO' || t.status === 'EN_REVISION').length },
                { key: 'RESUELTO', label: 'Resueltos', count: tickets.filter((t) => t.status === 'RESUELTO').length },
              ].map((f) => {
                const isSel = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                      isSel
                        ? 'bg-[#162A60] text-white font-black shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-black ${
                        isSel ? 'bg-amber-400 text-[#162A60]' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Tickets */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
            {filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicket.id;
              const isChat = t.status === 'CHAT_ACTIVO';
              const isResolved = t.status === 'RESUELTO';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3 cursor-pointer transition flex flex-col gap-1.5 border-l-4 ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-[#162A60]'
                      : 'hover:bg-slate-50 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {t.id}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                        DV {t.dvNumber}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isChat
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isResolved
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isChat && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />}
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Nombre Distribuidora */}
                  <h4 className="text-xs font-black text-[#162A60] leading-tight line-clamp-1">
                    {t.dvName}
                  </h4>

                  {/* Asunto */}
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                    {t.subject}
                  </p>

                  {/* Footer Ticket */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{t.branch}</span>
                    <span className="font-medium">{t.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DERECHO: CONSOLA DE CHAT Y GESTIÓN EN TIEMPO REAL */}
        <div className="flex-1 flex flex-col bg-slate-100/60 min-w-0">
          {/* Header del Ticket Seleccionado */}
          <div className="bg-white border-b border-slate-200/90 p-4 shrink-0 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#162A60] text-amber-300 font-black text-sm flex items-center justify-center shadow-xs">
                  {selectedTicket.dvName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-[#162A60]">
                      {selectedTicket.dvName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[9px] font-black">
                      DV #{selectedTicket.dvNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] font-black flex items-center gap-1">
                      <Award className="w-2.5 h-2.5 text-amber-600" />
                      {selectedTicket.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                    <span>Sucursal {selectedTicket.branch}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 font-bold">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {selectedTicket.phone}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">
                      Disp: ${selectedTicket.saldoDisponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>

              {/* Acciones del Ticket */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResolveTicket}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolver Ticket</span>
                </button>
              </div>
            </div>

            {/* Asunto y Detalle del Ticket */}
            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-500 font-black">{selectedTicket.id}</span>
                <span className="font-bold text-slate-800">{selectedTicket.subject}</span>
              </div>
              <span className="text-[10px] text-slate-400">Canal: LanApp Distribuidora Móvil</span>
            </div>
          </div>

          {/* FEED DEL CHAT EN VIVO */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                Sesión de Soporte en Vivo • Conexión Segura STP / LanAhora Core
              </span>
            </div>

            {selectedTicket.messages.map((msg) => {
              const isSupport = msg.sender === 'soporte';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9.5px] font-bold text-slate-400 mb-1 px-1">
                    {msg.senderName} • {msg.time}
                  </span>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-xs space-y-2 ${
                      isSupport
                        ? 'bg-[#162A60] text-white rounded-tr-xs'
                        : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    <p className="text-xs font-medium leading-relaxed">{msg.text}</p>

                    {/* Adjunto si existe */}
                    {msg.attachment && (
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold block truncate text-[11px]">{msg.attachment.title}</span>
                            <span className="text-[9.5px] text-slate-500 font-mono">{msg.attachment.ref}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black shrink-0">
                          VALIDADO STP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* BARRA DE ENTRADA Y RESPUESTAS RÁPIDAS (MACROS) */}
          <div className="p-3 bg-white border-t border-slate-200/90 shrink-0 space-y-2">
            {/* Macros de Respuesta Rápida */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                '✓ Comprobante SPEI validado con éxito.',
                '↑ Tu línea de crédito disponible ya fue liberada.',
                '📦 Nueva valera enviada a sucursal Saltillo para entrega.',
                '🏬 Comercio LanaTienda informado para canje inmediato.',
              ].map((macro, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(macro)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0 transition cursor-pointer border border-slate-200"
                >
                  {macro}
                </button>
              ))}
            </div>

            {/* Input y Botón de Enviar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Escribe tu mensaje a la Distribuidora (Enter para enviar)..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#162A60] transition"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!replyText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#162A60] hover:bg-[#1E3A8A] text-white text-xs font-black flex items-center gap-1.5 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
