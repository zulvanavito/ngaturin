"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ParaProject, ParaArea, getProjectProgress } from "@/lib/para-types";
import { ParaProjectCard } from "@/components/para-project-card";
import { ParaCaptureModal } from "@/components/para-capture-modal";
import {
  ArrowLeft, Briefcase, Plus, Edit3, Trash2, CheckCircle2,
  Archive, X, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PRESET_COLORS = ["#6366F1", "#BAAFE0", "#85DABB", "#F5C89A", "#F4B8C0", "#93C9E0", "#6B93D6", "#A78BFA"];

export default function AreaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [area, setArea] = useState<ParaArea | null>(null);
  const [activeProjects, setActiveProjects] = useState<ParaProject[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<ParaProject[]>([]);
  const [allAreas, setAllAreas] = useState<ParaArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("#6366F1");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [areaRes, allAreasRes, projActiveRes, projArchivedRes] = await Promise.all([
      fetch(`/api/para/areas`),
      fetch(`/api/para/areas`),
      fetch(`/api/para/projects?status=active`),
      fetch(`/api/para/projects?status=archived`),
    ]);

    const [areasData, , activeData, archivedData] = await Promise.all([
      areaRes.json(), allAreasRes.json(), projActiveRes.json(), projArchivedRes.json()
    ]);

    const areasArr: ParaArea[] = Array.isArray(areasData) ? areasData : [];
    const found = areasArr.find((a) => a.id === id) ?? null;

    setArea(found);
    setAllAreas(areasArr);
    if (found) {
      setEditName(found.name);
      setEditDesc(found.description ?? "");
      setEditColor(found.color);
    }

    const active: ParaProject[] = Array.isArray(activeData) ? activeData : [];
    const archived: ParaProject[] = Array.isArray(archivedData) ? archivedData : [];
    setActiveProjects(active.filter((p) => p.area_id === id));
    setArchivedProjects(archived.filter((p) => p.area_id === id));
    setIsLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveEdit = async () => {
    setIsSaving(true);
    await fetch(`/api/para/areas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc, color: editColor }),
    });
    setIsSaving(false);
    setIsEditing(false);
    fetchData();
  };

  const handleDeleteArea = async () => {
    if (!confirm("Hapus area ini? Project yang terhubung tetap ada tapi tanpa area.")) return;
    await fetch(`/api/para/areas/${id}`, { method: "DELETE" });
    router.push("/dashboard/para/areas");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 animate-pulse" />
      </div>
    );
  }

  if (!area) {
    return (
      <div className="text-center mt-20 space-y-3">
        <FolderOpen className="w-14 h-14 text-muted-foreground/20 mx-auto" />
        <p className="text-muted-foreground font-semibold">Area tidak ditemukan.</p>
        <Link href="/dashboard/para/areas" className="text-primary text-sm hover:underline">← Kembali ke Areas</Link>
      </div>
    );
  }

  const areaColor = area.color;
  const totalDone = activeProjects.reduce((acc, p) => {
    const tasks = p.para_tasks ?? [];
    return acc + tasks.filter((t) => t.is_done).length;
  }, 0);
  const totalTasks = activeProjects.reduce((acc, p) => acc + (p.para_tasks?.length ?? 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <ParaCaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onSuccess={fetchData}
        areas={allAreas.map((a) => ({ id: a.id, name: a.name, color: a.color }))}
      />

      {/* Breadcrumb */}
      <Link href="/dashboard/para/areas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Areas
      </Link>

      {/* Area Header Card */}
      {isEditing ? (
        <div className="rounded-3xl border border-border/50 bg-card shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-foreground">Edit Area</h2>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Nama Area *</label>
            <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
              className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Deskripsi</label>
            <textarea rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
              className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Warna</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => setEditColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${editColor === c ? "ring-2 ring-offset-2 ring-foreground/50 scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 rounded-xl gradient-primary text-white">
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">Batal</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden border bg-card shadow-sm" style={{ borderColor: `${areaColor}40` }}>
          <div className="h-2" style={{ backgroundColor: areaColor }} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${areaColor}20` }}>
                  <FolderOpen className="w-5 h-5" style={{ color: areaColor }} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-foreground">{area.name}</h1>
                  {area.description && <p className="text-sm text-muted-foreground mt-0.5">{area.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={handleDeleteArea} className="text-expense/60 hover:text-expense transition-colors p-1.5 rounded-lg hover:bg-expense/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-xl font-extrabold text-foreground">{activeProjects.length}</p>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Project Aktif</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-xl font-extrabold text-foreground">{archivedProjects.length}</p>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Selesai</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${areaColor}15` }}>
                <p className="text-xl font-extrabold" style={{ color: areaColor }}>{overallProgress}%</p>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Total Progress</p>
              </div>
            </div>

            {totalTasks > 0 && (
              <div className="mt-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%`, backgroundColor: areaColor }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{totalDone} dari {totalTasks} tasks selesai</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Project Aktif
            <span className="text-xs text-muted-foreground font-normal">({activeProjects.length})</span>
          </h2>
          <Button onClick={() => setCaptureOpen(true)} size="sm" className="gradient-primary text-white rounded-xl h-8 px-3 text-xs font-semibold hover:opacity-90 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Tambah Project
          </Button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border/40 p-10 text-center">
            <Briefcase className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">Belum ada project aktif di area ini</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Buat project baru dan link ke area <span className="font-semibold" style={{ color: areaColor }}>{area.name}</span></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeProjects.map((p) => (
              <ParaProjectCard key={p.id} project={p} onUpdate={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Archived / Completed Projects */}
      {archivedProjects.length > 0 && (
        <div>
          <h2 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <Archive className="w-4 h-4 text-muted-foreground" />
            Selesai / Diarsipkan
            <span className="text-xs text-muted-foreground font-normal">({archivedProjects.length})</span>
          </h2>
          <div className="space-y-2">
            {archivedProjects.map((p) => {
              const tasks = p.para_tasks ?? [];
              const prog = getProjectProgress(tasks);
              return (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/30 bg-card/50">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">{tasks.length} tasks · {prog}% selesai</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-income" />
                    <span className="text-xs text-income font-semibold">Selesai</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
