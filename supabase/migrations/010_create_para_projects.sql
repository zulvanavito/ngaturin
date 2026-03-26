-- PARA: Projects (Active work with clear outcome & deadline)
CREATE TABLE IF NOT EXISTS public.para_projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id     UUID REFERENCES public.para_areas(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  outcome     TEXT NOT NULL,
  deadline    DATE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.para_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.para_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.para_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.para_projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.para_projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_para_projects_updated_at
  BEFORE UPDATE ON public.para_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_para_projects_user_id ON public.para_projects(user_id);
CREATE INDEX idx_para_projects_area_id ON public.para_projects(area_id);
CREATE INDEX idx_para_projects_status ON public.para_projects(status);
