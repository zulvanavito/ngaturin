"use client";

import { ParaArea, ParaProject } from "@/lib/para-types";
import { Briefcase, ArrowRight, FolderOpen } from "lucide-react";
import Link from "next/link";

interface ParaAreaCardProps {
  area: ParaArea & { para_projects?: ParaProject[] };
  onEdit?: (area: ParaArea) => void;
}

export function ParaAreaCard({ area, onEdit }: ParaAreaCardProps) {
  const projects = area.para_projects ?? [];
  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <div
      className="rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ borderColor: `${area.color}40` }}
    >
      {/* Top accent */}
      <div className="h-1.5" style={{ backgroundColor: area.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${area.color}20` }}
            >
              <FolderOpen className="w-4.5 h-4.5" style={{ color: area.color }} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">{area.name}</h3>
              {area.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{area.description}</p>
              )}
            </div>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(area)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Edit
            </button>
          )}
        </div>

        {/* Active Projects */}
        {activeProjects.length > 0 ? (
          <div className="space-y-1.5 mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
              {activeProjects.length} Project Aktif
            </p>
            {activeProjects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/para/projects/${project.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group"
              >
                <Briefcase className="w-3 h-3 shrink-0 text-muted-foreground" />
                <span className="text-xs text-foreground/80 truncate group-hover:text-foreground">{project.title}</span>
              </Link>
            ))}
            {activeProjects.length > 3 && (
              <p className="text-[11px] text-muted-foreground pl-3">
                +{activeProjects.length - 3} project lainnya
              </p>
            )}
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Tidak ada project aktif</span>
          </div>
        )}

        <Link
          href={`/dashboard/para/areas/${area.id}`}
          className="mt-4 flex items-center gap-1 text-xs font-semibold hover:underline transition-colors"
          style={{ color: area.color }}
        >
          Lihat detail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
