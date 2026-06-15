import 'dotenv/config';
import app from './app.js';
import { testConnection } from './config/db.js';
import { validateEnvironment } from './config/env.js';
import { seedDatabase } from './seed.js';
import { startBotSimulation, stopBotSimulation } from './services/BotService.js';

const environment = validateEnvironment();
const PORT = environment.PORT;

process.env.JWT_SECRET = environment.JWT_SECRET;

const server = app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log('Banco conectado');

    if (process.env.RUN_SEED === 'true') {
      await seedDatabase();
    }

    await startBotSimulation();
  } catch (error) {
    console.error('Erro ao iniciar banco:', error.message || error);
    process.exit(1);
  }

  console.log(`Backend rodando em http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} recebido. Encerrando servidor.`);
  stopBotSimulation();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.on('error', (error) => {
  console.error('Erro no servidor:', error);
  process.exit(1);
});
