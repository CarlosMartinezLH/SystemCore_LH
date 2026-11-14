'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
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
  Globe,
  Server,
  Activity,
  Sparkles,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Zap,
  Boxes,
  Radio,
  ArrowUpRight,
  RotateCw,
} from 'lucide-react';
import { LanaTiendaPedido, LanaTiendaEstatusPedido } from '@/types/tienda';
import { ProveedorApiConfig, OrdenProveedorDispatch } from '@/types/proveedores';
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
  // Main Tab Navigation: Pedidos vs Proveedores API
  const [activeTab, setActiveTab] = useState<'PEDIDOS' | 'PROVEEDORES'>('PEDIDOS');

  // Pedidos State
  const [pedidos, setPedidos] = useState<LanaTiendaPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstatus, setFilterEstatus] = useState<string>('TODOS');
  const [selectedPedido, setSelectedPedido] = useState<LanaTiendaPedido | null>(null);

  // Status update state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newGuia, setNewGuia] = useState('');
  const [newPaqueteria, setNewPaqueteria] = useState('FedEx Express');

  // Proveedores State
  const [proveedores, setProveedores] = useState<ProveedorApiConfig[]>([]);
  const [dispatches, setDispatches] = useState<OrdenProveedorDispatch[]>([]);
  const [loadingProveedores, setLoadingProveedores] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    tipo: 'success' | 'error';
    texto: string;
  } | null>(null);
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tienda/pedidos');
      const data = await res.json();
      if (data.success && data.pedidos) {
        setPedidos(data.pedidos);
      }
    } catch (err) {
      console.log('Error fetching pedidos:', err);
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

  const handleUpdateStatus = async (
    pedidoId: string,
    nuevoEstatus: LanaTiendaEstatusPedido,
    guia?: string,
    paq?: string
  ) => {
    setUpdatingId(pedidoId);
    try {
      const res = await fetch(`/api/tienda/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          estatus: nuevoEstatus,
          guiaEnvio: guia || newGuia || undefined,
          paqueteria: paq || newPaqueteria || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPedidos((prev) =>
          prev.map((p) => (p.id === pedidoId || p.folio === pedidoId ? data.pedido : p))
        );
        if (selectedPedido && (selectedPedido.id === pedidoId || selectedPedido.folio === pedidoId)) {
          setSelectedPedido(data.pedido);
        }
      }
    } catch (err) {
      console.log('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Acción: Probar Conexión (Ping API Proveedor)
  const handleTestConnection = async (proveedorId: string, nombre: string) => {
    setActionLoadingId(`test-${proveedorId}`);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/tienda/proveedores', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'test-connection',
          proveedorId,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setFeedbackMessage({
          tipo: 'success',
          texto: `✓ Ping exitoso con ${nombre}: ${data.result.message} (${data.result.latencyMs} ms). Estado: Activo.`,
        });
        fetchProveedores();
      } else {
        setFeedbackMessage({
          tipo: 'error',
          texto: `✗ Error al conectar con ${nombre}: ${data.error || 'Timeout en servidor de proveedor'}`,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        tipo: 'error',
        texto: `Error de red al consultar ${nombre}: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Acción: Sincronizar Catálogo
  const handleSyncCatalogo = async (proveedorId: string, nombre: string) => {
    setActionLoadingId(`sync-${proveedorId}`);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/tienda/proveedores', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'sync-catalogo',
          proveedorId,
        }),
      });
      const data = await res.json();
      if (data.success && data.log) {
        setFeedbackMessage({
          tipo: 'success',
          texto: `✓ Sincronización completa con ${nombre}: ${data.log.mensaje} (${data.log.productosActualizados} productos verificados).`,
        });
        fetchProveedores();
      } else {
        setFeedbackMessage({
          tipo: 'error',
          texto: `✗ Error al sincronizar catálogo con ${nombre}: ${data.error || 'Respuesta inválida'}`,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        tipo: 'error',
        texto: `Error de red en sync: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Acción: Despachar Pedido a la API del Proveedor
  const handleDispatchOrder = async (pedido: LanaTiendaPedido) => {
    setDispatchingOrderId(pedido.id);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/tienda/proveedores/dispatch', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          pedidoId: pedido.id,
          proveedorId: pedido.proveedorId,
        }),
      });
      const data = await res.json();
      if (data.success && data.dispatch) {
        setFeedbackMessage({
          tipo: 'success',
          texto: `✓ Pedido ${pedido.folio} despachado a la API de ${data.dispatch.proveedorNombre}. Orden externa: ${data.dispatch.ordenCompraExterna}. Guía asignada: ${data.dispatch.guiaRastreo} (${data.dispatch.paqueteria}).`,
        });
        fetchPedidos();
        fetchProveedores();
        if (selectedPedido && selectedPedido.id === pedido.id) {
          setSelectedPedido((prev) =>
            prev
              ? {
                  ...prev,
                  estatus: 'EN_TRANSITO',
                  guiaEnvio: data.dispatch.guiaRastreo,
                  paqueteria: data.dispatch.paqueteria,
                  ordenCompraProveedor: data.dispatch.ordenCompraExterna,
                }
              : null
          );
        }
      } else {
        setFeedbackMessage({
          tipo: 'error',
          texto: `✗ Fallo al despachar orden a proveedor: ${data.error || 'Rechazo de API'}`,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        tipo: 'error',
        texto: `Error de comunicación con el servicio de despacho: ${err.message}`,
      });
    } finally {
      setDispatchingOrderId(null);
    }
  };

  // Metrics
  const totalVentas = pedidos.reduce((acc, p) => acc + p.producto.precio * p.producto.cantidad, 0);
  const pendientesMesa = pedidos.filter((p) => p.estatus === 'PENDIENTE').length;
  const enTransito = pedidos.filter((p) => p.estatus === 'EN_TRANSITO').length;
  const listosSucursal = pedidos.filter((p) => p.estatus === 'LISTO_SUCURSAL').length;
  const entregados = pedidos.filter((p) => p.estatus === 'ENTREGADO').length;

  const filteredPedidos = pedidos.filter((p) => {
    const matchStatus = filterEstatus === 'TODOS' || p.estatus === filterEstatus;
    const matchSearch =
      !search ||
      p.folio.toLowerCase().includes(search.toLowerCase()) ||
      p.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
      p.distribuidoraNombre.toLowerCase().includes(search.toLowerCase()) ||
      p.producto.nombre.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Folio',
      'Fecha',
      'Distribuidora ID',
      'Distribuidora',
      'Cliente Final',
      'Teléfono',
      'Producto',
      'SKU',
      'Método de Pago',
      'Puntos Canjeados',
      'Crédito Core ID',
      'Precio Total',
      'Pago Quincenal',
      'Quincenas',
      'Tipo Entrega',
      'Sucursal / Domicilio',
      'Proveedor API',
      'PO Externa',
      'Estatus',
      'Paquetería',
      'Guía Envío',
    ];
    const rows = filteredPedidos.map((p) => [
      p.folio,
      p.fecha,
      p.distribuidoraId,
      p.distribuidoraNombre,
      p.clienteNombre,
      p.telefonoContacto,
      p.producto.nombre,
      p.producto.sku,
      p.metodoPago || 'CREDITO_LANATIENDA',
      p.puntosCanjeados || 0,
      p.creditoCoreId ? `CR-LT-${p.creditoCoreId}` : 'N/A',
      p.producto.precio,
      p.producto.pagoQuincenal,
      p.plazos,
      p.tipoEntrega,
      p.direccionEntrega || '',
      p.proveedorNombre || '',
      p.ordenCompraProveedor || '',
      p.estatus,
      p.paqueteria || '',
      p.guiaEnvio || '',
    ]);
    const csvContent = buildSafeCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ordenes_lanatienda_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (estatus: LanaTiendaEstatusPedido) => {
    switch (estatus) {
      case 'PENDIENTE':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Pendiente Mesa
          </span>
        );
      case 'APROBADO_MESA':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Check className="w-3 h-3" /> Aprobado Mesa
          </span>
        );
      case 'EN_TRANSITO':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Truck className="w-3 h-3" /> En Tránsito
          </span>
        );
      case 'LISTO_SUCURSAL':
        return (
          <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <Building2 className="w-3 h-3" /> Listo en Sucursal
          </span>
        );
      case 'ENTREGADO':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" /> Entregado
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <X className="w-3 h-3" /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const statusTabs = [
    { id: 'TODOS', label: 'Todos', count: pedidos.length },
    { id: 'PENDIENTE', label: 'Pendiente Mesa', count: pendientesMesa },
    { id: 'EN_TRANSITO', label: 'En Tránsito', count: enTransito },
    { id: 'LISTO_SUCURSAL', label: 'Listo Sucursal', count: listosSucursal },
    { id: 'ENTREGADO', label: 'Entregados', count: entregados },
  ];

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col min-h-0 overflow-y-auto font-sans p-4 lg:p-6 space-y-4">
      {/* 1. TOP NAV BAR: Segmented View Selector */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PEDIDOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PEDIDOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pedidos de Clientes & Mesa de Control</span>
            <span
              className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === 'PEDIDOS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pedidos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PROVEEDORES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PROVEEDORES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Proveedores & APIs Dropshipping</span>
            <span
              className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === 'PROVEEDORES' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {proveedores.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'PEDIDOS' && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-xs"
              title="Exportar a CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchPedidos();
              fetchProveedores();
            }}
            disabled={loading || loadingProveedores}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingProveedores ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>
      </div>

      {/* Action / Feedback Banner */}
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
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 1: PEDIDOS DE CLIENTES */}
      {activeTab === 'PEDIDOS' && (
        <div className="space-y-4">
          {/* Top Status Tabs & Search */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterEstatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    filterEstatus === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      filterEstatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar folio, cliente, DV, artículo..."
                className="w-56 sm:w-72 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ventas Totales LanaTienda
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {formatMoney(totalVentas)}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">16 quincenas y LanaPuntos</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pendientes Mesa Crédito
              </span>
              <div className="text-lg sm:text-xl font-black text-amber-600 mt-1">{pendientesMesa}</div>
              <span className="text-[10px] text-slate-500">Por validar contra línea DV</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                En Ruta / Tránsito
              </span>
              <div className="text-lg sm:text-xl font-black text-purple-600 mt-1">{enTransito}</div>
              <span className="text-[10px] text-slate-500">Con guía de paquetería activa</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Listos en Sucursal
              </span>
              <div className="text-lg sm:text-xl font-black text-indigo-600 mt-1">{listosSucursal}</div>
              <span className="text-[10px] text-slate-500">Disponibles para entrega</span>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">Folio / Fecha</th>
                    <th className="py-3 px-4 font-bold">Distribuidora</th>
                    <th className="py-3 px-4 font-bold">Cliente Final</th>
                    <th className="py-3 px-4 font-bold">Producto & Proveedor</th>
                    <th className="py-3 px-4 font-bold">Forma de Pago</th>
                    <th className="py-3 px-4 font-bold">Entrega</th>
                    <th className="py-3 px-4 font-bold">16 Quincenas</th>
                    <th className="py-3 px-4 font-bold">Estado</th>
                    <th className="py-3 px-4 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPedidos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No se encontraron pedidos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredPedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">{pedido.folio}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(pedido.fecha).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{pedido.distribuidoraNombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{pedido.distribuidoraId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{pedido.clienteNombre}</div>
                          <div className="text-[10px] text-slate-400">Tel: {pedido.telefonoContacto}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 line-clamp-1 max-w-[180px]">
                            {pedido.producto.nombre}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {pedido.producto.sku}
                            </span>
                            {pedido.proveedorNombre && (
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[9px] font-semibold">
                                {pedido.proveedorNombre.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {pedido.metodoPago === 'LANAPUNTOS' ? (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                              100% Puntos
                            </span>
                          ) : pedido.metodoPago === 'MIXTO' ? (
                            <div className="space-y-0.5">
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                <Zap className="w-3 h-3 text-emerald-600" />
                                Pago Mixto
                              </span>
                              <div className="text-[10px] text-slate-500">
                                {pedido.puntosCanjeados?.toLocaleString()} pts canjeados
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                <CreditCard className="w-3 h-3 text-blue-600" />
                                Crédito Core
                              </span>
                              {pedido.creditoCoreId && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  CR-LT-{pedido.creditoCoreId}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              pedido.tipoEntrega === 'SUCURSAL'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {pedido.tipoEntrega === 'SUCURSAL' ? 'En Sucursal' : 'A Domicilio'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-emerald-700">
                            {pedido.montoFinanciado !== undefined
                              ? pedido.montoFinanciado > 0
                                ? `${formatMoney(pedido.montoFinanciado / 16)}/qna`
                                : '$0.00 (Liquidado)'
                              : `${formatMoney(pedido.producto.pagoQuincenal)}/qna`}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Total: {formatMoney(pedido.producto.precio)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(pedido.estatus)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Despachar a Proveedor si está pendiente */}
                            {pedido.estatus === 'PENDIENTE' || pedido.estatus === 'APROBADO_MESA' ? (
                              <button
                                onClick={() => handleDispatchOrder(pedido)}
                                disabled={dispatchingOrderId === pedido.id}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                title="Despachar a la API del proveedor"
                              >
                                <Send className="w-3 h-3" />
                                <span>{dispatchingOrderId === pedido.id ? 'Despachando...' : 'Despachar'}</span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => setSelectedPedido(pedido)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#002B49] hover:text-white text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Gestionar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PROVEEDORES & APIS DROPSHIPPING */}
      {activeTab === 'PROVEEDORES' && (
        <div className="space-y-4">
          {/* Top Proveedores KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Proveedores Integrados
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <span>{proveedores.length} Conectados</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">REST API + Webhook Carrier</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Catálogo Mapeado
              </span>
              <div className="text-lg sm:text-xl font-black text-blue-600 mt-1">
                {proveedores.reduce((acc, p) => acc + (p.totalProductosMapeados || 0), 0)} Artículos
              </div>
              <span className="text-[10px] text-slate-500">Inventario sincronizado</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Órdenes Despachadas
              </span>
              <div className="text-lg sm:text-xl font-black text-purple-600 mt-1">
                {dispatches.length} POs
              </div>
              <span className="text-[10px] text-slate-500">Dropshipping automático</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Latencia Promedio API
              </span>
              <div className="text-lg sm:text-xl font-black text-emerald-600 mt-1">~105 ms</div>
              <span className="text-[10px] text-slate-500">SLA 99.9% disponibilidad</span>
            </div>
          </div>

          {/* Connected Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proveedores.map((prov) => (
              <div
                key={prov.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {prov.codigo}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{prov.nombreComercial}</h3>
                    <p className="text-xs text-slate-500">{prov.categoriaPrincipal}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ONLINE
                  </span>
                </div>

                {/* API Specs */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200 font-mono">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="text-slate-400">Endpoint:</span>
                    <span className="truncate max-w-[170px]" title={prov.apiBaseUrl}>
                      {prov.apiBaseUrl}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="text-slate-400">Auth:</span>
                    <span>{prov.authType} (HMAC-SHA256)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="text-slate-400">Paquetería:</span>
                    <span className="font-sans font-bold text-slate-800">
                      {prov.paqueteriaPredeterminada}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span className="text-slate-400">Último Sync:</span>
                    <span className="font-sans text-slate-700">
                      {new Date(prov.ultimoSync).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Mapeados</span>
                    <span className="font-black text-slate-800 text-sm">
                      {prov.totalProductosMapeados} SKUs
                    </span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Despachos</span>
                    <span className="font-black text-blue-700 text-sm">
                      {prov.ordenesDespachadas} órdenes
                    </span>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleTestConnection(prov.id, prov.nombreComercial)}
                    disabled={actionLoadingId === `test-${prov.id}`}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Activity
                      className={`w-3.5 h-3.5 text-blue-600 ${
                        actionLoadingId === `test-${prov.id}` ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{actionLoadingId === `test-${prov.id}` ? 'Probando...' : 'Probar Ping'}</span>
                  </button>

                  <button
                    onClick={() => handleSyncCatalogo(prov.id, prov.nombreComercial)}
                    disabled={actionLoadingId === `sync-${prov.id}`}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 ${
                        actionLoadingId === `sync-${prov.id}` ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{actionLoadingId === `sync-${prov.id}` ? 'Sincronizando...' : 'Sync Stock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dispatched Purchase Orders to Suppliers Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-2">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Órdenes de Compra Despachadas vía API (Dropshipping)
                </h3>
                <p className="text-xs text-slate-500">
                  Transmisión en tiempo real de POs a los sistemas de los mayoristas
                </p>
              </div>
              <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                {dispatches.length} Órdenes Externas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">PO Proveedor / Core</th>
                    <th className="py-3 px-4 font-bold">Mayorista</th>
                    <th className="py-3 px-4 font-bold">Artículo Solicitado</th>
                    <th className="py-3 px-4 font-bold">Destinatario</th>
                    <th className="py-3 px-4 font-bold">Costo Mayorista vs PVP</th>
                    <th className="py-3 px-4 font-bold">Guía de Paquetería</th>
                    <th className="py-3 px-4 font-bold">Estado PO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No hay órdenes de compra despachadas a proveedores aún.
                      </td>
                    </tr>
                  ) : (
                    dispatches.map((disp) => (
                      <tr key={disp.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-black text-blue-700">
                            {disp.ordenCompraExterna}
                          </div>
                          <div className="text-[10px] text-slate-400">Pedido Core: {disp.pedidoFolio}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{disp.proveedorNombre}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 truncate max-w-[200px]">
                            {disp.nombreProducto}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SKU: {disp.skuProveedor} ({disp.cantidad} pza)
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{disp.destinatario.nombre}</div>
                          <div className="text-[10px] text-slate-500">
                            {disp.destinatario.ciudad} (CP {disp.destinatario.cp})
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-800">
                            {formatMoney(disp.costoProveedor)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            PVP: {formatMoney(disp.precioVentaLanaTienda)} (Margen:{' '}
                            {formatMoney(disp.precioVentaLanaTienda - disp.costoProveedor)})
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {disp.guiaRastreo ? (
                            <a
                              href={disp.urlRastreo || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono font-bold text-blue-600 hover:text-blue-800 underline text-xs"
                            >
                              <span>{disp.guiaRastreo}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">En asignación</span>
                          )}
                          <div className="text-[10px] text-slate-500">{disp.paqueteria}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              disp.estatusEnvio === 'ENTREGADO'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {disp.estatusEnvio}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE Y GESTIÓN DE PEDIDO */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gestión de Orden</span>
                <h3 className="text-base font-black text-slate-900">{selectedPedido.folio}</h3>
              </div>
              <button
                onClick={() => setSelectedPedido(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Distribuidora</span>
                <span className="font-bold text-slate-800">{selectedPedido.distribuidoraNombre}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliente Final</span>
                <span className="font-bold text-slate-800">{selectedPedido.clienteNombre}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Forma de Pago</span>
                <span className="font-bold text-slate-900">
                  {selectedPedido.metodoPago === 'LANAPUNTOS'
                    ? '100% LanaPuntos'
                    : selectedPedido.metodoPago === 'MIXTO'
                    ? `Pago Mixto (${selectedPedido.puntosCanjeados?.toLocaleString()} pts)`
                    : '100% Crédito Core (16 quincenas)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Proveedor Asignado</span>
                <span className="font-bold text-slate-800">
                  {selectedPedido.proveedorNombre || 'Proveedor API Oficial'}
                </span>
              </div>

              <div className="col-span-2 pt-1.5 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Dirección de Entrega</span>
                <span className="text-slate-700">{selectedPedido.direccionEntrega}</span>
                {selectedPedido.referenciasDomicilio && (
                  <p className="text-[11px] text-amber-900 bg-amber-50 rounded p-1.5 mt-1 border border-amber-200">
                    <strong>Referencias:</strong> {selectedPedido.referenciasDomicilio}
                  </p>
                )}
              </div>
            </div>

            {/* Product card */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <img
                src={selectedPedido.producto.imagen}
                alt=""
                className="w-14 h-14 rounded-lg object-cover border border-slate-200"
              />
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-slate-900">{selectedPedido.producto.nombre}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-emerald-700 font-black">
                    {selectedPedido.montoFinanciado && selectedPedido.montoFinanciado > 0
                      ? `16 Quincenas de ${formatMoney(selectedPedido.montoFinanciado / 16)}`
                      : 'Liquidado con LanaPuntos'}
                  </span>
                  <span className="text-slate-500">
                    Total: {formatMoney(selectedPedido.producto.precio)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status change actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase">
                Actualizar Estatus del Pedido
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'APROBADO_MESA')}
                  disabled={updatingId === selectedPedido.id || selectedPedido.estatus === 'APROBADO_MESA'}
                  className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl border border-blue-200 transition"
                >
                  ✓ Aprobar Mesa de Crédito
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'LISTO_SUCURSAL')}
                  disabled={updatingId === selectedPedido.id || selectedPedido.estatus === 'LISTO_SUCURSAL'}
                  className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold rounded-xl border border-indigo-200 transition"
                >
                  🏢 Listo en Sucursal
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(selectedPedido.id, 'EN_TRANSITO', 'FEDEX-MEX-8921', 'FedEx Express')
                  }
                  disabled={updatingId === selectedPedido.id || selectedPedido.estatus === 'EN_TRANSITO'}
                  className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl border border-purple-200 transition"
                >
                  🚚 Despachar en Ruta
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'ENTREGADO')}
                  disabled={updatingId === selectedPedido.id || selectedPedido.estatus === 'ENTREGADO'}
                  className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-200 transition"
                >
                  ✅ Marcar Entregado
                </button>
              </div>

              {selectedPedido.estatus !== 'CANCELADO' && selectedPedido.estatus !== 'ENTREGADO' && (
                <button
                  onClick={() => handleUpdateStatus(selectedPedido.id, 'CANCELADO')}
                  disabled={updatingId === selectedPedido.id}
                  className="w-full py-1.5 text-rose-600 hover:text-rose-800 text-[11px] font-semibold transition text-center"
                >
                  Cancelar orden y reembolsar saldo a distribuidora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}