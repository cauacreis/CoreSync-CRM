import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove the toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Container de Toasts Brutalistas */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              animate-brutal-toast
              pointer-events-auto
              flex items-center justify-between
              border-4 border-zinc-950 dark:border-zinc-100
              p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]
              ${toast.type === 'success' ? 'bg-lime-400 text-zinc-950' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white dark:border-zinc-950 dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-400 text-zinc-950' : ''}
            `}
            style={{
               // Force dark mode error toasts to still use black borders/shadows for high contrast, unless specified otherwise.
               // Actually we will use CSS classes above.
            }}
          >
            <span className="font-black uppercase tracking-tight text-xl">
              {toast.message}
            </span>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-8 border-2 border-transparent hover:border-current active:translate-y-1 p-1"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
