import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, spacing, radius } from "../../lib/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Clipped</Text>
        <Text style={styles.tagline}>Capture · Review · Organize</Text>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push("/(tabs)/capture")}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={24} color={colors.textPrimary} />
        <Text style={styles.startButtonText}>Start Working</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsLink}
        onPress={() => router.push("/(tabs)/settings")}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.settingsLinkText}>Settings</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <Text style={styles.version}>Clipped v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  startButton: {
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: "800",
  },
  settingsLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  settingsLinkText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  version: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
