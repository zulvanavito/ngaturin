-- PARA: Tasks (Atomic action items within a project)
CREATE TABLE IF NOT EXISTS public.para_tasks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.para_projects(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  is_done    BOOLEAN DEFAULT FALSE,
  due_date   DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.para_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.para_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON public.para_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.para_tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.para_tasks FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_para_tasks_updated_at
  BEFORE UPDATE ON public.para_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_para_tasks_user_id ON public.para_tasks(user_id);
CREATE INDEX idx_para_tasks_project_id ON public.para_tasks(project_id);
