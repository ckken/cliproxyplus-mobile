import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { PlatformBadge } from './platform-badge';
import { QuotaProgress } from './quota-progress';
import { formatExpiryStatus } from '@/src/lib/formatters';
import type { AdminAccount } from '@/src/types/admin';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: '#d1fae5', text: '#065f46', label: '正常' },
  expired: { bg: '#fee2e2', text: '#991b1b', label: '已过期' },
  error: { bg: '#fef3c7', text: '#92400e', label: '异常' },
  disabled: { bg: '#f3f0e8', text: '#6f665c', label: '已禁用' },
};

type AccountCardProps = {
  account: AdminAccount;
  onRefresh: () => void;
  onDetail: () => void;
  isRefreshing?: boolean;
};

export function AccountCard({ account, onRefresh, onDetail, isRefreshing }: AccountCardProps) {
  const status = statusConfig[account.status] ?? statusConfig.error;
  const expiry = formatExpiryStatus(account.token_expires_at);

  return (
    <Pressable onPress={onDetail} style={{ backgroundColor: '#fbf8f2', borderRadius: 18, overflow: 'hidden' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <PlatformBadge platform={account.platform} />
          {account.type ? (
            <Text style={{ fontSize: 11, color: '#8a8072' }}>{account.type}</Text>
          ) : null}
        </View>
        <View style={{ backgroundColor: status.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: status.text }}>{status.label}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#16181a' }} numberOfLines={1}>
          {account.name || account.id}
        </Text>
        {account.credentials_preview ? (
          <Text style={{ fontSize: 12, color: '#8a8072', fontFamily: 'monospace' }} numberOfLines={1}>
            {account.credentials_preview}
          </Text>
        ) : null}
        <Text style={{ fontSize: 12, color: expiry.expired ? '#c44b3f' : '#6f665c' }}>
          Token: {expiry.label}
        </Text>
        {account.quota ? (
          <QuotaProgress quota={account.quota} />
        ) : null}
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ebe5d8' }}>
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); onRefresh(); }}
          disabled={isRefreshing}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 }}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#1d5f55" />
          ) : (
            <RefreshCw color="#1d5f55" size={14} />
          )}
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1d5f55' }}>
            {isRefreshing ? '刷新中...' : '刷新 Token'}
          </Text>
        </Pressable>
        <View style={{ width: 1, backgroundColor: '#ebe5d8' }} />
        <Pressable
          onPress={onDetail}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#6f665c' }}>查看详情</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
