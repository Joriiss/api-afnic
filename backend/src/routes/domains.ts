import { Router } from 'express';
import multer from 'multer';
import { getAfnicRuntimeForRequest, getSessionUser, requireAuth } from '../auth/session.js';
import { runDomainChecks } from '../services/domainCheckService.js';
import { registerDomainForUser } from '../services/domainRegisterService.js';
import { listDomainRegistrationsByUserId } from '../registrations/store.js';
import { resolveRegistrationStatuses } from '../services/domainRegistrationStatusService.js';
import { normalizeDomainNames } from '../utils/normalizeDomains.js';
import { parseDomainsFromCsv } from '../utils/parseCsv.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const domainsRouter = Router();

domainsRouter.use(requireAuth);

domainsRouter.get('/registrations', async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
      res.status(401).json({ error: 'Connexion requise' });
      return;
    }

    const registrations = await listDomainRegistrationsByUserId(sessionUser.userId);
    const statuses = await resolveRegistrationStatuses(registrations);

    res.json({
      registrations: registrations.map((item) => ({
        id: item.id,
        domain: item.domainName,
        authInfo: item.authInfo,
        durationYears: item.durationYears,
        registeredAt: item.createdAt,
        expirationDate: item.afnicExpirationDate,
        status: statuses.get(item.id) ?? 'unknown',
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Impossible de charger vos domaines';
    res.status(500).json({ error: message });
  }
});

domainsRouter.post('/check', async (req, res) => {
  try {
    const names = req.body?.names;

    if (!Array.isArray(names) || names.length === 0) {
      res.status(400).json({ error: 'Le corps de la requête doit contenir un tableau names non vide' });
      return;
    }

    const normalized = normalizeDomainNames(names.map(String));
    const runtime = getAfnicRuntimeForRequest(req);
    const response = await runDomainChecks(normalized.valid, normalized.invalid, runtime);
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Échec de la vérification des domaines';
    const status =
      error instanceof Error && 'status' in error && (error as { status: number }).status === 401
        ? 401
        : 500;
    res.status(status).json({ error: message });
  }
});

domainsRouter.post('/check/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Un fichier CSV est requis (champ : file)' });
      return;
    }

    const content = req.file.buffer.toString('utf-8');
    const parsed = parseDomainsFromCsv(content);
    const runtime = getAfnicRuntimeForRequest(req);
    const response = await runDomainChecks(parsed.domains, parsed.invalid, runtime);

    res.json({
      ...response,
      meta: {
        ...response.meta,
        csvRows: parsed.totalRows,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Échec de la vérification CSV';
    const status =
      error instanceof Error && 'status' in error && (error as { status: number }).status === 401
        ? 401
        : 500;
    res.status(status).json({ error: message });
  }
});

domainsRouter.post('/register', async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);

    if (!sessionUser) {
      res.status(401).json({ error: 'Connexion requise' });
      return;
    }

    const domain = String(req.body?.domain ?? '').trim();

    if (!domain) {
      res.status(400).json({ error: 'Le nom de domaine est obligatoire' });
      return;
    }

    const runtime = getAfnicRuntimeForRequest(req);
    const result = await registerDomainForUser({
      userId: sessionUser.userId,
      domain,
      registrantClientId: sessionUser.afnicClientId,
      runtime,
    });

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de l'enregistrement du domaine";
    res.status(400).json({ error: message });
  }
});
