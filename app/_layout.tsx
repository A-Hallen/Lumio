import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BarlowCondensed_600SemiBold, BarlowCondensed_800ExtraBold, useFonts } from '@expo-google-fonts/barlow-condensed';
import { StoreProvider, useStore } from '../src/data/store';
import { ChooseCircuit } from '../src/ui/ChooseCircuit';
import { color } from '../src/theme/tokens';

/** Hasta que la persona elige su circuito no hay pestañas: solo la pantalla de bienvenida. */
function CircuitGate({ children }: { children: ReactNode }) {
  const { ready, circuit } = useStore();
  if (!ready) return null;
  if (circuit === null) return <ChooseCircuit />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({ BarlowCondensed_600SemiBold, BarlowCondensed_800ExtraBold });
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.lead }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="light" />
          <CircuitGate>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.lead } }} />
          </CircuitGate>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
