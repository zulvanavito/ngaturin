"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { 
  Plus, Pencil, Trash2, Loader2, ChevronLeft, TrendingUp, TrendingDown, 
  Briefcase, LineChart, Building, Coins, Wallet, Box
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { FeatureTip } from "@/components/feature-tip";

interface Investment {
  id: string;
  name: string;
  type: "saham" | "reksadana" | "kripto" | "emas" | "deposito" | "lainnya";
  symbol: string | null;
  amount: number;
  total_invested: number;
  current_value: number;
  created_at: string;
}

const TYPE_CONFIG = {
  saham: { icon: LineChart, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", fill: "#3b82f6" },
  reksadana: { icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", fill: "#10b981" },
  kripto: { icon: Coins, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", fill: "#f97316" },
  emas: { icon: Box, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", fill: "#eab308" },
  deposito: { icon: Building, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", fill: "#a855f7" },
  lainnya: { icon: Wallet, color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", fill: "#6b7280" },
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Investment | null>(null);
  const [deletingItem, setDeletingItem] = useState<Investment | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<Investment["type"]>("reksadana");
  const [formSymbol, setFormSymbol] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formTotalInvested, setFormTotalInvested] = useState("");
  const [formCurrentValue, setFormCurrentValue] = useState("");

  const fetchInvestments = useCallback(async () => {
    try {
      const res = await fetch("/api/investments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const parsedData = data.map((item: any) => ({
          ...item,
          total_invested: Number(item.total_invested || 0),
          current_value: Number(item.current_value || 0),
        }));
        setInvestments(parsedData);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvestments(); }, [fetchInvestments]);

  // Aggregate stats
  const totalInvested = useMemo(() => investments.reduce((sum, item) => sum + item.total_invested, 0), [investments]);
  const currentTotal = useMemo(() => investments.reduce((sum, item) => sum + item.current_value, 0), [investments]);
  const totalProfit = currentTotal - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const isProfit = totalProfit >= 0;

  // Chart data
  const chartData = useMemo(() => {
    const grouped = investments.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.current_value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .filter(([_, val]) => val > 0)
      .map(([type, val]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: val,
        color: TYPE_CONFIG[type as keyof typeof TYPE_CONFIG].fill
      }))
      .sort((a, b) => b.value - a.value);
  }, [investments]);

  const openAdd = () => {
    setEditingItem(null);
    setFormName(""); setFormType("reksadana"); setFormSymbol(""); 
    setFormAmount(""); setFormTotalInvested(""); setFormCurrentValue("");
    setIsFormOpen(true);
  };

  const openEdit = (item: Investment) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormType(item.type);
    setFormSymbol(item.symbol || "");
    setFormAmount(item.amount ? String(item.amount) : "");
    setFormTotalInvested(String(item.total_invested));
    setFormCurrentValue(String(item.current_value));
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingItem ? `/api/investments/${editingItem.id}` : "/api/investments";
      const method = editingItem ? "PUT" : "POST";
      const body = {
        name: formName, type: formType, symbol: formSymbol || null,
        amount: Number(formAmount || 0),
        total_invested: Number(formTotalInvested),
        current_value: Number(formCurrentValue)
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchInvestments();
      setIsFormOpen(false);
      showToast("success", editingItem ? "Investasi diperbarui!" : "Investasi ditambahkan!");
    } catch (err: any) {
      showToast("error", err.message || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/investments/${deletingItem.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchInvestments();
      setDeletingItem(null);
      showToast("success", "Aset berhasil dihapus.");
    } catch {
      showToast("error", "Gagal menghapus aset.");
    } finally { setIsDeleting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portofolio Investasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Pantau performa dan alokasi aset Anda.</p>
        </div>
        <Button onClick={openAdd} className="bg-brand-naval hover:bg-blue-900 text-white gap-2 h-11 rounded-xl shadow-md shrink-0">
          <Plus className="w-4 h-4" /> Tambah Aset
        </Button>
      </div>

      <FeatureTip
        id="investments"
        title="💡 Tips: Portofolio Investasi"
        tips={[
          "Isi \"Nilai Pasar Saat Ini\" secara berkala (misalnya mingguan) untuk memperbarui profit/loss portofoliomu.",
          "Modal Ditanam adalah total uang yang sudah kamu setor; Nilai Saat Ini adalah harga pasar terkini.",
          "Grafik alokasi aset di atas membantu melihat seberapa terdiversifikasi portofoliomu antar jenis instrumen.",
          "Gunakan kolom Simbol (BBCA, BTC, dll.) untuk memudahkan identifikasi aset saat portofolio mulai banyak.",
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] overflow-hidden md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Nilai Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(currentTotal)}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Modal: {formatCurrency(totalInvested)}</span>
            </div>
            
            {/* Profit/Loss Badge */}
            <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
              totalProfit === 0 ? "bg-muted text-muted-foreground" :
              isProfit ? "bg-success/10 text-success" : "bg-expense/10 text-expense"
            }`}>
              {totalProfit === 0 ? null : isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isProfit ? "+" : ""}{formatCurrency(totalProfit)}</span>
              <span className="opacity-70 text-xs">({profitPercentage > 0 ? "+" : ""}{profitPercentage.toFixed(2)}%)</span>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Chart */}
        <Card className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] overflow-hidden md:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Alokasi Aset
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-0 h-[180px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => {
                      const percentage = ((val / currentTotal) * 100).toFixed(1);
                      return [`${formatCurrency(val)} (${percentage}%)`, "Nilai"];
                    }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">Belum ada data alokasi.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <h2 className="text-lg font-bold mt-8 mb-4">Daftar Aset</h2>
      
      {loading ? (
        <div className="flex justify-center py-10 text-muted-foreground gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Memuat...</div>
      ) : investments.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-border/50 bg-white/50 dark:bg-card/50 p-12 text-center text-muted-foreground text-sm shadow-sm">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>Belum ada portofolio investasi. Catat aset pertama Anda!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {investments.map((item) => {
            const config = TYPE_CONFIG[item.type];
            const Icon = config.icon;
            const profit = item.current_value - item.total_invested;
            const pct = item.total_invested > 0 ? (profit / item.total_invested) * 100 : 0;
            const isItemProfit = profit >= 0;

            return (
              <Card key={item.id} className="border border-border/40 rounded-[2rem] overflow-hidden hover:shadow-md transition-all bg-white dark:bg-card shadow-sm">
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-tight flex items-center gap-2">
                          {item.name}
                          {item.symbol && <Badge variant="secondary" className="text-[10px] px-1 h-4">{item.symbol}</Badge>}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 -mr-2 -mt-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeletingItem(item)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-y-3 gap-x-4 bg-muted/20 -mx-4 -mb-4 p-4 border-t border-border/30">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5 uppercase font-medium tracking-wider">Modal Ditanam</p>
                      <p className="text-xs font-semibold">{formatCurrency(item.total_invested)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5 uppercase font-medium tracking-wider">Nilai Saat Ini</p>
                      <p className="text-xs font-semibold">{formatCurrency(item.current_value)}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-xs text-muted-foreground">Return (Keuntungan)</span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${
                        profit === 0 ? "text-muted-foreground" :
                        isItemProfit ? "text-success" : "text-expense"
                      }`}>
                        {isItemProfit ? "+" : ""}{formatCurrency(profit)} ({isItemProfit ? "+" : ""}{pct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o) => { if (!o) setIsFormOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Update Portofolio" : "Tambah Investasi Baru"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Perbarui nilai aset investasi Anda saat ini." : "Catat portofolio investasi Anda, modal, dan nilai saat ini."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Jenis Instrumen</Label>
                <Select value={formType} onValueChange={(v: any) => setFormType(v)}>
                  <SelectTrigger className="h-10 text-capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reksadana">🏢 Reksa Dana</SelectItem>
                    <SelectItem value="saham">📈 Saham</SelectItem>
                    <SelectItem value="kripto">🪙 Kripto</SelectItem>
                    <SelectItem value="emas">✨ Emas</SelectItem>
                    <SelectItem value="deposito">🏦 Deposito</SelectItem>
                    <SelectItem value="lainnya">📦 Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Nama Aset</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Contoh: BBCA" required className="h-10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Simbol/Kode (Opsional)</Label>
                <Input value={formSymbol} onChange={e => setFormSymbol(e.target.value)} placeholder="Misal: BTC, BBCA" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Jumlah Unit (Opsional)</Label>
                <Input value={formAmount} onChange={e => setFormAmount(e.target.value)} type="number" step="any" placeholder="Misal: 100" className="h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total Modal Diinvestasikan (Rp)</Label>
              <Input
                value={formTotalInvested}
                onChange={e => setFormTotalInvested(e.target.value)}
                type="number" min="0" required
                placeholder="Total uang yang Anda setor"
                className="h-10 font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nilai Pasar Saat Ini (Rp)</Label>
              <Input
                value={formCurrentValue}
                onChange={e => setFormCurrentValue(e.target.value)}
                type="number" min="0" required
                placeholder="Harga/Nilai total saat ini"
                className="h-10 font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Anda bisa mengubah nilai ini nanti saat harga aset naik/turun untuk melihat profit.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" className="bg-brand-naval hover:bg-blue-900 text-white rounded-xl shadow-md" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? "Simpan Perubahan" : "Tambah Portofolio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={(o) => { if (!o) setDeletingItem(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Investasi?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data portofolio <strong>{deletingItem?.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus Aset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
