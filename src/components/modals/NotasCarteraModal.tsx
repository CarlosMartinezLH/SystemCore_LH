'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CarteraItem } from '@/lib/data/carteraData';
import { UserSession } from '@/types/auth';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  Plus,
  Search,
  MapPin,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Building2,
  UserCheck,
  Clock,
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface NotaCarteraRecord {
  contratoNotaId: number;
  contratoId: number;
  fhRegistro: string;
  nota: string;
  notaTipoDesc: string;
  nombreUsuario: string;
  distribuidorId: number;
  nombreDistribuid: string;
  coordinador: string;
  sucursal: string;
  clienteVisitado: string;
  urlUbicacion: string;
  promesaPago: 'SI' | 'NO';
  promesaFe: string;
  promesaImporte: string;
  notaTipoGestion: string;
}

const DEFAULT_NOTAS_KAREN: NotaCarteraRecord[] = [
  {
    contratoNotaId: 678440,
    contratoId: 6802,
    fhRegistro: '05/11/2026 11:41:45',
    nota: 'NO ATIENDE EN PUERTA, SE ENVIA MENSAJE.',
    notaTipoDesc: 'NOTA MI OFICINA VIRTUAL',
    nombreUsuario: 'ANTONIO RIOS CIGALA',
    distribuidorId: 9601,
    nombreDistribuid: 'KAREN ADRIANA ONTIVEROS DIAZ',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    clienteVisitado: 'KAREN ADRIANA ONTIVEROS DIAZ',
    urlUbicacion: 'https://maps.google.com/?q=28.6512,-106.0821',
    promesaPago: 'NO',
    promesaFe: '01/01/1990 00:00:00',
    promesaImporte: '0.0000',
    notaTipoGestion: 'CDD',
  },
  {
    contratoNotaId: 678673,
    contratoId: 6802,
    fhRegistro: '05/11/2026 14:46:03',
    nota: 'SE VISITA CF PENDIENTE REALICE PAGO A DV.',
    notaTipoDesc: 'NOTA MI OFICINA VIRTUAL',
    nombreUsuario: 'ANTONIO RIOS CIGALA',
    distribuidorId: 9601,
    nombreDistribuid: 'KAREN ADRIANA ONTIVEROS DIAZ',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    clienteVisitado: 'ROBERTO JOSE OZAETA VILLARREAL',
    urlUbicacion: 'https://maps.google.com/?q=28.6489,-106.0795',
    promesaPago: 'NO',
    promesaFe: '01/01/1990 00:00:00',
    promesaImporte: '0.0000',
    notaTipoGestion: 'CDC',
  },
  {
    contratoNotaId: 678678,
    contratoId: 6802,
    fhRegistro: '05/11/2026 14:47:31',
    nota: 'PENDIENTE REALICE PAGO A DV',
    notaTipoDesc: 'NOTA MI OFICINA VIRTUAL',
    nombreUsuario: 'ANTONIO RIOS CIGALA',
    distribuidorId: 9601,
    nombreDistribuid: 'KAREN ADRIANA ONTIVEROS DIAZ',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    clienteVisitado: 'SANDRA GUADALUPE ALANIS MENA',
    urlUbicacion: 'https://maps.google.com/?q=28.6501,-106.0810',
    promesaPago: 'NO',
    promesaFe: '01/01/1990 00:00:00',
    promesaImporte: '0.0000',
    notaTipoGestion: 'CDC',
  },
  {
    contratoNotaId: 683502,
    contratoId: 6802,
    fhRegistro: '10/11/2026 13:21:31',
    nota: 'ATIENDE DV, PENDIENTE PAGO RELACION.',
    notaTipoDesc: 'NOTA MI OFICINA VIRTUAL',
    nombreUsuario: 'ANTONIO RIOS CIGALA',
    distribuidorId: 9601,
    nombreDistribuid: 'KAREN ADRIANA ONTIVEROS DIAZ',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    clienteVisitado: 'KAREN ADRIANA ONTIVEROS DIAZ',
    urlUbicacion: 'https://maps.google.com/?q=28.6515,-106.0825',
    promesaPago: 'NO',
    promesaFe: '01/01/1990 00:00:00',
    promesaImporte: '0.0000',
    notaTipoGestion: 'CDD',
  },
  {
    contratoNotaId: 685851,
    contratoId: 6802,
    fhRegistro: '13/11/2026 10:20:57',
    nota: 'NO ATIENDE EN PUERTA, SE DEJA AVISO, SE ENVIA MENSAJE.',
    notaTipoDesc: 'NOTA MI OFICINA VIRTUAL',
    nombreUsuario: 'ANTONIO RIOS CIGALA',
    distribuidorId: 9601,
    nombreDistribuid: 'KAREN ADRIANA ONTIVEROS DIAZ',
    coordinador: 'ANTONIO RIOS CIGALA',
    sucursal: 'CHIHUAHUA',
    clienteVisitado: 'KAREN ADRIANA ONTIVEROS DIAZ',
    urlUbicacion: 'https://maps.google.com/?q=28.6510,-106.0818',
    promesaPago: 'NO',
    promesaFe: '01/01/1990 00:00:00',
    promesaImporte: '0.0000',
    notaTipoGestion: 'CDD',
  },
];

