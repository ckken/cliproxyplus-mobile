export type ApiEnvelope<T> = {
  code: number;
  message?: string;
  reason?: string;
  data?: T;
};

export type ManagementOverview = {
  usage: unknown;
  config: Record<string, unknown>;
  latestVersion: unknown;
};

export type AuthStatus = Record<string, unknown>;

export type ConfigSummary = Record<string, unknown>;

export type ApiKeyCollection = unknown;
