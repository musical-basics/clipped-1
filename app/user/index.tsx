import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../lib/ThemeContext";
import { fontSize, spacing, radius } from "../../lib/theme";
import type { ThemeColors } from "../../lib/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Clipped</Text>
        <Text style={styles.tagline}>Capture · Review · Organize</Text>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push("/user/capture")}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={24} color="#FFFFFF" />
        <Text style={styles.startButtonText}>Start Working</Text>
      </TouchableOpacity>

      <View style={styles.secondaryButtons}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push("/user/settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.cardButtonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push("/user/settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.cardButtonText}>Help</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <Text style={styles.version}>Clipped v1.0.0</Text>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      backgroundColor: colors.textPrimary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      borderRadius: radius.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    startButtonText: {
      color: colors.bg,
      fontSize: fontSize.xl,
      fontWeight: "800",
    },
    secondaryButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    cardButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: colors.bgCard,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardButtonText: {
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
