import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dayView, hourLabel } from '../../src/core/schedule';
import { useReady } from '../../src/data/store';
import { color, font } from '../../src/theme/tokens';

const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export default function Semana() {
  const { now, schedules, circuit } = useReady();
  const insets = useSafeAreaInsets();
  const days = Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32, paddingHorizontal: 20 }}>
      <Text style={{ fontFamily: font.display, fontSize: 28, letterSpacing: 2, color: color.cal }}>SEMANA · CTO {circuit}</Text>
      {days.map((d, i) => {
        const v = dayView(schedules, circuit, d);
        const light = v?.segments.filter((s) => s.hasLight) ?? [];
        const total = light.reduce((n, s) => n + (s.endMin - s.startMin), 0);
        return (
          <View key={i} style={{ marginTop: 18, paddingBottom: 12, borderBottomWidth: 3, borderBottomColor: color.line }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontFamily: font.displayMedium, fontSize: 22, color: color.cal }}>
                {i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : DAYS[d.getDay()]} · {d.getDate()}
              </Text>
              {v && <Text style={{ color: color.smoke }}>{Math.round(total / 60)} h de luz</Text>}
            </View>
            {!v && <Text style={{ color: color.smoke, marginTop: 6 }}>Horario aún no cargado</Text>}
            {v && (
              <View style={{ flexDirection: 'row', gap: 3, marginTop: 8, height: 30 }}>
                {v.slots.map((on, k) => (
                  <View
                    key={k}
                    style={{ flex: 1, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: on ? color.glassOn : color.glassOff, borderWidth: on ? 0 : 1.5, borderColor: color.glassOffEdge }}
                  />
                ))}
              </View>
            )}
            {v && (
              <Text style={{ color: color.smoke, marginTop: 8, fontSize: 15 }}>
                {light.length ? light.map((s) => `${hourLabel(s.startMin)}–${hourLabel(s.endMin)}`).join('  ·  ') : 'Sin luz todo el día'}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
