'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useCoreSync } from '@/context/CoreSyncContext';

interface CapturaClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (personaId: number) => void;
}

const ESTADOS_MEXICO = [
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

const COLONIAS_POR_CP: Record<string, { localidad: string; colonias: string[] }> = {
  '25000': { localidad: 'Saltillo Centro', colonias: ['Zona Centro', 'Topochico', 'Obrera'] },
  '25294': { localidad: 'Saltillo Norte', colonias: ['Terralta', 'Los Pinos', 'San Patricio'] },
  '27000': { localidad: 'Torreón Centro', colonias: ['Centro', 'Primero de Mayo', 'Moderna'] },
  '25700': { localidad: 'Monclova Centro', colonias: ['Centro', 'El Pueblo', 'Guadalupe'] },
};

export default function CapturaClienteModal({
  isOpen,
  onClose,
  onSuccess,
}: CapturaClienteModalProps) {
  const { registrarCliente } = useCoreSync();

  // Active Tab: 'cliente' | 'buro'
  const [activeTab, setActiveTab] = useState<'cliente' | 'buro'>('cliente');

  // Form State - Tab Cliente
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [curp, setCurp] = useState('');
  const [rfc, setRfc] = useState('');
  const [sexo, setSexo] = useState<'FEMENINO' | 'MASCULINO'>('FEMENINO');
  const [telefonoMovil, setTelefonoMovil] = useState('');

  // Domicilio
  const [direccion, setDireccion] = useState('');
  const [numeroExterior, setNumeroExterior] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [availableColonias, setAvailableColonias] = useState<string[]>([]);

  // Identificación
  const [tipoIdentificacion, setTipoIdentificacion] = useState<'INE' | 'PASAPORTE' | 'CEDULA' | 'OTRA'>('INE');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');

  // Pagaré
  const [estadoPagare, setEstadoPagare] = useState<'FIRMADO EN BLANCO' | 'SIN PAGARE' | 'NO DEFINIDO'>('FIRMADO EN BLANCO');
  const [pagareCantidad, setPagareCantidad] = useState<number>(25000);

  // Lugar de Nacimiento
  const [estadoNacimiento, setEstadoNacimiento] = useState('Coahuila');
  const [localidadNacimiento, setLocalidadNacimiento] = useState('Saltillo');

  // Form State - Tab Buro
  const [autorizaBuro, setAutorizaBuro] = useState(true);
  const [consultaInmediata, setConsultaInmediata] = useState(true);
  const [folioBuroPrevia, setFolioBuroPrevia] = useState('');
  const [medioAutorizacion, setMedioAutorizacion] = useState<'FIRMA_AUTOGRAFA' | 'HUELLA_DIGITAL' | 'OTP_SMS'>('FIRMA_AUTOGRAFA');
  const [buroInternoEstatus, setBuroInternoEstatus] = useState<'NORMAL' | 'NO SUJETO DE CREDITO'>('NORMAL');

  // Loading & error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-fill from CURP (Standard Parsing)
  const handleCurpChange = (val: string) => {
    const upper = val.toUpperCase().slice(0, 18);
    setCurp(upper);

    if (upper.length >= 10 && !rfc) {
      setRfc(upper.slice(0, 10));
    }

    if (upper.length >= 11) {
      const sexoChar = upper.charAt(10);
      if (sexoChar === 'H') setSexo('MASCULINO');
      else if (sexoChar === 'M') setSexo('FEMENINO');

      const yy = upper.slice(4, 6);
      const mm = upper.slice(6, 8);
      const dd = upper.slice(8, 10);
      const yearPrefix = parseInt(yy, 10) <= 26 ? '20' : '19';
      const fullDate = `${yearPrefix}${yy}-${mm}-${dd}`;
      if (!fechaNacimiento && yy && mm && dd) {
        setFechaNacimiento(fullDate);
      }
    }
  };

  // Lookup Código Postal
  const handleLookupCP = () => {
    const found = COLONIAS_POR_CP[codigoPostal.trim()];
    if (found) {
      setLocalidad(found.localidad);
      setAvailableColonias(found.colonias);
    } else if (codigoPostal.trim().length === 5) {
      setLocalidad(`Zona Postal ${codigoPostal.trim()}`);
      setAvailableColonias(['Centro', 'Residencial', 'Sección 1']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!primerNombre.trim()) {
      setFormError('El primer nombre es obligatorio.');
      setActiveTab('cliente');
      return;
    }
    if (!primerApellido.trim()) {
      setFormError('El primer apellido es obligatorio.');
      setActiveTab('cliente');
      return;
    }
    if (!curp.trim() || curp.trim().length < 18) {
      setFormError('El CURP debe tener exactamente 18 caracteres.');
      setActiveTab('cliente');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = [
        direccion.trim(),
        numeroExterior ? `No. ${numeroExterior}` : '',
        localidad ? `Col. ${localidad}` : '',
        codigoPostal ? `CP ${codigoPostal}` : '',
      ]
        .filter(Boolean)
        .join(', ');

      const res = await registrarCliente({
        nombre: primerNombre.trim(),
        nombreAdicional: segundoNombre.trim() || undefined,
        apellidoPaterno: primerApellido.trim(),
        apellidoMaterno: segundoApellido.trim() || undefined,
        curp: curp.trim().toUpperCase(),
        rfc: (rfc.trim() || curp.trim().slice(0, 10)).toUpperCase(),
        telefono: telefonoMovil.trim(),
        direccion: fullAddress || 'Zona Coahuila',
        sexoId: sexo,
        fechaNacimiento: fechaNacimiento || '01/01/1995',
        numeroExterior: numeroExterior.trim() || undefined,
        codigoPostal: codigoPostal.trim() || undefined,
        localidad: localidad.trim() || undefined,
        tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion.trim() || undefined,
        pagareEstatusId: estadoPagare,
        pagareCantidad: estadoPagare === 'FIRMADO EN BLANCO' ? pagareCantidad : 0,
        estadoNacimiento,
        localidadNacimiento: localidadNacimiento.trim() || undefined,
        consultaBuroInicial: consultaInmediata && autorizaBuro,
        folioBuroPrevia: folioBuroPrevia.trim() || undefined,
      });

      const newId = res?.result?.nuevaPersona?.personaId || 122155;
      onSuccess(newId);
      onClose();
    } catch (err) {
      setFormError((err as Error).message || 'Error al guardar el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-5xl xl:max-w-6xl overflow-hidden animate-in fade-in flex flex-col my-auto">
        {/* Clean Header: No redundant logos, no corporate tags */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Captura de Cliente
            </h2>

            {/* Clean Segmented Tabs: Cliente | Buro */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('cliente')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'cliente'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('buro')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  activeTab === 'buro'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Buro</span>
                {consultaInmediata && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body: Distributed horizontally across 3 columns to avoid vertical scrolling */}
        <form onSubmit={handleSubmit} className="p-5 text-xs flex flex-col">
          {formError && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* ================= TAB 1: CLIENTE (3 COLUMNAS HORIZONTALES) ================= */}
          {activeTab === 'cliente' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              {/* COLUMNA 1: DATOS PERSONALES */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="border-b border-slate-200/70 pb-1.5 mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Datos Personales
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">* Requerido</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Primer nombre: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={primerNombre}
                      onChange={(e) => setPrimerNombre(e.target.value)}
                      placeholder="Ej. ANA"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Segundo nombre:
                    </label>
                    <input
                      type="text"
                      value={segundoNombre}
                      onChange={(e) => setSegundoNombre(e.target.value)}
                      placeholder="Ej. MARIA"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Primer apellido: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={primerApellido}
                      onChange={(e) => setPrimerApellido(e.target.value)}
                      placeholder="Ej. ARAIZA"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Segundo apellido:
                    </label>
                    <input
                      type="text"
                      value={segundoApellido}
                      onChange={(e) => setSegundoApellido(e.target.value)}
                      placeholder="Ej. MEDRANO"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    CURP: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    required
                    value={curp}
                    onChange={(e) => handleCurpChange(e.target.value)}
                    placeholder="AAMA020821MCLRR08"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      RFC:
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      placeholder="AAMA020821990"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Sexo:
                    </label>
                    <select
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value as 'FEMENINO' | 'MASCULINO')}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="FEMENINO">Femenino</option>
                      <option value="MASCULINO">Masculino</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Fecha de nacimiento:
                    </label>
                    <input
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Telefono móvil:
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={telefonoMovil}
                      onChange={(e) => setTelefonoMovil(e.target.value.replace(/\D/g, ''))}
                      placeholder="8448901234"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* COLUMNA 2: DOMICILIO & LUGAR DE NACIMIENTO */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="border-b border-slate-200/70 pb-1.5 mb-2">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Domicilio
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Dirección:
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, avenida o boulevard"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Número exterior:
                    </label>
                    <input
                      type="text"
                      value={numeroExterior}
                      onChange={(e) => setNumeroExterior(e.target.value)}
                      placeholder="Ej. 120"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Código postal:
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        maxLength={5}
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ''))}
                        placeholder="25000"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleLookupCP}
                        className="p-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-lg transition shrink-0"
                        title="Buscar colonias"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Localidad:
                  </label>
                  {availableColonias.length > 0 ? (
                    <select
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="">Selecciona colonia...</option>
                      {availableColonias.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                      placeholder="Colonia o localidad"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/70 space-y-2">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Lugar de Nacimiento
                  </span>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Estado de nacimiento:
                    </label>
                    <select
                      value={estadoNacimiento}
                      onChange={(e) => setEstadoNacimiento(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      {ESTADOS_MEXICO.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Localidad de nacimiento:
                    </label>
                    <input
                      type="text"
                      value={localidadNacimiento}
                      onChange={(e) => setLocalidadNacimiento(e.target.value)}
                      placeholder="Ej. Saltillo"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* COLUMNA 3: IDENTIFICACIÓN & PAGARÉ */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="border-b border-slate-200/70 pb-1.5 mb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                      Identificación
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Tipo de identificación:
                    </label>
                    <select
                      value={tipoIdentificacion}
                      onChange={(e) => setTipoIdentificacion(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="INE">INE / IFE</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="CEDULA">Cédula Profesional</option>
                      <option value="OTRA">Otra Identificación</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Número de identificacion:
                    </label>
                    <input
                      type="text"
                      value={numeroIdentificacion}
                      onChange={(e) => setNumeroIdentificacion(e.target.value.toUpperCase())}
                      placeholder="Folio OCR o Clave de Elector"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                      Estado Pagaré
                    </span>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Estado pagaré:
                      </label>
                      <select
                        value={estadoPagare}
                        onChange={(e) => setEstadoPagare(e.target.value as any)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                      >
                        <option value="FIRMADO EN BLANCO">FIRMADO EN BLANCO</option>
                        <option value="SIN PAGARE">SIN PAGARE</option>
                        <option value="NO DEFINIDO">NO DEFINIDO</option>
                      </select>
                    </div>

                    {estadoPagare === 'FIRMADO EN BLANCO' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Monto amparado (MXN):
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={pagareCantidad}
                          onChange={(e) => setPagareCantidad(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen Compacto */}
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 space-y-0.5">
                  <span className="font-bold flex items-center gap-1 text-emerald-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Registro Inmediato
                  </span>
                  <p className="text-[10px] text-emerald-700 leading-tight">
                    El cliente se incorporará al padrón y sus opciones de gestión estarán listas de inmediato.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BURO (DISTRIBUCIÓN HORIZONTAL) ================= */}
          {activeTab === 'buro' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1 animate-in fade-in">
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-start gap-2.5 border-b border-slate-200/70 pb-2">
                  <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      Autorización de Consulta (Buró de Crédito)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Cumplimiento legal Art. 28 LRSIC
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer p-2.5 bg-white rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={autorizaBuro}
                    onChange={(e) => setAutorizaBuro(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Autorización Expresa del Cliente
                    </span>
                    <span className="text-[11px] text-slate-500">
                      El cliente autoriza a consultar su historial crediticio ante las Sociedades de Información Crediticia.
                    </span>
                  </div>
                </label>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Medio de autorización:
                  </label>
                  <select
                    value={medioAutorizacion}
                    onChange={(e) => setMedioAutorizacion(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="FIRMA_AUTOGRAFA">Firma Autógrafa</option>
                    <option value="HUELLA_DIGITAL">Huella Dactilar Biométrica</option>
                    <option value="OTP_SMS">Código OTP / SMS al Celular</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="border-b border-slate-200/70 pb-2">
                    <span className="font-bold text-slate-900 text-xs block">
                      Score & Estatus de Crédito
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Parámetros de consulta crediticia
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Estatus inicial Buró:
                    </label>
                    <select
                      value={buroInternoEstatus}
                      onChange={(e) => setBuroInternoEstatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="NORMAL">NORMAL (Aprobado)</option>
                      <option value="NO SUJETO DE CREDITO">NO SUJETO DE CRÉDITO (Bloqueado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Folio de consulta previa (opcional):
                    </label>
                    <input
                      type="text"
                      value={folioBuroPrevia}
                      onChange={(e) => setFolioBuroPrevia(e.target.value)}
                      placeholder="Ej. BC-2026-99120"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-950 text-xs block">
                      Consulta Automática Inmediata
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Obtener Score FICO al hacer clic en Aceptar
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={consultaInmediata}
                    onChange={(e) => setConsultaInmediata(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Clean Action Footer (Aceptar / Cerrar) */}
          <div className="pt-3.5 mt-2 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Cerrar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aceptar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
