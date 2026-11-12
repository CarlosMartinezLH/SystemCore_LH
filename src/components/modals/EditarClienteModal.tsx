'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  CreditCard,
  FileText,
  Shield,
  Save,
  Barcode,
  FolderOpen,
  Printer,
  ShieldCheck,
  ArrowRightLeft,
  ChevronRight,
  Copy,
  Check,
  Clock,
  Send,
  ExternalLink,
  Pencil,
  UserCheck,
} from 'lucide-react';
import { PersonaCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';

interface EditarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCore | null;
  initialTab?: 'editar' | 'opciones' | 'expediente' | 'notas';
  onSuccess?: (updated: PersonaCore) => void;
  onLaunchCanje?: () => void;
  onLaunchBuro?: () => void;
  onLaunchBancarios?: () => void;
  onLaunchExpediente?: () => void;
  onLaunchPrestanombres?: () => void;
  onPromoteToDv?: (persona: PersonaCore) => void;
  notes?: { text: string; date: string }[];
  onAddNote?: (text: string) => void;
}

const ESTADOS_MEXICO = [
  'NO DEFINIDO',
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
  'Extranjero',
];

const OCUPACIONES = [
  'TRABAJADOR INDEPENDIENTE',
  'EMPLEADO',
  'COMERCIANTE',
  'AMA DE CASA',
  'PROFESIONISTA',
  'JUBILADO / PENSIONADO',
  'OTRO',
];

const ESTADOS_CIVILES = [
  'SOLTERO(A)',
  'CASADO(A)',
  'UNION LIBRE',
  'DIVORCIADO(A)',
  'VIUDO(A)',
];

