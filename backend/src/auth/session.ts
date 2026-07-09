import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import type { SessionAuth } from './types.js';

declare module 'express-session' {
  interface SessionData {
    auth?: SessionAuth;
  }
}

export function getSessionAuth(req: Request): SessionAuth | null {
  const auth = req.session.auth;

  if (!auth) {
    return null;
  }

  if (Date.now() >= auth.expiresAt) {
    req.session.auth = undefined;
    return null;
  }

  return auth;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (config.mockAfnic) {
    next();
    return;
  }

  const auth = getSessionAuth(req);

  if (!auth) {
    res.status(401).json({
      error: 'Authentification requise. Connectez-vous avec votre identifiant et mot de passe AFNIC.',
    });
    return;
  }

  next();
}

export function clearSessionAuth(req: Request): void {
  req.session.auth = undefined;
}
