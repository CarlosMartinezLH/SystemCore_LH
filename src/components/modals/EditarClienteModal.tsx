'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Building,
  Phone,
  CreditCard,
  FileText,
  Shield,
  Save,
} from 'lucide-react';
import { PersonaCore } from '@/types/core';
import { useCoreSync } from '@/context/CoreSyncContext';

interface EditarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCore | null;
  onSuccess?: (updated: PersonaCore) => void;
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
  onSuccess,
}: EditarClienteModalProps) {
  const { updatePersona } = useCoreSync();

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Inicializar valores cuando se selecciona una persona
  useEffect(() => {
    if (persona) {
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
  }, [persona, isOpen]);

  if (!isOpen || !persona) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl xl:max-w-7xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
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
                  Editar Datos de Cliente
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ID #{persona.personaId}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Edición integral de padrón · Pagaré, Domicilio, Laboral y Buró
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: 3 Columnas Horizontales (Sin necesidad de Scroll Vertical) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs flex flex-col">
          {savedSuccess && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ ¡Datos del cliente actualizados exitosamente en el sistema!</span>
            </div>
          )}

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

          {/* Modal Footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
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
      </div>
    </div>
  );
}
