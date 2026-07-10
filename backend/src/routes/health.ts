import { Router } from 'express';
import { config } from '../config.js';
import { pool } from '../db/pool.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  let database: 'ok' | 'error' = 'ok';

  try {
    await pool.query('SELECT 1');
  } catch {
    database = 'error';
  }

  res.json({
    status: database === 'ok' ? 'ok' : 'degraded',
    database,
    mockAfnic: config.mockAfnic,
    environment: config.afnicEnvironment,
    environmentLabel: config.afnicEnvironmentLabel,
    afnicApiBaseUrl: config.afnicApiBaseUrl,
    keycloakTokenUrl: config.keycloakTokenUrl,
    extranetBaseUrl: config.extranetBaseUrl,
  });
});
