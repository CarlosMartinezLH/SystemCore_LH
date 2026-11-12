'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  Building,
  Sparkles,
  AlertCircle,
  HelpCircle,
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

  // Auto-fill from CURP (Mexican Standard Parsing)
  const handleCurpChange = (val: string) => {
    const upper = val.toUpperCase().slice(0, 18);
    setCurp(upper);

    if (upper.length >= 10 && !rfc) {
      setRfc(upper.slice(0, 10));
    }

    if (upper.length >= 11) {
      // Sexo is at index 10 (H for Hombre, M for Mujer)
      const sexoChar = upper.charAt(10);
      if (sexoChar === 'H') setSexo('MASCULINO');
      else if (sexoChar === 'M') setSexo('FEMENINO');

      // Date: indices 4,5 (Year), 6,7 (Month), 8,9 (Day)
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
      setFormError((err as Error).message || 'Error al guardar el cliente en el Core.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden animate-in fade-in flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
              LH
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Captura de Cliente en Core</h2>
              <p className="text-[11px] text-slate-400">Padrón Central de Personas & Validación</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (Exact tabs: Cliente & Buro) */}
        <div className="px-5 pt-3 pb-0 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('cliente')}
              className={`pb-2.5 px-1 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'cliente'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('buro')}
              className={`pb-2.5 px-1 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'buro'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Buro</span>
              {consultaInmediata && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* ================= TAB 1: CLIENTE ================= */}
          {activeTab === 'cliente' && (
            <div className="space-y-4">
              {/* Sección 1: Datos Personales (2 Columnas) */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Datos Personales
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Primer nombre */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Primer nombre: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={primerNombre}
                      onChange={(e) => setPrimerNombre(e.target.value)}
                      placeholder="Ej. ANA"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Segundo nombre */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Segundo nombre:</label>
                    <input
                      type="text"
                      value={segundoNombre}
                      onChange={(e) => setSegundoNombre(e.target.value)}
                      placeholder="Ej. MARIA"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Primer apellido */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Primer apellido: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={primerApellido}
                      onChange={(e) => setPrimerApellido(e.target.value)}
                      placeholder="Ej. ARAIZA"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Segundo apellido */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Segundo apellido:</label>
                    <input
                      type="text"
                      value={segundoApellido}
                      onChange={(e) => setSegundoApellido(e.target.value)}
                      placeholder="Ej. MEDRANO"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Fecha de nacimiento */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Fecha de nacimiento:
                    </label>
                    <input
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* CURP */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      CURP: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      required
                      value={curp}
                      onChange={(e) => handleCurpChange(e.target.value)}
                      placeholder="AAMA020821MCLRR08"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* RFC */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">RFC:</label>
                    <input
                      type="text"
                      maxLength={13}
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      placeholder="AAMA020821990"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Sexo */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Sexo:</label>
                    <select
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value as 'FEMENINO' | 'MASCULINO')}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="FEMENINO">Femenino</option>
                      <option value="MASCULINO">Masculino</option>
                    </select>
                  </div>

                  {/* Telefono móvil */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Telefono móvil:</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={telefonoMovil}
                      onChange={(e) => setTelefonoMovil(e.target.value.replace(/\D/g, ''))}
                      placeholder="8448901234"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200/80 my-3" />

              {/* Sección 2: Domicilio */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Domicilio Particular
                </span>

                {/* Dirección (Full width) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Dirección:</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, avenida o boulevard"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Número exterior */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Número exterior:</label>
                    <input
                      type="text"
                      value={numeroExterior}
                      onChange={(e) => setNumeroExterior(e.target.value)}
                      placeholder="Ej. 120, Int. 4"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Código postal con botón de búsqueda */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Código postal:</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={5}
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ''))}
                        placeholder="25000"
                        className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleLookupCP}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold transition flex items-center justify-center shrink-0"
                        title="Buscar colonias de este código postal"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Localidad */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Localidad:</label>
                  {availableColonias.length > 0 ? (
                    <select
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="">Selecciona una colonia...</option>
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
                      placeholder="Colonia, municipio o sector"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  )}
                </div>
              </div>

              <hr className="border-slate-200/80 my-3" />

              {/* Sección 3: Identificación */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Identificación Oficial
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tipo de identificación */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Tipo de identificación:
                    </label>
                    <select
                      value={tipoIdentificacion}
                      onChange={(e) => setTipoIdentificacion(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="INE">INE / IFE</option>
                      <option value="PASAPORTE">Pasaporte Mexicano</option>
                      <option value="CEDULA">Cédula Profesional</option>
                      <option value="OTRA">Otra Identificación Oficial</option>
                    </select>
                  </div>

                  {/* Número de identificación */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Número de identificación:
                    </label>
                    <input
                      type="text"
                      value={numeroIdentificacion}
                      onChange={(e) => setNumeroIdentificacion(e.target.value.toUpperCase())}
                      placeholder="Folio OCR o Clave de Elector"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200/80 my-3" />

              {/* Sección 4: Pagaré */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Respaldo Legal (Pagaré)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Estado pagaré */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Estado pagaré:</label>
                    <select
                      value={estadoPagare}
                      onChange={(e) => setEstadoPagare(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="FIRMADO EN BLANCO">FIRMADO EN BLANCO</option>
                      <option value="SIN PAGARE">SIN PAGARE</option>
                      <option value="NO DEFINIDO">NO DEFINIDO</option>
                    </select>
                  </div>

                  {/* Cantidad amparada */}
                  {estadoPagare === 'FIRMADO EN BLANCO' && (
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Monto amparado (MXN):
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={pagareCantidad}
                        onChange={(e) => setPagareCantidad(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-slate-200/80 my-3" />

              {/* Sección 5: Lugar de Nacimiento */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Lugar de Nacimiento
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Estado de nacimiento */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Estado de nacimiento:
                    </label>
                    <select
                      value={estadoNacimiento}
                      onChange={(e) => setEstadoNacimiento(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      {ESTADOS_MEXICO.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Localidad de nacimiento */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Localidad de nacimiento:
                    </label>
                    <input
                      type="text"
                      value={localidadNacimiento}
                      onChange={(e) => setLocalidadNacimiento(e.target.value)}
                      placeholder="Ej. Saltillo"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BURO ================= */}
          {activeTab === 'buro' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">
                    Consulta en Buró de Crédito México (LRSIC Art. 28)
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Configuración de autorización crediticia y consulta automática de Score FICO para este cliente.
                  </p>
                </div>
              </div>

              {/* Checkbox de Autorización Expresa */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
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
                      El cliente autorizó formalmente a LanAhora para consultar su historial crediticio ante las Sociedades de Información Crediticia.
                    </span>
                  </div>
                </label>
              </div>

              {/* Medio de Autorización */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Medio de autorización:</label>
                  <select
                    value={medioAutorizacion}
                    onChange={(e) => setMedioAutorizacion(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="FIRMA_AUTOGRAFA">Firma Autógrafa en Ficha</option>
                    <option value="HUELLA_DIGITAL">Huella Dactilar Biométrica</option>
                    <option value="OTP_SMS">Código OTP / SMS al Celular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Estatus inicial Buró:</label>
                  <select
                    value={buroInternoEstatus}
                    onChange={(e) => setBuroInternoEstatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="NORMAL">NORMAL (Aprobado)</option>
                    <option value="NO SUJETO DE CREDITO">NO SUJETO DE CRÉDITO (Bloqueado)</option>
                  </select>
                </div>
              </div>

              {/* Folio de Consulta Previa */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Folio de consulta previa (opcional):
                </label>
                <input
                  type="text"
                  value={folioBuroPrevia}
                  onChange={(e) => setFolioBuroPrevia(e.target.value)}
                  placeholder="Ej. BC-2026-99120"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Si ya se realizó una consulta en los últimos 30 días, ingresa aquí el número de folio.
                </span>
              </div>

              {/* Toggle de Consulta Inmediata */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 text-xs block">
                    Consulta Automática al Guardar
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Invocar API Buró para obtener Score FICO de inmediato
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={consultaInmediata}
                  onChange={(e) => setConsultaInmediata(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Bottom Action Footer (Exact botones: Aceptar / Cerrar) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
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
