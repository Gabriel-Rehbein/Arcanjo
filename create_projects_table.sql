-- SQL para criar a tabela projects no Supabase
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT,
  files JSONB DEFAULT '[]'::jsonb, -- Array de arquivos [{name, size, path, uploaded_at}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar bucket para arquivos se não existir
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Políticas RLS (Row Level Security) se necessário
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only see their own projects" ON projects
--   FOR ALL USING (auth.uid()::text = user_id);