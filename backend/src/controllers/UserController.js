import * as userRepo from '../repositories/UserRepository.js';
import * as projectService from '../services/ProjectService.js';
import * as followService from '../services/FollowService.js';
import { assertSafeUrl } from '../utils/contentSafety.js';
import fs from 'fs';
import path from 'path';

const TEST_USER_ID = 1;
const DEFAULT_SELOS = [{ symbol: '✨', label: 'Novo membro' }];

function parseList(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function parseSealList(value) {
  const fallbackSymbol = '◆';

  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object') {
          const label = String(item.label || item.name || '').trim();
          const symbol = String(item.symbol || fallbackSymbol).trim() || fallbackSymbol;
          return label ? { symbol, label } : null;
        }

        return parseSealText(item, fallbackSymbol);
      })
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parseSealList(parsed);
      }
    } catch {
      return value
        .split(',')
        .map((item) => parseSealText(item, fallbackSymbol))
        .filter(Boolean);
    }
  }

  return [];
}

function parseSealText(value, fallbackSymbol) {
  const text = String(value || '').trim();
  if (!text) return null;

  const [first, ...rest] = text.split(/\s+/);
  const hasExplicitSymbol = first && !/[a-zA-Z0-9À-ÿ]/.test(first);
  const symbol = hasExplicitSymbol ? first : fallbackSymbol;
  const label = hasExplicitSymbol ? rest.join(' ').trim() : text;

  return label ? { symbol, label } : null;
}

function sanitizeUser(user) {
  if (!user) return null;

  const { password, ...safeUser } = user;
  void password;

  return {
    id: safeUser.id,
    username: safeUser.username,
    full_name: safeUser.full_name,
    bio: safeUser.bio,
    role: safeUser.role,
    technologies: parseList(safeUser.technologies),
    available_for_work: Boolean(safeUser.available_for_work),
    github_url: safeUser.github_url,
    linkedin_url: safeUser.linkedin_url,
    portfolio_url: safeUser.portfolio_url,
    resume_url: safeUser.resume_url,
    reputation: Number(safeUser.reputation || 0),
    selos: getUserSelos(safeUser),
    is_bot: Boolean(safeUser.is_bot),
    avatar_url: safeUser.avatar_url,
    banner_url: safeUser.banner_url,
    email: safeUser.email,
    followers_count: safeUser.followers_count || 0,
    following_count: safeUser.following_count || 0,
    created_at: safeUser.created_at,
  };
}

export async function getUserById(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!userId) return res.status(400).json({ message: 'ID inválido' });

    const user = await userRepo.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const [followers_count, following_count, userProjects] = await Promise.all([
      followService.getFollowerCount(user.id),
      followService.getFollowingCount(user.id),
      projectService.getByUserId(user.id),
    ]);
    const is_following = req.user ? await followService.isFollowing(req.user.id, user.id) : false;

    const safe = sanitizeUser(user);
    const reputation = getProfileReputation(safe, userProjects, followers_count);

    res.json({
      ...safe,
      followers_count,
      following_count,
      is_following,
      reputation,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserByUsername(req, res, next) {
  try {
    const { username } = req.params;

    const user = await userRepo.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const [followers_count, following_count, userProjects] = await Promise.all([
      followService.getFollowerCount(user.id),
      followService.getFollowingCount(user.id),
      projectService.getByUserId(user.id),
    ]);
    const is_following = req.user ? await followService.isFollowing(req.user.id, user.id) : false;

    const safe = sanitizeUser(user);
    const reputation = getProfileReputation(safe, userProjects, followers_count);

    res.json({
      ...safe,
      followers_count,
      following_count,
      is_following,
      reputation,
    });
  } catch (err) {
    next(err);
  }
}

export async function followUser(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!targetId) return res.status(400).json({ message: 'ID inválido' });

    const followerId = req.user?.id || TEST_USER_ID;

    await followService.follow(followerId, targetId);

    const followers_count = await followService.getFollowerCount(targetId);
    const following_count = await followService.getFollowingCount(followerId);
    const is_following = await followService.isFollowing(followerId, targetId);

    res.json({ success: true, followers_count, following_count, is_following });
  } catch (err) {
    next(err);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!targetId) return res.status(400).json({ message: 'ID inválido' });

    const followerId = req.user?.id || TEST_USER_ID;

    await followService.unfollow(followerId, targetId);

    const followers_count = await followService.getFollowerCount(targetId);
    const following_count = await followService.getFollowingCount(followerId);
    const is_following = await followService.isFollowing(followerId, targetId);

    res.json({ success: true, followers_count, following_count, is_following });
  } catch (err) {
    next(err);
  }
}

export async function getUserProjects(req, res, next) {
  try {
    const { username } = req.params;

    const user = await userRepo.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const projects = await projectService.getByUserId(user.id);

    res.json(projects || []);
  } catch (err) {
    next(err);
  }
}

