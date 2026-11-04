'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  addToast: (title: string, description?: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, description?: string, type: ToastType = 'success', duration = 3500) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, description, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const toast = useCallback(
    (message: string, type: ToastType = 'success', duration = 3500) => {
      addToast(message, undefined, type, duration);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => {
          const bgClass =
            t.type === 'success'
              ? 'bg-[#24221E] text-[#F7F5F0] border-l-4 border-[#3E7B54]'
              : t.type === 'error'
              ? 'bg-[#24221E] text-[#F7F5F0] border-l-4 border-[#A63A3A]'
              : t.type === 'warning'
              ? 'bg-[#24221E] text-[#F7F5F0] border-l-4 border-[#C98A2C]'
              : 'bg-[#24221E] text-[#F7F5F0] border-l-4 border-[#B39458]';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-sm shadow-2xl flex items-start justify-between transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgClass}`}
            >
              <div className="flex items-start space-x-3">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#4E9B68] shrink-0 mt-0.5" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#E06A58] shrink-0 mt-0.5" />}
                {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-[#DFBE7F] shrink-0 mt-0.5" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-[#B39458] shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-semibold tracking-wide leading-tight">{t.title}</p>
                  {t.description && (
                    <p className="text-xs text-[#C5BFB5] mt-1 leading-relaxed font-sans">{t.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-4 text-[#A8A49C] hover:text-white transition-colors p-1"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
