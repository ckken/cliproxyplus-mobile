import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text, View } from 'react-native';
import { AlertTriangle, Cable, ShieldCheck, Waypoints } from 'lucide-react-native';

import { BarChartCard } from '@/src/components/bar-chart-card';
import { LineTrendChart } from '@/src/components/line-trend-chart';
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

function sortNumericEntries(source?: Record<string, number>) {
  return Object.entries(source ?? {})
    .map(([label, value]) => ({
      label,
      value: toFiniteNumber(value),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'zh-Hans-CN', { numeric: true }));
}

function toTrendPoints(source?: Record<string, number>, labelFormatter: (label: string) => string = (label) => label) {
  return sortNumericEntries(source).map((item) => ({
    label: labelFormatter(item.label),
    value: item.value,
  }));
}

function maskApiKey(key: string) {
  if (key.length <= 12) {
    return key;
  }

  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function countModels(models?: Record<string, unknown>) {
  return Object.keys(models ?? {}).length;
}

function EmptyChartCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="rounded-[18px] bg-[#fbf8f2] p-4">
      <Text className="text-xs uppercase tracking-[1.6px] text-[#7d7468]">{title}</Text>
      <Text numberOfLines={1} className="mt-1 text-xs text-[#8a8072]">
        {subtitle}
      </Text>
      <View className="mt-4 rounded-[14px] bg-[#f4efe4] px-3 py-8">
        <Text className="text-center text-sm text-[#7d7468]">暂无可用数据</Text>
      </View>
    </View>
  );
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
  const apiEntries = Object.entries(usage.apis ?? {});
  const apiCount = apiEntries.length;
  const totalModelCount = apiEntries.reduce((sum, [, api]) => sum + countModels(api.models), 0);

  const requestByDayPoints = toTrendPoints(usage.requests_by_day, (day) => {
    const parts = day.split('-');
    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : day;
  });
  const tokenByDayPoints = toTrendPoints(usage.tokens_by_day, (day) => {
    const parts = day.split('-');
    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : day;
  });
  const requestByHourItems = sortNumericEntries(usage.requests_by_hour).map((item) => ({
    label: item.label,
    value: item.value,
    color: '#1d5f55',
  }));
  const tokenByHourItems = sortNumericEntries(usage.tokens_by_hour).map((item) => ({
    label: item.label,
    value: item.value,
    color: '#a06a1d',
  }));
  const topApis = apiEntries
    .map(([key, api]) => ({
      key,
      totalRequests: toFiniteNumber(api.total_requests),
      modelCount: countModels(api.models),
    }))
    .sort((left, right) => right.totalRequests - left.totalRequests)
    .slice(0, 5);

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
            <Text className="text-lg font-bold text-[#16181a]">使用趋势</Text>
            <Text className="mt-1 text-sm leading-6 text-[#7d7468]">按天和按小时查看请求量与 Tokens 变化。</Text>
            <View className="mt-4 gap-4">
              {requestByDayPoints.length > 0 ? (
                <LineTrendChart
                  title="按天请求"
                  subtitle="最近请求量变化"
                  points={requestByDayPoints}
                  formatValue={(value) => formatCompactNumber(value)}
                  compact
                />
              ) : (
                <EmptyChartCard title="按天请求" subtitle="最近请求量变化" />
              )}

              {tokenByDayPoints.length > 0 ? (
                <LineTrendChart
                  title="按天 Tokens"
                  subtitle="最近 Tokens 变化"
                  points={tokenByDayPoints}
                  formatValue={(value) => formatCompactNumber(value)}
                  compact
                />
              ) : (
                <EmptyChartCard title="按天 Tokens" subtitle="最近 Tokens 变化" />
              )}

              <BarChartCard
                title="按小时请求"
                subtitle="一天内请求分布"
                items={requestByHourItems}
                formatValue={(value) => formatCompactNumber(value)}
              />

              <BarChartCard
                title="按小时 Tokens"
                subtitle="一天内 Tokens 分布"
                items={tokenByHourItems}
                formatValue={(value) => formatCompactNumber(value)}
              />
            </View>
          </View>

          <View className="rounded-[24px] bg-[#fbf8f2] p-4">
            <Text className="text-lg font-bold text-[#16181a]">API 维度统计</Text>
            <Text className="mt-1 text-sm leading-6 text-[#7d7468]">
              {apiCount > 0 ? `共 ${apiCount} 个 Key，覆盖 ${totalModelCount} 个模型。` : '当前没有 API 维度统计数据。'}
            </Text>
            <View className="mt-3">
              {topApis.length > 0 ? (
                topApis.map((api) => (
                  <DetailRow
                    key={api.key}
                    label={maskApiKey(api.key)}
                    value={`${formatCompactNumber(api.totalRequests)} 次 · ${api.modelCount} 模型`}
                  />
                ))
              ) : (
                <Text className="py-2 text-sm text-[#7d7468]">暂无按 Key 聚合的统计数据</Text>
              )}
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
