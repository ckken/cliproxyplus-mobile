import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformBadge } from './platform-badge';
import { QuotaProgress } from './quota-progress';
import { DetailRow } from './detail-row';
import { formatCompactNumber, formatDisplayTime } from '@/src/lib/formatters';
import { getAccountTodayStats, getAccountUsage, refreshAccount, resetAccountQuota } from '@/src/services/admin';
import type { AdminAccount } from '@/src/types/admin';

type AccountDetailSheetProps = {
  account: AdminAccount | null;
  visible: boolean;
  onClose: () => void;
};

export function AccountDetailSheet({ account, visible, onClose }: AccountDetailSheetProps) {
  const queryClient = useQueryClient();
  const id = account?.id ?? '';

  const usageQuery = useQuery({
    queryKey: ['account-usage', id],
    queryFn: () => getAccountUsage(id),
    enabled: visible && !!id,
  });

  const todayQuery = useQuery({
    queryKey: ['account-today-stats', id],
    queryFn: () => getAccountTodayStats(id),
    enabled: visible && !!id,
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
      void queryClient.invalidateQueries({ queryKey: ['account-usage', id] });
    },
  });

  const resetQuotaMutation = useMutation({
    mutationFn: () => resetAccountQuota(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['account-usage', id] });
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  if (!account) return null;

  const usage = usageQuery.data;
  const today = todayQuery.data;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f4efe4' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ebe5d8' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#16181a' }}>账号详情</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X color="#6f665c" size={22} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
          {/* Basic info */}
          <View style={{ backgroundColor: '#fbf8f2', borderRadius: 18, padding: 16, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <PlatformBadge platform={account.platform} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#16181a', flex: 1 }} numberOfLines={1}>
                {account.name || account.id}
              </Text>
            </View>
            <DetailRow label="ID" value={account.id} />
            {account.type ? <DetailRow label="类型" value={account.type} /> : null}
            <DetailRow label="状态" value={account.status === 'active' ? '正常' : account.status === 'expired' ? '已过期' : account.status === 'error' ? '异常' : '已禁用'} />
            {account.credentials_preview ? <DetailRow label="凭证" value={account.credentials_preview} /> : null}
            <DetailRow label="创建时间" value={formatDisplayTime(account.created_at)} />
            <DetailRow label="最后使用" value={formatDisplayTime(account.last_used_at)} />
          </View>

          {/* Quota info */}
          <View style={{ backgroundColor: '#fbf8f2', borderRadius: 18, padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#16181a' }}>配额使用</Text>
            {usageQuery.isLoading ? (
              <ActivityIndicator color="#1d5f55" />
            ) : usage ? (
              <>
                {usage.quota_5h ? (
                  <QuotaProgress quota={usage.quota_5h} label="5 小时窗口" />
                ) : (
                  <Text style={{ fontSize: 12, color: '#8a8072' }}>无 5h 配额数据</Text>
                )}
                {usage.quota_7d ? (
                  <QuotaProgress quota={usage.quota_7d} label="7 天窗口" />
                ) : (
                  <Text style={{ fontSize: 12, color: '#8a8072' }}>无 7d 配额数据</Text>
                )}
              </>
            ) : (
              <Text style={{ fontSize: 12, color: '#8a8072' }}>暂无配额数据</Text>
            )}
          </View>

          {/* Today stats */}
          <View style={{ backgroundColor: '#fbf8f2', borderRadius: 18, padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#16181a' }}>今日统计</Text>
            {todayQuery.isLoading ? (
              <ActivityIndicator color="#1d5f55" />
            ) : today ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: '#f4efe4', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#16181a' }}>{formatCompactNumber(today.requests)}</Text>
                  <Text style={{ fontSize: 11, color: '#6f665c', marginTop: 2 }}>请求</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#f4efe4', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#16181a' }}>{formatCompactNumber(today.tokens)}</Text>
                  <Text style={{ fontSize: 11, color: '#6f665c', marginTop: 2 }}>Tokens</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#f4efe4', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: today.errors > 0 ? '#c44b3f' : '#16181a' }}>{today.errors}</Text>
                  <Text style={{ fontSize: 11, color: '#6f665c', marginTop: 2 }}>错误</Text>
                </View>
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: '#8a8072' }}>暂无统计数据</Text>
            )}
          </View>

          {/* Actions */}
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              style={{ alignItems: 'center', backgroundColor: '#1d5f55', borderRadius: 16, paddingVertical: 14 }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                {refreshMutation.isPending ? '刷新中...' : '刷新 Token'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => resetQuotaMutation.mutate()}
              disabled={resetQuotaMutation.isPending}
              style={{ alignItems: 'center', backgroundColor: '#ebe5d8', borderRadius: 16, paddingVertical: 14 }}
            >
              <Text style={{ color: '#16181a', fontSize: 15, fontWeight: '700' }}>
                {resetQuotaMutation.isPending ? '重置中...' : '重置配额'}
              </Text>
            </Pressable>

            {refreshMutation.isSuccess ? (
              <Text style={{ fontSize: 13, color: '#2b7a4b', textAlign: 'center' }}>Token 刷新成功</Text>
            ) : null}
            {refreshMutation.isError ? (
              <Text style={{ fontSize: 13, color: '#c44b3f', textAlign: 'center' }}>
                刷新失败: {refreshMutation.error instanceof Error ? refreshMutation.error.message : '未知错误'}
              </Text>
            ) : null}
            {resetQuotaMutation.isSuccess ? (
              <Text style={{ fontSize: 13, color: '#2b7a4b', textAlign: 'center' }}>配额已重置</Text>
            ) : null}
            {resetQuotaMutation.isError ? (
              <Text style={{ fontSize: 13, color: '#c44b3f', textAlign: 'center' }}>
                重置失败: {resetQuotaMutation.error instanceof Error ? resetQuotaMutation.error.message : '未知错误'}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
