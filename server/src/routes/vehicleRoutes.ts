import { Router, type Request, type RequestHandler } from 'express';
import { NotFoundError } from '../errors.js';
import { requireRole } from '../middleware/authenticate.js';
import type { VehicleService } from '../services/vehicleService.js';
import {
  createVehicleSchema,
  idParamSchema,
  searchVehiclesSchema,
  updateVehicleSchema
} from '../validation/schemas.js';
import { validate } from '../validation/validate.js';

/** A malformed id can never match a row, so it is reported as "not found" rather than a 400. */
export function vehicleId(req: Request): string {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) throw new NotFoundError('Vehicle not found');
  return parsed.data.id;
}

export function vehicleRoutes(vehicles: VehicleService, requireAuth: RequestHandler): Router {
  const router = Router();
  const adminOnly = requireRole('admin');

  router.use(requireAuth);

  router.get('/', async (_req, res) => {
    res.json({ vehicles: await vehicles.list() });
  });

  // Declared before "/:id" so "search" is not mistaken for an id.
  router.get('/search', async (req, res) => {
    const filters = validate(searchVehiclesSchema, req.query);
    res.json({ vehicles: await vehicles.search(filters) });
  });

  router.get('/:id', async (req, res) => {
    res.json({ vehicle: await vehicles.get(vehicleId(req)) });
  });

  router.post('/', adminOnly, async (req, res) => {
    const input = validate(createVehicleSchema, req.body);
    res.status(201).json({ vehicle: await vehicles.create(input) });
  });

  router.put('/:id', adminOnly, async (req, res) => {
    const id = vehicleId(req);
    const changes = validate(updateVehicleSchema, req.body);
    res.json({ vehicle: await vehicles.update(id, changes) });
  });

  router.delete('/:id', adminOnly, async (req, res) => {
    await vehicles.remove(vehicleId(req));
    res.status(204).end();
  });

  return router;
}
