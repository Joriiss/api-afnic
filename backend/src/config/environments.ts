export type AfnicEnvironment = 'sandbox' | 'production';

export interface AfnicEnvironmentProfile {
  apiBaseUrl: string;
  tokenUrl: string;
  extranetBaseUrl: string;
  label: string;
}

export const AFNIC_ENVIRONMENTS: Record<AfnicEnvironment, AfnicEnvironmentProfile> = {
  sandbox: {
    label: 'Sandbox',
    apiBaseUrl: 'https://api-sandbox.nic.fr',
    tokenUrl: 'https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token',
    extranetBaseUrl: 'https://extranet-sandbox.nic.fr',
  },
  production: {
    label: 'Production',
    apiBaseUrl: 'https://api.nic.fr',
    tokenUrl: 'https://login.nic.fr/auth/realms/fr/protocol/openid-connect/token',
    extranetBaseUrl: 'https://extranet.nic.fr',
  },
};

export function resolveAfnicEnvironment(value?: string): AfnicEnvironment {
  return value === 'production' ? 'production' : 'sandbox';
}
