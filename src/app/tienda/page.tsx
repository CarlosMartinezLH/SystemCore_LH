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
  ChevronDown,
  Share2,
  Copy,
  Info,
  Calendar,
  Lock,
  PackageCheck,
  Building2,
  AlertTriangle,
  Star,
  Sparkles,
  Zap,
  Flame,
  BadgePercent,
  Check,
  Eye,
  MessageCircle,
  ArrowUpRight,
  SlidersHorizontal,
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

function TiendaModernContent() {
  const searchParams = useSearchParams();
  const refSku = searchParams.get('sku') || searchParams.get('ref') || '';

  // Products & Categories
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

  // Checkout State
  const [selectedClienteId, setSelectedClienteId] = useState<string>(MOCK_CLIENTES_DEFAULT[0]?.id || '');
  const [tipoDireccion, setTipoDireccion] = useState<'SUCURSAL' | 'DOMICILIO'>('SUCURSAL');
  const [referenciasDomicilio, setReferenciasDomicilio] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Copy notification
  const [copiedLink, setCopiedLink] = useState(false);

  // Countdown timer for deals
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/tienda/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) setProducts(data.products);
      })
      .catch((err) => console.log('Using local fallback:', err));

    fetch('/api/tienda/distribuidora')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.distribuidora) {
          setDistribuidora(data.distribuidora);
          if (data.clientes) setClientes(data.clientes);
        }
      })
      .catch((err) => console.log('Using local fallback:', err));
  }, []);

  // WhatsApp referral link incoming
  useEffect(() => {
    if (refSku && products.length > 0) {
      const found = products.find((p) => p.sku.toLowerCase() === refSku.toLowerCase());
      if (found) setSelectedProduct(found);
    }
  }, [refSku, products]);

  // Premium Carousel Slides
  const banners = [
    {
      src: '/tienda/banners/banner_1.png',
      tag: '🔥 ESPECIAL NOVIEMBRE',
      title: 'Equipa tu Hogar y Familia sin Enganche',
      subtitle: 'Tus artículos favoritos a 16 quincenas fijas con cargo a tu distribuidora',
      cta: 'Ver Artículos Destacados',
    },
    {
      src: '/tienda/banners/banner_2.png',
      tag: '📺 PANTALLAS Y ENTRETENIMIENTO',
      title: 'Smart TV 4K y Audio de Alta Fidelidad',
      subtitle: 'Disfruta de la mejor tecnología pagando poco a poco cada quincena',
      cta: 'Explorar Electrónica',
    },
    {
      src: '/tienda/banners/banner_3.png',
      tag: '❄️ CONFORT TOTAL',
      title: 'Minisplits Inverter de Máximo Ahorro',
      subtitle: 'Entrega directa en tu domicilio o en tu sucursal más cercana',
      cta: 'Ver Climatización',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'TODOS' ||
        p.categoria.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Lo Más Vendido' && p.tag?.includes('MÁS VENDIDO'));
      const matchesQuery =
        !searchQuery ||
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchQuery.toLowerCase());
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
    const text = `¡Hola! Me interesó este producto en LanAtienda a 16 quincenas de $${product.pagoQuincenal.toFixed(
      2
    )}: ${product.nombre}. ¿Me ayudas a solicitarlo con tu crédito LanAhora? Aquí está el link: ${refUrl}`;
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
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* 1. TOP ANNOUNCEMENT BAR (Amazon/Mercado Libre Style) */}
      <div className="bg-[#001E33] text-white text-[11px] font-medium tracking-wide border-b border-white/10">
        <div className="w-full px-4 sm:px-8 xl:px-12 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>Financiamiento Oficial LanAhora</span>
            </span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline">
              Todos tus productos siempre a <strong>16 quincenas fijas</strong> sin comisiones ocultas
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>
                Entregas en: <strong>Saltillo, Coah.</strong>
              </span>
            </div>
            <span className="text-white/30">•</span>
            <a
              href="/"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
            >
              <span>SystemCore</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Corporate Navy & Luxury Gold) */}
      <header className="sticky top-0 z-40 bg-[#002B49] text-white shadow-lg border-b border-amber-400/30">
        <div className="w-full px-4 sm:px-8 xl:px-12 py-3.5 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <a href="/tienda" className="flex items-center gap-2 group shrink-0">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 px-3 py-1.5 rounded-xl shadow-md font-black tracking-tight group-hover:scale-105 transition duration-200">
              <span className="text-xl font-black">LanA</span>
              <span className="text-xl font-black tracking-tighter text-blue-950">tienda</span>
            </div>
            <div className="hidden lg:flex flex-col text-left pl-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 leading-none">
                Financiera LanAhora
              </span>
              <span className="text-[9px] text-white/60 font-semibold tracking-wide">
                Tienda Oficial a 16 Quincenas
              </span>
            </div>
          </a>

          {/* Luxury Global Search Bar */}
          <div className="flex-1 max-w-3xl xl:max-w-5xl mx-4">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Busca marcas, productos, pantallas, laptops o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-12 bg-white text-slate-900 rounded-full text-sm font-medium placeholder-slate-400 shadow-inner focus:outline-none focus:ring-3 focus:ring-amber-400 transition"
              />
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm hover:brightness-105 transition"
                title="Buscar"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Distribuidora Account & Cart Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isDistribuidoraLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={loadHistory}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/15 transition shadow-xs"
                >
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mis Pedidos</span>
                </button>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900/80 to-blue-950 border border-amber-400/50 rounded-xl px-3 py-1.5 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                    {distribuidora.distribuidoraNombre.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-[11px] font-bold text-white truncate max-w-[110px]">
                      {distribuidora.distribuidoraNombre}
                    </div>
                    <div className="text-[9px] text-amber-300 font-black tracking-wide">
                      Nivel {distribuidora.nivel}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition duration-200 transform hover:scale-[1.02]"
              >
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Ingreso Distribuidora</span>
                <span className="sm:hidden">Ingresar</span>
              </button>
            )}

            {/* Quick Cart / Status Pill */}
            {isDistribuidoraLoggedIn && (
              <button
                onClick={() => {
                  if (cartProduct) setCartProduct(cartProduct);
                  else if (products[0]) handleOpenCart(products[0]);
                }}
                className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition flex items-center justify-center"
                title="Carrito de Distribuidora"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartProduct ? 1 : 0}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Category & Deals Subnav */}
        <div className="bg-[#001E33] border-t border-white/10">
          <div className="w-full px-4 sm:px-8 xl:px-12 flex items-center gap-2 py-2 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('TODOS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                selectedCategory === 'TODOS'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Todo el Catálogo</span>
            </button>

            {TIENDA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.nombre)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  selectedCategory.toLowerCase() === cat.nombre.toLowerCase()
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cat.icono}</span>
                <span>{cat.nombre}</span>
                {cat.badge && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    {cat.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="ml-auto hidden md:flex items-center gap-4 text-slate-300 shrink-0 text-[11px] font-bold">
              <span className="text-emerald-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Envíos Seguros a Domicilio
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 16 Quincenas Fijas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN STORE CONTENT */}
      <main className="w-full px-4 sm:px-8 xl:px-12 py-6 flex-1 space-y-7">
        {/* Referral Callout Banner if coming from WhatsApp */}
        {refSku && selectedProduct && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-5 shadow-xl text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-5 border border-amber-300 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shrink-0 overflow-hidden shadow-md">
                <img src={selectedProduct.imagen} alt="" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <span className="bg-slate-950 text-amber-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block">
                  Solicitud Recibida por WhatsApp
                </span>
                <h3 className="font-black text-lg sm:text-xl text-slate-950 mt-1 leading-snug">
                  {selectedProduct.nombre}
                </h3>
                <p className="text-xs text-slate-800 font-semibold mt-0.5">
                  Monto a financiar: <strong>16 quincenas fijas de ${selectedProduct.pagoQuincenal.toFixed(2)}</strong>{' '}
                  (Total: ${selectedProduct.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })})
                </p>
              </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (!isDistribuidoraLoggedIn) setIsLoginModalOpen(true);
                  else handleOpenCart(selectedProduct);
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 group"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                <span>
                  {isDistribuidoraLoggedIn ? 'Procesar Pedido en Carrito' : 'Identificarme como Distribuidora'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* HERO SECTION WITH DUAL WIDGETS (Amazon/Mercado Libre Retail Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {/* Main Carousel Banner (Col Span 3 on lg, 4 on xl) */}
          <div className="lg:col-span-3 xl:col-span-4 relative rounded-3xl overflow-hidden shadow-xl bg-slate-950 h-64 sm:h-80 md:h-[420px] group">
            {banners.map((b, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  idx === activeBanner
                    ? 'opacity-100 scale-100 z-10'
                    : 'opacity-0 scale-105 z-0 pointer-events-none'
                }`}
              >
                <img src={b.src} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                  <span className="text-xs sm:text-sm font-black tracking-widest uppercase bg-amber-400 text-slate-950 px-3 py-1 rounded-full w-max shadow-sm">
                    {b.tag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mt-2 leading-tight max-w-2xl drop-shadow-md">
                    {b.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl font-medium drop-shadow">
                    {b.subtitle}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const el = document.getElementById('catalogo-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                    >
                      <span>{b.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-amber-300 font-bold hidden sm:inline">
                      16 Quincenas Fijas • Sin Enganche
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Dots */}
            <div className="absolute bottom-4 right-6 z-20 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeBanner ? 'w-8 bg-amber-400 shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side Retail Cards (Col Span 1) */}
          <div className="lg:col-span-1 flex flex-col gap-4 justify-between">
            {/* Card 1: Financiamiento sin enganche */}
            <div className="bg-gradient-to-br from-[#002B49] to-blue-950 text-white rounded-3xl p-5 shadow-lg flex-1 flex flex-col justify-between border border-blue-900">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>Tu Crédito LanAhora</span>
                </div>
                <h3 className="text-base font-black text-white mt-2 leading-snug">
                  Compra con tu Distribuidora Autorizada
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Elige cualquier artículo del catálogo y págalo en <strong>16 cómodas quincenas</strong>.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-amber-300 font-bold">16 Pagos Fijos</span>
                <span className="text-white/60">0% Enganche</span>
              </div>
            </div>

            {/* Card 2: Garantía Oficial 48 hrs */}
            <div className="bg-white rounded-3xl p-5 shadow-md flex-1 flex flex-col justify-between border border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Garantía Oficial</span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-2 leading-snug">
                  Protección de Entrega 48 Horas
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Cuentas con 48 hrs hábiles al recibir tu paquete para reportar cualquier detalle o daño de paquetería.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-black">Entrega en Sucursal o Casa</span>
                <span className="text-slate-400">100% Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FLASH DEALS TICKER WITH COUNTDOWN (Top E-Commerce Feature) */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-orange-600 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center font-black shadow-inner">
              <Flame className="w-6 h-6 fill-rose-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wide">Ofertas Quincenales Relámpago</span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Hasta 20% OFF
                </span>
              </div>
              <p className="text-xs text-rose-100">Aprovecha precios especiales pagando en 16 quincenas fijas.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-3.5 py-1.5 rounded-xl border border-white/20">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>Termina en:</span>
            <span className="bg-white text-rose-700 px-2 py-0.5 rounded-md font-mono font-black text-xs">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m :{' '}
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>

        {/* 5. VISUAL CATEGORY CIRCLES SHOWCASE (Mercado Libre Style) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Explora por Categoría</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Toca una categoría para filtrar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {TIENDA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.nombre)}
                className={`group flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 text-center ${
                  selectedCategory.toLowerCase() === cat.nombre.toLowerCase()
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:shadow-xs'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-xs mb-2 group-hover:scale-105 transition duration-300 border border-slate-100">
                  <img src={cat.imagen} alt={cat.nombre} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-900 leading-tight">
                  {cat.nombre}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">16 Quincenas</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. PRODUCTS CATALOG (The Star of the Show) */}
        <div id="catalogo-grid" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Catálogo de Productos Disponibles</span>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} Artículos
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Precios con entrega garantizada y financiamiento oficial a 16 quincenas
              </p>
            </div>

            {selectedCategory !== 'TODOS' && (
              <button
                onClick={() => setSelectedCategory('TODOS')}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>Mostrar todos los productos</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Product Cards Grid - Full Width Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {filteredProducts.map((product) => {
              const discountPercent = product.precioAnterior
                ? Math.round(((product.precioAnterior - product.precio) / product.precioAnterior) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Image & Badges */}
                  <div
                    className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Promo Tag */}
                    {product.tag && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-md tracking-wider">
                        {product.tag}
                      </span>
                    )}

                    {/* Discount Pill */}
                    {discountPercent > 0 && (
                      <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-md">
                        -{discountPercent}%
                      </span>
                    )}

                    {/* Quick overlay buttons */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="w-8 h-8 rounded-full bg-white/95 text-slate-800 shadow-md hover:bg-white flex items-center justify-center transition"
                        title="Vista rápida"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareModalProduct(product);
                        }}
                        className="w-8 h-8 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 flex items-center justify-center transition"
                        title="Enviar a mi distribuidora"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-bold uppercase tracking-wider truncate max-w-[140px]">
                          {product.categoria}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{product.rating || '4.9'}</span>
                          <span className="text-slate-400 font-normal">({product.reviewsCount || 100})</span>
                        </div>
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-blue-800 cursor-pointer transition leading-snug"
                        title={product.nombre}
                      >
                        {product.nombre}
                      </h3>
                    </div>

                    {/* Pricing Block (Modern Retail Dual Display) */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {/* Hero Quincenal Price */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Pago Quincenal Fijo
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-emerald-700 leading-none">
                            ${product.pagoQuincenal.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">/ quincena</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] font-bold text-slate-600">
                          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                            16 Quincenas
                          </span>
                          <span className="text-slate-500 font-semibold">
                            Total: ${product.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Cash comparison with strikethrough if discounted */}
                      {product.precioAnterior && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="line-through">
                            ${product.precioAnterior.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-emerald-700 font-bold">Ahorras ${product.precioAnterior - product.precio}</span>
                        </div>
                      )}

                      {/* Shipping free tag */}
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Envío seguro a domicilio o sucursal</span>
                      </div>

                      {/* Primary CTA: "¡Compra con tu distribuidora aquí!" */}
                      <div className="pt-1 flex flex-col gap-1.5">
                        <button
                          onClick={() => setShareModalProduct(product)}
                          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 group"
                        >
                          <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                          <span>¡Compra con tu distribuidora aquí!</span>
                        </button>

                        {isDistribuidoraLoggedIn && (
                          <button
                            onClick={() => handleOpenCart(product)}
                            className="w-full py-1.5 px-3 bg-[#002B49] hover:bg-blue-900 text-amber-300 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Cargar a mi Carrito</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 7. HIGH-END PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-6 border border-slate-200">
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-[#002B49] text-amber-300 px-2.5 py-1 rounded-full">
                  SKU: {selectedProduct.sku}
                </span>
                <span className="text-xs font-semibold text-slate-500">• {selectedProduct.categoria}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Container */}
                <div className="space-y-3">
                  <div className="aspect-square rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                    <img src={selectedProduct.imagen} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Producto nuevo y garantizado por Financiera LanAhora</span>
                  </div>
                </div>

                {/* Details & Calculator */}
                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span>{selectedProduct.rating || 4.9}</span>
                      <span className="text-slate-400">({selectedProduct.reviewsCount || 100} opiniones)</span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 leading-snug mt-1">
                      {selectedProduct.nombre}
                    </h2>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedProduct.descripcion}</p>
                  </div>

                  {/* 16 Quincenas Official Matrix */}
                  <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        Financiamiento LanAhora
                      </span>
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                        16 Quincenas Fijas
                      </span>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-700">Pago por Quincena:</span>
                      <span className="text-2xl font-black text-emerald-800">
                        ${selectedProduct.pagoQuincenal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-slate-600 pt-1">
                      <span>Precio Total de Contado:</span>
                      <span className="font-bold">
                        ${selectedProduct.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 italic pt-1 border-t border-emerald-200/60">
                      *El precio no incluye el seguro de canje opcional.
                    </p>
                  </div>

                  {/* Delivery & 48h Notice */}
                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <Truck className="w-4 h-4 text-blue-700" />
                      <span>Entrega estimada: {selectedProduct.diasEntrega} días hábiles</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      <strong>Garantía:</strong> Al recibir cuentas con <strong>48 hrs hábiles</strong> para reportar
                      algún daño o faltante.
                    </p>
                  </div>
                </div>
              </div>

              {/* Characteristics */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
                  Especificaciones Oficiales
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProduct.caracteristicas.map((c, i) => (
                    <div key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => setShareModalProduct(selectedProduct)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>¡Compra con tu distribuidora aquí!</span>
                </button>

                {isDistribuidoraLoggedIn ? (
                  <button
                    onClick={() => handleOpenCart(selectedProduct)}
                    className="w-full py-2.5 px-4 bg-[#002B49] hover:bg-blue-900 text-amber-400 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Agregar a Mi Carrito de Distribuidora</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold text-center transition"
                  >
                    ¿Eres Distribuidora? Inicia sesión con tus credenciales LanApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. SHARE WHATSAPP MODAL */}
      {shareModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Enviar Solicitud a tu Distribuidora</h3>
                  <p className="text-[10px] text-slate-500">Aprobación inmediata a 16 quincenas</p>
                </div>
              </div>
              <button
                onClick={() => setShareModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Elige a tu distribuidora de confianza en WhatsApp para enviarle la solicitud de:{' '}
              <strong>{shareModalProduct.nombre}</strong> a 16 quincenas de{' '}
              <strong>${shareModalProduct.pagoQuincenal.toFixed(2)}</strong>.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-2">
              <span className="truncate text-slate-600 font-mono text-[11px]">
                https://tienda.lanahora.com/ref?sku={shareModalProduct.sku}
              </span>
              <button
                onClick={() => copyReferralLink(shareModalProduct)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-800 font-bold shrink-0 text-xs flex items-center gap-1 shadow-xs"
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
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Abrir WhatsApp y Seleccionar Distribuidora</span>
              </a>

              <button
                onClick={() => {
                  setShareModalProduct(null);
                  if (isDistribuidoraLoggedIn) handleOpenCart(shareModalProduct);
                  else setIsLoginModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Soy la distribuidora (Procesar con mi cuenta)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DISTRIBUIDORA LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#002B49] text-amber-400 flex items-center justify-center shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Portal Distribuidora</h3>
                  <p className="text-[11px] text-slate-500">Mismos accesos que utilizas en tu LanApp</p>
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
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="ej. elena_distribuidora"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <p>
                  <strong>¿No cuentas con tus accesos?</strong> Comunícate con tu Coordinador de Negocios en tu
                  sucursal para activarlos de inmediato.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#002B49] hover:bg-blue-900 text-white rounded-2xl font-black text-xs shadow-lg transition"
              >
                Iniciar Sesión y Cargar Líneas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. CHECKOUT / MI CARRITO MODAL */}
      {cartProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-6 border border-slate-200">
            {/* Header */}
            <div className="bg-[#002B49] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  MI CARRITO • SOLICITUD DE PEDIDO A 16 QUINCENAS
                </h3>
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

              {/* Product Row */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <img
                  src={cartProduct.imagen}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase">SKU: {cartProduct.sku}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{cartProduct.nombre}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs">
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
                  <span className="text-base font-black text-slate-900">
                    ${(cartProduct.precio * cartQuantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* CREDIT MATRIX GAUGE CARD (Official Page 5/11) */}
              <div className="bg-gradient-to-br from-slate-950 via-[#002B49] to-blue-950 text-white rounded-3xl p-5 shadow-lg space-y-3.5 border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                      Distribuidora Acreditada
                    </span>
                    <h4 className="text-base font-black text-white">{distribuidora.distribuidoraNombre}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider block">Nivel</span>
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-sm">
                      {distribuidora.nivel}
                    </span>
                  </div>
                </div>

                {/* Lines Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <span className="text-[10px] text-amber-300 font-bold uppercase block">
                      Línea LanaTienda
                    </span>
                    <div className="text-xs text-white/80">
                      Total: ${distribuidora.lineaLanaTiendaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      Disponible: $
                      {distribuidora.disponibleLanaTienda.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
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
                <div className="bg-black/30 rounded-2xl p-3 text-[11px] text-white/80 space-y-1">
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

              {/* CLIENT SELECTOR */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                  Selecciona a tu Cliente
                </label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (Tel: {c.telefono})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 italic">
                  *Si tu cliente no se encuentra registrado deberá visitar la sucursal con su papelería oficial.
                </p>
              </div>

              {/* DELIVERY ADDRESS SELECTION */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                  Dirección de Entrega
                </label>

                {/* Sucursal */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    tipoDireccion === 'SUCURSAL'
                      ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
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
                    <span className="font-black text-slate-900 block flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      Domicilio de la Sucursal (Recoger en Sucursal)
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{distribuidora.sucursal}</p>
                  </div>
                </label>

                {/* Cliente */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    tipoDireccion === 'DOMICILIO'
                      ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
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
                    <span className="font-black text-slate-900 block flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Domicilio del Cliente (Entrega a Domicilio)
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {selectedCliente.direccion}, {selectedCliente.ciudad} CP {selectedCliente.cp} (Tel.{' '}
                      {selectedCliente.telefono})
                    </p>
                  </div>
                </label>

                {/* References */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mt-2 mb-1">
                    Referencias del domicilio (Obligatorio)
                  </label>
                  <input
                    type="text"
                    value={referenciasDomicilio}
                    onChange={(e) => setReferenciasDomicilio(e.target.value)}
                    placeholder="Ej. Casa de altos, fachada café, barandal negro..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* TERMS */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Plazo Oficial Fijo</span>
                  <span className="text-[10px] text-slate-400">16 pagos quincenales iguales</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-700">
                    ${(cartProduct.pagoQuincenal * cartQuantity).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">/ por quincena</span>
                </div>
              </div>

              {/* Finalize Button */}
              <div className="pt-2">
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={isSubmittingOrder}
                  className="w-full py-4 px-4 bg-[#002B49] hover:bg-blue-900 text-white rounded-2xl font-black text-sm shadow-xl transition flex items-center justify-center gap-2 group"
                >
                  <span>Finalizar y Autorizar Pedido</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. CONFIRMATION POPUP */}
      {isConfirmModalOpen && cartProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Confirmar Pedido Institucional</h3>
                <p className="text-[11px] text-slate-500">Verifica los detalles antes de concluir</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Producto:</span>
                <span className="font-bold text-slate-800 text-right">{cartProduct.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente Asignado:</span>
                <span className="font-bold text-slate-800">{selectedCliente.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modalidad de Entrega:</span>
                <span className="font-bold text-slate-800">
                  {tipoDireccion === 'SUCURSAL' ? 'En Sucursal' : 'A Domicilio'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-700 font-bold">Plazo:</span>
                <span className="font-black text-emerald-700">
                  16 quincenas de ${(cartProduct.pagoQuincenal * cartQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
              >
                Modificar
              </button>
              <button
                onClick={handleFinalizeOrder}
                disabled={isSubmittingOrder}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md"
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

      {/* 12. COMPLETED ORDER TICKET */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                ¡Pedido Registrado con Éxito!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Folio: {completedOrder.folio}</h3>
              <p className="text-xs text-slate-500 mt-1">
                El pedido ha sido cargado a tu línea LanaTienda y notificado a la mesa de control de SystemCore.
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
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-emerald-700">
                <span>16 Pagos Quincenales:</span>
                <span>${completedOrder.producto.pagoQuincenal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3.5 px-4 bg-[#002B49] hover:bg-blue-900 text-white rounded-2xl font-black text-xs shadow-lg transition"
            >
              Regresar al Catálogo
            </button>
          </div>
        </div>
      )}

      {/* 13. ORDERS HISTORY MODAL */}
      {viewHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Mis Pedidos en LanaTienda</h3>
              </div>
              <button
                onClick={() => setViewHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {historyOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No tienes pedidos registrados aún.</p>
              ) : (
                historyOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">{order.folio}</span>
                      <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {order.estatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Cliente: {order.clienteNombre}</span>
                      <span className="font-bold text-emerald-700">
                        16 quincenas de ${order.producto.pagoQuincenal.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Entrega: {order.direccionEntrega}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 14. MEGA FOOTER (Official SOFOM Regulatory & Security Compliance) */}
      <footer className="bg-[#001E33] text-white border-t border-white/10 mt-16 pt-12 pb-8 text-xs">
        <div className="w-full px-4 sm:px-8 xl:px-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-amber-400">LanA</span>
                <span className="text-2xl font-black text-white">tienda</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Plataforma de comercio electrónico de Financiera LanAhora S.A.P.I. de C.V. SOFOM E.N.R. Adquiere
                artículos de calidad financiados a 16 quincenas con tu distribuidora.
              </p>
            </div>

            <div>
              <h4 className="font-black text-amber-300 uppercase tracking-wider mb-3 text-[11px]">Categorías</h4>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li>Hogar y Electrodomésticos</li>
                <li>Smart TV y Electrónica</li>
                <li>Cómputo y Laptops</li>
                <li>Salud, Belleza y Cuidado Personal</li>
                <li>Moda, Equipaje y Accesorios</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-amber-300 uppercase tracking-wider mb-3 text-[11px]">Garantía y Entrega</h4>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li>48 horas hábiles para reporte de daños</li>
                <li>Envíos directos a domicilio</li>
                <li>Recolección en sucursal autorizada</li>
                <li>Rastreo de envíos en tiempo real</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-amber-300 uppercase tracking-wider mb-3 text-[11px]">Atención y Sucursales</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Sucursal Matriz: C. Hidalgo #382 Nte., Col. Centro, Saltillo, Coahuila C.P. 25000.
              </p>
              <div className="mt-3 text-amber-400 font-bold text-xs">Teléfono: 844 601 1797</div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[10px]">
            <p>© 2026 Financiera LanAhora S.A.P.I. de C.V. SOFOM E.N.R. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <span>Términos y Condiciones</span>
              <span>Aviso de Privacidad</span>
              <span>CONDUSEF</span>
              <span>CNBV</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-amber-400 font-bold text-sm">
          Cargando LanAtienda...
        </div>
      }
    >
      <TiendaModernContent />
    </Suspense>
  );
}