export default function EditarClienteModal({
  isOpen,
  onClose,
  persona,
  initialTab = 'editar',
  onSuccess,
  onLaunchCanje,
  onLaunchBuro,
  onLaunchBancarios,
  onLaunchExpediente,
  onLaunchPrestanombres,
  onPromoteToDv,
  notes = [],
  onAddNote,
}: EditarClienteModalProps) {
  const { updatePersona } = useCoreSync();

  // Tab activo: 'editar' | 'opciones' | 'expediente' | 'notas'
  const [activeTab, setActiveTab] = useState<'editar' | 'opciones' | 'expediente' | 'notas'>(initialTab);

  // Estados del Formulario (los 40 campos del sistema anterior)
  // Col 1: Datos Personales e Identidad
  const [nombre, setNombre] = useState('');
  const [nombreAdicional, setNombreAdicional] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [curp, setCurp] = useState('');
  const [rfc, setRfc] = useState('');
  const [sexoId, setSexoId] = useState<'MASCULINO' | 'FEMENINO'>('MASCULINO');
  const [estadoCivilId, setEstadoCivilId] = useState('SOLTERO(A)');
  const [lugarNacimiento, setLugarNacimiento] = useState('');
  const [estadoNacimiento, setEstadoNacimiento] = useState('NO DEFINIDO');
  const [tipoIdentificacion, setTipoIdentificacion] = useState<'INE' | 'PASAPORTE' | 'CEDULA' | 'OTRA'>('INE');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');

  // Col 2: Domicilio y Contacto
  const [direccion, setDireccion] = useState('');
  const [numeroExterior, setNumeroExterior] = useState('');
  const [numeroInterior, setNumeroInterior] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [colonia, setColonia] = useState('');
  const [entreCalle1, setEntreCalle1] = useState('');
  const [entreCalle2, setEntreCalle2] = useState('');
  const [referenciasGeograficas, setReferenciasGeograficas] = useState('');
  const [telefonoMovil, setTelefonoMovil] = useState('');
  const [telefonoDomicilio, setTelefonoDomicilio] = useState('');
  const [telefonoTrabajo, setTelefonoTrabajo] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');

  // Col 3: Laboral, Pagaré, Buró y Referencias
  const [ocupacionId, setOcupacionId] = useState('TRABAJADOR INDEPENDIENTE');
  const [puesto, setPuesto] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [ingresosMensuales, setIngresosMensuales] = useState<number>(13000);
  const [otrosIngresos, setOtrosIngresos] = useState<number>(0);
  const [dependientesEconomicos, setDependientesEconomicos] = useState<number>(0);
  const [pagareEstatusId, setPagareEstatusId] = useState<'NO DEFINIDO' | 'FIRMADO EN BLANCO' | 'SIN PAGARE'>('NO DEFINIDO');
  const [pagareCantidad, setPagareCantidad] = useState<number>(0);
  const [buroInternoEstatus, setBuroInternoEstatus] = useState<'NORMAL' | 'NO SUJETO DE CREDITO' | 'BLOQUEADO'>('NORMAL');
  const [referenciaNombre01, setReferenciaNombre01] = useState('');
  const [referenciaTelefono01, setReferenciaTelefono01] = useState('');
  const [referenciaNombre02, setReferenciaNombre02] = useState('');
  const [referenciaTelefono02, setReferenciaTelefono02] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [firmaElectronicaAvanzada, setFirmaElectronicaAvanzada] = useState('');

  // Notas internas locales
  const [noteInput, setNoteInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Inicializar valores al seleccionar persona o abrir modal
  useEffect(() => {
    if (persona) {
      setActiveTab(initialTab || 'editar');
      setNombre(persona.nombre || '');
      setNombreAdicional(persona.nombreAdicional || '');
      setApellidoPaterno(persona.apellidoPaterno || '');
      setApellidoMaterno(persona.apellidoMaterno || '');
      setFechaNacimiento(persona.fechaNacimiento || '');
      setCurp(persona.curp || '');
      setRfc(persona.rfc || '');
      setSexoId(persona.sexoId || 'MASCULINO');
      setEstadoCivilId(persona.estadoCivilId || 'SOLTERO(A)');
      setLugarNacimiento(persona.lugarNacimiento || persona.localidadNacimiento || '');
      setEstadoNacimiento(persona.estadoNacimiento || 'NO DEFINIDO');
      setTipoIdentificacion((persona.tipoIdentificacion as any) || 'INE');
      setNumeroIdentificacion(persona.numeroIdentificacion || '1540144080805');

      setDireccion(persona.direccion || 'C AMABILIDAD 12036');
      setNumeroExterior(persona.numeroExterior || '0');
      setNumeroInterior(persona.numeroInterior || '0');
      setCodigoPostal(persona.codigoPostal || '22204');
      setColonia(persona.colonia || persona.localidad || '');
      setEntreCalle1(persona.entreCalle1 || '');
      setEntreCalle2(persona.entreCalle2 || '');
      setReferenciasGeograficas(persona.referenciasGeograficas || '');
      setTelefonoMovil(persona.telefonoMovil || persona.telefono || '(664) 767-7768');
      setTelefonoDomicilio(persona.telefonoDomicilio || '');
      setTelefonoTrabajo(persona.telefonoTrabajo || '');
      setCorreoElectronico(persona.email || '');

      setOcupacionId(persona.ocupacionId || 'TRABAJADOR INDEPENDIENTE');
      setPuesto(persona.puesto || '');
      setNombreEmpresa(persona.nombreEmpresa || '');
      setIngresosMensuales(persona.ingresosMensuales !== undefined ? persona.ingresosMensuales : 13000);
      setOtrosIngresos(persona.otrosIngresos !== undefined ? persona.otrosIngresos : 0);
      setDependientesEconomicos(persona.dependientesEconomicos !== undefined ? persona.dependientesEconomicos : 0);
      setPagareEstatusId(persona.pagareEstatusId || 'NO DEFINIDO');
      setPagareCantidad(persona.pagareCantidad || 0);
      setBuroInternoEstatus(persona.buroInternoEstatus || 'NORMAL');
      setReferenciaNombre01(persona.referenciaNombre01 || '');
      setReferenciaTelefono01(persona.referenciaTelefono01 || '');
      setReferenciaNombre02(persona.referenciaNombre02 || '');
      setReferenciaTelefono02(persona.referenciaTelefono02 || '');
      setObservaciones(persona.observaciones || '');
      setFirmaElectronicaAvanzada(persona.firmaElectronicaAvanzada || '');
      setSavedSuccess(false);
    }
  }, [persona, isOpen, initialTab]);

  if (!isOpen || !persona) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updated: PersonaCore = {
      ...persona,
      nombre: nombre.trim().toUpperCase(),
      nombreAdicional: nombreAdicional.trim().toUpperCase() || undefined,
      apellidoPaterno: apellidoPaterno.trim().toUpperCase(),
      apellidoMaterno: apellidoMaterno.trim().toUpperCase(),
      fechaNacimiento,
      curp: curp.trim().toUpperCase(),
      rfc: rfc.trim().toUpperCase(),
      sexoId,
      estadoCivilId,
      lugarNacimiento: lugarNacimiento.trim().toUpperCase(),
      localidadNacimiento: lugarNacimiento.trim().toUpperCase(),
      estadoNacimiento,
      tipoIdentificacion,
      numeroIdentificacion: numeroIdentificacion.trim(),

      direccion: direccion.trim().toUpperCase(),
      numeroExterior: numeroExterior.trim(),
      numeroInterior: numeroInterior.trim(),
      codigoPostal: codigoPostal.trim(),
      colonia: colonia.trim().toUpperCase(),
      localidad: colonia.trim().toUpperCase(),
      entreCalle1: entreCalle1.trim().toUpperCase(),
      entreCalle2: entreCalle2.trim().toUpperCase(),
      referenciasGeograficas: referenciasGeograficas.trim().toUpperCase(),
      telefono: telefonoMovil.trim(),
      telefonoMovil: telefonoMovil.trim(),
      telefonoDomicilio: telefonoDomicilio.trim(),
      telefonoTrabajo: telefonoTrabajo.trim(),
      email: correoElectronico.trim().toLowerCase(),

      ocupacionId,
      puesto: puesto.trim().toUpperCase(),
      nombreEmpresa: nombreEmpresa.trim().toUpperCase(),
      ingresosMensuales: Number(ingresosMensuales) || 0,
      otrosIngresos: Number(otrosIngresos) || 0,
      dependientesEconomicos: Number(dependientesEconomicos) || 0,
      pagareEstatusId,
      pagareCantidad: Number(pagareCantidad) || 0,
      buroInternoEstatus,
      referenciaNombre01: referenciaNombre01.trim().toUpperCase(),
      referenciaTelefono01: referenciaTelefono01.trim(),
      referenciaNombre02: referenciaNombre02.trim().toUpperCase(),
      referenciaTelefono02: referenciaTelefono02.trim(),
      observaciones: observaciones.trim().toUpperCase(),
      firmaElectronicaAvanzada: firmaElectronicaAvanzada.trim(),
    };

    updatePersona(updated);
    setSavedSuccess(true);
    setIsSubmitting(false);

    if (onSuccess) {
      onSuccess(updated);
    }

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleCreateNote = () => {
    if (!noteInput.trim()) return;
    if (onAddNote) {
      onAddNote(noteInput.trim());
    }
    setNoteInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl xl:max-w-7xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        {/* Modal Header: Logo + Identity + Segmented Tabs */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/lanahora-logo-transparent.png"
              alt="LanAhora"
              className="h-7 w-auto object-contain"
            />
            <div className="h-5 w-px bg-slate-300" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                  Gestión de Cliente
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ID #{persona.personaId}
                </span>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  {persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Edición integral de padrón · Pagaré, Domicilio, Laboral y Buró
              </p>
            </div>
          </div>

          {/* Segmented Tabs Switcher */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-300/60 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('editar')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'editar'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar Datos (40 campos)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('opciones')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'opciones'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Opciones & Operación</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('expediente')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'expediente'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Expediente</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notas')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'notas'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Notas ({notes.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Según la pestaña activa */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs">
          {savedSuccess && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ ¡Datos del cliente actualizados exitosamente en el sistema!</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 1: EDITAR DATOS (LOS 40 CAMPOS EN 3 COLUMNAS)      */}
          {/* ========================================================= */}
          {activeTab === 'editar' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* COLUMNA 1: DATOS PERSONALES E IDENTIDAD */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="border-b border-slate-200/80 pb-1 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                      1. Identidad y Demográficos
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">13 campos</span>
                  </div>

                  {/* Nombre y Nombre Adicional */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre:</label>
                      <input
                        type="text"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre Adicional:</label>
                      <input
                        type="text"
                        value={nombreAdicional}
                        onChange={(e) => setNombreAdicional(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Apellido Paterno y Materno */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Apellido Paterno:</label>
                      <input
                        type="text"
                        required
                        value={apellidoPaterno}
                        onChange={(e) => setApellidoPaterno(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Apellido Materno:</label>
                      <input
                        type="text"
                        value={apellidoMaterno}
                        onChange={(e) => setApellidoMaterno(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Fecha Nacimiento y Sexo */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Fecha Nacimiento:</label>
                      <input
                        type="text"
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        placeholder="DD/MM/AAAA"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-semibold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Sexo ID:</label>
                      <select
                        value={sexoId}
                        onChange={(e) => setSexoId(e.target.value as any)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      >
                        <option value="MASCULINO">MASCULINO</option>
                        <option value="FEMENINO">FEMENINO</option>
                      </select>
                    </div>
                  </div>

                  {/* CURP y RFC */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">CURP:</label>
                      <input
                        type="text"
                        maxLength={18}
                        required
                        value={curp}
                        onChange={(e) => setCurp(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">RFC:</label>
                      <input
                        type="text"
                        maxLength={13}
                        value={rfc}
                        onChange={(e) => setRfc(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Estado Civil y Lugar de Nacimiento */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Estado Civil ID:</label>
                      <select
                        value={estadoCivilId}
                        onChange={(e) => setEstadoCivilId(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      >
                        {ESTADOS_CIVILES.map((ec) => (
                          <option key={ec} value={ec}>{ec}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Lugar Nacimiento:</label>
                      <input
                        type="text"
                        value={lugarNacimiento}
                        onChange={(e) => setLugarNacimiento(e.target.value.toUpperCase())}
                        placeholder="Localidad / Municipio"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Estado de Nacimiento */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Estado Nacimiento:*</label>
                    <select
                      value={estadoNacimiento}
                      onChange={(e) => setEstadoNacimiento(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      {ESTADOS_MEXICO.map((est) => (
                        <option key={est} value={est}>{est}</option>
                      ))}
                    </select>
                  </div>

                  {/* Identificación Tipo y Número */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Identificacion Tipo Id:</label>
                      <select
                        value={tipoIdentificacion}
                        onChange={(e) => setTipoIdentificacion(e.target.value as any)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      >
                        <option value="INE">CREDENCIAL PARA VOTAR (INE)</option>
                        <option value="PASAPORTE">PASAPORTE</option>
                        <option value="CEDULA">CEDULA PROFESIONAL</option>
                        <option value="OTRA">CARTILLA / OTRA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Identificacion Numero:</label>
                      <input
                        type="text"
                        value={numeroIdentificacion}
                        onChange={(e) => setNumeroIdentificacion(e.target.value)}
                        placeholder="1540144080805"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMNA 2: DOMICILIO Y CONTACTO */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="border-b border-slate-200/80 pb-1 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                      2. Domicilio y Contacto
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">12 campos</span>
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Direccion:</label>
                    <input
                      type="text"
                      required
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value.toUpperCase())}
                      placeholder="Calle y nombre de vialidad"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  {/* Número Exterior, Número Interior y Código Postal */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Numero Exterior:</label>
                      <input
                        type="text"
                        value={numeroExterior}
                        onChange={(e) => setNumeroExterior(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-semibold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Numero Interior:</label>
                      <input
                        type="text"
                        value={numeroInterior}
                        onChange={(e) => setNumeroInterior(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-semibold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Codigo Postal:</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value)}
                        placeholder="22204"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Colonia */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Colonia:</label>
                    <input
                      type="text"
                      value={colonia}
                      onChange={(e) => setColonia(e.target.value.toUpperCase())}
                      placeholder="Colonia o Fraccionamiento"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  {/* entre Calle 1 y entre Calle 2 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">entre Calle1:</label>
                      <input
                        type="text"
                        value={entreCalle1}
                        onChange={(e) => setEntreCalle1(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">entre Calle2:</label>
                      <input
                        type="text"
                        value={entreCalle2}
                        onChange={(e) => setEntreCalle2(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Referencias Geográficas */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Referencias Geograficas:</label>
                    <input
                      type="text"
                      value={referenciasGeograficas}
                      onChange={(e) => setReferenciasGeograficas(e.target.value.toUpperCase())}
                      placeholder="Frente a tienda, portón blanco..."
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  {/* Teléfonos: Móvil, Domicilio, Trabajo */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Telefono Movil:</label>
                      <input
                        type="text"
                        value={telefonoMovil}
                        onChange={(e) => setTelefonoMovil(e.target.value)}
                        placeholder="(664) 767-7768"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Telefono Domicilio:</label>
                      <input
                        type="text"
                        value={telefonoDomicilio}
                        onChange={(e) => setTelefonoDomicilio(e.target.value)}
                        placeholder="(__) __-__"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Telefono Trabajo:</label>
                      <input
                        type="text"
                        value={telefonoTrabajo}
                        onChange={(e) => setTelefonoTrabajo(e.target.value)}
                        placeholder="(__) __-__"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Correo Electronico:</label>
                      <input
                        type="email"
                        value={correoElectronico}
                        onChange={(e) => setCorreoElectronico(e.target.value)}
                        placeholder="cliente@ejemplo.com"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMNA 3: LABORAL, PAGARÉ, BURÓ Y REFERENCIAS */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="border-b border-slate-200/80 pb-1 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Laboral, Pagaré y Referencias
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">15 campos</span>
                  </div>

                  {/* Ocupación y Puesto */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Ocupacion ID:</label>
                      <select
                        value={ocupacionId}
                        onChange={(e) => setOcupacionId(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      >
                        {OCUPACIONES.map((oc) => (
                          <option key={oc} value={oc}>{oc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Puesto:</label>
                      <input
                        type="text"
                        value={puesto}
                        onChange={(e) => setPuesto(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Nombre Empresa e Ingresos Mensuales */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre Empresa:</label>
                      <input
                        type="text"
                        value={nombreEmpresa}
                        onChange={(e) => setNombreEmpresa(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Ingresos Mensuales:</label>
                      <input
                        type="number"
                        value={ingresosMensuales}
                        onChange={(e) => setIngresosMensuales(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Otros Ingresos y Dependientes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">OtrosIngresos (valeras):</label>
                      <input
                        type="number"
                        value={otrosIngresos}
                        onChange={(e) => setOtrosIngresos(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Dependientes Economicos:</label>
                      <input
                        type="number"
                        value={dependientesEconomicos}
                        onChange={(e) => setDependientesEconomicos(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Pagaré Estatus y Pagaré Cantidad */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">pagare Estatus Id:</label>
                      <select
                        value={pagareEstatusId}
                        onChange={(e) => setPagareEstatusId(e.target.value as any)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      >
                        <option value="NO DEFINIDO">NO DEFINIDO</option>
                        <option value="FIRMADO EN BLANCO">FIRMADO EN BLANCO</option>
                        <option value="SIN PAGARE">SIN PAGARE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">pagare Cantidad:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pagareCantidad}
                        onChange={(e) => setPagareCantidad(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Buró Interno Estatus ID */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Buro Interno Estatus ID:</label>
                    <select
                      value={buroInternoEstatus}
                      onChange={(e) => setBuroInternoEstatus(e.target.value as any)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="NO SUJETO DE CREDITO">NO SUJETO DE CREDITO</option>
                      <option value="BLOQUEADO">BLOQUEADO</option>
                    </select>
                  </div>

                  {/* Referencias: 01 y 02 */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Referencia Nombre01:</label>
                      <input
                        type="text"
                        value={referenciaNombre01}
                        onChange={(e) => setReferenciaNombre01(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Referencia Telefono01:</label>
                      <input
                        type="text"
                        value={referenciaTelefono01}
                        onChange={(e) => setReferenciaTelefono01(e.target.value)}
                        placeholder="(__) __-__"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Referencia Nombre02:</label>
                      <input
                        type="text"
                        value={referenciaNombre02}
                        onChange={(e) => setReferenciaNombre02(e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Referencia Telefono02:</label>
                      <input
                        type="text"
                        value={referenciaTelefono02}
                        onChange={(e) => setReferenciaTelefono02(e.target.value)}
                        placeholder="(__) __-__"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Observaciones y Firma Electrónica Avanzada */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Observaciones:</label>
                      <input
                        type="text"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value.toUpperCase())}
                        placeholder="Notas internas..."
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">firma Electronica Avanzada:</label>
                      <input
                        type="text"
                        value={firmaElectronicaAvanzada}
                        onChange={(e) => setFirmaElectronicaAvanzada(e.target.value)}
                        placeholder="Cadena / Hash FIEL"
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones del Formulario */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
                <span className="text-[11px] text-slate-400 font-medium">
                  Core LanAhora · Actualización sincrónica de datos del cliente
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition active:scale-95"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Guardando...' : 'Actualizar'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 2: OPCIONES Y GESTIÓN OPERATIVA                   */}
          {/* ========================================================= */}
          {activeTab === 'opciones' && (
            <div className="space-y-4">
              {/* Primary Action Button: Canjear Vale */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Barcode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-blue-950">
                      Canjear Vale a este Cliente
                    </h4>
                    <p className="text-xs text-blue-700 font-medium">
                      Validación biométrica instantánea, cálculo de comisiones y dispersión SPEI / STP
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onLaunchCanje) onLaunchCanje();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <Barcode className="w-4 h-4" />
                  <span>Iniciar Canje de Vale</span>
                </button>
              </div>

              {/* Quick Action Cards Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Módulos de Gestión de Cartera
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Solicitar Buró */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onLaunchBuro) onLaunchBuro();
                    }}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group active:scale-98"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <ShieldCheck className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition" />
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          persona.scoreBuro
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {persona.scoreBuro ? `${persona.scoreBuro} pts` : 'API en línea'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Solicitar Buró</p>
                      <p className="text-[10px] text-slate-500">Consulta de Score FICO</p>
                    </div>
                  </button>

                  {/* Expediente Digital */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('expediente')}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group active:scale-98"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <FolderOpen className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition" />
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Digital
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Expediente Digital</p>
                      <p className="text-[10px] text-slate-500">INE, Domicilio y KYC</p>
                    </div>
                  </button>

                  {/* Datos Bancarios */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onLaunchBancarios) onLaunchBancarios();
                    }}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group active:scale-98"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <CreditCard className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition" />
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                        STP SPEI
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Datos Bancarios</p>
                      <p className="text-[10px] text-slate-500">CLABE y Tarjetas de débito</p>
                    </div>
                  </button>

                  {/* Carta Prestanombres */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onLaunchPrestanombres) onLaunchPrestanombres();
                    }}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group active:scale-98"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <Printer className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition" />
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        CNBV
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Carta Prestanombres</p>
                      <p className="text-[10px] text-slate-500">Declaratoria regulatoria</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Asignar como Distribuidora */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">
                      {persona.isDistribuidor
                        ? `Distribuidora Activa (DV #${persona.distribuidorId || 1025})`
                        : 'Promover a Distribuidora Oficial (DV)'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {persona.isDistribuidor
                        ? 'Cuenta con línea de crédito de colocación habilitada'
                        : 'Asigna cupo de crédito para expedir y colocar valeras'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onPromoteToDv) onPromoteToDv(persona);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95 ${
                    persona.isDistribuidor
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {persona.isDistribuidor ? 'Ver Estatus DV' : 'Promover a DV'}
                </button>
              </div>

              {/* Ficha Resumen */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Ficha Resumen del Cliente
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURP:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                      <span>{persona.curp}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(persona.curp, 'curp')}
                        className="p-0.5 text-slate-400 hover:text-slate-700"
                      >
                        {copiedKey === 'curp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RFC:</span>
                    <span className="font-mono font-bold text-slate-900">{persona.rfc || 'S/D'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Teléfono:</span>
                    <span className="font-mono font-bold text-slate-900">{persona.telefono || '(844) 120-3344'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Saldo Actual:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ${(persona.saldoActual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 3: EXPEDIENTE DIGITAL                             */}
          {/* ========================================================= */}
          {activeTab === 'expediente' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Expediente Digital Cotejado
                  </h4>
                  <p className="text-xs text-slate-500">
                    Documentación oficial requerida por normativa bancaria y PLD
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onLaunchExpediente) onLaunchExpediente();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Visor Completo de Documentos</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* INE */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs">
                      INE
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Vigente
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">Identificación Oficial (INE/IFE)</p>
                  <p className="text-[10px] text-slate-500">Frente y Reverso cotejados digitalmente</p>
                </div>

                {/* Comprobante Domicilio */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs">
                      CFE
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Validado
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">Comprobante de Domicilio</p>
                  <p className="text-[10px] text-slate-500">Recibo de CFE emitido hace menos de 90 días</p>
                </div>

                {/* Pagaré */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xs">
                      DOC
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        persona.pagareEstatusId === 'FIRMADO EN BLANCO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {persona.pagareEstatusId}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">Pagaré Legal Amparado</p>
                  <p className="text-[10px] text-slate-500">Monto: ${(persona.pagareCantidad || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 4: NOTAS INTERNAS / BITÁCORA                      */}
          {/* ========================================================= */}
          {activeTab === 'notas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Bitácora y Notas Internas
                  </h4>
                  <p className="text-xs text-slate-500">
                    Historial de observaciones registradas por coordinadores y analistas de crédito
                  </p>
                </div>
              </div>

              {/* Agregar nota */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Escribe una nueva nota u observación sobre este cliente..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNote();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleCreateNote}
                  disabled={!noteInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Agregar Nota</span>
                </button>
              </div>

              {/* Listado de notas */}
              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs">
                    No hay notas internas registradas para este cliente todavía.
                  </p>
                ) : (
                  notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <p className="text-slate-800 font-medium leading-relaxed">{note.text}</p>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{note.date}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
