import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Plus, Trash2 } from 'lucide-react-native';

const colors = {
  page: '#f4efe4',
  card: '#fbf8f2',
  text: '#16181a',
  subtext: '#6f665c',
  primary: '#1d5f55',
};

type KeyListCardProps = {
  title: string;
  keys: string[];
  /** Raw data shown as fallback when keys can't be extracted */
  rawData?: unknown;
  isLoading?: boolean;
  isMutating?: boolean;
  onAdd: (key: string) => void;
  onDelete: (key: string, index: number) => void;
};

function maskKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

export function extractKeys(data: unknown): { keys: string[]; isRaw: boolean } {
  if (data == null) return { keys: [], isRaw: false };

  // Direct array of strings
  if (Array.isArray(data)) {
    const strings = data.filter((item): item is string => typeof item === 'string');
    if (strings.length === data.length && data.length > 0) {
      return { keys: strings, isRaw: false };
    }
    if (strings.length > 0) return { keys: strings, isRaw: false };
  }

  // Single string
  if (typeof data === 'string' && data.length > 0) {
    return { keys: [data], isRaw: false };
  }

  // Object with array property
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    // Look for common key container properties, including hyphenated service responses.
    const propCandidates = [
      'keys',
      'api_keys',
      'apiKeys',
      'api-keys',
      'value',
      'items',
      'claude-api-key',
      'codex-api-key',
      'gemini-api-key',
      'openai-compatibility',
    ];

    for (const prop of propCandidates) {
      if (!(prop in obj)) continue;

      const val = obj[prop];
      if (val == null) {
        continue;
      }
      if (Array.isArray(val)) {
        const strings = val.filter((item): item is string => typeof item === 'string');
        if (strings.length > 0) return { keys: strings, isRaw: false };
        continue;
      }
      if (typeof val === 'string' && val.length > 0) {
        return { keys: [val], isRaw: false };
      }
    }

    // Check all properties for any array of strings
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) {
        const strings = val.filter((item): item is string => typeof item === 'string');
        if (strings.length > 0) return { keys: strings, isRaw: false };
      }
    }

    // Treat null-only response objects as empty state rather than raw JSON.
    const values = Object.values(obj);
    if (values.length > 0 && values.every((val) => val == null || (Array.isArray(val) && val.length === 0))) {
      return { keys: [], isRaw: false };
    }

    if (Object.keys(obj).length === 0) return { keys: [], isRaw: false };
  }

  // Fallback: unrecognized format
  return { keys: [], isRaw: true };
}

export function KeyListCard({
  title,
  keys,
  rawData,
  isLoading,
  isMutating,
  onAdd,
  onDelete,
}: KeyListCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (key: string, index: number) => {
    await Clipboard.setStringAsync(key);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleDelete = (key: string, index: number) => {
    Alert.alert('确认删除', `确定要删除该 key 吗？\n${maskKey(key)}`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => onDelete(key, index),
      },
    ]);
  };

  const handleAdd = () => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewKey('');
    setIsAdding(false);
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 12 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
        {isMutating && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {/* Raw data fallback */}
      {!isLoading && rawData !== undefined && (
        <Text selectable style={{ fontSize: 12, lineHeight: 20, color: colors.subtext }}>
          {JSON.stringify(rawData, null, 2)}
        </Text>
      )}

      {/* Empty state */}
      {!isLoading && rawData === undefined && keys.length === 0 && (
        <Text style={{ fontSize: 13, color: colors.subtext, paddingVertical: 8 }}>
          暂无配置
        </Text>
      )}

      {/* Key list */}
      {!isLoading && rawData === undefined && keys.map((key, index) => (
        <View
          key={`${key}-${index}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.page,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            gap: 8,
          }}
        >
          <Text
            selectable
            numberOfLines={1}
            style={{ flex: 1, fontSize: 13, color: colors.text, fontFamily: 'monospace' }}
          >
            {maskKey(key)}
          </Text>

          {copiedIndex === index ? (
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600', minWidth: 36, textAlign: 'center' }}>
              已复制
            </Text>
          ) : (
            <Pressable
              onPress={() => handleCopy(key, index)}
              hitSlop={8}
              style={{ padding: 4 }}
            >
              <Copy size={16} color={colors.subtext} />
            </Pressable>
          )}

          <Pressable
            onPress={() => handleDelete(key, index)}
            hitSlop={8}
            style={{ padding: 4 }}
            disabled={isMutating}
          >
            <Trash2 size={16} color="#c0392b" />
          </Pressable>
        </View>
      ))}

      {/* Add key input */}
      {isAdding && (
        <View style={{ gap: 8 }}>
          <TextInput
            value={newKey}
            onChangeText={setNewKey}
            placeholder="输入新的 API Key"
            placeholderTextColor="#b5ad9e"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: colors.page,
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 12,
              fontSize: 13,
              color: colors.text,
              fontFamily: 'monospace',
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handleAdd}
              disabled={!newKey.trim() || isMutating}
              style={{
                flex: 1,
                backgroundColor: !newKey.trim() ? '#c8c3b8' : colors.primary,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>确认</Text>
            </Pressable>
            <Pressable
              onPress={() => { setIsAdding(false); setNewKey(''); }}
              style={{
                flex: 1,
                backgroundColor: colors.page,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.subtext, fontSize: 14, fontWeight: '600' }}>取消</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Add button */}
      {!isAdding && !isLoading && rawData === undefined && (
        <Pressable
          onPress={() => setIsAdding(true)}
          disabled={isMutating}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#d9d3c7',
            borderStyle: 'dashed',
          }}
        >
          <Plus size={16} color={colors.primary} />
          <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>添加</Text>
        </Pressable>
      )}
    </View>
  );
}
