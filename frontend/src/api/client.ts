import type {
  AdminUserItem,
  AdminUsersResponse,
  AuthResponse,
  AuthStatusResponse,
  DomainCheckResponse,
  DomainRegisterResponse,
  DomainRegistrationsResponse,
  HealthResponse,
  RegisterRequest,
  UpdateProfileRequest,
  UserProfile,
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
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(
      response.ok
        ? 'Réponse invalide du serveur (JSON attendu).'
        : `Le serveur a renvoyé une erreur (${response.status}). Redémarrez le backend si la route est récente.`,
    );
  }

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Réponse invalide du serveur (JSON attendu).');
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'La requête a échoué';
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

export async function fetchProfile(): Promise<UserProfile> {
  const response = await apiFetch('/api/auth/profile');
  const data = await parseJson<{ user: UserProfile }>(response);
  return data.user;
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<AuthResponse> {
  const response = await apiFetch('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseJson<AuthResponse>(response);
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

export async function fetchMyDomainRegistrations(): Promise<DomainRegistrationsResponse> {
  const response = await apiFetch('/api/domains/registrations');
  return parseJson<DomainRegistrationsResponse>(response);
}

export async function fetchAdminUsers(): Promise<AdminUsersResponse> {
  const response = await apiFetch('/api/admin/users');
  return parseJson<AdminUsersResponse>(response);
}

export async function setAdminUserPrivilege(
  userId: string,
  isAdmin: boolean,
): Promise<AdminUserItem> {
  const response = await apiFetch(`/api/admin/users/${userId}/admin`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAdmin }),
  });

  const data = await parseJson<{ user: AdminUserItem }>(response);
  return data.user;
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await apiFetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });

  if (response.status === 204) {
    return;
  }

  await parseJson(response);
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
