import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthStatus } from '@/src/services/admin';

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

export default function AuthScreen() {
  const query = useQuery({ queryKey: ['auth-status'], queryFn: getAuthStatus });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Auth</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>查看当前 OAuth / 登录状态。</Text>
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Auth Status</Text>
          <Text selectable style={{ fontSize: 12, lineHeight: 20, color: colors.subtext }}>{JSON.stringify(query.data ?? (query.error instanceof Error ? { error: query.error.message } : { loading: query.isLoading }), null, 2)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
