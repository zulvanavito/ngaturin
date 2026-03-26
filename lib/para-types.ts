// Shared PARA types — used across components and pages

export interface ParaArea {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  para_projects?: ParaProject[];
}

export interface ParaTask {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  is_done: boolean;
  due_date?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ParaProject {
  id: string;
  user_id: string;
  area_id?: string;
  title: string;
  outcome: string;
  deadline?: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  para_areas?: Pick<ParaArea, "id" | "name" | "color">;
  para_tasks?: ParaTask[];
}

export interface ParaResource {
  id: string;
  user_id: string;
  area_id?: string;
  title: string;
  type: "Article" | "Idea" | "Note";
  content?: string;
  tags: string[];
  last_accessed_at: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  para_areas?: Pick<ParaArea, "id" | "name" | "color">;
}

// Utility: compute progress percentage for a project
export function getProjectProgress(tasks: ParaTask[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.is_done).length;
  return Math.round((done / tasks.length) * 100);
}

// Utility: days until deadline (negative = overdue)
export function getDaysUntilDeadline(deadline?: string): number | null {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Utility: days since last accessed
export function getDaysSinceAccess(last_accessed_at: string): number {
  const now = new Date();
  const last = new Date(last_accessed_at);
  return Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}
