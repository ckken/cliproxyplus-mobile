import { useQuery } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, BarChart3, Cable, ShieldCheck, Waypoints, type LucideIcon } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { getOverview } from '@/src/services/admin';
import { formatCompactNumber } from '@/src/lib/formatters';

const colors = {
  page: '#f4efe4',
  card: '#fbf8f2',
  mutedCard: '#f1ece2',
  primary: '#1d5f55',
  text: '#16181a',
  subtext: '#6f665c',
  border: '#e7dfcf',
  dangerBg: '#fbf1eb',
  danger: '#c25d35',
  successBg: '#e6f4ee',
};

type Entry = {
  label: string;
  value: number;
};

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

function toTrendPoints(source?: Record<string, number>, labelFormatter: (label: string) => string = (label) => label): Entry[] {
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

function getApiEntries(
  apis?: Record<
    string,
    {
      total_requests?: number;
      total_tokens?: number;
      models?: Record<string, { total_requests?: number; total_tokens?: number }>;
    }
  >,
) {
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

function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
          {subtitle ? <Text style={{ marginTop: 6, fontSize: 12, lineHeight: 18, color: colors.subtext }}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={{ alignItems: 'flex-end' }}>{right}</View> : null}
      </View>
      <View style={{ marginTop: 14 }}>{children}</View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'light',
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        backgroundColor: dark ? colors.primary : colors.card,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ fontSize: 12, letterSpacing: 1.2, color: dark ? '#d8efe7' : colors.subtext }}>{label}</Text>
        <Icon size={14} color={dark ? '#d8efe7' : colors.subtext} />
      </View>
      <Text style={{ marginTop: 10, fontSize: 26, fontWeight: '700', color: dark ? '#ffffff' : colors.text }}>{value}</Text>
      {detail ? <Text style={{ marginTop: 6, fontSize: 12, lineHeight: 18, color: dark ? '#d8efe7' : colors.subtext }}>{detail}</Text> : null}
    </View>
  );
}

