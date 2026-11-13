'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DistribuidorCore } from '@/types/core';
import {
  X,
  Search,
  Upload,
  Download,
  Eye,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ShieldCheck,
  FolderOpen,
  FileCheck,
  Image as ImageIcon,
  Filter,
  Trash2,
  Plus,
  ExternalLink,
  Paperclip,
  ChevronRight,
  FileArchive,
  UserCheck,
  Building,
  Lock,
  RefreshCw,
} from 'lucide-react';

export type CategoriaDocumento =
  | 'TODOS'
  | 'ORIGINACION_CRM'
  | 'CONTRATOS_LEGAL'
  | 'IDENTIFICACION_DOMICILIO'
  | 'OPERACION_ANEXOS';

export interface DocumentoExpediente {
  id: string;
  nombre: string;
  categoria: 'ORIGINACION_CRM' | 'CONTRATOS_LEGAL' | 'IDENTIFICACION_DOMICILIO' | 'OPERACION_ANEXOS';
  formato: 'PDF' | 'JPG' | 'PNG';
  tamano: string;
  fechaCarga: string;
  fechaDocumento?: string;
  fechaVigencia?: string;
  subidoPor: string;
  estatus: 'VALIDADO_FIRMADO' | 'VIGENTE' | 'PENDIENTE_RENOVACION';
  descripcion?: string;
  urlSimulada?: string;
  esGeneradoSistema?: boolean;
}

interface ExpedienteDistribuidorModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: DistribuidorCore;
  onOpenContratoApertura?: () => void;
}

