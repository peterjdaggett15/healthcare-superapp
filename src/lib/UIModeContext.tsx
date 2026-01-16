'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UIMode = 'chat' | 'form';

interface UIModeContextType {
  uiMode: UIMode;
  setUIMode: (mode: UIMode) => void;
}

const UIModeContext = createContext<UIModeContextType | undefined>(undefined);

export function UIModeProvider({ children }: { children: ReactNode }) {
  const [uiMode, setUIModeState] = useState<UIMode>('chat');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('uiMode');
    if (stored === 'chat' || stored === 'form') {
      setUIModeState(stored);
    }
    setIsLoaded(true);
  }, []);

  // Save preference to localStorage when it changes
  const setUIMode = (mode: UIMode) => {
    setUIModeState(mode);
    localStorage.setItem('uiMode', mode);
  };

  // Don't render children until we've loaded the preference
  if (!isLoaded) {
    return null;
  }

  return (
    <UIModeContext.Provider value={{ uiMode, setUIMode }}>
      {children}
    </UIModeContext.Provider>
  );
}

export function useUIMode() {
  const context = useContext(UIModeContext);
  if (context === undefined) {
    throw new Error('useUIMode must be used within a UIModeProvider');
  }
  return context;
}
