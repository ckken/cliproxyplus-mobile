import { Tabs } from 'expo-router';
import { ChartPie, FileText, KeyRound, Settings2, ShieldCheck } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1d5f55', tabBarInactiveTintColor: '#8a8072' }}>
      <Tabs.Screen name="monitor" options={{ title: '概览', tabBarIcon: ({ color, size }) => <ChartPie color={color} size={size} /> }} />
      <Tabs.Screen name="keys" options={{ title: 'Keys', tabBarIcon: ({ color, size }) => <KeyRound color={color} size={size} /> }} />
      <Tabs.Screen name="auth" options={{ title: 'Auth', tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} /> }} />
      <Tabs.Screen name="logs" options={{ title: '日志', tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: '设置', tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} /> }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
