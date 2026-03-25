import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getClaudeKeys,
  getCodexKeys,
  getGeminiKeys,
  getGenericApiKeys,
  getOpenAICompatibility,
  updateClaudeKeys,
  updateCodexKeys,
  updateGeminiKeys,
  updateGenericApiKeys,
  updateOpenAICompatibility,
} from '@/src/services/admin';
import { KeyListCard, extractKeys } from '@/src/components/key-list-card';

const colors = { page: '#f4efe4', text: '#16181a', primary: '#1d5f55' };

type KeyCategory = {
  title: string;
  queryKey: string;
  queryFn: () => Promise<unknown>;
  updateFn: (value: unknown) => Promise<{ status: string }>;
};

const KEY_CATEGORIES: KeyCategory[] = [
  { title: 'Claude', queryKey: 'claude-keys', queryFn: getClaudeKeys, updateFn: updateClaudeKeys },
  { title: 'Codex', queryKey: 'codex-keys', queryFn: getCodexKeys, updateFn: updateCodexKeys },
  { title: 'Gemini', queryKey: 'gemini-keys', queryFn: getGeminiKeys, updateFn: updateGeminiKeys },
  { title: 'API Keys', queryKey: 'generic-api-keys', queryFn: getGenericApiKeys, updateFn: updateGenericApiKeys },
  { title: 'OpenAI Compatibility', queryKey: 'openai-compat', queryFn: getOpenAICompatibility, updateFn: updateOpenAICompatibility },
];

function KeyCategoryCard({
  category,
  data,
  isLoading,
}: {
  category: KeyCategory;
  data: unknown;
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const { keys, isRaw } = extractKeys(data);

  const mutation = useMutation({
    mutationFn: (newKeys: string[]) => category.updateFn(newKeys),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [category.queryKey] });
    },
  });

  const handleAdd = (key: string) => {
    mutation.mutate([...keys, key]);
  };

  const handleDelete = (_key: string, index: number) => {
    const updated = keys.filter((_, i) => i !== index);
    mutation.mutate(updated);
  };

  return (
    <KeyListCard
      title={category.title}
      keys={isRaw ? [] : keys}
      rawData={isRaw ? data : undefined}
      isLoading={isLoading}
      isMutating={mutation.isPending}
      onAdd={handleAdd}
      onDelete={handleDelete}
    />
  );
}

export default function KeysScreen() {
  const queries = useQueries({
    queries: KEY_CATEGORIES.map((cat) => ({
      queryKey: [cat.queryKey],
      queryFn: cat.queryFn,
    })),
  });

  const refreshing = queries.some((q) => q.isRefetching);
  const refetchAll = () => queries.forEach((q) => void q.refetch());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} tintColor={colors.primary} />}
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Keys</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>
            管理 CLIProxyAPI Plus 各类 key 配置。
          </Text>
        </View>

        {KEY_CATEGORIES.map((cat, index) => (
          <KeyCategoryCard
            key={cat.queryKey}
            category={cat}
            data={queries[index].data}
            isLoading={queries[index].isLoading}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
