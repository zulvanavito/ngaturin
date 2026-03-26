"use client";

import { useState, useEffect, useCallback } from "react";
import { ParaProject, ParaArea } from "@/lib/para-types";
import { ParaProjectCard } from "@/components/para-project-card";
import { ParaCaptureModal } from "@/components/para-capture-modal";
import { ParaGuidanceBanner } from "@/components/para-guidance-banner";
import { Briefcase, Archive, CheckCircle2, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterStatus = "active" | "archived";

export default function ParaProjectsPage() {
  const [projects, setProjects] = useState<ParaProject[]>([]);
  const [areas, setAreas] = useState<ParaArea[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("active");
  const [isLoading, setIsLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [projRes, areaRes] = await Promise.all([
      fetch(`/api/para/projects?status=${filter}`),
      fetch("/api/para/areas"),
    ]);
    const [projData, areaData] = await Promise.all([projRes.json(), areaRes.json()]);
    setProjects(Array.isArray(projData) ? projData : []);
    setAreas(Array.isArray(areaData) ? areaData : []);
    setIsLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeCount = projects.filter((p) => p.status === "active").length;

  const tabs: { label: string; value: FilterStatus; icon: React.FC<{ className?: string }> }[] = [
    { label: "Aktif", value: "active", icon: Briefcase },
    { label: "Arsip", value: "archived", icon: Archive },
  ];

  const groupedByArea = areas.map((area) => ({
    area,
    projects: projects.filter((p) => p.area_id === area.id),
  })).filter((g) => g.projects.length > 0);

  const noAreaProjects = projects.filter((p) => !p.area_id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <ParaCaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onSuccess={fetchData}
        areas={areas.map((a) => ({ id: a.id, name: a.name, color: a.color }))}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filter === "active" ? `${activeCount} / 5 slot aktif digunakan` : "Project yang sudah diarsipkan"}
          </p>
        </div>
        {filter === "active" && activeCount < 5 && (
          <Button
            onClick={() => setCaptureOpen(true)}
            className="gradient-primary text-white rounded-xl h-10 px-4 font-semibold hover:opacity-90 shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Project Baru
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-muted/30 border border-border/40 p-1.5 rounded-2xl w-fit">
        {tabs.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Guidance Banner */}
      {filter === "active" && (
        <ParaGuidanceBanner
          variant="info"
          title="Aturan Project PARA"
          description="Setiap project harus punya outcome yang jelas. Maksimal 5 project aktif — kualitas lebih penting dari kuantitas."
          tips={[
            "Tulis outcome sebagai hasil nyata yang bisa diukur",
            "Selesaikan atau arsipkan project lama sebelum buat baru",
            "Klik kartu project untuk mengelola tasks di dalamnya",
          ]}
          dismissKey="projects_guide"
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          {filter === "active" ? <Briefcase className="w-14 h-14 text-muted-foreground/20" /> : <Archive className="w-14 h-14 text-muted-foreground/20" />}
          <p className="font-semibold text-muted-foreground">
            {filter === "active" ? "Tidak ada project aktif" : "Belum ada arsip"}
          </p>
          {filter === "active" && (
            <Button onClick={() => setCaptureOpen(true)} variant="outline" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Buat Project Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Grouped by area */}
          {groupedByArea.map(({ area, projects: aProjects }) => (
            <div key={area.id}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                <h2 className="font-bold text-foreground">{area.name}</h2>
                <span className="text-xs text-muted-foreground">({aProjects.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aProjects.map((p) => (
                  <ParaProjectCard key={p.id} project={p} onUpdate={fetchData} />
                ))}
              </div>
            </div>
          ))}

          {/* No area projects */}
          {noAreaProjects.length > 0 && (
            <div>
              {groupedByArea.length > 0 && (
                <div className="flex items-center gap-2.5 mb-4">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <h2 className="font-bold text-foreground">Tanpa Area</h2>
                  <span className="text-xs text-muted-foreground">({noAreaProjects.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {noAreaProjects.map((p) => (
                  <ParaProjectCard key={p.id} project={p} onUpdate={fetchData} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
