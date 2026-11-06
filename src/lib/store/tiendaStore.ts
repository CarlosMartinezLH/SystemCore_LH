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

// Singleton in-memory store for LanaTienda
class TiendaStore {
  private products: LanaTiendaProduct[] = [...INITIAL_PRODUCTS];
  private distribuidora: LanaTiendaDistribuidoraLineas = { ...MOCK_DISTRIBUIDORA_DEFAULT };
  private clientes: LanaTiendaCliente[] = [...MOCK_CLIENTES_DEFAULT];
  private pedidos: LanaTiendaPedido[] = [...INITIAL_PEDIDOS];

  getProducts(): LanaTiendaProduct[] {
    return this.products;
  }

  getProductBySku(sku: string): LanaTiendaProduct | undefined {
    return this.products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
  }

  getDistribuidora(id?: string): LanaTiendaDistribuidoraLineas {
    return this.distribuidora;
  }

  getClientes(distribuidoraId?: string): LanaTiendaCliente[] {
    return this.clientes;
  }

  getPedidos(distribuidoraId?: string): LanaTiendaPedido[] {
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
  }): { success: boolean; pedido?: LanaTiendaPedido; error?: string } {
    const producto = this.getProductBySku(params.sku);
    if (!producto) {
      return { success: false, error: 'Producto no encontrado' };
    }

    const total = producto.precio * params.cantidad;

    // Validación de línea de crédito
    if (this.distribuidora.disponibleLanaTienda < total) {
      return {
        success: false,
        error: `Línea LanaTienda insuficiente. Disponible: $${this.distribuidora.disponibleLanaTienda.toLocaleString('es-MX', { minimumFractionDigits: 2 })}, Total requerido: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      };
    }

    // Descontar saldo disponible
    this.distribuidora.disponibleLanaTienda -= total;

    const folioNumber = this.pedidos.length + 43;
    const nuevoPedido: LanaTiendaPedido = {
      id: `ped-${Date.now()}`,
      folio: `LTD-2026-00${folioNumber}`,
      fecha: new Date().toISOString(),
      distribuidoraId: params.distribuidoraId,
      distribuidoraNombre: params.distribuidoraNombre,
      clienteId: params.clienteId,
      clienteNombre: params.clienteNombre,
      producto: {
        sku: producto.sku,
        nombre: producto.nombre,
        precio: producto.precio,
        pagoQuincenal: producto.pagoQuincenal,
        cantidad: params.cantidad,
        imagen: producto.imagen,
      },
      plazos: 16,
      tipoEntrega: params.tipoEntrega,
      direccionEntrega: params.direccionEntrega,
      referenciasDomicilio: params.referenciasDomicilio,
      telefonoContacto: params.telefonoContacto,
      estatus: 'PENDIENTE',
      notas: `Pedido originado desde LanaTienda. Plazo fijo 16 quincenas de $${producto.pagoQuincenal.toFixed(2)}`,
    };

    this.pedidos.unshift(nuevoPedido);
    return { success: true, pedido: nuevoPedido };
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

    // Si se cancela, reembolsar disponible
    if (estatus === 'CANCELADO') {
      const prodTotal = this.pedidos[idx].producto.precio * this.pedidos[idx].producto.cantidad;
      this.distribuidora.disponibleLanaTienda += prodTotal;
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

