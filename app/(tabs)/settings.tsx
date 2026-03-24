import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getManagementConfig } from '@/src/services/admin';
import { adminConfigState } from '@/src/store/admin-config';
const { useSnapshot } = require('valtio/react');

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55', border: '#e7dfcf' };

export default function SettingsScreen() {
  const config = useSnapshot(adminConfigState);
  const query = useQuery({ queryKey: ['management-config'], queryFn: getManagementConfig });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>设置</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>当前服务器与管理配置摘要。</Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>当前服务器</Text>
          <Text style={{ fontSize: 13, color: colors.subtext }}>Base URL: {config.baseUrl || '-'}</Text>
          <Text style={{ fontSize: 13, color: colors.subtext }}>已保存账号数: {config.accounts.length}</Text>
          <Pressable onPress={() => router.push('/login')} style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ color: '#4e463e', fontSize: 13, fontWeight: '700' }}>切换 / 重新配置</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Management Config</Text>
          <Text selectable style={{ fontSize: 12, lineHeight: 20, color: colors.subtext }}>{JSON.stringify(query.data ?? (query.error instanceof Error ? { error: query.error.message } : { loading: query.isLoading }), null, 2)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
