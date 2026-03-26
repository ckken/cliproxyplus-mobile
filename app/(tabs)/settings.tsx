import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Button, Card, ControlField, Input, Label, Separator, TextField } from 'heroui-native';

import { getManagementConfig, updateDebug, updateForceModelPrefix, updateMaxRetryInterval, updateProxyUrl, updateRequestLog, updateRequestRetry, updateRoutingStrategy, updateWebsocketAuth } from '@/src/services/admin';
import { adminConfigState } from '@/src/store/admin-config';

const { useSnapshot } = require('valtio/react');

const colors = { page: '#f4efe4', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55', success: '#2b7a4b' };

function RowSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (next: boolean) => void }) {
  return (
    <ControlField isSelected={value} onSelectedChange={onChange}>
      <View className="flex-1">
        <Label className="text-sm font-semibold text-[#16181a]">{label}</Label>
      </View>
      <ControlField.Indicator />
    </ControlField>
  );
}

export default function SettingsScreen() {
  const config = useSnapshot(adminConfigState);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['management-config'], queryFn: getManagementConfig });
  const data = query.data ?? {};

  const [proxyUrl, setProxyUrl] = useState('');
  const [requestRetry, setRequestRetry] = useState('3');
  const [maxRetryInterval, setMaxRetryInterval] = useState('30');
  const [routingStrategy, setRoutingStrategy] = useState('fill-first');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setProxyUrl(String(data['proxy-url'] || ''));
    setRequestRetry(String(data['request-retry'] ?? 3));
    setMaxRetryInterval(String(data['max-retry-interval'] ?? 30));
    setRoutingStrategy(String(data.routing?.strategy ?? 'fill-first'));
  }, [data]);

  const refreshAll = async () => {
    await Promise.all([
      query.refetch(),
      queryClient.invalidateQueries({ queryKey: ['overview'] }),
      queryClient.invalidateQueries({ queryKey: ['auth-status'] }),
    ]);
  };

  const boolMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      if (key === 'request-log') return updateRequestLog(value);
      if (key === 'debug') return updateDebug(value);
      if (key === 'ws-auth') return updateWebsocketAuth(value);
      if (key === 'force-model-prefix') return updateForceModelPrefix(value);
      throw new Error('UNSUPPORTED_BOOLEAN_SETTING');
    },
    onSuccess: async () => {
      setMessage('已保存');
      await refreshAll();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '保存失败'),
  });

  const saveTextSettings = useMutation({
    mutationFn: async () => {
      await updateProxyUrl(proxyUrl.trim());
      await updateRequestRetry(Number(requestRetry || 0));
      await updateMaxRetryInterval(Number(maxRetryInterval || 0));
      await updateRoutingStrategy(routingStrategy);
    },
    onSuccess: async () => {
      setMessage('设置已更新');
      await refreshAll();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '保存失败'),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110, gap: 12 }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>设置</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>当前服务器与基础管理配置。</Text>
        </View>

        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-2.5 p-4">
            <Card.Title className="text-lg font-bold text-[#16181a]">当前服务器</Card.Title>
            <Text className="text-[13px] text-[#6f665c]">Base URL: {config.baseUrl || '-'}</Text>
            <Text className="text-[13px] text-[#6f665c]">已保存账号数: {config.accounts.length}</Text>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => router.push('/login')}
              className="mt-2 self-start"
            >
              切换 / 重新配置
            </Button>
          </Card.Body>
        </Card>

        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-2 p-4">
            <Card.Title className="mb-1 text-lg font-bold text-[#16181a]">功能开关</Card.Title>
            <RowSwitch label="Request Log" value={Boolean(data['request-log'])} onChange={(next) => boolMutation.mutate({ key: 'request-log', value: next })} />
            <Separator className="bg-[#eee6d7]" />
            <RowSwitch label="Debug" value={Boolean(data.debug)} onChange={(next) => boolMutation.mutate({ key: 'debug', value: next })} />
            <Separator className="bg-[#eee6d7]" />
            <RowSwitch label="WebSocket Auth" value={Boolean(data['ws-auth'])} onChange={(next) => boolMutation.mutate({ key: 'ws-auth', value: next })} />
            <Separator className="bg-[#eee6d7]" />
            <RowSwitch label="Force Model Prefix" value={Boolean(data['force-model-prefix'])} onChange={(next) => boolMutation.mutate({ key: 'force-model-prefix', value: next })} />
          </Card.Body>
        </Card>

        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-3 p-4">
            <Card.Title className="text-lg font-bold text-[#16181a]">基础配置</Card.Title>

            <TextField>
              <Label className="mb-1 text-xs text-[#6f665c]">Proxy URL</Label>
              <Input
                value={proxyUrl}
                onChangeText={setProxyUrl}
                placeholder="http://127.0.0.1:7890"
                autoCapitalize="none"
              />
            </TextField>

            <TextField>
              <Label className="mb-1 text-xs text-[#6f665c]">Routing Strategy</Label>
              <Input
                value={routingStrategy}
                onChangeText={setRoutingStrategy}
                placeholder="fill-first / round-robin"
                autoCapitalize="none"
              />
            </TextField>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField>
                  <Label className="mb-1 text-xs text-[#6f665c]">Request Retry</Label>
                  <Input
                    value={requestRetry}
                    onChangeText={setRequestRetry}
                    keyboardType="numeric"
                  />
                </TextField>
              </View>
              <View className="flex-1">
                <TextField>
                  <Label className="mb-1 text-xs text-[#6f665c]">Max Retry Interval</Label>
                  <Input
                    value={maxRetryInterval}
                    onChangeText={setMaxRetryInterval}
                    keyboardType="numeric"
                  />
                </TextField>
              </View>
            </View>

            {message ? <Text style={{ color: colors.success, fontSize: 13 }}>{message}</Text> : null}

            <Button
              variant="primary"
              onPress={() => saveTextSettings.mutate()}
              className="rounded-[16px] bg-[#1d5f55]"
            >
              {saveTextSettings.isPending ? '保存中...' : '保存设置'}
            </Button>
          </Card.Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
