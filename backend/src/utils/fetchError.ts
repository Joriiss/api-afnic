export function formatFetchError(error: unknown, context: string): Error {
  if (!(error instanceof Error)) {
    return new Error(context);
  }

  const message = error.message.toLowerCase();
  const isNetworkFailure =
    message === 'fetch failed' ||
    message === 'failed to fetch' ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('etimedout');

  if (isNetworkFailure) {
    return new Error(`${context} (${error.message})`);
  }

  return error;
}
