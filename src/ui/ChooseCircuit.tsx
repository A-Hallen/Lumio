import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useStore } from '../data/store';
import { Fan } from './Fan';
import { color, font } from '../theme/tokens';

// Adorno: un dia de muestra, sin significado, solo para que la pantalla de bienvenida tenga el abanico.
const SAMPLE = [true, false, true, true, false, true, false, true];

/** Primer uso: no hay circuito por defecto, la persona elige el suyo. */
export function ChooseCircuit() {
  const { circuits, setCircuit } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const fanWidth = Math.min(width - 40, 360);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.lead }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32, paddingHorizontal: 20 }}
    >
      <Text style={{ fontFamily: font.display, fontSize: 28, letterSpacing: 3, color: color.cal }}>LUMIO</Text>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Fan width={fanWidth} lightPerSlot={SAMPLE} currentSlot={-1} nowMinute={780} nextChangeMinute={null} showClock={false} />
      </View>

      <Text style={{ fontFamily: font.display, fontSize: 44, lineHeight: 44, color: color.glassOn, marginTop: 12 }}>
        ¿CUÁL ES{'\n'}TU CIRCUITO?
      </Text>
      <Text style={{ color: color.cal, fontSize: 17, lineHeight: 25, marginTop: 10 }}>
        Aparece en la tabla de horarios como «Cto». Elige el de tu casa y verás si hay luz ahora y hasta cuándo.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
        {circuits.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setCircuit(c);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Circuito ${c}`}
            style={({ pressed }) => ({
              minHeight: 64,
              minWidth: 88,
              paddingHorizontal: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              backgroundColor: pressed ? color.glassOn : color.wall2,
              borderWidth: 2,
              borderColor: pressed ? color.glassOn : color.glassOnDeep,
            })}
          >
            {({ pressed }) => (
              <Text style={{ fontFamily: font.display, fontSize: 30, color: pressed ? color.lead : color.cal }}>{c}</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Text style={{ color: color.smoke, fontSize: 14, marginTop: 20 }}>Puedes cambiarlo cuando quieras en Ajustes.</Text>
    </ScrollView>
  );
}
