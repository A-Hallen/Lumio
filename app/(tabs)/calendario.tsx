import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MONTHS, WEEKDAYS, availableDays, monthGrid, monthKeyOf, monthTitle, nearestDay } from '../../src/core/calendar';
import { dayView } from '../../src/core/schedule';
import { useReady } from '../../src/data/store';
import { SectionTitle, SegmentList } from '../../src/ui/parts';
import { color, font } from '../../src/theme/tokens';

const WEEK_HEAD = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const GAP = 3;

type Picked = { month: string; day: number };

export default function Calendario() {
  const { now, schedules, circuit, timeFormat } = useReady();
  const insets = useSafeAreaInsets();
  const months = useMemo(() => [...schedules].sort((a, b) => a.month.localeCompare(b.month)), [schedules]);
  const todayKey = monthKeyOf(now);
  const today = now.getDate();

  const [picked, setPicked] = useState<Picked>(() => {
    const m = months.find((s) => s.month === todayKey) ?? months.find((s) => s.month > todayKey) ?? months[months.length - 1];
    return { month: m.month, day: nearestDay(m, m.month === todayKey ? today : 1) ?? 1 };
  });

  const index = Math.max(0, months.findIndex((s) => s.month === picked.month));
  const current = months[index];
  const available = useMemo(() => new Set(availableDays(current)), [current]);
  const [year, month0] = current.month.split('-').map((n, i) => (i ? Number(n) - 1 : Number(n)));
  const date = new Date(year, month0, picked.day);
  const view = dayView(schedules, circuit, date);
  const isToday = current.month === todayKey && picked.day === today;
  const canGoToday = !isToday && months.some((s) => s.month === todayKey && availableDays(s).includes(today));

  const light = view?.segments.filter((s) => s.hasLight) ?? [];
  const lightMin = light.reduce((n, s) => n + (s.endMin - s.startMin), 0);

  const pickDay = (day: number) => {
    Haptics.selectionAsync().catch(() => {});
    setPicked({ month: current.month, day });
  };
  const goMonth = (delta: number) => {
    const next = months[index + delta];
    if (!next) return;
    Haptics.selectionAsync().catch(() => {});
    setPicked({ month: next.month, day: nearestDay(next, picked.day) ?? 1 });
  };
  const goToday = () => {
    Haptics.selectionAsync().catch(() => {});
    setPicked({ month: todayKey, day: today });
  };

  const title = `${WEEKDAYS[date.getDay()]} ${picked.day} de ${MONTHS[month0]}`;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32, paddingHorizontal: 20 }}>
      <Text style={{ fontFamily: font.display, fontSize: 28, letterSpacing: 2, color: color.cal }}>CALENDARIO · CTO {circuit}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        {months.length > 1 ? (
          <MonthButton icon="chevron-back" label="Mes anterior" disabled={index === 0} onPress={() => goMonth(-1)} />
        ) : (
          <View style={{ width: 8 }} />
        )}
        <Text accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 30, letterSpacing: 1, color: color.cal, textTransform: 'uppercase' }}>
          {monthTitle(current.month)}
        </Text>
        {months.length > 1 ? (
          <MonthButton icon="chevron-forward" label="Mes siguiente" disabled={index === months.length - 1} onPress={() => goMonth(1)} />
        ) : (
          <View style={{ width: 8 }} />
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: GAP, marginTop: 10, paddingHorizontal: GAP }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {WEEK_HEAD.map((l, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: color.smoke, fontSize: 13, fontWeight: '700' }}>
            {l}
          </Text>
        ))}
      </View>

      {/* Rejilla como un vitral: cada dia es un cristal y el plomo es el hueco entre ellos. */}
      <View style={{ marginTop: 6, padding: GAP, gap: GAP, borderRadius: 14, backgroundColor: color.line }}>
        {monthGrid(current.month).map((week, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: GAP }}>
            {week.map((d, c) => {
              if (d === null) return <View key={c} style={{ flex: 1, minHeight: 46 }} />;
              const has = available.has(d);
              const selected = d === picked.day;
              const isNow = current.month === todayKey && d === today;
              return (
                <Pressable
                  key={c}
                  disabled={!has}
                  onPress={() => pickDay(d)}
                  accessibilityRole="button"
                  accessibilityLabel={`${isNow ? 'Hoy, ' : ''}${d} de ${MONTHS[month0]}${has ? '' : ', sin horario'}`}
                  accessibilityState={{ selected, disabled: !has }}
                  style={{
                    flex: 1,
                    minHeight: 46,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 9,
                    backgroundColor: selected ? color.glassOn : has ? color.wall2 : color.wall,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: font.displayMedium,
                      fontSize: 21,
                      color: selected ? color.lead : has ? color.cal : color.smoke,
                      opacity: has ? 1 : 0.45,
                    }}
                  >
                    {d}
                  </Text>
                  {isNow && (
                    <View style={{ position: 'absolute', bottom: 6, width: 16, height: 3, borderRadius: 2, backgroundColor: selected ? color.lead : color.cal }} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={{ color: color.smoke, fontSize: 13, marginTop: 8 }}>La raya bajo el número marca hoy.</Text>

      <Animated.View key={`${current.month}-${picked.day}`} entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)}>
        <SectionTitle>{isToday ? 'Hoy' : 'Día elegido'}</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ flex: 1, fontFamily: font.display, fontSize: 32, lineHeight: 34, color: color.cal, textTransform: 'uppercase' }}>{title}</Text>
          {view && <Text style={{ color: color.smoke, fontSize: 15 }}>{Math.round(lightMin / 60)} h de luz</Text>}
        </View>

        {!view && <Text style={{ color: color.smoke, marginTop: 8 }}>Horario aún no cargado para este día.</Text>}
        {view && (
          <>
            <View style={{ flexDirection: 'row', gap: 3, marginTop: 12, height: 30 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {view.slots.map((on, k) => (
                <View
                  key={k}
                  style={{ flex: 1, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: on ? color.glassOn : color.glassOff, borderWidth: on ? 0 : 1.5, borderColor: color.glassOffEdge }}
                />
              ))}
            </View>
            <View style={{ marginTop: 10 }}>
              <SegmentList segments={view.segments} timeFormat={timeFormat} />
            </View>
          </>
        )}

        {canGoToday && (
          <Pressable
            onPress={goToday}
            accessibilityRole="button"
            style={{ marginTop: 16, minHeight: 48, borderRadius: 8, borderWidth: 1.5, borderColor: color.cal, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: color.cal, fontWeight: '700' }}>Volver a hoy</Text>
          </Pressable>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function MonthButton({ icon, label, disabled, onPress }: { icon: 'chevron-back' | 'chevron-forward'; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        backgroundColor: pressed ? color.wall2 : 'transparent',
        opacity: disabled ? 0.3 : 1,
      })}
    >
      <Ionicons name={icon} size={26} color={color.cal} />
    </Pressable>
  );
}
