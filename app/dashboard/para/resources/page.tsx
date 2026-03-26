"use client";

import { useState, useEffect, useCallback } from "react";
import { ParaResource, ParaArea } from "@/lib/para-types";
import { ParaResourceCard } from "@/components/para-resource-card";
import { ParaGuidanceBanner } from "@/components/para-guidance-banner";
import { Plus, BookOpen, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResType = "Article" | "Idea" | "Note" | "all";

interface ResourceFormState {
  title: string;
  type: "Article" | "Idea" | "Note";
  content: string;
  tags: string;
  area_id: string;
}

export default function ParaResourcesPage() {
  const [resources, setResources] = useState<ParaResource[]>([]);
  const [areas, setAreas] = useState<ParaArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ResType>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<ParaResource | null>(null);
  const [viewResource, setViewResource] = useState<ParaResource | null>(null);
  const [form, setForm] = useState<ResourceFormState>({ title: "", type: "Note", content: "", tags: "", area_id: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    const [resRes, areaRes] = await Promise.all([
      fetch("/api/para/resources"),
      fetch("/api/para/areas"),
    ]);
    const [resData, areaData] = await Promise.all([resRes.json(), areaRes.json()]);
    setResources(Array.isArray(resData) ? resData : []);
    setAreas(Array.isArray(areaData) ? areaData : []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = typeFilter === "all" ? resources : resources.filter((r) => r.type === typeFilter);

  const openCreate = () => {
    setEditingResource(null);
    setForm({ title: "", type: "Note", content: "", tags: "", area_id: "" });
    setError(""); setShowForm(true);
  };

  const openEdit = (resource: ParaResource) => {
    setEditingResource(resource);
    setForm({ title: resource.title, type: resource.type, content: resource.content ?? "", tags: resource.tags.join(", "), area_id: resource.area_id ?? "" });
    setError(""); setShowForm(true);
  };

  const handleArchive = async (resource: ParaResource) => {
    await fetch(`/api/para/resources/${resource.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_archived: true }),
    });
    fetchData();
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Judul wajib diisi."); return; }
    setIsSaving(true); setError("");
    const tagArr = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (editingResource) {
      await fetch(`/api/para/resources/${editingResource.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: tagArr, area_id: form.area_id || null }),
      });
    } else {
      await fetch("/api/para/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: tagArr, area_id: form.area_id || null }),
      });
    }
    setIsSaving(false); setShowForm(false); fetchData();
  };

  const typeOptions: { label: string; value: ResType }[] = [
    { label: "Semua", value: "all" },
    { label: "Catatan", value: "Note" },
    { label: "Artikel", value: "Article" },
    { label: "Ide", value: "Idea" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* View resource modal */}
      {viewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewResource(null)} />
          <div className="relative bg-card rounded-3xl border border-border/50 shadow-2xl w-full max-w-xl p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <button onClick={() => setViewResource(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{viewResource.type}</span>
              {viewResource.para_areas && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${viewResource.para_areas.color}20`, color: viewResource.para_areas.color }}>
                  {viewResource.para_areas.name}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground mt-3 mb-4">{viewResource.title}</h2>
            {viewResource.content && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{viewResource.content}</p>
            )}
            {viewResource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {viewResource.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-5">
              <Button size="sm" variant="outline" onClick={() => { setViewResource(null); openEdit(viewResource); }} className="rounded-xl">Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => { setViewResource(null); handleArchive(viewResource); }} className="rounded-xl text-muted-foreground">Arsipkan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card rounded-3xl border border-border/50 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <h2 className="font-bold text-foreground text-lg mb-5">{editingResource ? "Edit Resource" : "Resource Baru"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Judul *</label>
                <input autoFocus value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Tipe</label>
                <div className="flex gap-2">
                  {(["Note", "Article", "Idea"] as const).map((t) => (
                    <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.type === t ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}>
                      {t === "Note" ? "Catatan" : t === "Article" ? "Artikel" : "Ide"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Konten</label>
                <textarea rows={3} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Detail, link, isi catatan..." className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Tags (pisah koma)</label>
                <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="marketing, referensi..." className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50" />
              </div>
              {areas.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Area (opsional)</label>
                  <select value={form.area_id} onChange={(e) => setForm((f) => ({ ...f, area_id: e.target.value }))} className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50">
                    <option value="">Tidak terkait area</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              {error && <p className="text-xs text-expense font-semibold">{error}</p>}
              <Button onClick={handleSave} disabled={isSaving} className="w-full h-11 rounded-xl font-semibold gradient-primary text-white hover:opacity-90">
                {isSaving ? "Menyimpan..." : editingResource ? "Simpan Perubahan" : "Simpan Resource"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Resource Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Knowledge & referensi tersimpan</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-white rounded-xl h-10 px-4 font-semibold hover:opacity-90 shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" /> Resource Baru
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-muted/30 border border-border/40 p-1.5 rounded-2xl w-fit flex-wrap">
        {typeOptions.map(({ label, value }) => (
          <button key={value} onClick={() => setTypeFilter(value)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${typeFilter === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Guidance Banner */}
      <ParaGuidanceBanner
        variant="tip"
        title="Resource bukan to-do list"
        description="Simpan artikel, ide, dan catatan di sini. Resource tidak punya task — ini adalah knowledge base untuk mendukung project dan area kamu."
        tips={[
          "Resource dengan ikon jam kuning = sudah lama tidak dibuka (30+ hari)",
          "Klik resource untuk membaca dan mengedit kontennya",
          "Arsipkan resource yang sudah tidak relevan untuk menjaga library tetap bersih",
        ]}
        dismissKey="resources_guide"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-14 h-14 text-muted-foreground/20" />
          <p className="font-semibold text-muted-foreground">Belum ada resource</p>
          <Button onClick={openCreate} variant="outline" className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Simpan Resource Pertama</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <ParaResourceCard key={resource.id} resource={resource} onEdit={openEdit} onArchive={handleArchive} onClick={setViewResource} />
          ))}
        </div>
      )}
    </div>
  );
}
