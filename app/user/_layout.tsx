import { Tabs, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import { useThemeColors } from "../../lib/ThemeContext";

const TAB_ROUTES = [
  "/user/capture",
  "/user/review",
  "/user/vault",
] as const;
const TAB_NAMES = ["capture", "review", "vault"];

export default function TabLayout() {
  const { signOut } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useThemeColors();

  // Tab key to switch between work tabs (web only)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();

        const currentTab = (segments as string[])[1] || "index";
        const currentIdx = TAB_NAMES.indexOf(currentTab as string);
        if (currentIdx === -1) {
          router.replace(TAB_ROUTES[0]);
          return;
        }
        const direction = e.shiftKey ? -1 : 1;
        const nextIdx =
          (currentIdx + direction + TAB_ROUTES.length) % TAB_ROUTES.length;
        router.replace(TAB_ROUTES[nextIdx]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [segments, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: "Capture",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: "Review",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
