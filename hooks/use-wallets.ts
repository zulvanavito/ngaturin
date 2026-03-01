"use client";

import { useState, useEffect, useCallback } from "react";

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  type: "cash" | "bank" | "emoney" | "credit";
  color: string;
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wallets");
      const data = await res.json();
      if (res.ok) setWallets(data);
    } catch (err) {
      console.error("useWallets error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  return { wallets, loading, refetch: fetchWallets };
}
