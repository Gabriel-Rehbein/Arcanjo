import pkg from "pg";
import dotenv from "dotenv";

const { Client } = pkg;

dotenv.config();

async function resetDatabase() {
  const client = new Client({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "senacrs",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "arcanjo",
  });

  try {
    console.log("🔥 Conectando ao banco de dados...");
    await client.connect();

    console.log("⚠️  Deletando todas as tabelas...");
    
    // Dropar tabelas em ordem de dependência
    const queries = [
      "DROP TABLE IF EXISTS messages CASCADE",
      "DROP TABLE IF EXISTS saves CASCADE",
      "DROP TABLE IF EXISTS stories CASCADE",
      "DROP TABLE IF EXISTS notifications CASCADE",
      "DROP TABLE IF EXISTS follows CASCADE",
      "DROP TABLE IF EXISTS comments CASCADE",
      "DROP TABLE IF EXISTS likes CASCADE",
      "DROP TABLE IF EXISTS projects CASCADE",
      "DROP TABLE IF EXISTS users CASCADE",
    ];

    for (const query of queries) {
      await client.query(query);
      console.log(`✅ ${query}`);
    }

    console.log("✅ Todas as tabelas foram deletadas");
    console.log("✅ Banco de dados resetado com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao resetar banco de dados:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
