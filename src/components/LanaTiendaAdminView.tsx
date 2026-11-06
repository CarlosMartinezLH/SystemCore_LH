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
} from 'lucide-react';
import { LanaTiendaPedido, LanaTiendaEstatusPedido } from '@/types/tienda';

export default function LanaTiendaAdminView() {
  const [pedidos, setPedidos] = useState<LanaTiendaPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstatus, setFilterEstatus] = useState<string>('TODOS');
  const [selectedPedido, setSelectedPedido] = useState<LanaTiendaPedido | null>(null);

  // Status update state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newGuia, setNewGuia] = useState('');
  const [newPaqueteria, setNewPaqueteria] = useState('FedEx Express');

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tienda/pedidos');
      const data = await res.json();
      if (data.success) {
        setPedidos(data.pedidos);
      }
    } catch (err) {
      console.log('Error fetching pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
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
        headers: { 'Content-Type': 'application/json' },
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
      'Precio Total',
      'Pago Quincenal',
      'Quincenas',
      'Tipo Entrega',
      'Sucursal / Domicilio',
      'Estatus',
      'Paquetería',
      'Guía Envío',
    ];
    const rows = filteredPedidos.map((p) => [
      p.folio,
      `"${p.fecha}"`,
      p.distribuidoraId,
      `"${p.distribuidoraNombre}"`,
      `"${p.clienteNombre}"`,
      p.telefonoContacto,
      `"${p.producto.nombre}"`,
      p.producto.sku,
      p.producto.precio,
      p.producto.pagoQuincenal,
      p.plazos,
      p.tipoEntrega,
      `"${p.direccionEntrega || ''}"`,
      p.estatus,
      `"${p.paqueteria || ''}"`,
      `"${p.guiaEnvio || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ordenes_lanatienda_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Top Action Toolbar: Botones de Acción y Filtros sobre la pantalla */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status Filter Segmented Controls */}
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
                  filterEstatus === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Search and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar folio, cliente, DV..."
              className="w-56 sm:w-64 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition shadow-xs"
            title="Exportar a CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={fetchPedidos}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            title="Refrescar órdenes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Ventas Totales Tienda
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            ${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">100% financiadas a 16 quincenas</span>
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
                <th className="py-3 px-4 font-bold">Producto</th>
                <th className="py-3 px-4 font-bold">Entrega</th>
                <th className="py-3 px-4 font-bold">16 Quincenas</th>
                <th className="py-3 px-4 font-bold">Estado</th>
                <th className="py-3 px-4 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
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
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">
                        {pedido.producto.nombre}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {pedido.producto.sku}</div>
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
                        ${pedido.producto.pagoQuincenal.toFixed(2)}/qna
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Total: ${pedido.producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(pedido.estatus)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPedido(pedido)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#002B49] hover:text-white text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Gestionar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLE Y GESTIÓN DE PEDIDO */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
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
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Distribuidora</span>
                <span className="font-bold text-slate-800">{selectedPedido.distribuidoraNombre}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliente Final</span>
                <span className="font-bold text-slate-800">{selectedPedido.clienteNombre}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200">
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
                    16 Quincenas de ${selectedPedido.producto.pagoQuincenal.toFixed(2)}
                  </span>
                  <span className="text-slate-500">
                    Total: ${selectedPedido.producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
