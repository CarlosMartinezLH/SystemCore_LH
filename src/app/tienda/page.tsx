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
  Heart,
  ShieldCheck,
  BadgeCheck,
  ArrowUpDown,
  Filter,
  Printer,
  ChevronLeft,
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
import { formatMoney } from '@/lib/utils/formatters';

function TiendaCoreContent() {
  const searchParams = useSearchParams();
  const refSku = searchParams.get('sku') || searchParams.get('ref') || '';

  // Products & Categories
  const [products, setProducts] = useState<LanaTiendaProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [activeBanner, setActiveBanner] = useState(0);
  const [sortBy, setSortBy] = useState<'featured' | 'quincena-asc' | 'quincena-desc' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Eliminado de tus favoritos' : '❤️ Guardado en tus favoritos');
      return next;
    });
  };

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<LanaTiendaProduct | null>(null);
  const [shareModalProduct, setShareModalProduct] = useState<LanaTiendaProduct | null>(null);
  const [cartProduct, setCartProduct] = useState<LanaTiendaProduct | null>(null);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
  const [metodoPago, setMetodoPago] = useState<'CREDITO_LANATIENDA' | 'LANAPUNTOS' | 'MIXTO'>('CREDITO_LANATIENDA');
  const [puntosCanjeados, setPuntosCanjeados] = useState<number>(0);

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
      tag: 'FINANCIAMIENTO INSTITUCIONAL',
      title: 'Equipa tu Hogar y Familia sin Enganche',
      subtitle: 'Tus artículos favoritos a 16 quincenas fijas autorizadas por tu distribuidora LanAhora.',
      cta: 'Ver Artículos Disponibles',
      badge: '16 Quincenas Fijas • 0% Enganche',
    },
    {
      src: '/tienda/banners/banner_2.png',
      tag: 'CRÉDITO LANAHORA',
      title: 'Compra con tu Distribuidora Autorizada',
      subtitle: 'Solicita productos en línea con cargo a tu línea autorizada sin desembolso inicial.',
      cta: 'Solicitar con Distribuidora',
      badge: '16 Pagos Fijos • Sin Enganche',
    },
    {
      src: '/tienda/banners/banner_3.png',
      tag: 'GARANTÍA OFICIAL LANAHORA',
      title: 'Protección de Entrega y Garantía 48 Horas',
      subtitle: 'Recibe en tu sucursal Saltillo Centro o en tu domicilio con total respaldo de reposición.',
      cta: 'Conocer Beneficios',
      badge: 'Entrega en Sucursal o Casa • 100% Seguro',
    },
    {
      src: '/tienda/banners/banner_2.png',
      tag: 'PANTALLAS & ENTRETENIMIENTO',
      title: 'Smart TV 4K y Audio de Alta Fidelidad',
      subtitle: 'La mejor tecnología con cargo a tu línea autorizada y canje de LanaPuntos acumulados.',
      cta: 'Explorar Electrónica',
      badge: 'Garantía Oficial • Envío Rápido',
    },
    {
      src: '/tienda/banners/banner_1.png',
      tag: 'CLIMATIZACIÓN & CONFORT',
      title: 'Minisplits Inverter de Máximo Ahorro',
      subtitle: 'Precios preferenciales y pagos quincenales congelados durante todo tu plazo.',
      cta: 'Ver Climatización',
      badge: 'Ahorro Inverter • Respaldo LanAhora',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Filtered and sorted list
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
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

    switch (sortBy) {
      case 'quincena-asc':
        return [...list].sort((a, b) => a.pagoQuincenal - b.pagoQuincenal);
      case 'quincena-desc':
        return [...list].sort((a, b) => b.pagoQuincenal - a.pagoQuincenal);
      case 'price-asc':
        return [...list].sort((a, b) => a.precio - b.precio);
      case 'price-desc':
        return [...list].sort((a, b) => b.precio - a.precio);
      case 'rating':
        return [...list].sort((a, b) => (b.rating || 5) - (a.rating || 5));
      default:
        return list;
    }
  }, [products, selectedCategory, searchQuery, sortBy]);

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
    setMetodoPago('CREDITO_LANATIENDA');
    setPuntosCanjeados(0);
  };

  const handleFinalizeOrder = async () => {
    if (!cartProduct) return;
    setIsSubmittingOrder(true);
    setOrderError('');

    const totalOrden = cartProduct.precio * cartQuantity;
    const finalPuntos =
      metodoPago === 'LANAPUNTOS'
        ? totalOrden
        : metodoPago === 'MIXTO'
        ? puntosCanjeados
        : 0;

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
      metodoPago,
      puntosCanjeados: finalPuntos,
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
          disponibleLanaTienda:
            data.disponibleRestante !== undefined ? data.disponibleRestante : prev.disponibleLanaTienda,
          monedero:
            data.monederoRestante !== undefined ? data.monederoRestante : prev.monedero,
        }));
        setCartProduct(null);
      } else {
        setOrderError(data.error || 'No fue posible registrar el pedido');
      }
    } catch (err: any) {
      setOrderError(err.message || 'Error de conexión');
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
    const text = `¡Hola! Me interesó este producto en LanaTienda a 16 quincenas de ${formatMoney(product.pagoQuincenal)}: ${product.nombre}. ¿Me ayudas a solicitarlo con tu crédito LanAhora? Aquí está el link oficial: ${refUrl} (Aviso de Seguridad: La compra solo se autoriza vía Vale digital, nunca entregues anticipos en efectivo).`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const copyReferralLink = (product: LanaTiendaProduct) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tienda.lanahora.com';
    const refUrl = `${origin}/tienda?sku=${encodeURIComponent(product.sku)}`;
    navigator.clipboard.writeText(refUrl);
    setCopiedLink(true);
    showToast('✓ Enlace de producto copiado al portapapeles');
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
          <a href="/tienda" className="flex items-center shrink-0 group" title="LanAhora Tienda">
            <img
              src="/lanahora-logo.png"
              alt="LanAhora"
              className="h-9 sm:h-10 w-auto object-contain group-hover:opacity-90 transition"
            />
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
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {distribuidora.distribuidoraNombre.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                      {distribuidora.distribuidoraNombre}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                      <span className="text-blue-700 font-bold">Nivel {distribuidora.nivel}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {distribuidora.monedero.toLocaleString()} pts
                      </span>
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
                  Financiamiento institucional: <strong>16 quincenas de {formatMoney(selectedProduct.pagoQuincenal)}</strong>{' '}
                  (Total: {formatMoney(selectedProduct.precio)})
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

        {/* HERO CAROUSEL BANNER (Full-Width) */}
        <div className="w-full relative rounded-3xl overflow-hidden shadow-lg bg-slate-900 h-72 sm:h-96 md:h-[440px] group border border-slate-200/80">
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-12 text-white">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <span className="text-xs font-black tracking-wider uppercase bg-blue-600 text-white px-3.5 py-1 rounded-full shadow-xs">
                    {b.tag}
                  </span>
                  <span className="text-xs font-bold text-amber-300 bg-slate-900/80 backdrop-blur-xs px-3 py-1 rounded-full border border-amber-400/30 hidden sm:inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.badge}</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mt-1 leading-tight max-w-3xl drop-shadow-md">
                  {b.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-200 mt-2 max-w-2xl font-medium leading-relaxed drop-shadow-xs">
                  {b.subtitle}
                </p>
                <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('catalogo-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>{b.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs sm:text-sm text-slate-300 font-semibold px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs">
                    16 Quincenas Fijas • Sin Enganche
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Navigation Arrows */}
          <button
            onClick={() => setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/50 hover:bg-slate-950/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl border border-white/10"
            title="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/50 hover:bg-slate-950/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl border border-white/10"
            title="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slider Dots */}
          <div className="absolute bottom-5 right-6 sm:right-8 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeBanner ? 'w-9 bg-amber-400' : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
                title={`Banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* PROMO BANNERS HORIZONTALES (Full-Width Dual Banners) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Banner 1: Crédito LanAhora */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/40 transition">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Crédito LanAhora</span>
                </div>
                <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  16 Pagos Fijos
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-3.5 leading-snug">
                Compra con tu Distribuidora Autorizada
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                Adquiere productos en línea a <strong>16 quincenas fijas</strong> con cargo directo a tu línea autorizada. Sin enganches ni trámites complicados.
              </p>
            </div>
            <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <span className="text-emerald-400 font-bold">✓ 0% Enganche</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="text-slate-300 hidden sm:inline">Aprobación Inmediata</span>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('catalogo-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner 2: Garantía Oficial */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-xs border border-blue-900/50 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  <span>Garantía Oficial</span>
                </div>
                <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  100% Seguro
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-3.5 leading-snug">
                Protección de Entrega 48 Horas
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                Cuentas con 48 hrs hábiles tras recibir tu producto para reportar cualquier detalle o anomalía con reposición y respaldo total.
              </p>
            </div>
            <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <span className="text-teal-300 font-bold">✓ Sucursal o Domicilio</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="text-slate-300 hidden sm:inline">Soporte Directo</span>
              </div>
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                <span>Respaldo LanAhora</span>
              </span>
            </div>
          </div>
        </div>

        {/* TRUST VALUE PROPOSITIONS BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-150 font-black text-sm">
              16Q
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">16 Quincenas Fijas</span>
              <span className="text-[11px] text-slate-500">Sin desembolso inicial</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <Sparkles className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Monedero LanaPuntos</span>
              <span className="text-[11px] text-slate-500">1 pt = $1.00 MXN para canje</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Envío Garantizado</span>
              <span className="text-[11px] text-slate-500">A domicilio o en sucursal</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Garantía Oficial 48h</span>
              <span className="text-[11px] text-slate-500">Respaldo directo LanAhora</span>
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
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
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

        {/* 5. PRODUCTS CATALOG TOOLBAR */}
        <div id="catalogo-grid" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{selectedCategory === 'TODOS' ? 'Catálogo General' : selectedCategory}</span>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {filteredProducts.length} Artículos
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  16 pagos quincenales calculados automáticamente
                </p>
              </div>

              {selectedCategory !== 'TODOS' && (
                <button
                  onClick={() => setSelectedCategory('TODOS')}
                  className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1 border border-blue-200"
                >
                  <span>Ver Todos</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting & Filter Controls */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">★ Más Populares</option>
                  <option value="quincena-asc">↓ Menor Pago Quincenal</option>
                  <option value="quincena-desc">↑ Mayor Pago Quincenal</option>
                  <option value="price-asc">↓ Menor Precio Total</option>
                  <option value="price-desc">↑ Mayor Precio Total</option>
                  <option value="rating">★ Mejor Calificados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Full-Width Grid (1 to 6 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {filteredProducts.map((product) => {
              const isFav = favorites.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Promo Tag */}
                    {product.tag && (
                      <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                        {product.tag}
                      </span>
                    )}

                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs ${
                        isFav
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200'
                      }`}
                      title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>

                    {/* Bottom floating badge: 16 Quincenas */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="bg-slate-900/85 backdrop-blur-xs text-amber-300 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                        16 Quincenas
                      </span>
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="w-7 h-7 rounded-full bg-white text-slate-700 shadow-md hover:bg-slate-100 flex items-center justify-center transition border border-slate-200"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareModalProduct(product);
                        }}
                        className="w-7 h-7 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 flex items-center justify-center transition"
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

                    {/* Pricing Block with elevated visual depth */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/70 rounded-xl p-2.5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                              16 pagos de
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-xl font-black text-blue-700 leading-none">
                                {formatMoney(product.pagoQuincenal)}
                              </span>
                              <span className="text-[11px] font-bold text-blue-900">/ quincena</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                              Total Contado
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {formatMoney(product.precio)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Direct 1-Click Buy Button */}
                      <button
                        onClick={() => handleOpenCart(product)}
                        className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                        <span>Comprar a 16 quincenas</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BENEFICIOS INSTITUCIONALES TIENDA.LANAHORA.COM */}
          <div className="pt-12 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Envío Garantizado */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                  <ShieldAlert className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Envío garantizado</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Todas tus compras con envío seguro y respaldo oficial.</p>
                </div>
              </div>

              {/* Envío Rápido */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                  <Truck className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Envío rápido</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Cualquier parte de la República Mexicana o en sucursal.</p>
                </div>
              </div>

              {/* Gran Calidad */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Star className="w-6 h-6 fill-emerald-500 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Gran Calidad</h4>
                  <p className="text-xs text-slate-500 mt-0.5">En todos nuestros productos seleccionados de catálogo.</p>
                </div>
              </div>
            </div>
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
                        {formatMoney(selectedProduct.pagoQuincenal)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-slate-600 pt-1">
                      <span>Precio Total de Contado:</span>
                      <span className="font-bold">
                        {formatMoney(selectedProduct.precio)}
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
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleOpenCart(selectedProduct)}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-300" />
                  <span>Comprar a 16 quincenas</span>
                </button>
                <button
                  onClick={() => setShareModalProduct(selectedProduct)}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
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
              <strong>{formatMoney(shareModalProduct.pagoQuincenal)}</strong>.
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

      {/* 9. CHECKOUT FINTECH EN 1 CLIC (LanaTienda Direct) */}
      {cartProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-4 border border-slate-200/80">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-amber-400 flex items-center justify-center border border-amber-400/30">
                  <ShoppingCart className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <span>Finalizar Pedido</span>
                    <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                      16 Quincenas
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Sin comisiones ocultas • Respaldo oficial</p>
                </div>
              </div>
              <button
                onClick={() => setCartProduct(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {orderError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{orderError}</span>
                </div>
              )}

              {/* Paso 1: Product Snapshot with Quantity Stepper */}
              <div className="flex items-center gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                <img
                  src={cartProduct.imagen}
                  alt={cartProduct.nombre}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SKU: {cartProduct.sku}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{cartProduct.nombre}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className="text-blue-700 font-black">
                      16 pagos de {formatMoney(cartProduct.pagoQuincenal)}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      (Total {formatMoney(cartProduct.precio)})
                    </span>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCartQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-900">{cartQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setCartQuantity((q) => Math.min(10, q + 1))}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Paso 2: Modalidad de Entrega */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Modalidad de Entrega</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Envío Garantizado
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTipoDireccion('SUCURSAL')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 relative ${
                      tipoDireccion === 'SUCURSAL'
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tipoDireccion === 'SUCURSAL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-slate-900 block">Recoger en Sucursal</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        Saltillo Centro (Hidalgo #382 Nte.)
                      </span>
                      <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded">
                        Listo para recoger
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoDireccion('DOMICILIO')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 relative ${
                      tipoDireccion === 'DOMICILIO'
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tipoDireccion === 'DOMICILIO' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-slate-900 block">Envío a Domicilio</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        Directo a tu dirección
                      </span>
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                        Entrega 48-72 hrs
                      </span>
                    </div>
                  </button>
                </div>

                {tipoDireccion === 'DOMICILIO' && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={referenciasDomicilio}
                      onChange={(e) => setReferenciasDomicilio(e.target.value)}
                      placeholder="Calle, número exterior/interior, colonia y referencias de entrega..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Paso 3: Titular del Pedido */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Titular de la Solicitud
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedClienteId}
                    onChange={(e) => setSelectedClienteId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span className="text-slate-400">Teléfono:</span>
                    <span className="font-bold text-slate-800">{selectedCliente.telefono}</span>
                  </div>
                </div>
              </div>

              {/* Paso 4: Forma de Pago */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>3. Forma de Pago</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {distribuidora.monedero.toLocaleString()} LanaPuntos en monedero
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoPago('CREDITO_LANATIENDA');
                      setPuntosCanjeados(0);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      metodoPago === 'CREDITO_LANATIENDA'
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>16 Quincenas</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Sin desembolso hoy</p>
                    </div>
                    <div className="text-[11px] text-blue-700 font-black mt-2">
                      16 x {formatMoney((cartProduct.precio * cartQuantity) / 16)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMetodoPago('LANAPUNTOS');
                      setPuntosCanjeados(cartProduct.precio * cartQuantity);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      metodoPago === 'LANAPUNTOS'
                        ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>LanaPuntos</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">100% con saldo</p>
                    </div>
                    <div className="text-[11px] text-amber-700 font-black mt-2">
                      {Math.round(cartProduct.precio * cartQuantity).toLocaleString()} pts
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMetodoPago('MIXTO');
                      const total = cartProduct.precio * cartQuantity;
                      const maxCanje = Math.min(distribuidora.monedero || 3000, Math.floor(total * 0.5));
                      setPuntosCanjeados(maxCanje > 0 ? maxCanje : 0);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      metodoPago === 'MIXTO'
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pago Mixto</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Puntos + Quincenas</p>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-black mt-2">
                      Descuento
                    </div>
                  </button>
                </div>

                {metodoPago === 'MIXTO' && (
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 mt-2 text-xs animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Puntos a aplicar como anticipo:</span>
                      <span className="font-black text-emerald-700">
                        {puntosCanjeados.toLocaleString()} pts (-{formatMoney(puntosCanjeados)})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max={Math.min(distribuidora.monedero || 3000, cartProduct.precio * cartQuantity)}
                      step="50"
                      value={puntosCanjeados}
                      onChange={(e) => setPuntosCanjeados(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Mínimo 100 pts</span>
                      <span>Máx: {Math.min(distribuidora.monedero || 3000, cartProduct.precio * cartQuantity).toLocaleString()} pts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Paso 5: Resumen Financiero & Confirmar en 1 Clic */}
              {(() => {
                const total = cartProduct.precio * cartQuantity;
                const puntosUsados =
                  metodoPago === 'LANAPUNTOS'
                    ? total
                    : metodoPago === 'MIXTO'
                    ? puntosCanjeados
                    : 0;
                const montoFinanciado = Math.max(0, total - puntosUsados);
                const pagoQuincenal = montoFinanciado / 16;
                const puntosInsuficientes =
                  metodoPago === 'LANAPUNTOS' && (distribuidora.monedero || 3000) < total;

                return (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Total del pedido:</span>
                      <span className="font-bold text-slate-900">{formatMoney(total)}</span>
                    </div>

                    {puntosUsados > 0 && (
                      <div className="flex items-center justify-between text-xs text-amber-700 font-bold">
                        <span>Anticipo con LanaPuntos:</span>
                        <span>-{formatMoney(puntosUsados)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/80 p-4 rounded-2xl shadow-2xs">
                      <div>
                        <span className="text-xs font-black text-blue-950 uppercase tracking-wide block">
                          {montoFinanciado > 0 ? 'Plan a 16 Quincenas Fijas' : 'Liquidación con Puntos'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {montoFinanciado > 0 ? 'Sin enganche • Cargo a tu cuenta' : 'Sin pagos quincenales'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-blue-700">
                          {montoFinanciado > 0 ? `${formatMoney(pagoQuincenal)}` : '$0.00'}
                        </span>
                        {montoFinanciado > 0 && (
                          <span className="text-[10px] font-bold text-blue-900 block">/ por quincena</span>
                        )}
                      </div>
                    </div>

                    {puntosInsuficientes && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Saldo insuficiente de LanaPuntos para liquidar esta orden.</span>
                      </div>
                    )}

                    {/* Botón directo de confirmación en 1 clic */}
                    <button
                      type="button"
                      onClick={handleFinalizeOrder}
                      disabled={isSubmittingOrder || puntosInsuficientes}
                      className="w-full py-4 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2.5"
                    >
                      {isSubmittingOrder ? (
                        <span>Procesando tu pedido...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-amber-300" />
                          <span>
                            {montoFinanciado > 0
                              ? `Confirmar Compra • 16 quincenas de ${formatMoney(pagoQuincenal)}`
                              : 'Confirmar Canje con LanaPuntos'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 11. COMPLETED ORDER TICKET (Digital Voucher UI) */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center border border-slate-200">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full inline-block shadow-2xs">
                ¡Compra Confirmada con Éxito!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                Folio: {completedOrder.folio}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cargado a tu línea de crédito oficial y enviado al centro de distribución.
              </p>
            </div>

            {/* Digital Receipt Card */}
            <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left border border-slate-200/90 space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Titular / Cliente:</span>
                <span className="font-bold text-slate-900">{completedOrder.clienteNombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Artículo:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]" title={completedOrder.producto.nombre}>
                  {completedOrder.producto.nombre}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Modalidad:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.tipoEntrega === 'SUCURSAL' ? '🏢 Recoger en Sucursal' : '🚚 A Domicilio'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Forma de Pago:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.metodoPago === 'LANAPUNTOS'
                    ? '100% LanaPuntos'
                    : completedOrder.metodoPago === 'MIXTO'
                    ? 'Pago Mixto'
                    : '16 Quincenas Fijas'}
                </span>
              </div>

              {completedOrder.creditoCoreId ? (
                <div className="flex justify-between items-center text-blue-700 font-bold border-t border-dashed border-slate-200 pt-2">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Contrato Core:
                  </span>
                  <span className="font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                    CR-LT-{completedOrder.creditoCoreId}
                  </span>
                </div>
              ) : null}

              {completedOrder.ordenCompraProveedor ? (
                <div className="flex justify-between items-center text-emerald-800 font-bold">
                  <span className="flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5" />
                    PO Proveedor API:
                  </span>
                  <span className="font-mono text-[11px]">
                    {completedOrder.ordenCompraProveedor}
                  </span>
                </div>
              ) : null}

              {completedOrder.guiaEnvio ? (
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Guía {completedOrder.paqueteria || 'FedEx'}:
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-[11px]">
                    {completedOrder.guiaEnvio}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between items-center border-t border-slate-200 pt-2.5 font-bold text-blue-700">
                <span className="text-slate-800">16 Pagos Quincenales:</span>
                <span className="text-sm font-black">
                  {completedOrder.montoFinanciado && completedOrder.montoFinanciado > 0
                    ? `${formatMoney(completedOrder.montoFinanciado / 16)}/qna`
                    : '$0.00 (Liquidado)'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-xs transition"
              >
                Listo
              </button>
            </div>
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
                        16 quincenas de {formatMoney(order.producto.pagoQuincenal)}
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

      {/* 13. FOOTER CORPORATIVO OFICIAL LANAHORA */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 pt-12 pb-8 text-xs">
        <div className="w-full px-4 sm:px-8 xl:px-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Historia oficial */}
            <div className="space-y-3">
              <div>
                <div className="inline-flex items-center bg-white px-3.5 py-2 rounded-xl shadow-xs border border-slate-700/50">
                  <img
                    src="/lanahora-logo.png"
                    alt="LanAhora"
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </div>
              <h4 className="font-bold text-amber-400 text-sm">Financiera LanAhora</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                LanAhora nace en el 2011 en la Ciudad de Monterrey, estamos en la ciudad de Saltillo desde el mes de
                abril del 2015 y en la ciudad de Gómez Palacio Durango desde el mes de Junio 2017. A la fecha tenemos más
                de 1000 distribuidoras exitosas.
              </p>
            </div>

            {/* Enlaces Oficiales */}
            <div>
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-3 text-[11px]">Enlaces</h4>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li>
                  <a
                    href="https://lanahora.com/lineas-de-credito/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <span>Líneas de créditos</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://lanahora.com/distribuidora/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <span>Distribuidores</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://lanahora.com/formas-de-pago-2/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <span>Formas de pago</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://lanahora.com/aviso-privacidad/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <span>Aviso de privacidad</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://tienda.lanahora.com/#"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <span>Términos y condiciones</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <span className="text-amber-300 font-bold block pt-1">
                    Contacto para Garantías (Reporte de 48 hrs hábiles)
                  </span>
                </li>
              </ul>
            </div>

            {/* Síguenos */}
            <div>
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-3 text-[11px]">Síguenos</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed mb-3">
                Síguenos en redes sociales y entérate de lo último en noticias y eventos de la empresa.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="https://facebook.com/lanahora"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-200 transition font-bold"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com/lanahora"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-pink-600 rounded-lg text-slate-200 transition font-bold"
                >
                  Instagram
                </a>
                <a
                  href="https://wa.me/528446011797"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 rounded-lg text-slate-200 transition font-bold"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Sucursales */}
            <div>
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-3 text-[11px]">Sucursales</h4>
              <div className="space-y-2 text-slate-300 text-[11px]">
                <div>
                  <strong className="text-white block">Saltillo Centro (Sucursal Matriz):</strong>
                  <span>C. Hidalgo #382 Nte., Col. Centro, Saltillo Coah. CP 25000</span>
                </div>
                <div>
                  <strong className="text-white block">Gómez Palacio (Durango):</strong>
                  <span>Calle Victoria #730, Centro, Gómez Palacio, Dgo.</span>
                </div>
                <div>
                  <strong className="text-white block">Monterrey (Nuevo León):</strong>
                  <span>Presencia institucional desde 2011</span>
                </div>
              </div>
              <div className="mt-3">
                <a
                  href="/#sucursales"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition"
                >
                  <span>Ver Sucursales</span>
                  <Building2 className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[10px]">
            <p>© 2026 Financiera LanAhora S.A.P.I. de C.V. SOFOM E.N.R. Más de 1000 distribuidoras autorizadas.</p>
            <div className="flex gap-4">
              <a href="https://lanahora.com/aviso-privacidad/" target="_blank" rel="noreferrer" className="hover:underline">
                Aviso de Privacidad
              </a>
              <span>•</span>
              <span>Términos y Condiciones</span>
              <span>•</span>
              <span>CONDUSEF</span>
              <span>•</span>
              <span>CNBV</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modern Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
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
