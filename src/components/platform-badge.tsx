import { Text, View } from 'react-native';

const platformStyles: Record<string, { bg: string; text: string; label: string }> = {
  openai: { bg: '#dbeafe', text: '#1e40af', label: 'OpenAI' },
  claude: { bg: '#ffedd5', text: '#9a3412', label: 'Claude' },
  gemini: { bg: '#ede9fe', text: '#6d28d9', label: 'Gemini' },
  sora: { bg: '#fce7f3', text: '#be185d', label: 'Sora' },
};

const defaultStyle = { bg: '#f3f0e8', text: '#6f665c', label: '' };

type PlatformBadgeProps = { platform: string };

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const key = platform.toLowerCase();
  const style = platformStyles[key] ?? defaultStyle;
  const label = style.label || platform;

  return (
    <View style={{ backgroundColor: style.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: style.text }}>{label}</Text>
    </View>
  );
}
