'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RefRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sku = searchParams.get('sku') || searchParams.get('ref') || '';
    if (sku) {
      router.replace(`/tienda?sku=${encodeURIComponent(sku)}`);
    } else {
      router.replace('/tienda');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">
      Redirigiendo a producto en LanAtienda...
    </div>
  );
}

export default function RefPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">
          Cargando...
        </div>
      }
    >
      <RefRedirectContent />
    </Suspense>
  );
}
