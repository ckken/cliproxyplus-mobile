import { useQueries } from '@tanstack/react-query';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from 'heroui-native';

import { getLogs, getRequestErrorLogs } from '@/src/services/admin';

const colors = { page: '#f4efe4', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} tintColor={colors.primary} />}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>日志</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>查看主日志与错误日志列表。</Text>
        </View>

        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-2.5 p-4">
            <Card.Title className="text-lg font-bold text-[#16181a]">Main Logs</Card.Title>
            <Card.Description className="text-xs text-[#6f665c]">
              {queries[0].error instanceof Error ? queries[0].error.message : `${logData?.['line-count'] ?? 0} lines`}
            </Card.Description>
            <Text selectable className="text-xs leading-5 text-[#6f665c]">
              {Array.isArray(logData?.lines) && logData?.lines.length > 0 ? logData.lines.join('\n') : '暂无日志或 logging-to-file 未开启'}
            </Text>
          </Card.Body>
        </Card>

        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-2.5 p-4">
            <Card.Title className="text-lg font-bold text-[#16181a]">Request Error Logs</Card.Title>
            <Text selectable className="text-xs leading-5 text-[#6f665c]">
              {queries[1].error instanceof Error
                ? queries[1].error.message
                : JSON.stringify(errorData?.files ?? [], null, 2)}
            </Text>
          </Card.Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
