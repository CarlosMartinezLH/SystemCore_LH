'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  ExternalLink,
  CheckCircle,
  Truck,
  ShieldAlert,
  ArrowRight,
  X,
  CreditCard,
  MapPin,
  Clock,
  ChevronRight,
  Share2,
  Copy,
  Info,
  Calendar,
  Lock,
  PackageCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import {
  LanaTiendaProduct,
  LanaTiendaDistribuidoraLineas,
  LanaTiendaCliente,
  LanaTiendaPedido,
} from '@/types/tienda';
import {
  TIENDA_CATEGORIES,
  INITIAL_PRODUCTS,
  MOCK_DISTRIBUIDORA_DEFAULT,
  MOCK_CLIENTES_DEFAULT,
} from '@/lib/data/tiendaData';

function TiendaContent() {
  const searchParams = useSearchParams();
  const refSku = searchParams.get('sku') || searchParams.get('ref') || '';

  // State
  const [products, setProducts] = useState<LanaTiendaProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [activeBanner, setActiveBanner] = useState(0);

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<LanaTiendaProduct | null>(null);
  const [shareModalProduct, setShareModalProduct] = useState<LanaTiendaProduct | null>(null);
  const [cartProduct, setCartProduct] = useState<LanaTiendaProduct | null>(null);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<LanaTiendaPedido | null>(null);
  const [viewHistoryModal, setViewHistoryModal] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<LanaTiendaPedido[]>([]);

  // Distribuidora Auth & Data
  const [isDistribuidoraLoggedIn, setIsDistribuidoraLoggedIn] = useState(false);
  const [distribuidora, setDistribuidora] = useState<LanaTiendaDistribuidoraLineas>(MOCK_DISTRIBUIDORA_DEFAULT);
  const [clientes, setClientes] = useState<LanaTiendaCliente[]>(MOCK_CLIENTES_DEFAULT);
  const [loginUser, setLoginUser] = useState('elena_distribuidora');
  const [loginPass, setLoginPass] = useState('LanApp2026!');
  const [loginError, setLoginError] = useState('');

  // Checkout Form State
  const [selectedClienteId, setSelectedClienteId] = useState<string>(MOCK_CLIENTES_DEFAULT[0]?.id || '');
  const [tipoDireccion, setTipoDireccion] = useState<'SUCURSAL' | 'DOMICILIO'>('SUCURSAL');
  const [referenciasDomicilio, setReferenciasDomicilio] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Toast / Copy notification
  const [copiedLink, setCopiedLink] = useState(false);

  // Load from API on mount
  useEffect(() => {
    fetch('/api/tienda/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.log('Using local products fallback:', err));

    fetch('/api/tienda/distribuidora')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.distribuidora) {
          setDistribuidora(data.distribuidora);
          if (data.clientes) setClientes(data.clientes);
        }
      })
      .catch((err) => console.log('Using local distribuidora fallback:', err));
  }, []);

  // Handle incoming referral link from WhatsApp (e.g. ?sku=MCC-DUF-9021)
  useEffect(() => {
    if (refSku && products.length > 0) {
      const found = products.find((p) => p.sku.toLowerCase() === refSku.toLowerCase());
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [refSku, products]);

  // Carousel autoplay
  const banners = [
    {
      src: '/tienda/banners/banner_1.png',
      alt: 'Noviembre Especial LanAtienda',
      sub: 'Tus productos favoritos siempre a 16 quincenas fijas',
    },
    {
      src: '/tienda/banners/banner_2.png',
      alt: 'Smart TV y Entretenimiento',
      sub: 'Llévalo con cargo a tu línea LanAhora',
    },
    {
      src: '/tienda/banners/banner_3.png',
      alt: 'Lo más nuevo en Climatización',
      sub: 'Entrega directa a domicilio o en sucursal',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'TODOS' ||
        p.categoria.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Lo Más Vendido' && p.tag === 'MÁS VENDIDO');
      const matchesQuery =
        !searchQuery ||
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const selectedCliente = useMemo(() => {
    return clientes.find((c) => c.id === selectedClienteId) || clientes[0];
  }, [clientes, selectedClienteId]);

  // Handlers
  const handleDistribuidoraLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('Ingresa tu usuario y contraseña de LanApp');
      return;
    }
    // Simulate / Connect Keycloak auth
    setIsDistribuidoraLoggedIn(true);
    setIsLoginModalOpen(false);
    setLoginError('');
  };

  const handleOpenCart = (prod: LanaTiendaProduct) => {
    setCartProduct(prod);
    setCartQuantity(1);
    setSelectedProduct(null);
    setOrderError('');
  };

  const handleFinalizeOrder = async () => {
    if (!cartProduct) return;
    setIsSubmittingOrder(true);
    setOrderError('');

    const payload = {
      distribuidoraId: distribuidora.distribuidoraId,
      distribuidoraNombre: distribuidora.distribuidoraNombre,
      clienteId: selectedCliente.id,
      clienteNombre: selectedCliente.nombre,
      sku: cartProduct.sku,
      cantidad: cartQuantity,
      tipoEntrega: tipoDireccion,
      direccionEntrega:
        tipoDireccion === 'SUCURSAL'
          ? distribuidora.sucursal
          : `${selectedCliente.direccion}, ${selectedCliente.ciudad} CP ${selectedCliente.cp}`,
      referenciasDomicilio,
      telefonoContacto: selectedCliente.telefono,
    };

    try {
      const res = await fetch('/api/tienda/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setCompletedOrder(data.pedido);
        setDistribuidora((prev) => ({
          ...prev,
          disponibleLanaTienda: data.disponibleRestante,
        }));
        setIsConfirmModalOpen(false);
        setCartProduct(null);
      } else {
        setOrderError(data.error || 'No fue posible registrar el pedido');
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      setOrderError(err.message || 'Error de conexión');
      setIsConfirmModalOpen(false);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/tienda/pedidos?distribuidoraId=${distribuidora.distribuidoraId}`);
      const data = await res.json();
      if (data.success) {
        setHistoryOrders(data.pedidos);
        setViewHistoryModal(true);
      }
    } catch (err) {
      console.log('Error loading history:', err);
    }
  };

  const generateWhatsAppLink = (product: LanaTiendaProduct) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tienda.lanahora.com';
    const refUrl = `${origin}/tienda?sku=${encodeURIComponent(product.sku)}`;
    const text = `¡Hola! Me interesó este producto en LanAtienda a 16 quincenas fijas de $${product.pagoQuincenal.toFixed(
      2
    )}: ${product.nombre}. ¿Me ayudas a solicitarlo con tu crédito? Aquí está el link: ${refUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const copyReferralLink = (product: LanaTiendaProduct) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tienda.lanahora.com';
    const refUrl = `${origin}/tienda?sku=${encodeURIComponent(product.sku)}`;
    navigator.clipboard.writeText(refUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top Banner Notice */}
      <div className="bg-[#002B49] text-white text-[12px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
          Oficial
        </span>
        <span>
          Tus productos siempre a <strong>16 quincenas fijas</strong> • Envíos a todo México con LanAhora
        </span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/tienda" className="flex items-center gap-2 group">
              <div className="h-10 px-3 bg-[#002B49] rounded-lg flex items-center justify-center shadow-inner">
                <span className="text-xl font-black text-amber-400 tracking-tight">LanA</span>
                <span className="text-xl font-bold text-white tracking-tight">tienda</span>
              </div>
              <span className="hidden md:inline-block text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-1 border-l border-slate-200">
                Financiera LanAhora
              </span>
            </a>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Busca por producto, marca o SKU (ej. Maletín, Smart TV)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* User / Distribuidora Action Buttons */}
          <div className="flex items-center gap-2">
            {isDistribuidoraLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={loadHistory}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mis Pedidos</span>
                </button>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-full px-3 py-1 text-xs font-bold">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate max-w-[120px]">{distribuidora.distribuidoraNombre}</span>
                  <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {distribuidora.nivel}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#002B49] text-white hover:bg-blue-900 text-xs font-bold shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Iniciar Sesión Distribuidora</span>
              </button>
            )}

            {/* Back to SystemCore Web Button */}
            <a
              href="/"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
              title="Ir a SystemCore Principal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 py-2 text-xs font-medium text-slate-600 whitespace-nowrap">
            <button
              onClick={() => setSelectedCategory('TODOS')}
              className={`px-3 py-1 rounded-full font-bold transition ${
                selectedCategory === 'TODOS'
                  ? 'bg-[#002B49] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            {TIENDA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.nombre)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                  selectedCategory.toLowerCase() === cat.nombre.toLowerCase()
                    ? 'bg-[#002B49] text-white font-bold shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icono}</span>
                <span>{cat.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Referral Welcome Notification if arriving from WhatsApp link */}
        {refSku && selectedProduct && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white p-1 border border-amber-300 shrink-0 overflow-hidden shadow-sm">
                <img src={selectedProduct.imagen} alt="" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                  Solicitud Recibida por WhatsApp
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                  Tu cliente desea adquirir: {selectedProduct.nombre}
                </h3>
                <p className="text-xs text-slate-600">
                  Plazo fijo a <strong>16 quincenas de ${selectedProduct.pagoQuincenal.toFixed(2)}</strong> (Total: $
                  {selectedProduct.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (!isDistribuidoraLoggedIn) {
                    setIsLoginModalOpen(true);
                  } else {
                    handleOpenCart(selectedProduct);
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isDistribuidoraLoggedIn ? 'Ir al Carrito y Procesar' : 'Identificarme como Distribuidora'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Hero Carousel */}
        <div className="relative rounded-2xl overflow-hidden shadow-md bg-slate-900 h-44 sm:h-64 md:h-80">
          {banners.map((b, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img src={b.src} alt={b.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-wider uppercase">
                  LanaTienda LanAhora
                </span>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black">{b.alt}</h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">{b.sub}</p>
              </div>
            </div>
          ))}

          {/* Carousel dots */}
          <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeBanner ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Three Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#002B49] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Siempre a 16 Quincenas</h4>
              <p className="text-[11px] text-slate-500">Montos fijos claros, sin letras chiquitas ni enganche.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">A Domicilio o Sucursal</h4>
              <p className="text-[11px] text-slate-500">Recibe seguro en casa o recoge directo en tu sucursal.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Garantía LanAhora</h4>
              <p className="text-[11px] text-slate-500">48 hrs para reportar cualquier detalle al recibir tu paquete.</p>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Catálogo de Productos Disponibles</h2>
            <p className="text-xs text-slate-500">
              Mostrando {filteredProducts.length} artículos en {selectedCategory}
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {product.tag && (
                  <span className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                    {product.tag}
                  </span>
                )}
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  16 Quincenas
                </div>
              </div>

              {/* Product Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {product.categoria}
                  </span>
                  <h3
                    onClick={() => setSelectedProduct(product)}
                    className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mt-0.5 hover:text-blue-700 cursor-pointer"
                  >
                    {product.nombre}
                  </h3>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Pago Quincenal</span>
                      <div className="text-base sm:text-lg font-black text-emerald-700 leading-none">
                        ${product.pagoQuincenal.toFixed(2)}
                      </div>
                      <span className="text-[9px] text-slate-500">16 pagos quincenales</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="text-xs font-bold text-slate-700">
                        ${product.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
                    >
                      Ver Detalle
                    </button>
                    <button
                      onClick={() => setShareModalProduct(product)}
                      title="Compartir con distribuidora"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* PRODUCT DETAIL MODAL (Official Client Flow) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                  SKU: {selectedProduct.sku}
                </span>
                <span className="text-xs text-slate-400">• {selectedProduct.categoria}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="sm:w-1/2 aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                  <img src={selectedProduct.imagen} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="sm:w-1/2 flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-snug">{selectedProduct.nombre}</h2>
                    <p className="text-xs text-slate-600 mt-2">{selectedProduct.descripcion}</p>
                  </div>

                  {/* Financial calculation box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Tus productos siempre a:</span>
                      <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                        16 Quincenas
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Pago Quincenal:</span>
                      <span className="text-xl font-black text-emerald-700">
                        ${selectedProduct.pagoQuincenal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px] text-slate-500">
                      <span>Total contado:</span>
                      <span className="font-semibold">
                        ${selectedProduct.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                      *El precio no incluye el seguro de canje.
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery and Guarantee notices (From Official Manual) */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-1.5 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-bold">
                  <Truck className="w-4 h-4 text-blue-700" />
                  <span>Días de entrega estimados: {selectedProduct.diasEntrega} días hábiles</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  <strong>Importante:</strong> Al recibir el producto cuentas con{' '}
                  <strong>{selectedProduct.garantiaHoras} hrs hábiles</strong> para reportar si llegó dañado o
                  incompleto.
                </p>
              </div>

              {/* Features list */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Características del Producto
                </h4>
                <ul className="space-y-1.5">
                  {selectedProduct.caracteristicas.map((c, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                {/* Official CTA Button */}
                <button
                  onClick={() => setShareModalProduct(selectedProduct)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>¡Compra con tu distribuidora aquí!</span>
                </button>

                {/* If logged in distribuidora, show direct cart add */}
                {isDistribuidoraLoggedIn ? (
                  <button
                    onClick={() => handleOpenCart(selectedProduct)}
                    className="w-full py-2.5 px-4 bg-[#002B49] hover:bg-blue-900 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span>Agregar a Carrito de Distribuidora</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full py-2 px-4 text-slate-500 hover:text-slate-800 text-xs font-semibold transition text-center"
                  >
                    ¿Eres Distribuidora LanAhora? Inicia sesión para cargar a tu línea
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE / WHATSAPP MODAL (Official Manual Client Step 5-7) */}
      {shareModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Enviar a tu Distribuidora</h3>
              </div>
              <button
                onClick={() => setShareModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Elige tu distribuidora de confianza en WhatsApp para enviarle el link de tu producto y solicitar tu pedido
              a <strong>16 quincenas de ${shareModalProduct.pagoQuincenal.toFixed(2)}</strong>.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
              <span className="truncate text-slate-600 font-mono text-[11px]">
                https://tienda.lanahora.com/ref?sku={shareModalProduct.sku}
              </span>
              <button
                onClick={() => copyReferralLink(shareModalProduct)}
                className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 font-bold shrink-0 text-[11px] flex items-center gap-1"
              >
                {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={generateWhatsAppLink(shareModalProduct)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Abrir WhatsApp y Seleccionar Distribuidora</span>
              </a>

              <button
                onClick={() => {
                  setShareModalProduct(null);
                  if (isDistribuidoraLoggedIn) {
                    handleOpenCart(shareModalProduct);
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition"
              >
                Soy la distribuidora (Procesar con mi cuenta)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISTRIBUIDORA LOGIN MODAL (Official Step 2-3) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#002B49] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Ingreso a LanAtienda</h3>
                  <p className="text-[10px] text-slate-500">Mismos accesos de tu LanApp</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleDistribuidoraLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Usuario o Teléfono LanApp</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="ej. elena_distribuidora"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <p>
                  <strong>¿No cuentas con estos datos?</strong> Comunícate con tu Coordinador de Negocios en tu
                  sucursal para activarlos.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#002B49] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT / MI CARRITO MODAL (Official Step 5-13) */}
      {cartProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-6">
            {/* Modal Header */}
            <div className="bg-[#002B49] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wide">MI CARRITO • SOLICITUD DE PEDIDOS</h3>
              </div>
              <button
                onClick={() => setCartProduct(null)}
                className="text-white/70 hover:text-white p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {orderError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Item in cart */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <img
                  src={cartProduct.imagen}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SKU: {cartProduct.sku}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{cartProduct.nombre}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    <span className="text-emerald-700 font-black">
                      ${cartProduct.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      16 quincenas de ${cartProduct.pagoQuincenal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                  <span className="text-sm font-black text-slate-900">
                    ${(cartProduct.precio * cartQuantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* DISTRIBUIDORA CREDIT LINES BOX (From Manual Page 5/11) */}
              <div className="bg-gradient-to-br from-slate-900 to-[#002B49] text-white rounded-2xl p-4.5 shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider block">
                      Distribuidor
                    </span>
                    <h4 className="text-sm font-black text-white">{distribuidora.distribuidoraNombre}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider block">Nivel</span>
                    <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                      {distribuidora.nivel}
                    </span>
                  </div>
                </div>

                {/* Lines Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-[10px] text-amber-300 font-bold uppercase block">
                      Línea de Crédito LanAtienda
                    </span>
                    <div className="text-xs text-white/80">
                      Total: ${distribuidora.lineaLanaTiendaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      Disponible: $
                      {distribuidora.disponibleLanaTienda.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-[10px] text-blue-300 font-bold uppercase block">Línea Personal</span>
                    <div className="text-xs text-white/80">
                      Total: ${distribuidora.lineaPersonalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm font-black text-blue-300 mt-0.5">
                      Disponible: $
                      {distribuidora.disponiblePersonal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Tier deduction breakdown (Official Bronce $9,000 example) */}
                <div className="bg-black/30 rounded-xl p-2.5 text-[11px] text-white/80 space-y-1">
                  <div className="flex justify-between font-bold text-amber-300">
                    <span>Límite Crédito Cliente Final ({distribuidora.nivel}):</span>
                    <span>
                      ${distribuidora.limiteClienteFinal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/60 text-[10px]">
                    <span>(-) ValeLana con canje activo:</span>
                    <span>-${distribuidora.valelanaActivo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-white/60 text-[10px]">
                    <span>(-) Kits de Belleza comprometidos:</span>
                    <span>
                      -${distribuidora.kitBellezaActivo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* CLIENT SELECTION (Step 8-9) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Selecciona a tu Cliente
                </label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (Tel: {c.telefono})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 italic">
                  *Si tu cliente no se encuentra registrado deberá visitar la sucursal con su papelería para darse de alta.
                </p>
              </div>

              {/* DELIVERY ADDRESS SELECTION (Step 10) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Dirección de Entrega del Pedido
                </label>

                {/* Option 1: Sucursal */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    tipoDireccion === 'SUCURSAL'
                      ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoDireccion"
                    checked={tipoDireccion === 'SUCURSAL'}
                    onChange={() => setTipoDireccion('SUCURSAL')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-700" />
                      Domicilio de la Sucursal (Recoger en Sucursal)
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{distribuidora.sucursal}</p>
                  </div>
                </label>

                {/* Option 2: Domicilio del cliente */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    tipoDireccion === 'DOMICILIO'
                      ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoDireccion"
                    checked={tipoDireccion === 'DOMICILIO'}
                    onChange={() => setTipoDireccion('DOMICILIO')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Domicilio del Cliente (Entrega a Domicilio)
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {selectedCliente.direccion}, {selectedCliente.ciudad} CP {selectedCliente.cp} (Tel.{' '}
                      {selectedCliente.telefono})
                    </p>
                  </div>
                </label>

                {/* Home References Field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mt-2 mb-1">
                    Referencias del domicilio (Obligatorio)
                  </label>
                  <input
                    type="text"
                    value={referenciasDomicilio}
                    onChange={(e) => setReferenciasDomicilio(e.target.value)}
                    placeholder="Ej. Casa de altos, color café, barandal negro, portón blanco..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* PAYMENT TERMS (Step 11 - 16 Quincenas) */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">Plazos</label>
                  <span className="text-xs font-black bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                    16 Quincenas (Plazo Oficial Establecido)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Monto por cada quincena:</span>
                  <span className="text-sm font-black text-emerald-700">
                    ${(cartProduct.pagoQuincenal * cartQuantity).toFixed(2)} / quincena
                  </span>
                </div>
              </div>

              {/* Finalize Button */}
              <div className="pt-2">
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 px-4 bg-[#002B49] hover:bg-blue-900 text-white rounded-xl font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Finalizar Pedido</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP (Step 12-13) */}
      {isConfirmModalOpen && cartProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Confirmación de Pedido</h3>
                <p className="text-[11px] text-slate-500">Revisa que toda la información sea correcta</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Producto:</span>
                <span className="font-bold text-slate-800 text-right">{cartProduct.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente Asignado:</span>
                <span className="font-bold text-slate-800">{selectedCliente.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipo de Entrega:</span>
                <span className="font-bold text-slate-800">
                  {tipoDireccion === 'SUCURSAL' ? 'En Sucursal' : 'A Domicilio'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-700 font-bold">Plazo:</span>
                <span className="font-black text-emerald-700">
                  16 quincenas fijas de ${(cartProduct.pagoQuincenal * cartQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Modificar
              </button>
              <button
                onClick={handleFinalizeOrder}
                disabled={isSubmittingOrder}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isSubmittingOrder ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Aceptar y Concluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED ORDER TICKET MODAL */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                ¡Pedido Concluido con Éxito!
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Folio: {completedOrder.folio}</h3>
              <p className="text-xs text-slate-500 mt-1">
                El pedido ha sido registrado en SystemCore y cargado a tu línea LanaTienda.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Distribuidora:</span>
                <span className="font-bold text-slate-800">{completedOrder.distribuidoraNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-800">{completedOrder.clienteNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Artículo:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                  {completedOrder.producto.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipo de Entrega:</span>
                <span className="font-bold text-slate-800">{completedOrder.tipoEntrega}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-emerald-700">
                <span>16 Pagos Quincenales:</span>
                <span>${completedOrder.producto.pagoQuincenal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3 px-4 bg-[#002B49] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              Regresar a la Tienda
            </button>
          </div>
        </div>
      )}

      {/* ORDERS HISTORY MODAL FOR DISTRIBUIDORA */}
      {viewHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Mis Pedidos Realizados en LanaTienda</h3>
              </div>
              <button
                onClick={() => setViewHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {historyOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No tienes pedidos registrados aún.</p>
              ) : (
                historyOrders.map((order) => (
                  <div key={order.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{order.folio}</span>
                      <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {order.estatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Cliente: {order.clienteNombre}</span>
                      <span className="font-bold text-emerald-700">16 quincenas de ${order.producto.pagoQuincenal.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Entrega: {order.direccionEntrega}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#002B49] text-white border-t border-slate-800 mt-12 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-amber-400">LanA</span>
            <span className="text-lg font-bold text-white">tienda</span>
            <span className="text-white/50 pl-2">| Sistema Core LanAhora</span>
          </div>
          <p className="text-white/60 text-center sm:text-right">
            © 2026 Financiera LanAhora S.A.P.I. de C.V. SOFOM E.N.R. • Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-semibold">
          Cargando LanAtienda...
        </div>
      }
    >
      <TiendaContent />
    </Suspense>
  );
}
