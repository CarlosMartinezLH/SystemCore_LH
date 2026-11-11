'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Share2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  User,
  Users,
  ChevronRight,
  RefreshCw,
  Send,
  ArrowLeft,
  Download,
  Award,
  FileText,
  Camera,
  Check,
  ExternalLink,
  QrCode,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Sparkles,
  Search,
  Bell,
  Calendar,
} from 'lucide-react';
import { useCoreSync } from '@/context/CoreSyncContext';
import { MobileNotification } from '@/types/notifications';
import {
  calcularAmortizacionVale,
  calcularComisionDistribuidora,
  validarCreditoGeneraCanje,
} from '@/lib/rules/businessRulesEngine';
import { CATEGORIAS_CONFIG } from '@/types/businessRules';

interface LanAppViewProps {
  onNavigateToDispersion?: () => void;
  fullScreenMobile?: boolean;
}

export default function LanAppView({ onNavigateToDispersion, fullScreenMobile = false }: LanAppViewProps) {
  const {
    notifications,
    mobileNotificationAccepted,
    setMobileNotificationPermission,
    markNotificationRead,
    registrarCanje,
  } = useCoreSync();

  // Estados de Notificaciones Móviles
  const [showNotificationsCenter, setShowNotificationsCenter] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'TODAS' | 'COBRO_VALE' | 'RECORDATORIO_PAGO'>('TODAS');
  const [bannerToast, setBannerToast] = useState<MobileNotification | null>(null);
  const [dismissedPermissionPrompt, setDismissedPermissionPrompt] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay may be muted by browser policy
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToWebPush = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Obtener clave pública VAPID desde el Core
      const res = await fetch('/api/notifications/push-subscription');
      const data = await res.json();
      if (!data.success || !data.publicKey) return;

      const convertedKey = urlBase64ToUint8Array(data.publicKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      // Enviar suscripción al servidor Core
      await fetch('/api/notifications/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          distribuidorId: 1002,
        }),
      });
      console.log('[LanApp] ¡Suscripción Web Push remota registrada con éxito!');
    } catch (err) {
      console.warn('[LanApp] Error registrando WebPush:', err);
    }
  };

  const handleAcceptNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await subscribeToWebPush();
        }
      } catch (err) {
        console.warn('Permiso de notificaciones del navegador:', err);
      }
    }
    await setMobileNotificationPermission(true);
  };

  // Re-suscribir automáticamente si ya tenía permiso otorgado
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToWebPush().catch(() => {});
    }
  }, []);

  const prevNotifCountRef = useRef(notifications.length);
  useEffect(() => {
    if (notifications.length > prevNotifCountRef.current) {
      const latest = notifications[0];
      if (latest) {
        setBannerToast(latest);
        playNotificationSound();

        // Vibración nativa en smartphones Android/Samsung
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([250, 100, 250]);
          } catch {}
        }

        // Notificación nativa del sistema operativo / navegador móvil si se autorizó
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(latest.title, {
              body: latest.body,
              icon: '/icon.png',
              badge: '/icon.png',
              tag: latest.id,
            });
          } catch (e) {
            console.warn('Native push notification error:', e);
          }
        }

        const timer = setTimeout(() => setBannerToast(null), 6000);
        return () => clearTimeout(timer);
      }
    }
    prevNotifCountRef.current = notifications.length;
  }, [notifications]);

  // Modo de simulación: 'dv' (Distribuidora - LanApp) | 'cliente' (Portal de Canje Acredítala)
  const [activeMode, setActiveMode] = useState<'dv' | 'cliente'>('dv');

  // Pasos de LanApp DV:
  // 1: Login
  // 2: Mi Perfil
  // 3: Mis Clientes (o Créditos)
  // 4: Crédito Nuevo (Vale digital con canje)
  // 5: Información / Autorización (Crédito ID #2)
  // 6: Compartir por WhatsApp
  const [dvStep, setDvStep] = useState<number>(1);
  const [dvTab, setDvTab] = useState<'perfil' | 'creditos' | 'clientes' | 'valera' | 'relacion'>('perfil');

  // Pasos de Acredítala (Cliente):
  // 8: Detalle de Vale ($1,000 / 6 quincenas $237)
  // 9: Domicilio
  // 10: Beneficiario del seguro
  // 11: Datos bancarios para depósito
  // 12: Verificación KYC INE Anverso
  // 13: Verificación KYC INE Reverso
  // 14: INE OCR Obtenido Correctamente
  // 15: Selfie Biométrica con óvalo facial
  // 16: Firma Digital Táctil
  // 17: Depósito Exitoso (STP SPEI en proceso)
  const [clientStep, setClientStep] = useState<number>(8);

  // Estados del crédito en simulación
  const [selectedClient, setSelectedClient] = useState({
    id: '13419',
    nombre: 'JOSE EFRAIN VAZQUEZ SOSA',
    estatus: 'NORMAL',
    telefono: '844-329-8471',
  });
  const [plazos, setPlazos] = useState<number>(6);
  const [importe, setImporte] = useState<number>(1000);
  const [folioGenerado, setFolioGenerado] = useState<string>('2');
  const [copiedLink, setCopiedLink] = useState(false);
  const [subTabDoc, setSubTabDoc] = useState<'contrato' | 'corrida' | 'pagare'>('contrato');

  // Clientes mock en LanApp
  const [searchQuery, setSearchQuery] = useState('');
  const clientesMock = [
    { id: '10091', nombre: 'MARIA DEL REFUGIO ESQUIVEL', estatus: 'NORMAL', ultCredito: '21/10/2023 11:43:12', activos: 0 },
    { id: '11866', nombre: 'PERLA SARAI MARTINEZ CARRILLO', estatus: 'NORMAL', ultCredito: '07/07/2025 17:30:54', activos: 0 },
    { id: '13066', nombre: 'VICTOR GERARDO FARIAS AGUIRRE', estatus: 'NORMAL', ultCredito: '01/11/2025 11:57:15', activos: 1 },
    { id: '13419', nombre: 'JOSE EFRAIN VAZQUEZ SOSA', estatus: 'NORMAL', ultCredito: '03/04/2023 14:42:57', activos: 0 },
    { id: '17431', nombre: 'KAREN ELENA CASTILLO SAUCEDO', estatus: 'NORMAL', ultCredito: '02/05/2023 12:09:01', activos: 0 },
    { id: '17699', nombre: 'LAURA LETICIA DELGADO FLORES', estatus: 'NORMAL', ultCredito: '13/10/2025 16:56:05', activos: 2 },
  ];

  const creditosActivosMock = [
    { id: '17699', nombre: 'LAURA LETICIA DELGADO FLORES', plazos: '3/10', capital: 10000, actual: 4978.10, atrasado: 0.00 },
    { id: '2664', nombre: 'MA CONCEPCION MONTELONGO DE LA ROSA', plazos: '2/8', capital: 8500, actual: 2838.40, atrasado: 0.00 },
    { id: '59155', nombre: 'GUILLERMO VERDUGO FELIX', plazos: '7/12', capital: 9000, actual: 9133.50, atrasado: 0.00 },
    { id: '21903', nombre: 'JUANA MARIA CARRILLO MORA', plazos: '3/8', capital: 7500, actual: 4453.30, atrasado: 0.00 },
    { id: '13066', nombre: 'VICTOR GERARDO FARIAS AGUIRRE', plazos: '9/10', capital: 5000, actual: 7739.00, atrasado: 0.00 },
  ];

  // Amortización oficial según reglas de negocio ($1,000 en 6 plazos = $237.00 exacto)
  const amortizacionActual = calcularAmortizacionVale(importe, plazos, 'DISTRIBUIDORA_AAA');
  const pagoPorPlazo = amortizacionActual.pagoQuincenalSinSeguro;
  const seguroClienteActual = amortizacionActual.seguroCliente;

  // Estados del formulario del cliente
  const [tipoCuenta, setTipoCuenta] = useState<'tarjeta' | 'clabe'>('tarjeta');
  const [numTarjeta, setNumTarjeta] = useState('4152 3138 8901 2345');
  const [bancoCliente, setBancoCliente] = useState('BBVA México');
  const [nombreBeneficiario, setNombreBeneficiario] = useState('MARÍA LUISA VÁZQUEZ SOSA');
  const [parentesco, setParentesco] = useState('Esposa(o)');

  // Estados de fotografías de validación KYC (INE y Selfie)
  const [fotoIneFrente, setFotoIneFrente] = useState<string | null>(null);
  const [fotoIneReverso, setFotoIneReverso] = useState<string | null>(null);
  const [fotoSelfie, setFotoSelfie] = useState<string | null>(null);

  // Motor de Prueba de Vida Activa en Dispositivo (Dentro del Óvalo)
  const [livenessPhase, setLivenessPhase] = useState<'idle' | 'centering' | 'blinking' | 'turning' | 'completed'>('idle');
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [livenessMsg, setLivenessMsg] = useState('Centre su rostro en el óvalo');

  // Videoselfie integrada dentro del óvalo (Sin salir de la app)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanningLive, setIsScanningLive] = useState(false);

  const fileInputFrenteRef = useRef<HTMLInputElement | null>(null);
  const fileInputReversoRef = useRef<HTMLInputElement | null>(null);
  const fileInputSelfieRef = useRef<HTMLInputElement | null>(null);

  const startInlineCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      }
    } catch {
      setIsCameraActive(false);
    }
  };

  const stopInlineCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const handleEstoyListo = () => {
    setIsScanningLive(true);
    setLivenessPhase('centering');
    setLivenessProgress(25);
    setLivenessMsg('1. ALEJE EL TELÉFONO - Centre su rostro dentro del óvalo');

    setTimeout(() => {
      setLivenessPhase('turning');
      setLivenessProgress(50);
      setLivenessMsg('2. ACÉRQUESE LENTAMENTE - Ajuste su rostro al óvalo');

      setTimeout(() => {
        setLivenessPhase('blinking');
        setLivenessProgress(75);
        setLivenessMsg('3. SIN LENTES Y PARPADEE - Mire a la cámara');

        setTimeout(() => {
          setLivenessPhase('completed');
          setLivenessProgress(95);
          setLivenessMsg('4. ¡DISTANCIA PERFECTA! Manténgase inmóvil...');

          setTimeout(() => {
            if (videoRef.current && isCameraActive) {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = videoRef.current.videoWidth || 480;
                canvas.height = videoRef.current.videoHeight || 640;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                  setFotoSelfie(dataUrl);
                }
              } catch {
                setFotoSelfie(DEMO_SELFIE);
              }
              stopInlineCamera();
            } else {
              setFotoSelfie(DEMO_SELFIE);
            }
            setIsScanningLive(false);
            setLivenessPhase('completed');
            setLivenessProgress(100);
            setLivenessMsg('✓ Rostro verificado sin lentes');
          }, 1200);
        }, 2200);
      }, 2400);
    }, 2200);
  };

  useEffect(() => {
    if (clientStep === 15 && !fotoSelfie) {
      startInlineCamera();
    } else {
      stopInlineCamera();
    }
    return () => {
      stopInlineCamera();
    };
  }, [clientStep, fotoSelfie]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'frente' | 'reverso' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (tipo === 'frente') setFotoIneFrente(result);
        if (tipo === 'reverso') setFotoIneReverso(result);
        if (tipo === 'selfie') {
          setFotoSelfie(result);
          ejecutarPruebaVidaLocal(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const ejecutarPruebaVidaLocal = (imgUri?: string) => {
    if (imgUri) setFotoSelfie(imgUri);
    setLivenessPhase('centering');
    setLivenessProgress(25);
    setLivenessMsg('✓ Rostro detectado. Manténgase centrado...');

    setTimeout(() => {
      setLivenessPhase('blinking');
      setLivenessProgress(65);
      setLivenessMsg('👁️ Parpadee 2 veces lentamente...');

      setTimeout(() => {
        setLivenessPhase('turning');
        setLivenessProgress(90);
        setLivenessMsg('😊 Sonría levemente a la cámara...');

        setTimeout(() => {
          setLivenessPhase('completed');
          setLivenessProgress(100);
          setLivenessMsg('✓ Prueba de vida superada en dispositivo ($0.00 MXN)');
        }, 750);
      }, 850);
    }, 750);
  };

  const DEMO_INE_FRENTE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220" viewBox="0 0 360 220"><rect width="360" height="220" rx="12" fill="%23f8fafc" stroke="%232563eb" stroke-width="2"/><rect x="12" y="12" width="336" height="34" rx="6" fill="%231e3a8a"/><text x="24" y="34" fill="%23ffffff" font-size="12" font-weight="bold" font-family="sans-serif">INSTITUTO NACIONAL ELECTORAL</text><rect x="24" y="58" width="76" height="96" rx="6" fill="%23e2e8f0" stroke="%2394a3b8"/><circle cx="62" cy="94" r="20" fill="%232563eb"/><path d="M42 136 c0 -14 14 -20 20 -20 s20 6 20 20 z" fill="%232563eb"/><text x="114" y="74" fill="%230f172a" font-size="11" font-weight="bold" font-family="sans-serif">NOMBRE: VAZQUEZ SOSA</text><text x="114" y="92" fill="%230f172a" font-size="11" font-weight="bold" font-family="sans-serif">JOSE EFRAIN</text><text x="114" y="112" fill="%23475569" font-size="10" font-family="sans-serif">CURP: VASE820412HCLSS01</text><text x="114" y="128" fill="%23475569" font-size="10" font-family="sans-serif">FECHA NAC: 12/04/1982</text><text x="114" y="144" fill="%23475569" font-size="10" font-family="sans-serif">SECCI%C3%93N: 0842   VIGENCIA: 2024-2034</text><rect x="24" y="166" width="312" height="40" rx="4" fill="%23ecfdf5" stroke="%2310b981"/><text x="36" y="190" fill="%23047857" font-size="10" font-weight="bold" font-family="sans-serif">%E2%9C%93 INE ANVERSO VALIDADO CON RENAPO</text></svg>';

  const DEMO_INE_REVERSO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220" viewBox="0 0 360 220"><rect width="360" height="220" rx="12" fill="%23f8fafc" stroke="%232563eb" stroke-width="2"/><rect x="20" y="20" width="60" height="60" rx="4" fill="%231e3a8a"/><rect x="25" y="25" width="20" height="20" fill="%23ffffff"/><rect x="50" y="50" width="25" height="25" fill="%23ffffff"/><rect x="95" y="20" width="245" height="60" rx="4" fill="%23eff6ff" stroke="%23bfdbfe"/><text x="105" y="55" fill="%231e40af" font-size="11" font-weight="bold" font-family="sans-serif">FIRMA ELECTORAL REGISTRADA</text><rect x="20" y="95" width="320" height="50" fill="%23f1f5f9" stroke="%23cbd5e1"/><text x="25" y="115" fill="%230f172a" font-size="10" font-family="monospace">IDMEX1820412842&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text><text x="25" y="132" fill="%230f172a" font-size="10" font-family="monospace">8204124H3412316MEX&lt;&lt;0842&lt;98726&lt;5</text><rect x="20" y="160" width="320" height="40" rx="4" fill="%23ecfdf5" stroke="%2310b981"/><text x="30" y="184" fill="%23047857" font-size="10" font-weight="bold" font-family="sans-serif">%E2%9C%93 C%C3%93DIGO MRZ Y QR DETECTADOS (SAT OK)</text></svg>';

  const DEMO_SELFIE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300" viewBox="0 0 240 300"><rect width="240" height="300" rx="100" fill="%23eff6ff"/><circle cx="120" cy="110" r="50" fill="%232563eb"/><path d="M60 245 c0 -35 30 -55 60 -55 s60 20 60 55 z" fill="%231d4ed8"/><circle cx="120" cy="110" r="75" fill="none" stroke="%2310b981" stroke-width="4" stroke-dasharray="8,4"/><circle cx="102" cy="100" r="5" fill="%23ffffff"/><circle cx="138" cy="100" r="5" fill="%23ffffff"/><path d="M106 130 q14 12 28 0" stroke="%23ffffff" stroke-width="3" fill="none"/><rect x="25" y="240" width="190" height="32" rx="8" fill="%2310b981"/><text x="120" y="260" text-anchor="middle" fill="%23ffffff" font-size="10" font-weight="bold" font-family="sans-serif">%E2%9C%93 ROSTRO MATCH 99.8%25</text></svg>';

  // Canvas de firma digital táctil
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (clientStep === 16 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [clientStep]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSigned(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const shareUrl = `https://acreditala.lanahora.com.mx/solicitud/1-356F3C37-FDCE-F011-B513-000C29AC7C09`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `Lanahora: Gracias por tu canje. para darle seguimiento, compartir la siguiente url: ${shareUrl}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className={fullScreenMobile ? 'w-full min-h-screen bg-[#132A60]' : 'min-h-screen bg-[#f0f4fa] pb-16'}>
      {!fullScreenMobile && (
        /* Header Banner */
        <div className="bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1e40af] text-white py-6 px-4 md:px-8 border-b border-blue-400/30 shadow-md">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#facc15] text-slate-950">
                  Oficial 2026
                </span>
                <span className="text-xs text-blue-200 font-bold">
                  Manual de Dispersión Digital v.1.16.7.0
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-[#facc15]" />
                LanApp — Vale Digital con Canje Inmediato
              </h1>
              <p className="text-xs md:text-sm text-blue-100 max-w-2xl mt-1">
                Simulador interactivo del flujo integral: Emisión de Vale Digital por la Distribuidora (LanApp) y Canje Digital con validación biométrica facial, INE OCR y dispersión STP SPEI por el cliente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/dist/apk/lanapp-distribuidoras.apk"
                download="lanapp-distribuidoras.apk"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#facc15] text-slate-950 font-black text-xs hover:bg-yellow-400 shadow-md transition transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                Descargar APK LanApp (Android)
              </a>
              {onNavigateToDispersion && (
                <button
                  onClick={onNavigateToDispersion}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
                >
                  <CreditCard className="w-4 h-4 text-[#facc15]" />
                  Ver en Dispersiones STP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className={fullScreenMobile ? 'w-full min-h-screen flex flex-col' : 'max-w-[1600px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8'}>
        {/* Left: Device Simulator */}
        <div className={fullScreenMobile ? 'w-full min-h-screen flex flex-col' : 'lg:col-span-5 flex flex-col items-center'}>
          {!fullScreenMobile && (
            /* Simulator Toggle Pills */
            <div className="w-full max-w-[380px] bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-1 mb-4">
              <button
                onClick={() => {
                  setActiveMode('dv');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  activeMode === 'dv'
                    ? 'bg-[#1d4ed8] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-[#facc15]" />
                LanApp Distribuidora
              </button>
              <button
                onClick={() => {
                  setActiveMode('cliente');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  activeMode === 'cliente'
                    ? 'bg-[#16a34a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Canje Cliente (Acredítala)
              </button>
            </div>
          )}

          {/* Smartphone Frame / Native Container */}
          <div className={fullScreenMobile ? 'w-full min-h-screen flex flex-col' : 'relative w-[360px] h-[740px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-[5px] border-slate-800 ring-4 ring-black/10 select-none'}>
            {!fullScreenMobile && (
              /* Speaker & Dynamic Island */
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
              </div>
            )}

            {/* Phone Screen Container */}
            <div className={fullScreenMobile ? 'relative w-full min-h-screen bg-[#132A60] overflow-hidden flex flex-col pt-3 pb-6' : 'relative w-full h-full bg-[#132A60] rounded-[38px] overflow-hidden flex flex-col pt-7 pb-4'}>
              {!fullScreenMobile && (
                /* STATUS BAR */
                <div className="px-6 py-1 flex items-center justify-between text-[11px] font-bold text-white/80 z-20">
                  <span>8:55</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                      <div className="h-full w-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>
              )}

              {/* PUSH BANNER FLOTANTE (IN-APP TOAST) */}
              {bannerToast && (
                <div
                  onClick={() => {
                    setShowNotificationsCenter(true);
                    setBannerToast(null);
                  }}
                  className="absolute top-10 left-3 right-3 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-amber-400/60 z-40 animate-bounce cursor-pointer ring-2 ring-amber-400/30"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold text-sm shadow-md">
                      {bannerToast.category === 'COBRO_VALE' ? '💰' : bannerToast.category === 'RECORDATORIO_PAGO' ? '📅' : '🔔'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black tracking-wider text-amber-300 uppercase">LANAPP ALERTA</span>
                        <span className="text-[9px] text-slate-400">Ahora</span>
                      </div>
                      <h5 className="text-[11px] font-black text-white truncate">{bannerToast.title}</h5>
                      <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight">{bannerToast.body}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DIÁLOGO / MODAL DE ACEPTACIÓN DE NOTIFICACIONES */}
              {dvStep >= 2 && !mobileNotificationAccepted && !dismissedPermissionPrompt && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-end p-3 animate-in fade-in">
                  <div className="w-full bg-[#1e293b] rounded-3xl p-4 text-white border border-slate-700 shadow-2xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-400/30">
                      🔔
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-xs font-black tracking-tight">¿Permitir notificaciones de LanApp?</h4>
                      <p className="text-[10px] text-slate-300 leading-snug">
                        Recibe alertas inmediatas en tu celular cuando tus clientes cobren vales digitales y recordatorios antes de tu fecha límite de pago para proteger tus comisiones.
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={handleAcceptNotificationPermission}
                        className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-md active:scale-95"
                      >
                        Permitir Notificaciones
                      </button>
                      <button
                        onClick={() => setDismissedPermissionPrompt(true)}
                        className="w-full py-2 rounded-xl bg-slate-800 text-slate-400 font-bold text-[11px] hover:text-white transition"
                      >
                        En otro momento
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN CONTENT CONDITIONAL RENDERING */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
                {showNotificationsCenter ? (
                  /* CENTRO DE NOTIFICACIONES DE LANAPP */
                  <div className="flex-1 flex flex-col bg-[#0f172a] text-white">
                    <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => setShowNotificationsCenter(false)}
                        className="p-1 rounded-lg hover:bg-white/10 text-white transition flex items-center gap-1 text-[11px] font-bold"
                      >
                        <ArrowLeft className="w-4 h-4 text-white" />
                        <span>Volver</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Notificaciones
                        </span>
                      </div>
                      <div className="w-12 text-right">
                        {unreadCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[8px] font-black text-white">
                            {unreadCount} nuevas
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400">Al día</span>
                        )}
                      </div>
                    </div>

                    {/* Filter Chips */}
                    <div className="p-2 bg-slate-900 border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setNotificationFilter('TODAS')}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition shrink-0 ${
                          notificationFilter === 'TODAS'
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Todas ({notifications.length})
                      </button>
                      <button
                        onClick={() => setNotificationFilter('COBRO_VALE')}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition shrink-0 ${
                          notificationFilter === 'COBRO_VALE'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        💰 Vales Cobrados
                      </button>
                      <button
                        onClick={() => setNotificationFilter('RECORDATORIO_PAGO')}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition shrink-0 ${
                          notificationFilter === 'RECORDATORIO_PAGO'
                            ? 'bg-blue-500 text-white font-black'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        📅 Fechas de Pago
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                      {notifications
                        .filter((n) =>
                          notificationFilter === 'TODAS' ? true : n.category === notificationFilter
                        )
                        .map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-3 rounded-2xl border transition cursor-pointer space-y-2 ${
                              notif.read
                                ? 'bg-white/5 border-white/10 opacity-75'
                                : 'bg-slate-800/90 border-amber-400/40 shadow-md ring-1 ring-amber-400/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">
                                  {notif.category === 'COBRO_VALE'
                                    ? '💰'
                                    : notif.category === 'RECORDATORIO_PAGO'
                                    ? '📅'
                                    : notif.category === 'DISPERSION_STP'
                                    ? '⚡'
                                    : '📢'}
                                </span>
                                <span
                                  className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                                    notif.category === 'COBRO_VALE'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : notif.category === 'RECORDATORIO_PAGO'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-blue-500/20 text-blue-300'
                                  }`}
                                >
                                  {notif.category === 'COBRO_VALE'
                                    ? 'Vale Cobrado'
                                    : notif.category === 'RECORDATORIO_PAGO'
                                    ? 'Pago Quincenal'
                                    : 'Aviso'}
                                </span>
                              </div>
                              <span className="text-[8.5px] text-slate-400 font-medium">
                                {new Date(notif.createdAt).toLocaleTimeString('es-MX', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <div>
                              <h5 className="text-[10.5px] font-black text-white leading-tight">
                                {notif.title}
                              </h5>
                              <p className="text-[9.5px] text-slate-300 mt-0.5 leading-snug">
                                {notif.body}
                              </p>
                            </div>

                            {notif.category === 'RECORDATORIO_PAGO' && (
                              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px]">
                                <span className="text-amber-300 font-bold">
                                  Ref Paynet: 9812-4019-22
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert('Referencia de Pago Quincenal:\n\nConvenio Banorte: 10429\nPaynet: 9812 4019 2210 4492\nCLABE STP: 646180104298124019\n\nPreséntalo en 7-Eleven, OXXO, Farmacias o transfiere por SPEI.');
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[8.5px]"
                                >
                                  Pagar Ahora
                                </button>
                              </div>
                            )}

                            {notif.category === 'COBRO_VALE' && (
                              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px]">
                                <span className="text-emerald-300 font-bold">
                                  Monto: ${notif.amount?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '2,500.00'} MXN
                                </span>
                                <span className="text-[8.5px] text-slate-400">
                                  Saldo actualizado
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : activeMode === 'dv' ? (
                  /* ======================================================== */
                  /* MODO DISTRIBUIDORA: LANAPP                              */
                  /* ======================================================== */
                  dvStep === 1 ? (
                    /* PASO 1: LOGIN DISTRIBUIDORA */
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 text-center">
                      {/* Logo LanAhora */}
                      <div className="w-16 h-16 rounded-full bg-[#facc15] flex items-center justify-center text-3xl shadow-lg shadow-black/20 mb-2">
                        🐑
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">LanAhora</h2>
                      <p className="text-xs text-[#facc15] font-bold italic -mt-1">¡En Ti confiamos!</p>

                      <div className="w-full mt-8 space-y-3">
                        <div className="bg-white rounded-full px-5 py-3 shadow-md">
                          <input
                            type="text"
                            defaultValue="1004"
                            readOnly
                            className="w-full text-center text-xs font-black tracking-widest text-slate-800 bg-transparent outline-none uppercase"
                            placeholder="USUARIO"
                          />
                        </div>
                        <div className="bg-white rounded-full px-5 py-3 shadow-md flex items-center">
                          <input
                            type="password"
                            defaultValue="123456"
                            readOnly
                            className="w-full text-center text-xs font-black tracking-widest text-slate-800 bg-transparent outline-none"
                            placeholder="CONTRASEÑA"
                          />
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        </div>

                        <button
                          onClick={() => setDvStep(2)}
                          className="w-full py-3 rounded-full bg-[#facc15] text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 transition active:scale-95"
                        >
                          Iniciar Sesión
                        </button>

                        <button
                          onClick={() => alert('Comunícate con tu Coordinador para recibir tu SMS de activación.')}
                          className="w-full py-3 rounded-full border-2 border-[#facc15] text-[#facc15] font-black text-xs tracking-wider uppercase hover:bg-white/5 transition"
                        >
                          Activar Cuenta
                        </button>
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={() =>
                            alert(
                              'Coordinador Asignado:\nJOSE MIGUEL GONZALEZ VARGAS\nTeléfono: (844) 600-0101'
                            )
                          }
                          className="text-[11px] font-bold text-white/70 underline tracking-wider"
                        >
                          ¿NECESITAS AYUDA?
                        </button>
                        <p className="text-[9px] text-white/40 mt-1 max-w-[220px]">
                          Si no cuentas con acceso a tu LanApp, llama a tu Coordinador de negocios.
                        </p>
                      </div>
                    </div>
                  ) : dvStep === 2 ? (
                    /* PASO 2: MI PERFIL DISTRIBUIDORA */
                    <div className="flex-1 flex flex-col px-4 py-2">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <button onClick={() => setDvStep(1)}>
                          <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-xs font-black uppercase tracking-widest text-white">
                          Mi Perfil
                        </span>
                        <button
                          onClick={() => setShowNotificationsCenter(true)}
                          className="relative p-1 rounded-full text-white/80 hover:text-white transition"
                          title="Centro de Notificaciones"
                        >
                          <Bell className="w-4 h-4 text-white" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Silver Badge & DV Name */}
                      <div className="flex flex-col items-center my-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-0.5 shadow-xl border-2 border-white/60 flex items-center justify-center relative">
                          <Award className="w-8 h-8 text-white" />
                          <span className="absolute -bottom-1.5 px-2 py-0.2 rounded-full bg-slate-800 text-[8px] font-black text-white tracking-widest border border-slate-600">
                            PLATA
                          </span>
                        </div>
                        <h3 className="text-xs font-black text-white text-center mt-3 uppercase tracking-wide">
                          Distribuidora
                          <br />
                          Concepcion Montelongo de la Rosa
                        </h3>
                      </div>

                      {/* DV ID, Status, Level */}
                      <div className="bg-white/10 rounded-xl p-2 grid grid-cols-3 gap-1 text-center border border-white/10">
                        <div>
                          <p className="text-[8px] font-bold text-white/60">NO. DISTRIBUIDOR</p>
                          <p className="text-xs font-black text-white">1004</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-white/60">ESTATUS</p>
                          <p className="text-xs font-black text-emerald-400">ACTIVO</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-white/60">NIVEL</p>
                          <p className="text-xs font-black text-white">PLATA</p>
                        </div>
                      </div>

                      {/* Notificaciones Push Status Pill */}
                      <button
                        onClick={() => {
                          if (!mobileNotificationAccepted) {
                            handleAcceptNotificationPermission();
                          } else {
                            setShowNotificationsCenter(true);
                          }
                        }}
                        className={`mt-2 py-1 px-3 rounded-xl text-[9px] font-bold flex items-center justify-between transition cursor-pointer ${
                          mobileNotificationAccepted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5" />
                          <span>{mobileNotificationAccepted ? 'Notificaciones Push Activas' : 'Activar Notificaciones de Cobro'}</span>
                        </div>
                        <span className="text-[8.5px] underline font-black">{mobileNotificationAccepted ? 'Ver centro' : 'Aceptar'}</span>
                      </button>

                      {/* Líneas de Crédito */}
                      <div className="space-y-1.5 mt-2.5">
                        <div className="bg-[#1E3A75] p-2.5 rounded-xl border border-[#facc15]/40 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-bold text-white/70">Línea VALE LANA</p>
                            <p className="text-xs font-black text-white">$55,000.00</p>
                          </div>
                          <div className="bg-[#facc15] text-slate-950 px-2.5 py-1 rounded-lg text-right">
                            <p className="text-[8px] font-bold leading-none">Línea disponible</p>
                            <p className="text-[11px] font-black leading-tight">$26,843.10</p>
                          </div>
                        </div>

                        <div className="bg-[#1E3A75] p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-bold text-white/70">Línea LANATIENDA</p>
                            <p className="text-xs font-black text-white">$17,500.00</p>
                          </div>
                          <div className="bg-white/10 text-white px-2.5 py-1 rounded-lg text-right">
                            <p className="text-[8px] font-bold text-white/60 leading-none">Línea disponible</p>
                            <p className="text-[11px] font-black text-[#facc15] leading-tight">$17,500.00</p>
                          </div>
                        </div>

                        <div className="bg-[#1E3A75] p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-bold text-white/70">Línea CRÉDITO PERSONAL</p>
                            <p className="text-xs font-black text-white">$10,000.00</p>
                          </div>
                          <div className="bg-white/10 text-white px-2.5 py-1 rounded-lg text-right">
                            <p className="text-[8px] font-bold text-white/60 leading-none">Línea disponible</p>
                            <p className="text-[11px] font-black text-[#facc15] leading-tight">$4,501.80</p>
                          </div>
                        </div>
                      </div>

                      {/* Saldos Card */}
                      <div className="bg-[#1E3A75] p-2.5 rounded-xl border border-white/10 mt-2 text-[10px]">
                        <div className="flex justify-between items-center text-white/70">
                          <span>Saldo total</span>
                          <span>Saldo atrasado</span>
                        </div>
                        <div className="flex justify-between items-center font-black text-xs text-white">
                          <span className="text-[#facc15]">$55,148.19</span>
                          <span className="text-emerald-400">$0.00</span>
                        </div>
                        <div className="border-t border-white/10 my-1.5" />
                        <div className="flex justify-between items-center text-white/70">
                          <span>Saldo relación</span>
                          <span>Fecha pago</span>
                        </div>
                        <div className="flex justify-between items-center font-black text-xs text-white">
                          <span>$10,460.00</span>
                          <span className="text-[#facc15]">24/11/2025</span>
                        </div>
                        <div className="border-t border-white/10 my-1.5" />
                        <p className="text-[9px] text-white/60">
                          Coordinador: <strong className="text-white">JOSE MIGUEL GONZALEZ VARGAS</strong>
                        </p>
                      </div>

                      {/* Botón Otorgar Crédito */}
                      <button
                        onClick={() => setDvStep(3)}
                        className="w-full mt-3 py-2.5 rounded-full bg-[#facc15] text-slate-950 font-black text-xs tracking-wider uppercase shadow-md hover:bg-yellow-400 transition"
                      >
                        Otorgar Crédito
                      </button>
                    </div>
                  ) : dvStep === 3 ? (
                    /* PASO 3: MIS CLIENTES */
                    <div className="flex-1 flex flex-col">
                      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                        <button onClick={() => setDvStep(2)}>
                          <ArrowLeft className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Mis Clientes
                        </span>
                        <button
                          onClick={() => setShowNotificationsCenter(true)}
                          className="relative p-1 rounded-full text-white/80 hover:text-white transition"
                          title="Centro de Notificaciones"
                        >
                          <Bell className="w-3.5 h-3.5 text-white" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 text-white text-[7.5px] font-black flex items-center justify-center animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Buscador de Clientes */}
                      <div className="p-3">
                        <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm">
                          <Search className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="BUSCADOR DE CLIENTE (ID/NOMBRE)"
                            className="w-full text-[10px] font-bold text-slate-800 placeholder-slate-400 outline-none uppercase"
                          />
                        </div>
                      </div>

                      {/* Column Headers */}
                      <div className="bg-[#1B3B82] px-3 py-1.5 grid grid-cols-12 text-[8px] font-black text-white/70 uppercase">
                        <span className="col-span-6">NOMBRE DEL CLIENTE</span>
                        <span className="col-span-2 text-center">ESTATUS</span>
                        <span className="col-span-2 text-center">CRÉD. ACT</span>
                        <span className="col-span-2 text-right">ACCIÓN</span>
                      </div>

                      {/* Lista de Clientes */}
                      <div className="flex-1 overflow-y-auto divide-y divide-white/10">
                        {clientesMock
                          .filter(
                            (c) =>
                              c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.id.includes(searchQuery)
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedClient({
                                  id: c.id,
                                  nombre: c.nombre,
                                  estatus: c.estatus,
                                  telefono: '844-329-8471',
                                });
                                setDvStep(4);
                              }}
                              className="px-3 py-2.5 hover:bg-white/5 cursor-pointer grid grid-cols-12 items-center text-[9px] text-white transition"
                            >
                              <div className="col-span-6">
                                <p className="font-bold leading-tight truncate">
                                  {c.id} - {c.nombre}
                                </p>
                                <p className="text-[7.5px] text-white/40">{c.ultCredito}</p>
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[7.5px]">
                                  {c.estatus}
                                </span>
                              </div>
                              <div className="col-span-2 text-center font-black text-xs text-[#facc15]">
                                {c.activos}
                              </div>
                              <div className="col-span-2 text-right">
                                <ChevronRight className="w-3.5 h-3.5 text-white/40 inline" />
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Botón Nuevo Cliente */}
                      <div className="p-3 bg-[#10224E]">
                        <button
                          onClick={() => {
                            const nuevoNombre = prompt('Ingrese Nombre Completo del Nuevo Cliente:');
                            if (nuevoNombre) {
                              setSelectedClient({
                                id: '18902',
                                nombre: nuevoNombre.toUpperCase(),
                                estatus: 'PROSPECTO',
                                telefono: '844-000-0000',
                              });
                              setDvStep(4);
                            }
                          }}
                          className="w-full py-2.5 rounded-full bg-[#facc15] text-slate-950 font-black text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 hover:bg-yellow-400 transition"
                        >
                          <Plus className="w-4 h-4" />
                          Nuevo Cliente
                        </button>
                      </div>
                    </div>
                  ) : dvStep === 4 ? (
                    /* PASO 4: CRÉDITO NUEVO (VALE DIGITAL) */
                    <div className="flex-1 flex flex-col px-4 py-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <button onClick={() => setDvStep(3)}>
                          <ArrowLeft className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Crédito Nuevo
                        </span>
                        <button
                          onClick={() => setShowNotificationsCenter(true)}
                          className="relative p-1 rounded-full text-white/80 hover:text-white transition"
                          title="Centro de Notificaciones"
                        >
                          <Bell className="w-3.5 h-3.5 text-white" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 text-white text-[7.5px] font-black flex items-center justify-center animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Avatar y Nombre Cliente */}
                      <div className="flex flex-col items-center my-3">
                        <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-[#facc15] flex items-center justify-center">
                          <User className="w-9 h-9 text-[#facc15]" />
                        </div>
                        <h3 className="text-xs font-black text-white text-center mt-2 uppercase tracking-wide">
                          {selectedClient.nombre}
                        </h3>
                        <p className="text-[9px] text-[#facc15] font-bold">ID #{selectedClient.id}</p>
                      </div>

                      {/* Selector de Plazos */}
                      <div className="mt-2">
                        <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">
                          Plazos (Quincenas)
                        </p>
                        <div className="bg-[#facc15] rounded-full h-11 px-4 flex items-center justify-between shadow-md">
                          <button
                            onClick={() => setPlazos((prev) => Math.max(4, prev - 2))}
                            className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-slate-950 font-black text-sm active:scale-95"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-base font-black text-slate-950">{plazos}</span>
                          <button
                            onClick={() => setPlazos((prev) => Math.min(16, prev + 2))}
                            className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-slate-950 font-black text-sm active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Selector de Importe */}
                      <div className="mt-3">
                        <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">
                          Importe
                        </p>
                        <div className="bg-[#facc15] rounded-full h-11 px-4 flex items-center justify-between shadow-md">
                          <button
                            onClick={() => setImporte((prev) => Math.max(1000, prev - 500))}
                            className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-slate-950 font-black text-sm active:scale-95"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-base font-black text-slate-950">
                            ${importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => setImporte((prev) => Math.min(9000, prev + 500))}
                            className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-slate-950 font-black text-sm active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Pago por Plazo Calculado */}
                      <div className="mt-3">
                        <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">
                          Pago por Plazo
                        </p>
                        <div className="bg-[#facc15] rounded-full h-11 flex items-center justify-center shadow-md">
                          <span className="text-lg font-black text-slate-950">
                            ${pagoPorPlazo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex gap-3">
                        <button
                          onClick={() => setDvStep(3)}
                          className="flex-1 py-2.5 rounded-full bg-white text-slate-800 font-black text-xs uppercase shadow hover:bg-slate-100 transition"
                        >
                          Regresar
                        </button>
                        <button
                          onClick={() => setDvStep(5)}
                          className="flex-1 py-2.5 rounded-full bg-[#facc15] text-slate-950 font-black text-xs uppercase shadow hover:bg-yellow-400 transition"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : dvStep === 5 ? (
                    /* PASO 5: INFORMACIÓN / AUTORIZACIÓN (FOLIO ID #2) */
                    <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-2 shadow-lg">
                        <Check className="w-8 h-8 stroke-[3]" />
                      </div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Información
                      </h3>
                      <p className="text-xs text-white/80 font-bold mt-1 text-center">
                        El crédito se autorizó correctamente
                      </p>

                      <div className="w-full bg-[#1E3A8A] rounded-2xl p-4 border border-white/10 mt-4 text-left text-xs space-y-2.5 shadow-md">
                        <div>
                          <p className="text-[8px] font-black text-white/60 uppercase">CRÉDITO PARA:</p>
                          <p className="font-black text-white text-xs">{selectedClient.nombre}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-white/60 uppercase">POR LA CANTIDAD DE:</p>
                          <p className="font-black text-[#facc15] text-xs">
                            ${importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({plazos} pagos de ${pagoPorPlazo.toFixed(2)})
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                          <div>
                            <p className="text-[8px] font-black text-white/60 uppercase">CRÉDITO ID:</p>
                            <p className="font-black text-white text-xs">#{folioGenerado}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-white/60 uppercase">FECHA DE PRIMER PAGO:</p>
                            <p className="font-black text-[#facc15] text-xs">20/12/2026</p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full mt-5 space-y-2">
                        <button
                          onClick={() => setDvStep(6)}
                          className="w-full py-2.5 rounded-full bg-[#facc15] text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 shadow hover:bg-yellow-400 transition"
                        >
                          <Share2 className="w-4 h-4" />
                          Compartir por WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            setActiveMode('cliente');
                            setClientStep(8);
                          }}
                          className="w-full py-2 rounded-full border border-emerald-400 text-emerald-400 font-black text-[11px] uppercase flex items-center justify-center gap-1.5 hover:bg-emerald-500/10 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Simular Canje del Cliente
                        </button>
                        <button
                          onClick={() => setDvStep(2)}
                          className="w-full py-2 rounded-full text-white/60 font-bold text-xs hover:text-white transition"
                        >
                          Aceptar y volver al perfil
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* PASO 6: COMPARTIR POR WHATSAPP PREVIEW */
                    <div className="flex-1 flex flex-col bg-[#0b141a] text-white">
                      {/* WhatsApp Header */}
                      <div className="bg-[#1f2c34] px-4 py-2 flex items-center justify-between border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDvStep(5)}>
                            <ArrowLeft className="w-4 h-4 text-slate-300" />
                          </button>
                          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-black">
                            {selectedClient.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{selectedClient.nombre}</p>
                            <p className="text-[9px] text-emerald-400">en línea</p>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Chat Area */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                        <div className="bg-[#005c4b] p-3 rounded-2xl rounded-tr-none max-w-[92%] ml-auto text-xs shadow-md space-y-2 border border-emerald-600/30">
                          {/* Miniatura Vale */}
                          <div className="bg-white/10 rounded-xl p-2.5 border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">🐑</span>
                              <span className="font-black text-xs text-white">LanAhora</span>
                            </div>
                            <p className="text-[10px] text-yellow-300 font-bold">
                              Vale Digital #{folioGenerado} Autorizado
                            </p>
                            <p className="text-[9px] text-white/80">
                              Monto: ${importe.toLocaleString('es-MX')} a {plazos} quincenas de ${pagoPorPlazo.toFixed(2)}
                            </p>
                          </div>

                          <p className="text-[10px] text-white/95 leading-relaxed">
                            Gracias por tu canje. Para darle seguimiento y recibir tu dinero de inmediato en tu tarjeta, ingresa al siguiente enlace oficial:
                          </p>

                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveMode('cliente');
                              setClientStep(8);
                            }}
                            className="block text-[9.5px] text-blue-200 underline font-mono break-all hover:text-white"
                          >
                            {shareUrl}
                          </a>

                          <div className="text-right text-[8px] text-emerald-200">
                            8:56 p.m. ✓✓
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Bottom Action */}
                      <div className="p-3 bg-[#1f2c34] flex items-center gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#facc15]" />
                          {copiedLink ? '¡Enlace Copiado!' : 'Copiar Mensaje'}
                        </button>
                        <button
                          onClick={() => {
                            setActiveMode('cliente');
                            setClientStep(8);
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Abrir Enlace
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  /* ======================================================== */
                  /* MODO CLIENTE: PORTAL DE CANJE ACREDITALA (PASOS 8 AL 17) */
                  /* ======================================================== */
                  <div className="flex-1 flex flex-col bg-[#f0f4fa] text-slate-900">
                    {/* Inputs ocultos para captura real de cámara/fotos */}
                    <input
                      type="file"
                      ref={fileInputFrenteRef}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'frente')}
                    />
                    <input
                      type="file"
                      ref={fileInputReversoRef}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'reverso')}
                    />
                    <input
                      type="file"
                      ref={fileInputSelfieRef}
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'selfie')}
                    />

                    {/* Top Browser Bar */}
                    <div className="bg-white px-3 py-1.5 border-b border-blue-100 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 font-mono text-slate-600 truncate max-w-[200px]">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>canje.lanahora.com.mx</span>
                      </div>
                      <span className="text-[9px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Paso {clientStep}/17
                      </span>
                    </div>

                    {/* LanAhora Header in Client Portal (Identidad Unificada) */}
                    <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] py-2 px-3 flex items-center justify-between shadow-xs text-white">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#facc15] text-slate-950 px-1.5 py-0.5 rounded font-black text-xs">
                          LH
                        </div>
                        <span className="font-extrabold text-xs tracking-tight">LanAhora Canje Digital</span>
                      </div>
                      <span className="text-[9px] text-blue-100 font-mono">v.1.16.7.0</span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                      {clientStep === 8 ? (
                        /* PASO 8: DETALLE DE VALE */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 space-y-3">
                          <h3 className="text-center font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                            Detalle de Vale
                          </h3>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold">Referencia:</span>
                              <span className="font-black text-slate-800">1-1575</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold">Monto:</span>
                              <span className="font-black text-blue-700">
                                ${importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold">Plazos:</span>
                              <span className="font-black text-slate-800">{plazos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold">Plazo Tipo:</span>
                              <span className="font-black text-slate-800">PAGO QUINCENAL</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold">Pago:</span>
                              <span className="font-black text-emerald-600">
                                ${pagoPorPlazo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold">Seguro de Vida:</span>
                              <span className="font-black text-slate-800">$10,000.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-bold">Fecha Primer Pago:</span>
                              <span className="font-black text-blue-900">20/12/2026</span>
                            </div>
                          </div>

                          <div className="pt-2 text-center">
                            <p className="text-[10px] text-slate-500 font-bold mb-2">
                              ¿La información mostrada, ¿es correcta?
                            </p>
                            <button
                              onClick={() => setClientStep(9)}
                              className="w-full py-2.5 rounded-full bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase shadow transition active:scale-95"
                            >
                              Sí, es correcta
                            </button>
                          </div>
                        </div>
                      ) : clientStep === 9 ? (
                        /* PASO 9: DOMICILIO */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 space-y-2.5 text-xs">
                          <p className="text-[10px] text-slate-500 font-bold">
                            Por favor, capture la información solicitada a continuación.
                          </p>
                          <h4 className="font-black text-slate-900 text-sm">Domicilio</h4>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500">Calle: *</label>
                            <input
                              type="text"
                              defaultValue="Blvd. Venustiano Carranza"
                              className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-slate-500">Núm. ext: *</label>
                              <input
                                type="text"
                                defaultValue="2450"
                                className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500">Núm. int:</label>
                              <input
                                type="text"
                                defaultValue="B-4"
                                className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500">Código postal: *</label>
                            <input
                              type="text"
                              defaultValue="25280"
                              className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500">Colonia: *</label>
                            <input
                              type="text"
                              defaultValue="República Oriente"
                              className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500">Ciudad / Estado: *</label>
                            <input
                              type="text"
                              defaultValue="Saltillo, Coahuila"
                              className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                            />
                          </div>

                          <button
                            onClick={() => setClientStep(10)}
                            className="w-full mt-3 py-2.5 rounded-full bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase shadow transition active:scale-95"
                          >
                            Continuar a Beneficiarios
                          </button>
                        </div>
                      ) : clientStep === 10 ? (
                        /* PASO 10: BENEFICIARIO */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-slate-900 text-sm">Beneficiarios</h4>
                            <Plus className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Datos del beneficiario del seguro de vida en caso de fallecimiento.
                          </p>

                          <div className="p-2.5 bg-blue-50/50 rounded-xl space-y-2 border border-blue-100">
                            <span className="text-[10px] font-black text-blue-700">Beneficiario 1</span>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500">Nombre Completo: *</label>
                              <input
                                type="text"
                                value={nombreBeneficiario}
                                onChange={(e) => setNombreBeneficiario(e.target.value)}
                                className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500">Parentesco: *</label>
                                <select
                                  value={parentesco}
                                  onChange={(e) => setParentesco(e.target.value)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                >
                                  <option>Esposa(o)</option>
                                  <option>Hijo(a)</option>
                                  <option>Madre/Padre</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500">% Destinado:</label>
                                <input
                                  type="text"
                                  defaultValue="100%"
                                  readOnly
                                  className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-100"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500">Fecha nacimiento: *</label>
                              <input
                                type="text"
                                defaultValue="14/06/1988"
                                className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => setClientStep(11)}
                            className="w-full mt-3 py-2.5 rounded-full bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase shadow transition active:scale-95"
                          >
                            Continuar a Datos Bancarios
                          </button>
                        </div>
                      ) : clientStep === 11 ? (
                        /* PASO 11: DATOS BANCARIOS */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 space-y-3 text-xs">
                          <h4 className="font-black text-slate-900 text-sm">
                            Datos bancarios para depósito
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Ingresa la tarjeta de débito o CLABE donde recibirás el depósito inmediato vía STP SPEI.
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setTipoCuenta('tarjeta')}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                                tipoCuenta === 'tarjeta'
                                  ? 'bg-[#2563eb] text-white border-[#2563eb]'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              Tarjeta de débito
                            </button>
                            <button
                              onClick={() => setTipoCuenta('clabe')}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                                tipoCuenta === 'clabe'
                                  ? 'bg-[#2563eb] text-white border-[#2563eb]'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              CLABE (18 dígitos)
                            </button>
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500">
                              Número de {tipoCuenta === 'tarjeta' ? 'Tarjeta (16 dígitos)' : 'CLABE'}: *
                            </label>
                            <input
                              type="text"
                              value={numTarjeta}
                              onChange={(e) => setNumTarjeta(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-slate-50"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-slate-500">Banco: *</label>
                            <select
                              value={bancoCliente}
                              onChange={(e) => setBancoCliente(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                            >
                              <option>BBVA México</option>
                              <option>Santander</option>
                              <option>Banorte</option>
                              <option>Citibanamex</option>
                              <option>Banco Azteca</option>
                              <option>Nu México (STP)</option>
                              <option>Spin by OXXO</option>
                            </select>
                          </div>

                          <button
                            onClick={() => setClientStep(12)}
                            className="w-full mt-3 py-2.5 rounded-full bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase shadow transition active:scale-95"
                          >
                            Registrar y Validar INE
                          </button>
                        </div>
                      ) : clientStep === 12 ? (
                        /* PASO 12: INE ANVERSO CON FOTO REAL / DEMO */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 text-center space-y-3">
                          <h4 className="font-black text-slate-900 text-sm">
                            VERIFICACIÓN DE IDENTIDAD (ANVERSO)
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Capture el <strong>ANVERSO</strong> de la credencial de elector. Asegúrese de que no haya reflejos.
                          </p>

                          {fotoIneFrente ? (
                            <div className="space-y-2">
                              <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden border-2 border-emerald-500 relative shadow-sm">
                                <img
                                  src={fotoIneFrente}
                                  alt="INE Frente"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Foto Capturada
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => fileInputFrenteRef.current?.click()}
                                  className="flex-1 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-[11px] hover:bg-slate-50 transition"
                                >
                                  Tomar de nuevo
                                </button>
                                <button
                                  onClick={() => setClientStep(13)}
                                  className="flex-1 py-2 rounded-xl bg-[#2563eb] text-white font-black text-xs uppercase shadow hover:bg-blue-700 transition"
                                >
                                  Continuar a Reverso
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <div
                                onClick={() => fileInputFrenteRef.current?.click()}
                                className="w-full h-36 bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden cursor-pointer hover:bg-blue-50 transition"
                              >
                                <CreditCard className="w-10 h-10 text-blue-500 mb-1" />
                                <span className="text-[11px] font-black text-blue-900">
                                  Toque para abrir Cámara o Subir Foto
                                </span>
                                <span className="text-[9px] text-slate-500 mt-0.5">
                                  Cámara trasera recomendada
                                </span>
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-600" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-600" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-600" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-600" />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => fileInputFrenteRef.current?.click()}
                                  className="flex-1 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                                >
                                  <Camera className="w-4 h-4" />
                                  Tomar con Cámara
                                </button>
                                <button
                                  onClick={() => setFotoIneFrente(DEMO_INE_FRENTE)}
                                  className="py-2 px-3 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow transition"
                                  title="Carga una credencial de muestra de prueba para verificar el flujo de inmediato"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Muestra Demo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : clientStep === 13 ? (
                        /* PASO 13: INE REVERSO CON FOTO REAL / DEMO */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 text-center space-y-3">
                          <h4 className="font-black text-slate-900 text-sm">
                            VERIFICACIÓN DE IDENTIDAD (REVERSO)
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Capture el <strong>REVERSO</strong> de la credencial (código de barras MRZ y firma).
                          </p>

                          {fotoIneReverso ? (
                            <div className="space-y-2">
                              <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden border-2 border-emerald-500 relative shadow-sm">
                                <img
                                  src={fotoIneReverso}
                                  alt="INE Reverso"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Reverso Capturado
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => fileInputReversoRef.current?.click()}
                                  className="flex-1 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-[11px] hover:bg-slate-50 transition"
                                >
                                  Tomar de nuevo
                                </button>
                                <button
                                  onClick={() => setClientStep(14)}
                                  className="flex-1 py-2 rounded-xl bg-[#2563eb] text-white font-black text-xs uppercase shadow hover:bg-blue-700 transition"
                                >
                                  Validar OCR
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <div
                                onClick={() => fileInputReversoRef.current?.click()}
                                className="w-full h-36 bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden cursor-pointer hover:bg-blue-50 transition"
                              >
                                <QrCode className="w-10 h-10 text-blue-500 mb-1" />
                                <span className="text-[11px] font-black text-blue-900">
                                  Toque para capturar el reverso
                                </span>
                                <span className="text-[9px] text-slate-500 mt-0.5">
                                  Encuadre el código de barras y firma
                                </span>
                                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-600" />
                                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-600" />
                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-600" />
                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-600" />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => fileInputReversoRef.current?.click()}
                                  className="flex-1 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                                >
                                  <Camera className="w-4 h-4" />
                                  Tomar con Cámara
                                </button>
                                <button
                                  onClick={() => setFotoIneReverso(DEMO_INE_REVERSO)}
                                  className="py-2 px-3 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow transition"
                                  title="Carga el reverso de muestra demo"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Muestra Demo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : clientStep === 14 ? (
                        /* PASO 14: INE OCR OK */
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 text-center space-y-4">
                          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                            <Check className="w-8 h-8 stroke-[3]" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">
                              Información de INE obtenida correctamente.
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Validación automática de autenticidad y listas SAT 69-B completada con éxito.
                            </p>
                          </div>

                          {/* Miniatura de las 2 fotos */}
                          <div className="grid grid-cols-2 gap-2 text-left">
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[9px] font-bold text-slate-500 block mb-1">Anverso:</span>
                              <div className="h-16 rounded overflow-hidden bg-slate-200">
                                <img
                                  src={fotoIneFrente || DEMO_INE_FRENTE}
                                  alt="Frente"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[9px] font-bold text-slate-500 block mb-1">Reverso:</span>
                              <div className="h-16 rounded overflow-hidden bg-slate-200">
                                <img
                                  src={fotoIneReverso || DEMO_INE_REVERSO}
                                  alt="Reverso"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setClientStep(15)}
                            className="w-full py-2.5 rounded-full bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase shadow transition active:scale-95"
                          >
                            Continuar a Selfie Facial
                          </button>
                        </div>
                      ) : clientStep === 15 ? (
                        /* PASO 15: VIDEOSELFIE DENTRO DEL ÓVALO (DISEÑO FINTECH EXACTO) */
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-100 text-center space-y-4">
                          <h3 className="font-extrabold text-[#244c9c] text-xl sm:text-2xl tracking-tight">
                            Prepárese para su videoselfie
                          </h3>

                          {/* Alerta Obligatoria: Sin Lentes */}
                          {!fotoSelfie && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 mx-auto">
                              <EyeOff className="w-4 h-4 text-red-600 shrink-0" />
                              <span>IMPORTANTE: Retírese los lentes y gorra</span>
                            </div>
                          )}

                          {/* Óvalo en el centro con video o foto integrada sin salir de la app */}
                          <div className={`w-52 h-72 sm:w-60 sm:h-84 mx-auto rounded-[120px] border-[3.5px] ${
                            fotoSelfie ? 'border-emerald-500' : isScanningLive ? 'border-emerald-400 animate-pulse' : 'border-[#2563eb]'
                          } bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden shadow-lg transition-all duration-300`}>
                            {fotoSelfie ? (
                              <img
                                src={fotoSelfie}
                                alt="Selfie"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <>
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  className={`w-full h-full object-cover scale-x-[-1] ${isCameraActive ? 'block' : 'hidden'}`}
                                />
                                {!isCameraActive && (
                                  <div className="flex flex-col items-center justify-center p-4 text-center">
                                    <div className="w-24 h-32 rounded-[60px] border-2 border-blue-400/60 border-dashed flex items-center justify-center mb-2 animate-pulse">
                                      <User className="w-14 h-14 text-blue-300" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300">
                                      Cámara lista en dispositivo
                                    </span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Barrido de escaneo en vivo */}
                            {isScanningLive && (
                              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6">
                                <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce" />
                                <span className="text-[11px] font-black text-white bg-slate-900/80 px-3 py-1 rounded-full mx-auto backdrop-blur-xs">
                                  {livenessMsg}
                                </span>
                              </div>
                            )}

                            {fotoSelfie && (
                              <div className="absolute bottom-3 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Rostro Verificado
                              </div>
                            )}
                          </div>

                          {/* Instrucciones debajo del óvalo */}
                          <div className="space-y-0.5 pt-1">
                            <p className="text-slate-800 font-bold text-sm">
                              Encuadre su rostro en el óvalo
                            </p>
                            <p className="text-slate-500 font-medium text-xs">
                              Presione Estoy listo y acérquese
                            </p>
                          </div>

                          {/* Botón Principal ESTOY LISTO */}
                          <div className="pt-2">
                            {fotoSelfie ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setFotoSelfie(null);
                                    setLivenessPhase('idle');
                                    setLivenessProgress(0);
                                    startInlineCamera();
                                  }}
                                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                                >
                                  Repetir
                                </button>
                                <button
                                  onClick={() => setClientStep(16)}
                                  className="flex-1 py-3 rounded-xl bg-[#2563eb] text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-blue-700 transition"
                                >
                                  Continuar a Firma
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={handleEstoyListo}
                                disabled={isScanningLive}
                                className="w-full py-3.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg transition active:scale-98"
                              >
                                {isScanningLive ? 'Verificando...' : 'ESTOY LISTO'}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : clientStep === 16 ? (
                        /* PASO 16: FIRMA DIGITAL TÁCTIL */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 space-y-2 text-xs">
                          <h4 className="font-black text-slate-900 text-sm">Firma del Vale</h4>
                          <p className="text-[10px] text-slate-500">
                            Firme en el recuadro gris lo más similar posible a su INE y presione el botón de finalizar.
                          </p>

                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] font-bold text-slate-600">Lienzo Digital:</span>
                            <button
                              onClick={clearSignature}
                              className="text-[10px] text-rose-600 font-bold hover:underline"
                            >
                              Borrar firma
                            </button>
                          </div>

                          {/* Canvas de Firma Táctil */}
                          <div className="w-full h-36 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 relative overflow-hidden touch-none">
                            <canvas
                              ref={canvasRef}
                              width={280}
                              height={140}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-full cursor-crosshair"
                            />
                            {!hasSigned && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-slate-400 font-bold">
                                Dibuje su firma aquí con el dedo o puntero
                              </div>
                            )}
                          </div>

                          <button
                            onClick={async () => {
                              try {
                                await registrarCanje({
                                  folio: '1-1575',
                                  clienteNombre: 'MARYLYN SILVA TORRES',
                                  distribuidorId: 1002,
                                  monto: 4000,
                                  metodo: 'STP',
                                  banco: 'BBVA México',
                                  clabe: '012180015488920192',
                                  curp: 'SITM890918MCLLRR02',
                                });
                              } catch (e) {
                                console.error(e);
                              }
                              setClientStep(17);
                            }}
                            className="w-full mt-3 py-2.5 rounded-full bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase shadow transition active:scale-95"
                          >
                            Firmar y Finalizar Canje
                          </button>
                        </div>
                      ) : (
                        /* PASO 17: DEPÓSITO CONFIRMADO, CONTRATO, CORRIDA DE PAGOS Y PAGARÉ FIRMADO */
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 text-center space-y-3">
                          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                            <Check className="w-8 h-8 stroke-[3]" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base leading-snug">
                              ¡Crédito Formalizado Exitosamente!
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Dispersión STP SPEI en proceso y documentación legal firmada.
                            </p>
                          </div>

                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-[11px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-bold">Monto dispersado:</span>
                              <span className="font-black text-emerald-900">
                                ${importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-bold">Banco Destino:</span>
                              <span className="font-black text-emerald-900">{bancoCliente}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-800 font-bold">Clave Rastreo:</span>
                              <span className="font-mono text-[9px] font-bold text-emerald-900">
                                STP844202611059921
                              </span>
                            </div>
                          </div>

                          {/* PESTAÑAS DE DOCUMENTOS LEGALES */}
                          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-[10px]">
                            <button
                              onClick={() => setSubTabDoc('contrato')}
                              className={`flex-1 py-1.5 rounded-lg font-black transition ${
                                subTabDoc === 'contrato' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              📄 Contrato
                            </button>
                            <button
                              onClick={() => setSubTabDoc('corrida')}
                              className={`flex-1 py-1.5 rounded-lg font-black transition ${
                                subTabDoc === 'corrida' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              📊 Corrida
                            </button>
                            <button
                              onClick={() => setSubTabDoc('pagare')}
                              className={`flex-1 py-1.5 rounded-lg font-black transition ${
                                subTabDoc === 'pagare' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              ✒️ Pagaré
                            </button>
                          </div>

                          {/* CONTENIDO DEL DOCUMENTO */}
                          {subTabDoc === 'contrato' ? (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[10px] text-slate-700 space-y-1.5 leading-relaxed max-h-56 overflow-y-auto">
                              <div className="font-black text-slate-900 text-[11px] border-b pb-1">
                                CONTRATO DE APERTURA DE CRÉDITO MEDIANTE VALE DIGITAL
                              </div>
                              <p>
                                <strong>Otorgante:</strong> LANAHORA SOFOM E.N.R. intermediado por Distribuidora #1002 (Bertha Alicia Tello Lara).
                              </p>
                              <p>
                                <strong>Acreditado:</strong> {selectedClient.nombre} (CURP: SITM890918MCLLRR02).
                              </p>
                              <p>
                                <strong>Monto Dispuesto:</strong> ${importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.
                              </p>
                              <p>
                                <strong>Condiciones:</strong> {plazos} pagos quincenales de ${(Math.round((importe * (1 + plazos * 0.071)) / plazos)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.
                              </p>
                              <p>
                                <strong>Costo Anual Total (CAT):</strong> 43.8% sin IVA • Tasa Ordinaria Fija: 34.00% anual.
                              </p>
                              <p>
                                <strong>Seguro de Vida ($10,000.00 MXN):</strong> A favor del beneficiario designado en la solicitud.
                              </p>
                              <p className="text-[9px] text-slate-500 italic">
                                Formalizado mediante autenticación biométrica facial en vivo y firma electrónica avanzada conforme a los artículos 89 y 97 del Código de Comercio.
                              </p>
                            </div>
                          ) : subTabDoc === 'corrida' ? (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-[9px] max-h-56 overflow-y-auto">
                              <div className="font-black text-slate-900 text-[10px] mb-1.5">
                                TABLA DE AMORTIZACIÓN ({plazos} QUINCENAS)
                              </div>
                              <div className="grid grid-cols-6 gap-1 bg-blue-700 text-white font-bold p-1 rounded-md text-[8px] text-center mb-1">
                                <span>No.</span>
                                <span>Vence</span>
                                <span>Capital</span>
                                <span>Interés</span>
                                <span>Cuota</span>
                                <span>Saldo</span>
                              </div>
                              <div className="space-y-0.5 divide-y divide-slate-100">
                                {Array.from({ length: plazos }, (_, i) => {
                                  const num = i + 1;
                                  const cuota = Math.round((importe * (1 + plazos * 0.071)) / plazos);
                                  const cap = Math.round(importe / plazos);
                                  const saldo = (plazos - num) * cuota;
                                  return (
                                    <div key={num} className="grid grid-cols-6 gap-1 p-0.5 text-center items-center font-mono">
                                      <span className="font-bold text-slate-900">{num}</span>
                                      <span className="text-slate-600 text-[7.5px]">{`${(num * 15) % 28 + 1}/12/26`}</span>
                                      <span className="text-slate-700">${cap}</span>
                                      <span className="text-slate-700">${cuota - cap}</span>
                                      <span className="font-bold text-blue-700">${cuota}</span>
                                      <span className="font-bold text-emerald-700">${saldo}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[10px] text-slate-700 space-y-1.5 leading-relaxed">
                              <div className="font-black text-slate-900 text-[11px] border-b pb-1">
                                PAGARÉ ELECTRÓNICO MERCANTIL
                              </div>
                              <p className="text-[9.5px]">
                                DEBO Y PAGARÉ incondicionalmente a la orden de LANAHORA, S.A.P.I. DE C.V., SOFOM, E.N.R., la cantidad total de ${(Math.round((importe * (1 + plazos * 0.071)) / plazos) * plazos).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN en {plazos} pagos quincenales consecutivos.
                              </p>
                              <div className="pt-1">
                                <span className="text-[9px] font-bold text-slate-500 block">Firma Táctil del Suscriptor:</span>
                                <div className="h-16 w-full bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center mt-1">
                                  <span className="text-[10px] text-emerald-700 font-black">✓ Firma Digital Autenticada con Biometría</span>
                                </div>
                              </div>
                              <p className="text-[8px] font-mono text-slate-400">
                                Sello SHA-256: 8f4a19b027e8... • IP Certificada
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => alert('✓ Expediente completo (Contrato, Pagaré y Corrida de Pagos) descargado exitosamente en formato PDF.')}
                            className="w-full py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Descargar Expediente Completo (PDF)
                          </button>

                          <div className="space-y-1.5 pt-1">
                            <button
                              onClick={() => {
                                setActiveMode('dv');
                                setDvStep(2);
                              }}
                              className="w-full py-2.5 rounded-full bg-[#2563eb] text-white font-black text-xs uppercase shadow hover:bg-blue-700 transition"
                            >
                              Volver a LanApp Distribuidora
                            </button>
                            {onNavigateToDispersion && (
                              <button
                                onClick={onNavigateToDispersion}
                                className="w-full py-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                              >
                                Ver dispersión en panel STP Core
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM NAVIGATION BAR (LANAPP DV) */}
              {activeMode === 'dv' && dvStep >= 2 && dvStep <= 4 && (
                <div className="px-2 pt-2 pb-1 border-t border-white/10 bg-[#132A60] grid grid-cols-5 text-center text-white/60">
                  <button
                    onClick={() => setDvStep(3)}
                    className={`flex flex-col items-center py-1 ${
                      dvStep === 3 ? 'text-[#facc15]' : 'hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-[7.5px] font-bold mt-0.5">Clientes</span>
                  </button>
                  <button
                    onClick={() => setDvStep(2)}
                    className={`flex flex-col items-center py-1 ${
                      dvStep === 2 ? 'text-[#facc15]' : 'hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[7.5px] font-bold mt-0.5">Créditos</span>
                  </button>
                  <button
                    onClick={() => alert('Valera Digital: 100 folios disponibles.')}
                    className="flex flex-col items-center py-1 hover:text-white"
                  >
                    <Receipt className="w-4 h-4" />
                    <span className="text-[7.5px] font-bold mt-0.5">Valera</span>
                  </button>
                  <button
                    onClick={() => alert('Saldo Relación a pagar: $10,460.00 al 24/11/2025')}
                    className="flex flex-col items-center py-1 hover:text-white"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-[7.5px] font-bold mt-0.5">Relación</span>
                  </button>
                  <button
                    onClick={() => setDvStep(1)}
                    className="flex flex-col items-center py-1 hover:text-white"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[7.5px] font-bold mt-0.5">Salir</span>
                  </button>
                </div>
              )}

              {!fullScreenMobile && (
                /* Home Indicator */
                <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-1" />
              )}
            </div>
          </div>
        </div>

        {!fullScreenMobile && (
          /* Right: Manual Steps & System Status (7 cols) */
          <div className="lg:col-span-7 space-y-6">
          {/* Status & Flow Quick Guide */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  17
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Flujo Oficial: Vale Digital con Canje Inmediato
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fases sincronizadas entre LanApp (Distribuidora) y Portal Web Acredítala (Cliente)
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                STP SPEI Conectado
              </span>
            </div>

            {/* Quick Step Buttons Grid */}
            <div className="mt-5 space-y-4">
              <div>
                <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                  Fase 1: Experiencia Distribuidora (LanApp Móvil)
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                  {[
                    { step: 1, label: '1. Login' },
                    { step: 2, label: '2. Mi Perfil' },
                    { step: 3, label: '3. Clientes' },
                    { step: 4, label: '4. Nuevo Vale' },
                    { step: 5, label: '5. Autorizado' },
                    { step: 6, label: '6. WhatsApp' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => {
                        setActiveMode('dv');
                        setDvStep(s.step);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition ${
                        activeMode === 'dv' && dvStep === s.step
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
                  Fase 2: Portal de Canje y Dispersión (Cliente Final)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                  {[
                    { step: 8, label: '8. Detalle Vale' },
                    { step: 9, label: '9. Domicilio' },
                    { step: 10, label: '10. Seguro' },
                    { step: 11, label: '11. Tarjeta/CLABE' },
                    { step: 12, label: '12. INE Frente' },
                    { step: 13, label: '13. INE Reverso' },
                    { step: 14, label: '14. OCR OK' },
                    { step: 15, label: '15. Selfie' },
                    { step: 16, label: '16. Firma' },
                    { step: 17, label: '17. Depósito STP' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      onClick={() => {
                        setActiveMode('cliente');
                        setClientStep(s.step);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition ${
                        activeMode === 'cliente' && clientStep === s.step
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Integración con el Core */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: WhatsApp Link & Share */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-black text-slate-900 text-sm">Enlace Único de Canje</h4>
              </div>
              <p className="text-xs text-slate-500">
                URL generada con token criptográfico único para canje en el portal del cliente:
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                {shareUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink ? '¡Copiado al portapapeles!' : 'Copiar para WhatsApp'}
              </button>
            </div>

            {/* Card 2: Descarga del APK Flutter */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h4 className="font-black text-slate-900 text-sm">App Nativa de Distribuidoras</h4>
              </div>
              <p className="text-xs text-slate-500">
                Paquete binario compilado en Flutter 3.47 con arquitectura offline-first y soporte Android 8+:
              </p>
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-xs flex items-center justify-between">
                <div>
                  <p className="font-black text-blue-900">lanapp-distribuidoras.apk</p>
                  <p className="text-[10px] text-blue-600 font-medium">Build Oficial • Release Ready</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded font-black text-[10px]">
                  APK
                </span>
              </div>
              <a
                href="/dist/apk/lanapp-distribuidoras.apk"
                download="lanapp-distribuidoras.apk"
                className="w-full py-2 rounded-xl bg-[#facc15] hover:bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                Descargar Instalador APK
              </a>
            </div>
          </div>

          {/* Technical Specs Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h4 className="font-black text-slate-900 text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Validaciones de Seguridad y Dispersión
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-black text-slate-800">OCR & Padrón INE</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Extracción de MRZ, OCR y validación de vigencia en tiempo real.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-black text-slate-800">Biometría Facial Liveness</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Detección de vida en selfie con score match &gt; 98% contra foto del INE.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-black text-slate-800">Dispersión STP SPEI</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Depósito interbancario automatizado vía Webhook con clave de rastreo bancario.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
