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
  Menu,
  ChevronUp,
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
  TiendaCategory,
} from '@/lib/data/tiendaData';
import { formatMoney } from '@/lib/utils/formatters';

// Brand detector helper
function getProductBrand(product: LanaTiendaProduct): string {
  const name = (product.nombre || '').toUpperCase();
  const sku = (product.sku || '').toUpperCase();
  if (name.includes('SAMSUNG') || sku.startsWith('SAM')) return 'SAMSUNG';
  if (name.includes('AMAZON') || name.includes('ALEXA') || sku.startsWith('AMZ')) return 'AMAZON';
  if (name.includes('GHIA') || sku.startsWith('GHI')) return 'GHIA';
  if (name.includes('ZMAX') || sku.startsWith('ZMX')) return 'ZMAX';
  if (name.includes('HP') || sku.startsWith('HP')) return 'HP';
  if (name.includes('MIRAGE') || sku.startsWith('MIR')) return 'MIRAGE';
  if (name.includes('YORK') || sku.startsWith('YRK')) return 'YORK';
  if (name.includes('ACER') || sku.startsWith('ACE')) return 'ACER';
  if (name.includes('FRIKKO') || sku.startsWith('FRK')) return 'FRIKKO';
  if (name.includes('OSTER') || sku.startsWith('OST')) return 'OSTER';
  if (name.includes('PINO') || name.includes('NAVIDAD') || sku.startsWith('PIN')) return 'HOLIDAY TIME';
  return 'LANATIENDA';
}

