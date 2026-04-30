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

let cachedWallets: Wallet[] | null = null;
let fetchPromise: Promise<Wallet[]> | null = null;

export function useWallets(includeBalance: boolean = true) {
  const [wallets, setWallets] = useState<Wallet[]>(cachedWallets || []);
  const [loading, setLoading] = useState(!cachedWallets);

  const fetchWallets = useCallback(async (force = false) => {
    if (cachedWallets && !force) {
      setWallets(cachedWallets);
      setLoading(false);
      return;
    }

    if (!fetchPromise || force) {
      const url = includeBalance ? "/api/wallets" : "/api/wallets?balance=false";
      fetchPromise = fetch(url).then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat dompet");
        const data = await res.json();
        cachedWallets = data;
        return data;
      });
    }

    try {
      setLoading(!cachedWallets);
      const data = await fetchPromise;
      setWallets(data);
    } catch (err) {
      console.error("useWallets error:", err);
      cachedWallets = null; // Reset on error
      fetchPromise = null;
    } finally {
      setLoading(false);
    }
  }, [includeBalance]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  return { wallets, loading, refetch: () => fetchWallets(true) };
}
