import { Tabs } from 'expo-router';
import { BarChart3, FileText, KeyRound, Settings2 } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1d5f55', tabBarInactiveTintColor: '#8a8072' }}>
      <Tabs.Screen name="statistics" options={{ title: '统计', tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }} />
      <Tabs.Screen name="keys" options={{ title: 'Keys', tabBarIcon: ({ color, size }) => <KeyRound color={color} size={size} /> }} />
      <Tabs.Screen name="logs" options={{ title: '日志', tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: '设置', tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} /> }} />
    </Tabs>
  );
}
