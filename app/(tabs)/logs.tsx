import { useQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { AlertTriangle, ArrowRight, FileText, RefreshCw, ScrollText } from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLogs, getRequestErrorLogs } from '@/src/services/admin';
import { formatFileSize, formatRelativeTime } from '@/src/lib/formatters';

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

export default function LogsScreen() {
  const queries = useQueries({
    queries: [
      { queryKey: ['logs'], queryFn: () => getLogs(80) },
      { queryKey: ['request-error-logs'], queryFn: getRequestErrorLogs },
    ],
  });

  const logData = queries[0].data;
  const errorData = queries[1].data;
  const refreshing = queries.some((item) => item.isRefetching);
  const refetchAll = () => queries.forEach((item) => void item.refetch());
  const files = errorData?.files ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} tintColor={colors.primary} />}
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>日志</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>查看主日志与错误日志列表。</Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: '#efe4d5' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <ScrollText color={colors.primary} size={18} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>主日志</Text>
            </View>
            <View style={{ backgroundColor: '#e7dfcf', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#5d564d' }}>{logData?.['line-count'] ?? 0} 行</Text>
            </View>
          </View>
          {queries[0].error instanceof Error ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 14, backgroundColor: '#fbf1eb', padding: 12 }}>
              <AlertTriangle color="#c25d35" size={16} />
              <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: '#8f573f' }}>{queries[0].error.message}</Text>
            </View>
          ) : null}
          <Text selectable style={{ fontSize: 12, lineHeight: 20, color: colors.subtext }}>
            {Array.isArray(logData?.lines) && logData?.lines.length > 0 ? logData.lines.join('\n') : '暂无日志或 logging-to-file 未开启'}
          </Text>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 12, borderWidth: 1, borderColor: '#efe4d5' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <FileText color={colors.primary} size={18} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>错误日志文件</Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.subtext }}>{files.length} 个文件</Text>
          </View>

          {queries[1].error instanceof Error ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 14, backgroundColor: '#fbf1eb', padding: 12 }}>
              <AlertTriangle color="#c25d35" size={16} />
              <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: '#8f573f' }}>{queries[1].error.message}</Text>
            </View>
          ) : null}

          {queries[1].isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 18 }}>
              <RefreshCw color={colors.primary} size={18} />
              <Text style={{ marginTop: 8, fontSize: 13, color: colors.subtext }}>正在读取错误日志文件...</Text>
            </View>
          ) : null}

          {!queries[1].isLoading && files.length === 0 ? (
            <View style={{ alignItems: 'center', borderRadius: 16, backgroundColor: '#f2eadc', paddingVertical: 22, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>暂无错误日志</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: colors.subtext }}>当请求失败并写入错误文件后会显示在这里。</Text>
            </View>
          ) : null}

          <View style={{ gap: 10 }}>
            {files.map((file) => (
              <Pressable
                key={file.name}
                onPress={() => router.push({ pathname: '/log-detail', params: { file: file.name } })}
                style={({ pressed }) => ({
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: pressed ? '#d8cbb7' : '#efe4d5',
                  backgroundColor: pressed ? '#f4eedf' : '#fbf8f2',
                  padding: 14,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <FileText color={colors.primary} size={16} />
                      <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                        {file.name}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.subtext }}>{formatRelativeTime(file.modified)}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <View style={{ backgroundColor: '#e6f4ee', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>{formatFileSize(file.size)}</Text>
                    </View>
                    <ArrowRight color="#9c9182" size={16} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
