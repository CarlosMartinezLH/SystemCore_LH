'use client';

import React, { useState } from 'react';
import {
  Prospect,
  StageId,
  RequiredDocument,
  DocumentStatus,
  ReferenceCheck,
  ChatterMessage,
} from '@/types/crm';
import { STAGES } from '@/lib/data/initialData';
import { useCoreSync } from '@/context/CoreSyncContext';
import { formatMoney } from '@/lib/utils/formatters';
import SignaturePad from './SignaturePad';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Camera,
  Upload,
  Phone,
  User,
  ShieldCheck,
  Building,
  Send,
  Printer,
  ChevronRight,
  Star,
  ExternalLink,
  Zap,
  Calendar,
  ChevronLeft,
  Search,
  Paperclip,
  Clock,
  Plus,
  MessageSquare,
  FileEdit,
  Activity,
} from 'lucide-react';

interface LeadDetailViewProps {
  prospect: Prospect;
  onBack: () => void;
  onUpdate: (updatedProspect: Prospect) => void;
  onVerPerfilCore?: (distribuidorId: number) => void;
}

export default function LeadDetailView({
  prospect,
  onBack,
  onUpdate,
  onVerPerfilCore,
}: LeadDetailViewProps) {
  const { pasarProspectoACore, registrarProspectoEnPersonas } = useCoreSync();
  const [data, setData] = useState<Prospect>(prospect);
  const [activeTab, setActiveTab] = useState<
    'notas' | 'contacto' | 'ine' | 'solicitud' | 'integracion' | 'mesa'
  >('notas');
  const [chatterMode, setChatterMode] = useState<'mensaje' | 'nota' | 'actividad'>('nota');
  const [newNote, setNewNote] = useState('');
  const [curpValidating, setCurpValidating] = useState(false);
  const [isPassingToCore, setIsPassingToCore] = useState(false);
  const [coreSuccessMsg, setCoreSuccessMsg] = useState<string | null>(null);

  // Field change helper
  const handleFieldChange = (field: keyof Prospect, value: any) => {
    const updated = {
      ...data,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    setData(updated);
    onUpdate(updated);
  };

  // Stage changes
  const handleStageChange = async (newStage: StageId) => {
    if (newStage === data.stage) return;
    if (newStage === 'activacion' && !data.coreSincronizado) {
      handlePasarACore();
      return;
    }
    const oldStageName = STAGES.find((s) => s.id === data.stage)?.name || data.stage;
    const stageName = STAGES.find((s) => s.id === newStage)?.name || newStage;
    const newMsg: ChatterMessage = {
      id: `msg-${Date.now()}`,
      author: 'Alejandro Domínguez',
      authorEmail: 'alejandro_dominguez@lanahora.com',
      type: 'sistema',
      content: `Se cambió la etapa\n${oldStageName} → ${stageName} (Etapa)`,
      createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated: Prospect = {
      ...data,
      stage: newStage,
      messages: [newMsg, ...data.messages],
      updatedAt: new Date().toISOString(),
    };
    setData(updated);
    onUpdate(updated);

    if (newStage !== 'contacto' && newStage !== 'perdido') {
      const res = await registrarProspectoEnPersonas(data.id, newStage);
      if (res?.persona) {
        setCoreSuccessMsg(`✓ Prospecto registrado en Personas (ID #${res.persona.personaId})`);
        setTimeout(() => setCoreSuccessMsg(null), 5000);
      }
    }
  };

  // Validar CURP en Cartera Core LH
  const handleValidateCurp = () => {
    if (!data.curp || data.curp.length < 18) {
      alert('Por favor captura una CURP válida de 18 caracteres antes de validar.');
      return;
    }
    setCurpValidating(true);
    setTimeout(() => {
      const isBlocked = data.curp.endsWith('99') || data.curp.endsWith('XX');
      const status = isBlocked ? 'NO_VALIDO' : 'VALIDO';
      const reason = isBlocked
        ? 'Cuenta con saldo activo o antecedentes en gestoría según Cartera Core LH.'
        : 'PERSONA NO EXISTE EN EL REGISTRO';

      const newMsg: ChatterMessage = {
        id: `msg-${Date.now()}`,
        author: 'Sistema Core LH',
        authorEmail: 'api@core.lanahora.com.mx',
        type: 'sistema',
        content: `Ninguno → ${reason} (Comentarios financial)\nNinguno → ${status} (Respuesta financial)`,
        createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };

      const updated: Prospect = {
        ...data,
        financialCurpStatus: status,
        financialCurpReason: reason,
        financialComments: isBlocked ? 'Rechazado por política de riesgo' : reason,
        messages: [newMsg, ...data.messages],
      };

      setData(updated);
      onUpdate(updated);
      setCurpValidating(false);
    }, 800);
  };

  // Pasar Prospecto a Core Central
  const handlePasarACore = async () => {
    setIsPassingToCore(true);
    try {
      const res = await pasarProspectoACore(data.id);
      if (res.success && res.distribuidor) {
        const updated: Prospect = {
          ...data,
          stage: 'activacion',
          coreSincronizado: true,
          coreDistribuidorId: res.distribuidor.noDist,
          corePersonaId: res.persona?.personaId,
          fechaPaseCore: new Date().toLocaleString('es-MX'),
        };
        setData(updated);
        onUpdate(updated);
        setCoreSuccessMsg(`¡Prospecto activado exitosamente en Core Central como Distribuidora #${res.distribuidor.noDist}!`);
        setTimeout(() => setCoreSuccessMsg(null), 8000);
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error al transferir prospecto a Core Central.');
    } finally {
      setIsPassingToCore(false);
    }
  };

  // Add Chatter note
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const msg: ChatterMessage = {
      id: `msg-${Date.now()}`,
      author: 'Eduardo Del Rio Alvarez',
      authorEmail: 'eduardo.delrio@lanahora.com',
      type: chatterMode === 'nota' ? 'nota' : 'actividad',
      content: newNote.trim(),
      createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated: Prospect = {
      ...data,
      messages: [msg, ...data.messages],
      updatedAt: new Date().toISOString(),
    };
    setData(updated);
    onUpdate(updated);
    setNewNote('');
  };

  const getAdvisorBadge = (advisorName: string) => {
    const first = advisorName?.trim().charAt(0).toUpperCase() || 'E';
    if (first === 'E') return { letter: 'E', bg: 'bg-emerald-600 text-white' };
    if (first === 'I') return { letter: 'i', bg: 'bg-slate-500 text-white font-mono' };
    return { letter: 'M', bg: 'bg-blue-600 text-white' };
  };

  const advBadge = getAdvisorBadge(data.advisorName || 'Eduardo Del Rio Alvarez');
  const pipelineStages = STAGES.filter((s) => s.id !== 'perdido');

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#f8fafc] text-slate-800 font-sans select-none overflow-hidden">
      
      {/* ======================================================== */}
      {/* SUB-HEADER SUPERIOR EN BLANCO CORPORATIVO                */}
      {/* ======================================================== */}
      <div className="px-4 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Volver a Kanban"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Botón [+ Nuevo] azul institucional */}
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 cursor-pointer shadow-2xs"
          >
            Nuevo
          </button>

          {/* Breadcrumb Prospecto */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-blue-600 font-medium hover:underline cursor-pointer" onClick={onBack}>
              CRM
            </span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-800 truncate max-w-[200px] sm:max-w-xs">
              {data.opportunityName}
            </span>
          </div>
        </div>

        {/* Centro y Derecha: Reuniones y Paginación */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-xs font-normal bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200/70 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Sin reuniones</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="font-mono text-slate-600 font-normal">1 / 96</span>
            <button type="button" className="p-1 hover:text-slate-900 transition cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1 hover:text-slate-900 transition cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BARRA DE ETAPAS / PIPELINE CHEVRONS                       */}
      {/* ======================================================== */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Acciones principales a la izquierda */}
        <div className="flex items-center gap-2">
          {/* Botón Perdido */}
          <button
            type="button"
            onClick={() => handleStageChange('perdido')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              data.stage === 'perdido'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Perdido
          </button>

          {/* Validar CURP en Core */}
          <button
            type="button"
            onClick={handleValidateCurp}
            disabled={curpValidating}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{curpValidating ? 'Validando...' : 'Validar CURP'}</span>
          </button>

          {/* Botón Central: PASAR A CORE CENTRAL */}
          {!data.coreSincronizado ? (
            <button
              type="button"
              onClick={handlePasarACore}
              disabled={isPassingToCore}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>{isPassingToCore ? 'Activando en Core...' : '⚡ Pasar a Core Central'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enlazado a Core (DV #{data.coreDistribuidorId})</span>
              </span>
              {onVerPerfilCore && data.coreDistribuidorId && (
                <button
                  type="button"
                  onClick={() => onVerPerfilCore(data.coreDistribuidorId!)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Perfil DV</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pipeline Chevron en Color Claro Institucional */}
        <div className="flex items-center rounded-lg overflow-hidden text-xs bg-slate-100 border border-slate-200">
          {pipelineStages.map((st, idx) => {
            const isActive = data.stage === st.id;
            const currentIdx = pipelineStages.findIndex((s) => s.id === data.stage);
            const isPast = currentIdx > idx;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStageChange(st.id)}
                className={`px-3 py-1.5 border-r border-slate-200 last:border-r-0 whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-2xs'
                    : isPast
                    ? 'bg-blue-50 text-blue-900 hover:bg-blue-100/70 border-r border-blue-200 font-normal'
                    : 'bg-transparent text-slate-500 hover:text-slate-800 font-normal'
                }`}
              >
                <span>{st.name}</span>
                {isActive && (
                  <span className="text-[10px] font-mono text-blue-100 ml-0.5">1min</span>
                )}
                {isPast && idx === 0 && (
                  <span className="text-[10px] font-mono text-slate-400 ml-0.5">3min</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner de Éxito al pasar a Core Central */}
      {coreSuccessMsg && (
        <div className="mx-4 mt-3 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-emerald-900 text-xs font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{coreSuccessMsg}</span>
          </div>
          {onVerPerfilCore && data.coreDistribuidorId && (
            <button
              type="button"
              onClick={() => onVerPerfilCore(data.coreDistribuidorId!)}
              className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs inline-flex items-center gap-1 transition cursor-pointer"
            >
              <span>Abrir Perfil Distribuidor</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTENIDO PRINCIPAL: FORMULARIO (IZQ) Y CHATTER (DER)    */}
      {/* ======================================================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 overflow-hidden bg-[#f8fafc]">
        
        {/* ====================================================== */}
        {/* COLUMNA IZQUIERDA: FORMULARIO EN BLANCO (8 cols)       */}
        {/* ====================================================== */}
        <div className="lg:col-span-8 p-4 lg:p-6 overflow-y-auto space-y-5 h-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-6">
            
            {/* TÍTULO PRINCIPAL: NOMBRE DE LA OPORTUNIDAD */}
            <div>
              <span className="text-[10px] uppercase font-medium tracking-wider text-blue-600 block mb-1">
                Oportunidad de Crédito LanAhora
              </span>
              <input
                type="text"
                value={data.opportunityName}
                onChange={(e) => handleFieldChange('opportunityName', e.target.value.toUpperCase())}
                className="text-2xl lg:text-3xl font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none w-full transition tracking-tight"
              />
            </div>

            {/* GRID DE DOS COLUMNAS DE CAMPOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              
              {/* --- COLUMNA 1: DATOS PERSONALES --- */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Nombre</span>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value.toUpperCase())}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Segundo Nombre</span>
                  <input
                    type="text"
                    value={data.middleName || ''}
                    onChange={(e) => handleFieldChange('middleName', e.target.value.toUpperCase())}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Primer Apellido</span>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value.toUpperCase())}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Segundo apellido</span>
                  <input
                    type="text"
                    value={data.secondLastName || ''}
                    onChange={(e) => handleFieldChange('secondLastName', e.target.value.toUpperCase())}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Correo electrónico</span>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => handleFieldChange('email', e.target.value.toUpperCase())}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Teléfono</span>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">CURP</span>
                  <input
                    type="text"
                    maxLength={18}
                    value={data.curp}
                    onChange={(e) => handleFieldChange('curp', e.target.value.toUpperCase())}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">RFC</span>
                  <input
                    type="text"
                    maxLength={13}
                    value={data.rfc}
                    onChange={(e) => handleFieldChange('rfc', e.target.value.toUpperCase())}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>
              </div>

              {/* --- COLUMNA 2: DATOS COMERCIALES & FINANCIEROS --- */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Asesor</span>
                  <div className="col-span-2 flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className={`w-4 h-4 rounded text-[10px] font-medium flex items-center justify-center ${advBadge.bg}`}>
                      {advBadge.letter}
                    </div>
                    <span className="text-slate-800 font-medium">{data.advisorName || 'Eduardo Del Rio Alvarez'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Equipo de ventas</span>
                  <input
                    type="text"
                    value={data.salesTeam || 'Gómez Palacio'}
                    onChange={(e) => handleFieldChange('salesTeam', e.target.value)}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Empresa</span>
                  <input
                    type="text"
                    value={data.company || 'Gómez Palacio'}
                    onChange={(e) => handleFieldChange('company', e.target.value)}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Tipo distribuidor</span>
                  <select
                    value={data.distributorType || 'DV'}
                    onChange={(e) => handleFieldChange('distributorType', e.target.value)}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition cursor-pointer"
                  >
                    <option value="DV">EMPRENDEDORA</option>
                    <option value="Emprendedor">DV Tradicional</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Tipo experiencia</span>
                  <input
                    type="text"
                    value={data.experienceType || 'Trabajo Formal'}
                    onChange={(e) => handleFieldChange('experienceType', e.target.value)}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Origen ?</span>
                  <input
                    type="text"
                    value={data.origin || 'Redes asesor'}
                    onChange={(e) => handleFieldChange('origin', e.target.value as any)}
                    className="col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-normal focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                  />
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Respuesta financial</span>
                  <span className="col-span-2 font-semibold text-emerald-700 tracking-wide">
                    {data.financialCurpStatus === 'VALIDO' ? 'VALIDO' : data.financialCurpStatus === 'NO_VALIDO' ? 'NO VALIDO' : 'NO EVALUADO'}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Comentarios Financial</span>
                  <span className="col-span-2 text-slate-700 font-normal truncate">
                    {data.financialComments || 'PERSONA NO EXISTE EN EL REGISTRO'}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Resultado Buró</span>
                  <span className="col-span-2 text-slate-700 font-normal">
                    {data.bureauResult !== 'NO_CONSULTADO' ? data.bureauResult : '—'}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Perfil</span>
                  <span className="col-span-2 text-slate-700 font-normal">
                    {data.assignedProfile !== 'SIN_ASIGNAR' ? data.assignedProfile : '—'}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="text-slate-600 font-medium">Comentarios Buro</span>
                  <span className="col-span-2 text-slate-500 italic text-[11px] font-normal">
                    {data.bureauDictumDate ? `Dictamen emitido el ${data.bureauDictumDate}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PESTAÑAS INFERIORES: NOTAS, CONTACTO, INE, ETC.          */}
            {/* ======================================================== */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-6 border-b border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('notas')}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === 'notas' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-normal'
                  }`}
                >
                  <span>Notas</span>
                  {activeTab === 'notas' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('contacto')}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === 'contacto' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-normal'
                  }`}
                >
                  <span>Contacto</span>
                  {activeTab === 'contacto' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ine')}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === 'ine' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-normal'
                  }`}
                >
                  <span>INE</span>
                  {activeTab === 'ine' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('solicitud')}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === 'solicitud' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-normal'
                  }`}
                >
                  <span>Solicitud de Crédito</span>
                  {activeTab === 'solicitud' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('integracion')}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === 'integracion' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-normal'
                  }`}
                >
                  <span>Expediente & Fotos</span>
                  {activeTab === 'integracion' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('mesa')}
                  className={`pb-2.5 transition relative cursor-pointer ${
                    activeTab === 'mesa' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-normal'
                  }`}
                >
                  <span>Líneas Autorizadas</span>
                  {activeTab === 'mesa' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              </div>

              {/* CONTENIDO DE CADA PESTAÑA */}
              <div className="pt-4">
                {activeTab === 'notas' && (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      placeholder="Agregar una descripción o notas de seguimiento de la prospecta..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition"
                    />
                  </div>
                )}

                {activeTab === 'contacto' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <label className="text-slate-600 block font-medium">Calle y Número Exterior:</label>
                      <input
                        type="text"
                        value={data.street || 'AVENIDA HIDALGO'}
                        onChange={(e) => handleFieldChange('street', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-normal"
                      />
                      <label className="text-slate-600 block font-medium">Colonia / Código Postal:</label>
                      <input
                        type="text"
                        value={`${data.neighborhood || 'CENTRO'} - CP ${data.zipCode || '35000'}`}
                        onChange={(e) => handleFieldChange('neighborhood', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-normal"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-600 block font-medium">Municipio / Ciudad:</label>
                      <input
                        type="text"
                        value={`${data.city || 'Gómez Palacio'}, ${data.state || 'Durango'}`}
                        disabled
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-normal"
                      />
                      <label className="text-slate-600 block font-medium">Estado Civil & Dependientes:</label>
                      <input
                        type="text"
                        value="CASADA · 2 DEPENDIENTES"
                        disabled
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-normal"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'ine' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium">Identificación Oficial (INE / Pasaporte)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                        OCR Cotejado 100%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
                        <Camera className="w-6 h-6 text-blue-600" />
                        <span className="text-[11px] font-medium text-slate-800">INE Anverso</span>
                        <span className="text-[10px] text-slate-500">INE_ANVERSO_COTEJADO.JPG</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
                        <Camera className="w-6 h-6 text-blue-600" />
                        <span className="text-[11px] font-medium text-slate-800">INE Reverso</span>
                        <span className="text-[10px] text-slate-500">INE_REVERSO_COTEJADO.JPG</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'solicitud' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-800 block">Firma Digital del Prospecto</span>
                        <span className="text-[11px] text-slate-500">Capturada en dispositivo móvil</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-xs">
                        ✓ Firmado Electrónicamente
                      </span>
                    </div>
                    <SignaturePad
                      initialSignature={data.signatureDataUrl}
                      onSave={(val: string) => handleFieldChange('signatureDataUrl', val)}
                    />
                  </div>
                )}

                {activeTab === 'integracion' && (
                  <div className="space-y-2 text-xs">
                    <span className="text-slate-600 block font-medium">Expediente Documental de la Prospecta:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.documents.slice(0, 6).map((doc) => (
                        <div
                          key={doc.id}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-[11px] text-slate-800 font-normal truncate">{doc.documentName}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'mesa' && (
                  <div className="space-y-3 text-xs">
                    <span className="text-slate-600 block font-medium">Líneas de Crédito Dictaminadas:</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-medium block">Línea Valelana</span>
                        <strong className="text-base text-blue-700 font-mono font-medium">
                          {formatMoney(data.creditLines?.valelana || 150000)}
                        </strong>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-medium block">Crédito Personal</span>
                        <strong className="text-base text-blue-700 font-mono font-medium">
                          {formatMoney(data.creditLines?.personal || 15000)}
                        </strong>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-medium block">LanaTienda</span>
                        <strong className="text-base text-amber-600 font-mono font-medium">
                          {formatMoney(data.creditLines?.lanatienda || 20000)}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* COLUMNA DERECHA: CHATTER / BITÁCORA EN BLANCO (4 cols) */}
        {/* ====================================================== */}
        <div className="lg:col-span-4 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full min-h-0 overflow-hidden">
          
          {/* BOTONES SUPERIORES DEL CHATTER */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setChatterMode('mensaje')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  chatterMode === 'mensaje'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Mensaje</span>
              </button>

              <button
                type="button"
                onClick={() => setChatterMode('nota')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  chatterMode === 'nota'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileEdit className="w-3 h-3" />
                <span>Nota</span>
              </button>

              <button
                type="button"
                onClick={() => setChatterMode('actividad')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  chatterMode === 'actividad'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Actividad</span>
              </button>
            </div>

            {/* Íconos de acción */}
            <div className="flex items-center gap-1 text-slate-400">
              <Search className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
              <Paperclip className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
              <User className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer" />
            </div>
          </div>

          {/* INPUT PARA AGREGAR NOTA O MENSAJE */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2 shrink-0">
            <textarea
              rows={2}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={
                chatterMode === 'nota'
                  ? 'Escribe una nota interna para el expediente...'
                  : chatterMode === 'mensaje'
                  ? 'Enviar mensaje a asesor o mesa...'
                  : 'Registrar nueva actividad programada...'
              }
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition font-normal"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-2xs transition active:scale-95"
              >
                <Send className="w-3 h-3" />
                <span>Publicar</span>
              </button>
            </div>
          </div>

          {/* TIMELINE DE MENSAJES Y AUDITORÍA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Separador de Fecha */}
            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
              <div className="flex-1 h-px bg-slate-200" />
              <span>Hoy</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Mensajes del Chatter */}
            {data.messages.map((msg) => {
              const isEduardo = msg.author.includes('Eduardo');
              const isAlejandro = msg.author.includes('Alejandro') || msg.author.includes('alejandro');

              return (
                <div key={msg.id} className="flex items-start gap-2.5 text-xs animate-in fade-in">
                  {/* Avatar inicial */}
                  <div
                    className={`w-6 h-6 rounded text-[11px] font-medium flex items-center justify-center shrink-0 ${
                      isEduardo
                        ? 'bg-emerald-600 text-white'
                        : isAlejandro
                        ? 'bg-indigo-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isEduardo ? 'E' : isAlejandro ? 'A' : 'S'}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-slate-800">{msg.authorEmail || msg.author}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.createdAt}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 text-xs whitespace-pre-line leading-relaxed shadow-2xs font-normal">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
