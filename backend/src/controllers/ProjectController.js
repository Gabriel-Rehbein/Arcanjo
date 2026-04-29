import * as service from "../services/ProjectService.js";

const USER_ID_TESTE = 1;

export async function getAll(req, res, next) {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = await service.create(req.body, USER_ID_TESTE);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) return res.json([]);

    const projects = await service.search(query);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getFeed(req, res, next) {
  try {
    const data = await service.getFeed(USER_ID_TESTE);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getExplore(req, res, next) {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getByCategory(req, res, next) {
  try {
    const data = await service.getByCategory(req.params.category);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getTrending(req, res, next) {
  try {
    const projects = await service.getAll();

    const sorted = projects.sort(
      (a, b) => (b.likes_count || 0) - (a.likes_count || 0)
    );

    res.json(sorted.slice(0, 20));
  } catch (err) {
    next(err);
  }
}

export async function getSaved(req, res, next) {
  try {
    const projects = await service.getSaved(USER_ID_TESTE, req.query.category);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function likeProject(req, res, next) {
  try {
    const result = await service.likeProject(req.params.id, USER_ID_TESTE);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function saveProject(req, res, next) {
  try {
    const result = await service.saveProject(req.params.id, USER_ID_TESTE);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const result = await service.deleteProject(req.params.id, 1);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProjectComments(req, res, next) {
  try {
    const comments = await service.getProjectComments(req.params.id);
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

export async function createProjectComment(req, res, next) {
  try {
    const comment = await service.createProjectComment(req.params.id, req.body, 1);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}