function TiendaCoreContent() {
  const searchParams = useSearchParams();
  const refSku = searchParams.get('sku') || searchParams.get('ref') || '';

  // Products & Categories
  const [products, setProducts] = useState<LanaTiendaProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedDeliveryFilter, setSelectedDeliveryFilter] = useState<string>('all');
  const [activeBanner, setActiveBanner] = useState(0);
  const [sortBy, setSortBy] = useState<'featured' | 'quincena-asc' | 'quincena-desc' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mega-menu and UI States
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaDept, setActiveMegaDept] = useState<TiendaCategory>(TIENDA_CATEGORIES[0]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeStore, setActiveStore] = useState('Saltillo Centro');
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

  // PDP Modal State
  const [selectedProduct, setSelectedProduct] = useState<LanaTiendaProduct | null>(null);
  const [pdpSelectedImageIndex, setPdpSelectedImageIndex] = useState(0);
  const [pdpSelectedDelivery, setPdpSelectedDelivery] = useState<'DOMICILIO' | 'SUCURSAL'>('DOMICILIO');
  const [pdpQuantity, setPdpQuantity] = useState(1);
  const [isStoreStockAccordionOpen, setIsStoreStockAccordionOpen] = useState(false);
  const [pdpActiveTab, setPdpActiveTab] = useState<'specs' | 'warranty' | 'shipping'>('specs');

  // Checkout and Secondary Modals
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
  const [copiedLink, setCopiedLink] = useState(false);

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
      if (found) {
        setSelectedProduct(found);
        setPdpSelectedImageIndex(0);
        setPdpQuantity(1);
      }
    }
  }, [refSku, products]);

  // System Core Panoramic Banners
  const banners = [
    {
      src: '/tienda/banners/banner_1.png',
      alt: 'Equipa tu Hogar y Familia sin Enganche - Financiera LanAhora',
      categoria: 'TODOS',
    },
    {
      src: '/tienda/banners/banner_2.png',
      alt: 'Smart TV, Computadoras y Audio a 16 Quincenas Fijas',
      categoria: 'Electrónica y Smart Home',
    },
    {
      src: '/tienda/banners/banner_3.png',
      alt: 'Minisplits Inverter y Climatización - Entrega Inmediata',
      categoria: 'Hogar y Cocina',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Available brands and counts
  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const b = getProductBrand(p);
      map[b] = (map[b] || 0) + 1;
    });
    return map;
  }, [products]);

  const availableBrands = useMemo(() => {
    return Object.keys(brandCounts).sort();
  }, [brandCounts]);

  // Toggle brand in filter
  const toggleBrandFilter = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('TODOS');
    setSelectedSubcategory(null);
    setSelectedBrands([]);
    setSelectedPriceRange('all');
    setSelectedDeliveryFilter('all');
    setSearchQuery('');
  };

  // Filtered and sorted products list
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      // Category match
      const matchesCat =
        selectedCategory === 'TODOS' ||
        p.categoria.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Lo Más Vendido' && p.tag?.includes('MÁS VENDIDO'));

      // Subcategory match
      const matchesSubcat =
        !selectedSubcategory ||
        p.subcategoria.toLowerCase() === selectedSubcategory.toLowerCase();

      // Brand match
      const brand = getProductBrand(p);
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(brand);

      // Price range match (pago quincenal)
      let matchesPrice = true;
      if (selectedPriceRange === 'under150') matchesPrice = p.pagoQuincenal < 150;
      else if (selectedPriceRange === '150to250') matchesPrice = p.pagoQuincenal >= 150 && p.pagoQuincenal <= 250;
      else if (selectedPriceRange === '250to400') matchesPrice = p.pagoQuincenal > 250 && p.pagoQuincenal <= 400;
      else if (selectedPriceRange === 'over400') matchesPrice = p.pagoQuincenal > 400;

      // Delivery match
      let matchesDelivery = true;
      if (selectedDeliveryFilter === 'domicilio') matchesDelivery = !!p.envioGratis;

      // Search query match
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        brand.toLowerCase().includes(q);

      return matchesCat && matchesSubcat && matchesBrand && matchesPrice && matchesDelivery && matchesQuery;
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
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedBrands,
    selectedPriceRange,
    selectedDeliveryFilter,
    searchQuery,
    sortBy,
  ]);

  const selectedCliente = useMemo(() => {
    return clientes.find((c) => c.id === selectedClienteId) || clientes[0];
  }, [clientes, selectedClienteId]);

  // Open PDP Modal
  const openProductDetail = (prod: LanaTiendaProduct) => {
    setSelectedProduct(prod);
    setPdpSelectedImageIndex(0);
    setPdpQuantity(1);
    setPdpSelectedDelivery('DOMICILIO');
    setIsStoreStockAccordionOpen(false);
  };

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
    showToast(`✓ Bienvenida, ${distribuidora.distribuidoraNombre}`);
  };

  const handleOpenCart = (prod: LanaTiendaProduct, qty: number = 1) => {
    setCartProduct(prod);
    setCartQuantity(qty);
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
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* =========================================================================
          1. TOP MICRO-UTILITY BAR (Estilo Liverpool: selector de tienda y servicios)
         ========================================================================= */}
      <div className="bg-slate-900 text-slate-200 text-[11px] font-medium tracking-wide border-b border-slate-800/80">
        <div className="w-full px-4 sm:px-8 xl:px-12 py-1.5 flex items-center justify-between gap-3">
          {/* Sucursal Selector */}
          <div className="relative">
            <button
              onClick={() => setIsStoreSelectorOpen(!isStoreSelectorOpen)}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white transition py-0.5 cursor-pointer font-semibold"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Sucursal: <strong className="text-white">{activeStore}</strong></span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isStoreSelectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStoreSelectorOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Selecciona tu sucursal
                </div>
                {[
                  { name: 'Saltillo Centro', address: 'C. Hidalgo #382 Nte., Centro' },
                  { name: 'Gómez Palacio', address: 'Calle Victoria #730, Centro' },
                  { name: 'Monterrey', address: 'Presencia Corporativa NL' },
                ].map((s) => (
                  <button
                    key={s.name}
                    onClick={() => {
                      setActiveStore(s.name);
                      setIsStoreSelectorOpen(false);
                      showToast(`Sucursal activa: ${s.name}`);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition ${
                      activeStore === s.name ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{s.name}</div>
                      <div className="text-[10px] text-slate-500">{s.address}</div>
                    </div>
                    {activeStore === s.name && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Micro Utility Links */}
          <div className="flex items-center gap-4 text-slate-300">
            <a
              href="https://lanahora.com/lineas-de-credito/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-300 transition hidden sm:inline"
            >
              Líneas de Crédito
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => {
                if (isDistribuidoraLoggedIn) loadHistory();
                else setIsLoginModalOpen(true);
              }}
              className="hover:text-amber-300 transition hidden md:inline"
            >
              Mi Crédito y Vales
            </button>
            <span className="text-slate-700 hidden md:inline">•</span>
            <span className="text-amber-400 font-bold hidden lg:flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-amber-400" />
              16 Quincenas Fijas Sin Enganche
            </span>
            <span className="text-slate-700 hidden lg:inline">•</span>
            <span className="text-slate-300 hidden xl:inline">
              Garantía de Entrega 48 hrs
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN HEADER (Estilo Liverpool: Logo + Botón Categorías + Omnibar + Acciones)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="w-full px-4 sm:px-8 xl:px-12 py-3 flex items-center justify-between gap-4">
          {/* Left Block: Logo + Categorías Button */}
          <div className="flex items-center gap-4 shrink-0">
            <a href="/tienda" className="flex items-center group" title="LanAhora Tienda">
              <img
                src="/lanahora-logo.png"
                alt="LanAhora"
                className="h-9 sm:h-10 w-auto object-contain group-hover:opacity-90 transition"
              />
            </a>

            {/* BOTÓN CATEGORÍAS (Disparador de Mega-Menu estilo Liverpool) */}
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-black transition cursor-pointer select-none ${
                isMegaMenuOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Categorías</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Central Omnibar Search */}
          <div className="flex-1 max-w-2xl xl:max-w-3xl mx-1 sm:mx-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por producto, marca, categoría o SKU (ej. Mirage, Samsung, ZMAX)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-24 bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-20 text-slate-400 hover:text-slate-600 p-1 rounded-full"
                  title="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  const el = document.getElementById('catalogo-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Right Actions: User / Distribuidora + Favoritos + Carrito */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Login / Profile Pill */}
            {isDistribuidoraLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={loadHistory}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mis Pedidos</span>
                </button>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
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
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-bold text-xs transition"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            )}

            {/* Favoritos (Heart) */}
            <button
              onClick={() => {
                if (favorites.length === 0) {
                  showToast('Aún no tienes productos en tus favoritos.');
                } else {
                  showToast(`Tienes ${favorites.length} artículo(s) guardado(s).`);
                }
              }}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition"
              title="Mis Favoritos"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
              {favorites.length > 0 && (
                <span className="absolute 0 top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Carrito / Bolsa de Compras */}
            <button
              onClick={() => {
                if (cartProduct) setCartProduct(cartProduct);
                else if (products[0]) handleOpenCart(products[0]);
              }}
              className="relative p-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 transition"
              title="Mi Bolsa / Carrito a 16 quincenas"
            >
              <ShoppingCart className="w-5 h-5 text-blue-700" />
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartProduct ? 1 : 0}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Department Strip below header */}
        <div className="bg-white border-t border-slate-200/80">
          <div className="w-full px-4 sm:px-8 xl:px-12 flex items-center gap-1.5 py-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => {
                setSelectedCategory('TODOS');
                setSelectedSubcategory(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                selectedCategory === 'TODOS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Todo el Catálogo</span>
            </button>

            {TIENDA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.nombre);
                  setSelectedSubcategory(null);
                  const el = document.getElementById('catalogo-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition whitespace-nowrap text-xs ${
                  selectedCategory.toLowerCase() === cat.nombre.toLowerCase()
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icono}</span>
                <span>{cat.nombre}</span>
              </button>
            ))}

            <div className="ml-auto hidden lg:flex items-center gap-4 text-slate-500 shrink-0 text-xs font-semibold pl-4">
              <span className="flex items-center gap-1 text-emerald-700">
                <Truck className="w-3.5 h-3.5" /> Envío gratis en miles de productos
              </span>
              <span className="flex items-center gap-1 text-blue-700 font-bold">
                <Calendar className="w-3.5 h-3.5" /> 16 Pagos Fijos
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. MULTI-COLUMN MEGA MENU DROPDOWN (Screenshot 2: Exact Liverpool Pattern)
         ========================================================================= */}
      {isMegaMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs top-[108px] flex items-start animate-in fade-in duration-150"
          onClick={() => setIsMegaMenuOpen(false)}
        >
          <div
            className="w-full bg-white border-b border-slate-300 shadow-2xl px-4 sm:px-8 xl:px-12 py-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
              {/* Left Column: Departments List */}
              <div className="w-full md:w-72 border-r border-slate-200/80 pr-4 space-y-1 shrink-0">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                  Departamentos
                </div>
                {TIENDA_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveMegaDept(cat)}
                    onClick={() => {
                      setSelectedCategory(cat.nombre);
                      setSelectedSubcategory(null);
                      setIsMegaMenuOpen(false);
                      const el = document.getElementById('catalogo-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition ${
                      activeMegaDept.id === cat.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{cat.icono}</span>
                      <span>{cat.nombre}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>

              {/* Right Canvas: 4 Columns with Subcategories & Highlights */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeMegaDept.icono}</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{activeMegaDept.nombre}</h3>
                      <p className="text-xs text-slate-500">Todo a 16 quincenas fijas con tu línea autorizada</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(activeMegaDept.nombre);
                      setSelectedSubcategory(null);
                      setIsMegaMenuOpen(false);
                      const el = document.getElementById('catalogo-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Ver todo en {activeMegaDept.nombre}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {/* Column 1: Subcategories */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Subcategorías
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {activeMegaDept.subcategorias.map((sub, i) => (
                        <li key={i}>
                          <button
                            onClick={() => {
                              setSelectedCategory(activeMegaDept.nombre);
                              setSelectedSubcategory(sub);
                              setIsMegaMenuOpen(false);
                              const el = document.getElementById('catalogo-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="hover:text-blue-600 hover:underline transition text-left"
                          >
                            {sub}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: Marcas Oficiales */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Marcas Oficiales
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {['SAMSUNG', 'AMAZON', 'HP', 'ZMAX', 'MIRAGE', 'ACER', 'GHIA', 'OSTER'].map((brand) => (
                        <li key={brand}>
                          <button
                            onClick={() => {
                              setSelectedCategory('TODOS');
                              setSelectedBrands([brand]);
                              setIsMegaMenuOpen(false);
                              const el = document.getElementById('catalogo-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="hover:text-blue-600 hover:underline transition flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>{brand}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Financiamiento Institucional */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-800 px-2.5 py-0.5 rounded-full inline-block">
                      Beneficios LanAhora
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">16 Quincenas Fijas</h4>
                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>0% Enganche inicial</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Sin comisiones ocultas</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Respaldo oficial SOFOM</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Garantía de cambio 48 hrs</span>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Promo Card */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group aspect-4/3 sm:aspect-auto">
                    <img
                      src={activeMegaDept.imagen}
                      alt={activeMegaDept.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white">
                      <span className="text-[10px] font-black text-amber-300 uppercase">Destacado</span>
                      <h5 className="text-xs font-bold leading-tight">{activeMegaDept.nombre}</h5>
                      <span className="text-[10px] text-slate-300 mt-0.5">Estrena hoy a 16 quincenas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MAIN CONTAINER & HERO CAROUSEL
         ========================================================================= */}
      <main className="w-full px-4 sm:px-8 xl:px-12 py-5 flex-1 space-y-6">
        {/* HERO PANORAMIC CAROUSEL (Estilo Liverpool: banner a todo lo ancho) */}
        <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-slate-950 aspect-[21/9] sm:aspect-[24/8] md:aspect-[24/7] lg:aspect-[24/6] group border border-slate-200 select-none">
          {banners.map((b, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (b.categoria && b.categoria !== 'TODOS') setSelectedCategory(b.categoria);
                const el = document.getElementById('catalogo-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`absolute inset-0 transition-opacity duration-700 ease-out cursor-pointer ${
                idx === activeBanner
                  ? 'opacity-100 z-10'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
              title={b.alt}
            >
              <img
                src={b.src}
                alt={b.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Nav arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
            }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xl backdrop-blur-xs border border-white/20 cursor-pointer"
            title="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveBanner((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xl backdrop-blur-xs border border-white/20 cursor-pointer"
            title="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-20 flex items-center gap-2 bg-slate-950/50 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBanner(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeBanner ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                title={`Banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* =========================================================================
            5. PERSONALIZATION STRIP (Screenshot 1: ¡Tu experiencia ahora personalizada!)
           ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
              <Sparkles className="w-7 h-7 text-blue-600 fill-blue-100" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-snug">
                {isDistribuidoraLoggedIn
                  ? `¡Bienvenida a tu portal, ${distribuidora.distribuidoraNombre}!`
                  : '¡Tu experiencia ahora personalizada!'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {isDistribuidoraLoggedIn
                  ? `Cuentas con $${distribuidora.disponibleLanaTienda.toLocaleString()} MXN disponibles en tu línea para compras directas a 16 quincenas y ${distribuidora.monedero.toLocaleString()} LanaPuntos.`
                  : 'Inicia sesión para recibir recomendaciones personalizadas, consultar tu crédito disponible a 16 quincenas fijas y canjear tus LanaPuntos.'}
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            {isDistribuidoraLoggedIn ? (
              <button
                onClick={loadHistory}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Ver Mis Pedidos</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Iniciar sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            6. PLP CATALOG LAYOUT (Screenshot 3: Breadcrumb + Sidebar Filters + Grid)
           ========================================================================= */}
        <section id="catalogo-section" className="space-y-4 pt-2">
          {/* Breadcrumb Trail & Page Title */}
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <a href="/tienda" className="hover:text-blue-600">Inicio</a>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-700">
                {selectedCategory === 'TODOS' ? 'Catálogo General' : selectedCategory}
              </span>
              {selectedSubcategory && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-blue-700">{selectedSubcategory}</span>
                </>
              )}
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedSubcategory || (selectedCategory === 'TODOS' ? 'Catálogo General a 16 Quincenas' : selectedCategory)}
            </h1>
          </div>

          {/* Control Bar: Items Count + Sorting */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {filteredProducts.length} artículos
              </span>
              {(selectedCategory !== 'TODOS' || selectedSubcategory || selectedBrands.length > 0 || selectedPriceRange !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filtros ({selectedBrands.length + (selectedCategory !== 'TODOS' ? 1 : 0)})</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                <span className="text-slate-400 hidden sm:inline">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Relevancia / Populares</option>
                  <option value="quincena-asc">Menor pago quincenal</option>
                  <option value="quincena-desc">Mayor pago quincenal</option>
                  <option value="price-asc">Menor precio total</option>
                  <option value="price-desc">Mayor precio total</option>
                  <option value="rating">Mejor calificados</option>
                </select>
              </div>
            </div>
          </div>

          {/* PLP Two-Column Grid: Sidebar (col-1) + Product Cards (col-3 / col-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* -------------------------------------------------------------
                LEFT SIDEBAR FILTERS (Estilo Liverpool: Categorías, Marcas, Rango)
               ------------------------------------------------------------- */}
            <aside
              className={`lg:col-span-1 space-y-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs h-fit ${
                isMobileFiltersOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filtrar Resultados</span>
                </h3>
                {(selectedCategory !== 'TODOS' || selectedBrands.length > 0 || selectedPriceRange !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Borrar
                  </button>
                )}
              </div>

              {/* Filter 1: Categorías Tree */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Categoría
                </h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedCategory('TODOS');
                      setSelectedSubcategory(null);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition ${
                      selectedCategory === 'TODOS'
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Todo el Catálogo</span>
                    <span className="text-[10px] text-slate-400">({products.length})</span>
                  </button>

                  {TIENDA_CATEGORIES.map((cat) => {
                    const count = products.filter((p) => p.categoria.toLowerCase() === cat.nombre.toLowerCase()).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.nombre);
                          setSelectedSubcategory(null);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition ${
                          selectedCategory.toLowerCase() === cat.nombre.toLowerCase()
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{cat.nombre}</span>
                        <span className="text-[10px] text-slate-400">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 2: Marcas Oficiales (Checkboxes) */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Marca
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin text-xs text-slate-700">
                  {availableBrands.map((brand) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <label
                        key={brand}
                        className="flex items-center justify-between hover:bg-slate-50 px-2 py-1 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBrandFilter(brand)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-slate-800">{brand}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">({brandCounts[brand] || 0})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter 3: Rango de Pago Quincenal */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Pago Quincenal
                </h4>
                <div className="space-y-1 text-xs text-slate-700">
                  {[
                    { id: 'all', label: 'Cualquier cuota' },
                    { id: 'under150', label: 'Menos de $150 quincenal' },
                    { id: '150to250', label: '$150 a $250 quincenal' },
                    { id: '250to400', label: '$250 a $400 quincenal' },
                    { id: 'over400', label: 'Más de $400 quincenal' },
                  ].map((range) => (
                    <label
                      key={range.id}
                      className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === range.id}
                        onChange={() => setSelectedPriceRange(range.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 4: Modalidad de Entrega */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Entrega
                </h4>
                <div className="space-y-1 text-xs text-slate-700">
                  {[
                    { id: 'all', label: 'Todas las modalidades' },
                    { id: 'domicilio', label: 'Envío gratis a domicilio' },
                  ].map((del) => (
                    <label
                      key={del.id}
                      className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="deliveryFilter"
                        checked={selectedDeliveryFilter === del.id}
                        onChange={() => setSelectedDeliveryFilter(del.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{del.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* -------------------------------------------------------------
                PRODUCT CARDS GRID (Screenshot 3: Estilo Liverpool White Cards)
               ------------------------------------------------------------- */}
            <div className="lg:col-span-3 xl:col-span-4">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No encontramos productos coincidentes</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Prueba cambiando los filtros seleccionados o ingresa otro término en la barra de búsqueda superior.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Ver Todo el Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredProducts.map((product) => {
                    const isFav = favorites.includes(product.id);
                    const brand = getProductBrand(product);

                    return (
                      <div
                        key={product.id}
                        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                        onClick={() => openProductDetail(product)}
                      >
                        {/* Product Image Box */}
                        <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                          <img
                            src={product.imagen}
                            alt={product.nombre}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Heart Icon Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition shadow-2xs ${
                              isFav
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200'
                            }`}
                            title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                          </button>

                          {/* 16 Quincenas Badge */}
                          <div className="absolute bottom-2.5 left-2.5">
                            <span className="bg-slate-900/90 backdrop-blur-xs text-amber-300 font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-2xs">
                              16 Quincenas
                            </span>
                          </div>
                        </div>

                        {/* Product Meta & Pricing (Estilo Liverpool exacto) */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            {/* Brand in Uppercase (ej. DOCKERS, JBE, MIRAGE, SAMSUNG) */}
                            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                              {brand}
                            </div>

                            {/* Product Title (Clean, 2 lines) */}
                            <h3
                              className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition"
                              title={product.nombre}
                            >
                              {product.nombre}
                            </h3>

                            {/* Star Rating */}
                            <div className="flex items-center gap-1.5 text-amber-500 text-xs mt-1.5">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= Math.round(product.rating || 5)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium">
                                ({product.reviewsCount || 128})
                              </span>
                            </div>
                          </div>

                          {/* Pricing Block: 16 pagos de $XX.XX y Contado */}
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <div className="flex items-baseline gap-1 text-rose-600 font-black">
                              <span className="text-xs uppercase">16 pagos de</span>
                              <span className="text-lg leading-none">
                                {formatMoney(product.pagoQuincenal)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 font-bold">
                                Total: {formatMoney(product.precio)}
                              </span>
                              {product.precioAnterior && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  {formatMoney(product.precioAnterior)}
                                </span>
                              )}
                            </div>

                            {/* 1-Click Buy / Add to Cart CTA */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCart(product);
                              }}
                              className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5"
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
              )}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          7. PRODUCT DETAIL MODAL (Screenshots 4 & 5: Exact Liverpool PDP)
         ========================================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-4 border border-slate-200">
            {/* Top Modal Bar: Breadcrumbs + Close */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <nav className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-lg">
                <span>Inicio</span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{selectedProduct.categoria}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-800 truncate">{getProductBrand(selectedProduct)}</span>
              </nav>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
                title="Cerrar detalle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PDP Body: Two-Column Detail View */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT: Multi-image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-6 relative">
                    <img
                      src={selectedProduct.imagen}
                      alt={selectedProduct.nombre}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded shadow-2xs">
                      Envío Gratis
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-2 justify-center">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => setPdpSelectedImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl border p-1 bg-white overflow-hidden transition ${
                          pdpSelectedImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={selectedProduct.imagen}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Value Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="leading-tight font-medium">Envío asegurado a todo México</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="leading-tight font-medium">Garantía oficial de 48 horas</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Financial Matrix, Store Stock, Delivery Tabs & CTAs */}
                <div className="space-y-5 flex flex-col justify-between">
                  <div>
                    {/* SKU & Star Rating */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-mono text-[11px]">Código de producto: {selectedProduct.sku}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= Math.round(selectedProduct.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>({selectedProduct.reviewsCount || 128})</span>
                      </div>
                    </div>

                    {/* Uppercase Brand */}
                    <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                      {getProductBrand(selectedProduct)}
                    </div>

                    {/* Product Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
                      {selectedProduct.nombre}
                    </h2>

                    {/* Financial Price Box (Estilo Liverpool con 16 quincenas) */}
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-slate-50 to-blue-50/50 border border-rose-200/80 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-rose-600">
                          {formatMoney(selectedProduct.precio)}
                        </span>
                        {selectedProduct.precioAnterior && (
                          <span className="text-sm text-slate-400 line-through">
                            {formatMoney(selectedProduct.precioAnterior)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-rose-200/60 pt-2 text-xs">
                        <span className="font-bold text-blue-900 uppercase tracking-wide">
                          Plan a 16 Quincenas:
                        </span>
                        <span className="text-base font-black text-blue-700">
                          16 pagos de {formatMoney(selectedProduct.pagoQuincenal)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        *0% de enganche con tu línea autorizada. Sin comisiones por apertura.
                      </p>
                    </div>

                    {/* Store Availability Link / Accordion (Exact Liverpool Pattern) */}
                    <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setIsStoreStockAccordionOpen(!isStoreStockAccordionOpen)}
                        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition"
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Ver disponibilidad en tienda</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isStoreStockAccordionOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isStoreStockAccordionOpen && (
                        <div className="p-3.5 bg-white space-y-2 text-xs border-t border-slate-200 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">Saltillo Centro (Hidalgo #382 Nte):</span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Disponible hoy
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">Gómez Palacio (Victoria #730):</span>
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              Disponible
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">Monterrey:</span>
                            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                              Envío desde almacén
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                      <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setPdpQuantity((q) => Math.max(1, q - 1))}
                          className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900">{pdpQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setPdpQuantity((q) => Math.min(10, q + 1))}
                          className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delivery Tabs (Liverpool exact pattern: Recibe a domicilio vs Click & Collect) */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPdpSelectedDelivery('DOMICILIO')}
                        className={`p-3 rounded-2xl border text-left transition ${
                          pdpSelectedDelivery === 'DOMICILIO'
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Recibe a domicilio</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Envío gratis a todo el país
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPdpSelectedDelivery('SUCURSAL')}
                        className={`p-3 rounded-2xl border text-left transition ${
                          pdpSelectedDelivery === 'SUCURSAL'
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Click & Collect</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Recoge en sucursal
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Primary & Secondary Action CTAs */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCart(selectedProduct, pdpQuantity)}
                      className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4 text-amber-300" />
                      <span>Comprar ahora a 16 quincenas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareModalProduct(selectedProduct)}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Compartir por WhatsApp con mi Distribuidora</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Accordion Tabs below details */}
              <div className="border-t border-slate-200 pt-5 space-y-4">
                <div className="flex gap-4 border-b border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setPdpActiveTab('specs')}
                    className={`pb-2 transition ${
                      pdpActiveTab === 'specs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Especificaciones y Características
                  </button>
                  <button
                    onClick={() => setPdpActiveTab('warranty')}
                    className={`pb-2 transition ${
                      pdpActiveTab === 'warranty' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Garantía Oficial 48 Horas
                  </button>
                  <button
                    onClick={() => setPdpActiveTab('shipping')}
                    className={`pb-2 transition ${
                      pdpActiveTab === 'shipping' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Políticas de Entrega
                  </button>
                </div>

                {pdpActiveTab === 'specs' && (
                  <div className="space-y-3 text-xs text-slate-700">
                    <p className="leading-relaxed">{selectedProduct.descripcion}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {selectedProduct.caracteristicas.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pdpActiveTab === 'warranty' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Protección de Recepción de 48 Horas Hábiles</span>
                    </div>
                    <p className="leading-relaxed">
                      Al recibir tu pedido (ya sea en sucursal o a domicilio), cuentas con <strong>48 horas hábiles</strong> para
                      inspeccionar tu artículo. Si detectas cualquier defecto de fábrica o daño físico, Financiera LanAhora
                      gestiona la reposición o cancelación directa del crédito sin costo.
                    </p>
                  </div>
                )}

                {pdpActiveTab === 'shipping' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Tiempos de Entrega y Cobertura Nacional</span>
                    </div>
                    <p className="leading-relaxed">
                      Tiempo estimado de entrega: <strong>{selectedProduct.diasEntrega} días hábiles</strong>. Envío con número de guía
                      rastreable FedEx/Estafeta para entrega a domicilio o recolección directa en ventanilla de tu sucursal matriz.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. CHECKOUT FINTECH EN 1 CLIC (LanaTienda Direct Modal)
         ========================================================================= */}
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
                    <span>Solicitud de Pedido</span>
                    <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                      16 Quincenas
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Sin comisiones ocultas • Respaldo oficial</p>
                </div>
              </div>
              <button
                onClick={() => setCartProduct(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
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

              {/* Paso 1: Product Snapshot */}
              <div className="flex items-center gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                <img
                  src={cartProduct.imagen}
                  alt={cartProduct.nombre}
                  className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 shrink-0 p-1"
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
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setCartQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-900">{cartQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setCartQuantity((q) => Math.min(10, q + 1))}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
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
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      tipoDireccion === 'SUCURSAL'
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tipoDireccion === 'SUCURSAL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-slate-900 block">Recoger en Sucursal</span>
                      <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                        {activeStore}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoDireccion('DOMICILIO')}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      tipoDireccion === 'DOMICILIO'
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-between">
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
                    {distribuidora.monedero.toLocaleString()} LanaPuntos disponibles
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
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>16 Quincenas</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Sin enganche</p>
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
                        ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>LanaPuntos</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">100% con saldo</p>
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
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pago Mixto</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Puntos + Cuota</p>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-black mt-2">
                      Descuento
                    </div>
                  </button>
                </div>
              </div>

              {/* Paso 5: Resumen & Confirmación en 1 Clic */}
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
                      <span>Total de la orden:</span>
                      <span className="font-bold text-slate-900">{formatMoney(total)}</span>
                    </div>

                    <div className="flex items-center justify-between bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/80 p-4 rounded-2xl">
                      <div>
                        <span className="text-xs font-black text-blue-950 uppercase tracking-wide block">
                          {montoFinanciado > 0 ? 'Plan a 16 Quincenas Fijas' : 'Liquidación con Puntos'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {montoFinanciado > 0 ? 'Sin desembolso inicial' : 'Sin pagos quincenales'}
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

                    <button
                      type="button"
                      onClick={handleFinalizeOrder}
                      disabled={isSubmittingOrder || puntosInsuficientes}
                      className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      {isSubmittingOrder ? (
                        <span>Procesando solicitud...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-amber-300" />
                          <span>
                            {montoFinanciado > 0
                              ? `Confirmar Pedido • 16 quincenas de ${formatMoney(pagoQuincenal)}`
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

      {/* =========================================================================
          9. COMPLETED ORDER DIGITAL TICKET
         ========================================================================= */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                ¡Solicitud Registrada con Éxito!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                Folio: {completedOrder.folio}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Generado a 16 quincenas con respaldo oficial de Financiera LanAhora.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Titular:</span>
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
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-bold text-blue-700">
                <span className="text-slate-800">16 Pagos Quincenales:</span>
                <span className="text-sm font-black">
                  {completedOrder.montoFinanciado && completedOrder.montoFinanciado > 0
                    ? `${formatMoney(completedOrder.montoFinanciado / 16)}/qna`
                    : '$0.00 (Liquidado)'}
                </span>
              </div>
            </div>

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

      {/* =========================================================================
          10. SHARE WHATSAPP MODAL
         ========================================================================= */}
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

      {/* =========================================================================
          11. DISTRIBUIDORA LOGIN MODAL
         ========================================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/lanahora-logo.png" alt="LanAhora" className="h-7 w-auto object-contain" />
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

      {/* =========================================================================
          12. ORDERS HISTORY MODAL
         ========================================================================= */}
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

      {/* =========================================================================
          13. CORPORATE FOOTER
         ========================================================================= */}
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

      {/* Floating Toast Notification */}
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
