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
  Check,
  Eye,
  MessageCircle,
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

function TiendaCoreContent() {
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

  // Distribuidora Auth & Data (SystemCore)
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

  // System Core Banners
  const banners = [
    {
      src: '/tienda/banners/banner_1.png',
      tag: 'FINANCIAMIENTO OFICIAL',
      title: 'Equipa tu Hogar y Familia sin Enganche',
      subtitle: 'Tus artículos favoritos a 16 quincenas fijas autorizadas por tu distribuidora LanAhora',
      cta: 'Ver Artículos Disponibles',
    },
    {
      src: '/tienda/banners/banner_2.png',
      tag: 'PANTALLAS & ENTRETENIMIENTO',
      title: 'Smart TV 4K y Audio de Alta Fidelidad',
      subtitle: 'La mejor tecnología con cargo a tu línea de crédito autorizada',
      cta: 'Explorar Electrónica',
    },
    {
      src: '/tienda/banners/banner_3.png',
      tag: 'CLIMATIZACIÓN & CONFORT',
      title: 'Minisplits Inverter de Máximo Ahorro',
      subtitle: 'Entrega directa en tu domicilio o en tu sucursal Saltillo Centro',
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
    const text = `¡Hola! Me interesó este producto en LanaTienda a 16 quincenas de $${product.pagoQuincenal.toFixed(
      2
    )}: ${product.nombre}. ¿Me ayudas a solicitarlo con tu crédito LanAhora? Aquí está el link oficial: ${refUrl} (Aviso de Seguridad: La compra solo se autoriza vía Vale digital, nunca entregues anticipos en efectivo).`;
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-amber-400 selection:text-slate-900 font-sans">
      {/* 1. TOP ANNOUNCEMENT BAR (SystemCore Slate-900 & Gold) */}
      <div className="bg-slate-900 text-slate-200 text-[11px] font-medium tracking-wide border-b border-slate-800">
        <div className="w-full px-4 sm:px-8 xl:px-12 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>Financiera LanAhora • Crédito en Vales y Tienda</span>
            </span>
            <span className="hidden md:inline text-slate-700">•</span>
            <span className="hidden md:inline">
              Plazo único institucional: <strong>16 quincenas fijas</strong> sin comisiones ocultas
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>
                Sucursal: <strong>Saltillo Centro (Hidalgo #382)</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (SystemCore Clean White & Official Logo) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="w-full px-4 sm:px-8 xl:px-12 py-3 flex items-center justify-between gap-4">
          {/* Official SystemCore Logo */}
          <a href="/tienda" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/lanahora-logo.png"
              alt="LanAhora"
              className="h-10 w-auto object-contain group-hover:scale-105 transition"
            />
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="bg-blue-600 text-white font-black text-xs px-2.5 py-0.5 rounded-lg tracking-wider uppercase shadow-xs">
                LanaTienda
              </span>
              <span className="hidden xl:inline-block text-[11px] font-semibold text-slate-400">
                16 Quincenas Fijas
              </span>
            </div>
          </a>

          {/* SystemCore Search Omnibar */}
          <div className="flex-1 max-w-2xl xl:max-w-4xl mx-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4" />
              <input
                type="text"
                placeholder="Buscar por artículo, marca, tecnología o SKU (ej. Maletín, Smart TV, Inverter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-24 bg-slate-100 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              />
              <button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* User & Distribuidora Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {isDistribuidoraLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={loadHistory}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mis Pedidos</span>
                </button>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {distribuidora.distribuidoraNombre.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {distribuidora.distribuidoraNombre}
                    </div>
                    <div className="text-[10px] text-blue-700 font-bold">
                      Nivel {distribuidora.nivel}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ingreso Distribuidora</span>
              </button>
            )}

            {/* Quick Cart Pill */}
            {isDistribuidoraLoggedIn && (
              <button
                onClick={() => {
                  if (cartProduct) setCartProduct(cartProduct);
                  else if (products[0]) handleOpenCart(products[0]);
                }}
                className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition"
                title="Carrito de Distribuidora"
              >
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartProduct ? 1 : 0}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Category Subnav */}
        <div className="bg-slate-50 border-t border-slate-200">
          <div className="w-full px-4 sm:px-8 xl:px-12 flex items-center gap-2 py-2 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('TODOS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                selectedCategory === 'TODOS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
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
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{cat.icono}</span>
                <span>{cat.nombre}</span>
              </button>
            ))}

            <div className="ml-auto hidden md:flex items-center gap-4 text-slate-500 shrink-0 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <Truck className="w-3.5 h-3.5" /> Envíos Seguros a Domicilio o Sucursal
              </span>
              <span className="flex items-center gap-1 text-blue-700 font-bold">
                <Calendar className="w-3.5 h-3.5" /> Siempre a 16 Quincenas Fijas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN STORE CONTENT (Full-Width) */}
      <main className="w-full px-4 sm:px-8 xl:px-12 py-6 flex-1 space-y-7">
        {/* Referral Callout Banner if coming from WhatsApp */}
        {refSku && selectedProduct && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 shadow-xs text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-5 border border-amber-300 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white p-1 shrink-0 overflow-hidden shadow-xs border border-amber-200">
                <img src={selectedProduct.imagen} alt="" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block">
                  Solicitud Recibida por WhatsApp
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-slate-900 mt-1 leading-snug">
                  {selectedProduct.nombre}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Financiamiento institucional: <strong>16 quincenas de ${selectedProduct.pagoQuincenal.toFixed(2)}</strong>{' '}
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
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>
                  {isDistribuidoraLoggedIn ? 'Procesar Pedido en Carrito' : 'Identificarme como Distribuidora'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* HERO SECTION WITH DUAL WIDGETS (Full-Width 5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {/* Main Carousel Banner (Col Span 3 on lg, 4 on xl) */}
          <div className="lg:col-span-3 xl:col-span-4 relative rounded-2xl overflow-hidden shadow-xs bg-slate-900 h-64 sm:h-80 md:h-[400px] group border border-slate-200">
            {banners.map((b, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  idx === activeBanner
                    ? 'opacity-100 z-10'
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img src={b.src} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                  <span className="text-xs font-bold tracking-wider uppercase bg-blue-600 text-white px-3 py-1 rounded-full w-max shadow-xs">
                    {b.tag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mt-2 leading-tight max-w-2xl">
                    {b.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl font-medium">
                    {b.subtitle}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const el = document.getElementById('catalogo-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>{b.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-amber-300 font-bold hidden sm:inline">
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
                    idx === activeBanner ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side Cards (Col Span 1) */}
          <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-4 justify-between">
            {/* Card 1: Financiamiento sin enganche */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-between border border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>Crédito LanAhora</span>
                </div>
                <h3 className="text-base font-bold text-white mt-2 leading-snug">
                  Compra con tu Distribuidora Autorizada
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Adquiere productos en línea a <strong>16 quincenas fijas</strong> con cargo a tu línea autorizada.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-amber-300 font-bold">16 Pagos Fijos</span>
                <span className="text-slate-400">Sin Enganche</span>
              </div>
            </div>

            {/* Card 2: Garantía Oficial 48 hrs */}
            <div className="bg-white rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-between border border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Garantía Oficial</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  Protección de Entrega 48 Horas
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Cuentas con 48 hrs hábiles tras recibir tu producto para reportar cualquier detalle o anomalía.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold">Entrega en Sucursal o Casa</span>
                <span className="text-slate-400">100% Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. VISUAL CATEGORY SHOWCASE (SystemCore Clean White) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Departamentos Disponibles</span>
            </h3>
            <span className="text-xs text-slate-400">Selecciona para filtrar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {TIENDA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.nombre)}
                className={`group flex flex-col items-center p-3 rounded-xl border transition text-center ${
                  selectedCategory.toLowerCase() === cat.nombre.toLowerCase()
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white mb-2 group-hover:scale-105 transition duration-200 border border-slate-200">
                  <img src={cat.imagen} alt={cat.nombre} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 leading-tight">
                  {cat.nombre}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">16 Quincenas</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. PRODUCTS CATALOG (Full-Width 6 Columns on wide screens) */}
        <div id="catalogo-grid" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Catálogo de Productos en Línea</span>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {filteredProducts.length} Artículos
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Todos los precios calculados automáticamente a 16 quincenas fijas
              </p>
            </div>

            {selectedCategory !== 'TODOS' && (
              <button
                onClick={() => setSelectedCategory('TODOS')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Mostrar todos los productos</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Full-Width Grid (1 to 6 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Image */}
                <div
                  className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Promo Tag */}
                  {product.tag && (
                    <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                      {product.tag}
                    </span>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                      className="w-7 h-7 rounded-full bg-white text-slate-700 shadow-xs hover:bg-slate-100 flex items-center justify-center transition border border-slate-200"
                      title="Ver detalle"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareModalProduct(product);
                      }}
                      className="w-7 h-7 rounded-full bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 flex items-center justify-center transition"
                      title="Enviar a mi distribuidora"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider truncate max-w-[130px]">
                        {product.categoria}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating || '4.9'}</span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 hover:text-blue-700 cursor-pointer transition leading-snug"
                      title={product.nombre}
                    >
                      {product.nombre}
                    </h3>
                  </div>

                  {/* Pricing Block */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-2">
                    {/* Hero Quincenal Price (SystemCore Blue Card) */}
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5">
                      <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                        Pago Quincenal Fijo
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-blue-700 leading-none">
                          ${product.pagoQuincenal.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-blue-900">/ quincena</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-semibold text-slate-600">
                        <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-bold">
                          16 Quincenas
                        </span>
                        <span className="text-slate-500">
                          Total: ${product.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Shipping free tag */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Entrega a domicilio o en sucursal</span>
                    </div>

                    {/* Primary CTA: "¡Compra con tu distribuidora aquí!" */}
                    <div className="pt-1 flex flex-col gap-1.5">
                      <button
                        onClick={() => setShareModalProduct(product)}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>¡Compra con tu distribuidora aquí!</span>
                      </button>

                      {isDistribuidoraLoggedIn && (
                        <button
                          onClick={() => handleOpenCart(product)}
                          className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cargar a mi Carrito</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 6. PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 my-6 border border-slate-200">
            {/* Top Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                  SKU: {selectedProduct.sku}
                </span>
                <span className="text-xs text-slate-500">• {selectedProduct.categoria}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo */}
                <div className="space-y-3">
                  <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                    <img src={selectedProduct.imagen} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Garantizado por Financiera LanAhora</span>
                  </div>
                </div>

                {/* Details & Calculator */}
                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {selectedProduct.nombre}
                    </h2>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedProduct.descripcion}</p>
                  </div>

                  {/* 16 Quincenas Official Matrix */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        Financiamiento LanAhora
                      </span>
                      <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full">
                        16 Quincenas Fijas
                      </span>
                    </div>

                    <div className="pt-2 border-t border-blue-200 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-700">Pago por Quincena:</span>
                      <span className="text-2xl font-black text-blue-700">
                        ${selectedProduct.pagoQuincenal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-slate-600 pt-1">
                      <span>Precio Total de Contado:</span>
                      <span className="font-bold">
                        ${selectedProduct.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 italic pt-1 border-t border-blue-200/50">
                      *El precio no incluye el seguro de canje opcional.
                    </p>
                  </div>

                  {/* Delivery & 48h Notice */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Entrega estimada: {selectedProduct.diasEntrega} días hábiles</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>Garantía:</strong> Al recibir cuentas con <strong>48 hrs hábiles</strong> para reportar
                      algún daño o faltante.
                    </p>
                  </div>
                </div>
              </div>

              {/* Characteristics */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Características del Artículo
                </h4>
                <div className="space-y-1.5">
                  {selectedProduct.caracteristicas.map((c, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => setShareModalProduct(selectedProduct)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>¡Compra con tu distribuidora aquí!</span>
                </button>

                {isDistribuidoraLoggedIn ? (
                  <button
                    onClick={() => handleOpenCart(selectedProduct)}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
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

      {/* 7. SHARE WHATSAPP MODAL */}
      {shareModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Enviar Solicitud a tu Distribuidora</h3>
                  <p className="text-[10px] text-slate-500">Compra a 16 quincenas fijas</p>
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
              Selecciona a tu distribuidora en WhatsApp para enviarle la solicitud de:{' '}
              <strong>{shareModalProduct.nombre}</strong> a 16 quincenas de{' '}
              <strong>${shareModalProduct.pagoQuincenal.toFixed(2)}</strong>.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
              <span className="truncate text-slate-600 font-mono text-[11px]">
                https://tienda.lanahora.com/ref?sku={shareModalProduct.sku}
              </span>
              <button
                onClick={() => copyReferralLink(shareModalProduct)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-800 font-bold shrink-0 text-xs flex items-center gap-1"
              >
                {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Aviso anti-ingeniería social / anti-fraude */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-950 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <strong className="font-bold text-amber-900 block mb-0.5">Aviso de Seguridad Anti-Fraude:</strong>
                LanAhora y sus Distribuidoras nunca te solicitarán depósitos personales o transferencias a OXXO. La compra se procesa 100% mediante tu Vale digital a 16 quincenas.
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={generateWhatsAppLink(shareModalProduct)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
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
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
              >
                Soy la distribuidora (Procesar con mi cuenta)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DISTRIBUIDORA LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/lanahora-icon.png" alt="LanAhora" className="w-8 h-8 object-contain" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Portal Distribuidora</h3>
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

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <p>
                  <strong>¿No cuentas con tus accesos?</strong> Comunícate con tu Coordinador de Negocios en tu
                  sucursal para activarlos de inmediato.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                Iniciar Sesión y Cargar Líneas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. CHECKOUT / MI CARRITO MODAL */}
      {cartProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 my-6 border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm uppercase tracking-wide">
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
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <img
                  src={cartProduct.imagen}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SKU: {cartProduct.sku}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{cartProduct.nombre}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-blue-700 font-bold">
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

              {/* CREDIT MATRIX GAUGE CARD (SystemCore Slate-900 Card) */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3.5 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Distribuidora Acreditada
                    </span>
                    <h4 className="text-base font-bold text-white">{distribuidora.distribuidoraNombre}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Nivel</span>
                    <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                      {distribuidora.nivel}
                    </span>
                  </div>
                </div>

                {/* Lines Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      Línea LanaTienda
                    </span>
                    <div className="text-xs text-slate-300">
                      Total: ${distribuidora.lineaLanaTiendaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      Disponible: $
                      {distribuidora.disponibleLanaTienda.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                    <span className="text-[10px] text-blue-400 font-bold uppercase block">Línea Personal</span>
                    <div className="text-xs text-slate-300">
                      Total: ${distribuidora.lineaPersonalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm font-black text-blue-300 mt-0.5">
                      Disponible: $
                      {distribuidora.disponiblePersonal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Tier deduction breakdown (Official Bronce $9,000 example) */}
                <div className="bg-black/30 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between font-bold text-amber-300">
                    <span>Límite Crédito Cliente Final ({distribuidora.nivel}):</span>
                    <span>
                      ${distribuidora.limiteClienteFinal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>(-) ValeLana con canje activo:</span>
                    <span>-${distribuidora.valelanaActivo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>(-) Kits de Belleza comprometidos:</span>
                    <span>
                      -${distribuidora.kitBellezaActivo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* CLIENT SELECTOR */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Selecciona a tu Cliente
                </label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Dirección de Entrega
                </label>

                {/* Sucursal */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    tipoDireccion === 'SUCURSAL'
                      ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
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
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Domicilio de la Sucursal (Recoger en Sucursal)
                    </span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{distribuidora.sucursal}</p>
                  </div>
                </label>

                {/* Cliente */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    tipoDireccion === 'DOMICILIO'
                      ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* TERMS */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Plazo Oficial Fijo</span>
                  <span className="text-[10px] text-slate-400">16 pagos quincenales iguales</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-700">
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
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>Finalizar y Autorizar Pedido</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. CONFIRMATION POPUP */}
      {isConfirmModalOpen && cartProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <CheckCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Confirmar Pedido Institucional</h3>
                <p className="text-[11px] text-slate-500">Verifica los detalles antes de concluir</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
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
                <span className="font-black text-blue-700">
                  16 quincenas de ${(cartProduct.pagoQuincenal * cartQuantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Modificar
              </button>
              <button
                onClick={handleFinalizeOrder}
                disabled={isSubmittingOrder}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isSubmittingOrder ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span>Aceptar y Concluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. COMPLETED ORDER TICKET */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 text-center border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                ¡Pedido Registrado con Éxito!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Folio: {completedOrder.folio}</h3>
              <p className="text-xs text-slate-500 mt-1">
                El pedido ha sido cargado a tu línea LanaTienda y notificado a la mesa de control de SystemCore.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-xs text-left border border-slate-200 space-y-2">
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
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-blue-700">
                <span>16 Pagos Quincenales:</span>
                <span>${completedOrder.producto.pagoQuincenal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
            >
              Regresar al Catálogo
            </button>
          </div>
        </div>
      )}

      {/* 12. ORDERS HISTORY MODAL */}
      {viewHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Mis Pedidos en LanaTienda</h3>
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
                  <div key={order.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{order.folio}</span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {order.estatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Cliente: {order.clienteNombre}</span>
                      <span className="font-bold text-blue-700">
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

      {/* 13. FOOTER (SystemCore Slate-900 Theme) */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 pt-12 pb-8 text-xs">
        <div className="w-full px-4 sm:px-8 xl:px-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src="/lanahora-logo.png"
                  alt="LanAhora"
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Plataforma de comercio electrónico de Financiera LanAhora S.A.P.I. de C.V. SOFOM E.N.R. Adquiere
                artículos de calidad financiados a 16 quincenas con tu distribuidora autorizada.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-3 text-[11px]">Departamentos</h4>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li>Hogar y Cocina</li>
                <li>Pantallas y Electrónica</li>
                <li>Cómputo y Laptops</li>
                <li>Salud y Belleza</li>
                <li>Moda y Equipaje</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-3 text-[11px]">Garantía y Entrega</h4>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li>48 horas hábiles para reporte de daños</li>
                <li>Envíos directos a domicilio</li>
                <li>Recolección en sucursal autorizada</li>
                <li>Rastreo y folios oficiales en tiempo real</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-3 text-[11px]">Sucursal Matriz</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                C. Hidalgo #382 Nte., Col. Centro, Saltillo, Coahuila C.P. 25000.
              </p>
              <div className="mt-3 text-amber-400 font-bold text-xs">Teléfono: 844 601 1797</div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[10px]">
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
      <TiendaCoreContent />
    </Suspense>
  );
}
