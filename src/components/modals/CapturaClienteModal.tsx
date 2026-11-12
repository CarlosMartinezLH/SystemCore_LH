'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
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

  // Form State - Solo datos del Cliente
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
      return;
    }
    if (!primerApellido.trim()) {
      setFormError('El primer apellido es obligatorio.');
      return;
    }
    if (!curp.trim() || curp.trim().length < 18) {
      setFormError('El CURP debe tener exactamente 18 caracteres.');
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
        {/* Clean Header con Logo Oficial de LanAhora */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/lanahora-logo.png"
              alt="LanAhora"
              className="h-8 object-contain"
            />
            <span className="text-slate-300">|</span>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Captura de Cliente
            </h2>
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

        {/* Form Body: 3 Columnas Horizontales (Sin necesidad de Scroll) */}
        <form onSubmit={handleSubmit} className="p-5 text-xs flex flex-col">
          {formError && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Sexo:
                  </label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as 'FEMENINO' | 'MASCULINO')}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
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
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* COLUMNA 2: DOMICILIO */}
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleLookupCP}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition shrink-0"
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
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                )}
              </div>
            </div>

            {/* COLUMNA 3: IDENTIFICACIÓN, PAGARÉ Y LUGAR DE NACIMIENTO */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="border-b border-slate-200/70 pb-1.5 mb-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Identificación & Pagaré
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Tipo de identificación:
                  </label>
                  <select
                    value={tipoIdentificacion}
                    onChange={(e) => setTipoIdentificacion(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="INE">INE / IFE</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="CEDULA">Cédula Profesional</option>
                    <option value="OTRA">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Número de identificación:
                  </label>
                  <input
                    type="text"
                    value={numeroIdentificacion}
                    onChange={(e) => setNumeroIdentificacion(e.target.value.toUpperCase())}
                    placeholder="Folio OCR / Clave"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Estado pagaré:
                  </label>
                  <select
                    value={estadoPagare}
                    onChange={(e) => setEstadoPagare(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="FIRMADO EN BLANCO">FIRMADO EN BLANCO</option>
                    <option value="SIN PAGARE">SIN PAGARE</option>
                    <option value="NO DEFINIDO">NO DEFINIDO</option>
                  </select>
                </div>

                {estadoPagare === 'FIRMADO EN BLANCO' ? (
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
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                ) : (
                  <div />
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/70 space-y-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Lugar de Nacimiento
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Estado de nacimiento:
                    </label>
                    <select
                      value={estadoNacimiento}
                      onChange={(e) => setEstadoNacimiento(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
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
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer: Botón Aceptar en azul institucional LanAhora */}
          <div className="pt-4 mt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
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
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
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
