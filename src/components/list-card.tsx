import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Card, Chip } from 'heroui-native';
import { Text, View } from 'react-native';

type ListCardProps = {
  title: string;
  meta?: string;
  badge?: string;
  badgeTone?: 'default' | 'success' | 'muted' | 'warning' | 'danger';
  children?: ReactNode;
  icon?: LucideIcon;
};

const chipColorMap: Record<NonNullable<ListCardProps['badgeTone']>, { color: 'default' | 'success' | 'warning' | 'danger' | 'accent'; bg?: string; fg?: string }> = {
  default: { color: 'default' },
  success: { color: 'success' },
  muted: { color: 'default' },
  warning: { color: 'warning' },
  danger: { color: 'danger' },
};

export function ListCard({ title, meta, badge, badgeTone = 'default', children, icon: Icon }: ListCardProps) {
  const chipConfig = chipColorMap[badgeTone];

  return (
    <Card className="rounded-[16px] border border-[#efe7d9] bg-[#fbf8f2]">
      <Card.Body className="p-3.5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              {Icon ? <Icon color="#7d7468" size={16} /> : null}
              <Card.Title className="text-base font-semibold text-[#16181a]">{title}</Card.Title>
            </View>
            {meta ? <Text numberOfLines={1} className="mt-1 text-xs text-[#7d7468]">{meta}</Text> : null}
          </View>
          {badge ? (
            <Chip size="sm" variant="secondary" color={chipConfig.color}>
              <Chip.Label className="text-[10px] font-semibold uppercase tracking-[1px]">{badge}</Chip.Label>
            </Chip>
          ) : null}
        </View>
        {children ? <View className="mt-3">{children}</View> : null}
      </Card.Body>
    </Card>
  );
}
