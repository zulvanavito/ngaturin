"use client";

import { useState, useEffect, useCallback } from "react";

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  type: "cash" | "bank" | "emoney" | "credit" | "investment" | "crypto" | "debit";
  color: string;
  balance: number;
}

export function useWallets(includeBalance: boolean = true) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const url = includeBalance ? "/api/wallets" : "/api/wallets?balance=false";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setWallets(data);
    } catch (err) {
      console.error("useWallets error:", err);
    } finally {
      setLoading(false);
    }
  }, [includeBalance]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  return { wallets, loading, refetch: fetchWallets };
}
