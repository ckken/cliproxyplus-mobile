import { adminFetch } from '@/src/lib/admin-fetch';
import type {
  ApiKeyCollection,
  AuthStatus,
  ConfigSummary,
  LatestVersionPayload,
  LogListResponse,
  ManagementOverview,
  RequestErrorLogDetailResponse,
  RequestErrorLogsResponse,
  UsagePayload,
} from '@/src/types/admin';
import { buildAdminRequestUrl, createAdminHeaders, getAdminRequestContext } from '@/src/lib/admin-fetch';

export async function getOverview(): Promise<ManagementOverview> {
  const [usage, config, latestVersion] = await Promise.all([
    adminFetch<UsagePayload>('/v0/management/usage'),
    adminFetch<ConfigSummary>('/v0/management/config'),
    adminFetch<LatestVersionPayload>('/v0/management/latest-version'),
  ]);
  return { usage, config, latestVersion };
}

export function getManagementConfig() {
  return adminFetch<ConfigSummary>('/v0/management/config');
}

export function getAuthStatus() {
  return adminFetch<AuthStatus>('/v0/management/get-auth-status');
}

export function getClaudeKeys() {
  return adminFetch<ApiKeyCollection>('/v0/management/claude-api-key');
}

export function getCodexKeys() {
  return adminFetch<ApiKeyCollection>('/v0/management/codex-api-key');
}

export function getGeminiKeys() {
  return adminFetch<ApiKeyCollection>('/v0/management/gemini-api-key');
}

export function getGenericApiKeys() {
  return adminFetch<ApiKeyCollection>('/v0/management/api-keys');
}

export function getOpenAICompatibility() {
  return adminFetch<ApiKeyCollection>('/v0/management/openai-compatibility');
}

export function getLogs(limit = 120) {
  return adminFetch<LogListResponse>(`/v0/management/logs?limit=${limit}`);
}

export function getRequestErrorLogs() {
  return adminFetch<RequestErrorLogsResponse>('/v0/management/request-error-logs');
}

function isApiEnvelope(value: unknown): value is { code?: unknown; message?: unknown; reason?: unknown; data?: unknown } {
  return Boolean(value && typeof value === 'object' && typeof (value as { code?: unknown }).code === 'number');
}

export async function getRequestErrorLogDetail(filename: string): Promise<RequestErrorLogDetailResponse> {
  const { baseUrl } = getAdminRequestContext();
  const response = await fetch(
    buildAdminRequestUrl(baseUrl, `/v0/management/request-error-logs/${encodeURIComponent(filename)}`),
    {
      headers: createAdminHeaders(),
    },
  );

  const rawText = await response.text();
  const trimmed = rawText.trim();

  if (!trimmed) {
    if (!response.ok) {
      throw new Error(response.statusText || 'REQUEST_FAILED');
    }
    return '';
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (isApiEnvelope(parsed)) {
      if (!response.ok || parsed.code !== 0) {
        throw new Error((parsed.reason as string) || (parsed.message as string) || 'REQUEST_FAILED');
      }

      return (parsed.data ?? '') as RequestErrorLogDetailResponse;
    }

    if (!response.ok) {
      throw new Error(response.statusText || 'REQUEST_FAILED');
    }

    return parsed as RequestErrorLogDetailResponse;
  } catch {
    if (!response.ok) {
      throw new Error(trimmed || response.statusText || 'REQUEST_FAILED');
    }

    return rawText;
  }
}

async function updateBoolean(path: string, value: boolean) {
  return adminFetch<{ status: string }>(path, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

async function updateNumber(path: string, value: number) {
  return adminFetch<{ status: string }>(path, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

async function updateString(path: string, value: string) {
  return adminFetch<{ status: string }>(path, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export function updateRequestLog(value: boolean) {
  return updateBoolean('/v0/management/request-log', value);
}

export function updateDebug(value: boolean) {
  return updateBoolean('/v0/management/debug', value);
}

export function updateWebsocketAuth(value: boolean) {
  return updateBoolean('/v0/management/ws-auth', value);
}

export function updateForceModelPrefix(value: boolean) {
  return updateBoolean('/v0/management/force-model-prefix', value);
}

export function updateRequestRetry(value: number) {
  return updateNumber('/v0/management/request-retry', value);
}

export function updateMaxRetryInterval(value: number) {
  return updateNumber('/v0/management/max-retry-interval', value);
}

export function updateRoutingStrategy(value: string) {
  return updateString('/v0/management/routing/strategy', value);
}

export function updateProxyUrl(value: string) {
  return updateString('/v0/management/proxy-url', value);
}

export function updateClaudeKeys(value: unknown) {
  return adminFetch<{ status: string }>('/v0/management/claude-api-key', {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export function updateCodexKeys(value: unknown) {
  return adminFetch<{ status: string }>('/v0/management/codex-api-key', {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export function updateGeminiKeys(value: unknown) {
  return adminFetch<{ status: string }>('/v0/management/gemini-api-key', {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export function updateGenericApiKeys(value: unknown) {
  return adminFetch<{ status: string }>('/v0/management/api-keys', {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export function updateOpenAICompatibility(value: unknown) {
  return adminFetch<{ status: string }>('/v0/management/openai-compatibility', {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}
