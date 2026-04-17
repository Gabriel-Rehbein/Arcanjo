import * as service from "../services/AuthService.js";

export async function register(req, res, next) {
  try {
    const result = await service.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const token = await service.login(req.body);
    res.json({ token });
  } catch (err) {
    next(err);
  }
}