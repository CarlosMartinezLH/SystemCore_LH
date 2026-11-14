export type TipoIntegracionProveedor = 'REST_API' | 'WEBHOOK' | 'SFTP_EDI';
export type EstatusProveedor = 'CONECTADO' | 'EN_PRUEBAS' | 'ERROR_CONEXION' | 'INACTIVO';

export interface ProveedorApiConfig {
  id: string;
  codigo: string; // ej. 'SYSCOM_MX', 'INGRAM_MICRO', 'MUEBLES_CENTRAL'
  nombreComercial: string;
  categoriaPrincipal: string;
  apiBaseUrl: string;
  authType: 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH';
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  tipoIntegracion: TipoIntegracionProveedor;
  estatus: EstatusProveedor;
  autoDispatch: boolean; // Si despacha automáticamente a la API al aprobar pedido
  diasGarantiaEnvio: number; // ej. 3 a 5 días
  paqueteriaPredeterminada: 'FedEx Express' | 'Estafeta' | 'DHL Express' | 'Paquetexpress' | 'Redpack';
  margenUtilidadPorcentaje: number; // ej. 25% sobre costo proveedor
  totalProductosMapeados: number;
  ordenesDespachadas: number;
  ultimoSync: string;
  latenciaMs?: number;
}

export interface OrdenProveedorDispatch {
  id: string;
  pedidoFolio: string;
  proveedorId: string;
  proveedorNombre: string;
  ordenCompraExterna: string; // PO Number retornado por el API del proveedor
  skuProveedor: string;
  nombreProducto: string;
  cantidad: number;
  costoProveedor: number;
  precioVentaLanaTienda: number;
  fechaDespacho: string;
  estatusEnvio: 'PENDIENTE_SURTIDO' | 'EN_TRANSITO' | 'ENTREGADO' | 'CANCELADO';
  guiaRastreo?: string;
  paqueteria?: string;
  urlRastreo?: string;
  destinatario: {
    nombre: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    cp: string;
    referencias: string;
  };
  respuestaApiPayload?: Record<string, unknown>;
}

export interface CatalogoSyncLog {
  id: string;
  proveedorId: string;
  fecha: string;
  productosNuevos: number;
  productosActualizados: number;
  productosSinStock: number;
  estatus: 'EXITOSO' | 'PARCIAL' | 'FALLIDO';
  mensaje: string;
}
