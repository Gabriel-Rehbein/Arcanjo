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