import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setLoadingHandlers, clearLoadingHandlers } from '../utils/loadingService';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [count, setCount] = useState(0);

  const startLoading = useCallback(() => setCount((c) => c + 1), []);
  const stopLoading = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  useEffect(() => {
    setLoadingHandlers({ startLoading, stopLoading });
    return () => {
      clearLoadingHandlers();
    };
  }, [startLoading, stopLoading]);

  const value = {
    isLoading: count > 0,
    startLoading,
    stopLoading,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}

export default LoadingContext;
