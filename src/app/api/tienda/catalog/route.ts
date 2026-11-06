import { NextResponse } from 'next/server';
import { INITIAL_PRODUCTS, TIENDA_CATEGORIES } from '@/lib/data/tiendaData';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const categoria = searchParams.get('categoria') || '';
    const sku = searchParams.get('sku') || '';

    let products = [...INITIAL_PRODUCTS];

    if (sku) {
      products = products.filter((p) => p.sku.toLowerCase() === sku.toLowerCase());
    }

    if (categoria) {
      products = products.filter(
        (p) =>
          p.categoria.toLowerCase() === categoria.toLowerCase() ||
          p.subcategoria.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (q) {
      products = products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      categories: TIENDA_CATEGORIES,
      products,
      total: products.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener catálogo' },
      { status: 500 }
    );
  }
}
