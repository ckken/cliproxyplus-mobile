import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text, View } from 'react-native';
import { AlertTriangle, Cable, GitBranch, ShieldCheck, Waypoints } from 'lucide-react-native';

import { ScreenShell } from '@/src/components/screen-shell';
import { StatCard } from '@/src/components/stat-card';
import { DetailRow } from '@/src/components/detail-row';
import { formatCompactNumber } from '@/src/lib/formatters';
import { getOverview } from '@/src/services/admin';

function toBoolLabel(value: unknown) {
  return value ? '开启' : '关闭';
}

export default function MonitorScreen() {
  const query = useQuery({ queryKey: ['overview'], queryFn: getOverview });
  const usage = query.data?.usage?.usage ?? {};
  const config = query.data?.config ?? {};
  const latestVersion = query.data?.latestVersion?.['latest-version'] ?? '--';

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
              <StatCard label="总请求" value={formatCompactNumber(Number(usage.total_requests ?? 0))} tone="dark" icon={Cable} />
            </View>
            <View className="flex-1">
              <StatCard label="失败请求" value={formatCompactNumber(Number(query.data.usage.failed_requests ?? usage.failed_requests ?? 0))} icon={AlertTriangle} />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatCard label="总 Tokens" value={formatCompactNumber(Number(usage.total_tokens ?? 0))} icon={Waypoints} />
            </View>
            <View className="flex-1">
              <StatCard label="最新版本" value={String(latestVersion).replace(/^v/, '') || '--'} icon={GitBranch} />
            </View>
          </View>

          <View className="rounded-[24px] bg-[#fbf8f2] p-4">
            <Text className="text-lg font-bold text-[#16181a]">运行状态</Text>
            <View className="mt-3">
              <DetailRow label="Routing Strategy" value={String(config.routing?.strategy ?? 'round-robin')} />
              <DetailRow label="Request Log" value={toBoolLabel(config['request-log'])} />
              <DetailRow label="Debug" value={toBoolLabel(config.debug)} />
              <DetailRow label="WebSocket Auth" value={toBoolLabel(config['ws-auth'])} />
              <DetailRow label="Force Model Prefix" value={toBoolLabel(config['force-model-prefix'])} />
              <DetailRow label="Usage Statistics" value={toBoolLabel(config['usage-statistics-enabled'])} />
            </View>
          </View>

          <View className="rounded-[24px] bg-[#fbf8f2] p-4">
            <View className="flex-row items-center gap-2">
              <ShieldCheck color="#1d5f55" size={18} />
              <Text className="text-lg font-bold text-[#16181a]">关键配置</Text>
            </View>
            <View className="mt-3">
              <DetailRow label="Proxy URL" value={String(config['proxy-url'] || '未设置')} />
              <DetailRow label="Request Retry" value={String(config['request-retry'] ?? 0)} />
              <DetailRow label="Max Retry Interval" value={`${String(config['max-retry-interval'] ?? 0)}s`} />
              <DetailRow label="API Keys" value={Array.isArray(config['api-keys']) ? String(config['api-keys'].length) : '0'} />
            </View>
          </View>
        </>
      ) : null}
    </ScreenShell>
  );
}
