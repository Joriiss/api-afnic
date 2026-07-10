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

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'La requête a échoué';
    throw new Error(message);
  }

  return data as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health', fetchOptions);
  return parseJson<HealthResponse>(response);
}

export async function fetchAuthStatus(): Promise<AuthStatusResponse> {
  const response = await fetch('/api/auth/status', fetchOptions);
  return parseJson<AuthStatusResponse>(response);
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    ...fetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseJson<AuthResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    ...fetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return parseJson<AuthResponse>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    ...fetchOptions,
    method: 'POST',
  });

  await parseJson(response);
}

export async function setAfnicEnvironment(
  environment: 'sandbox' | 'production',
): Promise<AuthStatusResponse> {
  const response = await fetch('/api/auth/environment', {
    ...fetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ environment }),
  });

  return parseJson<AuthStatusResponse>(response);
}

export async function checkDomains(names: string[]): Promise<DomainCheckResponse> {
  const response = await fetch('/api/domains/check', {
    ...fetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names }),
  });

  return parseJson<DomainCheckResponse>(response);
}

export async function registerDomain(domain: string): Promise<DomainRegisterResponse> {
  const response = await fetch('/api/domains/register', {
    ...fetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });

  return parseJson<DomainRegisterResponse>(response);
}

export async function checkDomainsFromCsv(file: File): Promise<DomainCheckResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/domains/check/csv', {
    ...fetchOptions,
    method: 'POST',
    body: formData,
  });

  return parseJson<DomainCheckResponse>(response);
}
