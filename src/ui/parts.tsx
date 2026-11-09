import { Text, View } from 'react-native';
import { hourLabel, type Segment } from '../core/schedule';
import { color, font } from '../theme/tokens';

/** Estado con relleno o filo + texto, nunca solo color. */
export function StatePill({ on }: { on: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 4,
        backgroundColor: on ? color.glassOn : 'transparent',
        borderWidth: 1.5,
        borderColor: on ? color.glassOn : color.glassOffEdge,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1, color: on ? color.lead : color.offText }}>{on ? 'HAY LUZ' : 'SIN LUZ'}</Text>
    </View>
  );
}

export function SegmentList({ segments }: { segments: Segment[] }) {
  return (
    <View>
      {segments.map((s) => (
        <View
          key={s.startMin}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 52, borderBottomWidth: 3, borderBottomColor: color.line }}
        >
          <Text style={{ fontFamily: font.displayMedium, fontSize: 24, color: s.hasLight ? color.cal : color.smoke, letterSpacing: 0.5 }}>
            {hourLabel(s.startMin)} – {hourLabel(s.endMin)}
          </Text>
          <StatePill on={s.hasLight} />
        </View>
      ))}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: font.displayMedium, fontSize: 15, letterSpacing: 1.6, textTransform: 'uppercase', color: color.smoke, marginTop: 26, marginBottom: 4 }}>
      {children}
    </Text>
  );
}
