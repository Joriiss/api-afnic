import { Router } from 'express';
import { isAdminEmail } from '../auth/admin.js';
import { getSessionUser, requireAdmin, requireAuth } from '../auth/session.js';
import {
  countAdmins,
  deleteUserById,
  findUserById,
  listUsers,
  setUserAdmin,
  toPublicProfile,
} from '../users/store.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/users', async (_req, res) => {
  try {
    const users = await listUsers();

    res.json({
      users: users.map((user) => ({
        ...toPublicProfile(user),
        protectedByConfig: isAdminEmail(user.email),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Impossible de charger les utilisateurs';
    res.status(500).json({ error: message });
  }
});

adminRouter.patch('/users/:userId/admin', async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
      res.status(401).json({ error: 'Connexion requise' });
      return;
    }

    const userId = String(req.params.userId ?? '');
    const isAdmin = Boolean(req.body?.isAdmin);
    const target = await findUserById(userId);

    if (!target) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }

    if (target.id === sessionUser.userId && !isAdmin) {
      res.status(400).json({ error: 'Vous ne pouvez pas retirer vos propres droits administrateur' });
      return;
    }

    if (isAdminEmail(target.email) && !isAdmin) {
      res.status(400).json({
        error:
          'Cet utilisateur est protégé par ADMIN_EMAILS. Retirez-le de la configuration serveur pour pouvoir lui retirer les droits.',
      });
      return;
    }

    if (target.isAdmin && !isAdmin) {
      const adminCount = await countAdmins();

      if (adminCount <= 1) {
        res.status(400).json({ error: 'Impossible de retirer le dernier administrateur' });
        return;
      }
    }

    const updated = await setUserAdmin(userId, isAdmin);

    res.json({
      user: {
        ...toPublicProfile(updated),
        protectedByConfig: isAdminEmail(updated.email),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Impossible de modifier les droits administrateur';
    res.status(400).json({ error: message });
  }
});

adminRouter.delete('/users/:userId', async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
      res.status(401).json({ error: 'Connexion requise' });
      return;
    }

    const userId = String(req.params.userId ?? '');
    const target = await findUserById(userId);

    if (!target) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }

    if (target.id === sessionUser.userId) {
      res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
      return;
    }

    if (isAdminEmail(target.email)) {
      res.status(400).json({
        error:
          'Cet utilisateur est protégé par ADMIN_EMAILS. Retirez-le de la configuration serveur pour pouvoir le supprimer.',
      });
      return;
    }

    if (target.isAdmin) {
      const adminCount = await countAdmins();

      if (adminCount <= 1) {
        res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
        return;
      }
    }

    await deleteUserById(userId);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de supprimer l'utilisateur";
    res.status(400).json({ error: message });
  }
});
