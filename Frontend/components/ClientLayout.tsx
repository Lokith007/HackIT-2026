'use client';

import { useState, useCallback } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);

  const onLoadComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  return (
    <>
      {showLoader && <LoadingScreen onComplete={onLoadComplete} minDuration={2200} />}
      {children}
    </>
  );
}
