'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Search,
  RefreshCw,
  Eye,
  X,
  CreditCard,
  User,
  Check,
  FileSpreadsheet,
  FileText,
  Globe,
  Server,
  Activity,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Zap,
  Boxes,
  SlidersHorizontal,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  XCircle,
  ShoppingBag,
  Printer,
  Hash,
  Phone,
} from 'lucide-react';
import { LanaTiendaPedido, LanaTiendaEstatusPedido } from '@/types/tienda';
import { ProveedorApiConfig, OrdenProveedorDispatch } from '@/types/proveedores';
import { INITIAL_PEDIDOS } from '@/lib/data/tiendaData';
import { buildSafeCsv } from '@/lib/utils/csv';
import { formatMoney } from '@/lib/utils/formatters';

function getAuthHeaders(): HeadersInit {
  try {
    const raw =
      typeof window !== 'undefined'
        ? localStorage.getItem('lanahora_user_session_v2') ||
          localStorage.getItem('lanahora_user_session')
        : null;
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        };
      }
    }
  } catch (e) {}
  return { 'Content-Type': 'application/json' };
}

export default function LanaTiendaAdminView() {
  // Main Tab Navigation: Operaciones (repCompras) vs Catálogos / Proveedores API
  const [activeTab, setActiveTab] = useState<'REPORTE_COMPRAS' | 'PROVEEDORES'>('REPORTE_COMPRAS');

  // Pedidos State
  const [pedidos, setPedidos] = useState<LanaTiendaPedido[]>(INITIAL_PEDIDOS);
  const [loading, setLoading] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<LanaTiendaPedido | null>(INITIAL_PEDIDOS[0] || null);

  // Date Range Filters (From repCompras.aspx)
  const [fechaInicio, setFechaInicio] = useState('2026-11-01');
  const [fechaFin, setFechaFin] = useState('2026-11-30');

  // Search & Column Filters
  const [search, setSearch] = useState('');
  const [filterSucursal, setFilterSucursal] = useState('TODAS');
  const [filterEstatus, setFilterEstatus] = useState('TODOS');
  const [filterCoordinador, setFilterCoordinador] = useState('TODOS');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals for Top Actions (repCompras.aspx)
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [modalRastreoOpen, setModalRastreoOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [modalIncidenciaOpen, setModalIncidenciaOpen] = useState(false);

  // Status update modal internal state
  const [nuevoEstatus, setNuevoEstatus] = useState<LanaTiendaEstatusPedido>('EN_TRANSITO');
  const [nuevaGuia, setNuevaGuia] = useState('');
  const [nuevaPaqueteria, setNuevaPaqueteria] = useState('FedEx Express');
  const [motivoCancelacion, setMotivoCancelacion] = useState('Cancelación solicitada por distribuidora');

  // Incidencia internal state
  const [tipoIncidencia, setTipoIncidencia] = useState('Empaque con daño físico / golpe');
  const [detalleIncidencia, setDetalleIncidencia] = useState('');

  // Proveedores State
  const [proveedores, setProveedores] = useState<ProveedorApiConfig[]>([]);
  const [dispatches, setDispatches] = useState<OrdenProveedorDispatch[]>([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    tipo: 'success' | 'error';
    texto: string;
  } | null>(null);

  // Fetch from API on mount
  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tienda/pedidos');
      const data = await res.json();
      if (data.success && data.pedidos && data.pedidos.length > 0) {
        setPedidos(data.pedidos);
        if (!selectedPedido) setSelectedPedido(data.pedidos[0]);
      }
    } catch (err) {
      console.log('Error fetching pedidos, using local dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProveedores = async () => {
    setLoadingProveedores(true);
    try {
      const res = await fetch('/api/tienda/proveedores', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        if (data.proveedores) setProveedores(data.proveedores);
        if (data.dispatches) setDispatches(data.dispatches);
      }
    } catch (err) {
      console.log('Error fetching proveedores:', err);
    } finally {
      setLoadingProveedores(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchProveedores();
  }, []);

  // Sync selectedPedido details when opening modals
  useEffect(() => {
    if (selectedPedido) {
      setNuevoEstatus(selectedPedido.estatus);
      setNuevaGuia(selectedPedido.guiaEnvio || '');
      setNuevaPaqueteria(selectedPedido.paqueteria || 'FedEx Express');
    }
  }, [selectedPedido]);

  // Unique Sucursales & Coordinadores for filter dropdowns
  const sucursalesList = useMemo(() => {
    const set = new Set<string>();
    pedidos.forEach((p) => {
      if (p.sucursal) set.add(p.sucursal);
    });
    return Array.from(set).sort();
  }, [pedidos]);

  const coordinadoresList = useMemo(() => {
    const set = new Set<string>();
    pedidos.forEach((p) => {
      if (p.coordinador) set.add(p.coordinador);
    });
    return Array.from(set).sort();
  }, [pedidos]);

  // Filtered List
  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      // Date filter
      if (p.fecha) {
        const pDate = p.fecha.slice(0, 10);
        if (fechaInicio && pDate < fechaInicio) return false;
        if (fechaFin && pDate > fechaFin) return false;
      }
      // Sucursal filter
      if (filterSucursal !== 'TODAS' && p.sucursal !== filterSucursal) return false;
      // Coordinador filter
      if (filterCoordinador !== 'TODOS' && p.coordinador !== filterCoordinador) return false;
      // Estatus filter
      if (filterEstatus !== 'TODOS' && p.estatus !== filterEstatus) return false;

      // Text omnibar search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchFolio = p.folio?.toLowerCase().includes(q);
        const matchOrden = p.ordenInterna?.toLowerCase().includes(q);
        const matchCustomerOrder = p.customerOrderNumber?.toLowerCase().includes(q);
        const matchDist = p.distribuidoraNombre?.toLowerCase().includes(q) || p.distribuidoraId?.includes(q);
        const matchCliente = p.clienteNombre?.toLowerCase().includes(q) || p.personaId?.includes(q);
        const matchProd = p.producto?.nombre?.toLowerCase().includes(q) || p.producto?.sku?.toLowerCase().includes(q);
        const matchSuc = p.sucursal?.toLowerCase().includes(q);
        const matchGuia = p.guiaEnvio?.toLowerCase().includes(q);
        return matchFolio || matchOrden || matchCustomerOrder || matchDist || matchCliente || matchProd || matchSuc || matchGuia;
      }
      return true;
    });
  }, [pedidos, fechaInicio, fechaFin, filterSucursal, filterCoordinador, filterEstatus, search]);

  // Pagination calculation
  const totalItems = filteredPedidos.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPedidos.slice(start, start + pageSize);
  }, [filteredPedidos, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSucursal, filterCoordinador, filterEstatus, fechaInicio, fechaFin]);

  // KPIs
  const totalVentas = useMemo(() => {
    return filteredPedidos.reduce((acc, p) => acc + (p.producto?.precio || 0) * (p.producto?.cantidad || 1), 0);
  }, [filteredPedidos]);

  const pendientesMesa = useMemo(
    () => filteredPedidos.filter((p) => p.estatus === 'PENDIENTE' || p.estatus === 'APROBADO_MESA').length,
    [filteredPedidos]
  );
  const enTransitoCount = useMemo(
    () => filteredPedidos.filter((p) => p.estatus === 'EN_TRANSITO').length,
    [filteredPedidos]
  );
  const entregadosCount = useMemo(
    () => filteredPedidos.filter((p) => p.estatus === 'ENTREGADO' || p.estatus === 'LISTO_SUCURSAL').length,
    [filteredPedidos]
  );

  // Status Badge Helper
  const renderStatusBadge = (estatus: LanaTiendaEstatusPedido) => {
    switch (estatus) {
      case 'PENDIENTE':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600" /> Pendiente Mesa
          </span>
        );
      case 'APROBADO_MESA':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
            <Check className="w-3 h-3 text-blue-600" /> Aprobado Mesa
          </span>
        );
      case 'EN_TRANSITO':
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
            <Truck className="w-3 h-3 text-purple-600" /> En Tránsito
          </span>
        );
      case 'LISTO_SUCURSAL':
        return (
          <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
            <Building2 className="w-3 h-3 text-indigo-600" /> Listo en Sucursal
          </span>
        );
      case 'ENTREGADO':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Entregado
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
            <X className="w-3 h-3 text-rose-600" /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  // Actions
  const handleUpdateStatus = async () => {
    if (!selectedPedido) return;
    try {
      const res = await fetch(`/api/tienda/pedidos/${selectedPedido.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          estatus: nuevoEstatus,
          guiaEnvio: nuevaGuia || undefined,
          paqueteria: nuevaPaqueteria || undefined,
        }),
      });
      const data = await res.json();
      const updated = data.success && data.pedido ? data.pedido : {
        ...selectedPedido,
        estatus: nuevoEstatus,
        guiaEnvio: nuevaGuia || selectedPedido.guiaEnvio,
        paqueteria: nuevaPaqueteria || selectedPedido.paqueteria,
      };

      setPedidos((prev) =>
        prev.map((p) => (p.id === selectedPedido.id ? updated : p))
      );
      setSelectedPedido(updated);
      setModalStatusOpen(false);
      setFeedbackMessage({
        tipo: 'success',
        texto: `✓ Estatus de la orden ${selectedPedido.ordenInterna || selectedPedido.folio} actualizado a ${nuevoEstatus}.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ tipo: 'error', texto: `Error al actualizar: ${err.message}` });
    }
  };

  const handleCancelarOrden = async () => {
    if (!selectedPedido) return;
    try {
      const res = await fetch(`/api/tienda/pedidos/${selectedPedido.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          estatus: 'CANCELADO',
          notas: `Cancelación: ${motivoCancelacion}`,
        }),
      });
      const data = await res.json();
      const updated = data.success && data.pedido ? data.pedido : {
        ...selectedPedido,
        estatus: 'CANCELADO' as LanaTiendaEstatusPedido,
        notas: `Cancelación: ${motivoCancelacion}`,
      };

      setPedidos((prev) =>
        prev.map((p) => (p.id === selectedPedido.id ? updated : p))
      );
      setSelectedPedido(updated);
      setModalCancelarOpen(false);
      setFeedbackMessage({
        tipo: 'success',
        texto: `✓ Orden ${selectedPedido.ordenInterna || selectedPedido.folio} cancelada. Saldo de ${formatMoney(selectedPedido.producto?.precio || 0)} liberado en la línea LanaTienda de la distribuidora.`,
      });
    } catch (err: any) {
      setFeedbackMessage({ tipo: 'error', texto: `Error al cancelar: ${err.message}` });
    }
  };

  const handleRegistrarIncidencia = () => {
    if (!selectedPedido) return;
    const folioInc = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
    const updated = {
      ...selectedPedido,
      incidencia: {
        folio: folioInc,
        fecha: new Date().toISOString(),
        motivo: `${tipoIncidencia}: ${detalleIncidencia || 'Reporte levantado por mesa de control'}`,
        estatus: 'ABIERTA' as const,
      },
    };
    setPedidos((prev) => prev.map((p) => (p.id === selectedPedido.id ? updated : p)));
    setSelectedPedido(updated);
    setModalIncidenciaOpen(false);
    setDetalleIncidencia('');
    setFeedbackMessage({
      tipo: 'success',
      texto: `✓ Incidencia registrada con folio ${folioInc} para la orden ${selectedPedido.ordenInterna || selectedPedido.folio}. Garantía 48 hrs activada.`,
    });
  };

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = [
      'Sucursal',
      'Coordinador',
      'Orden',
      'CustomerOrderNumber',
      'No. Distribuidor',
      'Nombre Distribuidor',
      'Persona ID',
      'Nombre Cliente',
      'Dirección Cliente',
      'Dirección Entrega',
      'Producto',
      'SKU',
      'Monto Total',
      '16 Quincenas',
      'Estatus',
      'Paquetería',
      'Guía Envío',
      'Fecha',
    ];
    const rows = filteredPedidos.map((p) => [
      p.sucursal || 'SALTILLO',
      p.coordinador || 'MESA CENTRAL',
      p.ordenInterna || p.folio,
      p.customerOrderNumber || p.folio,
      p.distribuidoraId,
      p.distribuidoraNombre,
      p.personaId || p.clienteId,
      p.clienteNombre,
      p.direccionCliente || p.direccionEntrega,
      p.direccionEntrega,
      p.producto?.nombre,
      p.producto?.sku,
      p.producto?.precio,
      p.producto?.pagoQuincenal,
      p.estatus,
      p.paqueteria || 'N/A',
      p.guiaEnvio || 'N/A',
      p.fecha ? p.fecha.slice(0, 10) : '2026-11-01',
    ]);
    const csvContent = buildSafeCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `repCompras_LanaTienda_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Ping API Proveedor
  const handleTestConnection = async (proveedorId: string, nombre: string) => {
    setActionLoadingId(`test-${proveedorId}`);
    try {
      const res = await fetch('/api/tienda/proveedores', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'test-connection', proveedorId }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setFeedbackMessage({
          tipo: 'success',
          texto: `✓ Ping exitoso con ${nombre}: ${data.result.message} (${data.result.latencyMs} ms). Estado: Activo.`,
        });
        fetchProveedores();
      }
    } catch (err: any) {
      setFeedbackMessage({ tipo: 'error', texto: `Error al probar ${nombre}: ${err.message}` });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4 bg-slate-50 text-slate-800">
      {/* 1. HEADER INSTITUCIONAL DEL MÓDULO */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              LanaTienda <span className="text-blue-600">·</span> Reporte Operativo de Compras
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión institucional de órdenes a 16 quincenas, tracking de paqueterías, mesa de control y garantías
          </p>
        </div>

        {/* User Context & Environment Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Operador Activo</span>
            <span className="text-xs font-bold text-slate-800">JOSE CARLOS MARTINEZ MAYORGA</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          {/* Segmented Selector: Reporte Compras vs Proveedores Dropshipping */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('REPORTE_COMPRAS')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'REPORTE_COMPRAS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>repCompras</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'REPORTE_COMPRAS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {filteredPedidos.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('PROVEEDORES')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'PROVEEDORES'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Catálogos & APIs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'PROVEEDORES' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {proveedores.length || 3}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 border ${
            feedbackMessage.tipo === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.tipo === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.texto}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 1: REPORTE DE COMPRAS (repCompras.aspx REPLICA SEGÚN DISEÑO SYSTEMCORE) */}
      {activeTab === 'REPORTE_COMPRAS' && (
        <div className="space-y-4">
          {/* 2. BARRA DE FECHAS Y BOTONES DE ACCIÓN (Exactos de repCompras.aspx) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Date Pickers: Fecha inicial & Fecha final */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-600">Fecha inicial:</span>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-600">Fecha final:</span>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Botonera de Acción Oficial (repCompras.aspx) */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Actualizar */}
                <button
                  type="button"
                  onClick={fetchPedidos}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Actualizar datos del servidor"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>

                {/* 2. Exportar */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Exportar archivo CSV / Excel oficial"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar</span>
                </button>

                {/* 3. Venta Detalle */}
                <button
                  type="button"
                  onClick={() => setModalDetalleOpen(true)}
                  disabled={!selectedPedido}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Ver detalle de la venta seleccionada"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Venta Detalle</span>
                </button>

                {/* 4. Venta Status */}
                <button
                  type="button"
                  onClick={() => setModalStatusOpen(true)}
                  disabled={!selectedPedido}
                  className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Cambiar estatus de la orden seleccionada"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Venta Status</span>
                </button>

                {/* 5. Rastrear */}
                <button
                  type="button"
                  onClick={() => setModalRastreoOpen(true)}
                  disabled={!selectedPedido}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Rastreo de guía en tiempo real"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Rastrear</span>
                </button>

                {/* 6. Cancelar */}
                <button
                  type="button"
                  onClick={() => setModalCancelarOpen(true)}
                  disabled={!selectedPedido || selectedPedido.estatus === 'CANCELADO'}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Cancelar orden y restituir saldo a distribuidora"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>

                {/* 7. Incidencias */}
                <button
                  type="button"
                  onClick={() => setModalIncidenciaOpen(true)}
                  disabled={!selectedPedido}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Reportes de garantía oficial 48 horas"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Incidencias</span>
                </button>

                {/* 8. Catálogos */}
                <button
                  type="button"
                  onClick={() => setActiveTab('PROVEEDORES')}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Ver catálogos de proveedores y reglas de precio"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Catálogos</span>
                </button>
              </div>
            </div>

            {/* Quick Filters & Omnibar Search */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search Omnibar */}
                <div className="relative min-w-[260px] max-w-md flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Introduzca el texto a buscar (Orden, Distribuidor, Cliente, Sucursal)..."
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                {/* Sucursal Dropdown */}
                <select
                  value={filterSucursal}
                  onChange={(e) => setFilterSucursal(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas las Sucursales</option>
                  {sucursalesList.map((suc) => (
                    <option key={suc} value={suc}>{suc}</option>
                  ))}
                </select>

                {/* Coordinador Dropdown */}
                <select
                  value={filterCoordinador}
                  onChange={(e) => setFilterCoordinador(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none max-w-[220px] truncate cursor-pointer"
                >
                  <option value="TODOS">Todos los Coordinadores</option>
                  {coordinadoresList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Estatus Dropdown */}
                <select
                  value={filterEstatus}
                  onChange={(e) => setFilterEstatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Estatus</option>
                  <option value="PENDIENTE">Pendientes Mesa</option>
                  <option value="APROBADO_MESA">Aprobados Mesa</option>
                  <option value="EN_TRANSITO">En Tránsito</option>
                  <option value="LISTO_SUCURSAL">Listos en Sucursal</option>
                  <option value="ENTREGADO">Entregados</option>
                  <option value="CANCELADO">Cancelados</option>
                </select>
              </div>

              {/* Registro count badge */}
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Reg: <span className="text-slate-900 font-black">{totalItems}</span> órdenes
              </div>
            </div>
          </div>

          {/* 3. KPI CARDS (Diseño Moderno SystemCore) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Colocación LanaTienda
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {formatMoney(totalVentas)}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">16 quincenas fijas autorizadas</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pendientes de Mesa
                </span>
                <div className="text-xl font-black text-amber-600 mt-0.5">
                  {pendientesMesa} Pedidos
                </div>
                <span className="text-[10px] text-slate-500">Por validar contra cupo disponible</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  En Ruta / Tránsito
                </span>
                <div className="text-xl font-black text-purple-600 mt-0.5">
                  {enTransitoCount} Envíos
                </div>
                <span className="text-[10px] text-slate-500">Con guía de paquetería activa</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Entregados / Sucursal
                </span>
                <div className="text-xl font-black text-blue-600 mt-0.5">
                  {entregadosCount} Órdenes
                </div>
                <span className="text-[10px] text-slate-500">Retirados o en sucursal matriz</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 4. TABLA INTERACTIVA DE COMPRAS (COLUMNAS EXACTAS DE repCompras.aspx) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-black select-none border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-10">Sel</th>
                    <th className="py-3 px-3.5 font-bold">Sucursal</th>
                    <th className="py-3 px-3.5 font-bold">Coordinador</th>
                    <th className="py-3 px-3.5 font-bold">Orden</th>
                    <th className="py-3 px-3.5 font-bold">CustomerOrderNumber</th>
                    <th className="py-3 px-3.5 font-bold text-center">Distribuidor</th>
                    <th className="py-3 px-3.5 font-bold">Nombre Distribuidor</th>
                    <th className="py-3 px-3.5 font-bold text-center">Persona ID</th>
                    <th className="py-3 px-3.5 font-bold">Nombre Cliente</th>
                    <th className="py-3 px-3.5 font-bold">Dirección Cliente</th>
                    <th className="py-3 px-3.5 font-bold">Dirección Entrega</th>
                    <th className="py-3 px-3.5 font-bold">Artículo</th>
                    <th className="py-3 px-3.5 font-bold text-right">Monto Total</th>
                    <th className="py-3 px-3.5 font-bold text-center">Estatus</th>
                    <th className="py-3 px-3.5 font-bold">Guía / Envío</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {paginatedPedidos.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-12 text-center text-slate-400">
                        No se encontraron registros de compras que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    paginatedPedidos.map((pedido) => {
                      const isSelected = selectedPedido?.id === pedido.id;
                      return (
                        <tr
                          key={pedido.id}
                          onClick={() => setSelectedPedido(pedido)}
                          className={`cursor-pointer transition select-none ${
                            isSelected
                              ? 'bg-blue-600 text-white font-medium hover:bg-blue-700'
                              : 'hover:bg-slate-50/80 text-slate-800'
                          }`}
                        >
                          {/* Radio Selector */}
                          <td className="py-2.5 px-3.5 text-center">
                            <input
                              type="radio"
                              name="selectedRow"
                              checked={isSelected}
                              onChange={() => setSelectedPedido(pedido)}
                              className="accent-amber-400 w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>

                          {/* 1. Sucursal */}
                          <td className="py-2.5 px-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                isSelected
                                  ? 'bg-white/20 text-white border border-white/30'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {pedido.sucursal || 'SALTILLO'}
                            </span>
                          </td>

                          {/* 2. Coordinador */}
                          <td className="py-2.5 px-3.5 font-semibold text-[11px] truncate max-w-[180px]">
                            {pedido.coordinador || 'MESA CENTRAL'}
                          </td>

                          {/* 3. Orden (Folio interno) */}
                          <td className="py-2.5 px-3.5 font-mono font-bold">
                            <span className={isSelected ? 'text-amber-300' : 'text-blue-700'}>
                              {pedido.ordenInterna || pedido.folio}
                            </span>
                          </td>

                          {/* 4. CustomerOrderNumber */}
                          <td className="py-2.5 px-3.5 font-mono text-[11px] opacity-90">
                            {pedido.customerOrderNumber || pedido.folio}
                          </td>

                          {/* 5. Distribuidor ID */}
                          <td className="py-2.5 px-3.5 font-mono text-center font-bold">
                            {pedido.distribuidoraId}
                          </td>

                          {/* 6. Nombre Distribuidor */}
                          <td className="py-2.5 px-3.5 font-bold truncate max-w-[200px]">
                            {pedido.distribuidoraNombre}
                          </td>

                          {/* 7. Persona ID */}
                          <td className="py-2.5 px-3.5 font-mono text-center opacity-85">
                            {pedido.personaId || pedido.clienteId}
                          </td>

                          {/* 8. Nombre Cliente */}
                          <td className="py-2.5 px-3.5 font-bold truncate max-w-[200px]">
                            {pedido.clienteNombre}
                          </td>

                          {/* 9. Dirección Cliente */}
                          <td className="py-2.5 px-3.5 text-[11px] truncate max-w-[220px] opacity-80" title={pedido.direccionCliente}>
                            {pedido.direccionCliente || pedido.direccionEntrega}
                          </td>

                          {/* 10. Dirección Entrega */}
                          <td className="py-2.5 px-3.5 text-[11px] truncate max-w-[220px] opacity-80" title={pedido.direccionEntrega}>
                            {pedido.direccionEntrega}
                          </td>

                          {/* 11. Artículo */}
                          <td className="py-2.5 px-3.5 font-medium truncate max-w-[180px]" title={pedido.producto?.nombre}>
                            {pedido.producto?.nombre}
                          </td>

                          {/* 12. Monto Total */}
                          <td className="py-2.5 px-3.5 text-right font-mono font-black text-xs">
                            <div className={isSelected ? 'text-white' : 'text-slate-900'}>
                              {formatMoney(pedido.producto?.precio || 0)}
                            </div>
                            <div className={`text-[10px] font-semibold ${isSelected ? 'text-amber-300' : 'text-blue-600'}`}>
                              16Q de {formatMoney(pedido.producto?.pagoQuincenal || 0)}
                            </div>
                          </td>

                          {/* 13. Estatus */}
                          <td className="py-2.5 px-3.5 text-center">
                            {renderStatusBadge(pedido.estatus)}
                          </td>

                          {/* 14. Guía / Paquetería */}
                          <td className="py-2.5 px-3.5 font-mono text-[11px]">
                            {pedido.guiaEnvio ? (
                              <div className="flex items-center gap-1.5">
                                <span className={isSelected ? 'text-amber-300' : 'text-purple-700 font-bold'}>
                                  {pedido.guiaEnvio}
                                </span>
                                <span className="opacity-75 text-[10px]">({pedido.paqueteria?.split(' ')[0] || 'FedEx'})</span>
                              </div>
                            ) : (
                              <span className="opacity-50 text-[10px]">Sin asignar</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Status Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 font-semibold">
                Reg: <span className="text-slate-900 font-black">{totalItems}</span> | Página <span className="text-slate-900 font-bold">{currentPage}</span> de <span className="text-slate-900 font-bold">{totalPages}</span> ({pageSize} por página)
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-bold text-xs transition cursor-pointer"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentPage === num
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'border border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-bold text-xs transition cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CATÁLOGOS & APIS PROVEEDORES DROPSHIPPING */}
      {activeTab === 'PROVEEDORES' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Integraciones API Dropshipping Activas</span>
              </h2>
              <p className="text-xs text-slate-500">
                Sincronización en tiempo real de inventarios, órdenes de compra automáticas y guías de rastreo
              </p>
            </div>
            <button
              onClick={fetchProveedores}
              disabled={loadingProveedores}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProveedores ? 'animate-spin' : ''}`} />
              <span>Verificar Conexiones</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Syscom México */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Electrónica & Climas
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Activo
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-2">Syscom México API</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Minisplits Mirage, Bocinas Amazon Alexa, Smart TV y conectividad. Despacho directo desde CEDIS.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">Latencia: ~34 ms</span>
                <button
                  onClick={() => handleTestConnection('syscom', 'Syscom México')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Probar Ping
                </button>
              </div>
            </div>

            {/* 2. Mueblería Central */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Hogar & Llantas
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Activo
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-2">Mueblería Central Dropshipping</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Llantas ZMAX, Pinos navideños decorados, salas y línea blanca. Envíos consolidados a Saltillo.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">Latencia: ~48 ms</span>
                <button
                  onClick={() => handleTestConnection('muebleria-central', 'Mueblería Central')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Probar Ping
                </button>
              </div>
            </div>

            {/* 3. Ingram Micro México */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    Cómputo & Gadgets
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Activo
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-2">Ingram Micro México</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Laptops Acer Aspire, Tablets GHIA, Celulares Samsung Galaxy y periféricos HP.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">Latencia: ~28 ms</span>
                <button
                  onClick={() => handleTestConnection('ingram', 'Ingram Micro')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Probar Ping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VENTA DETALLE (repCompras) */}
      {/* ========================================================================= */}
      {modalDetalleOpen && selectedPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wide">
                    Detalle Operativo de Venta · Orden #{selectedPedido.ordenInterna || selectedPedido.folio}
                  </h3>
                  <p className="text-[11px] text-slate-400">CustomerOrderNumber: {selectedPedido.customerOrderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setModalDetalleOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Product Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={selectedPedido.producto?.imagen}
                  alt={selectedPedido.producto?.nombre}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      SKU: {selectedPedido.producto?.sku}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">16 Quincenas Fijas</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{selectedPedido.producto?.nombre}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Venta</span>
                      <span className="font-black text-slate-900 text-sm">{formatMoney(selectedPedido.producto?.precio || 0)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pago Quincenal</span>
                      <span className="font-black text-emerald-700 text-sm">16 de {formatMoney(selectedPedido.producto?.pagoQuincenal || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Datos Operativos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Distribuidora */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Distribuidora Acreditada</span>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedPedido.distribuidoraNombre}</div>
                  <div className="text-slate-600">ID / No. DV: <strong className="font-mono text-blue-700">{selectedPedido.distribuidoraId}</strong></div>
                  <div className="text-slate-600">Sucursal de Adscripción: <strong>{selectedPedido.sucursal || 'SALTILLO'}</strong></div>
                  <div className="text-slate-600">Coordinador: <strong>{selectedPedido.coordinador || 'MESA CENTRAL'}</strong></div>
                </div>

                {/* Cliente */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Cliente Solicitante</span>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedPedido.clienteNombre}</div>
                  <div className="text-slate-600">Persona ID: <strong className="font-mono text-blue-700">{selectedPedido.personaId || selectedPedido.clienteId}</strong></div>
                  <div className="text-slate-600">Teléfono: <strong>{selectedPedido.telefonoContacto}</strong></div>
                  <div className="text-slate-600 truncate" title={selectedPedido.direccionCliente}>
                    Dirección: <strong>{selectedPedido.direccionCliente}</strong>
                  </div>
                </div>
              </div>

              {/* Entrega y Paquetería */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Modalidad de Envío</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {selectedPedido.tipoEntrega === 'SUCURSAL' ? '🏢 Recoger en Sucursal Oficial' : '🚚 Entrega a Domicilio'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-mono">Guía: {selectedPedido.guiaEnvio || 'Pendiente de asignación'}</span>
                </div>
                <div className="text-slate-600">Dirección de Destino: <strong>{selectedPedido.direccionEntrega}</strong></div>
                {selectedPedido.referenciasDomicilio && (
                  <div className="text-slate-500 text-[11px]">Referencias: {selectedPedido.referenciasDomicilio}</div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-500 text-xs">Estatus actual: {renderStatusBadge(selectedPedido.estatus)}</span>
              <button
                onClick={() => setModalDetalleOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VENTA STATUS (repCompras) */}
      {/* ========================================================================= */}
      {modalStatusOpen && selectedPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Actualizar Estatus de Venta</h3>
              </div>
              <button onClick={() => setModalStatusOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Orden seleccionada:</span>
                <div className="font-black text-slate-900 text-sm">#{selectedPedido.ordenInterna || selectedPedido.folio}</div>
                <div className="text-slate-500 mt-0.5">{selectedPedido.clienteNombre}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nuevo Estatus Operativo</label>
                <select
                  value={nuevoEstatus}
                  onChange={(e) => setNuevoEstatus(e.target.value as LanaTiendaEstatusPedido)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="PENDIENTE">PENDIENTE (Revisión Mesa)</option>
                  <option value="APROBADO_MESA">APROBADO_MESA (Autorizado contra línea)</option>
                  <option value="EN_TRANSITO">EN_TRANSITO (Despachado con guía)</option>
                  <option value="LISTO_SUCURSAL">LISTO_SUCURSAL (En sucursal matriz)</option>
                  <option value="ENTREGADO">ENTREGADO (Recibido por cliente)</option>
                  <option value="CANCELADO">CANCELADO (Revertir saldo)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paquetería</label>
                <select
                  value={nuevaPaqueteria}
                  onChange={(e) => setNuevaPaqueteria(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="FedEx Express">FedEx Express</option>
                  <option value="Estafeta Mexicana">Estafeta Mexicana</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Redpack">Redpack</option>
                  <option value="Vehículo Propio Sucursal">Vehículo Propio Sucursal LanAhora</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Número de Guía de Rastreo</label>
                <input
                  type="text"
                  value={nuevaGuia}
                  onChange={(e) => setNuevaGuia(e.target.value)}
                  placeholder="ej. FDX-9920194821"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Guardar Estatus y Notificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RASTREAR (repCompras) */}
      {/* ========================================================================= */}
      {modalRastreoOpen && selectedPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm">Rastreo de Paquetería en Vivo</h3>
              </div>
              <button onClick={() => setModalRastreoOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Paquetería</span>
                  <div className="font-black text-slate-900 text-sm">{selectedPedido.paqueteria || 'FedEx Express'}</div>
                  <span className="text-[11px] font-mono text-purple-700 font-bold block mt-0.5">
                    Guía: {selectedPedido.guiaEnvio || 'FDX-8829104812'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3 pt-2 pl-2">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">✓</div>
                  <div>
                    <div className="font-bold text-slate-900">Orden Recibida en CEDIS Proveedor</div>
                    <div className="text-[11px] text-slate-500">Almacén Central · Preparado y etiquetado</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">✓</div>
                  <div>
                    <div className="font-bold text-slate-900">En Tránsito con Transportadora</div>
                    <div className="text-[11px] text-slate-500">Unidad en ruta hacia {selectedPedido.sucursal || 'Saltillo Coah.'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    selectedPedido.estatus === 'ENTREGADO' || selectedPedido.estatus === 'LISTO_SUCURSAL'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}>
                    {selectedPedido.estatus === 'ENTREGADO' || selectedPedido.estatus === 'LISTO_SUCURSAL' ? '✓' : '•'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {selectedPedido.tipoEntrega === 'SUCURSAL' ? 'Disponible en Sucursal' : 'En Reparto Local a Domicilio'}
                    </div>
                    <div className="text-[11px] text-slate-500">{selectedPedido.direccionEntrega}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setModalRastreoOpen(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CANCELAR ORDEN (repCompras) */}
      {/* ========================================================================= */}
      {modalCancelarOpen && selectedPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-bold text-sm">Cancelar Orden de Compra</h3>
              </div>
              <button onClick={() => setModalCancelarOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                ¿Estás seguro de cancelar la orden <strong>#{selectedPedido.ordenInterna || selectedPedido.folio}</strong> de la cliente <strong>{selectedPedido.clienteNombre}</strong>?
              </p>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] leading-relaxed">
                <strong>Efecto en Cartera Core:</strong> Se liberará automáticamente el monto financiado de <strong>{formatMoney(selectedPedido.producto?.precio || 0)}</strong> en la línea de crédito LanaTienda de la distribuidora <strong>{selectedPedido.distribuidoraNombre}</strong>.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo de Cancelación</label>
                <select
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-xs focus:outline-none"
                >
                  <option value="Cancelación solicitada por distribuidora">Cancelación solicitada por distribuidora</option>
                  <option value="Cliente final desistió de la compra">Cliente final desistió de la compra</option>
                  <option value="Falta de stock con proveedor API">Falta de stock con proveedor API</option>
                  <option value="Error en captura de domicilio">Error en captura de domicilio</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCancelarOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleCancelarOrden}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: INCIDENCIAS / GARANTÍA 48 HORAS (repCompras) */}
      {/* ========================================================================= */}
      {modalIncidenciaOpen && selectedPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Garantía 48 Horas · Incidencias</h3>
              </div>
              <button onClick={() => setModalIncidenciaOpen(false)} className="text-white/70 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                🛡️ <strong>Garantía Oficial LanAhora:</strong> Cuentas con 48 hrs hábiles tras recibir el producto para registrar cualquier daño, defecto de fábrica o faltante para reposición inmediata.
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Orden a reportar:</span>
                <div className="font-black text-slate-900 text-sm">#{selectedPedido.ordenInterna || selectedPedido.folio} - {selectedPedido.producto?.nombre}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Incidencia</label>
                <select
                  value={tipoIncidencia}
                  onChange={(e) => setTipoIncidencia(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-xs focus:outline-none"
                >
                  <option value="Empaque con daño físico / golpe">Empaque con daño físico / golpe</option>
                  <option value="Defecto de encendido / falla electrónica">Defecto de encendido / falla electrónica</option>
                  <option value="Faltante de piezas o accesorios">Faltante de piezas o accesorios</option>
                  <option value="Producto entregado no corresponde a SKU solicitado">Producto entregado no corresponde a SKU solicitado</option>
                  <option value="Paquetería reporta entrega pero cliente no recibió">Paquetería reporta entrega pero cliente no recibió</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detalles y Observaciones</label>
                <textarea
                  rows={3}
                  value={detalleIncidencia}
                  onChange={(e) => setDetalleIncidencia(e.target.value)}
                  placeholder="Describe las evidencias fotográficas o reporte levantado por la distribuidora..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRegistrarIncidencia}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Levantar Incidencia con Proveedor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
