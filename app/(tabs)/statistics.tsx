import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text, View } from 'react-native';
import { AlertTriangle, Cable, ShieldCheck, Waypoints } from 'lucide-react-native';

import { BarChartCard } from '@/src/components/bar-chart-card';
import { DetailRow } from '@/src/components/detail-row';
import { LineTrendChart } from '@/src/components/line-trend-chart';
import { ScreenShell } from '@/src/components/screen-shell';
import { StatCard } from '@/src/components/stat-card';
import { formatCompactNumber } from '@/src/lib/formatters';
import { getOverview } from '@/src/services/admin';

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

function getSortedApis(apis?: Record<string, { total_requests?: number; total_tokens?: number; models?: Record<string, { total_requests?: number; total_tokens?: number }> }>) {
  return Object.entries(apis ?? {})
    .map(([key, api]) => ({
      key,
      totalRequests: toFiniteNumber(api.total_requests),
      totalTokens: toFiniteNumber(api.total_tokens),
      modelCount: countModels(api.models),
      models: api.models ?? {},
    }))
    .sort((left, right) => {
      if (right.totalRequests !== left.totalRequests) {
        return right.totalRequests - left.totalRequests;
      }

      return left.key.localeCompare(right.key, 'zh-Hans-CN', { numeric: true });
    });
}

export default function StatisticsScreen() {
  const query = useQuery({ queryKey: ['overview'], queryFn: getOverview });
  const usagePayload = query.data?.usage;
  const usage = usagePayload?.usage ?? {};
  const failedRequests = toFiniteNumber(usagePayload?.failed_requests ?? usage.failure_count);
  const totalRequests = toFiniteNumber(usage.total_requests);
  const successRequests = toFiniteNumber(usage.success_count ?? Math.max(totalRequests - failedRequests, 0));
  const totalTokens = toFiniteNumber(usage.total_tokens);
  const apiEntries = getSortedApis(usage.apis);

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

  return (
    <ScreenShell
      title="统计"
      subtitle="请求、Token 和 API 维度的使用情况"
      refreshing={query.isRefetching}
      onRefresh={() => void query.refetch()}
    >
      {query.isLoading ? (
        <View className="items-center rounded-[24px] bg-[#fbf8f2] p-6">
          <ActivityIndicator color="#1d5f55" />
          <Text className="mt-3 text-sm text-[#7d7468]">正在读取统计数据...</Text>
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
            <Text className="text-lg font-bold text-[#16181a]">按 API Key 分组</Text>
            <Text className="mt-1 text-sm leading-6 text-[#7d7468]">
              {apiEntries.length > 0 ? `共 ${apiEntries.length} 个 Key。` : '当前没有 API Key 统计数据。'}
            </Text>
            <View className="mt-3 gap-3">
              {apiEntries.length > 0 ? (
                apiEntries.map((api) => (
                  <View key={api.key} className="rounded-[18px] bg-[#f4efe4] p-4">
                    <Text className="text-sm font-semibold text-[#16181a]">{maskApiKey(api.key)}</Text>
                    <View className="mt-2">
                      <DetailRow label="请求数" value={formatCompactNumber(api.totalRequests)} />
                      <DetailRow label="Token 数" value={formatCompactNumber(api.totalTokens)} />
                      <DetailRow label="模型数" value={String(api.modelCount)} />
                    </View>
                  </View>
                ))
              ) : (
                <Text className="py-2 text-sm text-[#7d7468]">暂无按 Key 聚合的统计数据</Text>
              )}
            </View>
          </View>

          <View className="rounded-[24px] bg-[#fbf8f2] p-4">
            <Text className="text-lg font-bold text-[#16181a]">按模型分组</Text>
            <Text className="mt-1 text-sm leading-6 text-[#7d7468]">按 API Key 展开每个模型的请求和 Token 使用情况。</Text>
            <View className="mt-3 gap-3">
              {apiEntries.length > 0 ? (
                apiEntries.map((api) => {
                  const modelEntries = Object.entries(api.models ?? {})
                    .map(([modelName, model]) => ({
                      modelName,
                      totalRequests: toFiniteNumber(model.total_requests),
                      totalTokens: toFiniteNumber(model.total_tokens),
                    }))
                    .sort((left, right) => {
                      if (right.totalRequests !== left.totalRequests) {
                        return right.totalRequests - left.totalRequests;
                      }

                      return left.modelName.localeCompare(right.modelName, 'zh-Hans-CN', { numeric: true });
                    });

                  return (
                    <View key={api.key} className="rounded-[18px] bg-[#f4efe4] p-4">
                      <Text className="text-sm font-semibold text-[#16181a]">{maskApiKey(api.key)}</Text>
                      <Text className="mt-1 text-xs text-[#8a8072]">模型明细</Text>
                      <View className="mt-3">
                        {modelEntries.length > 0 ? (
                          modelEntries.map((model) => (
                            <DetailRow
                              key={model.modelName}
                              label={model.modelName}
                              value={`${formatCompactNumber(model.totalRequests)} 次 · ${formatCompactNumber(model.totalTokens)} Tokens`}
                            />
                          ))
                        ) : (
                          <Text className="py-2 text-sm text-[#7d7468]">暂无模型维度数据</Text>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text className="py-2 text-sm text-[#7d7468]">暂无模型维度数据</Text>
              )}
            </View>
          </View>
        </>
      ) : null}
    </ScreenShell>
  );
}
