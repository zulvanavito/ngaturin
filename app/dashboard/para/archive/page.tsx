"use client";

import { useState, useEffect, useCallback } from "react";
import { ParaProject, ParaResource } from "@/lib/para-types";
import { ParaResourceCard } from "@/components/para-resource-card";
import { ParaGuidanceBanner } from "@/components/para-guidance-banner";
import { Archive, Briefcase, RotateCcw, Trash2 } from "lucide-react";

export default function ParaArchivePage() {
  const [projects, setProjects] = useState<ParaProject[]>([]);
  const [resources, setResources] = useState<ParaResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"projects" | "resources">("projects");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    const [projRes, resRes] = await Promise.all([
      fetch("/api/para/projects?status=archived"),
      fetch("/api/para/resources?archived=true"),
    ]);
    const [projData, resData] = await Promise.all([projRes.json(), resRes.json()]);
    setProjects(Array.isArray(projData) ? projData : []);
    setResources(Array.isArray(resData) ? resData : []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRestoreProject = async (id: string) => {
    await fetch(`/api/para/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    fetchData();
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Hapus project ini secara permanen?")) return;
    await fetch(`/api/para/projects/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleRestoreResource = async (resource: ParaResource) => {
    await fetch(`/api/para/resources/${resource.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_archived: false }),
    });
    fetchData();
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.outcome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.content ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2.5">
          <Archive className="w-6 h-6 text-muted-foreground" />
          Arsip
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Project selesai dan resource yang diarsipkan</p>
      </div>

      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cari arsip..."
        className="w-full text-sm bg-muted/40 rounded-xl px-4 py-3 outline-none border border-border/40 focus:border-primary/50 transition-colors"
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-muted/30 border border-border/40 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setTab("projects")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${tab === "projects" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Briefcase className="w-4 h-4" />
          Projects ({filteredProjects.length})
        </button>
        <button
          onClick={() => setTab("resources")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${tab === "resources" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Archive className="w-4 h-4" />
          Resources ({filteredResources.length})
        </button>
      </div>

      {/* Guidance Banner */}
      <ParaGuidanceBanner
        title="Arsip bukan tempat sampah."
        description="Ini adalah memori jangka panjang kamu. Project yang sudah selesai dan resource yang di-non-aktifkan tersimpan di sini — tetap bisa dicari dan dipulihkan kapan saja."
        tips={[
          "Hover kartu project untuk opsi 'Aktifkan' (kembalikan ke aktif) atau hapus permanen",
          "Lakukan review arsip setiap bulan — hapus yang tidak relevan",
        ]}
        dismissKey="archive_guide"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />)}
        </div>
      ) : tab === "projects" ? (
        filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Archive className="w-14 h-14 text-muted-foreground/20" />
            <p className="font-semibold text-muted-foreground">Belum ada project diarsipkan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/30 bg-card hover:border-border/60 transition-all group">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {project.para_areas && (
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.para_areas.color }} />
                    )}
                    <p className="font-semibold text-foreground text-sm truncate">{project.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{project.outcome}</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">
                    Diarsipkan · {new Date(project.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestoreProject(project.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    title="Kembalikan ke aktif"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Aktifkan
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-expense/60 hover:text-expense transition-colors"
                    title="Hapus permanen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Archive className="w-14 h-14 text-muted-foreground/20" />
            <p className="font-semibold text-muted-foreground">Belum ada resource diarsipkan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="relative group">
                <ParaResourceCard resource={resource} />
                <button
                  onClick={() => handleRestoreResource(resource)}
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold text-primary bg-card px-2 py-1 rounded-lg border border-border/40 shadow-sm"
                >
                  <RotateCcw className="w-3 h-3" /> Pulihkan
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