function EmptyBlock({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View
      style={{
        borderRadius: 14,
        backgroundColor: colors.mutedCard,
        paddingHorizontal: 14,
        paddingVertical: 18,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{title}</Text>
      <Text style={{ marginTop: 4, fontSize: 12, lineHeight: 18, color: colors.subtext, textAlign: 'center' }}>{subtitle}</Text>
    </View>
  );
}

function TrendChart({
  title,
  subtitle,
  points,
  color = colors.primary,
}: {
  title: string;
  subtitle: string;
  points: Entry[];
  color?: string;
}) {
  const width = 320;
  const height = 120;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const minValue = Math.min(...points.map((point) => point.value), 0);
  const range = Math.max(maxValue - minValue, 1);
  const gradientId = useMemo(() => `trend-${title.replace(/[^a-zA-Z0-9_-]/g, '')}`, [title]);

  if (points.length === 0) {
    return <EmptyBlock title={title} subtitle={subtitle} />;
  }

  const line = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.value - minValue) / range) * (height - 18) - 10;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const latest = points[points.length - 1]?.value ?? 0;
  const tickStep = Math.max(Math.ceil(points.length / 6), 1);
  const tickPoints = points.filter((_, index) => index === 0 || index === points.length - 1 || index % tickStep === 0);

  return (
    <View style={{ borderRadius: 14, backgroundColor: colors.mutedCard, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, letterSpacing: 1.2, color: colors.subtext }}>{title}</Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: colors.subtext }}>{subtitle}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{formatCompactNumber(latest)}</Text>
      </View>

      <View style={{ marginTop: 12, borderRadius: 12, backgroundColor: colors.page, padding: 10, overflow: 'hidden' }}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
          <Path d={area} fill={`url(#${gradientId})`} />
          <Path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        </Svg>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          {tickPoints.map((point, index) => (
            <Text key={`${point.label}-${index}`} style={{ fontSize: 10, color: colors.subtext }}>
              {point.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function BarList({
  title,
  subtitle,
  items,
  color = colors.primary,
}: {
  title: string;
  subtitle: string;
  items: Entry[];
  color?: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <View style={{ borderRadius: 14, backgroundColor: colors.mutedCard, padding: 14 }}>
      <Text style={{ fontSize: 12, letterSpacing: 1.2, color: colors.subtext }}>{title}</Text>
      <Text style={{ marginTop: 4, fontSize: 12, color: colors.subtext }}>{subtitle}</Text>

      <View style={{ marginTop: 12, gap: 12 }}>
        {items.length > 0 ? (
          items.map((item) => {
            const barWidth = `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%`;

            return (
              <View key={item.label} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#4e463e' }}>{formatCompactNumber(item.value)}</Text>
                </View>
                <View style={{ height: 10, borderRadius: 999, backgroundColor: '#ece4d6', overflow: 'hidden' }}>
                  <View style={{ width: barWidth as DimensionValue, height: '100%', borderRadius: 999, backgroundColor: color }} />
                </View>
              </View>
            );
          })
        ) : (
          <EmptyBlock title="暂无数据" subtitle="当前接口没有返回可视化数据。" />
        )}
      </View>
    </View>
  );
}

function KeyGroupCard({
  title,
  totalRequests,
  totalTokens,
  modelCount,
  children,
}: {
  title: string;
  totalRequests: number;
  totalTokens: number;
  modelCount: number;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor: colors.mutedCard,
        padding: 14,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{title}</Text>
      <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ borderRadius: 999, backgroundColor: colors.successBg, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>请求 {formatCompactNumber(totalRequests)}</Text>
        </View>
        <View style={{ borderRadius: 999, backgroundColor: '#efe7d9', paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#5d564d' }}>Tokens {formatCompactNumber(totalTokens)}</Text>
        </View>
        <View style={{ borderRadius: 999, backgroundColor: '#e7dfcf', paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#5d564d' }}>模型 {modelCount}</Text>
        </View>
      </View>
      <View style={{ marginTop: 10 }}>{children}</View>
    </View>
  );
}

export default function StatisticsScreen() {
  const query = useQuery({
    queryKey: ['overview'],
    queryFn: getOverview,
    staleTime: 60_000,
  });

  const usagePayload = query.data?.usage;
  const usage = usagePayload?.usage ?? {};
  const failedRequests = toFiniteNumber(usagePayload?.failed_requests ?? usage.failure_count);
  const totalRequests = toFiniteNumber(usage.total_requests);
  const successRequests = toFiniteNumber(usage.success_count ?? Math.max(totalRequests - failedRequests, 0));
  const totalTokens = toFiniteNumber(usage.total_tokens);
  const apiEntries = getApiEntries(usage.apis);

  const requestByDayPoints = toTrendPoints(usage.requests_by_day, (day) => {
    const parts = day.split('-');
    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : day;
  });

  const tokenByDayPoints = toTrendPoints(usage.tokens_by_day, (day) => {
    const parts = day.split('-');
    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : day;
  });

  const requestByHourItems = sortNumericEntries(usage.requests_by_hour);
  const tokenByHourItems = sortNumericEntries(usage.tokens_by_hour);

  const modelGroups = useMemo(
    () =>
      apiEntries.map((api) => ({
        ...api,
        modelEntries: Object.entries(api.models ?? {})
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
          }),
      })),
    [apiEntries],
  );

  const refreshing = query.isRefetching;
  const errorMessage = query.error instanceof Error ? query.error.message : query.error ? '加载统计数据失败' : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>统计</Text>
          <Text style={{ marginTop: 6, fontSize: 13, lineHeight: 20, color: '#8a8072' }}>
            请求、Token 和 API 维度的使用情况。
          </Text>
        </View>

        {query.isLoading ? (
          <View style={{ alignItems: 'center', borderRadius: 18, backgroundColor: colors.card, padding: 20, borderWidth: 1, borderColor: colors.border }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ marginTop: 10, fontSize: 13, color: colors.subtext }}>正在读取统计数据...</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#f3d9c8',
              backgroundColor: colors.dangerBg,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <AlertTriangle color={colors.danger} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#a24f2d' }}>加载失败</Text>
              <Text style={{ marginTop: 4, fontSize: 13, lineHeight: 20, color: '#8f573f' }}>{errorMessage}</Text>
            </View>
          </View>
        ) : null}

        {query.data ? (
          <>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <MetricCard label="总请求" value={formatCompactNumber(totalRequests)} icon={Cable} tone="dark" />
              <MetricCard label="成功请求" value={formatCompactNumber(successRequests)} icon={ShieldCheck} />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <MetricCard label="失败请求" value={formatCompactNumber(failedRequests)} icon={AlertTriangle} />
              <MetricCard label="总 Tokens" value={formatCompactNumber(totalTokens)} icon={Waypoints} />
            </View>

            <Section
              title="使用趋势"
              subtitle="按天查看请求和 Token 的变化，按小时查看一天内分布。"
              right={
                <View style={{ borderRadius: 999, backgroundColor: colors.successBg, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>{apiEntries.length} 个 Key</Text>
                </View>
              }
            >
              <View style={{ gap: 12 }}>
                <TrendChart title="按天请求" subtitle="最近请求量变化" points={requestByDayPoints} />
                <TrendChart title="按天 Tokens" subtitle="最近 Tokens 变化" points={tokenByDayPoints} color="#a06a1d" />
                <BarList title="按小时请求" subtitle="一天内请求分布" items={requestByHourItems} />
                <BarList title="按小时 Tokens" subtitle="一天内 Tokens 分布" items={tokenByHourItems} color="#a06a1d" />
              </View>
            </Section>

            <Section title="按 API Key 分组" subtitle="查看每个 Key 的请求量、Token 使用和模型数量。">
              <View style={{ gap: 12 }}>
                {apiEntries.length > 0 ? (
                  apiEntries.map((api) => (
                    <KeyGroupCard
                      key={api.key}
                      title={maskApiKey(api.key)}
                      totalRequests={api.totalRequests}
                      totalTokens={api.totalTokens}
                      modelCount={api.modelCount}
                    >
                      <Text style={{ fontSize: 12, color: colors.subtext }}>
                        {api.modelCount > 0 ? '包含模型明细' : '当前没有模型维度数据'}
                      </Text>
                    </KeyGroupCard>
                  ))
                ) : (
                  <EmptyBlock title="暂无 API Key 数据" subtitle="当前没有返回按 Key 聚合的统计结果。" />
                )}
              </View>
            </Section>

            <Section title="按模型分组" subtitle="展开每个 API Key 下的模型明细。">
              <View style={{ gap: 12 }}>
                {modelGroups.length > 0 ? (
                  modelGroups.map((api) => (
                    <KeyGroupCard
                      key={api.key}
                      title={maskApiKey(api.key)}
                      totalRequests={api.totalRequests}
                      totalTokens={api.totalTokens}
                      modelCount={api.modelCount}
                    >
                      <View style={{ gap: 8 }}>
                        {api.modelEntries.length > 0 ? (
                          api.modelEntries.map((model) => (
                            <View
                              key={model.modelName}
                              style={{
                                borderRadius: 12,
                                backgroundColor: colors.card,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                              }}
                            >
                              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{model.modelName}</Text>
                              <Text style={{ marginTop: 4, fontSize: 12, color: colors.subtext }}>
                                {formatCompactNumber(model.totalRequests)} 次 · {formatCompactNumber(model.totalTokens)} Tokens
                              </Text>
                            </View>
                          ))
                        ) : (
                          <Text style={{ fontSize: 12, color: colors.subtext }}>暂无模型维度数据</Text>
                        )}
                      </View>
                    </KeyGroupCard>
                  ))
                ) : (
                  <EmptyBlock title="暂无模型维度数据" subtitle="当前没有返回可展开的模型统计。" />
                )}
              </View>
            </Section>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
