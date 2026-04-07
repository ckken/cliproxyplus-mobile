import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Button, Card, ControlField, Input, Label, Separator, TextField } from 'heroui-native';

import { getAuthStatus, getManagementConfig, getOverview, updateDebug, updateDisableCooling, updateForceModelPrefix, updateMaxRetryCredentials, updateMaxRetryInterval, updateProxyUrl, updateQuotaExceeded, updateRequestLog, updateRequestRetry, updateRoutingStrategy, updateWebsocketAuth } from '@/src/services/admin';
import { adminConfigState, removeAdminAccount, switchAdminAccount } from '@/src/store/admin-config';
import type { AdminAccountProfile } from '@/src/store/admin-config';
import { formatRelativeTime } from '@/src/lib/formatters';

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
  const [switchProject, setSwitchProject] = useState(false);
  const [switchPreviewModel, setSwitchPreviewModel] = useState(false);
  const [maxRetryCredentials, setMaxRetryCredentials] = useState('0');
  const [requestRetry, setRequestRetry] = useState('3');
  const [maxRetryInterval, setMaxRetryInterval] = useState('30');
  const [routingStrategy, setRoutingStrategy] = useState('fill-first');
  const [disableCooling, setDisableCooling] = useState(false);
  const [baseMessage, setBaseMessage] = useState('');
  const [quotaMessage, setQuotaMessage] = useState('');

  useEffect(() => {
    const quotaExceeded = data['quota-exceeded'] ?? {};
    setProxyUrl(String(data['proxy-url'] || ''));
    setSwitchProject(Boolean(quotaExceeded['switch-project']));
    setSwitchPreviewModel(Boolean(quotaExceeded['switch-preview-model']));
    setMaxRetryCredentials(String(data['max-retry-credentials'] ?? 0));
    setRequestRetry(String(data['request-retry'] ?? 3));
    setMaxRetryInterval(String(data['max-retry-interval'] ?? 30));
    setRoutingStrategy(String(data.routing?.strategy ?? 'fill-first'));
    setDisableCooling(Boolean(data['disable-cooling']));
  }, [data]);

  const refreshAll = async () => {
    await Promise.all([
      query.refetch(),
      queryClient.invalidateQueries({ queryKey: ['overview'] }),
      queryClient.invalidateQueries({ queryKey: ['auth-status'] }),
      queryClient.invalidateQueries({ queryKey: ['accounts'] }),
    ]);
  };

  const handleSwitchAccount = async (accountId: string) => {
    await switchAdminAccount(accountId);
    queryClient.clear();
    await Promise.all([
      query.refetch(),
      queryClient.fetchQuery({ queryKey: ['overview'], queryFn: getOverview }),
      queryClient.fetchQuery({ queryKey: ['auth-status'], queryFn: getAuthStatus }),
    ]);
  };

  const handleRemoveAccount = (accountId: string) => {
    Alert.alert('删除账号', '确认删除这个已保存账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await removeAdminAccount(accountId);
            await refreshAll();
          })();
        },
      },
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
      setBaseMessage('基础配置已更新');
      await refreshAll();
    },
    onError: (error) => setBaseMessage(error instanceof Error ? error.message : '保存失败'),
  });

  const saveQuotaSettings = useMutation({
    mutationFn: async () => {
      await updateQuotaExceeded({
        'switch-project': switchProject,
        'switch-preview-model': switchPreviewModel,
      });
      await updateMaxRetryCredentials(Number(maxRetryCredentials || 0));
      await updateRequestRetry(Number(requestRetry || 0));
      await updateMaxRetryInterval(Number(maxRetryInterval || 0));
      await updateDisableCooling(disableCooling);
    },
    onSuccess: async () => {
      setQuotaMessage('配额设置已更新');
      await refreshAll();
    },
    onError: (error) => setQuotaMessage(error instanceof Error ? error.message : '保存失败'),
  });

  const saveTextSettings = useMutation({
    mutationFn: async () => {
      await updateProxyUrl(proxyUrl.trim());
      await updateRequestRetry(Number(requestRetry || 0));
      await updateMaxRetryInterval(Number(maxRetryInterval || 0));
      await updateRoutingStrategy(routingStrategy);
    },
    onSuccess: async () => {
      setBaseMessage('基础配置已更新');
      await refreshAll();
    },
    onError: (error) => setBaseMessage(error instanceof Error ? error.message : '保存失败'),
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
              onPress={() => router.push({ pathname: '/login', params: { addNew: 'true' } })}
              className="mt-2 self-start"
            >
              添加新账号
            </Button>
          </Card.Body>
        </Card>

        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-3 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <Card.Title className="text-lg font-bold text-[#16181a]">已保存账号</Card.Title>
              <Text className="text-[12px] text-[#6f665c]">当前账号会高亮</Text>
            </View>

            {config.accounts.length === 0 ? (
              <View className="rounded-[14px] bg-[#f4efe4] p-4">
                <Text className="text-sm font-semibold text-[#16181a]">暂无已保存账号</Text>
                <Text className="mt-1 text-xs text-[#6f665c]">先添加一个管理账号，再回来切换和删除。</Text>
              </View>
            ) : (
              <View className="gap-2">
                {config.accounts.map((account: AdminAccountProfile) => {
                  const isActive = account.id === config.activeAccountId;
                  return (
                    <View
                      key={account.id}
                      className="rounded-[16px] border p-3"
                      style={{ borderColor: isActive ? '#1d5f55' : '#e5ddcf', backgroundColor: isActive ? '#eef8f5' : '#fff' }}
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-[15px] font-semibold text-[#16181a]" numberOfLines={1}>{account.label}</Text>
                          <Text className="mt-1 text-[12px] text-[#6f665c]" numberOfLines={1}>
                            {account.baseUrl}
                          </Text>
                          <Text className="mt-1 text-[11px] text-[#8a8072]">
                            更新于 {formatRelativeTime(account.updatedAt)}
                          </Text>
                        </View>
                        <View className="items-end gap-2">
                          {isActive ? (
                            <View className="rounded-full bg-[#d1fae5] px-2.5 py-1">
                              <Text className="text-[11px] font-semibold text-[#065f46]">当前</Text>
                            </View>
                          ) : (
                            <Pressable
                              onPress={() => void handleSwitchAccount(account.id)}
                              className="rounded-full bg-[#1d5f55] px-3 py-1.5"
                            >
                              <Text className="text-[11px] font-semibold text-white">切换</Text>
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => handleRemoveAccount(account.id)}
                            className="rounded-full bg-[#f3e2df] px-3 py-1.5"
                          >
                            <Text className="text-[11px] font-semibold text-[#c44b3f]">删除</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
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

            {baseMessage ? <Text style={{ color: colors.success, fontSize: 13 }}>{baseMessage}</Text> : null}

            <Button
              variant="primary"
              onPress={() => saveTextSettings.mutate()}
              className="rounded-[16px] bg-[#1d5f55]"
            >
              {saveTextSettings.isPending ? '保存中...' : '保存设置'}
            </Button>
          </Card.Body>
        </Card>

        <Card className="rounded-[18px] bg-[#fbf8f2]">
          <Card.Body className="gap-3 p-4">
            <Card.Title className="text-lg font-bold text-[#16181a]">配额管理</Card.Title>

            <View className="rounded-[14px] bg-[#f4efe4] p-3">
              <Text className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f665c]">配额超限</Text>
              <RowSwitch label="超限时切换项目" value={switchProject} onChange={setSwitchProject} />
              <Separator className="bg-[#eee6d7]" />
              <RowSwitch label="超限时切换预览模型" value={switchPreviewModel} onChange={setSwitchPreviewModel} />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField>
                  <Label className="mb-1 text-xs text-[#6f665c]">Max Retry Credentials</Label>
                  <Input
                    value={maxRetryCredentials}
                    onChangeText={setMaxRetryCredentials}
                    keyboardType="numeric"
                  />
                </TextField>
              </View>
              <View className="flex-1">
                <View className="rounded-[14px] border border-[#e5ddcf] bg-white px-3 py-3">
                  <RowSwitch label="禁用冷却" value={disableCooling} onChange={setDisableCooling} />
                </View>
              </View>
            </View>

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

            <View className="rounded-[14px] bg-[#f4efe4] px-3 py-3">
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f665c]">商业模式</Text>
              <View className="mt-2 flex-row items-center gap-2">
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: data['commercial-mode'] ? '#e6f4ea' : '#f3e2df' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: data['commercial-mode'] ? '#2b7a4b' : '#c44b3f' }}>
                    {data['commercial-mode'] ? '开启' : '关闭'}
                  </Text>
                </View>
                <Text className="text-[12px] text-[#6f665c]">只读</Text>
              </View>
            </View>

            {quotaMessage ? <Text style={{ color: colors.success, fontSize: 13 }}>{quotaMessage}</Text> : null}

            <Button
              variant="primary"
              onPress={() => saveQuotaSettings.mutate()}
              className="rounded-[16px] bg-[#1d5f55]"
            >
              {saveQuotaSettings.isPending ? '保存中...' : '保存配额设置'}
            </Button>
          </Card.Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
