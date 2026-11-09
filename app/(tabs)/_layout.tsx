import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color } from '../../src/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

const icon =
  (name: string) =>
  ({ color: tint, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={(focused ? name : `${name}-outline`) as IconName} size={24} color={tint as string} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.cal,
        tabBarInactiveTintColor: color.smoke,
        tabBarStyle: { backgroundColor: color.wall, borderTopColor: color.line, height: 68, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
        sceneStyle: { backgroundColor: color.lead },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoy', tabBarIcon: icon('sunny') }} />
      <Tabs.Screen name="semana" options={{ title: 'Semana', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="ajustes" options={{ title: 'Ajustes', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
