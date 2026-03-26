-- PARA: Resources (Knowledge & references — read-only oriented)
CREATE TABLE IF NOT EXISTS public.para_resources (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id          UUID REFERENCES public.para_areas(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'Note' CHECK (type IN ('Article', 'Idea', 'Note')),
  content          TEXT,
  tags             TEXT[] DEFAULT '{}',
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.para_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resources"
  ON public.para_resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resources"
  ON public.para_resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON public.para_resources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON public.para_resources FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_para_resources_updated_at
  BEFORE UPDATE ON public.para_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_para_resources_user_id ON public.para_resources(user_id);
CREATE INDEX idx_para_resources_area_id ON public.para_resources(area_id);
CREATE INDEX idx_para_resources_last_accessed ON public.para_resources(last_accessed_at);
