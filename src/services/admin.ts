import { adminFetch } from '@/src/lib/admin-fetch';
import type {
  AccountRefreshResult,
  AccountTodayStats,
  AccountUsageInfo,
  AdminAccountListResponse,
  ApiKeyCollection,
  AuthStatus,
  BatchRefreshResult,
  ConfigSummary,
  LatestVersionPayload,
  LogListResponse,
  ManagementOverview,
  RequestErrorLogsResponse,
  UsagePayload,
} from '@/src/types/admin';

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

// ===== 账号管理 API =====
export function getAccounts() {
  return adminFetch<AdminAccountListResponse>('/v0/management/accounts');
}

export function refreshAccount(accountId: string) {
  return adminFetch<AccountRefreshResult>(
    `/v0/management/accounts/${accountId}/refresh`,
    { method: 'POST' }
  );
}

export function batchRefreshAccounts(accountIds?: string[]) {
  return adminFetch<BatchRefreshResult>(
    '/v0/management/accounts/batch-refresh',
    { method: 'POST', body: accountIds ? JSON.stringify({ account_ids: accountIds }) : undefined }
  );
}

export function refreshOpenAIToken(refreshToken: string) {
  return adminFetch<AccountRefreshResult>(
    '/v0/management/openai/refresh-token',
    { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }
  );
}

export function getAccountUsage(accountId: string) {
  return adminFetch<AccountUsageInfo>(
    `/v0/management/accounts/${accountId}/usage`
  );
}

export function resetAccountQuota(accountId: string) {
  return adminFetch<{ status: string }>(
    `/v0/management/accounts/${accountId}/reset-quota`,
    { method: 'POST' }
  );
}

export function getAccountTodayStats(accountId: string) {
  return adminFetch<AccountTodayStats>(
    `/v0/management/accounts/${accountId}/today-stats`
  );
}
