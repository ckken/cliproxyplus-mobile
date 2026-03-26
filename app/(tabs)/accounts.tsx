import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

import { ScreenShell } from '@/src/components/screen-shell';
import { AccountCard } from '@/src/components/account-card';
import { AccountDetailSheet } from '@/src/components/account-detail-sheet';
import { batchRefreshAccounts, getAccounts, refreshAccount } from '@/src/services/admin';
import type { AdminAccount } from '@/src/types/admin';

const platforms = ['全部', 'OpenAI', 'Claude', 'Gemini', 'Sora'] as const;

export default function AccountsScreen() {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('全部');
  const [detailAccount, setDetailAccount] = useState<AdminAccount | null>(null);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  const query = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const batchRefresh = useMutation({
    mutationFn: batchRefreshAccounts,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const handleRefreshOne = useCallback(async (id: string) => {
    setRefreshingIds((prev) => new Set(prev).add(id));
    try {
      await refreshAccount(id);
      void queryClient.invalidateQueries({ queryKey: ['accounts'] });
    } catch {
      // silently handle - user sees card state
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [queryClient]);

  const accounts = query.data ?? [];
  const filtered = useMemo(() => {
    if (selectedPlatform === '全部') return accounts;
    return accounts.filter((a) => a.platform.toLowerCase() === selectedPlatform.toLowerCase());
  }, [accounts, selectedPlatform]);

  return (
    <ScreenShell
      title="账号管理"
      subtitle="管理服务账号、Token 刷新和配额"
      right={
        <Pressable
          onPress={() => batchRefresh.mutate()}
          disabled={batchRefresh.isPending}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1d5f55', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}
        >
          {batchRefresh.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <RefreshCw color="#fff" size={14} />
          )}
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
            {batchRefresh.isPending ? '刷新中' : '批量刷新'}
          </Text>
        </Pressable>
      }
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
    >
      {/* Platform filter chips */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {platforms.map((p) => {
          const active = selectedPlatform === p;
          return (
            <Pressable
              key={p}
              onPress={() => setSelectedPlatform(p)}
              style={{
                backgroundColor: active ? '#1d5f55' : '#ebe5d8',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : '#6f665c' }}>{p}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Batch refresh result */}
      {batchRefresh.isSuccess ? (
        <View style={{ backgroundColor: '#d1fae5', borderRadius: 12, padding: 10 }}>
          <Text style={{ fontSize: 12, color: '#065f46' }}>
            批量刷新完成: {batchRefresh.data.success_count} 成功, {batchRefresh.data.fail_count} 失败
          </Text>
        </View>
      ) : null}
      {batchRefresh.isError ? (
        <View style={{ backgroundColor: '#fee2e2', borderRadius: 12, padding: 10 }}>
          <Text style={{ fontSize: 12, color: '#991b1b' }}>
            批量刷新失败: {batchRefresh.error instanceof Error ? batchRefresh.error.message : '未知错误'}
          </Text>
        </View>
      ) : null}

      {/* Loading state */}
      {query.isLoading ? (
        <View style={{ gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ backgroundColor: '#fbf8f2', borderRadius: 18, padding: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ width: 60, height: 18, backgroundColor: '#ebe5d8', borderRadius: 8 }} />
                <View style={{ width: 40, height: 18, backgroundColor: '#ebe5d8', borderRadius: 8 }} />
              </View>
              <View style={{ width: '70%', height: 16, backgroundColor: '#ebe5d8', borderRadius: 6 }} />
              <View style={{ width: '50%', height: 12, backgroundColor: '#ebe5d8', borderRadius: 6 }} />
              <View style={{ width: '100%', height: 8, backgroundColor: '#ebe5d8', borderRadius: 4 }} />
            </View>
          ))}
        </View>
      ) : null}

      {/* Error state */}
      {query.error ? (
        <View className="rounded-[18px] border border-[#f3d9c8] bg-[#fbf1eb] p-4">
          <View className="flex-row items-center gap-2">
            <AlertTriangle color="#c25d35" size={18} />
            <Text className="text-base font-semibold text-[#a24f2d]">加载失败</Text>
          </View>
          <Text className="mt-2 text-sm leading-6 text-[#8f573f]">
            {query.error instanceof Error ? query.error.message : '未知错误'}
          </Text>
        </View>
      ) : null}

      {/* Empty state */}
      {query.data && filtered.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ fontSize: 15, color: '#8a8072' }}>
            {selectedPlatform === '全部' ? '暂无账号' : `暂无 ${selectedPlatform} 账号`}
          </Text>
          <Text style={{ fontSize: 12, color: '#b0a89c', marginTop: 4 }}>
            请在服务端添加账号后刷新
          </Text>
        </View>
      ) : null}

      {/* Account list */}
      {filtered.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          isRefreshing={refreshingIds.has(account.id)}
          onRefresh={() => void handleRefreshOne(account.id)}
          onDetail={() => setDetailAccount(account)}
        />
      ))}

      {/* Detail sheet */}
      <AccountDetailSheet
        account={detailAccount}
        visible={detailAccount !== null}
        onClose={() => setDetailAccount(null)}
      />
    </ScreenShell>
  );
}
