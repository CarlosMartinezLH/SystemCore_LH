'use client';

import React from 'react';
import LanAppView from '@/components/LanAppView';
import { CoreSyncProvider } from '@/context/CoreSyncContext';

export default function LanAppStandalonePage() {
  return (
    <CoreSyncProvider>
      <LanAppView fullScreenMobile={true} />
    </CoreSyncProvider>
  );
}