interface NotasCarteraModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: CarteraItem | any;
  currentUser?: UserSession | null;
}

export default function NotasCarteraModal({
  isOpen,
  onClose,
  distribuidor,
  currentUser,
}: NotasCarteraModalProps) {
  const [mounted, setMounted] = useState(false);
  const [notasList, setNotasList] = useState<NotaCarteraRecord[]>(DEFAULT_NOTAS_KAREN);
  const [fechaInicio, setFechaInicio] = useState('2026-11-01');
  const [fechaFin, setFechaFin] = useState('2026-11-30');
  const [tipoFiltro, setTipoFiltro] = useState('_TODOS');
  const [searchTexto, setSearchTexto] = useState('');

  // Modales secundarios
  const [isNuevaNotaOpen, setIsNuevaNotaOpen] = useState(false);
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('');
  const [nuevoClienteVisitado, setNuevoClienteVisitado] = useState('');
  const [nuevoTipoGestion, setNuevoTipoGestion] = useState('CDD');
  const [nuevaPromesaPago, setNuevaPromesaPago] = useState<'SI' | 'NO'>('NO');
  const [nuevaPromesaImporte, setNuevaPromesaImporte] = useState('');

  // Modal para ver mapa / ubicación GPS
  const [selectedUbicacion, setSelectedUbicacion] = useState<{ url: string; cliente: string; notaId: number } | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Si cambia el distribuidor, adaptar los datos
  useEffect(() => {
    if (distribuidor) {
      const cId = distribuidor.contratoId || 6802;
      const dId = distribuidor.distribuidorId || distribuidor.numeroDist || 9601;
      const dNom = distribuidor.nombreCompleto || 'KAREN ADRIANA ONTIVEROS DIAZ';
      const coord = distribuidor.coordinador || 'ANTONIO RIOS CIGALA';
      const suc = distribuidor.sucursal || 'CHIHUAHUA';

      setNotasList((prev) =>
        prev.map((n) => ({
          ...n,
          contratoId: cId,
          distribuidorId: dId,
          nombreDistribuid: dNom,
          coordinador: coord,
          sucursal: suc,
        }))
      );
    }
  }, [distribuidor]);

  // Filtrado reactivo de las notas
  const notasFiltradas = useMemo(() => {
    return notasList.filter((n) => {
      if (tipoFiltro !== '_TODOS' && n.notaTipoDesc !== tipoFiltro && n.notaTipoGestion !== tipoFiltro) {
        return false;
      }
      if (searchTexto.trim()) {
        const q = searchTexto.toLowerCase().trim();
        const match =
          n.nota.toLowerCase().includes(q) ||
          n.clienteVisitado.toLowerCase().includes(q) ||
          n.nombreUsuario.toLowerCase().includes(q) ||
          n.contratoNotaId.toString().includes(q) ||
          n.notaTipoGestion.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [notasList, tipoFiltro, searchTexto]);

  // Handler para agregar nueva nota
  const handleGuardarNuevaNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNotaTexto.trim()) {
      showToast('Por favor escribe el contenido de la nota.');
      return;
    }

    const nuevaNota: NotaCarteraRecord = {
      contratoNotaId: Math.floor(686000 + Math.random() * 9000),
      contratoId: distribuidor?.contratoId || 6802,
      fhRegistro: new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX'),
      nota: nuevaNotaTexto.trim().toUpperCase(),
      notaTipoDesc: 'NOTA MI OFICINA VIRTUAL',
      nombreUsuario: currentUser?.name || 'ANTONIO RIOS CIGALA',
      distribuidorId: distribuidor?.distribuidorId || distribuidor?.numeroDist || 9601,
      nombreDistribuid: distribuidor?.nombreCompleto || 'KAREN ADRIANA ONTIVEROS DIAZ',
      coordinador: distribuidor?.coordinador || 'ANTONIO RIOS CIGALA',
      sucursal: distribuidor?.sucursal || 'CHIHUAHUA',
      clienteVisitado: (nuevoClienteVisitado || distribuidor?.nombreCompleto || 'DISTRIBUIDOR').toUpperCase(),
      urlUbicacion: 'https://maps.google.com/?q=28.6515,-106.0825',
      promesaPago: nuevaPromesaPago,
      promesaFe: nuevaPromesaPago === 'SI' ? '25/11/2026 12:00:00' : '01/01/1990 00:00:00',
      promesaImporte: nuevaPromesaPago === 'SI' ? nuevaPromesaImporte || '1500.0000' : '0.0000',
      notaTipoGestion: nuevoTipoGestion,
    };

    setNotasList([nuevaNota, ...notasList]);
    setIsNuevaNotaOpen(false);
    setNuevaNotaTexto('');
    setNuevoClienteVisitado('');
    setNuevaPromesaImporte('');
    setNuevaPromesaPago('NO');
    showToast('✓ Nota de cobranza guardada exitosamente.');
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const data = notasFiltradas.map((n) => ({
      'Nota ID': n.contratoNotaId,
      'Contrato ID': n.contratoId,
      'Fecha y Hora': n.fhRegistro,
      Nota: n.nota,
      'Tipo Nota': n.notaTipoDesc,
      'Usuario Registra': n.nombreUsuario,
      'Distribuidor ID': n.distribuidorId,
      'Nombre Distribuidor': n.nombreDistribuid,
      Coordinador: n.coordinador,
      Sucursal: n.sucursal,
      'Cliente Visitado': n.clienteVisitado,
      'Promesa Pago': n.promesaPago,
      'Fecha Promesa': n.promesaFe,
      'Importe Promesa': n.promesaImporte,
      'Tipo Gestión': n.notaTipoGestion,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notas_Cobranza');
    XLSX.writeFile(wb, `notas_cartera_contrato_${distribuidor?.contratoId || 6802}.xlsx`);
    showToast('✓ Archivo Excel generado.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[92vh] font-sans">
        {/* ======================================================== */}
        {/* 1. HEADER MODERNO UNIFICADO                              */}
        {/* ======================================================== */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Bitácora de Cartera
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Contrato #{distribuidor?.contratoId || 6802}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mt-0.5">
                Notas y Gestiones de Cobranza • {distribuidor?.nombreCompleto || 'KAREN ADRIANA ONTIVEROS DIAZ'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
              title="Descargar notas en Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNuevaNotaOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Nota</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. TOOLBAR DE FILTROS Y BÚSQUEDA                         */}
        {/* ======================================================== */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Buscador en Vivo */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por texto de nota, cliente visitado o folio..."
              value={searchTexto}
              onChange={(e) => setSearchTexto(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchTexto && (
              <button
                type="button"
                onClick={() => setSearchTexto('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros de Fecha y Tipo */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-bold">Desde:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-bold">Hasta:</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold">Tipo:</span>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="_TODOS">Todos los Tipos</option>
                <option value="NOTA MI OFICINA VIRTUAL">Oficina Virtual</option>
                <option value="CDD">CDD (Cobranza DV)</option>
                <option value="CDC">CDC (Cobranza CF)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => showToast('Lista de notas actualizada.')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition active:scale-95 cursor-pointer"
              title="Refrescar notas"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. TABLA PRINCIPAL DE NOTAS DE COBRANZA                  */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-auto p-5 bg-[#f8fafc]">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap font-sans">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200 select-none z-10">
                <tr>
                  <th className="px-3 py-2.5 text-center">Nota ID</th>
                  <th className="px-3 py-2.5 text-center">Contrato</th>
                  <th className="px-3 py-2.5">Fecha Registro</th>
                  <th className="px-3 py-2.5 min-w-[280px]">Detalle de la Nota</th>
                  <th className="px-3 py-2.5">Tipo Nota</th>
                  <th className="px-3 py-2.5">Gestor / Usuario</th>
                  <th className="px-3 py-2.5">Cliente Visitado</th>
                  <th className="px-3 py-2.5 text-center">Ubicación GPS</th>
                  <th className="px-3 py-2.5 text-center">Promesa</th>
                  <th className="px-3 py-2.5 text-center">Tipo Gestión</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {notasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                      No se encontraron notas registradas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  notasFiltradas.map((n) => (
                    <tr key={n.contratoNotaId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-center font-mono font-bold text-blue-600">
                        #{n.contratoNotaId}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-slate-500">#{n.contratoId}</td>
                      <td className="px-3 py-2 font-mono text-slate-600 text-[11px]">{n.fhRegistro}</td>
                      <td className="px-3 py-2 font-bold text-slate-900 max-w-md truncate" title={n.nota}>
                        {n.nota}
                      </td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {n.notaTipoDesc}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700 font-medium">{n.nombreUsuario}</td>
                      <td className="px-3 py-2 text-slate-800 font-bold">{n.clienteVisitado}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedUbicacion({
                              url: n.urlUbicacion,
                              cliente: n.clienteVisitado,
                              notaId: n.contratoNotaId,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition cursor-pointer active:scale-95"
                          title="Ver coordenadas GPS"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Ver Mapa</span>
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.promesaPago === 'SI'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {n.promesaPago}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {n.notaTipoGestion}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>Mostrando {notasFiltradas.length} notas de cobranza</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition active:scale-95 shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL SECUNDARIO: NUEVA NOTA                             */}
      {/* ======================================================== */}
      {isNuevaNotaOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Registrar Nueva Nota de Cartera</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNuevaNotaOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevaNota} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Cliente / Persona Visitada:</label>
                <input
                  type="text"
                  placeholder="Nombre de la persona o distribuidora..."
                  value={nuevoClienteVisitado}
                  onChange={(e) => setNuevoClienteVisitado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tipo de Gestión:</label>
                  <select
                    value={nuevoTipoGestion}
                    onChange={(e) => setNuevoTipoGestion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="CDD">CDD - Cobranza Domiciliar DV</option>
                    <option value="CDC">CDC - Cobranza Domiciliar CF</option>
                    <option value="TEL">TEL - Gestión Telefónica</option>
                    <option value="OFI">OFI - Atención en Oficina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Promesa de Pago:</label>
                  <select
                    value={nuevaPromesaPago}
                    onChange={(e) => setNuevaPromesaPago(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="NO">NO</option>
                    <option value="SI">SÍ</option>
                  </select>
                </div>
              </div>

              {nuevaPromesaPago === 'SI' && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Monto Promesa de Pago ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 1500.00"
                    value={nuevaPromesaImporte}
                    onChange={(e) => setNuevaPromesaImporte(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-bold mb-1">Descripción de la Nota / Bitácora:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalla lo sucedido en la visita o llamada con la distribuidora..."
                  value={nuevaNotaTexto}
                  onChange={(e) => setNuevaNotaTexto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNuevaNotaOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer active:scale-95"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL SECUNDARIO: VER MAPA GPS                           */}
      {/* ======================================================== */}
      {selectedUbicacion && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Geolocalización GPS • Nota #{selectedUbicacion.notaId}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUbicacion(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Cliente Visitado</span>
                <strong className="text-slate-900 text-xs block">{selectedUbicacion.cliente}</strong>
                <span className="text-[11px] font-mono text-slate-600 block">
                  Coordenadas: 28.6515° N, 106.0825° W (Chihuahua, Chih.)
                </span>
              </div>

              {/* Simulación Visual de Mapa */}
              <div className="h-40 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                <MapPin className="w-8 h-8 text-rose-600 animate-bounce" />
                <span className="text-xs font-bold text-slate-700 mt-2 z-10">Ubicación Registrada en Sitio</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href={selectedUbicacion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en Google Maps</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedUbicacion(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );

  if (!isOpen || !mounted || !distribuidor) return null;

  return createPortal(modalContent, document.body);
}
