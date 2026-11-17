import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '../data/store';
import { color, font } from '../theme/tokens';

/**
 * Pantalla que sustituye a toda la app cuando esta version ya no sirve (por ejemplo, el formato de los horarios cambio).
 * No se puede cerrar: la unica salida es descargar la version nueva.
 */
export function RequiredUpdate() {
  const { appUpdate, refresh, sync } = useStore();
  const insets = useSafeAreaInsets();
  if (!appUpdate) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.lead }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }}
    >
      <Animated.View entering={FadeInDown.duration(360).reduceMotion(ReduceMotion.System)}>
        <View
          style={{
            width: 72,
            height: 88,
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: color.turquoise,
            borderWidth: 4,
            borderColor: color.line,
          }}
        >
          <Ionicons name="arrow-down" size={42} color={color.lead} />
        </View>

        <Text accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 44, lineHeight: 44, color: color.cal, marginTop: 24 }}>
          HAY QUE{'\n'}ACTUALIZAR LUMIO
        </Text>
        <Text style={{ color: color.cal, fontSize: 17, lineHeight: 25, marginTop: 12 }}>
          Esta versión ya no se puede seguir usando. Descarga la {appUpdate.version} para volver a ver si hay luz.
        </Text>
        {appUpdate.notes ? <Text style={{ color: color.smoke, fontSize: 15, lineHeight: 22, marginTop: 8 }}>{appUpdate.notes}</Text> : null}

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            Linking.openURL(appUpdate.apk);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Descargar la versión ${appUpdate.version}`}
          style={({ pressed }) => ({
            marginTop: 28,
            minHeight: 56,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? color.glassOnDeep : color.glassOn,
          })}
        >
          <Text style={{ fontFamily: font.display, fontSize: 24, letterSpacing: 1, color: color.lead }}>DESCARGAR VERSIÓN {appUpdate.version}</Text>
        </Pressable>

        <Text style={{ color: color.smoke, fontSize: 14, lineHeight: 21, marginTop: 14 }}>
          Al terminar, abre el archivo descargado y toca «Instalar». Tus ajustes se conservan.
        </Text>

        <Pressable
          onPress={() => refresh()}
          disabled={sync === 'syncing'}
          accessibilityRole="button"
          style={{ marginTop: 16, minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={{ color: color.cal, fontSize: 15, fontWeight: '700' }}>{sync === 'syncing' ? 'Comprobando…' : 'Ya la instalé / volver a comprobar'}</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
