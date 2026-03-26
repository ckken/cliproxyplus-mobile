import { Separator } from 'heroui-native';
import { Text, View } from 'react-native';

type DetailRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

export function DetailRow({ label, value, isLast = false }: DetailRowProps) {
  return (
    <>
      <View className="flex-row items-start justify-between gap-4 py-3">
        <Text className="text-sm text-[#7d7468]">{label}</Text>
        <Text className="max-w-[62%] text-right text-sm font-medium text-[#16181a]">{value}</Text>
      </View>
      {!isLast && <Separator className="bg-[#eee6d7]" />}
    </>
  );
}
