import type { Request, Response, NextFunction } from 'express';
import { resolveAfnicRuntime, type AfnicRuntime } from '../afnic/runtime.js';
import { config } from '../config.js';
import type { AfnicEnvironment } from '../config/environments.js';
import type { StoredUser } from '../users/types.js';
import type { SessionUser } from './types.js';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

export function buildSessionUser(user: StoredUser, environment?: AfnicEnvironment): SessionUser {
  const afnicEnvironment = user.isAdmin ? (environment ?? config.afnicEnvironment) : config.afnicEnvironment;

  return {
    userId: user.id,
    email: user.email,
    afnicClientId: user.afnicClientId,
    contactName: user.contactName,
    isAdmin: user.isAdmin,
    afnicEnvironment,
  };
}

export function getSessionUser(req: Request): SessionUser | null {
  return req.session.user ?? null;
}

export function getEffectiveAfnicEnvironment(req: Request): AfnicEnvironment {
  const user = getSessionUser(req);

  if (user?.isAdmin) {
    return user.afnicEnvironment;
  }

  return config.afnicEnvironment;
}

export function getAfnicRuntimeForRequest(req: Request): AfnicRuntime {
  return resolveAfnicRuntime(getEffectiveAfnicEnvironment(req));
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

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = getSessionUser(req);

  if (!user?.isAdmin) {
    res.status(403).json({ error: 'Accès administrateur requis' });
    return;
  }

  next();
}

export function clearSessionUser(req: Request): void {
  req.session.user = undefined;
}
