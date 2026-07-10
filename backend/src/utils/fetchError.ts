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
    message.includes('etimedout') ||
    message.includes('abort') ||
    message.includes('délai dépassé');

  if (isNetworkFailure) {
    return new Error(`${context} (${error.message})`);
  }

  return error;
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Délai dépassé après ${Math.round(timeoutMs / 1000)}s`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
