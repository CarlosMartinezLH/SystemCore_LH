import {
  LanaTiendaProduct,
  LanaTiendaDistribuidoraLineas,
  LanaTiendaCliente,
  LanaTiendaPedido,
  LanaTiendaEstatusPedido,
} from '@/types/tienda';
import {
  INITIAL_PRODUCTS,
  MOCK_DISTRIBUIDORA_DEFAULT,
  MOCK_CLIENTES_DEFAULT,
  INITIAL_PEDIDOS,
} from '@/lib/data/tiendaData';
import { formatMoney } from '@/lib/utils/formatters';
import { recordLanaTiendaCompraCore } from '@/lib/store/serverSyncStore';
import { ProveedoresService } from '@/lib/integrations/proveedoresService';

// Singleton in-memory store for LanaTienda
class TiendaStore {
  private products: LanaTiendaProduct[] = [...INITIAL_PRODUCTS];
  private distribuidora: LanaTiendaDistribuidoraLineas = { ...MOCK_DISTRIBUIDORA_DEFAULT };
  private clientes: LanaTiendaCliente[] = [...MOCK_CLIENTES_DEFAULT];
  private pedidos: LanaTiendaPedido[] = [...INITIAL_PEDIDOS];

  getProducts(): LanaTiendaProduct[] {
    // Sync any newly added products from INITIAL_PRODUCTS
    for (const initP of INITIAL_PRODUCTS) {
      if (!this.products.some((p) => p.sku.toLowerCase() === initP.sku.toLowerCase())) {
        this.products.push(initP);
      }
    }
    return this.products;
  }

  getProductBySku(sku: string): LanaTiendaProduct | undefined {
    const found = this.products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
    if (found) return found;
    const initialFound = INITIAL_PRODUCTS.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
    if (initialFound) {
      this.products.push(initialFound);
      return initialFound;
    }
    return undefined;
  }

  getDistribuidora(id?: string): LanaTiendaDistribuidoraLineas {
    return this.distribuidora;
  }

  getClientes(distribuidoraId?: string): LanaTiendaCliente[] {
    return this.clientes;
  }

  getPedidos(distribuidoraId?: string): LanaTiendaPedido[] {
    for (const initPed of INITIAL_PEDIDOS) {
      if (!this.pedidos.some((p) => p.id === initPed.id || (p.ordenInterna && p.ordenInterna === initPed.ordenInterna))) {
        this.pedidos.push(initPed);
      }
    }
    if (distribuidoraId) {
      return this.pedidos.filter((p) => p.distribuidoraId === distribuidoraId);
    }
    return this.pedidos;
  }

