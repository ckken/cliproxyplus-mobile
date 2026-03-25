export type ApiEnvelope<T> = {
  code: number;
  message?: string;
  reason?: string;
  data?: T;
};

export type UsagePayload = {
  usage?: {
    total_requests?: number;
    total_tokens?: number;
    failed_requests?: number;
    total_input_tokens?: number;
    total_output_tokens?: number;
    total_cache_read_tokens?: number;
    total_cost_usd?: number;
  };
  failed_requests?: number;
  [key: string]: unknown;
};

export type LatestVersionPayload = {
  'latest-version'?: string;
  [key: string]: unknown;
};

export type ManagementOverview = {
  usage: UsagePayload;
  config: ConfigSummary;
  latestVersion: LatestVersionPayload;
};

// Auth status response - structure varies by server version
// Common patterns: { providers: [...] }, { oauth: {...} }, or flat key-value pairs
export type AuthStatus = Record<string, unknown>;

// Parsed provider for UI display
export type AuthProvider = {
  name: string;
  authorized: boolean;
  authUrl?: string;
  lastVerified?: string;
  raw?: unknown; // original data for fallback display
};

export type ConfigSummary = {
  'proxy-url'?: string;
  'force-model-prefix'?: boolean;
  'request-log'?: boolean;
  debug?: boolean;
  'ws-auth'?: boolean;
  'request-retry'?: number;
  'max-retry-interval'?: number;
  routing?: {
    strategy?: string;
  };
  'usage-statistics-enabled'?: boolean;
  [key: string]: unknown;
};

export type ApiKeyCollection = Record<string, unknown>;

// Individual API key string
export type KeyEntry = string;

export type LogListResponse = {
  lines?: string[];
  'line-count'?: number;
  'latest-timestamp'?: number;
  [key: string]: unknown;
};

export type RequestErrorLogsResponse = {
  files?: Array<{
    name: string;
    size: number;
    modified: number;
  }>;
  [key: string]: unknown;
};
