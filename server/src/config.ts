/**
 * Runtime configuration, read once from environment variables.
 * Everything else in the app receives an AppConfig instead of touching process.env directly.
 */
export interface AdminSeed {
  email: string;
  password: string;
  name: string;
}

export interface AppConfig {
  /** Postgres connection string. When absent the embedded PGlite database is used. */
  databaseUrl: string | undefined;
  /** Directory for the embedded PGlite database. Undefined means an in-memory database (tests only). */
  dataDir: string | undefined;
  jwtSecret: string;
  jwtExpiresIn: string;
  port: number;
  corsOrigin: string | undefined;
  admin: AdminSeed | undefined;
  seedDemoData: boolean;
}

const DEV_FALLBACK_SECRET = 'dev-only-secret-change-me-before-deploying';

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const isProduction = env.NODE_ENV === 'production' || Boolean(env.VERCEL);
  const jwtSecret = env.JWT_SECRET ?? (isProduction ? undefined : DEV_FALLBACK_SECRET);
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set in production');
  }

  const admin =
    env.ADMIN_EMAIL && env.ADMIN_PASSWORD
      ? { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD, name: env.ADMIN_NAME ?? 'Administrator' }
      : undefined;

  return {
    databaseUrl: env.DATABASE_URL || undefined,
    dataDir: env.PGLITE_DATA_DIR ?? '.data/pglite',
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '7d',
    port: Number(env.API_PORT ?? env.PORT ?? 4000),
    corsOrigin: env.CORS_ORIGIN || undefined,
    admin,
    seedDemoData: env.SEED_DEMO_DATA !== 'false'
  };
}
