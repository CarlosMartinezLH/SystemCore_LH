import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'LanAtienda - Tu tienda en línea a 16 quincenas | Financiera LanAhora',
  description:
    'Adquiere productos en línea a 16 quincenas fijas con tu crédito LanAhora. Compra con tu distribuidora autorizada.',
  icons: {
    icon: '/tienda/logo-tienda-blanco.png',
  },
};

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans selection:bg-amber-400 selection:text-slate-900">
      {children}
    </div>
  );
}

