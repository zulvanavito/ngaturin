"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BudgetProgress } from "./budget-progress";
import { Plus, Target, X, Loader2 } from "lucide-react";

interface Budget {
  id: string;
  category: string;
  amount: number;
}

interface BudgetSectionProps {
  transactions: any[];
}

export function BudgetSection({ transactions }: BudgetSectionProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");

  const supabase = createClient();
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  const fetchBudgets = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      // Fallback dummy for development if table not created
      if ((error as any).code === '42P01') {
         setBudgets([{ id: 'dummy', category: 'Makanan', amount: 1500000 }]);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase, currentMonth]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const parsedAmount = parseInt(amount.replace(/\D/g, ""), 10);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return;

      const finalCategory = category === "Lainnya" && customCategory.trim() !== "" 
        ? customCategory.trim() 
        : category;

      // Upsert logic based on category and month (handled by unique constraint + ON CONFLICT if using raw SQL, but Supabase JS upsert needs ID to work simply. Let's delete and insert for simplicity if it exists)
      const existing = budgets.find(b => b.category === finalCategory);
      
      if (existing) {
         await supabase.from("budgets").update({ amount: parsedAmount }).eq("id", existing.id);
      } else {
         await supabase.from("budgets").insert({
            user_id: user.id,
            category: finalCategory,
            amount: parsedAmount,
            month: currentMonth
         });
      }

      await fetchBudgets();
      setIsAdding(false);
      setCategory("");
      setCustomCategory("");
      setAmount("");
    } catch (error) {
      console.error("Error saving budget:", error);
    } finally {
      setSaving(false);
    }
  };

  const getSpentAmount = (cat: string) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const handleFormatRupiah = (value: string) => {
    const number = value.replace(/\D/g, "");
    if (!number) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseInt(number, 10));
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-xl animate-pulse h-32">
        <CardContent className="h-full flex items-center justify-center text-muted-foreground">
          Memuat data anggaran...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0 bg-card/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Anggaran Bulanan
          </CardTitle>
          <CardDescription>Bulan Ini</CardDescription>
        </div>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="h-9 gap-1">
            <Plus className="w-4 h-4" /> Set Anggaran
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        {isAdding && (
          <form onSubmit={handleSaveBudget} className="mb-6 bg-muted/20 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-sm">Target Anggaran Baru</h4>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-category">Kategori</Label>
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="b-category" className={`h-10 bg-background ${category === "Lainnya" ? "w-1/3" : "w-full"}`}>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Makanan">Makanan</SelectItem>
                      <SelectItem value="Transportasi">Transportasi</SelectItem>
                      <SelectItem value="Kebutuhan">Kebutuhan</SelectItem>
                      <SelectItem value="Hiburan">Hiburan</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>

                  {category === "Lainnya" && (
                    <Input
                      placeholder="Ketik Kategori Baru..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="h-10 bg-background flex-1 animate-in fade-in slide-in-from-right-4"
                      required
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-amount">Batas Nominal (Rp)</Label>
                <Input
                  id="b-amount"
                  value={handleFormatRupiah(amount)}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Rp 0"
                  required
                  className="h-10 bg-background"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" className="gradient-primary text-white" disabled={saving || !category || !amount}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Target
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {budgets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50 font-medium text-sm">
              Belum ada target anggaran. Yuk, mulai tetapkan batasan pengeluaran!
            </div>
          ) : (
            budgets.map((b) => (
              <BudgetProgress 
                key={b.id} 
                category={b.category} 
                budget={Number(b.amount)} 
                spent={getSpentAmount(b.category)} 
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
