import { adminConfigState } from '@/src/store/admin-config';

export type ApiEnvelope<T> = {
  code: number;
  message?: string;
  reason?: string;
  data?: T;
};

export function buildAdminRequestUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.trim().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function getAdminRequestContext() {
  const baseUrl = adminConfigState.baseUrl.trim().replace(/\/$/, '');
  const adminApiKey = adminConfigState.adminApiKey.trim();

  if (!baseUrl) throw new Error('BASE_URL_REQUIRED');
  if (!adminApiKey) throw new Error('ADMIN_API_KEY_REQUIRED');

  return { baseUrl, adminApiKey };
}

export function createAdminHeaders(initHeaders?: HeadersInit) {
  const { adminApiKey } = getAdminRequestContext();
  const headers = new Headers(initHeaders);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${adminApiKey}`);
  return headers;
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { baseUrl } = getAdminRequestContext();
  const response = await fetch(buildAdminRequestUrl(baseUrl, path), {
    ...init,
    headers: createAdminHeaders(init.headers),
  });

  const rawText = await response.text();
  let json: ApiEnvelope<T>;
  try {
    json = JSON.parse(rawText) as ApiEnvelope<T>;
  } catch {
    throw new Error('INVALID_SERVER_RESPONSE');
  }

  if (!response.ok || json.code !== 0) {
    throw new Error(json.reason || json.message || 'REQUEST_FAILED');
  }

  return json.data as T;
}
