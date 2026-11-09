import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { dayView, formatDuration, hourLabel } from '../../src/core/schedule';
import { useReady } from '../../src/data/store';
import { Fan } from '../../src/ui/Fan';
import { SectionTitle, SegmentList } from '../../src/ui/parts';
import { UpdateNotice } from '../../src/ui/UpdateNotice';
import { color, font } from '../../src/theme/tokens';

export default function Hoy() {
  const { now, schedules, circuit, circuits, setCircuit, timeFormat, status, sync, appUpdate } = useReady();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = useState(false);

  const today = dayView(schedules, circuit, now);
  const tomorrow = dayView(schedules, circuit, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const nowMinute = now.getHours() * 60 + now.getMinutes();
  const sameDay = status.until && status.until.toDateString() === now.toDateString();
  const nextChangeMinute = status.untilKnown && sameDay && status.until ? status.until.getHours() * 60 + status.until.getMinutes() : null;

  const word = !status.covered ? 'SIN DATOS' : status.hasLight ? 'HAY LUZ' : 'SIN LUZ';
  const wordColor = !status.covered ? color.smoke : status.hasLight ? color.glassOn : color.offText;
  const untilText = status.until
    ? `${status.hasLight ? 'hasta' : 'vuelve a'} las ${hourLabel(status.until.getHours() * 60 + status.until.getMinutes(), timeFormat)}${status.until.toDateString() === now.toDateString() ? '' : ' de mañana'}`
    : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: font.display, fontSize: 28, letterSpacing: 2, color: color.cal }}>LUMIO</Text>
        <Pressable
          onPress={() => setPicking(true)}
          accessibilityRole="button"
          accessibilityLabel={`Circuito ${circuit}, cambiar`}
          style={{ minHeight: 48, minWidth: 48, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: color.cal }}
        >
          <Text style={{ color: color.cal, fontWeight: '600', fontSize: 15 }}>Cto {circuit} ▾</Text>
        </Pressable>
      </View>

      {appUpdate && (
        <View style={{ marginTop: 14 }}>
          <UpdateNotice version={appUpdate.version} apk={appUpdate.apk} />
        </View>
      )}

      {today && (
        <View style={{ marginTop: 14, marginHorizontal: -4 }}>
          <Fan width={width - 32} lightPerSlot={today.slots} currentSlot={Math.floor(nowMinute / 180)} nowMinute={nowMinute} nextChangeMinute={nextChangeMinute} timeFormat={timeFormat} />
        </View>
      )}

      <Text accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 76, lineHeight: 78, color: wordColor, marginTop: 8 }}>
        {word}
      </Text>
      {status.covered && untilText && (
        <Text style={{ color: color.cal, fontSize: 18, marginTop: 4 }}>
          {untilText}
          {status.remainingMs !== null && (
            <Text>
              {' · '}
              {status.untilKnown ? 'faltan ' : 'al menos '}
              <Text style={{ fontWeight: '800' }}>{formatDuration(status.remainingMs)}</Text>
            </Text>
          )}
        </Text>
      )}
      {status.covered && !status.untilKnown && !status.until && (
        <Text style={{ color: color.smoke, fontSize: 16, marginTop: 4 }}>No tengo el horario más allá del último día cargado.</Text>
      )}
      {!status.covered && (
        <Text style={{ color: color.smoke, fontSize: 16, marginTop: 4 }}>No hay horario de este mes. Conéctate a internet para descargarlo.</Text>
      )}
      {sync === 'offline' && <Text style={{ color: color.smoke, fontSize: 13, marginTop: 8 }}>Sin conexión: se usa el horario guardado.</Text>}

      {today && (
        <>
          <SectionTitle>Hoy</SectionTitle>
          <SegmentList segments={today.segments} timeFormat={timeFormat} />
        </>
      )}
      {tomorrow && (
        <>
          <SectionTitle>Mañana</SectionTitle>
          <SegmentList segments={tomorrow.segments} timeFormat={timeFormat} />
        </>
      )}

      <Modal transparent animationType="fade" visible={picking} onRequestClose={() => setPicking(false)}>
        <Pressable onPress={() => setPicking(false)} style={{ flex: 1, backgroundColor: '#000A', justifyContent: 'center', padding: 28 }}>
          <View style={{ backgroundColor: color.wall2, borderRadius: 16, padding: 8 }}>
            <Text style={{ color: color.cal, fontFamily: font.displayMedium, fontSize: 22, padding: 14 }}>Tu circuito</Text>
            {circuits.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCircuit(c);
                  setPicking(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: c === circuit }}
                style={{ minHeight: 52, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 10, backgroundColor: c === circuit ? color.wall : 'transparent' }}
              >
                <Text style={{ color: c === circuit ? color.glassOn : color.cal, fontSize: 18, fontWeight: c === circuit ? '800' : '500' }}>
                  {c === circuit ? '● ' : '○ '}Circuito {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
