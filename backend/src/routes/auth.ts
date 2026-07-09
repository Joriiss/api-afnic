import { Router } from 'express';
import { config } from '../config.js';
import { clearSessionAuth, getSessionAuth } from '../auth/session.js';
import { requestAccessToken } from '../auth/tokenService.js';

export const authRouter = Router();

authRouter.get('/status', (req, res) => {
  const auth = getSessionAuth(req);

  res.json({
    authenticated: Boolean(auth),
    username: auth?.username,
    expiresAt: auth?.expiresAt,
    mockAfnic: config.mockAfnic,
    environment: config.afnicEnvironment,
    environmentLabel: config.afnicEnvironmentLabel,
    keycloakTokenUrl: config.keycloakTokenUrl,
  });
});

authRouter.post('/login', async (req, res) => {
  try {
    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');

    if (!username || !password) {
      res.status(400).json({ error: "L'identifiant et le mot de passe sont obligatoires" });
      return;
    }

    if (config.mockAfnic) {
      req.session.auth = {
        username,
        accessToken: 'mock-token',
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };

      res.json({
        authenticated: true,
        username,
        expiresAt: req.session.auth.expiresAt,
        mockAfnic: true,
      });
      return;
    }

    const token = await requestAccessToken({
      username,
      password,
    });

    req.session.auth = {
      username,
      accessToken: token.accessToken,
      expiresAt: token.expiresAt - 30_000,
    };

    res.json({
      authenticated: true,
      username,
      expiresAt: req.session.auth.expiresAt,
      mockAfnic: config.mockAfnic,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Échec de la connexion';
    res.status(401).json({ error: message });
  }
});

authRouter.post('/logout', (req, res) => {
  clearSessionAuth(req);

  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ error: 'Échec de la déconnexion' });
      return;
    }

    res.clearCookie('connect.sid');
    res.json({ authenticated: false });
  });
});
