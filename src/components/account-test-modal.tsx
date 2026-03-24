import { useMutation, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { getAvailableModels, testAccount } from '@/src/services/admin';
import type { AdminAccount, AccountTestResult } from '@/src/types/admin';

type AccountTestModalProps = {
  visible: boolean;
  account: AdminAccount | null;
  onClose: () => void;
};

type ParsedTestSummary = {
  status: 'idle' | 'running' | 'success' | 'error';
  lines: string[];
  selectedModelLabel?: string;
  errorMessage?: string;
};

function parseResult(result: AccountTestResult, fallbackModelLabel?: string): ParsedTestSummary {
  const lines: string[] = [];
  let selectedModelLabel = fallbackModelLabel;
  let status: ParsedTestSummary['status'] = 'success';
  let errorMessage: string | undefined;

  result.events.forEach((event) => {
    switch (event.type) {
      case 'test_start':
        lines.push('已连接测试接口');
        if (event.model) {
          selectedModelLabel = event.model;
          lines.push(`测试模型：${event.model}`);
        }
        break;
      case 'content':
        if (event.text) {
          lines.push(event.text);
        }
        break;
      case 'test_complete':
        if (event.success === false) {
          status = 'error';
          errorMessage = event.error || '测试失败';
        }
        break;
      case 'error':
        status = 'error';
        errorMessage = event.error || '测试失败';
        break;
      default:
        if (event.text) {
          lines.push(event.text);
        }
        break;
    }
  });

  if (lines.length === 0 && result.rawText.trim()) {
    lines.push(result.rawText.trim());
  }

  return { status, lines, selectedModelLabel, errorMessage };
}

export function AccountTestModal({ visible, account, onClose }: AccountTestModalProps) {
  const isSoraAccount = account?.platform === 'sora';
  const [selectedModelId, setSelectedModelId] = useState('');
  const [summary, setSummary] = useState<ParsedTestSummary>({ status: 'idle', lines: [] });

  const modelsQuery = useQuery({
    queryKey: ['account-models', account?.id],
    queryFn: () => getAvailableModels(account!.id),
    enabled: visible && Boolean(account?.id) && !isSoraAccount,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!visible) return;
    setSummary({ status: 'idle', lines: [] });
    setSelectedModelId('');
  }, [visible, account?.id]);

  useEffect(() => {
    const firstModelId = modelsQuery.data?.[0]?.id;
    if (!selectedModelId && firstModelId) {
      setSelectedModelId(firstModelId);
    }
  }, [modelsQuery.data, selectedModelId]);

  const selectedModel = useMemo(
    () => modelsQuery.data?.find((item) => item.id === selectedModelId),
    [modelsQuery.data, selectedModelId]
  );

  const testMutation = useMutation({
    mutationFn: () => testAccount(account!.id, isSoraAccount ? undefined : selectedModelId),
    onMutate: () => {
      setSummary({
        status: 'running',
        lines: [`开始测试账号 ${account?.name || ''}`.trim()],
        selectedModelLabel: selectedModel?.display_name,
      });
    },
    onSuccess: (result) => {
      setSummary(parseResult(result, selectedModel?.display_name));
    },
    onError: (error) => {
      const message = error instanceof Error && error.message ? error.message : '测试失败';
      setSummary({
        status: 'error',
        lines: ['测试请求失败'],
        selectedModelLabel: selectedModel?.display_name,
        errorMessage: message,
      });
    },
  });

  if (!account) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(22,24,26,0.38)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={{ maxHeight: '82%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fbf8f2', padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#16181a' }}>账号测试</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: '#6f665c' }}>{account.name} · {account.platform} · {account.type}</Text>
            </View>
            <Pressable onPress={onClose} style={{ borderRadius: 999, backgroundColor: '#ece5da', padding: 8 }}>
              <X size={16} color="#4e463e" />
            </Pressable>
          </View>

          <View style={{ marginTop: 14, borderRadius: 16, backgroundColor: '#f4efe4', padding: 12 }}>
            <Text style={{ fontSize: 12, color: '#6f665c' }}>状态</Text>
            <Text style={{ marginTop: 4, fontSize: 15, fontWeight: '700', color: '#16181a' }}>{account.status || 'unknown'}</Text>
            {!isSoraAccount ? (
              <>
                <Text style={{ marginTop: 12, fontSize: 12, color: '#6f665c' }}>测试模型</Text>
                {modelsQuery.isLoading ? (
                  <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="#1d5f55" />
                    <Text style={{ color: '#6f665c' }}>正在加载可用模型...</Text>
                  </View>
                ) : modelsQuery.data && modelsQuery.data.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8 }}>
                    {modelsQuery.data.map((item) => {
                      const active = item.id === selectedModelId;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => setSelectedModelId(item.id)}
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 12,
                            paddingVertical: 9,
                            backgroundColor: active ? '#1d5f55' : '#e7dfcf',
                          }}
                        >
                          <Text style={{ color: active ? '#fff' : '#4e463e', fontSize: 12, fontWeight: '700' }}>{item.display_name}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text style={{ marginTop: 8, fontSize: 12, color: '#a4512b' }}>未拉到可测试模型，暂时不能发起测试。</Text>
                )}
              </>
            ) : (
              <Text style={{ marginTop: 12, fontSize: 12, lineHeight: 18, color: '#6f665c' }}>Sora 账号走平台默认测试流程，不需要选择模型。</Text>
            )}
          </View>

          <View style={{ marginTop: 14, borderRadius: 16, backgroundColor: '#16181a', padding: 12 }}>
            <Text style={{ fontSize: 12, color: '#f6f1e8' }}>测试输出</Text>
            {summary.selectedModelLabel ? (
              <Text style={{ marginTop: 6, fontSize: 12, color: '#c8c0b4' }}>模型：{summary.selectedModelLabel}</Text>
            ) : null}
            <ScrollView style={{ marginTop: 10, maxHeight: 240 }}>
              {summary.lines.length === 0 ? (
                <Text style={{ color: '#9b9081', lineHeight: 20 }}>点击下方按钮后，这里会展示测试返回内容。</Text>
              ) : (
                summary.lines.map((line, index) => (
                  <Text key={`${line}-${index}`} style={{ marginBottom: 6, color: '#e7dfcf', lineHeight: 20 }}>
                    {line}
                  </Text>
                ))
              )}
              {summary.errorMessage ? (
                <Text style={{ marginTop: 8, color: '#efb19a', lineHeight: 20 }}>错误：{summary.errorMessage}</Text>
              ) : null}
            </ScrollView>
          </View>

          <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={onClose} style={{ flex: 1, borderRadius: 14, backgroundColor: '#e7dfcf', paddingVertical: 13, alignItems: 'center' }}>
              <Text style={{ color: '#4e463e', fontWeight: '700' }}>关闭</Text>
            </Pressable>
            <Pressable
              onPress={() => testMutation.mutate()}
              disabled={testMutation.isPending || (!isSoraAccount && !selectedModelId)}
              style={{
                flex: 1,
                borderRadius: 14,
                backgroundColor: testMutation.isPending || (!isSoraAccount && !selectedModelId) ? '#8a8072' : '#1b1d1f',
                paddingVertical: 13,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>{testMutation.isPending ? '测试中...' : '开始测试'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
