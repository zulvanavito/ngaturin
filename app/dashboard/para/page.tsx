"use client";

import { useState, useEffect, useCallback } from "react";
import { ParaProject, ParaArea, ParaTask, getDaysUntilDeadline } from "@/lib/para-types";
import { ParaProjectCard } from "@/components/para-project-card";
import { ParaAreaCard } from "@/components/para-area-card";
import { ParaCaptureModal } from "@/components/para-capture-modal";
import { ParaGuidanceBanner } from "@/components/para-guidance-banner";
import { Zap, Briefcase, FolderOpen, BookOpen, Archive, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TodayTask extends ParaTask {
  projectTitle: string;
  projectId: string;
}

export default function ParaHubPage() {
  const [projects, setProjects] = useState<ParaProject[]>([]);
  const [areas, setAreas] = useState<ParaArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [projRes, areaRes] = await Promise.all([
      fetch("/api/para/projects?status=active"),
      fetch("/api/para/areas"),
    ]);
    const [projData, areaData] = await Promise.all([projRes.json(), areaRes.json()]);
    setProjects(Array.isArray(projData) ? projData : []);
    setAreas(Array.isArray(areaData) ? areaData : []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeProjects = projects.filter((p) => p.status === "active");
  const projectsSlot = 5;
  const slotsUsed = activeProjects.length;

  // Today tasks: all non-done tasks from active projects
  const todayTasks: TodayTask[] = activeProjects.flatMap((p) =>
    (p.para_tasks ?? [])
      .filter((t) => !t.is_done)
      .slice(0, 3)
      .map((t) => ({ ...t, projectTitle: p.title, projectId: p.id }))
  );

  // Urgent projects (deadline ≤ 3 days or overdue)
  const urgentProjects = activeProjects.filter((p) => {
    const d = getDaysUntilDeadline(p.deadline);
    return d !== null && d <= 3;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 animate-pulse flex items-center justify-center">
          <span className="text-primary font-bold text-lg">N.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <ParaCaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onSuccess={fetchData}
        areas={areas.map((a) => ({ id: a.id, name: a.name, color: a.color }))}
      />

      {/* Guidance Banner */}
      {activeProjects.length === 0 && areas.length === 0 && (
        <ParaGuidanceBanner
          title="Selamat datang di PARA!"
          description="PARA adalah sistem untuk membantu kamu memutuskan apa yang harus dikerjakan sekarang. Mulai dengan membuat Area terlebih dahulu, lalu buat Project di dalamnya."
          tips={[
            "Buat Area dulu (Finance, Career, Health, dll)",
            "Buat Project dengan outcome yang jelas dan deadline",
            "Pecah project menjadi tasks yang bisa langsung dikerjakan",
            "Gunakan tombol Capture di atas kapan saja untuk mencatat ide cepat",
          ]}
          dismissKey="hub_welcome"
        />
      )}
      {activeProjects.length > 0 && slotsUsed <= 2 && (
        <ParaGuidanceBanner
          variant="tip"
          title="Tips: Pilih project yang paling penting dulu"
          description="Buka satu project dan selesaikan minimal 1 task sekarang. Action kecil lebih baik dari planning panjang."
          dismissKey="hub_tip_action"
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">PARA Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Apa yang harus kamu kerjakan sekarang?</p>
        </div>
        <Button
          onClick={() => setCaptureOpen(true)}
          className="gradient-primary text-white rounded-xl h-10 px-4 font-semibold hover:opacity-90 shadow-md flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Capture
        </Button>
      </div>

      {/* Project Slot Indicator */}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Slot Project Aktif</p>
          <span className={`text-sm font-bold ${slotsUsed >= 5 ? "text-expense" : slotsUsed >= 3 ? "text-amber-500" : "text-income"}`}>
            {slotsUsed} / {projectsSlot}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: projectsSlot }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                i < slotsUsed
                  ? slotsUsed >= 5 ? "bg-expense" : slotsUsed >= 3 ? "bg-amber-500" : "bg-income"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        {slotsUsed >= 5 && (
          <p className="text-xs text-expense font-semibold mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Terlalu banyak project! Selesaikan atau arsipkan dulu.
          </p>
        )}
      </div>

      {/* Urgent Alerts */}
      {urgentProjects.length > 0 && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-50/50 dark:bg-amber-500/5 p-4 space-y-2">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {urgentProjects.length} project mendesak!
          </p>
          {urgentProjects.map((p) => {
            const d = getDaysUntilDeadline(p.deadline);
            return (
              <Link key={p.id} href={`/dashboard/para/projects/${p.id}`} className="flex items-center justify-between text-sm hover:underline">
                <span className="text-foreground/80">{p.title}</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs">
                  {d === null ? "" : d < 0 ? `${Math.abs(d)}h lewat` : d === 0 ? "Hari ini!" : `${d}h lagi`}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Projects */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Project Aktif
            </h2>
            <Link href="/dashboard/para/projects" className="text-xs text-primary hover:underline font-semibold">
              Lihat semua →
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border/50 p-10 text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">Belum ada project aktif</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Klik Capture untuk mulai</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProjects.map((p) => (
                <ParaProjectCard key={p.id} project={p} onUpdate={fetchData} compact />
              ))}
              {slotsUsed < 5 && (
                <button
                  onClick={() => setCaptureOpen(true)}
                  className="rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-semibold">Tambah project</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Today Tasks */}
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-income" />
              Yang perlu dikerjakan
            </h2>
            <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Semua bersih! 🎉</p>
              ) : (
                todayTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/dashboard/para/projects/${task.projectId}`}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-muted/40 transition-colors group"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-border/50 shrink-0 mt-0.5 group-hover:border-primary/50 transition-colors" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">{task.projectTitle}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Areas Overview */}
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              Area
            </h2>
            {areas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/40 p-6 text-center">
                <p className="text-sm text-muted-foreground">Belum ada area</p>
                <Link href="/dashboard/para/areas" className="text-xs text-primary hover:underline mt-1 block">Tambah area →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {areas.slice(0, 4).map((area) => {
                  const areaProjects = activeProjects.filter((p) => p.area_id === area.id);
                  return (
                    <div key={area.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-border/30 bg-card">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color }} />
                        <span className="text-sm font-medium text-foreground">{area.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{areaProjects.length} project</span>
                    </div>
                  );
                })}
                <Link href="/dashboard/para/areas" className="block text-xs text-primary text-center hover:underline pt-1">
                  Kelola area →
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Navigasi Cepat</p>
            {[
              { href: "/dashboard/para/resources", icon: BookOpen, label: "Resource Library" },
              { href: "/dashboard/para/archive", icon: Archive, label: "Arsip" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
