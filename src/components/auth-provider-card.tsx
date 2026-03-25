import { ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { Linking, Pressable, Text, View } from 'react-native';
import type { AuthProvider } from '@/src/types/admin';

const colors = {
  page: '#f4efe4',
  card: '#fbf8f2',
  text: '#16181a',
  subtext: '#6f665c',
  primary: '#1d5f55',
};

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) return dateString;
    const diffMinutes = Math.floor(diffMs / 60_000);
    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes} 分钟前`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} 小时前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} 天前`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} 个月前`;
  } catch {
    return dateString;
  }
}

type AuthProviderCardProps = {
  provider: AuthProvider;
};

export function AuthProviderCard({ provider }: AuthProviderCardProps) {
  const handleAuthorize = () => {
    if (provider.authUrl) {
      Linking.openURL(provider.authUrl);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 16,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          {provider.authorized ? (
            <ShieldCheck color="#2e8b57" size={22} />
          ) : (
            <ShieldAlert color="#9e9e9e" size={22} />
          )}
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} numberOfLines={1}>
            {provider.name}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: provider.authorized ? '#e8f5e9' : '#f0f0f0',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: provider.authorized ? '#2e8b57' : '#9e9e9e',
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: provider.authorized ? '#2e8b57' : '#6f665c',
            }}
          >
            {provider.authorized ? '已授权' : '未授权'}
          </Text>
        </View>
      </View>

      {provider.lastVerified ? (
        <Text style={{ fontSize: 12, color: colors.subtext }}>
          上次验证：{formatRelativeTime(provider.lastVerified)}
        </Text>
      ) : null}

      {provider.authUrl && !provider.authorized ? (
        <Pressable
          onPress={handleAuthorize}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#174a42' : colors.primary,
            borderRadius: 12,
            paddingVertical: 10,
            alignItems: 'center',
            marginTop: 2,
          })}
        >
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>授权</Text>
        </Pressable>
      ) : null}

      {provider.raw !== undefined && !provider.authorized ? (
        <Text selectable style={{ fontSize: 11, lineHeight: 18, color: colors.subtext, marginTop: 2 }}>
          {typeof provider.raw === 'string' ? provider.raw : JSON.stringify(provider.raw, null, 2)}
        </Text>
      ) : null}
    </View>
  );
}
