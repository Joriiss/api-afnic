interface KeycloakErrorBody {
  error?: string;
  error_description?: string;
}

export function formatAuthError(status: number, rawBody: string): string {
  let parsed: KeycloakErrorBody | null = null;

  try {
    parsed = JSON.parse(rawBody) as KeycloakErrorBody;
  } catch {
    parsed = null;
  }

  const errorCode = parsed?.error;
  const description = parsed?.error_description;

  if (errorCode === 'invalid_grant') {
    return [
      'Identifiants refusés par AFNIC.',
      "Vérifiez votre identifiant et mot de passe pour l'environnement configuré (sandbox ou production).",
      "En sandbox, les identifiants peuvent différer de l'extranet production.",
      'Contactez AFNIC si vous n’avez pas reçu de compte API dédié.',
    ].join(' ');
  }

  if (errorCode === 'invalid_client') {
    return [
      'Client OAuth invalide.',
      'Le client attendu est `registrars-api-client` (voir les exemples AFNIC).',
      description ?? rawBody,
    ].join(' ');
  }

  if (description) {
    return `Échec de l'authentification (${status}) : ${description}`;
  }

  return `Échec de l'authentification (${status}) : ${rawBody}`;
}
