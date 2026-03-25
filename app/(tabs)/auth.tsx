import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Linking, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProviderCard } from '@/src/components/auth-provider-card';
import { getAuthStatus } from '@/src/services/admin';
import { adminConfigState } from '@/src/store/admin-config';
import type { AuthProvider, AuthStatus } from '@/src/types/admin';

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

/**
 * Infer an auth URL for a provider when none is explicitly provided.
 * Uses the common CLIProxyAPI pattern: `${baseUrl}/v0/auth/${providerName}`.
 */
function inferAuthUrl(providerName: string): string | undefined {
  const baseUrl = adminConfigState.baseUrl?.trim().replace(/\/$/, '');
  if (!baseUrl) return undefined;
  return `${baseUrl}/v0/auth/${encodeURIComponent(providerName.toLowerCase())}`;
}

/**
 * Determine if a value indicates an authorized state.
 */
function isAuthorized(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'authorized' || lower === 'active' || lower === 'connected';
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('authorized' in obj) return isAuthorized(obj.authorized);
    if ('status' in obj) return isAuthorized(obj.status);
    if ('connected' in obj) return isAuthorized(obj.connected);
    if ('active' in obj) return isAuthorized(obj.active);
  }
  return false;
}

/**
 * Extract an auth URL from a provider value object.
 */
function extractAuthUrl(value: unknown, providerName: string): string | undefined {
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.auth_url === 'string' && obj.auth_url) return obj.auth_url;
    if (typeof obj.authUrl === 'string' && obj.authUrl) return obj.authUrl;
    if (typeof obj.url === 'string' && obj.url) return obj.url;
    if (typeof obj.authorization_url === 'string' && obj.authorization_url) return obj.authorization_url;
  }
  return inferAuthUrl(providerName);
}

/**
 * Extract last verified time from a provider value object.
 */
function extractLastVerified(value: unknown): string | undefined {
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.last_verified === 'string') return obj.last_verified;
    if (typeof obj.lastVerified === 'string') return obj.lastVerified;
    if (typeof obj.verified_at === 'string') return obj.verified_at;
    if (typeof obj.updated_at === 'string') return obj.updated_at;
    if (typeof obj.timestamp === 'string') return obj.timestamp;
  }
  return undefined;
}

/**
 * Parse an object-shaped provider entry into an AuthProvider.
 */
function parseProviderObject(name: string, value: unknown): AuthProvider {
  return {
    name,
    authorized: isAuthorized(value),
    authUrl: extractAuthUrl(value, name),
    lastVerified: extractLastVerified(value),
    raw: value,
  };
}

/**
 * Parse an array item (from providers[] or oauth[]) into an AuthProvider.
 */
function parseArrayItem(item: unknown, index: number): AuthProvider {
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    const name = typeof obj.name === 'string' ? obj.name
      : typeof obj.provider === 'string' ? obj.provider
      : typeof obj.type === 'string' ? obj.type
      : typeof obj.id === 'string' ? obj.id
      : `Provider ${index + 1}`;
    return parseProviderObject(name, obj);
  }
  return { name: `Provider ${index + 1}`, authorized: false, raw: item };
}

/**
 * Parse the AuthStatus response into a list of AuthProvider entries.
 * Handles multiple response formats gracefully.
 */
export function parseAuthProviders(data: AuthStatus | null | undefined): AuthProvider[] {
  if (!data || typeof data !== 'object') return [];

  // Pattern 1: { providers: [...] } or { oauth: [...] }
  const arrayKey = ['providers', 'oauth', 'accounts', 'auths', 'items'].find(
    (key) => Array.isArray(data[key])
  );
  if (arrayKey) {
    const arr = data[arrayKey] as unknown[];
    return arr.map((item, i) => parseArrayItem(item, i));
  }

  // Pattern 2: top-level array (shouldn't happen with Record type, but be safe)
  if (Array.isArray(data)) {
    return (data as unknown[]).map((item, i) => parseArrayItem(item, i));
  }

  // Pattern 3: { providerName: { status/authorized/... } } - object values
  // Pattern 4: { providerName: true/false } - flat boolean values
  const entries = Object.entries(data);
  if (entries.length === 0) return [];

  // Filter out meta keys that are not providers
  const metaKeys = new Set(['code', 'message', 'reason', 'status', 'version', 'timestamp', 'error']);
  const providerEntries = entries.filter(([key]) => !metaKeys.has(key));

  if (providerEntries.length === 0) return [];

  // Check if entries look like provider mappings
  const looksLikeProviders = providerEntries.some(
    ([, value]) =>
      typeof value === 'boolean' ||
      (value && typeof value === 'object' && !Array.isArray(value))
  );

  if (looksLikeProviders) {
    return providerEntries.map(([name, value]) => {
      if (typeof value === 'boolean') {
        return {
          name,
          authorized: value,
          authUrl: inferAuthUrl(name),
          raw: value,
        };
      }
      return parseProviderObject(name, value);
    });
  }

  // Fallback: unrecognized format, show as single raw card
  return [{ name: 'Auth Status', authorized: false, raw: data }];
}

function getAuthEmptyStateMessage(data: AuthStatus | null | undefined, providers: AuthProvider[]): string {
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    typeof data.status === 'string' &&
    data.status.toLowerCase() === 'ok' &&
    providers.length === 0
  ) {
    return '授权状态正常，无独立 OAuth 提供商';
  }

  return '服务端未返回任何 OAuth 提供商信息。请检查服务端配置。';
}

export default function AuthScreen() {
  const query = useQuery({ queryKey: ['auth-status'], queryFn: getAuthStatus });
  const providers = useMemo(() => parseAuthProviders(query.data), [query.data]);
  const emptyStateMessage = useMemo(
    () => getAuthEmptyStateMessage(query.data, providers),
    [providers, query.data]
  );

  const hasError = query.isError && query.error instanceof Error;
  const isEmpty = query.isSuccess && providers.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor={colors.primary}
          />
        }
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Auth</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>查看与管理 OAuth 授权状态</Text>
        </View>

        {/* Error state */}
        {hasError ? (
          <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>请求失败</Text>
            <Text selectable style={{ fontSize: 13, lineHeight: 20, color: colors.subtext }}>
              {query.error instanceof Error ? query.error.message : '未知错误'}
            </Text>
          </View>
        ) : null}

        {/* Loading state (initial only) */}
        {query.isLoading ? (
          <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: colors.subtext }}>加载中…</Text>
          </View>
        ) : null}

        {/* Empty state */}
        {isEmpty ? (
          <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 24, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, textAlign: 'center' }}>
              {emptyStateMessage}
            </Text>
            <Text style={{ fontSize: 13, color: colors.subtext, textAlign: 'center' }}>
              {emptyStateMessage === '授权状态正常，无独立 OAuth 提供商'
                ? '服务端仅返回整体状态，没有单独的 OAuth 提供商条目。'
                : '服务端未返回任何 OAuth 提供商信息。请检查服务端配置。'}
            </Text>
          </View>
        ) : null}

        {/* Provider cards */}
        {providers.map((provider, index) => (
          <AuthProviderCard key={`${provider.name}-${index}`} provider={provider} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
