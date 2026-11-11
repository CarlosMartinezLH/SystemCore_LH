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
} from 'lucide-react';

interface LeadDetailViewProps {
  prospect: Prospect;
  onBack: () => void;
  onUpdate: (updatedProspect: Prospect) => void;
}

export default function LeadDetailView({
  prospect,
  onBack,
  onUpdate,
}: LeadDetailViewProps) {
  const [data, setData] = useState<Prospect>(prospect);
  const [activeTab, setActiveTab] = useState<
    'notas' | 'contacto' | 'ine' | 'solicitud' | 'integracion' | 'mesa'
  >('notas');
  const [newNote, setNewNote] = useState('');
  const [curpValidating, setCurpValidating] = useState(false);

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
  const handleStageChange = (newStage: StageId) => {
    const stageName = STAGES.find((s) => s.id === newStage)?.name || newStage;
    const newMsg: ChatterMessage = {
      id: `msg-${Date.now()}`,
      author: 'Alejandro Domínguez',
      authorEmail: 'alejandro_dominguez@lanahora.com',
      type: 'sistema',
      content: `Etapa cambiada a "${stageName}"`,
      createdAt: new Date().toLocaleString('es-MX'),
    };
    const updated: Prospect = {
      ...data,
      stage: newStage,
      messages: [newMsg, ...data.messages],
      updatedAt: new Date().toISOString(),
    };
    setData(updated);
    onUpdate(updated);
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
        : 'Sin adeudos activos ni créditos vigentes. Habilitado para prospección.';

      const newMsg: ChatterMessage = {
        id: `msg-${Date.now()}`,
        author: 'Sistema Core LH',
        authorEmail: 'api@core.lanahora.com.mx',
        type: 'sistema',
        content: `Validación de CURP completada: ${status}. Motivo: ${reason}`,
        createdAt: new Date().toLocaleString('es-MX'),
      };

      const updated: Prospect = {
        ...data,
        financialCurpStatus: status,
        financialCurpReason: reason,
        financialComments: isBlocked ? 'Rechazado por política de riesgo' : 'Aprobado para consulta de Buró',
        messages: [newMsg, ...data.messages],
      };

      setData(updated);
      onUpdate(updated);
      setCurpValidating(false);
    }, 1000);
  };

  // Add Chatter note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteMsg: ChatterMessage = {
      id: `msg-${Date.now()}`,
      author: 'Alejandro Domínguez',
      authorEmail: 'alejandro_dominguez@lanahora.com',
      type: 'nota',
      content: newNote.trim(),
      createdAt: new Date().toLocaleString('es-MX'),
    };

    const updated: Prospect = {
      ...data,
      messages: [noteMsg, ...data.messages],
    };
    setData(updated);
    onUpdate(updated);
    setNewNote('');
  };

  // Update document status
  const handleDocumentStatus = (docId: string, status: DocumentStatus) => {
    const updatedDocs = data.documents.map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          status,
          updatedAt: new Date().toISOString(),
          fileUrl: status === 'CARGADO' || status === 'VALIDADO' ? `/docs/mock/${doc.fieldKey}.pdf` : undefined,
          fileName: status === 'CARGADO' || status === 'VALIDADO' ? `${doc.fieldKey}.pdf` : undefined,
        };
      }
      return doc;
    });

    handleFieldChange('documents', updatedDocs);
  };

  // Signature save
  const handleSaveSignature = (sigUrl: string) => {
    const updated: Prospect = {
      ...data,
      signatureDataUrl: sigUrl,
      signedAt: sigUrl ? new Date().toISOString() : undefined,
    };
    setData(updated);
    onUpdate(updated);
  };

  // Current stage index for stepper
  const currentStageIndex = STAGES.findIndex((s) => s.id === data.stage);

  return (
    <div className="flex-1 bg-[#f0f4fa] min-h-[calc(100vh-105px)] p-3 md:p-6 text-slate-800">
      <div className="w-full space-y-4">
        {/* Top Control Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          {/* Back & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onBack}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Volver a Tubería</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              onClick={handleValidateCurp}
              disabled={curpValidating}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                curpValidating
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {curpValidating ? 'Consultando Cartera Core...' : 'Validar CURP'}
            </button>

            <button
              onClick={() => handleStageChange('perdido')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
            >
              Perdido
            </button>

            {currentStageIndex < STAGES.length - 2 && (
              <button
                onClick={() => handleStageChange(STAGES[currentStageIndex + 1].id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-500 text-slate-900 flex items-center gap-1 shadow-sm transition active:scale-95"
              >
                <span>Avanzar Etapa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stepper Chevron Pipeline */}
          <div className="flex items-center rounded-lg border border-slate-200 overflow-x-auto text-[11px] font-semibold bg-slate-50 shadow-inner">
            {STAGES.filter((s) => s.id !== 'perdido').map((st, idx) => {
              const isActive = data.stage === st.id;
              const isPast = STAGES.findIndex((s) => s.id === data.stage) > idx;

              return (
                <button
                  key={st.id}
                  onClick={() => handleStageChange(st.id)}
                  className={`px-3 py-1.5 border-r border-slate-200 whitespace-nowrap transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : isPast
                      ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{st.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Opportunity Card Main Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex-1 min-w-[280px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                Oportunidad de Crédito LanAhora
              </span>
              <input
                type="text"
                value={data.opportunityName}
                onChange={(e) => handleFieldChange('opportunityName', e.target.value.toUpperCase())}
                className="text-xl md:text-2xl font-extrabold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 text-slate-900 focus:outline-none w-full transition"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Rating Stars */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
                {[1, 2, 3].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFieldChange('priorityStars', star === data.priorityStars ? 0 : star)}
                    className="p-0.5 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= data.priorityStars
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Status Badge */}
              {data.financialCurpStatus === 'VALIDO' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CURP VÁLIDA
                </span>
              ) : data.financialCurpStatus === 'NO_VALIDO' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> NO VÁLIDO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                  CURP SIN VALIDAR
                </span>
              )}
            </div>
          </div>

          {/* Form Fields: Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            {/* Left Column: Personal Data */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Nombre</label>
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value.toUpperCase())}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Segundo Nombre</label>
                <input
                  type="text"
                  value={data.middleName || ''}
                  onChange={(e) => handleFieldChange('middleName', e.target.value.toUpperCase())}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Primer Apellido</label>
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value.toUpperCase())}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Segundo Apellido</label>
                <input
                  type="text"
                  value={data.secondLastName || ''}
                  onChange={(e) => handleFieldChange('secondLastName', e.target.value.toUpperCase())}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Correo electrónico</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleFieldChange('email', e.target.value.toLowerCase())}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Teléfono</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-mono transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">CURP</label>
                <div className="col-span-2 flex gap-2">
                  <input
                    type="text"
                    maxLength={18}
                    value={data.curp}
                    onChange={(e) => handleFieldChange('curp', e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-mono font-bold transition"
                  />
                  <span className="text-[10px] text-slate-400 self-center font-mono">
                    {data.curp.length}/18
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">RFC</label>
                <input
                  type="text"
                  maxLength={13}
                  value={data.rfc}
                  onChange={(e) => handleFieldChange('rfc', e.target.value.toUpperCase())}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-mono transition"
                />
              </div>
            </div>

            {/* Right Column: Commercial and Financial Data */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Asesor</label>
                <div className="col-span-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {data.advisorName.charAt(0)}
                  </div>
                  <span className="text-slate-800 text-xs font-medium">{data.advisorEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Equipo de ventas</label>
                <input
                  type="text"
                  value={data.salesTeam}
                  onChange={(e) => handleFieldChange('salesTeam', e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Empresa</label>
                <input
                  type="text"
                  value={data.company}
                  onChange={(e) => handleFieldChange('company', e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Tipo de distribuidor</label>
                <select
                  value={data.distributorType}
                  onChange={(e) => handleFieldChange('distributorType', e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                >
                  <option value="DV">Distribuidor de Vales (DV Tradicional)</option>
                  <option value="Emprendedor">Emprendedor</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Tipo de experiencia</label>
                <input
                  type="text"
                  value={data.experienceType}
                  onChange={(e) => handleFieldChange('experienceType', e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Origen</label>
                <select
                  value={data.origin}
                  onChange={(e) => handleFieldChange('origin', e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                >
                  <option value="COORDINADOR DE NEGOCIOS">COORDINADOR DE NEGOCIOS</option>
                  <option value="DISTRIBUIDOR">DISTRIBUIDOR (REFERIDO)</option>
                  <option value="CAMBACEO">CAMBACEO TRADICIONAL</option>
                  <option value="COMERCIOS">COMERCIOS (INEGI)</option>
                  <option value="PLANTON">PLANTÓN</option>
                  <option value="TELEMARKETING">TELEMARKETING</option>
                  <option value="RECONSULTA">RECONSULTA</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-600 font-semibold">Respuesta financial</label>
                <div className="col-span-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      data.financialCurpStatus === 'VALIDO'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : data.financialCurpStatus === 'NO_VALIDO'
                        ? 'bg-rose-50 text-rose-700 border border-rose-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {data.financialCurpStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-start">
                <label className="text-slate-600 font-semibold pt-1">Comentarios Financial</label>
                <div className="col-span-2 text-slate-700 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {data.financialCurpReason || 'Sin comentarios registrados por Cartera Core'}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation (LanAhora Royal Blue) */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('notas')}
                className={`px-4 py-2.5 rounded-t-lg transition relative ${
                  activeTab === 'notas'
                    ? 'text-blue-700 font-bold bg-blue-50/70 border-b-2 border-yellow-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Notas & Bitácora ({data.messages.length})
              </button>
              <button
                onClick={() => setActiveTab('contacto')}
                className={`px-4 py-2.5 rounded-t-lg transition relative ${
                  activeTab === 'contacto'
                    ? 'text-blue-700 font-bold bg-blue-50/70 border-b-2 border-yellow-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Contacto & Domicilio
              </button>
              <button
                onClick={() => setActiveTab('ine')}
                className={`px-4 py-2.5 rounded-t-lg transition relative ${
                  activeTab === 'ine'
                    ? 'text-blue-700 font-bold bg-blue-50/70 border-b-2 border-yellow-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Fotografías INE
              </button>
              <button
                onClick={() => setActiveTab('solicitud')}
                className={`px-4 py-2.5 rounded-t-lg transition relative ${
                  activeTab === 'solicitud'
                    ? 'text-blue-700 font-bold bg-blue-50/70 border-b-2 border-yellow-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Solicitud de Crédito & Firma Digital
              </button>
              <button
                onClick={() => setActiveTab('integracion')}
                className={`px-4 py-2.5 rounded-t-lg transition relative flex items-center gap-1.5 ${
                  activeTab === 'integracion'
                    ? 'text-blue-700 font-bold bg-blue-50/70 border-b-2 border-yellow-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>Integración Expediente (25 Docs)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {data.documents.filter((d) => d.status === 'VALIDADO' || d.status === 'CARGADO').length}/25
                </span>
              </button>
              <button
                onClick={() => setActiveTab('mesa')}
                className={`px-4 py-2.5 rounded-t-lg transition relative ${
                  activeTab === 'mesa'
                    ? 'text-blue-700 font-bold bg-blue-50/70 border-b-2 border-yellow-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Mesa de Crédito & Buró
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="py-4">
              {/* TAB 1: NOTAS / BITÁCORA */}
              {activeTab === 'notas' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Escribe una nota interna o actualización sobre el prospecto..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 text-xs transition"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Registrar Nota
                      </button>
                    </div>
                  </form>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Historial de Actividades & Sistema
                    </h4>
                    {data.messages.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                          {m.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-slate-900">{m.author}</span>
                            <span className="text-slate-400">{m.createdAt}</span>
                          </div>
                          <p className="text-slate-700">{m.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACTO & DOMICILIO */}
              {activeTab === 'contacto' && (
                <div className="space-y-5 text-xs">
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-sm text-blue-700 mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" /> Domicilio del Prospecto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-slate-600 font-semibold mb-1">Calle y Dirección Completa</label>
                        <input
                          type="text"
                          value={data.street}
                          onChange={(e) => handleFieldChange('street', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Código Postal (C.P.)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={data.zipCode}
                          onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">No. Exterior</label>
                        <input
                          type="text"
                          value={data.extNumber}
                          onChange={(e) => handleFieldChange('extNumber', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">No. Interior</label>
                        <input
                          type="text"
                          value={data.intNumber || ''}
                          onChange={(e) => handleFieldChange('intNumber', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Colonia</label>
                        <input
                          type="text"
                          value={data.neighborhood}
                          onChange={(e) => handleFieldChange('neighborhood', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Municipio</label>
                        <input
                          type="text"
                          value={data.municipality}
                          onChange={(e) => handleFieldChange('municipality', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Ciudad</label>
                        <input
                          type="text"
                          value={data.city}
                          onChange={(e) => handleFieldChange('city', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Estado</label>
                        <input
                          type="text"
                          value={data.state}
                          onChange={(e) => handleFieldChange('state', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-sm text-blue-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" /> Datos Socioeconómicos & Laborales
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          value={data.birthDate || ''}
                          onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Género</label>
                        <select
                          value={data.gender || 'FEMENINO'}
                          onChange={(e) => handleFieldChange('gender', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        >
                          <option value="FEMENINO">Femenino</option>
                          <option value="MASCULINO">Masculino</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Estado Civil</label>
                        <select
                          value={data.maritalStatus || 'CASADO'}
                          onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        >
                          <option value="CASADO">Casado(a)</option>
                          <option value="SOLTERO">Soltero(a)</option>
                          <option value="UNION_LIBRE">Unión Libre</option>
                          <option value="DIVORCIADO">Divorciado(a)</option>
                          <option value="VIUDO">Viudo(a)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Empresa / Negocio</label>
                        <input
                          type="text"
                          value={data.workCompany || ''}
                          onChange={(e) => handleFieldChange('workCompany', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Puesto</label>
                        <input
                          type="text"
                          value={data.jobTitle || ''}
                          onChange={(e) => handleFieldChange('jobTitle', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Sueldo / Ingreso Mensual ($ MXN)</label>
                        <input
                          type="number"
                          value={data.monthlySalary || ''}
                          onChange={(e) => handleFieldChange('monthlySalary', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Antigüedad (Años)</label>
                        <input
                          type="number"
                          value={data.seniorityYears || ''}
                          onChange={(e) => handleFieldChange('seniorityYears', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">No. Dependientes Económicos</label>
                        <input
                          type="number"
                          value={data.dependentsCount || 0}
                          onChange={(e) => handleFieldChange('dependentsCount', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Nacionalidad</label>
                        <input
                          type="text"
                          value={data.nationality || 'MEXICANA'}
                          onChange={(e) => handleFieldChange('nationality', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FOTOGRAFÍAS INE */}
              {activeTab === 'ine' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-600" /> Identificación Oficial (INE / Pasaporte)
                      </h4>
                      <div className="flex items-center gap-2">
                        <label className="text-slate-600 font-semibold">Número de Identificación (IDMEX / Folio):</label>
                        <input
                          type="text"
                          value={data.ineNumber || ''}
                          onChange={(e) => handleFieldChange('ineNumber', e.target.value.toUpperCase())}
                          placeholder="IDMEX..."
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-[11px] mb-4 space-y-1">
                      <p className="font-bold">Requisitos obligatorios de captura según manual LanAhora:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-yellow-900/90">
                        <li>Documento en posición horizontal.</li>
                        <li>Sin sombreado y sin marcas de flash.</li>
                        <li>Recortar el fondo para enfocar solo el documento.</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* INE Anverso */}
                      <div className="border border-dashed border-slate-300 rounded-xl p-5 bg-white text-center flex flex-col items-center justify-center min-h-[180px] shadow-sm">
                        <Camera className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="font-bold text-slate-800">Fotografía INE Anverso (Frente)</span>
                        <p className="text-[10px] text-slate-400 mt-1 mb-3">
                          {data.ineFrontUrl ? '✓ Fotografía cargada' : 'No se ha adjuntado fotografía'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleFieldChange('ineFrontUrl', '/mock/ine-frente.jpg')}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {data.ineFrontUrl ? 'Reemplazar Foto Frente' : 'Cargar Foto Frente'}
                        </button>
                      </div>

                      {/* INE Reverso */}
                      <div className="border border-dashed border-slate-300 rounded-xl p-5 bg-white text-center flex flex-col items-center justify-center min-h-[180px] shadow-sm">
                        <Camera className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="font-bold text-slate-800">Fotografía INE Reverso (Atrás)</span>
                        <p className="text-[10px] text-slate-400 mt-1 mb-3">
                          {data.ineBackUrl ? '✓ Fotografía cargada' : 'No se ha adjuntado fotografía'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleFieldChange('ineBackUrl', '/mock/ine-reverso.jpg')}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {data.ineBackUrl ? 'Reemplazar Foto Reverso' : 'Cargar Foto Reverso'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SOLICITUD DE CRÉDITO & FIRMA DIGITAL */}
              {activeTab === 'solicitud' && (
                <div className="space-y-5 text-xs">
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" /> Solicitud Dinámica de Crédito
                      </h4>
                      <button
                        type="button"
                        onClick={() => alert('Generando solicitud de crédito en formato PDF para impresión/expediente...')}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir Solicitud PDF
                      </button>
                    </div>

                    {/* Cónyuge */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasSpouse"
                          checked={data.hasSpouse}
                          onChange={(e) => handleFieldChange('hasSpouse', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="hasSpouse" className="font-bold text-slate-800">
                          ¿Cuenta con Cónyuge?
                        </label>
                      </div>
                      {data.hasSpouse && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Nombre Completo del Cónyuge</label>
                            <input
                              type="text"
                              value={data.spouseName || ''}
                              onChange={(e) => handleFieldChange('spouseName', e.target.value.toUpperCase())}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Teléfono del Cónyuge</label>
                            <input
                              type="tel"
                              value={data.spousePhone || ''}
                              onChange={(e) => handleFieldChange('spousePhone', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Aval */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasGuarantor"
                          checked={data.hasGuarantor}
                          onChange={(e) => handleFieldChange('hasGuarantor', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="hasGuarantor" className="font-bold text-slate-800">
                          ¿Cuenta con Aval?
                        </label>
                      </div>
                      {data.hasGuarantor && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Nombre del Aval</label>
                            <input
                              type="text"
                              value={data.guarantorName || ''}
                              onChange={(e) => handleFieldChange('guarantorName', e.target.value.toUpperCase())}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Teléfono del Aval</label>
                            <input
                              type="tel"
                              value={data.guarantorPhone || ''}
                              onChange={(e) => handleFieldChange('guarantorPhone', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-semibold mb-1">Parentesco</label>
                            <input
                              type="text"
                              value={data.guarantorRelation || ''}
                              onChange={(e) => handleFieldChange('guarantorRelation', e.target.value.toUpperCase())}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Segunda Vivienda */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasAdditionalProperty"
                          checked={data.hasAdditionalProperty}
                          onChange={(e) => handleFieldChange('hasAdditionalProperty', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="hasAdditionalProperty" className="font-bold text-slate-800">
                          ¿Cuenta con vivienda o propiedad adicional?
                        </label>
                      </div>
                      {data.hasAdditionalProperty && (
                        <div className="pt-2">
                          <label className="block text-slate-600 font-semibold mb-1">Ubicación y Datos de la Segunda Propiedad</label>
                          <input
                            type="text"
                            value={data.additionalPropertyAddress || ''}
                            onChange={(e) => handleFieldChange('additionalPropertyAddress', e.target.value.toUpperCase())}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                          />
                        </div>
                      )}
                    </div>

                    {/* PEPs */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasPepFamily"
                          checked={data.hasPepFamily}
                          onChange={(e) => handleFieldChange('hasPepFamily', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="hasPepFamily" className="font-bold text-slate-800">
                          ¿El prospecto o familiares cuentan con funciones públicas (PEPs)?
                        </label>
                      </div>
                      {data.hasPepFamily && (
                        <div className="pt-2">
                          <label className="block text-slate-600 font-semibold mb-1">Detalle del Cargo o Función Pública</label>
                          <input
                            type="text"
                            value={data.pepRelationDetail || ''}
                            onChange={(e) => handleFieldChange('pepRelationDetail', e.target.value.toUpperCase())}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                          />
                        </div>
                      )}
                    </div>

                    {/* LIENZO DE FIRMA DIGITAL DEL PROSPECTO */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">
                            Firma Digital del Prospecto
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            Proporciona el dispositivo al prospecto para plasmar su firma idéntica al INE.
                          </p>
                        </div>
                        {data.signedAt && (
                          <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            ✓ Firmado el {new Date(data.signedAt).toLocaleString('es-MX')}
                          </span>
                        )}
                      </div>

                      <SignaturePad
                        initialSignature={data.signatureDataUrl}
                        onSave={handleSaveSignature}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: INTEGRACIÓN DE EXPEDIENTE (25 DOCUMENTOS Y FOTOS - ANEXO 1) */}
              {activeTab === 'integracion' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-blue-900">
                        Matriz de Documentación y Fotografías (Anexo 1)
                      </h4>
                      <p className="text-[11px] text-blue-700">
                        25 documentos requeridos para validación comercial y sincronización con el Core LH.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.documents.map((d) => ({
                          ...d,
                          status: 'VALIDADO' as DocumentStatus,
                        }));
                        handleFieldChange('documents', updated);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-bold shadow-sm transition active:scale-95"
                    >
                      Marcar Todos como Validados (Simulación)
                    </button>
                  </div>

                  {/* Documents Grouped by Category */}
                  {(['EXPEDIENTE', 'VERIFICACION', 'CASA_TITULAR', 'NEGOCIO_TITULAR', 'SEGUNDA_PROPIEDAD'] as const).map(
                    (cat) => {
                      const categoryLabels: Record<string, string> = {
                        EXPEDIENTE: '📄 Documentos Legales del Titular & Aval',
                        VERIFICACION: '🔍 Verificaciones Comerciales',
                        CASA_TITULAR: '🏠 Fotografías Domicilio Titular (Fachadas e Interiores)',
                        NEGOCIO_TITULAR: '🏬 Fotografías Negocio Titular (Fachadas e Interiores)',
                        SEGUNDA_PROPIEDAD: '🏡 Fotografías Segunda Propiedad',
                      };

                      const catDocs = data.documents.filter((d) => d.category === cat);
                      if (catDocs.length === 0) return null;

                      return (
                        <div
                          key={cat}
                          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                        >
                          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                            <span>{categoryLabels[cat]}</span>
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              {catDocs.filter((d) => d.status === 'VALIDADO').length}/{catDocs.length} validados
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {catDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-blue-50/40 transition"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
                                      doc.type === 'PDF'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}
                                  >
                                    {doc.type}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800">
                                      {doc.documentName}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Clave Documental: <span className="font-mono text-slate-600">{doc.fieldKey}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Status badge */}
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      doc.status === 'VALIDADO'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                        : doc.status === 'CARGADO'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-300'
                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}
                                  >
                                    {doc.status}
                                  </span>

                                  {/* Actions */}
                                  {doc.status === 'PENDIENTE' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDocumentStatus(doc.id, 'CARGADO')}
                                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center gap-1 transition"
                                    >
                                      <Upload className="w-3 h-3" /> Subir
                                    </button>
                                  ) : doc.status === 'CARGADO' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDocumentStatus(doc.id, 'VALIDADO')}
                                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition"
                                    >
                                      <CheckCircle2 className="w-3 h-3" /> Validar
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDocumentStatus(doc.id, 'PENDIENTE')}
                                      className="px-2.5 py-1 rounded-lg hover:bg-rose-50 text-rose-600 text-[11px] font-semibold transition"
                                    >
                                      Quitar
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {/* TAB 6: MESA DE CRÉDITO & BURÓ */}
              {activeTab === 'mesa' && (
                <div className="space-y-5 text-xs">
                  {/* Buró Result & SMS */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" /> Dictamen de Buró de Crédito
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Resultado de la Consulta</label>
                        <select
                          value={data.bureauResult}
                          onChange={(e) => handleFieldChange('bureauResult', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-blue-600"
                        >
                          <option value="NO_CONSULTADO">Sin Consulta</option>
                          <option value="BUENO">BUENO (Aprobado)</option>
                          <option value="REGULAR">REGULAR (Aprobado con condiciones)</option>
                          <option value="MALO">MALO</option>
                          <option value="RECHAZO">RECHAZO (No continúa)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Perfil Asignado</label>
                        <select
                          value={data.assignedProfile}
                          onChange={(e) => handleFieldChange('assignedProfile', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-700 font-bold focus:outline-none focus:border-blue-600"
                        >
                          <option value="SIN_ASIGNAR">Sin Asignar</option>
                          <option value="D-AAA">D-AAA (Comisión: $750 Asesor / $500 Coord)</option>
                          <option value="D-AA">D-AA (Comisión: $500 Asesor / $500 Coord)</option>
                          <option value="D-A">D-A (Comisión: $500 Asesor / $250 Coord)</option>
                          <option value="E-AAA">E-AAA (Comisión: $500 Asesor / $500 Coord)</option>
                          <option value="E-AA">E-AA (Comisión: $500 Asesor / $250 Coord)</option>
                          <option value="E-A">E-A (Comisión: $300 Asesor / $200 Coord)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                          <input
                            type="checkbox"
                            id="smsAuth"
                            checked={data.smsAuthorized}
                            onChange={(e) => handleFieldChange('smsAuthorized', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="smsAuth" className="text-slate-700 font-medium">
                            Autorización SMS del Prospecto Recibida
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verificación de Referencias Telefónicas (LNH-OP-FOR-006) */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" /> Registro de Verificación Telefónica (LNH-OP-FOR-006)
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newRef: ReferenceCheck = {
                            id: `ref-${Date.now()}`,
                            fullName: 'NUEVA REFERENCIA',
                            phone: '',
                            relation: 'CONOCIDO / VECINO',
                            call1Status: 'PENDIENTE',
                            notes: '',
                            isApproved: false,
                          };
                          handleFieldChange('references', [...data.references, newRef]);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition"
                      >
                        + Agregar Referencia
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Norma LanAhora: Se realizarán hasta 3 llamadas por referencia. Tras 3 intentos fallidos se solicitará nueva referencia al asesor.
                    </p>

                    {data.references.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl bg-white">
                        Sin referencias registradas para llamada
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.references.map((ref, idx) => (
                          <div
                            key={ref.id}
                            className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 shadow-sm"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-slate-500 text-[10px] font-semibold">Nombre</label>
                                <input
                                  type="text"
                                  value={ref.fullName}
                                  onChange={(e) => {
                                    const updated = [...data.references];
                                    updated[idx].fullName = e.target.value.toUpperCase();
                                    handleFieldChange('references', updated);
                                  }}
                                  className="w-full px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-500 text-[10px] font-semibold">Teléfono</label>
                                <input
                                  type="tel"
                                  value={ref.phone}
                                  onChange={(e) => {
                                    const updated = [...data.references];
                                    updated[idx].phone = e.target.value;
                                    handleFieldChange('references', updated);
                                  }}
                                  className="w-full px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-500 text-[10px] font-semibold">Parentesco</label>
                                <input
                                  type="text"
                                  value={ref.relation}
                                  onChange={(e) => {
                                    const updated = [...data.references];
                                    updated[idx].relation = e.target.value;
                                    handleFieldChange('references', updated);
                                  }}
                                  className="w-full px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-semibold">Llamada 1:</span>
                                <select
                                  value={ref.call1Status}
                                  onChange={(e) => {
                                    const updated = [...data.references];
                                    updated[idx].call1Status = e.target.value as any;
                                    updated[idx].isApproved = e.target.value === 'EXITOSA';
                                    handleFieldChange('references', updated);
                                  }}
                                  className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                                >
                                  <option value="PENDIENTE">Pendiente</option>
                                  <option value="EXITOSA">Exitosa (Contestó)</option>
                                  <option value="NO_CONTESTO">No Contestó</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="text-[10px] text-slate-500 font-semibold">Dictamen:</label>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ref.isApproved
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                      : 'bg-rose-50 text-rose-700 border border-rose-300'
                                  }`}
                                >
                                  {ref.isApproved ? 'VALIDADA' : 'NO VALIDADA'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Asignación de Líneas de Crédito */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-sm text-blue-700">
                      Asignación de Líneas de Crédito
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Línea ValeLana ($ MXN)</label>
                        <input
                          type="number"
                          value={data.creditLines.valelana}
                          onChange={(e) =>
                            handleFieldChange('creditLines', {
                              ...data.creditLines,
                              valelana: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-sm font-bold text-blue-700 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Línea LanAtienda ($ MXN)</label>
                        <input
                          type="number"
                          value={data.creditLines.lanatienda}
                          onChange={(e) =>
                            handleFieldChange('creditLines', {
                              ...data.creditLines,
                              lanatienda: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-sm font-bold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Préstamo Personal ($ MXN)</label>
                        <input
                          type="number"
                          value={data.creditLines.personal}
                          onChange={(e) =>
                            handleFieldChange('creditLines', {
                              ...data.creditLines,
                              personal: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-sm font-bold focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
