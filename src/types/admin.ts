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

export type AuthStatus = Record<string, unknown>;

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

// ===== 账号管理 =====
export type AdminAccount = {
  id: string;
  name: string;
  platform: 'openai' | 'claude' | 'gemini' | 'sora' | string;
  type: 'api_key' | 'oauth' | 'refresh_token' | string;
  status: 'active' | 'expired' | 'cooling' | 'error' | string;
  credentials_preview?: string;
  expires_at?: string | null;
  quota_remaining?: number | null;
  quota_total?: number | null;
  last_used_at?: string | null;
  created_at?: string;
  error_message?: string | null;
  [key: string]: unknown;
};

export type AdminAccountListResponse = {
  accounts: AdminAccount[];
  total?: number;
};

export type AccountRefreshResult = {
  success: boolean;
  account_id: string;
  new_expires_at?: string;
  error?: string;
};

export type BatchRefreshResult = {
  total: number;
  success: number;
  failed: number;
  results?: AccountRefreshResult[];
};

export type QuotaWindowStats = {
  total_requests?: number;
  total_tokens?: number;
  quota_limit?: number;
  remaining?: number;
  utilization?: number;
  resets_at?: string;
  remaining_seconds?: number;
  window_stats?: {
    requests: number;
    tokens: number;
    cost: number;
  };
  [key: string]: unknown;
};

export type AccountUsageInfo = {
  five_hour: QuotaWindowStats | null;
  seven_day: QuotaWindowStats | null;
  [key: string]: unknown;
};

export type AccountTodayStats = {
  requests?: number;
  tokens?: number;
  errors?: number;
  [key: string]: unknown;
};
