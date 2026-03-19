window.resetDatabaseFull = async function () {
  if (!confirm("⚠️ Isso vai apagar tudo do banco e recriar a estrutura. Continuar?")) {
    return;
  }

  try {
    console.log("🔥 Iniciando reset completo do banco...");

    if (!window.supabase) {
      alert("Supabase não encontrado. Verifique se o script/configuração foi carregado.");
      return;
    }

    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        DROP TABLE IF EXISTS project_reports CASCADE;
        DROP TABLE IF EXISTS project_blocks CASCADE;
        DROP TABLE IF EXISTS project_saves CASCADE;
        DROP TABLE IF EXISTS project_likes CASCADE;
        DROP TABLE IF EXISTS project_comments CASCADE;
        DROP TABLE IF EXISTS project_files CASCADE;
        DROP TABLE IF EXISTS projects CASCADE;

        DROP FUNCTION IF EXISTS set_updated_at CASCADE;

        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$;

        CREATE TABLE projects (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id TEXT NOT NULL,
          author TEXT NOT NULL,
          author_avatar TEXT DEFAULT 'img/logoaba.png',
          title TEXT NOT NULL,
          description TEXT DEFAULT '',
          type TEXT DEFAULT 'Projeto',
          tag TEXT DEFAULT 'Projeto',
          demo TEXT DEFAULT '#',
          github TEXT DEFAULT '#',
          image TEXT DEFAULT 'img/logoaba.png',
          is_public BOOLEAN DEFAULT TRUE,
          likes_count INT DEFAULT 0,
          comments_count INT DEFAULT 0,
          shares_count INT DEFAULT 0,
          saves_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TRIGGER trg_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();

        INSERT INTO projects (user_id, author, title, description, tag)
        VALUES
        ('demo1', 'Gabriel', 'Sistema de Biblioteca', 'Sistema completo', 'web'),
        ('demo2', 'Marina', 'Dashboard de Vendas', 'Dashboard moderno', 'data'),
        ('demo3', 'Carlos', 'App Fitness', 'App mobile', 'mobile');
      `
    });

    if (error) {
      console.error("Erro no reset:", error);
      alert("Erro ao resetar banco: " + (error.message || "erro desconhecido"));
      return;
    }

    Object.keys(localStorage).forEach((key) => {
      if (key.includes("arcanjo") || key.includes("project")) {
        localStorage.removeItem(key);
      }
    });

    alert("✅ Banco resetado com sucesso!");
    location.reload();
  } catch (err) {
    console.error("Erro crítico:", err);
    alert("Erro crítico ao resetar o banco. Veja o console.");
  }
};