import { Redirect, router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { getOverview } from '@/src/services/admin';
import { AdminError } from '@/src/lib/admin-fetch';
import { queryClient } from '@/src/lib/query-client';
import { adminConfigState, hasAuthenticatedAdminSession, saveAdminConfig } from '@/src/store/admin-config';

const { useSnapshot } = require('valtio/react');

const schema = z.object({
  baseUrl: z.string().min(1, '请输入管理地址'),
  adminApiKey: z.string().min(1, '请输入 Management Password'),
});

type FormValues = z.infer<typeof schema>;

const colors = {
  page: '#f4efe4',
  card: '#fbf8f2',
  mutedCard: '#f1ece2',
  primary: '#1d5f55',
  text: '#16181a',
  subtext: '#6f665c',
  dangerBg: '#fbf1eb',
  danger: '#c25d35',
};

export default function LoginScreen() {
  const config = useSnapshot(adminConfigState);
  const hasAccount = hasAuthenticatedAdminSession(config);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { baseUrl: config.baseUrl, adminApiKey: config.adminApiKey },
  });
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  if (hasAccount) {
    return <Redirect href="/monitor" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 34, fontWeight: '800', color: colors.text }}>CLIProxyAPI Plus Mobile</Text>
            <Text style={{ fontSize: 14, lineHeight: 22, color: colors.subtext }}>
              输入管理地址和 Management Password，验证通过后进入移动控制台。
            </Text>
          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: 22, padding: 18, gap: 16 }}>
            <View>
              <Text style={{ marginBottom: 8, fontSize: 12, color: colors.subtext }}>管理地址</Text>
              <Controller
                control={control}
                name="baseUrl"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="例如：http://127.0.0.1:8080"
                    placeholderTextColor="#9b9081"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ backgroundColor: colors.mutedCard, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text }}
                  />
                )}
              />
            </View>

            <View>
              <Text style={{ marginBottom: 8, fontSize: 12, color: colors.subtext }}>Management Password</Text>
              <Controller
                control={control}
                name="adminApiKey"
                render={({ field: { onChange, value } }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="management-password"
                      placeholderTextColor="#9b9081"
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!showSecret}
                      style={{ flex: 1, backgroundColor: colors.mutedCard, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text }}
                    />
                    <Pressable onPress={() => setShowSecret((v) => !v)} style={{ backgroundColor: '#e7dfcf', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#4e463e' }}>{showSecret ? '隐藏' : '显示'}</Text>
                    </Pressable>
                  </View>
                )}
              />
            </View>

            {(formState.errors.baseUrl || formState.errors.adminApiKey || message) ? (
              <View style={{ borderRadius: 14, backgroundColor: colors.dangerBg, paddingHorizontal: 14, paddingVertical: 12 }}>
                <Text style={{ color: colors.danger, fontSize: 14 }}>{formState.errors.baseUrl?.message || formState.errors.adminApiKey?.message || message}</Text>
              </View>
            ) : null}

            <Pressable
              style={{ backgroundColor: checking ? '#7ca89f' : colors.primary, borderRadius: 18, paddingVertical: 15, alignItems: 'center' }}
              disabled={checking}
              onPress={handleSubmit(async (values) => {
                setChecking(true);
                setMessage('');
                try {
                  await saveAdminConfig(values);
                  queryClient.clear();
                  await queryClient.fetchQuery({ queryKey: ['overview'], queryFn: getOverview });
                  router.replace('/monitor');
                } catch (error) {
                  if (error instanceof AdminError) {
                    setMessage(error.userMessage);
                  } else if (error instanceof Error) {
                    setMessage(error.message);
                  } else {
                    setMessage('连接失败');
                  }
                } finally {
                  setChecking(false);
                }
              })}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{checking ? '连接中...' : '进入应用'}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
