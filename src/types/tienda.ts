export interface LanaTiendaProduct {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  pagoQuincenal: number; // Siempre precio / 16
  plazoQuincenas: 16;
  imagen: string;
  descripcion: string;
  caracteristicas: string[];
  diasEntrega: number;
  disponible: boolean;
  garantiaHoras: number; // 48 hrs según manual
  tag?: string; // 'MÁS VENDIDO' | 'LO MÁS NUEVO' | 'DESTACADO'
}

export interface LanaTiendaDistribuidoraLineas {
  distribuidoraId: string;
  distribuidoraNombre: string;
  sucursal: string;
  nivel: 'BRONCE' | 'PLATA' | 'ORO' | 'PLATINO';
  lineaLanaTiendaTotal: number;
  disponibleLanaTienda: number;
  lineaPersonalTotal: number;
  disponiblePersonal: number;
  limiteClienteFinal: number;
  valelanaActivo: number;
  kitBellezaActivo: number;
  monedero: number;
}

export interface LanaTiendaCliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  cp: string;
  colonia: string;
}

export type LanaTiendaEstatusPedido =
  | 'PENDIENTE'
  | 'APROBADO_MESA'
  | 'EN_TRANSITO'
  | 'LISTO_SUCURSAL'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface LanaTiendaPedido {
  id: string;
  folio: string;
  fecha: string;
  distribuidoraId: string;
  distribuidoraNombre: string;
  clienteId: string;
  clienteNombre: string;
  producto: {
    sku: string;
    nombre: string;
    precio: number;
    pagoQuincenal: number;
    cantidad: number;
    imagen: string;
  };
  plazos: 16;
  tipoEntrega: 'SUCURSAL' | 'DOMICILIO';
  direccionEntrega: string;
  referenciasDomicilio: string;
  telefonoContacto: string;
  estatus: LanaTiendaEstatusPedido;
  guiaEnvio?: string;
  paqueteria?: string;
  notas?: string;
}
