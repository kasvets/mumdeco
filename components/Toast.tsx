'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, ShoppingCart } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'
    }`}>
      <div className={`max-w-sm w-full shadow-2xl rounded-2xl pointer-events-auto overflow-hidden backdrop-blur-lg ${
        type === 'success' 
          ? 'bg-white/95 border-2 border-green-200/50' 
          : 'bg-white/95 border-2 border-red-200/50'
      }`}>
        <div className="p-4">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-2 rounded-full ${
              type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {type === 'success' ? (
                <ShoppingCart className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-semibold ${
                type === 'success' ? 'text-gray-800' : 'text-red-800'
              }`}>
                {message}
              </p>
              {type === 'success' && (
                <p className="text-xs text-gray-600 mt-1">
                  Sepete başarıyla eklendi
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={onClose}
                className={`inline-flex rounded-full p-1.5 transition-all duration-200 ${
                  type === 'success' 
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                    : 'text-red-400 hover:text-red-600 hover:bg-red-100'
                }`}
              >
                <span className="sr-only">Kapat</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className={`h-1 w-full ${
          type === 'success' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <div 
            className={`h-full transition-all duration-[3000ms] ease-linear ${
              type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } ${isVisible ? 'w-0' : 'w-full'}`}
          />
        </div>
      </div>
    </div>
  );
}

// Toast context for managing multiple toasts
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error') => void;
}

import { createContext, useContext, ReactNode } from 'react';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, isVisible: true }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 