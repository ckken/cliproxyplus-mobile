import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { getManagementConfig, updateDebug, updateForceModelPrefix, updateMaxRetryInterval, updateProxyUrl, updateRequestLog, updateRequestRetry, updateRoutingStrategy, updateWebsocketAuth } from '@/src/services/admin';
import { adminConfigState } from '@/src/store/admin-config';

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

        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>当前服务器</Text>
          <Text style={{ fontSize: 13, color: colors.subtext }}>Base URL: {config.baseUrl || '-'}</Text>
          <Text style={{ fontSize: 13, color: colors.subtext }}>已保存账号数: {config.accounts.length}</Text>
          <Pressable onPress={() => router.push('/login')} style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ color: '#4e463e', fontSize: 13, fontWeight: '700' }}>切换 / 重新配置</Text>
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
