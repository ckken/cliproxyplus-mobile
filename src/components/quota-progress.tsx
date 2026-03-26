import { Text, View } from 'react-native';
import { formatCountdown, formatPercentage } from '@/src/lib/formatters';
import type { QuotaWindowStats } from '@/src/types/admin';

function barColor(pct: number) {
  if (pct < 60) return '#2b7a4b';
  if (pct <= 85) return '#c49a1a';
  return '#c44b3f';
}

type QuotaProgressProps = {
  quota: QuotaWindowStats;
  label?: string;
};

export function QuotaProgress({ quota, label }: QuotaProgressProps) {
  const pct = formatPercentage(quota.used, quota.limit);
  const color = barColor(pct);
  const countdown = formatCountdown(quota.resets_at);

  return (
    <View style={{ gap: 4 }}>
      {label ? (
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#6f665c' }}>{label}</Text>
      ) : null}
      <View style={{ height: 8, backgroundColor: '#ebe5d8', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 11, color: '#6f665c' }}>
          {pct}% 已用 ({quota.used}/{quota.limit})
        </Text>
        {quota.resets_at ? (
          <Text style={{ fontSize: 11, color: '#8a8072' }}>重置: {countdown}</Text>
        ) : null}
      </View>
    </View>
  );
}
