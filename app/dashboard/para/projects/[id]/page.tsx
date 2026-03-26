"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ParaProject, ParaTask, getProjectProgress, getDaysUntilDeadline } from "@/lib/para-types";
import { ParaArea } from "@/lib/para-types";
import { CheckCircle2, Circle, Plus, Trash2, Archive, Calendar, Target, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ParaProject | null>(null);
  const [areas, setAreas] = useState<ParaArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editOutcome, setEditOutcome] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editAreaId, setEditAreaId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchProject = useCallback(async () => {
    const [projRes, areaRes] = await Promise.all([
      fetch(`/api/para/projects/${id}`),
      fetch("/api/para/areas"),
    ]);
    const [projData, areaData] = await Promise.all([projRes.json(), areaRes.json()]);
    setProject(projData);
    setAreas(Array.isArray(areaData) ? areaData : []);
    setIsLoading(false);
    setEditTitle(projData.title ?? "");
    setEditOutcome(projData.outcome ?? "");
    setEditDeadline(projData.deadline ?? "");
    setEditAreaId(projData.area_id ?? "");
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const tasks: ParaTask[] = project?.para_tasks ?? [];
  const progress = getProjectProgress(tasks);
  const daysLeft = getDaysUntilDeadline(project?.deadline);
  const areaColor = project?.para_areas?.color ?? "#6366F1";

  const handleToggle = async (task: ParaTask) => {
    const res = await fetch(`/api/para/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: !task.is_done }),
    });
    if (res.ok) fetchProject();
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const res = await fetch("/api/para/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: id, title: newTask.trim() }),
    });
    if (res.ok) { setNewTask(""); setIsAddingTask(false); fetchProject(); }
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/para/tasks/${taskId}`, { method: "DELETE" });
    fetchProject();
  };

  const handleArchive = async () => {
    await fetch(`/api/para/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    router.push("/dashboard/para/projects");
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    await fetch(`/api/para/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, outcome: editOutcome, deadline: editDeadline || null, area_id: editAreaId || null }),
    });
    setIsSaving(false);
    setIsEditing(false);
    fetchProject();
  };

  const handleDelete = async () => {
    if (!confirm("Hapus project ini beserta semua task-nya?")) return;
    await fetch(`/api/para/projects/${id}`, { method: "DELETE" });
    router.push("/dashboard/para/projects");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 animate-pulse" />
      </div>
    );
  }

  if (!project) return <p className="text-center text-muted-foreground mt-20">Project tidak ditemukan.</p>;

  const doneTasks = tasks.filter((t) => t.is_done).length;

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-6">
      {/* Breadcrumb */}
      <Link href="/dashboard/para/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Projects
      </Link>

      {/* Project Header */}
      <div className="rounded-3xl border bg-card shadow-sm overflow-hidden" style={{ borderColor: `${areaColor}40` }}>
        <div className="h-2" style={{ backgroundColor: areaColor }} />
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Judul Project</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm outline-none border border-border/40 focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Outcome *</label>
                <textarea
                  rows={2}
                  value={editOutcome}
                  onChange={(e) => setEditOutcome(e.target.value)}
                  className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm outline-none border border-border/40 focus:border-primary/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm outline-none border border-border/40 focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Area</label>
                  <select
                    value={editAreaId}
                    onChange={(e) => setEditAreaId(e.target.value)}
                    className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm outline-none border border-border/40 focus:border-primary/50"
                  >
                    <option value="">Tanpa area</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
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
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-xl font-extrabold text-foreground leading-tight">{project.title}</h1>
                <button onClick={() => setIsEditing(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 pt-1">Edit</button>
              </div>

              <div className="flex items-start gap-2 mb-4">
                <Target className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{project.outcome}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-5">
                {project.para_areas && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${areaColor}20`, color: areaColor }}>
                    {project.para_areas.name}
                  </span>
                )}
                {project.deadline && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${daysLeft !== null && daysLeft < 0 ? "text-expense" : daysLeft !== null && daysLeft <= 3 ? "text-amber-500" : "text-muted-foreground"}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(project.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    {daysLeft !== null && (
                      <span>({daysLeft < 0 ? `${Math.abs(daysLeft)}h lewat` : daysLeft === 0 ? "hari ini!" : `${daysLeft}h lagi`})</span>
                    )}
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground/70">Progress</span>
                  <span className="text-sm font-bold" style={{ color: areaColor }}>{doneTasks}/{tasks.length} tasks • {progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, backgroundColor: areaColor }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/40 hover:bg-muted/50"
                >
                  <Archive className="w-4 h-4" />
                  Selesai & Arsipkan
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-sm font-semibold text-expense hover:bg-expense/10 transition-colors px-3 py-1.5 rounded-lg border border-expense/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-3xl border border-border/40 bg-card shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground">Tasks</h2>
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah task
          </button>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 && !isAddingTask && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Belum ada task. Tambahkan yang pertama!</p>
            </div>
          )}
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 group transition-colors">
              <button onClick={() => handleToggle(task)} className="shrink-0">
                {task.is_done
                  ? <CheckCircle2 className="w-5 h-5 text-income" />
                  : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                }
              </button>
              <span className={`flex-1 text-sm ${task.is_done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                {task.title}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {isAddingTask && (
            <div className="flex items-center gap-2 mt-2 p-1">
              <input
                autoFocus
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") setIsAddingTask(false); }}
                placeholder="Nama task baru..."
                className="flex-1 text-sm bg-muted/50 rounded-xl px-4 py-2.5 outline-none border border-border/40 focus:border-primary/50"
              />
              <Button size="sm" onClick={handleAddTask} className="rounded-xl h-10 px-4">Tambah</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingTask(false)} className="rounded-xl h-10">Batal</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
