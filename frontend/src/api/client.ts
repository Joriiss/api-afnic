import type {
  AuthResponse,
  AuthStatusResponse,
  DomainCheckResponse,
  DomainRegisterResponse,
  HealthResponse,
  RegisterRequest,
} from '../types';

const fetchOptions: RequestInit = {
  credentials: 'include',
};

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...fetchOptions, ...options });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'La requête a échoué';

    if (/failed to fetch|fetch failed|networkerror/i.test(message)) {
      throw new Error(
        'Impossible de joindre le serveur. Lancez le backend avec `docker compose up -d app`, puis utilisez http://localhost:5173 (Vite) ou http://localhost:3001.',
      );
    }

    throw error instanceof Error ? error : new Error(message);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'La requête a échoué';
    throw new Error(message);
  }

  return data as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await apiFetch('/api/health');
  return parseJson<HealthResponse>(response);
}

export async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  const response = await apiFetch('/api/auth/status');
  return parseJson<AuthStatusResponse>(response);
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseJson<AuthResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return parseJson<AuthResponse>(response);
}

export async function logout(): Promise<void> {
  const response = await apiFetch('/api/auth/logout', {
    method: 'POST',
  });

  await parseJson(response);
}

export async function setAfnicEnvironment(
  environment: 'sandbox' | 'production',
): Promise<AuthStatusResponse> {
  const response = await apiFetch('/api/auth/environment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ environment }),
  });

  return parseJson<AuthStatusResponse>(response);
}

export async function checkDomains(names: string[]): Promise<DomainCheckResponse> {
  const response = await apiFetch('/api/domains/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names }),
  });

  return parseJson<DomainCheckResponse>(response);
}

export async function registerDomain(domain: string): Promise<DomainRegisterResponse> {
  const response = await apiFetch('/api/domains/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });

  return parseJson<DomainRegisterResponse>(response);
}

export async function checkDomainsFromCsv(file: File): Promise<DomainCheckResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch('/api/domains/check/csv', {
    method: 'POST',
    body: formData,
  });

  return parseJson<DomainCheckResponse>(response);
}
