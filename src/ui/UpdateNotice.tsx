import { Linking, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { color, font } from '../theme/tokens';

/**
 * Aviso de version nueva. El cristal en arco (la forma de las ventanas del abanico) lleva la flecha de descarga,
 * en turquesa para no confundirse con los colores de estado: ambar es luz y rojo es el proximo cambio.
 */
export function UpdateNotice({ version, apk }: { version: string; apk: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(320).reduceMotion(ReduceMotion.System)}>
      <Pressable
        onPress={() => Linking.openURL(apk)}
        accessibilityRole="button"
        accessibilityLabel={`Descargar la versión ${version}`}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          minHeight: 72,
          padding: 12,
          borderRadius: 14,
          backgroundColor: pressed ? color.wall : color.wall2,
          borderBottomWidth: 3,
          borderBottomColor: color.line,
        })}
      >
        <View
          style={{
            width: 44,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
            backgroundColor: color.turquoise,
            borderWidth: 3,
            borderColor: color.line,
          }}
        >
          <Ionicons name="arrow-down" size={26} color={color.lead} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, lineHeight: 26, letterSpacing: 0.5, color: color.cal }}>VERSIÓN {version} DISPONIBLE</Text>
          <Text style={{ color: color.smoke, fontSize: 14, marginTop: 2 }}>Toca para descargarla e instalarla</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
