import { getApp } from './server.js';
import { loadConfig } from './config.js';

/** Local development entry point: `npm run dev:api`. */
const { port, databaseUrl } = loadConfig();
const app = await getApp();

app.listen(port, () => {
  console.log(`API ready on http://localhost:${port} (${databaseUrl ? 'Postgres' : 'embedded PGlite'})`);
});
