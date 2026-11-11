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
  ShieldCheck,
  ChevronRight,
  LogOut,
  Phone,
  Bell,
} from 'lucide-react';
import { useCoreSync } from '@/context/CoreSyncContext';

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
  const { notifications, markNotificationRead } = useCoreSync();
  const [showAdvisorNotifs, setShowAdvisorNotifs] = useState(false);
  const advisorNotifs = notifications.filter(
    (n) => n.target === 'ASESORES_CAMPO' || n.target === 'TODOS'
  );
  const unreadAdvisorCount = advisorNotifs.filter((n) => !n.read).length;

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
          setGpsCoords({ lat: 25.4232, lng: -101.0053 });
        }
      );
    } else {
      setGpsCoords({ lat: 25.4232, lng: -101.0053 });
    }
  };

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
    <div className="min-h-screen bg-[#eff4fc] flex flex-col items-center justify-center p-0 sm:p-4 font-sans text-slate-800">
      {onSwitchToDesktop && (
        <div className="hidden sm:flex items-center justify-between w-full max-w-sm mb-3 text-xs text-blue-900 font-bold">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#2563eb]" />
            <span>App Móvil de Asesores LanAhora</span>
          </span>
          <button
            onClick={onSwitchToDesktop}
            className="text-[#2563eb] hover:underline flex items-center gap-1"
          >
            <span>Ir a Vista Desktop</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SMARTPHONE DEVICE CONTAINER (LanAhora Blue Theme) */}
      <div className="w-full sm:max-w-sm bg-white sm:border-4 sm:border-blue-900/40 sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[100dvh] sm:h-[780px] relative">
        {/* Top Header Bar in Royal Blue */}
        <div className="bg-[#1d4ed8] text-white px-5 py-2.5 flex items-center justify-between text-[11px] font-bold border-b border-blue-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#facc15] animate-pulse" />
            <span className="font-extrabold tracking-tight">LanAhora Móvil</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-[#facc15] text-slate-950 font-black">
              EN RUTA
            </span>
            <button
              onClick={() => setShowAdvisorNotifs(!showAdvisorNotifs)}
              className="relative p-1 text-white hover:text-yellow-300 transition"
              title="Notificaciones de Campo"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadAdvisorCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="text-white hover:text-yellow-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal / Drawer de Notificaciones para Asesores de Campo */}
        {showAdvisorNotifs && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex flex-col p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-4 flex-1 flex flex-col text-slate-800 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Avisos a Fuerza de Ventas
                  </span>
                </div>
                <button
                  onClick={() => setShowAdvisorNotifs(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                >
                  Cerrar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {advisorNotifs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <span className="text-3xl block">📋</span>
                    <p className="text-xs font-bold">Sin avisos pendientes</p>
                    <p className="text-[10px]">Las alertas operativas de mesa de crédito y ruta aparecerán aquí.</p>
                  </div>
                ) : (
                  advisorNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                        n.read
                          ? 'bg-slate-50 border-slate-200 opacity-80'
                          : 'bg-blue-50/60 border-blue-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-blue-700">
                          {n.category}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-900 leading-tight">
                        {n.title}
                      </h5>
                      <p className="text-[10px] text-slate-600 leading-snug">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Card Bar in Royal Blue with Yellow Accent */}
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#facc15] text-slate-950 font-black flex items-center justify-center text-xs shadow">
              {user.avatarInitials}
            </div>
            <div>
              <h2 className="text-xs font-bold leading-tight">{user.name}</h2>
              <p className="text-[10px] text-yellow-300 font-medium">{user.roleLabel} • {user.branch}</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleCaptureGps();
              setActiveTab('nuevo');
            }}
            className="px-3 py-1.5 bg-[#facc15] hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prospectar</span>
          </button>
        </div>

        {/* MAIN BODY AREA (SCROLLABLE, CLEAN LIGHT BLUE BACKGROUND) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8faff]">
          {/* TAB: LEADS / PROSPECTOS */}
          {activeTab === 'leads' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar prospecto o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-blue-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] shadow-xs"
                />
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">Prospectos en Ruta</span>
                  <span className="text-xl font-black text-[#2563eb]">{prospects.length}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">En Validación</span>
                  <span className="text-xl font-black text-[#16a34a]">
                    {prospects.filter((p) => p.stage === 'solicitud_credito' || p.stage === 'mesa_credito').length}
                  </span>
                </div>
              </div>

              {/* Leads List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Prospectos Registrados
                </h3>
                {filteredLeads.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProspect(p)}
                    className="p-3 bg-white hover:bg-blue-50/50 border border-blue-100 hover:border-blue-400 rounded-2xl transition cursor-pointer space-y-1 shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-blue-900 line-clamp-1">
                        {p.opportunityName}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 whitespace-nowrap">
                        {p.stage}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-blue-500" />
                        {p.phone || 'Sin teléfono'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
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
              <div className="flex items-center justify-between text-[11px] font-bold border-b border-blue-100 pb-2">
                <span className="text-[#2563eb]">Paso {step} de 4</span>
                <span className="text-slate-600">
                  {step === 1 && 'Datos de Contacto'}
                  {step === 2 && 'Validar CURP'}
                  {step === 3 && 'Fotos INE & Fachada'}
                  {step === 4 && 'Firma Digital Táctil'}
                </span>
              </div>

              {/* PASO 1 */}
              {step === 1 && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#2563eb]" />
                      <span className="text-[11px] font-bold text-blue-900">Ubicación GPS:</span>
                    </div>
                    <span className="font-mono text-[10px] text-blue-700 font-bold">
                      {gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : 'Obteniendo...'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nombre(s) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. MARIA ELENA"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Apellido Paterno *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. SANCHEZ"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Apellido Materno</label>
                      <input
                        type="text"
                        placeholder="Ej. LOPEZ"
                        value={secondLastName}
                        onChange={(e) => setSecondLastName(e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Teléfono Móvil *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10 dígitos"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Dirección / Colonia</label>
                    <input
                      type="text"
                      placeholder="Calle y colonia"
                      value={address}
                      onChange={(e) => setAddress(e.target.value.toUpperCase())}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!firstName || !lastName || !phone) {
                        alert('Ingresa nombre, apellido y teléfono.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full py-3 mt-2 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black shadow-md flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Siguiente: Validar CURP</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* PASO 2 */}
              {step === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-blue-200 shadow-xs space-y-2">
                    <label className="block text-slate-800 font-bold">
                      CURP Oficial del Prospecto (18 caracteres)
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
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono uppercase text-sm"
                    />

                    <button
                      type="button"
                      onClick={handleValidateCurp}
                      disabled={curpChecking || curp.length < 18}
                      className="w-full py-2.5 bg-[#2563eb] hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {curpChecking ? 'Validando en Cartera Core LH...' : 'Validar CURP en Línea'}
                    </button>
                  </div>

                  {curpResult === 'VALIDO' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-1">
                      <div className="font-black flex items-center gap-1.5 text-sm text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> CURP Válida y Aprobada
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Sin saldos activos ni antecedentes negativos. Habilitado para armar expediente y otorgar línea de crédito.
                      </p>
                    </div>
                  )}

                  {curpResult === 'NO_VALIDO' && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 space-y-1">
                      <div className="font-black flex items-center gap-1.5 text-sm text-rose-700">
                        <AlertCircle className="w-4 h-4" /> No Sujeto a Crédito
                      </div>
                      <p className="text-[11px] text-rose-800">
                        Presenta adeudos vigentes o antecedentes de quita en Cartera Core LH.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-2.5 bg-slate-200 rounded-xl text-slate-700 font-bold"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      disabled={!curpResult}
                      onClick={() => setStep(3)}
                      className="flex-1 py-2.5 bg-[#facc15] hover:bg-yellow-400 disabled:bg-slate-300 text-slate-950 font-black rounded-xl shadow"
                    >
                      Siguiente: Capturar Fotos
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3 */}
              {step === 3 && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 text-[11px]">
                    Captura las fotos directamente con la cámara del celular sin sombras ni reflejos:
                  </p>

                  <div className="p-3 bg-white rounded-2xl border border-blue-200 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">1. INE Anverso (Frente)</span>
                      <span className="text-[10px] text-slate-500">
                        {ineFrontCaptured ? '✓ Foto tomada' : 'Obligatorio'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIneFrontCaptured(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        ineFrontCaptured
                          ? 'bg-[#16a34a] text-white'
                          : 'bg-[#facc15] text-slate-950'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {ineFrontCaptured ? 'Tomada' : 'Tomar Foto'}
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-blue-200 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">2. INE Reverso (Atrás)</span>
                      <span className="text-[10px] text-slate-500">
                        {ineBackCaptured ? '✓ Foto tomada' : 'Obligatorio'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIneBackCaptured(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        ineBackCaptured
                          ? 'bg-[#16a34a] text-white'
                          : 'bg-[#facc15] text-slate-950'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {ineBackCaptured ? 'Tomada' : 'Tomar Foto'}
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-blue-200 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">3. Fachada del Domicilio</span>
                      <span className="text-[10px] text-slate-500">
                        {houseFacadeCaptured ? '✓ Foto tomada' : 'Fachada de casa'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHouseFacadeCaptured(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        houseFacadeCaptured
                          ? 'bg-[#16a34a] text-white'
                          : 'bg-[#facc15] text-slate-950'
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
                      className="w-1/3 py-2.5 bg-slate-200 rounded-xl text-slate-700 font-bold"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 py-2.5 bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black rounded-xl shadow"
                    >
                      Siguiente: Firma Digital
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4 */}
              {step === 4 && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900">
                    <p className="font-black text-xs">Proporciona el teléfono al prospecto:</p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      Firma con el dedo idéntica a la firma de su credencial de elector (INE).
                    </p>
                  </div>

                  <div className="bg-white p-2 rounded-2xl border border-blue-100 shadow-sm">
                    <SignaturePad onSave={(sig) => setSignatureData(sig)} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-1/3 py-2.5 bg-slate-200 rounded-xl text-slate-700 font-bold"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishLead}
                      className="flex-1 py-3 bg-[#16a34a] hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Enviar a Mesa de Crédito
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GPS RUTA */}
          {activeTab === 'gps' && (
            <div className="space-y-3 text-xs">
              <div className="p-5 bg-white rounded-2xl border border-blue-100 text-center space-y-2 shadow-xs">
                <Navigation className="w-10 h-10 text-[#2563eb] mx-auto animate-pulse" />
                <h4 className="font-black text-blue-900 text-sm">Monitoreo de Ruta de Prospección</h4>
                <p className="text-slate-500 text-[11px]">
                  Ubicación satelital activa para validar visitas de cambaceo en sector asignado.
                </p>
                <div className="p-2.5 bg-blue-50 rounded-xl font-mono text-blue-800 text-xs font-bold border border-blue-200">
                  Lat: {gpsCoords?.lat || '25.4232'} • Lng: {gpsCoords?.lng || '-101.0053'}
                </div>
                <button
                  onClick={handleCaptureGps}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Actualizar Coordenadas
                </button>
              </div>
            </div>
          )}

          {/* TAB: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-3 text-xs">
              <div className="p-5 bg-white rounded-2xl border border-blue-100 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#facc15] text-slate-950 font-black text-lg flex items-center justify-center shadow">
                    {user.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-blue-950">{user.name}</h4>
                    <p className="text-slate-500 text-[11px]">{user.email}</p>
                    <span className="text-[10px] text-blue-700 font-bold">
                      {user.roleLabel}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Sucursal:</span>
                    <span className="font-bold text-slate-900">{user.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versión:</span>
                    <span className="font-mono">v2.4.0 (PWA Móvil)</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-1.5 mt-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión Móvil
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="bg-white border-t border-blue-100 px-3 py-2 flex items-center justify-around text-[10px] font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex flex-col items-center gap-1 p-1 ${
              activeTab === 'leads' ? 'text-[#2563eb] font-black' : 'hover:text-blue-900'
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
            className="flex flex-col items-center gap-1 p-1 text-slate-950 font-black"
          >
            <div className="w-8 h-8 rounded-full bg-[#facc15] text-slate-950 flex items-center justify-center shadow-md -mt-4 border-2 border-white">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <span>Capturar</span>
          </button>

          <button
            onClick={() => setActiveTab('gps')}
            className={`flex flex-col items-center gap-1 p-1 ${
              activeTab === 'gps' ? 'text-[#2563eb] font-black' : 'hover:text-blue-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Ruta GPS</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center gap-1 p-1 ${
              activeTab === 'perfil' ? 'text-[#2563eb] font-black' : 'hover:text-blue-900'
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
