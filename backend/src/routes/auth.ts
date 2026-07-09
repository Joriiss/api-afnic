import { Router } from 'express';
import { clearSessionUser, getSessionUser } from '../auth/session.js';
import { config } from '../config.js';
import { registerContactWithAfnic } from '../services/contactService.js';
import { hashPassword, verifyPassword } from '../users/password.js';
import { createUser, findUserByEmail, toPublicProfile } from '../users/store.js';
import { validateRegisterInput } from '../users/validation.js';

export const authRouter = Router();

authRouter.get('/status', (req, res) => {
  const user = getSessionUser(req);

  res.json({
    authenticated: Boolean(user),
    email: user?.email,
    contactName: user?.contactName,
    afnicClientId: user?.afnicClientId,
    mockAfnic: config.mockAfnic,
    environment: config.afnicEnvironment,
    environmentLabel: config.afnicEnvironmentLabel,
  });
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

    req.session.user = {
      userId: user.id,
      email: user.email,
      afnicClientId: user.afnicClientId,
      contactName: user.contactName,
    };

    res.status(201).json({
      authenticated: true,
      user: toPublicProfile(user),
      mockAfnic: config.mockAfnic,
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

    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'E-mail ou mot de passe incorrect' });
      return;
    }

    req.session.user = {
      userId: user.id,
      email: user.email,
      afnicClientId: user.afnicClientId,
      contactName: user.contactName,
    };

    res.json({
      authenticated: true,
      user: toPublicProfile(user),
      mockAfnic: config.mockAfnic,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Échec de la connexion';
    res.status(500).json({ error: message });
  }
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
