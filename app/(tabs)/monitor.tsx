import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOverview } from '@/src/services/admin';

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

function JsonCard({ title, value }: { title: string; value: unknown }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
      <Text selectable style={{ fontSize: 12, lineHeight: 20, color: colors.subtext }}>{JSON.stringify(value, null, 2)}</Text>
    </View>
  );
}

export default function MonitorScreen() {
  const query = useQuery({ queryKey: ['overview'], queryFn: getOverview });
  const data = query.data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>概览</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>第一版闭环：连接、读取概览、展示管理配置摘要。</Text>
        </View>

        {query.isLoading ? <JsonCard title="状态" value={{ loading: true }} /> : null}
        {query.error ? <JsonCard title="错误" value={{ message: query.error instanceof Error ? query.error.message : '加载失败' }} /> : null}
        {data ? (
          <>
            <JsonCard title="Usage" value={data.usage} />
            <JsonCard title="Config" value={data.config} />
            <JsonCard title="Latest Version" value={data.latestVersion} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