async function enrichUserForList(user, viewerId) {
  const safe = sanitizeUser(user);
  const followers_count = await followService.getFollowerCount(user.id);
  const following_count = await followService.getFollowingCount(user.id);
  const is_following = viewerId ? await followService.isFollowing(viewerId, user.id) : false;

  return {
    ...safe,
    followers_count,
    following_count,
    is_following,
  };
}

export async function getUserFollowers(req, res, next) {
  try {
    const { username } = req.params;
    const user = await userRepo.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'UsuÃ¡rio nÃ£o encontrado' });
    }

    const followers = await followService.listFollowers(user.id);
    const viewerId = req.user?.id;
    const enriched = await Promise.all(
      followers.map((follower) => enrichUserForList(follower, viewerId))
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

export async function getUserFollowing(req, res, next) {
  try {
    const { username } = req.params;
    const user = await userRepo.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'UsuÃ¡rio nÃ£o encontrado' });
    }

    const following = await followService.listFollowing(user.id);
    const viewerId = req.user?.id;
    const enriched = await Promise.all(
      following.map((followedUser) => enrichUserForList(followedUser, viewerId))
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

export async function searchUsers(req, res, next) {
  try {
    const query = String(req.query.q || '').trim();

    if (!query) {
      return res.json([]);
    }

    const users = await userRepo.searchUsers(query);
    res.json(users.map(sanitizeUser));
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    const users = await userRepo.getAll(limit, offset);

    // enrich users with follower counts and is_following status
    const enriched = await Promise.all(
      users.map(async (u) => {
        const safe = sanitizeUser(u);
        const followers_count = await followService.getFollowerCount(u.id);
        const following_count = await followService.getFollowingCount(u.id);
        const is_following = req.user ? await followService.isFollowing(req.user.id, u.id) : false;
        return {
          ...safe,
          followers_count,
          following_count,
          is_following,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

export async function updateUserByUsername(req, res, next) {
  try {
    const { username } = req.params;
    const user = await userRepo.findByUsername(username);

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const authUserId = req.user?.id;
    if (!authUserId || Number(authUserId) !== Number(user.id)) {
      return res.status(403).json({ message: 'Não autorizado a editar este usuário' });
    }

    const {
      full_name,
      bio,
      email,
      role,
      technologies,
      available_for_work,
      github_url,
      linkedin_url,
      portfolio_url,
      resume_url,
      badges,
      selos,
      avatar_base64,
      banner_base64,
    } = req.body || {};

    const updates = {};

    if (full_name !== undefined) updates.full_name = String(full_name).slice(0, 255);
    if (bio !== undefined) updates.bio = String(bio).slice(0, 1000);
    if (email !== undefined) updates.email = String(email).slice(0, 255);
    if (role !== undefined) updates.role = String(role).slice(0, 255);
    if (technologies !== undefined)
      updates.technologies = JSON.stringify(parseList(technologies).slice(0, 30));
    if (selos !== undefined || badges !== undefined) {
      const serializedSelos = JSON.stringify(parseSealList(selos ?? badges).slice(0, 20));
      updates.selos = serializedSelos;
      updates.badges = serializedSelos;
    }
    if (available_for_work !== undefined) updates.available_for_work = Boolean(available_for_work);
    if (github_url !== undefined) updates.github_url = assertSafeUrl(github_url, 'GitHub') || null;
    if (linkedin_url !== undefined)
      updates.linkedin_url = assertSafeUrl(linkedin_url, 'LinkedIn') || null;
    if (portfolio_url !== undefined)
      updates.portfolio_url = assertSafeUrl(portfolio_url, 'Portfolio') || null;
    if (resume_url !== undefined)
      updates.resume_url = assertSafeUrl(resume_url, 'Curriculo') || null;

    // handle base64 images
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    if (avatar_base64) {
      const matches = avatar_base64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1].split('/')[1] || 'png';
        const data = matches[2];
        const filename = `avatar_${user.id}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, Buffer.from(data, 'base64'));
        updates.avatar_url = `/uploads/${filename}`;
      }
    }

    if (banner_base64) {
      const matches = banner_base64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1].split('/')[1] || 'png';
        const data = matches[2];
        const filename = `banner_${user.id}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, Buffer.from(data, 'base64'));
        updates.banner_url = `/uploads/${filename}`;
      }
    }

    const updated = await userRepo.update(user.id, updates);

    res.json(sanitizeUser(updated));
  } catch (err) {
    next(err);
  }
}

function getUserSelos(user) {
  const selos = parseSealList(user.selos || user.badges);
  return selos.length ? selos : DEFAULT_SELOS;
}

function getProfileReputation(user, projects, followersCount) {
  if (user.reputation) return user.reputation;

  const projectScore = (projects || []).reduce((total, project) => {
    return (
      total +
      Number(project.likes_count || 0) * 2 +
      Number(project.comments_count || 0) * 3 +
      Number(project.views_count || 0)
    );
  }, 0);

  return Math.round(projectScore + Number(followersCount || 0) * 5);
}
