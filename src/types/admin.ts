export type ApiEnvelope<T> = {
  code: number;
  message?: string;
  reason?: string;
  data?: T;
};

export type UsageSeries = Record<string, number>;

export type UsageModelStats = {
  total_requests?: number;
  success_count?: number;
  failure_count?: number;
  total_tokens?: number;
  [key: string]: unknown;
};

export type UsageApiStats = {
  total_requests?: number;
  success_count?: number;
  failure_count?: number;
  total_tokens?: number;
  models?: Record<string, UsageModelStats>;
  [key: string]: unknown;
};

export type UsageUsagePayload = {
  total_requests?: number;
  success_count?: number;
  failure_count?: number;
  total_tokens?: number;
  apis?: Record<string, UsageApiStats>;
  requests_by_day?: UsageSeries;
  tokens_by_day?: UsageSeries;
  requests_by_hour?: UsageSeries;
  tokens_by_hour?: UsageSeries;
  [key: string]: unknown;
};

export type UsagePayload = {
  failed_requests?: number;
  usage?: UsageUsagePayload;
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
  files?: RequestErrorLogFile[];
  [key: string]: unknown;
};

export type RequestErrorLogFile = {
  name: string;
  size: number;
  modified: number;
  [key: string]: unknown;
};

export type RequestErrorLogDetailResponse =
  | string
  | {
      content?: string;
      [key: string]: unknown;
    };
