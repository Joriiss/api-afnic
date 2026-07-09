import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { domainsRouter } from './routes/domains.js';
import { healthRouter } from './routes/health.js';

const app = express();

app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(
  session({
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

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
  if (config.mockAfnic) {
    console.log('MOCK_AFNIC=true — using simulated domain check responses');
  } else {
    console.log('Log in through the app with your AFNIC username and password');
  }
});
