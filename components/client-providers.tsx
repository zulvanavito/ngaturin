"use client";

import { ToastProvider } from "@/lib/toast-context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
