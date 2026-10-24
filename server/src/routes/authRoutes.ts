import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { AuthService } from '../services/authService.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';
import { validate } from '../validation/validate.js';

export function authRoutes(auth: AuthService, requireAuth: RequestHandler): Router {
  const router = Router();

  router.post('/register', async (req, res) => {
    const input = validate(registerSchema, req.body);
    res.status(201).json(await auth.register(input));
  });

  router.post('/login', async (req, res) => {
    const input = validate(loginSchema, req.body);
    res.json(await auth.login(input));
  });

  router.get('/me', requireAuth, async (req, res) => {
    res.json({ user: await auth.getUser(req.auth!.id) });
  });

  return router;
}
