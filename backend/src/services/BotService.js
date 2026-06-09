import * as userRepo from "../repositories/UserRepository.js";
import * as projectRepo from "../repositories/ProjectRepository.js";
import * as likeRepo from "../repositories/LikeRepository.js";
import * as commentRepo from "../repositories/CommentRepository.js";
import * as followRepo from "../repositories/FollowRepository.js";
import * as notificationService from "./NotificationService.js";

const DEFAULT_INTERVAL_MS = 3 * 60 * 1000;
const DEFAULT_ACTIONS_PER_TICK = 3;

const commentPool = [
  "Curti a direção. A proposta está ficando bem clara.",
  "Boa evolução. Eu testaria uma versão menor só para validar rápido.",
  "Esse projeto tem potencial. A apresentação visual já ajuda bastante.",
  "Gostei do recorte. Talvez valha mostrar o problema antes da solução.",
  "Ficou interessante. Se abrir o repositório, dá para contribuir em uma issue.",
  "A ideia está boa. Eu adicionaria um exemplo de uso no README.",
  "Muito bom ver o progresso. A próxima etapa poderia ser um protótipo navegável.",
  "Isso resolve uma dor real. Mandaria bem colocar métricas ou resultados iniciais.",
  "Gostei da stack. Parece um bom caso para colaboração.",
  "Feedback rápido: deixaria o link principal mais evidente para quem chegar agora.",
];

let botTimer = null;
let botStartTimer = null;
let isRunningTick = false;

export async function startBotSimulation() {
  if (process.env.ENABLE_BOTS === "false" || botTimer || botStartTimer) {
    return;
  }

  await userRepo.markArcanjoSeedUsersAsBots();

  const intervalMs = Number(process.env.BOT_INTERVAL_MS || DEFAULT_INTERVAL_MS);
  const firstRunDelayMs = Number(process.env.BOT_FIRST_RUN_DELAY_MS || 15000);

  botStartTimer = setTimeout(() => {
    botStartTimer = null;
    runBotInteractionTick();

    botTimer = setInterval(runBotInteractionTick, intervalMs);
    botTimer.unref?.();
  }, firstRunDelayMs);

  botStartTimer.unref?.();
}

export function stopBotSimulation() {
  if (botStartTimer) {
    clearTimeout(botStartTimer);
    botStartTimer = null;
  }

  if (botTimer) {
    clearInterval(botTimer);
    botTimer = null;
  }
}

export async function runBotInteractionTick() {
  if (isRunningTick) return;

  isRunningTick = true;

  try {
    const [bots, projects, users] = await Promise.all([
      userRepo.findBots(50),
      projectRepo.findAll(),
      userRepo.getAll(100, 0),
    ]);

    if (!bots.length || !projects.length) return;

    const actionsPerTick = Number(process.env.BOT_ACTIONS_PER_TICK || DEFAULT_ACTIONS_PER_TICK);

    for (let index = 0; index < actionsPerTick; index += 1) {
      const bot = pickRandom(bots);
      const action = pickRandom(["like", "comment", "follow", "like", "comment"]);

      if (action === "follow") {
        await botFollowUser(bot, users);
      } else {
        await botInteractWithProject(bot, projects, action);
      }
    }
  } catch (err) {
    console.error("Erro ao simular interação de bots:", err.message || err);
  } finally {
    isRunningTick = false;
  }
}

async function botInteractWithProject(bot, projects, action) {
  const candidates = projects.filter((project) => Number(project.user_id) !== Number(bot.id));
  const project = pickRandom(candidates);

  if (!project) return;

  if (action === "like") {
    await botLikeProject(bot, project);
    return;
  }

  await botCommentProject(bot, project);
}

async function botLikeProject(bot, project) {
  const existingLike = await likeRepo.findByUserAndProject(bot.id, project.id);
  if (existingLike) return;

  await likeRepo.create(bot.id, project.id);
  project.likes_count = Number(project.likes_count || 0) + 1;
  await projectRepo.save(project);

  await notifyProjectOwner(project, bot, "like", `${bot.full_name || bot.username} curtiu sua publicação.`);
}

async function botCommentProject(bot, project) {
  const existingComment = await commentRepo.findByUserAndProject(bot.id, project.id);
  if (existingComment) return;

  const content = pickRandom(commentPool);

  await commentRepo.create({
    content,
    user_id: bot.id,
    project_id: project.id,
  });

  project.comments_count = Number(project.comments_count || 0) + 1;
  await projectRepo.save(project);

  await notifyProjectOwner(project, bot, "comment", `${bot.full_name || bot.username} comentou na sua publicação.`);
}

async function botFollowUser(bot, users) {
  const candidates = users.filter((user) => Number(user.id) !== Number(bot.id));
  const target = pickRandom(candidates);

  if (!target) return;

  const existingFollow = await followRepo.find(bot.id, target.id);
  if (existingFollow) return;

  await followRepo.create(bot.id, target.id);

  await notificationService.createNotification({
    user_id: target.id,
    from_user_id: bot.id,
    type: "follow",
    message: `${bot.full_name || bot.username} começou a seguir você.`,
  });
}

async function notifyProjectOwner(project, bot, type, message) {
  if (!project.user_id || Number(project.user_id) === Number(bot.id)) return;

  await notificationService.createNotification({
    user_id: project.user_id,
    from_user_id: bot.id,
    type,
    project_id: project.id,
    message,
  });
}

function pickRandom(items) {
  if (!Array.isArray(items) || !items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}
