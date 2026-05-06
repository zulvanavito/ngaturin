"use client";

import { useState, useMemo } from "react";
import { Plus, ChevronLeft, ArrowLeftRight, Wallet as WalletIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useWallets } from "@/hooks/use-wallets";
import { WalletCard, type WalletData, type WalletTransaction } from "@/components/wallets/wallet-card";
import { WalletFormModal } from "@/components/wallets/wallet-form-modal";
import { WalletTransferModal } from "@/components/wallets/wallet-transfer-modal";
import { WalletHistoryModal } from "@/components/wallets/wallet-history-modal";
import { WalletCardSkeleton } from "@/components/layout/skeletons";
import { useToast } from "@/lib/toast-context";

export default function WalletsPage() {
  const { formatCurrency } = useFormatCurrency();
  const { wallets, loading, refetch } = useWallets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  const handleCreate = () => {
    setSelectedWallet(null);
    setIsFormOpen(true);
  };

  const handleEdit = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setIsFormOpen(true);
  };

  const handleViewHistory = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setIsHistoryOpen(true);
  };

  const handleFormSuccess = () => {
    refetch();
    showToast("success", "Dompet berhasil disimpan!");
  };

  const handleTransferSuccess = () => {
    refetch();
    showToast("success", "Transfer berhasil dilakukan!");
  };

  const handleDelete = async () => {
    if (!deleteWalletId) return;
    const walletName = wallets.find(w => w.id === deleteWalletId)?.name || "Dompet";
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/wallets/${deleteWalletId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      await refetch();
      showToast("success", `Dompet "${walletName}" berhasil dihapus.`);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal menghapus dompet.");
    } finally {
      setIsDeleting(false);
      setDeleteWalletId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
        <div className="space-y-6">
          <div className="w-40 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-64 h-12 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <WalletCardSkeleton />
          <WalletCardSkeleton />
          <WalletCardSkeleton />
          <WalletCardSkeleton />
          <WalletCardSkeleton />
          <WalletCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      {/* Modals */}
      {isFormOpen && (
        <WalletFormModal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          wallet={selectedWallet}
        />
      )}
      {isTransferOpen && (
        <WalletTransferModal
          open={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          onSuccess={handleTransferSuccess}
          wallets={wallets as WalletData[]}
        />
      )}
      {isHistoryOpen && (
        <WalletHistoryModal
          open={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          wallet={selectedWallet}
        />
      )}

      {/* Hero Section */}
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-[55px] sm:text-[72px] font-black tracking-tighter leading-[0.85] text-foreground">
              Kelola Dompet.
            </h1>
            <p className="text-lg font-bold text-muted-foreground max-w-md">
              Pantau dan kelola semua kantong keuangan Anda dari satu tempat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setIsTransferOpen(true)}
              variant="outline"
              disabled={wallets.length < 2}
              className="rounded-full font-black text-base h-14 px-8 border-2 border-border/40 hover:bg-muted/30 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeftRight className="w-5 h-5 mr-3" /> Transfer
            </Button>
            <Button
              onClick={handleCreate}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base h-14 px-8 shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-3 stroke-[3px]" /> Buat Dompet
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {wallets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-primary/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-primary/10 sm:col-span-2">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/60 mb-2">Total Likuiditas</p>
            <span className={`text-lg sm:text-xl lg:text-2xl font-black tabular-nums ${totalBalance < 0 ? "text-expense" : "text-foreground"}`}>
              {formatCurrency(totalBalance)}
            </span>
          </div>
          <div className="bg-muted/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-border/10">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Jumlah Dompet</p>
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground">
              {wallets.length}
            </span>
          </div>
        </div>
      )}

      {/* Wallet Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <WalletIcon className="w-6 h-6 text-primary" /> Daftar Dompet
          </h2>
        </div>

        {wallets.length === 0 ? (
          <div className="bg-muted/10 border-2 border-dashed border-border/40 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center space-y-6">
            <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto">
              <WalletIcon className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Belum ada dompet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Buat kantong keuangan pertama Anda untuk memulai pengelolaan dana.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              variant="outline"
              className="rounded-full h-12 px-8 font-bold border-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            >
              Buat Dompet Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {wallets.slice(0, isExpanded ? wallets.length : 6).map(wallet => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet as WalletData}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteWalletId(id)}
                  onViewHistory={handleViewHistory}
                />
              ))}
            </div>

            {wallets.length > 6 && (
              <Button 
                variant="ghost" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
              >
                {isExpanded ? (
                  <><ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-2" /> Lihat {wallets.length - 6} Dompet Lainnya</>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteWalletId && (
        <Dialog open={!!deleteWalletId} onOpenChange={() => setDeleteWalletId(null)}>
          <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Hapus Dompet</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Apakah Anda yakin ingin menghapus dompet <strong>{wallets.find(w => w.id === deleteWalletId)?.name}</strong>? Transaksi yang terhubung tidak akan ikut terhapus.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setDeleteWalletId(null)} className="rounded-2xl h-12 font-bold w-full sm:w-auto order-last sm:order-first">
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-2xl h-12 font-black w-full sm:w-auto">
                {isDeleting ? "Menghapus..." : "Hapus Dompet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
