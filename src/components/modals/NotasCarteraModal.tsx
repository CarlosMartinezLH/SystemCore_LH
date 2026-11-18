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
    urlUbicacion: 'https://maps.google.com/?q=28.6514,-106.0822',
    promesaPago: 'NO',
    promesaFe: '01/01/1990 00:00:00',
    promesaImporte: '0.0000',
    notaTipoGestion: 'CDD',
  },
];

interface NotasCarteraModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribuidor: CarteraItem | null;
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

  // Submodal de Nueva Nota
  const [isNuevaNotaOpen, setIsNuevaNotaOpen] = useState(false);
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('');
  const [nuevoClienteVisitado, setNuevoClienteVisitado] = useState('');
  const [nuevoTipoGestion, setNuevoTipoGestion] = useState('CDD');
  const [nuevaPromesaPago, setNuevaPromesaPago] = useState<'SI' | 'NO'>('NO');
  const [nuevaPromesaFecha, setNuevaPromesaFecha] = useState('');
  const [nuevaPromesaMonto, setNuevaPromesaMonto] = useState('');

  // Submodal de Ubicación GPS
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<{
    notaId: number;
    cliente: string;
    fecha: string;
    coords: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!distribuidor) return;
    if (distribuidor.numeroDist === 9601 || distribuidor.nombreCompleto.includes('KAREN')) {
      setNotasList(DEFAULT_NOTAS_KAREN);
    } else {
      // Adaptar datos iniciales para el distribuidor seleccionado
      const adaptadas: NotaCarteraRecord[] = DEFAULT_NOTAS_KAREN.map((n, idx) => ({
        ...n,
        contratoNotaId: 680000 + (distribuidor.contratoId || 1000) + idx,
        contratoId: distribuidor.contratoId,
        distribuidorId: distribuidor.numeroDist,
        nombreDistribuid: distribuidor.nombreCompleto,
        coordinador: distribuidor.coordinador,
        sucursal: distribuidor.sucursal,
        clienteVisitado: idx % 2 === 0 ? distribuidor.nombreCompleto : `CLIENTE CF #${idx + 101}`,
      }));
      setNotasList(adaptadas);
    }
  }, [distribuidor]);

  if (!isOpen || !mounted || !distribuidor) return null;

  // Filtrado de Notas
  const notasFiltradas = notasList.filter((n) => {
    if (tipoFiltro !== '_TODOS' && n.notaTipoDesc !== tipoFiltro && n.notaTipoGestion !== tipoFiltro) {
      return false;
    }
    if (searchTexto.trim()) {
      const q = searchTexto.toLowerCase();
      const match =
        n.nota.toLowerCase().includes(q) ||
        n.clienteVisitado.toLowerCase().includes(q) ||
        n.nombreUsuario.toLowerCase().includes(q) ||
        n.notaTipoGestion.toLowerCase().includes(q) ||
        String(n.contratoNotaId).includes(q) ||
        n.fhRegistro.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Guardar Nueva Nota
  const handleGuardarNuevaNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNotaTexto.trim()) return;

    const hoy = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fhActual = `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()} ${pad(hoy.getHours())}:${pad(hoy.getMinutes())}:${pad(hoy.getSeconds())}`;

    const nueva: NotaCarteraRecord = {
      contratoNotaId: Math.floor(686000 + Math.random() * 9000),
      contratoId: distribuidor.contratoId,
      fhRegistro: fhActual,
      nota: nuevaNotaTexto.trim().toUpperCase(),
      notaTipoDesc: 'NOTA MI OFICINA VIRTUAL',
      nombreUsuario: currentUser?.name?.toUpperCase() || distribuidor.coordinador.toUpperCase(),
      distribuidorId: distribuidor.numeroDist,
      nombreDistribuid: distribuidor.nombreCompleto.toUpperCase(),
      coordinador: distribuidor.coordinador.toUpperCase(),
      sucursal: distribuidor.sucursal.toUpperCase(),
      clienteVisitado: (nuevoClienteVisitado || distribuidor.nombreCompleto).toUpperCase(),
      urlUbicacion: 'https://maps.google.com/?q=28.6514,-106.0822',
      promesaPago: nuevaPromesaPago,
      promesaFe: nuevaPromesaPago === 'SI' && nuevaPromesaFecha ? `${nuevaPromesaFecha} 00:00:00` : '01/01/1990 00:00:00',
      promesaImporte: nuevaPromesaPago === 'SI' && nuevaPromesaMonto ? Number(nuevaPromesaMonto).toFixed(4) : '0.0000',
      notaTipoGestion: nuevoTipoGestion,
    };

    setNotasList([nueva, ...notasList]);
    setIsNuevaNotaOpen(false);
    setNuevaNotaTexto('');
    setNuevoClienteVisitado('');
    setNuevaPromesaPago('NO');
    setNuevaPromesaFecha('');
    setNuevaPromesaMonto('');
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const dataExport = notasFiltradas.map((n) => ({
      'contrato Nota Id': n.contratoNotaId,
      'Contrato Id': n.contratoId,
      'FH Registro': n.fhRegistro,
      'Nota': n.nota,
      'nota Tipo Desc': n.notaTipoDesc,
      'nombre Usuario': n.nombreUsuario,
      'Distribuidor ID': n.distribuidorId,
      'nombre Distribuid': n.nombreDistribuid,
      'Coordinador': n.coordinador,
      'Sucursal': n.sucursal,
      'cliente Visitado': n.clienteVisitado,
      'urlUbicacion': n.urlUbicacion,
      'promesa Pago': n.promesaPago,
      'promesa Fe': n.promesaFe,
      'promesa Importe': n.promesaImporte,
      'nota Tipo Gestion': n.notaTipoGestion,
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notas_Cartera');
    XLSX.writeFile(wb, `notas_contrato_${distribuidor.contratoId}_DV_${distribuidor.numeroDist}.xlsx`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1350px] my-auto overflow-hidden border border-slate-300 flex flex-col max-h-[94vh]">
        {/* ======================================================== */}
        {/* BARRA SUPERIOR LEGADA DE CONTROL Y FILTROS               */}
        {/* ======================================================== */}
        <div className="bg-slate-100 border-b border-slate-300 p-3 sm:px-4 space-y-2.5 shrink-0">
          {/* Fila 1: Título y Controles de Fecha/Tipo/Acciones */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Título de Cabecera Oficial */}
            <div className="font-mono text-xs sm:text-sm font-bold text-slate-800">
              <span>ContratoId: </span>
              <strong className="text-slate-950 font-black">{distribuidor.contratoId}</strong>
              <span className="ml-3">Distribuidor: </span>
              <strong className="text-slate-950 font-black">
                {distribuidor.numeroDist} {distribuidor.nombreCompleto}
              </strong>
            </div>

            {/* Acciones y Cierre */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {}}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1"
                title="Actualizar listado de notas"
              >
                <RefreshCw className="w-3 h-3 text-blue-600" />
                <span>Actualizar</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1"
                title="Exportar notas a Excel"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Exportar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNuevaNotaOpen(true)}
                className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Nota</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer ml-1"
                title="Cerrar ventana de notas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fila 2: Filtros de Fecha Inicial, Fecha Final y Tipo */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-bold">Fecha Inicial:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-bold">Fecha Final:</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-bold">Tipo:</span>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-slate-800"
              >
                <option value="_TODOS">_TODOS</option>
                <option value="NOTA MI OFICINA VIRTUAL">NOTA MI OFICINA VIRTUAL</option>
                <option value="CDD">CDD (Cobranza Domiciliar DV)</option>
                <option value="CDC">CDC (Cobranza Domiciliar CF)</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Buscador Universal */}
          <div>
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Introduzca el texto a buscar..."
                value={searchTexto}
                onChange={(e) => setSearchTexto(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
              />
              {searchTexto && (
                <button
                  type="button"
                  onClick={() => setSearchTexto('')}
                  className="absolute right-2 top-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Agrupación Devexpress */}
        <div className="bg-slate-200/80 px-3 py-1 text-[11px] text-slate-500 italic border-b border-slate-300 select-none">
          Arrastre una columna aquí para agrupar por dicha columna
        </div>

        {/* ======================================================== */}
        {/* TABLA PRINCIPAL DE NOTAS DE COBRANZA / GESTIÓN           */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-auto bg-white min-h-[350px]">
          <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap font-mono">
            <thead className="sticky top-0 bg-slate-200 text-slate-800 font-bold border-b border-slate-300 text-[10px] uppercase select-none z-10 shadow-2xs">
              <tr>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-center">contrato Nota Id</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-center">Contrato Id</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-center">FH Registro</th>
                <th className="p-1.5 px-3 border-r border-slate-300 min-w-[280px]">Nota</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300">nota Tipo Desc</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300">nombre Usuario</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-center">Distribuidor ID</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300">nombre Distribuid</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300">Coordinador</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300">Sucursal</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300">cliente Visitado</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-center">urlUbicacion</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-center">promesa Pago</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-center">promesa Fe</th>
                <th className="p-1.5 px-2.5 border-r border-slate-300 text-right">promesa Importe</th>
                <th className="p-1.5 px-2.5 text-center">nota Tipo Gestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {notasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={16} className="p-8 text-center text-slate-400 italic font-sans">
                    No se encontraron notas registradas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                notasFiltradas.map((n, idx) => (
                  <tr
                    key={n.contratoNotaId}
                    className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                  >
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-center text-slate-600 font-bold">
                      {n.contratoNotaId}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-center text-slate-700">
                      {n.contratoId}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-center text-slate-600 text-[10px]">
                      {n.fhRegistro}
                    </td>
                    <td className="p-1.5 px-3 border-r border-slate-200 text-slate-900 font-sans font-bold whitespace-normal min-w-[280px]">
                      {n.nota}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-slate-700 text-[10px]">
                      {n.notaTipoDesc}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-slate-800">
                      {n.nombreUsuario}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-center font-bold text-blue-700">
                      {n.distribuidorId}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 font-sans font-bold text-slate-900">
                      {n.nombreDistribuid}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-slate-700">
                      {n.coordinador}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-slate-700">
                      {n.sucursal}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 font-sans text-slate-900 font-medium">
                      {n.clienteVisitado}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setUbicacionSeleccionada({
                            notaId: n.contratoNotaId,
                            cliente: n.clienteVisitado,
                            fecha: n.fhRegistro,
                            coords: n.urlUbicacion,
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer hover:bg-blue-50 px-1 rounded transition"
                      >
                        Ver
                      </button>
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-center font-bold">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          n.promesaPago === 'SI' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {n.promesaPago}
                      </span>
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-center text-slate-500 text-[10px]">
                      {n.promesaFe}
                    </td>
                    <td className="p-1.5 px-2.5 border-r border-slate-200 text-right font-mono text-slate-700">
                      {n.promesaImporte}
                    </td>
                    <td className="p-1.5 px-2.5 text-center font-bold">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800">
                        {n.notaTipoGestion}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Estado */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="font-mono text-[11px]">
            <span>Total de notas mostradas: </span>
            <strong className="text-slate-900">{notasFiltradas.length}</strong>
            <span className="text-slate-400 ml-2">| Core LanAhora v1.16</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer transition active:scale-95 shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBMODAL: NUEVA NOTA DE COBRANZA / GESTIÓN               */}
      {/* ======================================================== */}
      {isNuevaNotaOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in zoom-in-95 duration-100">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Registrar Nueva Nota de Gestión</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNuevaNotaOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevaNota} className="p-5 space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 font-bold">CONTRATO: </span>
                  <strong className="text-slate-900">#{distribuidor.contratoId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">DISTRIBUIDOR: </span>
                  <strong className="text-slate-900">
                    {distribuidor.numeroDist} - {distribuidor.nombreCompleto}
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Texto de la Nota *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla acuerdos, visitas de campo, avisos dejados o promesas..."
                  value={nuevaNotaTexto}
                  onChange={(e) => setNuevaNotaTexto(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cliente / Persona Visitada</label>
                  <input
                    type="text"
                    placeholder={`ej. ${distribuidor.nombreCompleto}`}
                    value={nuevoClienteVisitado}
                    onChange={(e) => setNuevoClienteVisitado(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Gestión</label>
                  <select
                    value={nuevoTipoGestion}
                    onChange={(e) => setNuevoTipoGestion(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="CDD">CDD - Cobranza Domiciliar DV</option>
                    <option value="CDC">CDC - Cobranza Domiciliar CF</option>
                    <option value="GT">GT - Gestión Telefónica</option>
                    <option value="MOV">MOV - Mi Oficina Virtual</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">¿Hubo Promesa de Pago?</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="promesa"
                        value="NO"
                        checked={nuevaPromesaPago === 'NO'}
                        onChange={() => setNuevaPromesaPago('NO')}
                      />
                      <span>NO</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-bold text-emerald-700">
                      <input
                        type="radio"
                        name="promesa"
                        value="SI"
                        checked={nuevaPromesaPago === 'SI'}
                        onChange={() => setNuevaPromesaPago('SI')}
                      />
                      <span>SÍ</span>
                    </label>
                  </div>
                </div>

                {nuevaPromesaPago === 'SI' && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 animate-in fade-in">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">Fecha Promesa</label>
                      <input
                        type="date"
                        required={nuevaPromesaPago === 'SI'}
                        value={nuevaPromesaFecha}
                        onChange={(e) => setNuevaPromesaFecha(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">Monto Promesa ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required={nuevaPromesaPago === 'SI'}
                        value={nuevaPromesaMonto}
                        onChange={(e) => setNuevaPromesaMonto(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNuevaNotaOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs active:scale-95"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBMODAL: VISOR DE UBICACIÓN GPS                         */}
      {/* ======================================================== */}
      {ubicacionSeleccionada && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in zoom-in-95 duration-100">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Geolocalización de Visita</span>
              </h3>
              <button
                type="button"
                onClick={() => setUbicacionSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400">Nota Folio: </span>
                  <strong className="text-slate-900">#{ubicacionSeleccionada.notaId}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Cliente: </span>
                  <strong className="text-slate-900">{ubicacionSeleccionada.cliente}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Registro: </span>
                  <span className="text-slate-700">{ubicacionSeleccionada.fecha}</span>
                </div>
                <div className="pt-1 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Coordenadas GPS validadas por App Móvil</span>
                </div>
              </div>

              <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-500 border border-dashed border-slate-300">
                <MapPin className="w-8 h-8 text-rose-500 mx-auto mb-1 animate-bounce" />
                <span className="text-[11px] font-bold block text-slate-700">Chihuahua, Chih.</span>
                <span className="text-[10px] font-mono text-slate-400">Lat: 28.6514, Lng: -106.0822</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <a
                  href={ubicacionSeleccionada.coords}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Google Maps</span>
                </a>
                <button
                  type="button"
                  onClick={() => setUbicacionSeleccionada(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
