import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react-native';

import { getManagementConfig, updateDebug, updateDisableCooling, updateForceModelPrefix, updateMaxRetryCredentials, updateMaxRetryInterval, updateProxyUrl, updateQuotaExceeded, updateRequestLog, updateRequestRetry, updateRoutingStrategy, updateWebsocketAuth } from '@/src/services/admin';
import { formatRelativeTime } from '@/src/lib/formatters';
import { adminConfigState, removeAdminAccount, switchAdminAccount } from '@/src/store/admin-config';

const { useSnapshot } = require('valtio/react');

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', border: '#e7dfcf', primary: '#1d5f55', success: '#2b7a4b' };

function RowSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (next: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: '#78b4a4', false: '#d7cfbf' }} thumbColor="#fff" />
    </View>
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
  const [quotaSwitchProject, setQuotaSwitchProject] = useState(false);
  const [quotaSwitchPreviewModel, setQuotaSwitchPreviewModel] = useState(false);
  const [maxRetryCredentials, setMaxRetryCredentials] = useState('0');
  const [disableCooling, setDisableCooling] = useState(false);
  const [message, setMessage] = useState('');
  const [switchingAccountId, setSwitchingAccountId] = useState('');
  const [removingAccountId, setRemovingAccountId] = useState('');

  useEffect(() => {
    setProxyUrl(String(data['proxy-url'] || ''));
    setRequestRetry(String(data['request-retry'] ?? 3));
    setMaxRetryInterval(String(data['max-retry-interval'] ?? 30));
    setRoutingStrategy(String(data.routing?.strategy ?? 'fill-first'));
    setQuotaSwitchProject(Boolean(data['quota-exceeded']?.['switch-project']));
    setQuotaSwitchPreviewModel(Boolean(data['quota-exceeded']?.['switch-preview-model']));
    setMaxRetryCredentials(String(data['max-retry-credentials'] ?? 0));
    setDisableCooling(Boolean(data['disable-cooling']));
  }, [data]);

  const refreshAll = async () => {
    await Promise.all([
      query.refetch(),
      queryClient.invalidateQueries({ queryKey: ['overview'] }),
      queryClient.invalidateQueries({ queryKey: ['auth-status'] }),
    ]);
  };

  const handleSwitchAccount = async (accountId: string) => {
    setSwitchingAccountId(accountId);
    setMessage('');
    try {
      await switchAdminAccount(accountId);
      queryClient.clear();
      await refreshAll();
      setMessage('已切换账号');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '切换失败');
    } finally {
      setSwitchingAccountId('');
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    setRemovingAccountId(accountId);
    setMessage('');
    try {
      await removeAdminAccount(accountId);
      setMessage('账号已删除');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除失败');
    } finally {
      setRemovingAccountId('');
    }
  };

  const confirmRemoveAccount = (accountId: string, label: string) => {
    Alert.alert('确认删除', `确定要删除账号「${label}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          void handleRemoveAccount(accountId);
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
      if (key === 'disable-cooling') return updateDisableCooling(value);
      throw new Error('UNSUPPORTED_BOOLEAN_SETTING');
    },
    onSuccess: async () => {
      setMessage('已保存');
      await refreshAll();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '保存失败'),
  });

  const updateQuotaMutation = useMutation({
    mutationFn: async (next: { 'switch-project': boolean; 'switch-preview-model': boolean }) => updateQuotaExceeded(next),
    onSuccess: async () => { setMessage('配额管理已保存'); await refreshAll(); },
    onError: (error) => setMessage(error instanceof Error ? error.message : '保存失败'),
  });

  const updateMaxRetryCredentialsMutation = useMutation({
    mutationFn: async (value: number) => updateMaxRetryCredentials(value),
    onSuccess: async () => { setMessage('配额管理已保存'); await refreshAll(); },
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

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>当前服务器</Text>
          <Text style={{ fontSize: 13, color: colors.subtext }}>Base URL: {config.baseUrl || '-'}</Text>
          <Text style={{ fontSize: 13, color: colors.subtext }}>已保存账号数: {config.accounts.length}</Text>
          <Pressable onPress={() => router.push('/login?addNew=true')} style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ color: '#4e463e', fontSize: 13, fontWeight: '700' }}>切换 / 重新配置</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>已保存账号</Text>
            <Text style={{ fontSize: 12, color: colors.subtext }}>{config.accounts.length} 个</Text>
          </View>

          {config.accounts.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.subtext, lineHeight: 19 }}>暂无已保存账号。你可以添加新账号后在这里统一管理。</Text>
          ) : (
            config.accounts.map((account: { id: string; label: string; baseUrl: string; updatedAt: string; enabled?: boolean }) => {
              const isActive = account.id === config.activeAccountId;
              const isSwitching = switchingAccountId === account.id;
              const isRemoving = removingAccountId === account.id;

              return (
                <View
                  key={account.id}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: isActive ? colors.success : colors.border,
                    backgroundColor: isActive ? '#f4fbf5' : '#fffaf2',
                    padding: 14,
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                        {account.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.subtext }}>最后使用 {formatRelativeTime(account.updatedAt)}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {isActive ? (
                        <View style={{ borderRadius: 999, backgroundColor: '#d9f0de', paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>当前</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => void handleSwitchAccount(account.id)}
                          disabled={isSwitching || isRemoving}
                          style={{
                            borderRadius: 999,
                            backgroundColor: isSwitching || isRemoving ? '#c8c3b8' : colors.primary,
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{isSwitching ? '切换中...' : '切换'}</Text>
                        </Pressable>
                      )}

                      {!isActive ? (
                        <Pressable
                          onPress={() => confirmRemoveAccount(account.id, account.label)}
                          disabled={isSwitching || isRemoving}
                          hitSlop={8}
                          style={{ padding: 4, opacity: isSwitching || isRemoving ? 0.5 : 1 }}
                        >
                          <Trash2 size={16} color="#c25d35" />
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })
          )}

          <Pressable
            onPress={() => router.push('/login?addNew=true')}
            style={{
              alignSelf: 'flex-start',
              marginTop: 2,
              borderRadius: 12,
              backgroundColor: colors.primary,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>添加新账号</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>功能开关</Text>
          <RowSwitch label="Request Log" value={Boolean(data['request-log'])} onChange={(next) => boolMutation.mutate({ key: 'request-log', value: next })} />
          <RowSwitch label="Debug" value={Boolean(data.debug)} onChange={(next) => boolMutation.mutate({ key: 'debug', value: next })} />
          <RowSwitch label="WebSocket Auth" value={Boolean(data['ws-auth'])} onChange={(next) => boolMutation.mutate({ key: 'ws-auth', value: next })} />
          <RowSwitch label="Force Model Prefix" value={Boolean(data['force-model-prefix'])} onChange={(next) => boolMutation.mutate({ key: 'force-model-prefix', value: next })} />
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>配额管理</Text>
          <Text style={{ fontSize: 13, color: colors.subtext }}>控制配额超限后的自动切换行为和冷却策略。</Text>
          <RowSwitch label="配额超限自动切换项目" value={quotaSwitchProject} onChange={(next) => { setQuotaSwitchProject(next); updateQuotaMutation.mutate({ 'switch-project': next, 'switch-preview-model': quotaSwitchPreviewModel }); }} />
          <RowSwitch label="配额超限切换预览模型" value={quotaSwitchPreviewModel} onChange={(next) => { setQuotaSwitchPreviewModel(next); updateQuotaMutation.mutate({ 'switch-project': quotaSwitchProject, 'switch-preview-model': next }); }} />
          <View>
            <Text style={{ marginBottom: 8, fontSize: 12, color: colors.subtext }}>最大重试凭据数</Text>
            <TextInput value={maxRetryCredentials} onChangeText={setMaxRetryCredentials} onEndEditing={() => updateMaxRetryCredentialsMutation.mutate(Number(maxRetryCredentials || 0))} keyboardType="numeric" placeholder="0" placeholderTextColor="#9b9081" style={{ backgroundColor: '#f1ece2', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text }} />
          </View>
          <RowSwitch label="禁用冷却" value={disableCooling} onChange={(next) => boolMutation.mutate({ key: 'disable-cooling', value: next })} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>商业模式</Text>
            <Text style={{ color: colors.subtext, fontSize: 13 }}>{data['commercial-mode'] ? '已开启' : '未开启'}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>基础配置</Text>

          <View>
            <Text style={{ marginBottom: 8, fontSize: 12, color: colors.subtext }}>Proxy URL</Text>
            <TextInput value={proxyUrl} onChangeText={setProxyUrl} placeholder="http://127.0.0.1:7890" placeholderTextColor="#9b9081" autoCapitalize="none" style={{ backgroundColor: '#f1ece2', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text }} />
          </View>

          <View>
            <Text style={{ marginBottom: 8, fontSize: 12, color: colors.subtext }}>Routing Strategy</Text>
            <TextInput value={routingStrategy} onChangeText={setRoutingStrategy} placeholder="fill-first / round-robin" placeholderTextColor="#9b9081" autoCapitalize="none" style={{ backgroundColor: '#f1ece2', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text }} />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontSize: 12, color: colors.subtext }}>Request Retry</Text>
              <TextInput value={requestRetry} onChangeText={setRequestRetry} keyboardType="numeric" style={{ backgroundColor: '#f1ece2', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 8, fontSize: 12, color: colors.subtext }}>Max Retry Interval</Text>
              <TextInput value={maxRetryInterval} onChangeText={setMaxRetryInterval} keyboardType="numeric" style={{ backgroundColor: '#f1ece2', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text }} />
            </View>
          </View>

          {message ? <Text style={{ color: colors.success, fontSize: 13 }}>{message}</Text> : null}

          <Pressable onPress={() => saveTextSettings.mutate()} style={{ alignItems: 'center', borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{saveTextSettings.isPending ? '保存中...' : '保存设置'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
