import { Router } from 'express';
import { resolveAfnicRuntime } from '../afnic/runtime.js';
import {
  buildSessionUser,
  clearSessionUser,
  getAfnicRuntimeForRequest,
  getSessionUser,
  requireAdmin,
  requireAuth,
} from '../auth/session.js';
import { config } from '../config.js';
import { resolveAfnicEnvironment } from '../config/environments.js';
import { registerContactWithAfnic } from '../services/contactService.js';
import { hashPassword, verifyPassword } from '../users/password.js';
import { createUser, findUserByEmail, findUserById, syncAdminStatus, toPublicProfile } from '../users/store.js';
import { validateRegisterInput } from '../users/validation.js';

function buildAuthPayload(req: Parameters<typeof getSessionUser>[0], user = getSessionUser(req)) {
  const runtime = user ? getAfnicRuntimeForRequest(req) : resolveAfnicRuntime(config.afnicEnvironment);

  return {
    authenticated: Boolean(user),
    email: user?.email,
    contactName: user?.contactName,
    afnicClientId: user?.afnicClientId,
    isAdmin: user?.isAdmin ?? false,
    mockAfnic: config.mockAfnic,
    environment: runtime.environment,
    environmentLabel: runtime.environmentLabel,
    extranetBaseUrl: runtime.extranetBaseUrl,
  };
}

export const authRouter = Router();

authRouter.get('/status', async (req, res) => {
  const sessionUser = getSessionUser(req);

  if (sessionUser) {
    const storedUser = await findUserById(sessionUser.userId);

    if (storedUser) {
      const user = await syncAdminStatus(storedUser);
      req.session.user = buildSessionUser(user, sessionUser.afnicEnvironment);
    }
  }

  res.json(buildAuthPayload(req));
});

authRouter.post('/register', async (req, res) => {
  try {
    const input = validateRegisterInput(req.body);
    const existing = await findUserByEmail(input.email);

    if (existing) {
      res.status(409).json({ error: 'Un compte existe déjà avec cette adresse e-mail' });
      return;
    }

    const afnicClientId = await registerContactWithAfnic(input);
    const passwordHash = hashPassword(input.password);
    const user = await createUser(input, passwordHash, afnicClientId);

    req.session.user = buildSessionUser(user);

    res.status(201).json({
      ...buildAuthPayload(req, req.session.user),
      user: toPublicProfile(user),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Échec de l’inscription';
    const status = /existe déjà/i.test(message) ? 409 : 400;
    res.status(status).json({ error: message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!email || !password) {
      res.status(400).json({ error: "L'e-mail et le mot de passe sont obligatoires" });
      return;
    }

    const foundUser = await findUserByEmail(email);

    if (!foundUser || !verifyPassword(password, foundUser.passwordHash)) {
      res.status(401).json({ error: 'E-mail ou mot de passe incorrect' });
      return;
    }

    const user = await syncAdminStatus(foundUser);
    req.session.user = buildSessionUser(user);

    res.json({
      ...buildAuthPayload(req, req.session.user),
      user: toPublicProfile(user),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Échec de la connexion';
    res.status(500).json({ error: message });
  }
});

authRouter.post('/environment', requireAuth, requireAdmin, (req, res) => {
  const environment = resolveAfnicEnvironment(String(req.body?.environment ?? ''));

  if (!req.session.user) {
    res.status(401).json({ error: 'Session invalide' });
    return;
  }

  req.session.user = {
    ...req.session.user,
    afnicEnvironment: environment,
  };

  res.json(buildAuthPayload(req, req.session.user));
});

authRouter.post('/logout', (req, res) => {
  clearSessionUser(req);

  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ error: 'Échec de la déconnexion' });
      return;
    }

    res.clearCookie('connect.sid');
    res.json({ authenticated: false });
  });
});