// Historial documental completo de la distribuidora (Desde prospección CRM hasta contratación y operación)
const buildDefaultDocumentos = (distribuidor: DistribuidorCore): DocumentoExpediente[] => [
  // 1. ORIGINACIÓN & PROSPECCIÓN CRM
  {
    id: 'doc-crm-1',
    nombre: 'Solicitud_Distribuidora_Prospecto_CRM_Firmada.pdf',
    categoria: 'ORIGINACION_CRM',
    formato: 'PDF',
    tamano: '2.8 MB',
    fechaCarga: '14/03/2023 10:15',
    fechaDocumento: '14/03/2023',
    subidoPor: 'Coordinador Manuel Pulido (CRM Móvil)',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Formato inicial de prospección en campo con firma autógrafa y datos socioeconómicos.',
  },
  {
    id: 'doc-crm-2',
    nombre: 'Reporte_Buro_Credito_Originacion_Calificado.pdf',
    categoria: 'ORIGINACION_CRM',
    formato: 'PDF',
    tamano: '1.4 MB',
    fechaCarga: '14/03/2023 11:30',
    fechaDocumento: '14/03/2023',
    subidoPor: 'Mesa de Crédito (Círculo de Crédito)',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Dictamen de score crediticio 685 pts con historial positivo en sector microfinanciero.',
  },
  {
    id: 'doc-crm-3',
    nombre: 'Estudio_Socioeconomico_Visita_Ocular_Campo.pdf',
    categoria: 'ORIGINACION_CRM',
    formato: 'PDF',
    tamano: '4.2 MB',
    fechaCarga: '15/03/2023 16:45',
    fechaDocumento: '15/03/2023',
    subidoPor: 'Supervisor de Zona Saltillo',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Levantamiento socioeconómico con validación de actividad comercial y arraigo domiciliario.',
  },
  {
    id: 'doc-crm-4',
    nombre: 'Evidencia_Fotografica_Fachada_Negocio_Interior.jpg',
    categoria: 'ORIGINACION_CRM',
    formato: 'JPG',
    tamano: '3.1 MB',
    fechaCarga: '15/03/2023 16:50',
    fechaDocumento: '15/03/2023',
    subidoPor: 'Coordinador Manuel Pulido (Geolocalización)',
    estatus: 'VIGENTE',
    descripcion: 'Fotografías de fachada con placa de número exterior y área de atención a clientes.',
  },
  {
    id: 'doc-crm-5',
    nombre: 'Cartas_Recomendacion_Referencias_Cotejadas.pdf',
    categoria: 'ORIGINACION_CRM',
    formato: 'PDF',
    tamano: '1.1 MB',
    fechaCarga: '16/03/2023 09:20',
    fechaDocumento: '16/03/2023',
    subidoPor: 'Mesa de Control (Validación Telefónica)',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: '2 referencias comerciales y 2 personales confirmadas telefónicamente por Mesa de Riesgos.',
  },

  // 2. IDENTIFICACIÓN & DOMICILIO
  {
    id: 'doc-id-1',
    nombre: 'INE_Vigente_Anverso_Reverso_Cotejada.pdf',
    categoria: 'IDENTIFICACION_DOMICILIO',
    formato: 'PDF',
    tamano: '2.2 MB',
    fechaCarga: '14/03/2023 10:20',
    fechaDocumento: '05/01/2021',
    fechaVigencia: '31/12/2031',
    subidoPor: 'Mesa de Control (OCR INE Validado)',
    estatus: 'VIGENTE',
    descripcion: 'Credencial para votar con fotografía vigente cotejada ante el padrón electoral nominal.',
  },
  {
    id: 'doc-id-2',
    nombre: 'Comprobante_Domicilio_CFE_Reciente.pdf',
    categoria: 'IDENTIFICACION_DOMICILIO',
    formato: 'PDF',
    tamano: '1.6 MB',
    fechaCarga: '10/09/2026 12:10',
    fechaDocumento: '01/09/2026',
    fechaVigencia: '01/12/2026',
    subidoPor: 'Mesa de Control (Renovación Semestral)',
    estatus: 'VIGENTE',
    descripcion: 'Recibo oficial de energía eléctrica con dirección coincidente al padrón de distribución.',
  },
  {
    id: 'doc-id-3',
    nombre: 'Constancia_CURP_Oficial_RENAPO.pdf',
    categoria: 'IDENTIFICACION_DOMICILIO',
    formato: 'PDF',
    tamano: '850 KB',
    fechaCarga: '14/03/2023 10:25',
    fechaDocumento: '14/03/2023',
    subidoPor: 'Consulta Automatizada RENAPO',
    estatus: 'VIGENTE',
    descripcion: 'Clave Única de Registro de Población certificada ante el Registro Nacional de Población.',
  },
  {
    id: 'doc-id-4',
    nombre: 'Constancia_Situacion_Fiscal_RFC_SAT.pdf',
    categoria: 'IDENTIFICACION_DOMICILIO',
    formato: 'PDF',
    tamano: '1.3 MB',
    fechaCarga: '14/03/2023 10:30',
    fechaDocumento: '10/03/2023',
    subidoPor: 'Mesa de Control (Cotejo SAT)',
    estatus: 'VIGENTE',
    descripcion: 'Cédula fiscal con RFC verificado, sin reporte en listas 69 ni 69-B del Código Fiscal.',
  },

  // 3. CONTRATOS & LEGAL
  {
    id: 'doc-leg-1',
    nombre: 'Contrato_Apertura_Credito_RECA_Firmado.pdf',
    categoria: 'CONTRATOS_LEGAL',
    formato: 'PDF',
    tamano: '5.6 MB',
    fechaCarga: '02/04/2023 16:41',
    fechaDocumento: '02/04/2023',
    subidoPor: 'Dirección Jurídica / Notaría',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Contrato legal de 14 páginas debidamente firmado y registrado ante RECA CONDUSEF.',
    esGeneradoSistema: true,
  },
  {
    id: 'doc-leg-2',
    nombre: 'Pagare_Mercantil_Garantia_Unico_Firmado.pdf',
    categoria: 'CONTRATOS_LEGAL',
    formato: 'PDF',
    tamano: '1.8 MB',
    fechaCarga: '02/04/2023 16:45',
    fechaDocumento: '02/04/2023',
    subidoPor: 'Mesa de Control (Cédula de Garantías)',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Pagaré mercantil a la orden con cláusula de intereses moratorios y aceptación expresa.',
    esGeneradoSistema: true,
  },
  {
    id: 'doc-leg-3',
    nombre: 'Carta_Declaratoria_Prestanombres_Firmada.pdf',
    categoria: 'CONTRATOS_LEGAL',
    formato: 'PDF',
    tamano: '950 KB',
    fechaCarga: '02/04/2023 16:50',
    fechaDocumento: '02/04/2023',
    subidoPor: 'Oficialía de Cumplimiento PLD',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Declaración bajo protesta de decir verdad conforme a los lineamientos de prevención de lavado.',
    esGeneradoSistema: true,
  },
  {
    id: 'doc-leg-4',
    nombre: 'Autorizacion_Consulta_SIC_Buro_Firmada.pdf',
    categoria: 'CONTRATOS_LEGAL',
    formato: 'PDF',
    tamano: '720 KB',
    fechaCarga: '14/03/2023 10:18',
    fechaDocumento: '14/03/2023',
    subidoPor: 'Coordinador Manuel Pulido',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Autorización expresa por 3 años para consultas periódicas de historial crediticio.',
  },

  // 4. OPERACIÓN, RENOVACIONES & ANEXOS
  {
    id: 'doc-op-1',
    nombre: 'Oficio_Autorizacion_Ampliacion_Linea_Credito.pdf',
    categoria: 'OPERACION_ANEXOS',
    formato: 'PDF',
    tamano: '1.2 MB',
    fechaCarga: '28/09/2026 16:45',
    fechaDocumento: '28/09/2026',
    subidoPor: 'Dirección General (Carlos Martínez Mayorga)',
    estatus: 'VALIDADO_FIRMADO',
    descripcion: 'Aprobación de incremento de línea de crédito a $240,000.00 por excelente cobranza.',
  },
  {
    id: 'doc-op-2',
    nombre: 'Caratula_Poliza_Proteccion_Saldo_Vigente.pdf',
    categoria: 'OPERACION_ANEXOS',
    formato: 'PDF',
    tamano: '1.5 MB',
    fechaCarga: '05/01/2026 09:00',
    fechaDocumento: '01/01/2026',
    fechaVigencia: '31/12/2026',
    subidoPor: 'Seguros y Protección de Saldo',
    estatus: 'VIGENTE',
    descripcion: 'Cobertura activa de seguro por fallecimiento e invalidez para saldo vivo de cartera.',
  },
];

