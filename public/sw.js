// ==============================================================================
// LanAhora Service Worker — Notificaciones Push en Segundo Plano (PWA)
// Funciona en 4G/5G, Wi-Fi remota y con el navegador o pantalla bloqueada.
// ==============================================================================

const CACHE_NAME = 'lanahora-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Recepción de Notificaciones Push Remotas desde el Servidor
self.addEventListener('push', (event) => {
  let data = {
    title: 'LanApp (Distribuidoras)',
    body: 'Tienes una nueva notificación de LanAhora.',
    icon: '/icon.png',
    badge: '/favicon-32x32.png',
    tag: 'lanapp-alert',
    url: '/lanapp',
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: data.badge || '/favicon-32x32.png',
    tag: data.tag || `lanapp-${Date.now()}`,
    vibrate: [250, 100, 250, 100, 250],
    data: {
      url: data.url || '/lanapp',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: '📱 Abrir LanApp' },
      { action: 'dismiss', title: 'Cerrar' },
    ],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2. Interacción al hacer clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/lanapp';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la ventana de LanApp ya está abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes('/lanapp') && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, abrir una nueva ventana
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
