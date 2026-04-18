"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { Plus, ChevronLeft, Loader2, Tag, Sparkles, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { CategoryCard, type Category } from "@/components/category-card";
import { CategoryFormModal } from "@/components/category-form-modal";
import { CategoryIcon, SUGGESTED_CATEGORIES } from "@/components/category-icon";
import { useToast } from "@/lib/toast-context";

export default function CategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isQuickSetupLoading, setIsQuickSetupLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const catName = categories.find(c => c.id === deleteId)?.name || "Kategori";
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      await refetch();
      showToast("success", `Kategori "${catName}" berhasil dihapus.`);
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal menghapus kategori.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleQuickSetup = async () => {
    setIsQuickSetupLoading(true);
    try {
      let added = 0;
      for (const cat of SUGGESTED_CATEGORIES) {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cat),
        });
        if (res.ok) added++;
      }
      await refetch();
      showToast("success", `${added} kategori berhasil ditambahkan!`);
    } catch {
      showToast("error", "Gagal menambahkan kategori.");
    } finally {
      setIsQuickSetupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Memuat kategori Anda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 pt-10">
      <CategoryFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => { refetch(); showToast("success", "Kategori berhasil disimpan!"); }}
        category={selectedCategory}
      />

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
              Atur Kategori.
            </h1>
            <p className="text-lg font-bold text-muted-foreground max-w-md">
              Kelola label untuk transaksi dan anggaran Anda agar lebih terorganisir.
            </p>
          </div>

          <Button
            onClick={handleCreate}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg h-16 px-10 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-6 h-6 mr-3 stroke-[3px]" /> Buat Kategori
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-primary/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-primary/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/60 mb-2">Total Kategori</p>
          <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground">{categories.length}</span>
        </div>
        <div className="bg-expense/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-expense/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-expense/60 mb-2">Pengeluaran</p>
          <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground">
            {categories.filter(c => c.type === "expense" || c.type === "all").length}
          </span>
        </div>
        <div className="bg-income/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-income/10">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-income/60 mb-2">Pemasukan</p>
          <span className="text-lg sm:text-xl lg:text-2xl font-black text-foreground">
            {categories.filter(c => c.type === "income" || c.type === "all").length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Tag className="w-6 h-6 text-primary" /> Daftar Kategori
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="space-y-8">
            {/* Empty State */}
            <div className="bg-muted/10 border-2 border-dashed border-border/40 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center space-y-6">
              <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto">
                <Tag className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">Belum ada kategori</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  Buat kategori secara manual atau gunakan Setup Cepat di bawah untuk memulai.
                </p>
              </div>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="rounded-full h-12 px-8 font-bold border-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
              >
                Buat Kategori Pertama
              </Button>
            </div>

            {/* Quick Setup Section */}
            <div className="bg-black text-white rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black">Setup Cepat</h3>
                    <p className="text-sm text-white/50 font-medium">Tambahkan {SUGGESTED_CATEGORIES.length} kategori populer dalam satu klik.</p>
                  </div>
                </div>

                {/* Suggested Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {SUGGESTED_CATEGORIES.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <CategoryIcon iconName={cat.icon} className="w-4 h-4 text-white/70" />
                      </div>
                      <span className="text-xs font-bold text-white/70 truncate">{cat.name}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleQuickSetup}
                  disabled={isQuickSetupLoading}
                  className="rounded-full h-14 px-10 bg-white text-black font-black text-base hover:bg-white/90 shadow-2xl active:scale-95 transition-all"
                >
                  {isQuickSetupLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" /> Tambahkan Semua Sekarang
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {categories.slice(0, isExpanded ? categories.length : 6).map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
            
            {categories.length > 6 && (
              <Button 
                variant="ghost" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full h-11 rounded-2xl border border-dashed border-border/40 text-muted-foreground font-bold hover:bg-muted/5 transition-all text-xs"
              >
                {isExpanded ? (
                  <><ChevronUp className="w-4 h-4 mr-2" /> Sembunyikan</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-2" /> Lihat {categories.length - 6} Kategori Lainnya</>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] sm:rounded-[2.5rem] border-border/40 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Hapus Kategori</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Apakah Anda yakin ingin menghapus kategori ini? Transaksi yang sudah menggunakan kategori ini tidak akan terpengaruh, tapi kategori ini tidak akan tersedia lagi untuk data baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-2xl h-12 font-bold w-full sm:w-auto order-last sm:order-first">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-2xl h-12 font-black w-full sm:w-auto">
              {isDeleting ? "Menghapus..." : "Hapus Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
