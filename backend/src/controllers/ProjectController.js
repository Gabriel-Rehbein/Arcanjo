import * as service from "../services/ProjectService.js";

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
    const data = await service.create(req.body, req.user.id);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function search(req, res, next) {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.json([]);
    }

    const projects = await service.search(query);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getFeed(req, res, next) {
  try {
    const data = await service.getFeed(req.user?.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}