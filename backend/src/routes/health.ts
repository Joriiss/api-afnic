import { Router } from 'express';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    mockAfnic: config.mockAfnic,
    environment: config.afnicEnvironment,
    environmentLabel: config.afnicEnvironmentLabel,
    afnicApiBaseUrl: config.afnicApiBaseUrl,
    keycloakTokenUrl: config.keycloakTokenUrl,
    extranetBaseUrl: config.extranetBaseUrl,
  });
});
