'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  FileCheck,
  Eye,
  RefreshCw,
  FileSignature,
  QrCode,
  User,
  Tag,
  Layers,
  Receipt,
  Handshake,
  Columns,
  History,
} from 'lucide-react';
import {
  PersonaCore,
  CategoriaPersona,
  getCategoriaPersona,
  getCategoriaInfo,
  NotaClienteCore,
  CreditoHistorialPersona,
  AmortizacionCuota,
} from '@/types/core';
import { getHistorialCreditosPersona } from '@/lib/data/historialCreditosData';
import DatosBancariosPersonaView from './DatosBancariosPersonaView';
import { UserSession } from '@/types/auth';
import { useCoreSync } from '@/context/CoreSyncContext';

interface EditarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaCore | null;
  initialTab?: 'editar' | 'opciones' | 'historial_creditos' | 'datos_bancarios' | 'expediente' | 'notas';
  onSuccess?: (updated: PersonaCore) => void;
  onLaunchCanje?: () => void;
  onLaunchBuro?: () => void;
  onLaunchBancarios?: () => void;
  onLaunchExpediente?: () => void;
  onLaunchPrestanombres?: () => void;
  onPromoteToDv?: (persona: PersonaCore) => void;
  notes?: NotaClienteCore[];
  onAddNote?: (nota: NotaClienteCore) => void;
  currentUser?: UserSession | null;
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
  currentUser,
}: EditarClienteModalProps) {
  const { updatePersona } = useCoreSync();

  // Tab activo: 'editar' | 'opciones' | 'historial_creditos' | 'datos_bancarios' | 'expediente' | 'notas'
  const [activeTab, setActiveTab] = useState<'editar' | 'opciones' | 'historial_creditos' | 'datos_bancarios' | 'expediente' | 'notas'>(initialTab);

  // Categoría en Padrón (CF, DV, AV, CO)
  const [categoria, setCategoria] = useState<CategoriaPersona>(getCategoriaPersona(persona));

  // Estados para Historial de Créditos
  const [creditoSearchFilter, setCreditoSearchFilter] = useState('');
  const [selectedCreditoRowId, setSelectedCreditoRowId] = useState<number | string | null>(null);
  const [selectedAmortizacionCredito, setSelectedAmortizacionCredito] = useState<CreditoHistorialPersona | null>(null);
  const [convenioModalCredito, setConvenioModalCredito] = useState<CreditoHistorialPersona | null>(null);
  const [convenioPlazos, setConvenioPlazos] = useState<number>(8);
  const [convenioToast, setConvenioToast] = useState<string | null>(null);

  // Estados para Visor de Expediente Digital Integrado
  const [selectedDocId, setSelectedDocId] = useState<'ine' | 'cfe' | 'pagare' | 'sat' | 'prestanombres'>('ine');
  const [ineSide, setIneSide] = useState<'anverso' | 'reverso'>('anverso');
  const [docZoom, setDocZoom] = useState<number>(100);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [docToast, setDocToast] = useState<string | null>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedFiles((prev) => ({
          ...prev,
          [selectedDocId]: reader.result as string,
        }));
        setDocToast(`Documento "${file.name}" cargado y cotejado.`);
        setTimeout(() => setDocToast(null), 3000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownloadDoc = () => {
    if (!persona) return;
    const docNames: Record<string, string> = {
      ine: 'IDENTIFICACION_OFICIAL_INE',
      cfe: 'COMPROBANTE_DOMICILIO_CFE',
      pagare: 'PAGARE_LEGAL_AMPARADO',
      sat: 'CONSTANCIA_SITUACION_FISCAL_SAT',
      prestanombres: 'DECLARATORIA_PRESTANOMBRES_CNBV',
    };
    const filename = `${docNames[selectedDocId] || selectedDocId.toUpperCase()}_${persona.personaId}.pdf`;
    const dummyContent = `LANAHORA CORE - EXPEDIENTE DIGITAL COTEJADO\n===========================================\nDocumento: ${docNames[selectedDocId] || selectedDocId.toUpperCase()}\nTitular: ${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno}\nID Sistema: #${persona.personaId}\nCURP: ${persona.curp}\nRFC: ${persona.rfc || 'S/D'}\nDomicilio: ${persona.direccion || direccion || 'AV. HIDALGO'} #${persona.numeroExterior || numeroExterior || '104'}, Col. ${persona.colonia || colonia || 'CENTRO'}, ${persona.localidad || 'SALTILLO'}, ${persona.estadoNacimiento || 'COAHUILA'}\nFecha de Cotejo: ${new Date().toLocaleDateString('es-MX')}\nValidado por: Mesa de Control y Riesgos LanAhora S.A.P.I. de C.V. SOFOM E.N.R.`;
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  // Notas internas locales con trazabilidad de autor, módulo y fecha
  const [noteInput, setNoteInput] = useState('');
  const [noteModulo, setNoteModulo] = useState('Padrón de Clientes');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Control de apertura y persona para no resetear activeTab ni inputs en cada polling de sincronización
  const prevOpenRef = useRef<boolean>(false);
  const prevPersonaIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      return;
    }

    const isNewOpen = !prevOpenRef.current;
    const isNewPersona = prevPersonaIdRef.current !== persona?.personaId;

    if (persona && (isNewOpen || isNewPersona)) {
      prevOpenRef.current = true;
      prevPersonaIdRef.current = persona.personaId;

      setActiveTab(initialTab || 'editar');
      setCategoria(getCategoriaPersona(persona));
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
  }, [persona?.personaId, isOpen, initialTab]);

  if (!isOpen || !persona) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isDvRole = categoria === 'DV';
    const updated: PersonaCore = {
      ...persona,
      categoria,
      isDistribuidor: isDvRole,
      distribuidorId: isDvRole ? (persona.distribuidorId || 1025) : undefined,
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

  const getModuloBadge = (moduloName: string = 'Padrón de Clientes') => {
    switch (moduloName) {
      case 'Buró de Crédito':
        return {
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      case 'Mesa de Crédito':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Crédito y Cartera':
        return {
          badge: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'PLD / Cumplimiento':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
        };
      case 'Cobranza':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'Padrón de Clientes':
      default:
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
    }
  };

  const handleCreateNote = () => {
    if (!noteInput.trim()) return;
    const now = new Date();
    const dateStr =
      now.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

    const authorName = currentUser?.name || 'Carlos Martínez';
    const authorRole = currentUser?.roleLabel || 'Mesa de Control';
    const initials =
      currentUser?.avatarInitials ||
      authorName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const newNote: NotaClienteCore = {
      id: `note-${Date.now()}`,
      text: noteInput.trim(),
      date: dateStr,
      author: authorName,
      authorRole: authorRole,
      modulo: noteModulo,
      avatarInitials: initials,
    };

    if (onAddNote) {
      onAddNote(newNote);
    }
    setNoteInput('');
  };

  const handleExportCreditosExcel = (list: CreditoHistorialPersona[]) => {
    if (!persona || list.length === 0) return;
    const headers = [
      'Contrato ID', 'Coordinador', 'Credito ID', 'Nombre Distribuidor', 'Distribuidor ID', 'Persona ID', 'Nombre Completo',
      'Plazos', 'Porc Tasa Mensual', 'Producto', 'Capital', 'Interes', 'Seguro', 'IVA', 'Importe Total', 'Abonos', 'Pago Moda',
      'Saldo Actual', 'Dias Atraso', 'Saldo Atrasado', 'Fecha Hora Registro', 'Fecha Hora Desembolso', 'Fecha Hora Ultimo Pago',
      'Vale Canje', 'Capital Pagado', 'Capital Pendiente', 'Interes Pendiente', 'Seguro Pendiente', 'IVA Pendiente',
      'Usuario ID Registro', 'Nom Usuario Registro', 'Pagos Atrasados', 'Tipo Desembolso', 'Estatus', 'Pagaré Estatus',
      'Fecha Primer Plazo', 'Fecha Ultimo Plazo', 'Capital Atrasado', 'Interes Atrasado', 'Comision Atrasado', 'Seguro Atrasado',
      'Cargo Atrasado', 'IVA Atrasado', 'Observacion', 'Sucursal', 'Tipo'
    ];

    const rows = list.map((c) => [
      c.contratoId, `"${c.coordinador}"`, c.creditoId, `"${c.nombreDistribuidor}"`, c.distribuidorId, c.personaId, `"${c.nombreCompleto}"`,
      c.plazos, c.porcTasaMensual, `"${c.producto}"`, c.capital, c.interes, c.seguro, c.iva, c.importeTotal, c.abonos, c.pagoModa,
      c.saldoActual, c.diasAtraso, c.saldoAtrasado, c.fechaHoraRegistro, c.fechaHoraDesembolso, c.fechaHoraUltimoPago,
      c.valeCanje, c.capitalPagado, c.capitalPendiente, c.interesPendiente, c.seguroPendiente, c.ivaPendiente,
      c.usuarioIdRegistro, `"${c.nomUsuarioRegistro}"`, c.pagosAtrasados, `"${c.tipoDesembolso}"`, c.estatus, `"${c.pagareEstatusDesc}"`,
      c.fechaPrimerPlazo, c.fechaUltimoPlazo, c.capitalAtrasado, c.interesAtrasado, c.comisionAtrasado, c.seguroAtrasado,
      c.cargoAtrasado, c.ivaAtrasado, `"${c.observacion}"`, `"${c.sucursal}"`, `"${c.tipo}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HISTORIAL_CREDITOS_${persona.personaId}_${persona.apellidoPaterno || 'CLIENTE'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyConvenio = () => {
    if (!convenioModalCredito) return;
    setConvenioToast(`Convenio generado exitosamente para Crédito #${convenioModalCredito.creditoId} a ${convenioPlazos} quincenas.`);
    setConvenioModalCredito(null);
    setTimeout(() => setConvenioToast(null), 3500);
  };

  const currentCat = getCategoriaPersona(persona);
  const catInfo = getCategoriaInfo(currentCat);
  const isDv = currentCat === 'DV';

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
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                {persona.nombre} {persona.nombreAdicional ? persona.nombreAdicional + ' ' : ''}{persona.apellidoPaterno} {persona.apellidoMaterno}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                ID #{persona.personaId}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 shadow-2xs ${catInfo.badgeClass}`}
                title={`${catInfo.code} - ${catInfo.label}`}
              >
                <span className="font-mono font-black">{catInfo.code}</span>
                <span className="font-semibold">· {catInfo.label}</span>
                {isDv && persona.distribuidorId && (
                  <span className="font-mono font-bold">(#{persona.distribuidorId})</span>
                )}
              </span>
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
                <span>Editar Datos</span>
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
                onClick={() => setActiveTab('historial_creditos')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'historial_creditos'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Historial Créditos</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('datos_bancarios')}
                className={`px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5 ${
                  activeTab === 'datos_bancarios'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Datos Bancarios</span>
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
                    <span className="text-[10px] text-slate-400 font-mono">14 campos</span>
                  </div>

                  {/* Categoría / Rol en Padrón */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Categoría en Padrón:</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as CategoriaPersona)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="CF">CF - Cliente Final</option>
                      <option value="DV">DV - Distribuidora Oficial</option>
                      <option value="AV">AV - Aval</option>
                      <option value="CO">CO - Cónyuge de DV</option>
                    </select>
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
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-white shrink-0">
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
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-blue-950">
                      Canjear Vale a este Cliente
                    </h4>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Historial de Créditos */}
                <button
                  type="button"
                  onClick={() => setActiveTab('historial_creditos')}
                  className="p-3.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left transition flex flex-col justify-between group active:scale-98 shadow-2xs"
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <Receipt className="w-5 h-5 text-blue-700 transition" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Historial
                    </span>
                  </div>
                  <p className="font-bold text-blue-950 text-xs">Historial de Créditos</p>
                </button>

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
                  <p className="font-bold text-slate-900 text-xs">Solicitar Buró</p>
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
                  <p className="font-bold text-slate-900 text-xs">Expediente Digital</p>
                </button>

                {/* Datos Bancarios */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('datos_bancarios');
                  }}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col justify-between group active:scale-98"
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <CreditCard className="w-5 h-5 text-slate-700 group-hover:text-blue-600 transition" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                      STP SPEI
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">Datos Bancarios</p>
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
                  <p className="font-bold text-slate-900 text-xs">Carta Prestanombres</p>
                </button>
              </div>

              {/* Asignar como Distribuidora: SOLO para quien no lo sea ya (CF, AV, CO) */}
              {!isDv && (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                    <p className="font-bold text-xs text-slate-900">
                      Promover a Distribuidora Oficial (DV)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onPromoteToDv) onPromoteToDv(persona);
                    }}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95 shadow-xs"
                  >
                    Promover a DV
                  </button>
                </div>
              )}

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
          {/* PESTAÑA: HISTORIAL DE CRÉDITOS (PANTALLA FIEL AL LEGACY)  */}
          {/* ========================================================= */}
          {activeTab === 'historial_creditos' && (() => {
            const allCreditos = getHistorialCreditosPersona(persona);
            const filteredCreditos = allCreditos.filter((c) => {
              if (!creditoSearchFilter.trim()) return true;
              const q = creditoSearchFilter.toLowerCase().trim();
              return (
                c.creditoId.toString().toLowerCase().includes(q) ||
                c.contratoId.toString().toLowerCase().includes(q) ||
                c.coordinador.toLowerCase().includes(q) ||
                c.nombreDistribuidor.toLowerCase().includes(q) ||
                c.producto.toLowerCase().includes(q) ||
                c.tipoDesembolso.toLowerCase().includes(q) ||
                c.sucursal.toLowerCase().includes(q) ||
                c.estatus.toLowerCase().includes(q)
              );
            });

            const activeSelectedCredito =
              filteredCreditos.find((c) => c.creditoId === selectedCreditoRowId) ||
              filteredCreditos[0] ||
              null;

            // Totales de resumen
            const totalCapital = filteredCreditos.reduce((sum, c) => sum + c.capital, 0);
            const totalInteres = filteredCreditos.reduce((sum, c) => sum + c.interes, 0);
            const totalSeguro = filteredCreditos.reduce((sum, c) => sum + c.seguro, 0);
            const totalIva = filteredCreditos.reduce((sum, c) => sum + c.iva, 0);
            const totalImporte = filteredCreditos.reduce((sum, c) => sum + c.importeTotal, 0);
            const totalAbonos = filteredCreditos.reduce((sum, c) => sum + c.abonos, 0);
            const totalPagoModa = filteredCreditos.reduce((sum, c) => sum + c.pagoModa, 0);
            const totalSaldoActual = filteredCreditos.reduce((sum, c) => sum + c.saldoActual, 0);
            const totalCapitalPendiente = filteredCreditos.reduce((sum, c) => sum + c.capitalPendiente, 0);

            return (
              <div className="space-y-3 font-sans text-xs">
                {/* Toast de Convenio / Actualización */}
                {convenioToast && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{convenioToast}</span>
                  </div>
                )}

                {/* Barra Superior Legacy: Cliente y Botonera */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {/* Info Cliente & Botón Ver Detalles */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold text-xs">Cliente:</span>
                      <span className="font-extrabold text-slate-900 text-sm tracking-wide">
                        {persona.nombre} {persona.nombreAdicional ? persona.nombreAdicional + ' ' : ''}{persona.apellidoPaterno} {persona.apellidoMaterno}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!activeSelectedCredito}
                      onClick={() => {
                        if (activeSelectedCredito) {
                          setSelectedAmortizacionCredito(activeSelectedCredito);
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-bold text-xs shadow-2xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>

                  {/* Botones de Operación (Generar convenio, Actualizar, Exportar a excel, Personalizar Columnas) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSelectedCredito) {
                          setConvenioModalCredito(activeSelectedCredito);
                        } else {
                          alert('Seleccione un crédito para generar convenio.');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Handshake className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Generar convenio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setConvenioToast('Historial de créditos actualizado en tiempo real.');
                        setTimeout(() => setConvenioToast(null), 2500);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Actualizar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportCreditosExcel(filteredCreditos)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Exportar a excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        alert('Todas las 48 columnas se encuentran activas y desplegadas en el lienzo.');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Columns className="w-3.5 h-3.5 text-purple-600" />
                      <span>Personalizar Columnas</span>
                    </button>
                  </div>
                </div>

                {/* Barra de Búsqueda Rápida Legacy */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Introduzca el texto a buscar..."
                    value={creditoSearchFilter}
                    onChange={(e) => setCreditoSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  {creditoSearchFilter && (
                    <button
                      type="button"
                      onClick={() => setCreditoSearchFilter('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Banner de Clasificación Legacy */}
                <div className="bg-slate-600 text-white px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center gap-2">
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded border border-slate-500">
                    ▲
                  </span>
                  <span>credito Clasificacion Desc: VALE DE DINERO</span>
                  <span className="text-[10px] text-slate-300 font-mono font-normal">
                    ({filteredCreditos.length} {filteredCreditos.length === 1 ? 'registro' : 'registros'})
                  </span>
                </div>

                {/* Grid de 48 Columnas con Scroll Horizontal */}
                <div className="overflow-x-auto border-x border-b border-slate-300 rounded-b-lg bg-white shadow-xs max-h-[460px]">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 z-20 shadow-2xs">
                      {/* Fila 1: Títulos de Columna */}
                      <tr className="border-b border-slate-300">
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Contrato ID</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Coordinador</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-blue-700">Credito ID</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Nombre Distribuidor</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Distribuidor ID</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Persona ID</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Nombre Completo</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-center">Plazos</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Porc Tasa Mensua</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Producto</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Capital</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Interes</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Seguro</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">IVA</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right text-slate-900">Importe Total</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Abonos</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">pago Moda</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right text-blue-800">Saldo Actual</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-center">Dias Atraso</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Saldo Atrasado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Fecha Hora Regis</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Fecha Hora Dese</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Fecha Hora Ultime</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-center">Vale Canje</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Capital Pagado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">Capital Pendiente</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">InteresPendiente</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">SeguroPendiente</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">IVAPendiente</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-center">Usuario ID Regist</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Nom Usuario Reg</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-center">Pagos Atrasados</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Tipo Desembolso</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Estatus</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">username</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">PuntoDeVenta</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">pagareEstatusDes</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">fechaPrimerPlazo</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">fechaUltimoPlazo</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">capitalAtrasado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">interesAtrasado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">comisionAtrasado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">seguroAtrasado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">cargoAtrasado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold text-right">ivaAtrasado</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Observacion</th>
                        <th className="px-2 py-1.5 border-r border-slate-300 font-bold">Sucursal</th>
                        <th className="px-2 py-1.5 font-bold">Tipo</th>
                      </tr>

                      {/* Fila 2: Inputs de Filtro por Columna (Fiel al ERP) */}
                      <tr className="bg-slate-200/60 border-b border-slate-300">
                        {Array.from({ length: 48 }).map((_, fIdx) => (
                          <th key={fIdx} className="p-1 border-r border-slate-300">
                            <input
                              type="text"
                              disabled
                              className="w-full h-5 px-1 bg-white border border-slate-300 rounded text-[9px] cursor-not-allowed opacity-80"
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {filteredCreditos.length === 0 ? (
                        <tr>
                          <td colSpan={48} className="text-center py-10 text-slate-400 font-medium text-xs">
                            No se encontraron registros de crédito para este cliente.
                          </td>
                        </tr>
                      ) : (
                        filteredCreditos.map((c) => {
                          const isSelected = activeSelectedCredito?.creditoId === c.creditoId;
                          return (
                            <tr
                              key={c.creditoId}
                              onClick={() => setSelectedCreditoRowId(c.creditoId)}
                              onDoubleClick={() => setSelectedAmortizacionCredito(c)}
                              className={`cursor-pointer transition select-none ${
                                isSelected
                                  ? 'bg-blue-50/80 font-semibold text-slate-900 border-l-4 border-l-blue-600'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <td className="px-2 py-2 border-r border-slate-200 font-mono">{c.contratoId}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-bold uppercase">{c.coordinador}</td>
                              <td
                                className="px-2 py-2 border-r border-slate-200 font-mono font-bold text-blue-600 hover:underline cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAmortizacionCredito(c);
                                }}
                                title="Ver desglose de pagos y amortizaciones"
                              >
                                {c.creditoId}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 uppercase">{c.nombreDistribuidor}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono text-right">{c.distribuidorId}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono text-right">{c.personaId}</td>
                              <td className="px-2 py-2 border-r border-slate-200 uppercase font-semibold">{c.nombreCompleto}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-center font-bold">{c.plazos}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">{c.porcTasaMensual.toFixed(2)} %</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-bold text-slate-800">{c.producto}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono font-bold">
                                {c.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.interes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.seguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono font-extrabold text-slate-900">
                                {c.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.abonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono font-bold text-emerald-700">
                                {c.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono font-black text-blue-900">
                                {c.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-center font-mono font-bold">
                                {c.diasAtraso}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.saldoAtrasado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono">{c.fechaHoraRegistro}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono">{c.fechaHoraDesembolso}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono">{c.fechaHoraUltimoPago}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-center font-mono">{c.valeCanje}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.capitalPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono font-bold">
                                {c.capitalPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.interesPendiente.toFixed(4)}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.seguroPendiente.toFixed(4)}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">
                                {c.ivaPendiente.toFixed(4)}
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 text-center font-mono">{c.usuarioIdRegistro}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-bold">{c.nomUsuarioRegistro}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-center font-mono font-bold">{c.pagosAtrasados}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-bold text-blue-700">{c.tipoDesembolso}</td>
                              <td className="px-2 py-2 border-r border-slate-200">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {c.estatus}
                                </span>
                              </td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono">{c.username || '-'}</td>
                              <td className="px-2 py-2 border-r border-slate-200">{c.puntoDeVenta || '-'}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-bold text-slate-600">{c.pagareEstatusDesc}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono">{c.fechaPrimerPlazo}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-mono">{c.fechaUltimoPlazo}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">{c.capitalAtrasado.toFixed(4)}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">{c.interesAtrasado.toFixed(4)}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">{c.comisionAtrasado.toFixed(4)}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">{c.seguroAtrasado.toFixed(4)}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">{c.cargoAtrasado.toFixed(4)}</td>
                              <td className="px-2 py-2 border-r border-slate-200 text-right font-mono">{c.ivaAtrasado.toFixed(4)}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-semibold text-slate-800">{c.observacion}</td>
                              <td className="px-2 py-2 border-r border-slate-200 font-bold uppercase">{c.sucursal}</td>
                              <td className="px-2 py-2 font-semibold text-slate-800">{c.tipo}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>

                    {/* Fila Inferior de Totales (Fiel al ERP) */}
                    {filteredCreditos.length > 0 && (
                      <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400 sticky bottom-0 z-20 text-slate-900 shadow-inner">
                        <tr>
                          <td colSpan={10} className="px-3 py-2 text-right border-r border-slate-300 uppercase tracking-wider text-[10px]">
                            Totales:
                          </td>
                          <td className="px-2 py-2 text-right font-mono border-r border-slate-300">
                            {totalCapital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-2 text-right font-mono border-r border-slate-300">
                            {totalInteres.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-2 text-right font-mono border-r border-slate-300">
                            {totalSeguro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-2 text-right font-mono border-r border-slate-300">
                            {totalIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-2 text-right font-mono font-black text-slate-950 border-r border-slate-300">
                            {totalImporte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-2 text-right font-mono border-r border-slate-300">
                            {totalAbonos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-2 text-right font-mono text-emerald-800 border-r border-slate-300">
                            {totalPagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-2 text-right font-mono font-black text-blue-900 border-r border-slate-300">
                            {totalSaldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td colSpan={7} className="px-2 py-2 text-right font-mono border-r border-slate-300">
                            {totalCapitalPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td colSpan={22} className="px-2 py-2 text-slate-400 text-[10px]">
                            Fin de totales
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* MODAL DE AMORTIZACIÓN Y DETALLE (VER DETALLES) */}
                {selectedAmortizacionCredito && (
                  <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 font-sans">
                      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Receipt className="w-5 h-5 text-blue-400" />
                          <div>
                            <h3 className="font-extrabold text-sm tracking-tight">
                              Tabla de Amortizaciones · Crédito #{selectedAmortizacionCredito.creditoId}
                            </h3>
                            <p className="text-[10px] text-slate-300 font-mono">
                              Contrato #{selectedAmortizacionCredito.contratoId} · {selectedAmortizacionCredito.producto} · {selectedAmortizacionCredito.sucursal}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedAmortizacionCredito(null)}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-4 overflow-y-auto space-y-4 text-xs">
                        {/* Resumen de Montos */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Capital Inicial</span>
                            <span className="font-mono font-bold text-sm text-slate-900">
                              ${selectedAmortizacionCredito.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Interés + Seguro + IVA</span>
                            <span className="font-mono font-bold text-sm text-slate-700">
                              ${(selectedAmortizacionCredito.interes + selectedAmortizacionCredito.seguro + selectedAmortizacionCredito.iva).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amparado</span>
                            <span className="font-mono font-black text-sm text-blue-900">
                              ${selectedAmortizacionCredito.importeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Cuota Quincenal</span>
                            <span className="font-mono font-black text-sm text-emerald-700">
                              ${selectedAmortizacionCredito.pagoModa.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Tabla de Desglose Quincenal */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-bold">
                              <tr>
                                <th className="px-3 py-2 text-center"># Pago</th>
                                <th className="px-3 py-2">Fecha Vencimiento</th>
                                <th className="px-3 py-2 text-right">Capital</th>
                                <th className="px-3 py-2 text-right">Interés</th>
                                <th className="px-3 py-2 text-right">Seguro</th>
                                <th className="px-3 py-2 text-right">IVA</th>
                                <th className="px-3 py-2 text-right text-slate-900">Cuota Quincenal</th>
                                <th className="px-3 py-2 text-right">Saldo Restante</th>
                                <th className="px-3 py-2 text-center">Estatus</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                              {(selectedAmortizacionCredito.amortizaciones || []).map((cuota) => (
                                <tr key={cuota.numeroPago} className="hover:bg-slate-50 transition">
                                  <td className="px-3 py-2 text-center font-bold">{cuota.numeroPago} / {selectedAmortizacionCredito.plazos}</td>
                                  <td className="px-3 py-2 text-slate-700 font-sans">{cuota.fechaVencimiento}</td>
                                  <td className="px-3 py-2 text-right">${cuota.capital.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right text-slate-600">${cuota.interes.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right text-slate-600">${cuota.seguro.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right text-slate-600">${cuota.iva.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right font-extrabold text-slate-900">${cuota.cuotaTotal.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right font-bold text-blue-900">${cuota.saldoRestante.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-center font-sans">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      {cuota.estatus}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Mesa de Control y Cobranza LanAhora · Sistema Oficial de Cartera
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedAmortizacionCredito(null)}
                          className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL DE GENERAR CONVENIO */}
                {convenioModalCredito && (
                  <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg p-5 space-y-4 font-sans animate-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <Handshake className="w-5 h-5 text-emerald-600" />
                          <h3 className="font-extrabold text-sm text-slate-900">
                            Generar Convenio de Reestructuración
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConvenioModalCredito(null)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="font-bold text-slate-900">
                            {persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">
                            Crédito #{convenioModalCredito.creditoId} · Saldo Actual: ${convenioModalCredito.saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Plazos del Convenio (Quincenas):
                          </label>
                          <select
                            value={convenioPlazos}
                            onChange={(e) => setConvenioPlazos(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:ring-1 focus:ring-blue-600"
                          >
                            <option value={4}>4 Quincenas (${(convenioModalCredito.saldoActual / 4).toFixed(2)} c/u)</option>
                            <option value={8}>8 Quincenas (${(convenioModalCredito.saldoActual / 8).toFixed(2)} c/u)</option>
                            <option value={12}>12 Quincenas (${(convenioModalCredito.saldoActual / 12).toFixed(2)} c/u)</option>
                            <option value={16}>16 Quincenas (${(convenioModalCredito.saldoActual / 16).toFixed(2)} c/u)</option>
                          </select>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                          <p className="font-bold">Nueva Cuota Quincenal Calculada:</p>
                          <p className="font-black text-base font-mono mt-0.5">
                            ${(convenioModalCredito.saldoActual / convenioPlazos).toLocaleString('es-MX', { minimumFractionDigits: 2 })} M.N.
                          </p>
                          <p className="text-[10px] text-emerald-700 mt-1">
                            Al autorizar, se emitirá el convenio formal y se actualizará el calendario de cobranza.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setConvenioModalCredito(null)}
                          className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyConvenio}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aplicar Convenio</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* PESTAÑA: DATOS BANCARIOS DE LA PERSONA (ERP LEGACY)        */}
          {/* ========================================================= */}
          {activeTab === 'datos_bancarios' && (
            <div className="p-1">
              <DatosBancariosPersonaView
                persona={persona}
                onUpdatePersona={(up) => {
                  updatePersona(up);
                  if (onSuccess) onSuccess(up);
                }}
                currentUser={currentUser}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* PESTAÑA 3: EXPEDIENTE DIGITAL (VISOR INTEGRADO DIRECTO)   */}
          {/* ========================================================= */}
          {activeTab === 'expediente' && (
            <div className="space-y-3">
              {/* Input oculto para carga/sustitución de documentos */}
              <input
                type="file"
                ref={fileUploadInputRef}
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
                className="hidden"
              />

              {/* Toast de confirmación de subida */}
              {docToast && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{docToast}</span>
                </div>
              )}

              {/* Visor de Documentos Integrado */}
              <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs min-h-[560px]">
                {/* Columna Izquierda: Padrón de Documentos (4 cols) */}
                <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/70 p-3 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-extrabold text-slate-900 text-xs">Documentos del Expediente</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      5 Cotejados
                    </span>
                  </div>

                  {/* Lista de Documentos */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5">
                    {/* Doc 1: INE */}
                    <button
                      type="button"
                      onClick={() => setSelectedDocId('ine')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                        selectedDocId === 'ine'
                          ? 'bg-blue-50/90 border-blue-400 text-blue-950 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedDocId === 'ine' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">Identificación Oficial (INE)</p>
                          <p className="text-[10px] text-slate-400 font-mono">Frente / Reverso · 2.4 MB</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Vigente
                      </span>
                    </button>

                    {/* Doc 2: CFE */}
                    <button
                      type="button"
                      onClick={() => setSelectedDocId('cfe')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                        selectedDocId === 'cfe'
                          ? 'bg-blue-50/90 border-blue-400 text-blue-950 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedDocId === 'cfe' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Building className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">Comprobante Domicilio (CFE)</p>
                          <p className="text-[10px] text-slate-400 font-mono">Recibo Luz · 1.1 MB</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Validado
                      </span>
                    </button>

                    {/* Doc 3: Pagaré */}
                    <button
                      type="button"
                      onClick={() => setSelectedDocId('pagare')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                        selectedDocId === 'pagare'
                          ? 'bg-blue-50/90 border-blue-400 text-blue-950 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedDocId === 'pagare' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">Pagaré Legal Amparado</p>
                          <p className="text-[10px] text-slate-400 font-mono">Garantía · 850 KB</p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          persona.pagareEstatusId === 'FIRMADO EN BLANCO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {persona.pagareEstatusId === 'FIRMADO EN BLANCO' ? 'Firmado' : 'Sin Pagaré'}
                      </span>
                    </button>

                    {/* Doc 4: SAT */}
                    <button
                      type="button"
                      onClick={() => setSelectedDocId('sat')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                        selectedDocId === 'sat'
                          ? 'bg-blue-50/90 border-blue-400 text-blue-950 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedDocId === 'sat' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">Constancia Fiscal (SAT)</p>
                          <p className="text-[10px] text-slate-400 font-mono">CIF Oficial · 620 KB</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Validado
                      </span>
                    </button>

                    {/* Doc 5: Prestanombres */}
                    <button
                      type="button"
                      onClick={() => setSelectedDocId('prestanombres')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                        selectedDocId === 'prestanombres'
                          ? 'bg-blue-50/90 border-blue-400 text-blue-950 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedDocId === 'prestanombres' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FileSignature className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">Carta Prestanombres (CNBV)</p>
                          <p className="text-[10px] text-slate-400 font-mono">PLD / Art 115 · 512 KB</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Cotejado
                      </span>
                    </button>
                  </div>

                  {/* Botón de Cargar o Reemplazar */}
                  <button
                    type="button"
                    onClick={() => fileUploadInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Subir o Sustituir Documento</span>
                  </button>
                </div>

                {/* Columna Derecha: Canvas del Visor de Documentos (8 cols) */}
                <div className="lg:col-span-8 flex flex-col bg-slate-100 overflow-hidden">
                  {/* Barra de herramientas superior del visor */}
                  <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">
                        {selectedDocId === 'ine' && 'Identificación Oficial INE (IFE)'}
                        {selectedDocId === 'cfe' && 'Comprobante de Domicilio (CFE Suministrador)'}
                        {selectedDocId === 'pagare' && 'Pagaré Mercantil con Garantía'}
                        {selectedDocId === 'sat' && 'Constancia de Situación Fiscal (SAT CIF)'}
                        {selectedDocId === 'prestanombres' && 'Declaratoria Prestanombres (CNBV Art. 115)'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Cotejado
                      </span>
                    </div>

                    {/* Toggle Anverso / Reverso para INE */}
                    {selectedDocId === 'ine' && (
                      <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold text-slate-600">
                        <button
                          type="button"
                          onClick={() => setIneSide('anverso')}
                          className={`px-2.5 py-1 rounded-md transition text-xs ${
                            ineSide === 'anverso'
                              ? 'bg-white text-blue-700 shadow-2xs'
                              : 'hover:text-slate-900'
                          }`}
                        >
                          Anverso
                        </button>
                        <button
                          type="button"
                          onClick={() => setIneSide('reverso')}
                          className={`px-2.5 py-1 rounded-md transition text-xs ${
                            ineSide === 'reverso'
                              ? 'bg-white text-blue-700 shadow-2xs'
                              : 'hover:text-slate-900'
                          }`}
                        >
                          Reverso
                        </button>
                      </div>
                    )}

                    {/* Acciones de zoom, impresión y descarga */}
                    <div className="flex items-center gap-1.5">
                      {/* Zoom Controls */}
                      <div className="inline-flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5 text-xs text-slate-700">
                        <button
                          type="button"
                          onClick={() => setDocZoom((z) => Math.max(70, z - 15))}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition"
                          title="Reducir zoom"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-1.5 font-mono text-[11px] font-bold">{docZoom}%</span>
                        <button
                          type="button"
                          onClick={() => setDocZoom((z) => Math.min(160, z + 15))}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition"
                          title="Aumentar zoom"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        {docZoom !== 100 && (
                          <button
                            type="button"
                            onClick={() => setDocZoom(100)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition text-slate-400 hover:text-slate-700"
                            title="Restablecer tamaño normal"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Imprimir */}
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition"
                        title="Imprimir documento"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Descargar */}
                      <button
                        type="button"
                        onClick={handleDownloadDoc}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition"
                        title="Descargar PDF cotejado"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Reemplazar */}
                      <button
                        type="button"
                        onClick={() => fileUploadInputRef.current?.click()}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Sustituir</span>
                      </button>
                    </div>
                  </div>

                  {/* Lienzo de visualización con soporte de scroll y zoom */}
                  <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-200/50">
                    <div
                      style={{
                        transform: `scale(${docZoom / 100})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {/* Si el usuario subió una imagen personalizada */}
                      {uploadedFiles[selectedDocId] ? (
                        <div className="relative bg-white p-3 rounded-2xl shadow-xl border border-slate-300 max-w-lg">
                          <img
                            src={uploadedFiles[selectedDocId]}
                            alt="Documento cargado"
                            className="max-h-[440px] w-auto object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...uploadedFiles };
                              delete next[selectedDocId];
                              setUploadedFiles(next);
                            }}
                            className="mt-2 text-xs text-rose-600 hover:underline font-bold block text-center"
                          >
                            Restablecer a documento cotejado del sistema
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* 1. INE (ANVERSO / REVERSO) */}
                          {selectedDocId === 'ine' && (
                            ineSide === 'anverso' ? (
                              // INE ANVERSO
                              <div className="w-[480px] h-[300px] bg-gradient-to-br from-emerald-50/90 via-slate-50 to-teal-50 border-2 border-emerald-600/40 rounded-2xl shadow-xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
                                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

                                <div className="flex items-center justify-between border-b border-emerald-700/20 pb-2 relative z-10">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold text-[10px] flex items-center justify-center">
                                      MEX
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-black tracking-wider text-emerald-950 uppercase">
                                        INSTITUTO NACIONAL ELECTORAL
                                      </p>
                                      <p className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest">
                                        CREDENCIAL PARA VOTAR
                                      </p>
                                    </div>
                                  </div>
                                  <div className="w-12 h-6 rounded bg-gradient-to-r from-amber-200 via-emerald-200 to-sky-200 border border-emerald-300/60 opacity-80 flex items-center justify-center text-[7px] font-mono font-bold text-slate-700">
                                    HOLOGRAMA
                                  </div>
                                </div>

                                <div className="grid grid-cols-12 gap-3 items-center relative z-10 my-auto">
                                  <div className="col-span-4 flex flex-col items-center">
                                    <div className="w-24 h-28 bg-slate-200 border-2 border-slate-300 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                                      <span className="font-extrabold text-2xl text-slate-400">
                                        {persona.nombre.charAt(0)}{persona.apellidoPaterno.charAt(0)}
                                      </span>
                                      <span className="text-[8px] font-bold text-slate-500 uppercase mt-1">FOTO INE</span>
                                      <div className="absolute bottom-0 inset-x-0 bg-emerald-800/80 text-[7px] text-white text-center py-0.5 font-mono">
                                        COTEJADO
                                      </div>
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-400 mt-1">HUELLA DIGITAL</span>
                                  </div>

                                  <div className="col-span-8 space-y-1.5 text-slate-900">
                                    <div>
                                      <span className="text-[8px] text-slate-400 uppercase font-bold block leading-none">NOMBRE</span>
                                      <span className="font-extrabold text-xs tracking-tight block uppercase text-slate-950">
                                        {persona.nombre} {persona.nombreAdicional ? persona.nombreAdicional + ' ' : ''}{persona.apellidoPaterno} {persona.apellidoMaterno}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-[8px] text-slate-400 uppercase font-bold block leading-none">DOMICILIO</span>
                                      <p className="text-[10px] font-bold text-slate-700 leading-tight uppercase">
                                        {persona.direccion || direccion || 'AV. HIDALGO'} #{persona.numeroExterior || numeroExterior || '104'} {(persona.numeroInterior || numeroInterior) ? 'INT ' + (persona.numeroInterior || numeroInterior) : ''}
                                        <br />
                                        COL. {persona.colonia || colonia || 'CENTRO'}
                                        <br />
                                        C.P. {persona.codigoPostal || codigoPostal || '25000'}, {persona.localidad || 'SALTILLO'}, {persona.estadoNacimiento || estadoNacimiento || 'COAHUILA'}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200/80 text-[9px] font-mono">
                                      <div>
                                        <span className="text-[7px] text-slate-400 block font-bold">SEXO</span>
                                        <span className="font-bold">{persona.sexoId === 'FEMENINO' ? 'M' : 'H'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[7px] text-slate-400 block font-bold">AÑO REG</span>
                                        <span className="font-bold">2018 02</span>
                                      </div>
                                      <div>
                                        <span className="text-[7px] text-slate-400 block font-bold">VIGENCIA</span>
                                        <span className="font-bold text-emerald-700">2024-2034</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                                      <div>
                                        <span className="text-[7px] text-slate-400 block font-bold">CLAVE DE ELECTOR</span>
                                        <span className="font-bold text-[8px] truncate block">{persona.numeroIdentificacion || numeroIdentificacion || 'CHRMOS88082105H200'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[7px] text-slate-400 block font-bold">CURP</span>
                                        <span className="font-bold text-[8px] truncate block">{persona.curp}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-1 border-t border-emerald-700/20 relative z-10">
                                  <span>SECCIÓN 0482</span>
                                  <span className="text-emerald-700 font-bold">IDENTIFICACIÓN OFICIAL VÁLIDA</span>
                                  <span>EMISIÓN 01</span>
                                </div>
                              </div>
                            ) : (
                              // INE REVERSO
                              <div className="w-[480px] h-[300px] bg-slate-100 border-2 border-slate-300 rounded-2xl shadow-xl p-4 flex flex-col justify-between relative overflow-hidden select-none">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                  <span className="text-[9px] font-mono text-slate-400">INSTITUTO NACIONAL ELECTORAL</span>
                                  <span className="text-[9px] font-mono text-slate-400">REVERSO OFICIAL</span>
                                </div>

                                <div className="grid grid-cols-12 gap-3 items-center">
                                  <div className="col-span-8 space-y-2">
                                    <div className="h-14 bg-white border border-slate-300 rounded-lg p-2 flex flex-col justify-between">
                                      <span className="text-[7px] font-mono text-slate-400 uppercase">FIRMA DEL TITULAR</span>
                                      <span className="font-serif italic text-base text-blue-900 font-bold px-2">
                                        {persona.nombre} {persona.apellidoPaterno}
                                      </span>
                                    </div>
                                    <div className="h-10 bg-slate-900 rounded p-1 flex items-center justify-between overflow-hidden">
                                      <div className="flex gap-0.5 h-full w-full">
                                        {Array.from({ length: 60 }).map((_, i) => (
                                          <div
                                            key={i}
                                            className={`h-full ${i % 3 === 0 ? 'w-1 bg-white' : i % 5 === 0 ? 'w-0.5 bg-white' : 'w-px bg-slate-800'}`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-span-4 flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-200">
                                    <QrCode className="w-16 h-16 text-slate-900" />
                                    <span className="text-[7px] font-mono text-slate-400 mt-1">QR BIOMÉTRICO</span>
                                  </div>
                                </div>

                                <div className="bg-slate-200/80 p-2 rounded-lg font-mono text-[9px] text-slate-700 leading-tight tracking-widest">
                                  <p>IDMEX{String(persona.personaId).padStart(9, '0')}0&lt;&lt;0248&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                                  <p>8808218M3412316MEX&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</p>
                                  <p className="truncate">
                                    {persona.apellidoPaterno.toUpperCase()}&lt;{persona.apellidoMaterno?.toUpperCase() || 'X'}&lt;&lt;{persona.nombre.toUpperCase()}&lt;&lt;&lt;
                                  </p>
                                </div>
                              </div>
                            )
                          )}

                          {/* 2. CFE COMPROBANTE DE DOMICILIO */}
                          {selectedDocId === 'cfe' && (
                            <div className="w-[460px] bg-white border border-slate-300 rounded-xl shadow-xl p-5 select-none font-sans text-slate-900 space-y-4">
                              <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-xl text-emerald-700 tracking-tight">CFE</span>
                                    <span className="text-[10px] font-bold text-slate-600">Suministrador de Servicios Básicos</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 uppercase font-mono">Comprobante Fiscal Digital por Internet</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    AVISO RECIBO
                                  </span>
                                  <p className="text-[10px] font-mono font-bold text-slate-600 mt-1">NO. SERVICIO: 9281 7482 9182</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-12 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="col-span-7 space-y-1">
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">TITULAR DEL SERVICIO</span>
                                  <p className="font-extrabold text-xs text-slate-900 uppercase">
                                    {persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}
                                  </p>
                                  <p className="text-[10px] text-slate-600 leading-tight uppercase">
                                    {persona.direccion || direccion || 'AV. HIDALGO'} #{persona.numeroExterior || numeroExterior || '104'} {(persona.numeroInterior || numeroInterior) ? 'INT ' + (persona.numeroInterior || numeroInterior) : ''}
                                    <br />
                                    COL. {persona.colonia || colonia || 'CENTRO'}, C.P. {persona.codigoPostal || codigoPostal || '25000'}
                                    <br />
                                    {persona.localidad || 'SALTILLO'}, {persona.estadoNacimiento || estadoNacimiento || 'COAHUILA'}
                                  </p>
                                </div>
                                <div className="col-span-5 bg-emerald-700 text-white p-3 rounded-lg flex flex-col justify-between text-right">
                                  <span className="text-[9px] font-bold opacity-80 uppercase">TOTAL A PAGAR</span>
                                  <span className="font-black text-lg font-mono">$845.00</span>
                                  <span className="text-[8px] opacity-80">PESOS 00/100 M.N.</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-2 text-center text-[10px] p-2 bg-slate-100 rounded-lg font-mono">
                                <div>
                                  <span className="text-[8px] text-slate-400 block font-sans">MEDIDOR</span>
                                  <span className="font-bold">874M92</span>
                                </div>
                                <div>
                                  <span className="text-[8px] text-slate-400 block font-sans">PERIODO</span>
                                  <span className="font-bold">BIMESTRAL</span>
                                </div>
                                <div>
                                  <span className="text-[8px] text-slate-400 block font-sans">CONSUMO</span>
                                  <span className="font-bold">340 kWh</span>
                                </div>
                                <div>
                                  <span className="text-[8px] text-slate-400 block font-sans">ESTADO</span>
                                  <span className="font-bold text-emerald-700">PAGADO</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-900">Domicilio Cotejado con Éxito</p>
                                    <p className="text-[8px] text-slate-400">Coincidencia al 100% con Padrón LanAhora</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-slate-500">EMISIÓN: 28/OCT/2026</span>
                              </div>
                            </div>
                          )}

                          {/* 3. PAGARÉ LEGAL AMPARADO */}
                          {selectedDocId === 'pagare' && (
                            <div className="w-[460px] bg-amber-50/40 border-2 border-slate-800 rounded-xl shadow-xl p-5 select-none font-serif text-slate-900 space-y-3">
                              <div className="text-center border-b border-slate-400 pb-2">
                                <p className="font-bold text-xs uppercase tracking-widest font-sans text-slate-700">
                                  TÍTULO DE CRÉDITO MERCANTIL
                                </p>
                                <h3 className="font-black text-sm uppercase tracking-wide text-slate-900">
                                  PAGARÉ CON CARÁCTER EJECUTIVO
                                </h3>
                                <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mt-1 font-sans">
                                  <span>PAGARÉ NÚM: PAG-{persona.personaId}-2026</span>
                                  <span className="font-bold">BUENO POR: ${Number(persona.pagareCantidad || pagareCantidad || 15000).toLocaleString('es-MX', { minimumFractionDigits: 2 })} M.N.</span>
                                </div>
                              </div>

                              <p className="text-[10px] leading-relaxed text-justify font-sans">
                                Por el presente Pagaré, me obligo a pagar incondicionalmente en este acto o a su requerimiento a la orden de <span className="font-bold">LANAHORA S.A.P.I. DE C.V. SOFOM E.N.R.</span>, en la plaza de {persona.localidad || 'Saltillo'}, {persona.estadoNacimiento || estadoNacimiento || 'Coahuila'}, la cantidad de <span className="font-bold">${Number(persona.pagareCantidad || pagareCantidad || 15000).toLocaleString('es-MX')} (Pesos 00/100 M.N.)</span>, valor recibido a mi entera y total satisfacción.
                              </p>

                              <div className="p-2.5 bg-white border border-slate-300 rounded-lg font-sans space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-500">Deudor Principal:</span>
                                  <span className="font-bold">{persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-500">CURP:</span>
                                  <span className="font-mono font-bold">{persona.curp}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-500">Estatus del Pagaré:</span>
                                  <span
                                    className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                                      persona.pagareEstatusId === 'FIRMADO EN BLANCO'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {persona.pagareEstatusId}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-400 flex items-center justify-between font-sans">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-900">FIRMA ELECTRÓNICA AVANZADA (NOM-151)</p>
                                  <p className="text-[8px] font-mono text-slate-400">HASH: 8f9c2d1b...e4a7 | 29/10/2026</p>
                                </div>
                                <div className="w-20 h-8 border-b-2 border-slate-900 italic font-serif text-center text-xs flex items-end justify-center font-bold text-blue-900">
                                  {persona.nombre.charAt(0)}. {persona.apellidoPaterno}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. CONSTANCIA SAT CIF */}
                          {selectedDocId === 'sat' && (
                            <div className="w-[460px] bg-white border border-slate-300 rounded-xl shadow-xl p-5 select-none font-sans text-slate-900 space-y-3">
                              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                                <div>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase">SECRETARÍA DE HACIENDA Y CRÉDITO PÚBLICO</p>
                                  <h3 className="font-black text-sm text-slate-900 tracking-tight">SERVICIO DE ADMINISTRACIÓN TRIBUTARIA</h3>
                                  <p className="text-[9px] font-mono text-slate-600">CÉDULA DE IDENTIFICACIÓN FISCAL (CIF)</p>
                                </div>
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs">
                                  SAT
                                </div>
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Registro Federal de Contribuyentes:</span>
                                  <span className="font-mono font-black text-sm text-blue-700">{persona.rfc || 'S/D'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Nombre o Razón Social:</span>
                                  <span className="font-extrabold text-xs text-slate-900 uppercase">
                                    {persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Régimen Fiscal:</span>
                                  <span className="font-bold text-[10px] text-slate-700">Sueldos y Salarios e Ingresos Asimilados</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500">Estatus en el Padrón:</span>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    ACTIVO
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-1">
                                <QrCode className="w-12 h-12 text-slate-800 shrink-0" />
                                <div className="text-[8px] font-mono text-slate-500 leading-tight">
                                  <p>CADENA ORIGINAL SAT / SELLO DIGITAL DE VERIFICACIÓN:</p>
                                  <p className="text-slate-400 truncate">||1.1|CIF-SAT-2026-880821|84920194829104829102||</p>
                                  <p className="text-emerald-700 font-bold mt-0.5">VALIDACIÓN FISCAL VIGENTE Y POSITIVA</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. CARTA PRESTANOMBRES CNBV */}
                          {selectedDocId === 'prestanombres' && (
                            <div className="w-[460px] bg-white border border-slate-300 rounded-xl shadow-xl p-5 select-none font-sans text-slate-900 space-y-3">
                              <div className="border-b border-slate-300 pb-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                    PREVENCIÓN DE LAVADO DE DINERO (PLD / FT)
                                  </span>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                    CNBV ART. 115
                                  </span>
                                </div>
                                <h3 className="font-black text-xs text-slate-900 mt-1 uppercase">
                                  DECLARATORIA DE BENEFICIARIO CONTROLADOR Y NO PRESTANOMBRES
                                </h3>
                              </div>

                              <p className="text-[10px] text-justify leading-relaxed text-slate-700">
                                Yo, <span className="font-extrabold text-slate-900">{persona.nombre} {persona.apellidoPaterno} {persona.apellidoMaterno}</span>, con CURP <span className="font-mono font-bold">{persona.curp}</span>, manifiesto bajo protesta de decir verdad que actúo a nombre propio y por cuenta propia en todas las operaciones financieras, vales y créditos celebrados con <span className="font-bold">LANAHORA</span>, y que los recursos no son destinados para terceras personas ni actúo como prestanombres de ningún tercero.
                              </p>

                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-extrabold text-emerald-950">Declaratoria Aprobada</p>
                                    <p className="text-[8px] text-emerald-700">Cotejada con biometría dactilar y facial</p>
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-emerald-900">FOLIO #CNBV-88219</span>
                              </div>

                              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px]">
                                <div>
                                  <span className="text-slate-400 block text-[8px]">FECHA Y HORA DE COTEJO</span>
                                  <span className="font-mono font-bold text-slate-700">29/10/2026 11:42:19 hrs</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 block text-[8px]">VALIDADOR RESPONSABLE</span>
                                  <span className="font-bold text-blue-700">OFICIAL DE CUMPLIMIENTO PLD</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
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
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {notes.length} {notes.length === 1 ? 'Nota registrada' : 'Notas registradas'}
                </span>
              </div>

              {/* Agregar nota con trazabilidad completa */}
              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Selector de Módulo */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600 text-[11px] flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Módulo de Registro:</span>
                    </span>
                    <select
                      value={noteModulo}
                      onChange={(e) => setNoteModulo(e.target.value)}
                      className="px-2.5 py-1 bg-white rounded-lg border border-slate-300 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="Padrón de Clientes">Padrón de Clientes</option>
                      <option value="Buró de Crédito">Buró de Crédito</option>
                      <option value="Mesa de Crédito">Mesa de Crédito</option>
                      <option value="Crédito y Cartera">Crédito y Cartera</option>
                      <option value="PLD / Cumplimiento">PLD / Cumplimiento</option>
                      <option value="Cobranza">Cobranza</option>
                    </select>
                  </div>

                  {/* Usuario que firma la nota */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Registrando como:</span>
                    <span className="font-bold text-slate-800">{currentUser?.name || 'Carlos Martínez'}</span>
                    <span className="text-slate-400">({currentUser?.roleLabel || 'Mesa de Control'})</span>
                  </div>
                </div>

                {/* Campo de texto y botón */}
                <div className="flex items-center gap-2">
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
                    className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNote}
                    disabled={!noteInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Agregar Nota</span>
                  </button>
                </div>
              </div>

              {/* Listado de notas con Quién, Dónde y Cuándo */}
              <div className="space-y-2.5">
                {notes.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No hay notas internas registradas para este cliente todavía.</p>
                  </div>
                ) : (
                  notes.map((note, idx) => {
                    const modBadge = getModuloBadge(note.modulo);
                    return (
                      <div
                        key={note.id || idx}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2.5 shadow-2xs"
                      >
                        {/* Header de la nota: Quién la puso | Dónde (Módulo) | Cuándo (Fecha y Hora) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          {/* Quién la puso */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {note.avatarInitials || (note.author ? note.author.charAt(0) : 'U')}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">
                                {note.author || 'Mesa de Control'}
                              </span>
                              {note.authorRole && (
                                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {note.authorRole}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dónde se puso (Módulo) y Cuándo (Fecha y Hora) */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Dónde (Módulo) */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${modBadge.badge}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${modBadge.dot}`} />
                              <span>{note.modulo || 'Padrón de Clientes'}</span>
                            </span>

                            {/* Cuándo (Fecha y Hora) */}
                            <span className="text-[10px] font-mono font-medium text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{note.date} hrs</span>
                            </span>
                          </div>
                        </div>

                        {/* Cuerpo de la nota */}
                        <p className="text-slate-800 text-xs font-normal leading-relaxed pl-1">
                          {note.text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
