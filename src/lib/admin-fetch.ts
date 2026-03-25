import { adminConfigState } from '@/src/store/admin-config';

export type ApiEnvelope<T> = {
  code: number;
  message?: string;
  reason?: string;
  data?: T;
};

export type AdminErrorCode = 'network' | 'dns' | 'ssl' | 'timeout' | 'auth' | 'invalid_response' | 'request_failed';

const ERROR_MESSAGES: Record<AdminErrorCode, string> = {
  network: '无法连接到服务器，请检查网络连接和服务器地址',
  dns: '域名解析失败，请检查服务器地址是否正确',
  ssl: 'SSL 证书验证失败，请检查服务器配置',
  timeout: '连接超时，请确认服务器正在运行',
  auth: '管理密码错误，请检查后重试',
  invalid_response: '服务器响应格式异常，请确认是 CLIProxyAPI Plus 服务',
  request_failed: '请求失败，请稍后重试',
};

const NETWORK_ERROR_PATTERNS = [
  /network request failed/i,
  /failed to fetch/i,
  /load failed/i,
  /fetch failed/i,
  /networkerror/i,
  /connection failed/i,
  /cannot connect/i,
  /could not connect/i,
  /connection refused/i,
  /host unreachable/i,
  /network unreachable/i,
  /econnrefused/i,
  /econnreset/i,
  /no internet connection/i,
  /disconnected/i,
  /offline/i,
  /net::err_connection_refused/i,
  /nsurlerrordomain code=-1004/i,
  /nsurlerrordomain code=-1009/i,
  /unable to establish/i,
];

const DNS_ERROR_PATTERNS = [
  /enotfound/i,
  /eai_again/i,
  /getaddrinfo failed/i,
  /dns/i,
  /name or service not known/i,
  /name resolution/i,
  /could not resolve host/i,
  /unable to resolve host/i,
  /server not found/i,
  /host not found/i,
  /domain name not found/i,
  /cannot resolve host/i,
  /unknown host/i,
  /net::err_name_not_resolved/i,
  /dns_probe_finished_nxdomain/i,
  /dns_probe_finished_no_internet/i,
  /nsurlerrordomain code=-1003/i,
];

const SSL_ERROR_PATTERNS = [
  /ssl/i,
  /tls/i,
  /certificate/i,
  /cert/i,
  /handshake/i,
  /secure connection/i,
  /untrusted/i,
  /self[- ]signed/i,
  /err_cert/i,
  /cert_path_builder/i,
  /certificate verify failed/i,
  /unable to get local issuer certificate/i,
  /sun.security.provider.certpath.suncertpathbuilderexception/i,
  /unable to verify leaf signature/i,
  /nsurlerrordomain code=-1202/i,
  /nsurlerrordomain code=-1200/i,
  /net::err_cert/i,
  /certificate has expired/i,
  /unable to verify the first certificate/i,
];

const TIMEOUT_ERROR_PATTERNS = [
  /timeout/i,
  /timed out/i,
  /request took too long/i,
  /nsurlerrordomain code=-1001/i,
  /etimedout/i,
  /sockettimeout/i,
  /socket timeout/i,
  /time out/i,
  /connection timed out/i,
  /read timed out/i,
];

const AUTH_ERROR_PATTERNS = [
  /unauthorized/i,
  /forbidden/i,
  /authentication failed/i,
  /invalid password/i,
  /wrong password/i,
  /password incorrect/i,
  /management password/i,
  /admin password/i,
  /code[:=\s-]*401\b/i,
  /code[:=\s-]*403\b/i,
  /code[:=\s-]*-?1\b/i,
];

export class AdminError extends Error {
  code: AdminErrorCode;
  userMessage: string;

  constructor(code: AdminErrorCode, message?: string, userMessage?: string) {
    super(message ?? code);
    this.name = 'AdminError';
    this.code = code;
    this.userMessage = userMessage ?? ERROR_MESSAGES[code] ?? '请求失败，请稍后重试';
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return '';
}

function isAdminError(error: unknown): error is AdminError {
  return error instanceof AdminError;
}

function createAdminError(code: AdminErrorCode, detail?: string) {
  return new AdminError(code, detail, ERROR_MESSAGES[code]);
}

function matchesAnyPattern(message: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(message));
}

export function classifyError(error: unknown): AdminError {
  if (isAdminError(error)) return error;

  const message = getErrorMessage(error);
  const normalized = message.toLowerCase();

  if (matchesAnyPattern(normalized, TIMEOUT_ERROR_PATTERNS)) return createAdminError('timeout', message);
  if (matchesAnyPattern(normalized, DNS_ERROR_PATTERNS)) return createAdminError('dns', message);
  if (matchesAnyPattern(normalized, SSL_ERROR_PATTERNS)) return createAdminError('ssl', message);
  if (matchesAnyPattern(normalized, AUTH_ERROR_PATTERNS)) return createAdminError('auth', message);
  if (matchesAnyPattern(normalized, NETWORK_ERROR_PATTERNS)) return createAdminError('network', message);

  return createAdminError('request_failed', message);
}

function classifyResponseError(path: string, response: Response, json: ApiEnvelope<unknown>, rawText: string) {
  const responseMessage = [json.reason, json.message, rawText].filter(Boolean).join(' ');
  const normalized = responseMessage.toLowerCase();

  if (response.status === 401 || response.status === 403 || json.code === 401 || json.code === 403) {
    return createAdminError('auth', responseMessage || 'REQUEST_FAILED');
  }

  if (matchesAnyPattern(normalized, AUTH_ERROR_PATTERNS) || (path.endsWith('/v0/management/config') && json.code !== 0)) {
    return createAdminError('auth', responseMessage || 'REQUEST_FAILED');
  }

  return createAdminError('request_failed', responseMessage || 'REQUEST_FAILED');
}

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
  try {
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
      throw createAdminError('invalid_response', rawText || 'INVALID_SERVER_RESPONSE');
    }

    if (!response.ok || json.code !== 0) {
      throw classifyResponseError(path, response, json, rawText);
    }

    return json.data as T;
  } catch (error) {
    if (isAdminError(error)) throw error;
    throw classifyError(error);
  }
}
