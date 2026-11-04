'use client';

import React, { useState } from 'react';
import { UserSession } from '@/types/auth';
import { Prospect, StageId, OriginType } from '@/types/crm';
import SignaturePad from './SignaturePad';
import {
  Smartphone,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
  Search,
  Navigation,
  ArrowLeft,
  Upload,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';

interface MobileAdvisorAppProps {
  user: UserSession;
  prospects: Prospect[];
  onAddNewProspect: (newLead: Prospect) => void;
  onLogout: () => void;
  onSwitchToDesktop?: () => void;
}

export default function MobileAdvisorApp({
  user,
  prospects,
  onAddNewProspect,
  onLogout,
  onSwitchToDesktop,
}: MobileAdvisorAppProps) {
  const [activeTab, setActiveTab] = useState<'leads' | 'nuevo' | 'gps' | 'perfil'>('leads');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Mobile New Prospect
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [curp, setCurp] = useState('');
  const [origin, setOrigin] = useState<OriginType>('CAMBACEO');
  const [address, setAddress] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Photos & Signature
  const [ineFrontCaptured, setIneFrontCaptured] = useState(false);
  const [ineBackCaptured, setIneBackCaptured] = useState(false);
  const [houseFacadeCaptured, setHouseFacadeCaptured] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');

  // Curp verification status
  const [curpChecking, setCurpChecking] = useState(false);
  const [curpResult, setCurpResult] = useState<'VALIDO' | 'NO_VALIDO' | null>(null);

  // Auto-capture GPS coordinates on start
  const handleCaptureGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
        },
        () => {
          setGpsCoords({ lat: 25.4232, lng: -101.0053 }); // Fallback Saltillo
        }
      );
    } else {
      setGpsCoords({ lat: 25.4232, lng: -101.0053 });
    }
  };

  // Verify CURP
  const handleValidateCurp = () => {
    if (curp.length < 18) {
      alert('Ingresa los 18 caracteres de la CURP');
      return;
    }
    setCurpChecking(true);
    setTimeout(() => {
      setCurpChecking(false);
      const isBlocked = curp.endsWith('99') || curp.endsWith('XX');
      setCurpResult(isBlocked ? 'NO_VALIDO' : 'VALIDO');
    }, 800);
  };

  // Save full prospect from mobile
  const handleFinishLead = () => {
    if (!firstName || !lastName || !phone) {
      alert('Completa los campos obligatorios.');
      return;
    }

    const newProspect: Prospect = {
      id: `lead-${Date.now()}`,
      opportunityName: `${firstName.toUpperCase()} ${lastName.toUpperCase()} / ${phone}`,
      stage: 'solicitud_credito',
      daysInStage: 0,
      priorityStars: 2,
      firstName: firstName.toUpperCase(),
      lastName: lastName.toUpperCase(),
      secondLastName: secondLastName.toUpperCase(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      phone,
      curp: curp.toUpperCase(),
      rfc: curp ? curp.slice(0, 10).toUpperCase() : '',
      advisorName: user.name,
      advisorEmail: user.email,
      salesTeam: 'Ventas Campo',
      company: 'Lanahora',
      distributorType: 'DV',
      experienceType: 'Prospectada en campo móvil',
      origin,
      financialCurpStatus: curpResult || 'VALIDO',
      financialCurpReason: curpResult === 'VALIDO' ? 'Aprobado sin saldos activos' : 'Revisión en sucursal',
      street: address || 'CALLE DE PROSPECCION',
      extNumber: '100',
      zipCode: '25000',
      neighborhood: 'CENTRO',
      municipality: 'SALTILLO',
      city: 'SALTILLO',
      state: 'Coahuila',
      ineNumber: 'IDMEX' + Math.floor(10000000 + Math.random() * 90000000),
      ineFrontUrl: ineFrontCaptured ? '/mock/ine-frente.jpg' : undefined,
      ineBackUrl: ineBackCaptured ? '/mock/ine-reverso.jpg' : undefined,
      bureauResult: 'BUENO',
      smsSent: true,
      smsAuthorized: true,
      assignedProfile: 'D-AAA',
      hasSpouse: false,
      hasGuarantor: false,
      hasAdditionalProperty: false,
      hasPepFamily: false,
      signatureDataUrl: signatureData,
      signedAt: signatureData ? new Date().toISOString() : undefined,
      references: [],
      creditLines: { valelana: 25000, lanatienda: 10000, personal: 0 },
      documents: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          author: user.name,
          authorEmail: user.email,
          type: 'sistema',
          content: `Prospecto registrado desde la App Móvil de Asesor en Campo (GPS: ${gpsCoords?.lat || '25.4232'}, ${gpsCoords?.lng || '-101.0053'}).`,
          createdAt: new Date().toLocaleTimeString('es-MX'),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddNewProspect(newProspect);
    alert('✓ ¡Expediente y Solicitud firmada enviada con éxito a Mesa de Crédito!');

    // Reset Form
    setStep(1);
    setFirstName('');
    setLastName('');
    setSecondLastName('');
    setPhone('');
    setCurp('');
    setSignatureData('');
    setIneFrontCaptured(false);
    setIneBackCaptured(false);
    setHouseFacadeCaptured(false);
    setCurpResult(null);
    setActiveTab('leads');
  };

  const filteredLeads = prospects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.opportunityName.toLowerCase().includes(q) || p.phone.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 font-sans text-slate-100">
      {/* Switcher back to desktop view for administrators */}
      {onSwitchToDesktop && (
        <div className="hidden sm:flex items-center justify-between w-full max-w-sm mb-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Vista Móvil de Asesores de Crédito</span>
          </span>
          <button
            onClick={onSwitchToDesktop}
            className="text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Cambiar a Vista Desktop Core</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SMARTPHONE DEVICE CONTAINER */}
      <div className="w-full sm:max-w-sm bg-[#0f1422] sm:border-4 sm:border-slate-800 sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col h-[100dvh] sm:h-[780px] relative">
        {/* Top Status Bar & Notch */}
        <div className="bg-[#141b2d] px-5 py-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-mono">LanAhora Móvil</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              EN RUTA
            </span>
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="text-slate-400 hover:text-rose-400"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Card Bar */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-950 text-amber-400 font-extrabold flex items-center justify-center text-xs shadow-inner">
              {user.avatarInitials}
            </div>
            <div>
              <h2 className="text-xs font-bold leading-tight">{user.name}</h2>
              <p className="text-[10px] font-medium opacity-90">{user.roleLabel} • {user.branch}</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleCaptureGps();
              setActiveTab('nuevo');
            }}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 shadow transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prospectar</span>
          </button>
        </div>

        {/* MAIN BODY AREA (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB: LEADS / PROSPECTOS */}
          {activeTab === 'leads' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-[#161d30] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Prospectos en Ruta</span>
                  <span className="text-lg font-extrabold text-amber-400">{prospects.length}</span>
                </div>
                <div className="bg-[#161d30] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">En Validación Mesa</span>
                  <span className="text-lg font-extrabold text-teal-400">
                    {prospects.filter((p) => p.stage === 'solicitud_credito' || p.stage === 'mesa_credito').length}
                  </span>
                </div>
              </div>

              {/* Leads List */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cartera de Prospectos Captados
                </h3>
                {filteredLeads.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProspect(p)}
                    className="p-3 bg-[#161d30] hover:bg-[#1c243c] border border-slate-800 hover:border-amber-500/50 rounded-xl transition cursor-pointer space-y-1.5 shadow-sm active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {p.opportunityName}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                        {p.stage}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {p.phone || 'Sin teléfono'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {p.origin}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NUEVO PROSPECTO EN CALLE (WIZARD 4 PASOS) */}
          {activeTab === 'nuevo' && (
            <div className="space-y-4">
              {/* Stepper Indicator */}
              <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-800 pb-2">
                <span className="text-amber-400">Paso {step} de 4</span>
                <span className="text-slate-400">
                  {step === 1 && 'Datos & Contacto'}
                  {step === 2 && 'Validación de CURP'}
                  {step === 3 && 'Fotos INE & Fachada'}
                  {step === 4 && 'Firma Digital Táctil'}
                </span>
              </div>

              {/* PASO 1: DATOS & CONTACTO */}
              {step === 1 && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] text-slate-300">Punto GPS de Captura:</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">
                      {gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : 'Obteniendo...'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nombre(s) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. MARIA ELENA"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Apellido Paterno *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. SANCHEZ"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Apellido Materno</label>
                      <input
                        type="text"
                        placeholder="Ej. LOPEZ"
                        value={secondLastName}
                        onChange={(e) => setSecondLastName(e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Teléfono Celular *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10 dígitos (ej. 8441234567)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Dirección / Colonia</label>
                    <input
                      type="text"
                      placeholder="Calle y colonia donde se contactó"
                      value={address}
                      onChange={(e) => setAddress(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Canal de Prospección</label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="CAMBACEO">Cambaceo Puerta por Puerta</option>
                      <option value="COMERCIOS">Sector Comercios (INEGI)</option>
                      <option value="PLANTON">Plantón en Punto Estratégico</option>
                      <option value="DISTRIBUIDOR">Referido de Distribuidora</option>
                      <option value="TELEMARKETING">Telemarketing</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!firstName || !lastName || !phone) {
                        alert('Por favor ingresa nombre, apellido y teléfono.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full py-2.5 mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow flex items-center justify-center gap-1.5"
                  >
                    <span>Siguiente: Validar CURP</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* PASO 2: VALIDACIÓN CURP EN RUTA */}
              {step === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-slate-300 font-bold">
                      CURP del Prospecto (18 caracteres)
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="Ingresa la CURP del INE..."
                      value={curp}
                      onChange={(e) => {
                        setCurp(e.target.value.toUpperCase());
                        setCurpResult(null);
                      }}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono uppercase text-sm"
                    />

                    <button
                      type="button"
                      onClick={handleValidateCurp}
                      disabled={curpChecking || curp.length < 18}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {curpChecking ? 'Consultando en Financialsoft...' : 'Validar CURP en Línea'}
                    </button>
                  </div>

                  {curpResult === 'VALIDO' && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-600/50 rounded-xl text-emerald-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> CURP Válida y Aprobada
                      </div>
                      <p className="text-[11px] text-emerald-300/90">
                        No presenta saldos activos ni reestructuras vigentes. Habilitado para armar expediente y solicitar crédito.
                      </p>
                    </div>
                  )}

                  {curpResult === 'NO_VALIDO' && (
                    <div className="p-3 bg-rose-950/40 border border-rose-600/50 rounded-xl text-rose-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-sm text-rose-400">
                        <AlertCircle className="w-4 h-4" /> Prospecto No Sujeto a Crédito
                      </div>
                      <p className="text-[11px] text-rose-300/90">
                        Presenta antecedentes en gestoría o saldo activo en Financialsoft. Se registrará como oportunidad perdida.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-2 bg-slate-800 rounded-lg text-slate-300 font-semibold"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      disabled={!curpResult}
                      onClick={() => setStep(3)}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold rounded-lg shadow"
                    >
                      Siguiente: Captura Fotos
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: FOTOS INE & FACHADA */}
              {step === 3 && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-400 text-[11px]">
                    Toma las fotos directamente con la cámara del celular sin sombras ni flash:
                  </p>

                  {/* INE Frente */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">1. INE Anverso (Frente)</span>
                      <span className="text-[10px] text-slate-400">
                        {ineFrontCaptured ? '✓ Foto capturada' : 'Obligatorio'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIneFrontCaptured(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        ineFrontCaptured
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {ineFrontCaptured ? 'Tomada' : 'Tomar Foto'}
                    </button>
                  </div>

                  {/* INE Reverso */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">2. INE Reverso (Atrás)</span>
                      <span className="text-[10px] text-slate-400">
                        {ineBackCaptured ? '✓ Foto capturada' : 'Obligatorio'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIneBackCaptured(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        ineBackCaptured
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {ineBackCaptured ? 'Tomada' : 'Tomar Foto'}
                    </button>
                  </div>

                  {/* Fachada Domicilio */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">3. Fachada del Domicilio</span>
                      <span className="text-[10px] text-slate-400">
                        {houseFacadeCaptured ? '✓ Foto capturada' : 'Fachada de casa / comercio'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHouseFacadeCaptured(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        houseFacadeCaptured
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {houseFacadeCaptured ? 'Tomada' : 'Tomar Foto'}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-2 bg-slate-800 rounded-lg text-slate-300 font-semibold"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow"
                    >
                      Siguiente: Firma Digital
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4: FIRMA DIGITAL TÁCTIL */}
              {step === 4 && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
                    <p className="font-bold">Proporciona el teléfono al prospecto:</p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      Debe firmar con su dedo idéntico a la firma de su credencial de elector (INE).
                    </p>
                  </div>

                  <div className="bg-white p-2 rounded-xl">
                    <SignaturePad onSave={(sig) => setSignatureData(sig)} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-1/3 py-2 bg-slate-800 rounded-lg text-slate-300 font-semibold"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishLead}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-extrabold rounded-lg shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Enviar a Mesa de Crédito
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GPS RUTA COMERCIAL */}
          {activeTab === 'gps' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#161d30] rounded-xl border border-slate-800 text-center space-y-2">
                <Navigation className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                <h4 className="font-bold text-white text-sm">Monitoreo de Ruta de Prospección</h4>
                <p className="text-slate-400 text-[11px]">
                  Tu ubicación satelital se encuentra activa para validar visitas de cambaceo en sector INEGI asignado.
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-emerald-400 text-xs">
                  Lat: {gpsCoords?.lat || '25.4232'} • Lng: {gpsCoords?.lng || '-101.0053'}
                </div>
                <button
                  onClick={handleCaptureGps}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Actualizar Coordenadas
                </button>
              </div>
            </div>
          )}

          {/* TAB: PERFIL DEL ASESOR */}
          {activeTab === 'perfil' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#161d30] rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center">
                    {user.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{user.name}</h4>
                    <p className="text-slate-400 text-[11px]">{user.email}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                      {user.roleLabel}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sucursal:</span>
                    <span className="font-semibold">{user.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Versión App:</span>
                    <span className="font-mono">v2.4.0 (PWA Móvil)</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg font-semibold flex items-center justify-center gap-1.5 mt-3"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión Móvil
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM MOBILE NAVIGATION BAR */}
        <div className="bg-[#121727] border-t border-slate-800 px-2 py-2 flex items-center justify-around text-[10px] font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex flex-col items-center gap-1 p-1 rounded-lg ${
              activeTab === 'leads' ? 'text-amber-400' : 'hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mis Leads</span>
          </button>

          <button
            onClick={() => {
              handleCaptureGps();
              setStep(1);
              setActiveTab('nuevo');
            }}
            className="flex flex-col items-center gap-1 p-1 text-emerald-400 font-extrabold"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg -mt-3 border-2 border-[#121727]">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>Capturar</span>
          </button>

          <button
            onClick={() => setActiveTab('gps')}
            className={`flex flex-col items-center gap-1 p-1 rounded-lg ${
              activeTab === 'gps' ? 'text-amber-400' : 'hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Ruta GPS</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center gap-1 p-1 rounded-lg ${
              activeTab === 'perfil' ? 'text-amber-400' : 'hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mi Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

