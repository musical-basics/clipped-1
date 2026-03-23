import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="note/[id]"
          options={{
            headerShown: true,
            headerTitle: "Note",
            headerStyle: { backgroundColor: colors.bgElevated },
            headerTintColor: colors.textPrimary,
            presentation: "card",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
