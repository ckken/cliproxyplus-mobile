import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, AlertTriangle, FileText, LoaderCircle } from 'lucide-react-native';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRequestErrorLogDetail } from '@/src/services/admin';

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

function toFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function normalizeLogContent(payload: unknown) {
  if (typeof payload === 'string') {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidates = [record.content, record.data, record.text, record.message, record.log];

    for (const candidate of candidates) {
      if (typeof candidate === 'string') {
        return candidate;
      }
    }

    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  }

  if (payload == null) {
    return '';
  }

  return String(payload);
}

export default function LogDetailScreen() {
  const params = useLocalSearchParams<{ file?: string | string[] }>();
  const file = toFirstParam(params.file);

  const query = useQuery({
    queryKey: ['request-error-log-detail', file],
    queryFn: () => getRequestErrorLogDetail(file ?? ''),
    enabled: Boolean(file),
  });

  const content = normalizeLogContent(query.data);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace('/logs');
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              backgroundColor: pressed ? '#ece2d0' : colors.card,
              borderWidth: 1,
              borderColor: '#e7dfcf',
              paddingHorizontal: 12,
              paddingVertical: 10,
            })}
          >
            <ArrowLeft color={colors.text} size={16} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>返回</Text>
          </Pressable>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: colors.subtext }}>错误日志详情</Text>
            <Text numberOfLines={1} style={{ marginTop: 2, maxWidth: '100%', fontSize: 14, fontWeight: '700', color: colors.text }}>
              {file || '未选择文件'}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, borderRadius: 20, borderWidth: 1, borderColor: '#efe4d5', backgroundColor: colors.card, overflow: 'hidden' }}>
          {query.isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ marginTop: 10, fontSize: 13, color: colors.subtext }}>正在读取日志内容...</Text>
            </View>
          ) : query.error ? (
            <View style={{ flex: 1, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 16, backgroundColor: '#fbf1eb', padding: 12 }}>
                <AlertTriangle color="#c25d35" size={16} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#a24f2d' }}>读取失败</Text>
                  <Text style={{ marginTop: 4, fontSize: 13, lineHeight: 19, color: '#8f573f' }}>
                    {query.error instanceof Error ? query.error.message : '未知错误'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FileText color={colors.primary} size={16} />
                <Text style={{ fontSize: 12, color: colors.subtext }}>可滚动查看，长按可选择复制</Text>
              </View>
              <Text
                selectable
                style={{
                  fontSize: 12,
                  lineHeight: 20,
                  color: colors.text,
                  fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
                }}
              >
                {content || '暂无日志内容'}
              </Text>
            </ScrollView>
          )}
        </View>

        {query.isFetching && !query.isLoading ? (
          <View style={{ position: 'absolute', right: 24, bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, backgroundColor: '#1d5f55', paddingHorizontal: 12, paddingVertical: 10 }}>
            <LoaderCircle color="#fff" size={14} />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>更新中</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
