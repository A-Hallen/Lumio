import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { apkForArchitectures } from '../../src/core/apk';
import { useReady } from '../../src/data/store';
import { APK_FALLBACK, REPO } from '../../src/config';
import { SectionTitle } from '../../src/ui/parts';
import { UpdateNotice } from '../../src/ui/UpdateNotice';
import { hourLabel } from '../../src/core/schedule';
import type { TimeFormat } from '../../src/core/time';
import { color, font } from '../../src/theme/tokens';

const FORMATS: { value: TimeFormat; label: string }[] = [
  { value: '12', label: '12 horas (am / pm)' },
  { value: '24', label: '24 horas' },
];

export default function Ajustes() {
  const { circuit, circuits, setCircuit, timeFormat, setTimeFormat, schedules, sync, refresh, appUpdate } = useReady();
  const insets = useSafeAreaInsets();
  const status = { idle: 'Sin comprobar', syncing: 'Buscando actualizaciones…', offline: 'Sin conexión', ok: 'Al día' }[sync];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 32, paddingHorizontal: 20 }}>
      <Text style={{ fontFamily: font.display, fontSize: 28, letterSpacing: 2, color: color.cal }}>AJUSTES</Text>

      <SectionTitle>Mi circuito</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
        {circuits.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCircuit(c)}
            accessibilityRole="radio"
            accessibilityState={{ selected: c === circuit }}
            style={{
              minHeight: 48,
              minWidth: 64,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: c === circuit ? color.glassOn : 'transparent',
              borderWidth: 1.5,
              borderColor: c === circuit ? color.glassOn : color.smoke,
            }}
          >
            <Text style={{ fontWeight: '800', fontSize: 17, color: c === circuit ? color.lead : color.cal }}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Formato de hora</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
        {FORMATS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setTimeFormat(f.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: f.value === timeFormat }}
            style={{
              minHeight: 48,
              paddingHorizontal: 16,
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: f.value === timeFormat ? color.glassOn : 'transparent',
              borderWidth: 1.5,
              borderColor: f.value === timeFormat ? color.glassOn : color.smoke,
            }}
          >
            <Text style={{ fontWeight: '800', fontSize: 16, color: f.value === timeFormat ? color.lead : color.cal }}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ color: color.smoke, fontSize: 13, marginTop: 8 }}>Ejemplo: {hourLabel(21 * 60, timeFormat)}</Text>

      <SectionTitle>Horarios</SectionTitle>
      <Text style={{ color: color.cal, fontSize: 16, marginTop: 6 }}>Meses cargados: {schedules.map((s) => s.month).join(', ')}</Text>
      <Text style={{ color: color.smoke, fontSize: 15, marginTop: 4 }}>Estado: {status}</Text>
      <Pressable
        onPress={refresh}
        accessibilityRole="button"
        style={{ marginTop: 12, minHeight: 48, borderRadius: 8, borderWidth: 1.5, borderColor: color.cal, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: color.cal, fontWeight: '700' }}>Buscar actualización de horarios</Text>
      </Pressable>
      <Text style={{ color: color.smoke, fontSize: 13, marginTop: 8 }}>
        Los horarios se guardan en el teléfono y todo funciona sin internet. Se actualizan solos cuando hay conexión, sin gastar casi datos.
      </Text>

      <SectionTitle>La app</SectionTitle>
      <Text style={{ color: color.cal, fontSize: 16, marginTop: 6 }}>Versión {Application.nativeApplicationVersion ?? '—'}</Text>
      {appUpdate && (
        <View style={{ marginTop: 10 }}>
          <UpdateNotice version={appUpdate.version} apk={appUpdate.apk} />
        </View>
      )}
      <Pressable onPress={() => Linking.openURL(apkForArchitectures(APK_FALLBACK, Device.supportedCpuArchitectures))} style={{ marginTop: 10, minHeight: 48, justifyContent: 'center' }}>
        <Text style={{ color: color.offText, textDecorationLine: 'underline' }}>Descargar la última versión</Text>
      </Pressable>
      <Text style={{ color: color.smoke, fontSize: 13, marginTop: 4 }}>github.com/{REPO}</Text>
    </ScrollView>
  );
}
