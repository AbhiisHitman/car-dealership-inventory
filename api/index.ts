import type { IncomingMessage, ServerResponse } from 'node:http';
import { getApp } from '../server/src/server.js';

/** Vercel serverless entry point. vercel.json rewrites every /api/* request here. */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  return app(req, res);
}
