import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = { page: '#f4efe4', card: '#fbf8f2', text: '#16181a', subtext: '#6f665c', primary: '#1d5f55' };

export default function AccountsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.page }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>账号管理</Text>
          <Text style={{ marginTop: 6, fontSize: 13, color: '#8a8072' }}>管理多账号配置。</Text>
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ marginTop: 12, fontSize: 14, color: colors.subtext }}>加载中...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
