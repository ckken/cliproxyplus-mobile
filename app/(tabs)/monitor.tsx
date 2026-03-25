import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text, View } from 'react-native';
import { AlertTriangle, Cable, ShieldCheck, Waypoints } from 'lucide-react-native';

import { ScreenShell } from '@/src/components/screen-shell';
import { StatCard } from '@/src/components/stat-card';
import { DetailRow } from '@/src/components/detail-row';
import { formatCompactNumber } from '@/src/lib/formatters';
import { getOverview } from '@/src/services/admin';

function toBoolLabel(value: unknown) {
  return value ? '开启' : '关闭';
}

function toFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export default function MonitorScreen() {
  const query = useQuery({ queryKey: ['overview'], queryFn: getOverview });
  const usagePayload = query.data?.usage;
  const usage = usagePayload?.usage ?? {};
  const config = query.data?.config ?? {};
  const latestVersion = query.data?.latestVersion?.['latest-version'] ?? '--';
  const failedRequests = toFiniteNumber(usagePayload?.failed_requests ?? usage.failure_count);
  const totalRequests = toFiniteNumber(usage.total_requests);
  const successRequests = toFiniteNumber(usage.success_count ?? Math.max(totalRequests - failedRequests, 0));
  const totalTokens = toFiniteNumber(usage.total_tokens);

  return (
    <ScreenShell
      title="概览"
      subtitle="CLIProxyAPI Plus 管理面板总览"
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
    >
      {query.isLoading ? (
        <View className="items-center rounded-[24px] bg-[#fbf8f2] p-6">
          <ActivityIndicator color="#1d5f55" />
          <Text className="mt-3 text-sm text-[#7d7468]">正在读取管理数据...</Text>
        </View>
      ) : null}

      {query.error ? (
        <View className="rounded-[24px] border border-[#f3d9c8] bg-[#fbf1eb] p-4">
          <View className="flex-row items-center gap-2">
            <AlertTriangle color="#c25d35" size={18} />
            <Text className="text-base font-semibold text-[#a24f2d]">加载失败</Text>
          </View>
          <Text className="mt-2 text-sm leading-6 text-[#8f573f]">
            {query.error instanceof Error ? query.error.message : '未知错误'}
          </Text>
        </View>
      ) : null}

      {query.data ? (
        <>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatCard label="总请求" value={formatCompactNumber(totalRequests)} tone="dark" icon={Cable} />
            </View>
            <View className="flex-1">
              <StatCard label="成功请求" value={formatCompactNumber(successRequests)} icon={ShieldCheck} />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatCard label="失败请求" value={formatCompactNumber(failedRequests)} icon={AlertTriangle} />
            </View>
            <View className="flex-1">
              <StatCard label="总 Tokens" value={formatCompactNumber(totalTokens)} icon={Waypoints} />
            </View>
          </View>

          <View className="rounded-[24px] bg-[#fbf8f2] p-4">
            <Text className="text-lg font-bold text-[#16181a]">运行状态</Text>
            <View className="mt-3">
              <DetailRow label="最新版本" value={String(latestVersion).replace(/^v/, '') || '--'} />
              <DetailRow label="成功率" value={totalRequests > 0 ? `${((successRequests / totalRequests) * 100).toFixed(1)}%` : '--'} />
              <DetailRow label="Routing Strategy" value={String(config.routing?.strategy ?? 'round-robin')} />
              <DetailRow label="Request Log" value={toBoolLabel(config['request-log'])} />
              <DetailRow label="Debug" value={toBoolLabel(config.debug)} />
              <DetailRow label="WebSocket Auth" value={toBoolLabel(config['ws-auth'])} />
              <DetailRow label="Force Model Prefix" value={toBoolLabel(config['force-model-prefix'])} />
              <DetailRow label="Usage Statistics" value={toBoolLabel(config['usage-statistics-enabled'])} />
            </View>
          </View>
        </>
      ) : null}
    </ScreenShell>
  );
}
