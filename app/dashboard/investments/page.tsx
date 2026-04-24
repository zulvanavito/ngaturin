"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Treemap,
} from "recharts";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Briefcase,
  LineChart,
  Building,
  Coins,
  Wallet,
  Box,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Trophy,
  AlertCircle,
  Lightbulb,
  PieChart as PieChartIcon,
  MoreVertical,
  Info,
  RefreshCw,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { AssetDetails } from "@/components/investments/asset-details";
import { InvestmentCardSkeleton, InvestmentChartSkeleton } from "@/components/skeletons";

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
  saham: {
    icon: LineChart,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    fill: "#3b82f6",
  },
  reksadana: {
    icon: Briefcase,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    fill: "#10b981",
  },
  kripto: {
    icon: Coins,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    fill: "#f97316",
  },
  emas: {
    icon: Box,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    fill: "#eab308",
  },
  deposito: {
    icon: Building,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    fill: "#a855f7",
  },
  lainnya: {
    icon: Wallet,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    fill: "#6b7280",
  },
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Investment | null>(null);
  const [deletingItem, setDeletingItem] = useState<Investment | null>(null);
  const [viewingItem, setViewingItem] = useState<Investment | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<"profit" | "value" | "name">("value");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [historyData, setHistoryData] = useState<{ date: string; value: number; invested: number }[]>([]);
  const [chartType, setChartType] = useState<"pie" | "treemap">("treemap");
  const [targetAllocations] = useState<Record<string, number>>({
    saham: 40,
    reksadana: 30,
    kripto: 10,
    emas: 10,
    deposito: 5,
    lainnya: 5
  });
  const { showToast } = useToast();

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<Investment["type"]>("reksadana");
  const [formSymbol, setFormSymbol] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formTotalInvested, setFormTotalInvested] = useState("");
  const [formCurrentValue, setFormCurrentValue] = useState("");

  const fetchInvestments = useCallback(async () => {
    try {
      const [res, historyRes] = await Promise.all([
        fetch("/api/investments", { cache: "no-store" }),
        fetch("/api/investments/history", { cache: "no-store" })
      ]);

      if (res.ok) {
        const data = await res.json();
        const parsedData = data.map((item: Record<string, unknown>) => ({
          ...item,
          total_invested: Number(item.total_invested || 0),
          current_value: Number(item.current_value || 0),
        }));
        setInvestments(parsedData);
      }

      if (historyRes.ok) {
        const histData = await historyRes.json();
        setHistoryData(histData);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const totalInvested = useMemo(
    () => investments.reduce((sum, item) => sum + item.total_invested, 0),
    [investments],
  );
  const currentTotal = useMemo(
    () => investments.reduce((sum, item) => sum + item.current_value, 0),
    [investments],
  );
  const totalProfit = currentTotal - totalInvested;
  const profitPercentage =
    totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const isProfit = totalProfit >= 0;

  // Enhance data with profit calculations for sorting and insights
  const enrichedInvestments = useMemo(() => {
    return investments.map((item) => {
      const profit = item.current_value - item.total_invested;
      const profitPct =
        item.total_invested > 0 ? (profit / item.total_invested) * 100 : 0;
      return { ...item, profit, profitPct };
    });
  }, [investments]);

  // Sorting
  const sortedInvestments = useMemo(() => {
    return [...enrichedInvestments].sort((a, b) => {
      if (sortBy === "profit") return b.profitPct - a.profitPct;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.current_value - a.current_value; // default to value
    });
  }, [enrichedInvestments, sortBy]);

  const LIMIT = 6;
  const displayedInvestments = sortedInvestments.slice(
    0,
    isExpanded ? sortedInvestments.length : LIMIT,
  );

  // Top Gainer and Loser
  const { topGainer, topLoser } = useMemo(() => {
    if (enrichedInvestments.length === 0)
      return { topGainer: null, topLoser: null };
    const sortedByProfit = [...enrichedInvestments].sort(
      (a, b) => b.profitPct - a.profitPct,
    );
    const gainer = sortedByProfit[0].profitPct > 0 ? sortedByProfit[0] : null;
    const loser =
      sortedByProfit[sortedByProfit.length - 1].profitPct < 0
        ? sortedByProfit[sortedByProfit.length - 1]
        : null;
    return { topGainer: gainer, topLoser: loser };
  }, [enrichedInvestments]);

  // Chart data
  const chartData = useMemo(() => {
    const grouped = investments.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.current_value;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .filter(([, val]) => val > 0)
      .map(([type, val]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: val,
        color: TYPE_CONFIG[type as keyof typeof TYPE_CONFIG].fill,
        rawType: type,
      }))
      .sort((a, b) => b.value - a.value);
  }, [investments]);

  // Enhanced chart data for Treemap (includes PnL color)
  const treemapData = useMemo(() => {
    return enrichedInvestments.map(item => ({
      name: item.name,
      value: item.current_value,
      profitPct: item.profitPct,
      type: item.type
    })).sort((a, b) => b.value - a.value);
  }, [enrichedInvestments]);

  const CustomizedTreemapContent = (props: {
    depth?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    name?: string;
    profitPct?: number;
  }) => {
    const { depth = 0, x = 0, y = 0, width = 0, height = 0, name, profitPct } = props;
    
    // Color scale: Red for loss, Grey for neutral, Green for profit
    let fill = "#868685"; // Default grey
    if (profitPct !== undefined) {
      if (profitPct > 2) fill = "#054d28"; // Dark green
      if (profitPct > 10) fill = "#9fe870"; // Bright Wise green
      if (profitPct < -2) fill = "#d03238"; // Alert red
    }
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke="#fff"
          strokeWidth={2 / (depth + 1)}
          strokeOpacity={1 / (depth + 1)}
        />
        {width > 50 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2 - 4}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
            className="select-none"
          >
            {name}
          </text>
        )}
        {width > 50 && height > 45 && profitPct !== undefined && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
            fontWeight="bold"
            className="opacity-80 select-none"
          >
            {profitPct > 0 ? '+' : ''}{Number(profitPct).toFixed(1)}%
          </text>
        )}
      </g>
    );
  };

  // Diversification Insights
  const portfolioInsight = useMemo(() => {
    if (chartData.length === 0) return "Belum ada data untuk dianalisis.";
    const topAsset = chartData[0];
    const topAssetPct = (topAsset.value / currentTotal) * 100;

    if (topAssetPct > 70) {
      return `Portofolio Anda sangat terkonsentrasi pada ${topAsset.name} (${topAssetPct.toFixed(1)}%). Pertimbangkan diversifikasi untuk mengurangi risiko.`;
    }
    if (chartData.length >= 3 && topAssetPct <= 50) {
      return "Diversifikasi portofolio Anda sangat baik dan sehat. Teruskan kedisiplinan ini!";
    }
    return "Portofolio Anda mulai terdistribusi. Terus pantau komposisi aset Anda.";
  }, [chartData, currentTotal]);

  // Rebalancing Logic
  const rebalancingData = useMemo(() => {
    return Object.entries(targetAllocations).map(([type, targetPct]) => {
      const actualVal = chartData.find(c => c.rawType === type)?.value || 0;
      const actualPct = currentTotal > 0 ? (actualVal / currentTotal) * 100 : 0;
      const diff = actualPct - targetPct;
      const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
      
      return {
        type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        actualPct,
        targetPct,
        diff,
        color: config.color,
        bg: config.bg,
        icon: config.icon
      };
    }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [chartData, currentTotal, targetAllocations]);

  const openAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormType("reksadana");
    setFormSymbol("");
    setFormAmount("");
    setFormTotalInvested("");
    setFormCurrentValue("");
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
      const url = editingItem
        ? `/api/investments/${editingItem.id}`
        : "/api/investments";
      const method = editingItem ? "PUT" : "POST";
      const body = {
        name: formName,
        type: formType,
        symbol: formSymbol || null,
        amount: Number(formAmount || 0),
        total_invested: Number(formTotalInvested),
        current_value: Number(formCurrentValue),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchInvestments();
      setIsFormOpen(false);
      showToast(
        "success",
        editingItem ? "Investasi diperbarui!" : "Investasi ditambahkan!",
      );
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/investments/${deletingItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await fetchInvestments();
      setDeletingItem(null);
      showToast("success", "Aset berhasil dihapus.");
    } catch {
      showToast("error", "Gagal menghapus aset.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/investments/sync", { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal sinkronisasi");
      }
      const data = await res.json();
      await fetchInvestments();
      showToast("success", data.message || "Harga berhasil disinkronkan");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Kesalahan server");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length <= 1) throw new Error("File CSV kosong atau tidak valid");

      const parsed = lines.slice(1).map(line => {
        const parts = line.split(',');
        return {
          name: parts[0]?.trim() || "Unknown",
          type: parts[1]?.trim().toLowerCase() || "lainnya",
          symbol: parts[2]?.trim() || "",
          amount: Number(parts[3] || 0),
          total_invested: Number(parts[4] || 0),
          current_value: Number(parts[5] || 0)
        };
      }).filter(p => !isNaN(p.total_invested));

      const res = await fetch("/api/investments/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investments: parsed })
      });

      if (!res.ok) throw new Error("Gagal mengimpor data");
      
      showToast("success", `${parsed.length} aset berhasil diimpor`);
      setIsImportOpen(false);
      await fetchInvestments();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal memproses file CSV");
    } finally {
      setImporting(false);
    }
    // reset input
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
        <div className="space-y-6">
          <div className="w-40 h-4 bg-muted animate-pulse rounded"></div>
          <div className="w-full h-64 bg-muted animate-pulse rounded-[3rem]"></div>
        </div>
        <InvestmentChartSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="md:col-span-1 space-y-4">
            <div className="w-full h-[420px] bg-muted animate-pulse rounded-[2.5rem]"></div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InvestmentCardSkeleton />
              <InvestmentCardSkeleton />
              <InvestmentCardSkeleton />
              <InvestmentCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      {/* Header Navigation */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
        Kembali ke Dashboard
      </Link>

      {/* Epic Billboard Hub */}
      <div className="bg-gradient-to-br from-card via-card to-muted/20 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 border border-border/40 shadow-ring overflow-hidden relative">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-[0.03] blur-3xl pointer-events-none bg-primary" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Total Nilai Portofolio
            </p>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none tabular-nums text-foreground">
              {formatCurrency(currentTotal)}
            </h1>

            <div className="flex items-center gap-3 pt-2">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
                  totalProfit === 0
                    ? "bg-muted text-muted-foreground"
                    : isProfit
                      ? "bg-success/10 text-success"
                      : "bg-expense/10 text-expense"
                }`}
              >
                {totalProfit === 0 ? null : isProfit ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {isProfit ? "+" : ""}
                  {formatCurrency(totalProfit)}
                </span>
                <span className="opacity-70 text-xs">
                  ({profitPercentage > 0 ? "+" : ""}
                  {profitPercentage.toFixed(2)}%)
                </span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                Modal Ditanam: {formatCurrency(totalInvested)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap justify-end">
            <Button
              onClick={() => setIsImportOpen(true)}
              variant="outline"
              className="w-full sm:w-auto h-14 rounded-full font-bold px-6 shadow-sm hover:bg-muted/50 transition-all text-foreground border-border/40 order-3 sm:order-1"
            >
              <Upload className="w-5 h-5 mr-2 text-muted-foreground" /> Import CSV
            </Button>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              className="w-full sm:w-auto h-14 rounded-full font-bold px-6 shadow-sm hover:bg-muted/50 transition-all text-foreground border-border/40 order-2 sm:order-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-primary" />
                  Menyinkronkan...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 text-primary" /> Sync Harga
                </>
              )}
            </Button>
            <Button
              onClick={openAdd}
              className="bg-primary text-primary-foreground hover:brightness-110 font-black px-8 h-14 rounded-full shadow-lg active:scale-95 transition-all w-full sm:w-auto text-sm shrink-0 order-1 sm:order-3"
            >
              <Plus className="w-5 h-5 mr-2" /> Tambah Aset
            </Button>
          </div>
        </div>

        {/* Spotlight Row (Gainer / Loser) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 pt-8 border-t border-border/20">
          <div className="bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-success/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-success">
                <Trophy className="w-4 h-4" /> Top Gainer
              </div>
              {topGainer && <TrendingUp className="w-4 h-4 text-success" />}
            </div>
            {topGainer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-foreground">
                  {TYPE_CONFIG[topGainer.type].icon && (
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${TYPE_CONFIG[topGainer.type].bg}`}
                    >
                      {(() => {
                        const Icon = TYPE_CONFIG[topGainer.type].icon;
                        return (
                          <Icon
                            className={`w-4 h-4 ${TYPE_CONFIG[topGainer.type].color}`}
                          />
                        );
                      })()}
                    </div>
                  )}
                  <span className="truncate max-w-[120px]">
                    {topGainer.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-black text-success tabular-nums">
                    +{topGainer.profitPct.toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    +{formatCurrency(topGainer.profit)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-semibold">
                Belum ada aset profit.
              </p>
            )}
          </div>

          <div className="bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-expense/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-expense">
                <AlertCircle className="w-4 h-4" /> Perlu Perhatian
              </div>
              {topLoser && <TrendingDown className="w-4 h-4 text-expense" />}
            </div>
            {topLoser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-foreground">
                  {TYPE_CONFIG[topLoser.type].icon && (
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${TYPE_CONFIG[topLoser.type].bg}`}
                    >
                      {(() => {
                        const Icon = TYPE_CONFIG[topLoser.type].icon;
                        return (
                          <Icon
                            className={`w-4 h-4 ${TYPE_CONFIG[topLoser.type].color}`}
                          />
                        );
                      })()}
                    </div>
                  )}
                  <span className="truncate max-w-[120px]">
                    {topLoser.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-black text-expense tabular-nums">
                    {topLoser.profitPct.toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    {formatCurrency(topLoser.profit)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-semibold">
                Tidak ada aset merugi.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart Section */}
      <div className="bg-card border border-border/40 rounded-[2.5rem] p-6 sm:p-8 shadow-ring">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary" /> Performa Portofolio
          </h2>
        </div>
        <div className="h-[300px] w-full">
          {historyData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9fe870" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9fe870" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8ebe6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8ebe6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  hide
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(value: number | string | undefined, name: string | undefined) => [
                    formatCurrency(Number(value || 0)),
                    name === "value" ? "Nilai Saat Ini" : "Modal Ditanam"
                  ]}
                  labelFormatter={(label) => new Date(label as string).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  contentStyle={{
                    borderRadius: "1.5rem",
                    border: "1px solid rgba(0,0,0,0.1)",
                    padding: "16px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)"
                  }}
                  itemStyle={{ padding: "4px 0" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  stroke="#868685" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorInvested)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#9fe870" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 6, fill: "#163300", stroke: "#9fe870", strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-[1.5rem] border border-dashed border-border/40">
              <TrendingUp className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm font-semibold">Membutuhkan setidaknya 2 hari data untuk menampilkan grafik.</p>
              <p className="text-xs mt-1 opacity-70">Coba lakukan perubahan nilai aset atau Sync Harga besok.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Allocation Chart & Insights */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border border-border/40 rounded-[2.5rem] p-6 shadow-ring flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                {chartType === "pie" ? <PieChartIcon className="w-4 h-4" /> : <Box className="w-4 h-4" />} 
                {chartType === "pie" ? "Alokasi Aset" : "Peta Performa"}
              </h3>
              <div className="flex bg-muted/30 p-1 rounded-full border border-border/20">
                <button 
                  onClick={() => setChartType("pie")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter transition-all ${chartType === "pie" ? "bg-white dark:bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  PIE
                </button>
                <button 
                  onClick={() => setChartType("treemap")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter transition-all ${chartType === "treemap" ? "bg-white dark:bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  MAP
                </button>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 w-full relative">
              {chartData.length > 0 ? (
                chartType === "pie" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          const v = Number(value ?? 0);
                          const percentage = ((v / currentTotal) * 100).toFixed(
                            1,
                          );
                          return [
                            `${formatCurrency(v)} (${percentage}%)`,
                            "Nilai",
                          ];
                        }}
                        contentStyle={{
                          borderRadius: "1.5rem",
                          border: "1px solid rgba(0,0,0,0.1)",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        wrapperStyle={{
                          fontSize: "11px",
                          fontWeight: 600,
                          paddingTop: "10px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={treemapData}
                      dataKey="value"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      fill="#8884d8"
                      content={<CustomizedTreemapContent />}
                    >
                      <Tooltip 
                        formatter={(value, name, props) => [
                          formatCurrency(Number(value)),
                          `${name} (${props.payload.profitPct.toFixed(2)}%)`
                        ]}
                        contentStyle={{
                          borderRadius: "1.5rem",
                          border: "1px solid rgba(0,0,0,0.1)",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-muted-foreground">
                  Belum ada data.
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-3">
              <Lightbulb className="w-4 h-4" /> Insight Portofolio
            </div>
            <p className="text-sm font-semibold text-foreground/80 leading-relaxed">
              {portfolioInsight}
            </p>
          </div>

          <div className="bg-card border border-border/40 rounded-[2.5rem] p-6 shadow-ring">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 mb-6 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-primary" /> Strategi Rebalancing
            </h3>
            <div className="space-y-4">
              {rebalancingData.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.bg}`}>
                        <item.icon className={`w-3 h-3 ${item.color}`} />
                      </div>
                      <span className="text-xs font-bold text-foreground">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Deviasi: </span>
                      <span className={`text-xs font-black tabular-nums ${Math.abs(item.diff) < 5 ? 'text-success' : 'text-expense'}`}>
                        {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${item.actualPct}%` } as React.CSSProperties}
                    />
                    <div 
                      className="h-full border-l-2 border-white dark:border-card opacity-30" 
                      style={{ 
                        width: '2px', 
                        marginLeft: `calc(${item.targetPct}% - ${item.actualPct}%)` 
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Aktual: {item.actualPct.toFixed(1)}%</span>
                    <span>Target: {item.targetPct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-border/20">
              <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                <Info className="w-3 h-3 inline mr-1 -mt-0.5" /> 
                Gunakan strategi ini untuk menyeimbangkan kembali risiko portofolio Anda sesuai profil target.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Asset Management List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                Daftar Aset
                <span className="text-xs font-bold text-muted-foreground ml-2 bg-muted/30 px-3 py-1 rounded-full">
                  {investments.length} total
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Urutkan:
              </span>
              <Select
                value={sortBy}
                onValueChange={(val: string) => setSortBy(val as "profit" | "value" | "name")}
              >
                <SelectTrigger className="h-9 w-[130px] rounded-full border-border/40 font-bold text-xs bg-card hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" /> <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  <SelectItem
                    value="value"
                    className="rounded-xl cursor-pointer text-xs font-semibold"
                  >
                    Total Nilai
                  </SelectItem>
                  <SelectItem
                    value="profit"
                    className="rounded-xl cursor-pointer text-xs font-semibold"
                  >
                    Margin (%)
                  </SelectItem>
                  <SelectItem
                    value="name"
                    className="rounded-xl cursor-pointer text-xs font-semibold"
                  >
                    A - Z
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {investments.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border/50 bg-white/50 dark:bg-card/50 p-12 text-center text-muted-foreground text-sm shadow-sm">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Belum ada portofolio investasi. Catat aset pertama Anda!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedInvestments.map((item) => {
                const config = TYPE_CONFIG[item.type];
                const Icon = config.icon;
                const profit = item.current_value - item.total_invested;
                const pct =
                  item.total_invested > 0
                    ? (profit / item.total_invested) * 100
                    : 0;
                const isItemProfit = profit >= 0;

                return (
                  <div
                    key={item.id}
                    className="group relative bg-white dark:bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 shadow-ring transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] sm:rounded-t-[2.5rem] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}
                          >
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm leading-snug line-clamp-1 text-foreground">
                              {item.name}
                            </h3>
                            {item.symbol && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-4 mt-1"
                              >
                                {item.symbol}
                              </Badge>
                            )}
                            <p className="text-xs text-muted-foreground capitalize mt-0.5">{item.type}</p>
                          </div>
                        </div>

                        <div className="shrink-0 -mr-2 -mt-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-muted/50 transition-colors relative z-10 shrink-0"
                              >
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-2xl border-border/40 shadow-xl p-2 w-48"
                            >
                              <DropdownMenuItem
                                onClick={() => setViewingItem(item)}
                                className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
                              >
                                <Info className="w-4 h-4 text-primary" /> Lihat
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(item)}
                                className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-muted/50"
                              >
                                <Pencil className="w-4 h-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingItem(item)}
                                className="rounded-xl flex items-center gap-2 px-3 py-2 text-sm font-semibold text-expense cursor-pointer hover:bg-expense/10"
                              >
                                <Trash2 className="w-4 h-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-y-3 gap-x-4 bg-muted/20 -mx-4 -mb-4 p-4 border-t border-border/30">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5 uppercase font-medium tracking-wider">
                            Modal Ditanam
                          </p>
                          <p className="text-xs font-semibold">
                            {formatCurrency(item.total_invested)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5 uppercase font-medium tracking-wider">
                            Nilai Saat Ini
                          </p>
                          <p className="text-xs font-semibold">
                            {formatCurrency(item.current_value)}
                          </p>
                        </div>
                        <div className="col-span-2 flex items-center justify-between pt-2 border-t border-border/40">
                          <span className="text-xs text-muted-foreground">
                            Return (Keuntungan)
                          </span>
                          <span
                            className={`text-xs font-bold flex items-center gap-1 ${
                              profit === 0
                                ? "text-muted-foreground"
                                : isItemProfit
                                  ? "text-success"
                                  : "text-expense"
                            }`}
                          >
                            {isItemProfit ? "+" : ""}
                            {formatCurrency(profit)} ({isItemProfit ? "+" : ""}
                            {pct.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show More Button */}
          {sortedInvestments.length > LIMIT && (
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full h-12 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-sm mt-4"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" /> Lihat{" "}
                  {sortedInvestments.length - LIMIT} Aset Lainnya
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(o) => {
          if (!o) setIsFormOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-center md:text-left">
              {editingItem ? "Update Portofolio" : "Tambah Investasi Baru"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-center md:text-left mt-2">
              {editingItem
                ? "Perbarui nilai aset investasi Anda saat ini."
                : "Catat portofolio investasi Anda, modal, dan nilai saat ini."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">
                  Jenis Instrumen
                </Label>
                <Select
                  value={formType}
                  onValueChange={(v: string) => setFormType(v as Investment["type"])}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-border/40 font-semibold text-capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40">
                    <SelectItem
                      value="reksadana"
                      className="rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <Briefcase className="w-4 h-4 text-emerald-500" /> Reksa
                        Dana
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="saham"
                      className="rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <LineChart className="w-4 h-4 text-blue-500" /> Saham
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="kripto"
                      className="rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <Coins className="w-4 h-4 text-orange-500" /> Kripto
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="emas"
                      className="rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <Box className="w-4 h-4 text-yellow-500" /> Emas
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="deposito"
                      className="rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <Building className="w-4 h-4 text-purple-500" />{" "}
                        Deposito
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="lainnya"
                      className="rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <Wallet className="w-4 h-4 text-gray-500" /> Lainnya
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">
                  Nama Aset
                </Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: BBCA"
                  required
                  className="h-12 rounded-2xl border-border/40 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">
                  Simbol/Kode (Opsional)
                </Label>
                <Input
                  value={formSymbol}
                  onChange={(e) => setFormSymbol(e.target.value)}
                  placeholder="Misal: BTC, BBCA"
                  className="h-12 rounded-2xl border-border/40 font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">
                  Jumlah Unit (Opsional)
                </Label>
                <Input
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  type="number"
                  step="any"
                  placeholder="Misal: 100"
                  className="h-12 rounded-2xl border-border/40 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">
                Total Modal Diinvestasikan (Rp)
              </Label>
              <Input
                value={formTotalInvested}
                onChange={(e) => setFormTotalInvested(e.target.value)}
                type="number"
                min="0"
                required
                placeholder="Total uang yang Anda setor"
                className="h-12 rounded-2xl border-border/40 font-bold tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">
                Nilai Pasar Saat Ini (Rp)
              </Label>
              <Input
                value={formCurrentValue}
                onChange={(e) => setFormCurrentValue(e.target.value)}
                type="number"
                min="0"
                required
                placeholder="Harga/Nilai total saat ini"
                className="h-12 rounded-2xl border-border/40 font-bold tabular-nums"
              />
              <p className="text-[10px] text-muted-foreground/80 mt-2 ml-1 leading-relaxed">
                <Lightbulb className="w-3 h-3 inline mr-1 -mt-0.5 text-primary" />{" "}
                Anda bisa mengubah nilai ini nanti saat harga aset naik/turun
                untuk melihat profit.
              </p>
            </div>

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFormOpen(false)}
                className="rounded-2xl h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? "Simpan Perubahan" : "Tambah Portofolio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deletingItem}
        onOpenChange={(o) => {
          if (!o) setDeletingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-sm rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-center md:text-left">
              Hapus Investasi?
            </DialogTitle>
            <DialogDescription className="text-center md:text-left">
              Apakah Anda yakin ingin menghapus data portofolio{" "}
              <strong className="text-foreground">{deletingItem?.name}</strong>?
              Data yang dihapus tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDeletingItem(null)}
              disabled={isDeleting}
              className="rounded-2xl h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first"
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus
                </>
              ) : (
                "Hapus Aset"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <AssetDetails
        item={viewingItem}
        open={!!viewingItem}
        onOpenChange={(o) => {
          if (!o) setViewingItem(null);
        }}
        config={
          viewingItem 
            ? TYPE_CONFIG[viewingItem.type as keyof typeof TYPE_CONFIG] 
            : { icon: Box, color: "", bg: "", fill: "" }
        }
      />

      {/* Import CSV Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-border/40 p-8 text-center">
           <DialogHeader>
             <DialogTitle className="text-2xl font-black">Import Data Portofolio</DialogTitle>
             <DialogDescription className="text-sm font-semibold text-muted-foreground mt-2">
                Unggah file CSV Anda dengan format kolom:<br/>
                <code className="text-[10px] bg-muted/25 p-1 rounded mt-2 block w-full overflow-x-auto text-left break-all text-red-500">name,type,symbol,amount,total_invested,current_value</code>
             </DialogDescription>
           </DialogHeader>

           <div className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-3xl p-8 bg-muted/10 hover:bg-muted/30 transition-colors relative">
               {importing ? (
                 <Loader2 className="w-10 h-10 animate-spin text-primary" />
               ) : (
                 <>
                   <Upload className="w-10 h-10 text-muted-foreground opacity-50 mb-4" />
                   <h4 className="font-bold text-foreground">Pilih File CSV</h4>
                   <p className="text-xs text-muted-foreground mt-1">Maksimal 5MB</p>
                   <input 
                     type="file" 
                     id="csv-import-input"
                     accept=".csv"
                     onChange={handleFileUpload}
                     disabled={importing}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     aria-label="Unggah file CSV"
                     title="Pilih file CSV untuk diimpor"
                   />
                 </>
               )}
           </div>

           <div className="mt-8 text-left bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Contoh Baris Data:</p>
              <p className="text-[11px] font-mono text-muted-foreground">
                Bitcoin,kripto,BTC,0.1,10000000,12000000<br/>
                BBCA,saham,BBCA.JK,1000,8000000,9500000
              </p>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
