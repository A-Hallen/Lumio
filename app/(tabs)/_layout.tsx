import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { color } from '../../src/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

const icon =
  (name: string) =>
  ({ color: tint, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={(focused ? name : `${name}-outline`) as IconName} size={24} color={tint as string} />
  );

// Desde Android 15 la app se dibuja bajo la barra de navegacion del sistema (los botones o el gesto):
// con una altura fija la barra de pestañas quedaba tapada, asi que se le suma el margen inferior.
const BAR_HEIGHT = 68;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.cal,
        tabBarInactiveTintColor: color.smoke,
        tabBarStyle: { backgroundColor: color.wall, borderTopColor: color.line, height: BAR_HEIGHT + insets.bottom, paddingTop: 6, paddingBottom: insets.bottom },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
        sceneStyle: { backgroundColor: color.lead },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoy', tabBarIcon: icon('sunny') }} />
      <Tabs.Screen name="calendario"options={{ title: 'Calendario', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="ajustes" options={{ title: 'Ajustes', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
