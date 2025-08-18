'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import "./ui.css"
interface LoaderContextProps {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  loading: boolean;
  loaderMessage: string;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');
  

  const showLoader = (message: string = '') => {
    setLoading(true);
    setLoaderMessage(message);
  };

  const hideLoader = () => {
    setLoading(false);
    setLoaderMessage('');
  };

  return (
     <LoaderContext.Provider value={{ showLoader, hideLoader, loading, loaderMessage }}>
      {children}
     </LoaderContext.Provider>
  );
};

export const useLoader = (): LoaderContextProps => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
