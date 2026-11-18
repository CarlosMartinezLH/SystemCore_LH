'use client';

import React, { useState } from 'react';
import MobileAdvisorApp from '@/components/MobileAdvisorApp';
import { CoreSyncProvider } from '@/context/CoreSyncContext';
import { INITIAL_PROSPECTS } from '@/lib/data/initialData';
import { Prospect } from '@/types/crm';
import { UserSession } from '@/types/auth';

const DEFAULT_ADVISOR_USER: UserSession = {
  id: 'usr-asesor-01',
  name: 'Adrian Garcia Lopez',
  email: 'agarcia@lanahora.com',
  role: 'ASESOR_CAMPO',
  roleLabel: 'Asesor de Crédito en Ruta',
  branch: 'SALTILLO',
  branchScope: 'BRANCH',
  avatarInitials: 'AG',
};

function AsesoresContent() {
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);

  const handleAddNewProspect = (newLead: Prospect) => {
    setProspects((prev) => [newLead, ...prev]);
  };

  const handleLogout = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center">
      <MobileAdvisorApp
        user={DEFAULT_ADVISOR_USER}
        prospects={prospects}
        onAddNewProspect={handleAddNewProspect}
        onLogout={handleLogout}
        onSwitchToDesktop={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}

export default function AsesoresStandalonePage() {
  return (
    <CoreSyncProvider>
      <AsesoresContent />
    </CoreSyncProvider>
  );
}
