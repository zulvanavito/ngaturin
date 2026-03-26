"use client";

import { ParaResource, getDaysSinceAccess } from "@/lib/para-types";
import { FileText, Lightbulb, BookOpen, Tag, Clock, Archive } from "lucide-react";

interface ParaResourceCardProps {
  resource: ParaResource;
  onEdit?: (resource: ParaResource) => void;
  onArchive?: (resource: ParaResource) => void;
  onClick?: (resource: ParaResource) => void;
}

const typeConfig = {
  Article: { icon: BookOpen, color: "#6B93D6", label: "Artikel" },
  Idea: { icon: Lightbulb, color: "#F5C89A", label: "Ide" },
  Note: { icon: FileText, color: "#85DABB", label: "Catatan" },
};

export function ParaResourceCard({ resource, onEdit, onArchive, onClick }: ParaResourceCardProps) {
  const config = typeConfig[resource.type] ?? typeConfig.Note;
  const { icon: TypeIcon, color, label } = config;
  const daysSince = getDaysSinceAccess(resource.last_accessed_at);
  const isDecaying = daysSince >= 30;
  const areaColor = resource.para_areas?.color;

  return (
    <div
      onClick={() => onClick?.(resource)}
      className={`group rounded-2xl border bg-card shadow-sm p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
        isDecaying ? "border-amber-400/40 dark:border-amber-500/30" : "border-border/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <TypeIcon className="w-4 h-4" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug">{resource.title}</h3>
            {isDecaying && (
              <span className="shrink-0 text-[10px] bg-amber-400/15 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {daysSince}h
              </span>
            )}
          </div>

          {/* Type & Area badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
              {label}
            </span>
            {resource.para_areas && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${areaColor}20`, color: areaColor }}>
                {resource.para_areas.name}
              </span>
            )}
          </div>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {resource.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{resource.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions (hover) */}
      <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(resource); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Edit
          </button>
        )}
        {onArchive && !resource.is_archived && (
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(resource); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <Archive className="w-3 h-3" />
            Arsipkan
          </button>
        )}
      </div>
    </div>
  );
}
