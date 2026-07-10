import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import { runMigrations } from './db/migrate.js';
import { pool } from './db/pool.js';
import { authRouter } from './routes/auth.js';
import { domainsRouter } from './routes/domains.js';
import { healthRouter } from './routes/health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const PgSession = connectPgSimple(session);

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: false,
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.sessionCookieSecure,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/domains', domainsRouter);

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  res.status(500).json({ error: message });
});

async function start(): Promise<void> {
  await runMigrations();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Backend listening on http://0.0.0.0:${config.port}`);
    if (config.mockAfnic) {
      console.log('MOCK_AFNIC=true — using simulated domain check responses');
    } else {
      console.log('Using registrar credentials from environment for AFNIC API calls');
    }
  });
}

void start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
