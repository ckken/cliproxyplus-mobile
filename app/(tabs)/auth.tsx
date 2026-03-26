import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from 'heroui-native';
import { getAuthStatus } from '@/src/services/admin';

const colors = { page: '#f4efe4', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

export default function AuthScreen() {
  const query = useQuery({ queryKey: ['auth-status'], queryFn: getAuthStatus });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Auth</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>查看当前 OAuth / 登录状态。</Text>
        </View>
        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-2.5 p-4">
            <Card.Title className="text-lg font-bold text-[#16181a]">Auth Status</Card.Title>
            <Text selectable className="text-xs leading-5 text-[#6f665c]">{JSON.stringify(query.data ?? (query.error instanceof Error ? { error: query.error.message } : { loading: query.isLoading }), null, 2)}</Text>
          </Card.Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
