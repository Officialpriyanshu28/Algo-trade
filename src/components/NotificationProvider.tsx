import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex gap-3 relative overflow-hidden ${
                n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                n.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}>
                <div className="mt-0.5">
                  {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {n.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {n.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{n.title}</h4>
                  <p className="text-xs opacity-80 leading-relaxed">{n.message}</p>
                </div>
                <button 
                  onClick={() => remove(n.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors h-fit"
                >
                  <X className="w-4 h-4" />
                </button>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-0.5 ${
                    n.type === 'success' ? 'bg-green-500/50' :
                    n.type === 'error' ? 'bg-red-500/50' :
                    n.type === 'warning' ? 'bg-yellow-500/50' :
                    'bg-cyan-500/50'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
