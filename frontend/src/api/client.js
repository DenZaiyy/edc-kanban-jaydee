const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Statuts renvoyés par un proxy lorsque l'API ne répond pas. */
const GATEWAY_ERRORS = [502, 503, 504];

/** Erreur renvoyée par l'API (ou erreur réseau), avec un message affichable. */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Appel HTTP asynchrone vers l'API, avec gestion homogène des erreurs :
 * - serveur injoignable → ApiError « NETWORK_ERROR » ;
 * - réponse 4xx / 5xx → ApiError reprenant le code et le message de l'API.
 * Une annulation (AbortController) est propagée telle quelle.
 */
export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
    );
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = payload?.error;
    if (!apiError && GATEWAY_ERRORS.includes(response.status)) {
      // Réponse du proxy (Vite en développement, reverse proxy en production) : API arrêtée.
      throw new ApiError(
        "Le serveur de l'API est indisponible. Réessayez dans quelques instants.",
        {
          status: response.status,
          code: 'SERVICE_UNAVAILABLE',
        },
      );
    }
    throw new ApiError(apiError?.message ?? `Erreur inattendue du serveur (${response.status}).`, {
      status: response.status,
      code: apiError?.code ?? 'HTTP_ERROR',
      details: apiError?.details ?? [],
    });
  }

  return payload;
}
