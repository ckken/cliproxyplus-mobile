import { useQueries } from '@tanstack/react-query';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getClaudeKeys, getCodexKeys, getGeminiKeys, getGenericApiKeys, getOpenAICompatibility } from '@/src/services/admin';

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

function JsonCard({ title, value }: { title: string; value: unknown }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
      <Text selectable style={{ fontSize: 12, lineHeight: 20, color: colors.subtext }}>{JSON.stringify(value, null, 2)}</Text>
    </View>
  );
}

export default function KeysScreen() {
  const queries = useQueries({ queries: [
    { queryKey: ['claude-keys'], queryFn: getClaudeKeys },
    { queryKey: ['codex-keys'], queryFn: getCodexKeys },
    { queryKey: ['gemini-keys'], queryFn: getGeminiKeys },
    { queryKey: ['generic-api-keys'], queryFn: getGenericApiKeys },
    { queryKey: ['openai-compat'], queryFn: getOpenAICompatibility },
  ]});

  const refreshing = queries.some((q) => q.isRefetching);
  const refetchAll = () => queries.forEach((q) => void q.refetch());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} tintColor={colors.primary} />}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Keys</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>查看 CLIProxyAPI Plus 当前各类 key 配置。</Text>
        </View>
        <JsonCard title="Claude" value={queries[0].data ?? (queries[0].error instanceof Error ? { error: queries[0].error.message } : { loading: queries[0].isLoading })} />
        <JsonCard title="Codex" value={queries[1].data ?? (queries[1].error instanceof Error ? { error: queries[1].error.message } : { loading: queries[1].isLoading })} />
        <JsonCard title="Gemini" value={queries[2].data ?? (queries[2].error instanceof Error ? { error: queries[2].error.message } : { loading: queries[2].isLoading })} />
        <JsonCard title="API Keys" value={queries[3].data ?? (queries[3].error instanceof Error ? { error: queries[3].error.message } : { loading: queries[3].isLoading })} />
        <JsonCard title="OpenAI Compatibility" value={queries[4].data ?? (queries[4].error instanceof Error ? { error: queries[4].error.message } : { loading: queries[4].isLoading })} />
      </ScrollView>
    </SafeAreaView>
  );
}
