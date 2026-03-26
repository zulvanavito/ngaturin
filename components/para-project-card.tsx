"use client";

import { useState } from "react";
import { ParaProject, ParaTask, getProjectProgress, getDaysUntilDeadline } from "@/lib/para-types";
import { CheckCircle2, Circle, Plus, Trash2, Archive, ArrowRight, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ParaProjectCardProps {
  project: ParaProject;
  onUpdate?: () => void;
  compact?: boolean;
}

export function ParaProjectCard({ project, onUpdate, compact = false }: ParaProjectCardProps) {
  const tasks = project.para_tasks ?? [];
  const progress = getProjectProgress(tasks);
  const daysLeft = getDaysUntilDeadline(project.deadline);
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  const areaColor = project.para_areas?.color ?? "#6366F1";

  const [newTask, setNewTask] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [localTasks, setLocalTasks] = useState<ParaTask[]>(tasks);

  const handleToggleTask = async (task: ParaTask) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_done: !t.is_done } : t))
    );
    await fetch(`/api/para/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: !task.is_done }),
    });
    onUpdate?.();
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const res = await fetch("/api/para/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: project.id, title: newTask.trim() }),
    });
    if (res.ok) {
      const created = await res.json();
      setLocalTasks((prev) => [...prev, created]);
      setNewTask("");
      setIsAddingTask(false);
      onUpdate?.();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/para/tasks/${taskId}`, { method: "DELETE" });
    onUpdate?.();
  };

  const handleArchive = async () => {
    await fetch(`/api/para/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    onUpdate?.();
  };

  const doneTasks = localTasks.filter((t) => t.is_done).length;
  const localProgress = localTasks.length > 0 ? Math.round((doneTasks / localTasks.length) * 100) : 0;

  if (compact) {
    return (
      <Link
        href={`/dashboard/para/projects/${project.id}`}
        className="block group p-4 rounded-2xl border border-border/40 bg-card hover:border-border/70 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: areaColor }} />
            <h3 className="font-semibold text-foreground text-sm truncate">{project.title}</h3>
          </div>
          {isOverdue && (
            <span className="shrink-0 text-[10px] bg-expense/15 text-expense font-bold px-2 py-0.5 rounded-full">Lewat deadline</span>
          )}
          {isUrgent && !isOverdue && (
            <span className="shrink-0 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
              {daysLeft === 0 ? "Hari ini" : `${daysLeft}h lagi`}
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${localProgress}%`, backgroundColor: areaColor }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">{doneTasks}/{localTasks.length} tasks</span>
          <span className="text-[11px] text-muted-foreground font-semibold">{localProgress}%</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: areaColor }} />
            <h3 className="font-bold text-foreground truncate">{project.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isOverdue && (
              <span className="text-[10px] bg-expense/15 text-expense font-bold px-2 py-0.5 rounded-full">Lewat</span>
            )}
            {isUrgent && !isOverdue && (
              <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                {daysLeft === 0 ? "Hari ini!" : `${daysLeft}h lagi`}
              </span>
            )}
          </div>
        </div>

        {/* Outcome */}
        <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1.5">
          <Target className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/60" />
          {project.outcome}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          {project.para_areas && (
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ backgroundColor: `${areaColor}20`, color: areaColor }}
            >
              {project.para_areas.name}
            </span>
          )}
          {project.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(project.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground/70">Progress</span>
            <span className="text-xs font-bold" style={{ color: areaColor }}>{localProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${localProgress}%`, backgroundColor: areaColor }}
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="px-5 pb-2">
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {localTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 group/task py-1">
              <button onClick={() => handleToggleTask(task)} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                {task.is_done
                  ? <CheckCircle2 className="w-4 h-4 text-income" />
                  : <Circle className="w-4 h-4" />
                }
              </button>
              <span className={`text-sm flex-1 ${task.is_done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                {task.title}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover/task:opacity-100 transition-opacity text-muted-foreground/50 hover:text-expense"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add task */}
        {isAddingTask ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              autoFocus
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") setIsAddingTask(false); }}
              placeholder="Nama task..."
              className="flex-1 text-sm bg-muted/50 rounded-lg px-3 py-1.5 outline-none border border-border/40 focus:border-primary/50"
            />
            <Button size="sm" onClick={handleAddTask} className="h-8 text-xs px-3">Tambah</Button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah task
          </button>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 mt-2">
        <button
          onClick={handleArchive}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Archive className="w-3.5 h-3.5" />
          Arsipkan
        </button>
        <Link
          href={`/dashboard/para/projects/${project.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Detail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
