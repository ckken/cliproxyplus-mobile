import { adminFetch } from '@/src/lib/admin-fetch';
import type { ApiKeyCollection, AuthStatus, ConfigSummary, ManagementOverview } from '@/src/types/admin';

export async function getOverview(): Promise<ManagementOverview> {
  const [usage, config, latestVersion] = await Promise.all([
    adminFetch<unknown>('/v0/management/usage'),
    adminFetch<Record<string, unknown>>('/v0/management/config'),
    adminFetch<unknown>('/v0/management/latest-version'),
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