export default function ExpedienteDistribuidorModal({
  isOpen,
  onClose,
  distribuidor,
  onOpenContratoApertura,
}: ExpedienteDistribuidorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [documentos, setDocumentos] = useState<DocumentoExpediente[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoExpediente | null>(null);
  const [activeCategoria, setActiveCategoria] = useState<CategoriaDocumento>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'VALIDADO_FIRMADO' | 'VIGENTE'>('TODOS');

  // Estados para Subir Documento
  const [isSubirOpen, setIsSubirOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<DocumentoExpediente['categoria']>('ORIGINACION_CRM');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setDocumentos(buildDefaultDocumentos(distribuidor));
  }, [distribuidor]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDoc) setSelectedDoc(null);
        else if (isSubirOpen) setIsSubirOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedDoc, isSubirOpen, onClose]);

  // Documentos filtrados
  const filteredDocs = useMemo(() => {
    return documentos.filter((d) => {
      if (activeCategoria !== 'TODOS' && d.categoria !== activeCategoria) return false;
      if (statusFilter !== 'TODOS' && d.estatus !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        d.nombre.toLowerCase().includes(q) ||
        d.subidoPor.toLowerCase().includes(q) ||
        (d.descripcion && d.descripcion.toLowerCase().includes(q))
      );
    });
  }, [documentos, activeCategoria, statusFilter, searchTerm]);

  // Manejador de subida de documento
  const handleGuardarNuevoDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nombreFinal = nuevoNombre.trim().endsWith('.pdf') || nuevoNombre.trim().endsWith('.jpg')
      ? nuevoNombre.trim()
      : `${nuevoNombre.trim().replace(/\s+/g, '_')}.pdf`;

    const nuevo: DocumentoExpediente = {
      id: `doc-user-${Date.now()}`,
      nombre: nombreFinal,
      categoria: nuevaCategoria,
      formato: nombreFinal.toLowerCase().endsWith('.jpg') || nombreFinal.toLowerCase().endsWith('.png') ? 'JPG' : 'PDF',
      tamano: archivoSeleccionado ? `${(archivoSeleccionado.size / 1024 / 1024).toFixed(1)} MB` : '1.8 MB',
      fechaCarga: new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      fechaDocumento: new Date().toLocaleDateString('es-MX'),
      subidoPor: 'Mesa de Control (Carga Manual)',
      estatus: 'VALIDADO_FIRMADO',
      descripcion: nuevoComentario.trim() || 'Documento oficial escaneado y adjuntado al expediente digital.',
    };

    setDocumentos([nuevo, ...documentos]);
    setIsSubirOpen(false);
    setNuevoNombre('');
    setNuevoComentario('');
    setArchivoSeleccionado(null);
    setSelectedDoc(nuevo);
  };

  const handleDescargar = (doc: DocumentoExpediente) => {
    // Generar un blob de descarga seguro con metadatos reales
    const content = `LANAHORA FINANCIERA - EXPEDIENTE DIGITAL COTEJADO\n=======================================================\nDocumento: ${doc.nombre}\nCategoría: ${doc.categoria}\nTitular / Distribuidora: ${distribuidor.nombreDistribuidor}\nNo. Distribuidor: ${distribuidor.noDist}\nPersona ID: ${distribuidor.personaId}\nCURP: ${distribuidor.curp}\nFecha de Cotejo Oficial: ${doc.fechaCarga}\nResponsable de Validación: ${doc.subidoPor}\nEstatus de Firma: ${doc.estatus}\n\nDescripción del Expediente:\n${doc.descripcion || 'Sin observaciones'}\n\nCertificación Digital: Archivo verificado contra el repositorio central de expedientes de LanAhora S.A.P.I. de C.V. SOFOM E.N.R.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.nombre.endsWith('.txt') ? doc.nombre : `${doc.nombre}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-[98vw] max-w-7xl h-[95vh] max-h-[95vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* HEADER: EXPEDIENTE DIGITAL DE LA DISTRIBUIDORA           */}
        {/* ======================================================== */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-700 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight truncate">
                  Expediente Digital de la Distribuidora
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  DV #{distribuidor.noDist}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  100% Integrado
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                Titular: <span className="font-bold text-slate-800">{distribuidor.nombreDistribuidor}</span> · CURP: <span className="font-mono">{distribuidor.curp}</span> · Contrato #{distribuidor.contratoId || 2606}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSubirOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adjuntar Documento</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Imprimir Resumen de Expediente"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KPI CARDS: INTEGRACIÓN DEL EXPEDIENTE                    */}
        {/* ======================================================== */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Documentos
              </span>
              <p className="text-base font-black font-mono text-slate-900 mt-0.5">
                {documentos.length} archivos
              </p>
              <span className="text-[10px] text-slate-500">Historial completo</span>
            </div>

            <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                Originación & CRM
              </span>
              <p className="text-base font-black font-mono text-purple-950 mt-0.5">
                {documentos.filter((d) => d.categoria === 'ORIGINACION_CRM').length} archivos
              </p>
              <span className="text-[10px] text-purple-700 font-medium">Desde prospección inicial</span>
            </div>

            <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Contratos & Legal
              </span>
              <p className="text-base font-black font-mono text-blue-950 mt-0.5">
                {documentos.filter((d) => d.categoria === 'CONTRATOS_LEGAL').length} firmados
              </p>
              <span className="text-[10px] text-blue-700 font-medium">RECA y pagarés</span>
            </div>

            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Validación Oficial
              </span>
              <p className="text-base font-black font-mono text-emerald-950 mt-0.5">
                Cotejado 100%
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">Mesa de Control & Riesgos</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BARRA DE FILTROS, PESTAÑAS Y BÚSQUEDA                   */}
        {/* ======================================================== */}
        <div className="px-6 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Pestañas de Categoría */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveCategoria('TODOS')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCategoria === 'TODOS'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Todos ({documentos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoria('ORIGINACION_CRM')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCategoria === 'ORIGINACION_CRM'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Originación & CRM
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoria('CONTRATOS_LEGAL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCategoria === 'CONTRATOS_LEGAL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Contratos & Legal
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoria('IDENTIFICACION_DOMICILIO')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCategoria === 'IDENTIFICACION_DOMICILIO'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Identificaciones & Domicilio
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoria('OPERACION_ANEXOS')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeCategoria === 'OPERACION_ANEXOS'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Operación & Anexos
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar documento, formato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL PRINCIPAL: LISTA DE ARCHIVOS Y VISOR INTEGRADO     */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          
          {/* LADO IZQUIERDO: LISTA DE DOCUMENTOS */}
          <div className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 ${selectedDoc ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1 px-1 font-medium">
              <span>Documentos Encontrados: <strong>{filteredDocs.length}</strong></span>
              <span>Orden cronológico</span>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No se encontraron documentos</h4>
                <p className="text-xs text-slate-500">Pruebe ajustando el buscador o la categoría seleccionada.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                          doc.formato === 'PDF'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {doc.formato === 'PDF' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {doc.nombre}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {doc.descripcion}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 flex-wrap">
                            <span className="font-mono text-slate-600 font-bold">{doc.tamano}</span>
                            <span>·</span>
                            <span>Cargado: <strong className="text-slate-600 font-mono">{doc.fechaCarga}</strong></span>
                            <span>·</span>
                            <span>Por: <strong className="text-slate-600">{doc.subidoPor}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            doc.estatus === 'VALIDADO_FIRMADO'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {doc.estatus === 'VALIDADO_FIRMADO' ? 'Firmado' : 'Vigente'}
                        </span>

                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDescargar(doc);
                            }}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                            title="Descargar"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* LADO DERECHO: VISOR DE DOCUMENTO COTEJADO */}
          {selectedDoc ? (
            <div className="w-full lg:w-1/2 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
              {/* Barra Superior del Visor */}
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                    {selectedDoc.nombre}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Cotejo oficial · Expediente digital LanAhora Core
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedDoc.esGeneradoSistema && onOpenContratoApertura && (
                    <button
                      type="button"
                      onClick={onOpenContratoApertura}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition shadow-xs"
                      title="Abrir contrato oficial interactivo de 14 páginas"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Contrato RECA</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDescargar(selectedDoc)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                    title="Imprimir documento"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition lg:hidden"
                    title="Cerrar visor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contenido Visual del Documento Escaneado / Cotejado */}
              <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 flex flex-col items-center">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-4 font-sans text-xs text-slate-800">
                  
                  {/* Encabezado del Documento */}
                  <div className="border-b-2 border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                        EXPEDIENTE CENTRAL DIGITALIZADO
                      </span>
                      <h3 className="text-sm font-black text-slate-900 mt-0.5">
                        {selectedDoc.nombre.replace(/_/g, ' ').replace(/\.pdf|\.jpg/g, '')}
                      </h3>
                    </div>
                    <img
                      src="/lanahora-logo-transparent.png"
                      alt="LanAhora"
                      className="h-6 w-auto object-contain"
                    />
                  </div>

                  {/* Sello de Cotejo Oficial */}
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div className="text-[11px] text-emerald-950">
                      <p className="font-bold uppercase tracking-wide">
                        DOCUMENTO COTEJADO & APROBADO
                      </p>
                      <p className="text-emerald-800 mt-0.5">
                        Certificado por: <strong>{selectedDoc.subidoPor}</strong> el <span className="font-mono">{selectedDoc.fechaCarga}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Metadatos del Titular */}
                  <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Distribuidora Titular:</span>
                      <span className="font-bold text-slate-900">{distribuidor.nombreDistribuidor}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">No. de Distribuidor:</span>
                      <span className="font-mono font-bold text-slate-800">{distribuidor.noDist}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">CURP:</span>
                      <span className="font-mono font-bold text-slate-800">{distribuidor.curp}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Dirección Registrada:</span>
                      <span className="font-medium text-slate-800 text-right">{distribuidor.direccion || 'SALTILLO, COAHUILA'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Categoría Documental:</span>
                      <span className="font-bold text-purple-700">{selectedDoc.categoria}</span>
                    </div>
                  </div>

                  {/* Detalle Operativo del Archivo */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                      Resumen del Documento:
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {selectedDoc.descripcion}
                    </p>
                  </div>

                  {/* Firma Digital y Hash de Seguridad */}
                  <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>FOLIO EXPEDIENTE:</span>
                      <span className="text-slate-600 font-bold">LAN-EXP-{distribuidor.noDist}-{selectedDoc.id.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HASH SHA-256:</span>
                      <span className="text-slate-500 truncate max-w-[200px]">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VALIDEZ LEGAL:</span>
                      <span className="text-emerald-600 font-bold">NOM-151-SCFI / FIRMA AVANZADA</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex w-1/2 border-l border-slate-200 bg-white items-center justify-center p-8 text-center text-slate-400">
              <div className="max-w-xs space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Visor de Documentos</h4>
                <p className="text-xs text-slate-500">
                  Seleccione cualquier documento de la lista izquierda para previsualizarlo, descargarlo o verificar su cotejo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* FOOTER DEL EXPEDIENTE                                    */}
        {/* ======================================================== */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Expediente auditado bajo normatividad CNBV y CONDUSEF.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
          >
            Cerrar Expediente
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODAL SECUNDARIO: ADJUNTAR / SUBIR NUEVO DOCUMENTO       */}
        {/* ======================================================== */}
        {isSubirOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-150">
              
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Adjuntar Documento al Expediente
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubirOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleGuardarNuevoDocumento} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre o Descripción del Archivo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Comprobante_Ingresos_2026.pdf"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría del Documento:</label>
                  <select
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
                  >
                    <option value="ORIGINACION_CRM">Originación & Prospección CRM</option>
                    <option value="CONTRATOS_LEGAL">Contratos & Documentos Legales</option>
                    <option value="IDENTIFICACION_DOMICILIO">Identificaciones & Domicilio</option>
                    <option value="OPERACION_ANEXOS">Operación & Anexos</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seleccionar Archivo (PDF, JPG, PNG):</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setArchivoSeleccionado(file);
                        if (!nuevoNombre) setNuevoNombre(file.name);
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 bg-slate-50 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer shadow-2xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notas u Observaciones del Cotejo:</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre el documento o validación en sucursal..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500 shadow-2xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubirOpen(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                  >
                    Guardar en Expediente
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
