import type React from 'react';
import { createContext, useState } from 'react';
import { Toast } from './Toast';

const MAX_TOASTS = 5;

export interface ToastItem {
  id: string;
  message: string;
}

export interface ToastContextType {
  addToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string) => {
    setToasts(prevToasts => {
      const newToasts = [...prevToasts, { id: crypto.randomUUID(), message }];
      return newToasts.slice(-MAX_TOASTS);
    });
  };

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-0 right-0 m-4 space-y-4">
        {toasts.map(toast => (
          <Toast key={toast.id} id={toast.id} message={toast.message} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
