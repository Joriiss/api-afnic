import type { Request, Response, NextFunction } from 'express';
import type { SessionUser } from './types.js';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

export function getSessionUser(req: Request): SessionUser | null {
  return req.session.user ?? null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = getSessionUser(req);

  if (!user) {
    res.status(401).json({
      error: 'Connexion requise. Créez un compte ou connectez-vous pour vérifier des domaines.',
    });
    return;
  }

  next();
}

export function clearSessionUser(req: Request): void {
  req.session.user = undefined;
}
