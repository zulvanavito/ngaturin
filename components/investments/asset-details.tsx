"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, TrendingDown, History, Calendar, CheckCircle2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

interface Transaction {
  id: string;
  type: string;
  amount: number;
  price_per_unit: number;
  total_value: number;
  transaction_date: string;
}

interface AssetDetailsProps {
  item: Investment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: {
    icon: React.ElementType;
    color: string;
    bg: string;
    fill: string;
  };
}

const localFormatCurrency = (n: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export function AssetDetails({ item, open, onOpenChange, config }: AssetDetailsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (open && item) {
      setLoading(true);
      fetch(`/api/investments/${item.id}/transactions`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTransactions(data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setTransactions([]);
    }
  }, [open, item]);

  if (!item) return null;

  const Icon = config.icon;
  const profit = item.current_value - item.total_invested;
  const pct = item.total_invested > 0 ? (profit / item.total_invested) * 100 : 0;
  const isItemProfit = profit >= 0;

  // Calculate Average Cost (Cost Basis)
  const totalSharesBuy = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalCostBuy = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + Number(t.total_value), 0);
    
  const averageCost = totalSharesBuy > 0 ? totalCostBuy / totalSharesBuy : 0;

  // Generate Mock Chart Data based on current transaction history (simplified)
  // In a real scenario, this would come from the `investment_history` table.
  const mockChartData = transactions.slice().reverse().map(t => ({
    date: new Date(t.transaction_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    value: Number(t.total_value),
  }));

  // Ensure we at least have 2 points for the chart to render properly
  if (mockChartData.length === 1) {
      mockChartData.unshift({
          date: new Date(new Date(transactions[0].transaction_date).getTime() - 86400000).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
          value: mockChartData[0].value * 0.95 // Mock previous price
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 bg-background max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{item.name} Details</DialogTitle>
          <DialogDescription>Detailed view and history for {item.name}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 ${config.bg}`}>
              <Icon className={`w-8 h-8 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-black leading-tight flex items-center gap-2 break-words">
                {item.name}
                {item.symbol && (
                  <Badge variant="secondary" className="px-2 py-0.5 h-6 text-xs">
                    {item.symbol}
                  </Badge>
                )}
              </h3>
              <p className="text-sm font-semibold text-muted-foreground capitalize mt-1">
                {item.type}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto p-4 sm:p-0 bg-muted/20 sm:bg-transparent rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nilai Saat Ini</p>
            <p className="text-2xl font-black tabular-nums">{localFormatCurrency(item.current_value)}</p>
            <p className={`text-sm font-bold flex items-center sm:justify-end gap-1 mt-1 ${isItemProfit ? "text-success" : "text-expense"}`}>
              {isItemProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isItemProfit ? "+" : ""}{pct.toFixed(2)}%
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-2xl bg-muted/30 p-1 mb-6">
            <TabsTrigger value="overview" className="rounded-xl font-bold text-sm">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-xl font-bold text-sm">Riwayat Transaksi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none focus:ring-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 p-5 rounded-[1.5rem] border border-border/30">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Modal Ditanam</span>
                <p className="font-black text-lg tabular-nums mt-1">{localFormatCurrency(item.total_invested)}</p>
              </div>
              <div className="bg-muted/20 p-5 rounded-[1.5rem] border border-border/30">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profit / Loss</span>
                <p className={`font-black text-lg tabular-nums mt-1 ${isItemProfit ? "text-success" : "text-expense"}`}>
                  {isItemProfit ? "+" : ""}{localFormatCurrency(profit)}
                </p>
              </div>
              <div className="bg-muted/20 p-5 rounded-[1.5rem] border border-border/30">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Harga Beli Rata-Rata</span>
                <p className="font-black text-lg tabular-nums mt-1">{averageCost > 0 ? localFormatCurrency(averageCost) : "-"}</p>
              </div>
              <div className="bg-muted/20 p-5 rounded-[1.5rem] border border-border/30">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unit / Lot</span>
                <p className="font-black text-lg tabular-nums mt-1">{item.amount || "-"}</p>
              </div>
            </div>

            {/* Micro Chart */}
            <div className="bg-card border border-border/40 rounded-[2rem] p-6 shadow-ring">
               <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Grafik Transaksi (Estimasi)</h4>
               <div className="h-[200px] w-full">
                 {mockChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={config.fill} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={config.fill} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip
                        formatter={(value: number | string | undefined) => [localFormatCurrency(Number(value || 0)), "Nilai Transaksi"]}
                        contentStyle={{ borderRadius: '1rem', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={config.fill} 
                        strokeWidth={3} 
                        fill="url(#colorAsset)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs font-semibold">
                      <TrendingUp className="w-6 h-6 mb-2 opacity-20" />
                      Belum ada data grafik
                    </div>
                 )}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 outline-none focus:ring-0">
             {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
             ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map(trx => (
                    <div key={trx.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-muted/10 border border-border/30">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'buy' ? 'bg-primary/20 text-primary' : trx.type === 'sell' ? 'bg-expense/20 text-expense' : 'bg-muted text-muted-foreground'}`}>
                             {trx.type === 'buy' ? <TrendingUp className="w-4 h-4" /> : trx.type === 'sell' ? <TrendingDown className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase tracking-wider">{trx.type === 'update' ? 'Penyesuaian' : trx.type}</p>
                            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(trx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'})}
                            </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`font-black tabular-nums ${trx.type === 'sell' ? 'text-expense' : 'text-foreground'}`}>
                            {trx.type === 'sell' ? '-' : '+'}{localFormatCurrency(Number(trx.total_value))}
                          </p>
                          {trx.amount > 0 && trx.type !== 'update' && (
                             <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                               {trx.amount} unit @ {localFormatCurrency(Number(trx.price_per_unit))}
                             </p>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <History className="w-12 h-12 text-muted-foreground opacity-20 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">Belum ada riwayat transaksi</p>
                  <Button variant="link" className="text-primary text-xs mt-2 font-bold hidden">
                    Import dari CSV
                  </Button>
                </div>
             )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
