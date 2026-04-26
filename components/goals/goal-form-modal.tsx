"use client";

import { useState, useEffect } from "react";
import { Target, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Goal } from "./goal-card";

interface GoalFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal?: Goal | null;
}

const COLORS = [
  "#9fe870", 
  "#3b82f6", 
  "#8b5cf6", 
  "#ec4899", 
  "#f97316", 
  "#14b8a6", 
  "#64748b", 
];

export function GoalFormModal({ open, onClose, onSuccess, goal }: GoalFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoriesList, setCategoriesList] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => setCategoriesList(Array.isArray(d) ? d : []))
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || "");
      setTargetAmount(String(goal.target_amount));
      setCurrentAmount(String(goal.current_amount));
      setDeadline(goal.deadline ? goal.deadline.split('T')[0] : "");
      setCategory(goal.category || "");
      setColor(goal.color);
    } else {
      setTitle("");
      setDescription("");
      setTargetAmount("");
      setCurrentAmount("0");
      setDeadline("");
      setCategory("");
      setColor(COLORS[0]);
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) {
      setError("Judul dan target dana wajib diisi.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const url = goal ? `/api/goals/${goal.id}` : "/api/goals";
      const method = goal ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          target_amount: Number(targetAmount),
          current_amount: Number(currentAmount),
          deadline: deadline || null,
          category: category || null,
          color,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan target");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {goal ? "Edit Target" : "Buat Target Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Tentukan impian finansial Anda dan mulailah menabung.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Nama Target</Label>
              <div className="relative">
                <Target className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Misal: Liburan ke Jepang" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="pl-11 h-12 rounded-2xl border-border/40 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">Target Dana (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="10000000" 
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="h-12 rounded-2xl border-border/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">Saldo Awal (Rp)</Label>
                <Input 
                  type="number"
                  placeholder="0" 
                  value={currentAmount}
                  onChange={e => setCurrentAmount(e.target.value)}
                  className="h-12 rounded-2xl border-border/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">Tenggat Waktu</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input 
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="pl-11 h-12 rounded-2xl border-border/40"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest ml-1">Kategori</Label>
                {categoriesList.length > 0 ? (
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-2xl border-border/40 px-4 w-full">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40">
                      {categoriesList.map((c) => (
                        <SelectItem key={c.id} value={c.name} className="rounded-xl cursor-pointer">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-12 rounded-2xl border border-dashed border-border/60 flex items-center justify-between px-4 bg-muted/20">
                    <span className="text-xs text-muted-foreground mr-2 truncate">Belum ada Kategori</span>
                    <a href="/dashboard/categories" className="text-xs font-bold text-primary shrink-0 hover:underline">Tambah →</a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Catatan Tambahan</Label>
              <textarea 
                placeholder="Kenapa target ini penting bagi Anda?" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="flex w-full rounded-2xl border border-border/40 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Warna Tema</Label>
              <div className="flex gap-3 px-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Pilih warna tema ${c}`}
                    title={`Pilih warna ${c}`}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all duration-200 border-4 ${color === c ? "border-white dark:border-slate-800 scale-125 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-expense/10 text-expense text-xs font-bold">
              <Info className="w-4 h-4" /> {error}
            </div>
          )}

          <DialogFooter className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-2xl h-12 px-6 font-bold w-full sm:w-auto order-last sm:order-first"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-2xl h-12 px-8 font-black bg-primary text-primary-foreground hover:brightness-110 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              {isLoading ? "Menyimpan..." : goal ? "Simpan Perubahan" : "Buat Target"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
