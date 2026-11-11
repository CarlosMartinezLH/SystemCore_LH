import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LanApp - Distribuidoras LanAhora',
    short_name: 'LanApp',
    description: 'Aplicación oficial para Distribuidoras LanAhora - Vales digitales, créditos y comisiones',
    start_url: '/lanapp',
    display: 'standalone',
    background_color: '#132A60',
    theme_color: '#132A60',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/lanahora-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
