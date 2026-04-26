"use client";

import { Suspense } from "react";
import { ToastProvider } from "@/lib/toast-context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ToastProvider>{children}</ToastProvider>
    </Suspense>
  );
}