  crearPedido(params: {
    distribuidoraId: string;
    distribuidoraNombre: string;
    clienteId: string;
    clienteNombre: string;
    sku: string;
    cantidad: number;
    tipoEntrega: 'SUCURSAL' | 'DOMICILIO';
    direccionEntrega: string;
    referenciasDomicilio: string;
    telefonoContacto: string;
    metodoPago?: 'CREDITO_LANATIENDA' | 'LANAPUNTOS' | 'MIXTO';
    puntosCanjeados?: number;
  }): {
    success: boolean;
    pedido?: LanaTiendaPedido;
    error?: string;
    creditoCoreId?: string;
    dispatchInfo?: any;
  } {
    const producto = this.getProductBySku(params.sku);
    if (!producto) {
      return { success: false, error: 'Producto no encontrado' };
    }

    const total = producto.precio * params.cantidad;
    const metodo = params.metodoPago || 'CREDITO_LANATIENDA';
    let puntosAUsar = 0;
    let montoFinanciado = total;

    // Cálculo y validación según método de pago
    if (metodo === 'LANAPUNTOS') {
      puntosAUsar = total;
      montoFinanciado = 0;
      if (this.distribuidora.monedero < puntosAUsar) {
        return {
          success: false,
          error: `Saldo de LanaPuntos insuficiente. Disponibles: ${this.distribuidora.monedero} pts, Requeridos: ${puntosAUsar} pts.`,
        };
      }
    } else if (metodo === 'MIXTO') {
      puntosAUsar = Math.min(Number(params.puntosCanjeados) || 0, total);
      montoFinanciado = Math.max(0, total - puntosAUsar);

      if (this.distribuidora.monedero < puntosAUsar) {
        return {
          success: false,
          error: `Saldo de LanaPuntos insuficiente. Disponibles: ${this.distribuidora.monedero} pts, Requeridos: ${puntosAUsar} pts.`,
        };
      }
      if (this.distribuidora.disponibleLanaTienda < montoFinanciado) {
        return {
          success: false,
          error: `Línea de crédito insuficiente para financiar el restante (${formatMoney(montoFinanciado)}). Disponible: ${formatMoney(this.distribuidora.disponibleLanaTienda)}.`,
        };
      }
    } else {
      // 100% Crédito LanaTienda
      if (this.distribuidora.disponibleLanaTienda < total) {
        return {
          success: false,
          error: `Línea LanaTienda insuficiente. Disponible: ${formatMoney(this.distribuidora.disponibleLanaTienda)}, Total requerido: ${formatMoney(total)}`,
        };
      }
    }

    // 1. Aplicar deducciones locales de saldos
    if (puntosAUsar > 0) {
      this.distribuidora.monedero = Math.max(0, this.distribuidora.monedero - puntosAUsar);
    }
    if (montoFinanciado > 0) {
      this.distribuidora.disponibleLanaTienda = Math.max(0, this.distribuidora.disponibleLanaTienda - montoFinanciado);
    }

    const folioNumber = this.pedidos.length + 43;
    const folio = `LTD-2026-00${folioNumber}`;

    // Determinar proveedor asociado
    const provId = producto.proveedorId || 'prov-syscom';
    const proveedor = ProveedoresService.getProveedorById(provId);

    const cuotaQuincenal = montoFinanciado > 0 ? Number((montoFinanciado / 16).toFixed(2)) : 0;

    const nuevoPedido: LanaTiendaPedido = {
      id: `ped-${Date.now()}`,
      folio,
      fecha: new Date().toISOString(),
      distribuidoraId: params.distribuidoraId,
      distribuidoraNombre: params.distribuidoraNombre,
      clienteId: params.clienteId,
      clienteNombre: params.clienteNombre,
      producto: {
        sku: producto.sku,
        nombre: producto.nombre,
        precio: producto.precio,
        pagoQuincenal: cuotaQuincenal,
        cantidad: params.cantidad,
        imagen: producto.imagen,
      },
      plazos: 16,
      tipoEntrega: params.tipoEntrega,
      direccionEntrega: params.direccionEntrega,
      referenciasDomicilio: params.referenciasDomicilio,
      telefonoContacto: params.telefonoContacto,
      estatus: 'APROBADO_MESA',
      metodoPago: metodo,
      montoTotal: total,
      montoFinanciado,
      puntosCanjeados: puntosAUsar,
      proveedorId: provId,
      proveedorNombre: proveedor?.nombreComercial || 'Syscom México',
      notas:
        metodo === 'LANAPUNTOS'
          ? `Pagado al 100% con ${puntosAUsar} LanaPuntos (Monedero).`
          : metodo === 'MIXTO'
          ? `Pago mixto: ${puntosAUsar} LanaPuntos + ${formatMoney(montoFinanciado)} financiado a 16 quincenas de $${cuotaQuincenal}.`
          : `Financiado a 16 quincenas fijas de $${cuotaQuincenal} con cargo a línea LanaTienda.`,
    };

    // 2. Integración con el Sistema Core (Créditos y LanaPuntos en Cartera Central)
    const coreResult = recordLanaTiendaCompraCore({
      folioPedido: folio,
      distribuidorId: params.distribuidoraId,
      distribuidorNombre: params.distribuidoraNombre,
      clienteId: params.clienteId,
      clienteNombre: params.clienteNombre,
      productoNombre: producto.nombre,
      sku: producto.sku,
      montoTotal: total,
      montoFinanciado,
      puntosCanjeados: puntosAUsar,
      metodoPago: metodo,
      tipoEntrega: params.tipoEntrega,
      direccionEntrega: params.direccionEntrega,
    });

    if (coreResult.credito) {
      nuevoPedido.creditoCoreId = Number(coreResult.credito.creditoId.replace(/\D/g, '')) || undefined;
    }

    // 3. Integración con Proveedores por API (Auto-Dispatch / Dropshipping)
    let dispatchResult: any = null;
    if (proveedor && proveedor.autoDispatch) {
      try {
        const poNumber = `PO-${proveedor.codigo.slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;
        const tracking = `${proveedor.paqueteriaPredeterminada.slice(0, 2).toUpperCase()}-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

        nuevoPedido.ordenCompraProveedor = poNumber;
        nuevoPedido.guiaEnvio = tracking;
        nuevoPedido.paqueteria = proveedor.paqueteriaPredeterminada;
        nuevoPedido.estatus = 'EN_TRANSITO';

        // Registrar en el servicio de proveedores
        ProveedoresService.dispatchOrderToProveedor({
          pedido: nuevoPedido,
          proveedorId: provId,
        }).then((res) => {
          dispatchResult = res.dispatch;
        });
      } catch (e) {
        console.warn('[TiendaStore] Fallback proveedor dispatch:', e);
      }
    }

    this.pedidos.unshift(nuevoPedido);

    return {
      success: true,
      pedido: nuevoPedido,
      creditoCoreId: coreResult.credito?.creditoId,
      dispatchInfo: dispatchResult,
    };
  }

  actualizarEstatusPedido(
    pedidoId: string,
    estatus: LanaTiendaEstatusPedido,
    guiaEnvio?: string,
    paqueteria?: string
  ): LanaTiendaPedido | null {
    const idx = this.pedidos.findIndex((p) => p.id === pedidoId || p.folio === pedidoId);
    if (idx === -1) return null;

    this.pedidos[idx].estatus = estatus;
    if (guiaEnvio) this.pedidos[idx].guiaEnvio = guiaEnvio;
    if (paqueteria) this.pedidos[idx].paqueteria = paqueteria;

    // Si se cancela, reembolsar disponible y LanaPuntos
    if (estatus === 'CANCELADO') {
      const pedido = this.pedidos[idx];
      if (pedido.montoFinanciado && pedido.montoFinanciado > 0) {
        this.distribuidora.disponibleLanaTienda += pedido.montoFinanciado;
      }
      if (pedido.puntosCanjeados && pedido.puntosCanjeados > 0) {
        this.distribuidora.monedero += pedido.puntosCanjeados;
      }
    }

    return this.pedidos[idx];
  }
}

// Global declaration to survive Next.js dev reloads
declare global {
  var __tiendaStore: TiendaStore | undefined;
}

export const tiendaStore = global.__tiendaStore || new TiendaStore();
if (process.env.NODE_ENV !== 'production') {
  global.__tiendaStore = tiendaStore;
}
