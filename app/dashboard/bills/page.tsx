"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useFormatCurrency } from "@/hooks/use-format-currency";
import {
  Plus,
  ChevronLeft,
  Loader2,
  CreditCard,
  TrendingDown,
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BillCard, type RecurringBill } from "@/components/bills/bill-card";
import { BillFormModal } from "@/components/bills/bill-form-modal";
import { BillPaymentModal } from "@/components/bills/bill-payment-modal";
import { BillHeatmap } from "@/components/bills/bill-heatmap";
import { BillCardSkeleton } from "@/components/layout/skeletons";
import { useToast } from "@/lib/toast-context";

interface Transaction {
  id: string;
  bill_id: string | null;
  date: string;
}

export default function BillsPage() {
  const { formatCurrency } = useFormatCurrency();
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);
  const [deletingBill, setDeletingBill] = useState<RecurringBill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const year = viewDate.getFullYear();
      const month = String(viewDate.getMonth() + 1).padStart(2, "0");
      const monthStr = `${year}-${month}`;

      const [billsRes, txRes] = await Promise.all([
        fetch("/api/recurring-bills", { cache: "no-store" }),
        fetch(`/api/transactions?type=expense&month=${monthStr}`, {
          cache: "no-store",
        }),
      ]);
      if (billsRes.ok) {
        const data = await billsRes.json();
        setBills(
          data.map((b: RecurringBill) => ({
            ...b,
            billing_cycle: b.billing_cycle || "monthly",
            plan_name: b.plan_name || null,
            is_autopay: b.is_autopay ?? false,
          })),
        );
      }
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err) {
      console.error("Failed to fetch bills data:", err);
    } finally {
      setLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Determine which bills are paid in the VIEW MONTH
  const paidBillIds = useMemo(() => {
    const targetMonth = viewDate.getMonth();
    const targetYear = viewDate.getFullYear();

    const paid = new Set<string>();
    for (const tx of transactions) {
      if (tx.bill_id && tx.date) {
        const txDate = new Date(tx.date);
        if (
          txDate.getMonth() === targetMonth &&
          txDate.getFullYear() === targetYear
        ) {
          paid.add(tx.bill_id);
        }
      }
    }
    return paid;
  }, [transactions, viewDate]);

  // Statistics
  const stats = useMemo(() => {
    const active = bills.filter((b) => b.is_active);
    const totalMonthly = active.reduce((sum, b) => sum + b.amount, 0);

    // Logic for statistics in the context of the viewed month
    const today = new Date().getDate();
    const isTodayInViewMonth =
      viewDate.getMonth() === new Date().getMonth() &&
      viewDate.getFullYear() === new Date().getFullYear();

    const overdueAmount = active
      .filter((b) => {
        const isActuallyOverdue = isTodayInViewMonth
          ? b.due_day < today
          : viewDate < new Date();
        return isActuallyOverdue && !paidBillIds.has(b.id);
      })
      .reduce((sum, b) => sum + b.amount, 0);

    const paidCount = active.filter((b) => paidBillIds.has(b.id)).length;
    return {
      activeCount: active.length,
      totalMonthly,
      overdueAmount,
      paidCount,
    };
  }, [bills, paidBillIds, viewDate]);

  // Handlers
  const handleEdit = (bill: RecurringBill) => {
    setSelectedBill(bill);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedBill(null);
    setIsFormOpen(true);
  };

  const handlePay = (bill: RecurringBill) => {
    setSelectedBill(bill);
    setIsPaymentOpen(true);
  };

  const handleToggleActive = async (bill: RecurringBill) => {
    try {
      await fetch(`/api/recurring-bills/${bill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bill, is_active: !bill.is_active }),
      });
      await fetchData();
      showToast(
        "info",
        `Tagihan "${bill.name}" ${bill.is_active ? "dinonaktifkan" : "diaktifkan"}.`,
      );
    } catch {
      showToast("error", "Gagal mengubah status tagihan.");
    }
  };

  const handleDelete = async () => {
    if (!deletingBill) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/recurring-bills/${deletingBill.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await fetchData();
      showToast("success", `Tagihan "${deletingBill.name}" berhasil dihapus.`);
    } catch {
      showToast("error", "Gagal menghapus tagihan.");
    } finally {
      setIsDeleting(false);
      setDeletingBill(null);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ITEMS_PER_GROUP = 4;

  const handleFormSuccess = () => {
    fetchData();
    showToast("success", "Tagihan berhasil disimpan!");
  };

  const handlePaymentSuccess = () => {
    fetchData();
    showToast("success", "Pembayaran berhasil dicatat! 🎉");
  };

  // Split bills into groups
  const activeBills = bills.filter((b) => b.is_active);
  const pendingBills = activeBills.filter((b) => !paidBillIds.has(b.id));
  const paidBills = activeBills.filter((b) => paidBillIds.has(b.id));
  const inactiveBills = bills.filter((b) => !b.is_active);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
        <div className="space-y-6">
          <div className="w-40 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-full h-48 bg-muted animate-pulse rounded-[3rem]"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BillCardSkeleton />
              <BillCardSkeleton />
              <BillCardSkeleton />
              <BillCardSkeleton />
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-80 bg-muted animate-pulse rounded-[2.5rem]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      {/* Modals */}
      {isFormOpen && (
        <BillFormModal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          bill={selectedBill}
        />
      )}
      {isPaymentOpen && (
        <BillPaymentModal
          open={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
          bill={selectedBill}
        />
      )}

      {/* Hero Section */}
      <div className="space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Kembali ke Dashboard
        </Link>

        {/* Billboard */}
        <div className="bg-gradient-to-br from-card via-card to-muted/20 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 border border-border/40 shadow-ring overflow-hidden relative">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-[0.03] blur-3xl pointer-events-none bg-primary" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                Komitmen Bulanan
              </p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                {formatCurrency(stats.totalMonthly)}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {stats.paidCount} dari {stats.activeCount} tagihan sudah dibayar
                bulan ini
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-primary text-primary-foreground hover:brightness-110 font-black px-8 h-14 rounded-full shadow-lg active:scale-95 transition-all text-sm"
            >
              <Plus className="w-5 h-5 mr-2" /> Tambah Tagihan
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-2xl p-4 border border-border/20">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1">
                <Bell className="w-3.5 h-3.5" /> Tagihan Aktif
              </div>
              <p className="text-2xl font-black tabular-nums">
                {stats.activeCount}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-2xl p-4 border border-border/20">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1">
                <TrendingDown className="w-3.5 h-3.5" /> Total Bulan Ini
              </div>
              <p className="text-2xl font-black tabular-nums">
                {formatCurrency(stats.totalMonthly)}
              </p>
            </div>
            <div
              className={`bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-2xl p-4 border ${stats.overdueAmount > 0 ? "border-red-500/20 bg-red-500/5" : "border-border/20"}`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-bold mb-1 ${stats.overdueAmount > 0 ? "text-red-500" : "text-muted-foreground"}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Terlambat
              </div>
              <p
                className={`text-2xl font-black tabular-nums ${stats.overdueAmount > 0 ? "text-red-500" : ""}`}
              >
                {formatCurrency(stats.overdueAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Cards + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bills List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Bills */}
          {pendingBills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Belum Dibayar
                <span className="text-xs font-bold text-muted-foreground ml-auto bg-muted/30 px-3 py-1 rounded-full">
                  {pendingBills.length} Tagihan
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingBills
                  .slice(
                    0,
                    expandedSections.has("pending")
                      ? pendingBills.length
                      : ITEMS_PER_GROUP,
                  )
                  .map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      isPaidThisMonth={false}
                      onEdit={handleEdit}
                      onDelete={setDeletingBill}
                      onPay={handlePay}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
              </div>
              {pendingBills.length > ITEMS_PER_GROUP && (
                <Button
                  variant="ghost"
                  onClick={() => toggleSection("pending")}
                  className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
                >
                  {expandedSections.has("pending") ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" /> Lihat{" "}
                      {pendingBills.length - ITEMS_PER_GROUP} Tagihan Lainnya
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Paid Bills */}
          {paidBills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span className="text-income">✓</span> Lunas
                <span className="text-xs font-bold ml-auto bg-income/10 text-income px-3 py-1 rounded-full">
                  {paidBills.length} Tagihan
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paidBills
                  .slice(
                    0,
                    expandedSections.has("paid")
                      ? paidBills.length
                      : ITEMS_PER_GROUP,
                  )
                  .map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      isPaidThisMonth={true}
                      onEdit={handleEdit}
                      onDelete={setDeletingBill}
                      onPay={handlePay}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
              </div>
              {paidBills.length > ITEMS_PER_GROUP && (
                <Button
                  variant="ghost"
                  onClick={() => toggleSection("paid")}
                  className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
                >
                  {expandedSections.has("paid") ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" /> Lihat{" "}
                      {paidBills.length - ITEMS_PER_GROUP} Tagihan Lainnya
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Inactive Bills */}
          {inactiveBills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-muted-foreground">
                Nonaktif
                <span className="text-xs font-bold ml-auto bg-muted/30 px-3 py-1 rounded-full">
                  {inactiveBills.length} Tagihan
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inactiveBills
                  .slice(
                    0,
                    expandedSections.has("inactive")
                      ? inactiveBills.length
                      : ITEMS_PER_GROUP,
                  )
                  .map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      isPaidThisMonth={paidBillIds.has(bill.id)}
                      onEdit={handleEdit}
                      onDelete={setDeletingBill}
                      onPay={handlePay}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
              </div>
              {inactiveBills.length > ITEMS_PER_GROUP && (
                <Button
                  variant="ghost"
                  onClick={() => toggleSection("inactive")}
                  className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
                >
                  {expandedSections.has("inactive") ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" /> Lihat{" "}
                      {inactiveBills.length - ITEMS_PER_GROUP} Tagihan Lainnya
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Empty state */}
          {bills.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-9 h-9 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">
                Belum Ada Tagihan
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                Mulai catat tagihan rutin Anda agar tidak ada yang terlewat.
              </p>
              <Button
                onClick={handleAdd}
                className="bg-primary text-primary-foreground hover:brightness-110 font-black px-8 h-12 rounded-full shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" /> Tambah Tagihan Pertama
              </Button>
            </div>
          )}
        </div>

        {/* Heatmap Sidebar */}
        <div className="space-y-4">
          <BillHeatmap
            bills={bills}
            paidBillIds={paidBillIds}
            onMonthChange={setViewDate}
          />
        </div>
      </div>

      {/* Tips Section (Goals-style) */}
      <div className="bg-black text-white rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group mt-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-primary" />
        </div>
        <div className="relative z-10 flex-1 space-y-1 text-center md:text-left">
          <h3 className="text-xl font-black tracking-tight">
            Tips: Apa itu Auto-pay?
          </h3>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Auto-pay adalah penanda untuk tagihan yang didebit otomatis oleh
            bank/layanan. Aplikasi Ngaturin <strong>hanya mencatat</strong>{" "}
            transaksi agar saldo tetap akurat, dan tidak melakukan penarikan
            uang asli.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingBill && (
        <Dialog
          open={!!deletingBill}
          onOpenChange={(o) => !o && setDeletingBill(null)}
        >
          <DialogContent className="sm:max-w-sm rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-center md:text-left">
                Hapus Tagihan
              </DialogTitle>
              <DialogDescription className="text-center md:text-left">
                Tagihan <strong>{deletingBill?.name}</strong> akan dihapus
                secara permanen.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={() => setDeletingBill(null)}
                disabled={isDeleting}
                className="rounded-2xl h-12 font-bold w-full sm:w-auto order-last sm:order-first"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-2xl h-12 px-8 font-black shadow-lg active:scale-95 transition-all w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Menghapus...
                  </>
                ) : (
                  "Hapus Permanen"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
