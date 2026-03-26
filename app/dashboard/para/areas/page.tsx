"use client";

import { useState, useEffect, useCallback } from "react";
import { ParaArea } from "@/lib/para-types";
import { ParaAreaCard } from "@/components/para-area-card";
import { ParaGuidanceBanner } from "@/components/para-guidance-banner";
import { Plus, FolderOpen, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRESET_COLORS = ["#6366F1", "#BAAFE0", "#85DABB", "#F5C89A", "#F4B8C0", "#93C9E0", "#6B93D6", "#A78BFA"];

interface AreaFormState {
  name: string;
  description: string;
  color: string;
}

export default function ParaAreasPage() {
  const [areas, setAreas] = useState<ParaArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<ParaArea | null>(null);
  const [form, setForm] = useState<AreaFormState>({ name: "", description: "", color: "#6366F1" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAreas = useCallback(async () => {
    const res = await fetch("/api/para/areas");
    const data = await res.json();
    setAreas(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  const openCreate = () => {
    setEditingArea(null);
    setForm({ name: "", description: "", color: "#6366F1" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (area: ParaArea) => {
    setEditingArea(area);
    setForm({ name: area.name, description: area.description ?? "", color: area.color });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Nama area wajib diisi."); return; }
    setIsSaving(true); setError("");

    if (editingArea) {
      await fetch(`/api/para/areas/${editingArea.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/para/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setIsSaving(false);
    setShowForm(false);
    fetchAreas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus area ini? Project yang terhubung akan tetap ada tapi tidak mempunyai area.")) return;
    await fetch(`/api/para/areas/${id}`, { method: "DELETE" });
    fetchAreas();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Areas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tanggung jawab jangka panjangmu</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-white rounded-xl h-10 px-4 font-semibold hover:opacity-90 shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Area Baru
        </Button>
      </div>

      {/* Guidance Banner */}
      <ParaGuidanceBanner
        title="Area = Tanggung jawab berkelanjutan"
        description="Area berbeda dari Project — Area tidak pernah selesai. Finance, Career, Health adalah contoh area. Project berlangsung di dalam area."
        tips={[
          "Buat 3–5 area yang mewakili tanggung jawab utama hidupmu",
          "Klik kartu area untuk melihat semua project di dalamnya",
          "Area yang tidak punya project aktif mungkin sedang neglected",
        ]}
        dismissKey="areas_guide"
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card rounded-3xl border border-border/50 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-foreground text-lg mb-5">{editingArea ? "Edit Area" : "Area Baru"}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Nama Area *</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Contoh: Finance, Career, Health..."
                  className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Apa tanggung jawab di area ini?"
                  className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Warna</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-foreground/50 scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-expense font-semibold">{error}</p>}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-11 rounded-xl font-semibold gradient-primary text-white hover:opacity-90"
              >
                {isSaving ? "Menyimpan..." : editingArea ? "Simpan Perubahan" : "Buat Area"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : areas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <FolderOpen className="w-14 h-14 text-muted-foreground/20" />
          <p className="font-semibold text-muted-foreground">Belum ada area</p>
          <p className="text-sm text-muted-foreground/60">Area adalah tanggung jawab jangka panjang seperti Finance, Career, Health</p>
          <Button onClick={openCreate} variant="outline" className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Buat Area Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <div key={area.id} className="relative group">
              <ParaAreaCard area={area} onEdit={openEdit} />
              <button
                onClick={() => handleDelete(area.id)}
                className="absolute top-10 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={openCreate}
            className="rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary min-h-[180px]"
          >
            <Plus className="w-7 h-7" />
            <span className="text-sm font-semibold">Tambah Area</span>
          </button>
        </div>
      )}
    </div>
  );
}
