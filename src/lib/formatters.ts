export function formatCompactNumber(value: number, digits = 1) {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(digits).replace(/\.0$/, '')}T`;
  }

  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(digits).replace(/\.0$/, '')}B`;
  }

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(digits).replace(/\.0$/, '')}M`;
  }

  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(digits).replace(/\.0$/, '')}K`;
  }

  return `${Math.round(value)}`;
}

export function formatTokenValue(value: number) {
  return formatCompactNumber(value, 1);
}

export function formatFileSize(bytes?: number | null) {
  if (!Number.isFinite(bytes ?? NaN) || bytes == null || bytes < 0) {
    return '--';
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
  }

  const mb = kb / 1024;
  if (mb < 1024) {
    return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
  }

  const gb = mb / 1024;
  return `${gb.toFixed(gb >= 100 ? 0 : 1)} GB`;
}

export function formatRelativeTime(value?: number | string | Date | null) {
  if (value == null || value === '') {
    return '--';
  }

  const date = (() => {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number') {
      return new Date(value < 1_000_000_000_000 ? value * 1000 : value);
    }

    if (/^\d+$/.test(value)) {
      const numeric = Number(value);
      return new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric);
    }

    return new Date(value);
  })();

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const suffix = diffMs >= 0 ? '后' : '前';

  if (absMs < 60_000) {
    const seconds = Math.max(1, Math.round(absMs / 1000));
    return `${seconds} 秒${suffix}`;
  }

  if (absMs < 3_600_000) {
    const minutes = Math.max(1, Math.round(absMs / 60_000));
    return `${minutes} 分钟${suffix}`;
  }

  if (absMs < 86_400_000) {
    const hours = Math.max(1, Math.round(absMs / 3_600_000));
    return `${hours} 小时${suffix}`;
  }

  if (absMs < 604_800_000) {
    const days = Math.max(1, Math.round(absMs / 86_400_000));
    return `${days} 天${suffix}`;
  }

  if (absMs < 2_592_000_000) {
    const weeks = Math.max(1, Math.round(absMs / 604_800_000));
    return `${weeks} 周${suffix}`;
  }

  if (absMs < 31_536_000_000) {
    const months = Math.max(1, Math.round(absMs / 2_592_000_000));
    return `${months} 个月${suffix}`;
  }

  const years = Math.max(1, Math.round(absMs / 31_536_000_000));
  return `${years} 年${suffix}`;
}

export function formatDisplayTime(value?: string | null) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatCountdown(remainingSeconds: number): string {
  if (remainingSeconds <= 0) return '已过期';
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatExpiryStatus(expiresAt: string | null | undefined): { text: string; level: 'success' | 'warning' | 'danger' | 'muted' } {
  if (!expiresAt) return { text: '永不过期', level: 'muted' };
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;
  if (diff <= 0) return { text: '已过期', level: 'danger' };
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return { text: `${hours}h 后过期`, level: 'danger' };
  const days = Math.floor(hours / 24);
  if (days < 7) return { text: `${days}天后过期`, level: 'warning' };
  return { text: `${days}天后过期`, level: 'success' };
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}
