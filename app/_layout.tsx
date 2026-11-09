import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BarlowCondensed_600SemiBold, BarlowCondensed_800ExtraBold, useFonts } from '@expo-google-fonts/barlow-condensed';
import { StoreProvider } from '../src/data/store';
import { color } from '../src/theme/tokens';

export default function RootLayout() {
  const [loaded] = useFonts({ BarlowCondensed_600SemiBold, BarlowCondensed_800ExtraBold });
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.lead }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.lead } }} />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
