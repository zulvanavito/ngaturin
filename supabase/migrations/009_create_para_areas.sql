-- Ensure update_updated_at_column trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PARA: Areas (Long-term responsibilities)
CREATE TABLE IF NOT EXISTS public.para_areas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6366F1',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.para_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own areas"
  ON public.para_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own areas"
  ON public.para_areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own areas"
  ON public.para_areas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own areas"
  ON public.para_areas FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_para_areas_updated_at
  BEFORE UPDATE ON public.para_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_para_areas_user_id ON public.para_areas(user_id);
