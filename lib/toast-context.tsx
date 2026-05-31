"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  text: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, text: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((type: ToastType, text: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0 opacity-80" />,
    error: <XCircle className="w-5 h-5 shrink-0 opacity-80" />,
    info: <Info className="w-5 h-5 shrink-0 opacity-80" />,
  };

  const wrapperStyles: Record<ToastType, string> = {
    success: "bg-primary text-[#163300] shadow-[0px_8px_40px_rgba(159,232,112,0.4)]",
    error: "bg-red-500 text-white shadow-[0px_8px_40px_rgba(239,68,68,0.4)]",
    info: "bg-blue-500 text-white shadow-[0px_8px_40px_rgba(59,130,246,0.4)]",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[999999] flex items-end justify-center p-6 sm:p-10 pointer-events-none">
          <div className="relative flex flex-col items-center gap-4 pointer-events-auto w-full">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-5 px-6 py-4 rounded-[2rem] text-sm sm:text-base font-black w-max max-w-[90vw] sm:max-w-md ring-1 ring-black/5 dark:ring-white/10 ${wrapperStyles[t.type]}`}
                style={{ fontFeatureSettings: '"calt"', animation: "toastPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
              >
                {icons[t.type]}
                <span className="leading-relaxed">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toastPop {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
