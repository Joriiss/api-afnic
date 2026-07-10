import { config } from '../config.js';
import {
  AFNIC_ENVIRONMENTS,
  resolveAfnicEnvironment,
  type AfnicEnvironment,
} from '../config/environments.js';

export interface AfnicRuntime {
  environment: AfnicEnvironment;
  environmentLabel: string;
  apiBaseUrl: string;
  tokenUrl: string;
  extranetBaseUrl: string;
}

export interface RegistrarCredentials {
  username: string;
  password: string;
}

export function resolveAfnicRuntime(environment?: string): AfnicRuntime {
  const resolved = resolveAfnicEnvironment(environment ?? config.afnicEnvironment);
  const profile = AFNIC_ENVIRONMENTS[resolved];

  return {
    environment: resolved,
    environmentLabel: profile.label,
    apiBaseUrl: profile.apiBaseUrl,
    tokenUrl: profile.tokenUrl,
    extranetBaseUrl: profile.extranetBaseUrl,
  };
}

export function getRegistrarCredentials(environment: AfnicEnvironment): RegistrarCredentials {
  if (environment === 'production') {
    return {
      username: process.env.KEYCLOAK_USERNAME_PRODUCTION ?? config.keycloakUsername,
      password: process.env.KEYCLOAK_PASSWORD_PRODUCTION ?? config.keycloakPassword,
    };
  }

  return {
    username: process.env.KEYCLOAK_USERNAME_SANDBOX ?? config.keycloakUsername,
    password: process.env.KEYCLOAK_PASSWORD_SANDBOX ?? config.keycloakPassword,
  };
}
