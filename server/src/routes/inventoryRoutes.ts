import { Router, type RequestHandler } from 'express';
import { requireRole } from '../middleware/authenticate.js';
import type { InventoryService } from '../services/inventoryService.js';
import { purchaseSchema, restockSchema } from '../validation/schemas.js';
import { validate } from '../validation/validate.js';
import { vehicleId } from './vehicleRoutes.js';

/** Stock endpoints, mounted under /api/vehicles ahead of the catalogue routes. */
export function inventoryRoutes(inventory: InventoryService, requireAuth: RequestHandler): Router {
  const router = Router();

  router.get('/stats', requireAuth, async (_req, res) => {
    res.json({ stats: await inventory.stats() });
  });

  router.post('/:id/purchase', requireAuth, async (req, res) => {
    const id = vehicleId(req);
    const { quantity } = validate(purchaseSchema, req.body ?? {});
    res.json(await inventory.purchase(id, req.auth!.id, quantity));
  });

  router.post('/:id/restock', requireAuth, requireRole('admin'), async (req, res) => {
    const id = vehicleId(req);
    const { quantity } = validate(restockSchema, req.body ?? {});
    res.json({ vehicle: await inventory.restock(id, quantity) });
  });

  return router;
}

export function purchaseRoutes(inventory: InventoryService, requireAuth: RequestHandler): Router {
  const router = Router();

  router.get('/', requireAuth, async (req, res) => {
    res.json({ purchases: await inventory.purchasesFor(req.auth!.id) });
  });

  return router;
}
