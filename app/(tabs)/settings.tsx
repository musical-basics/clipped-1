import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth";
import { useThemeColors } from "../../lib/ThemeContext";
import { backfillEmbeddings } from "../../lib/notes";
import { fontSize, spacing, radius } from "../../lib/theme";
import type { ThemeColors } from "../../lib/theme";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { colors, mode, setMode } = useThemeColors();
  const [backfilling, setBackfilling] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Sign out?")) signOut();
    } else {
      const { Alert } = require("react-native");
      Alert.alert("Sign Out", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut },
      ]);
    }
  };

  const handleBackfill = async () => {
    if (!user) return;
    setBackfilling(true);
    try {
      const count = await backfillEmbeddings(user.id);
      if (Platform.OS === "web") {
        window.alert(`Done! ${count} note(s) had their embeddings generated.`);
      }
    } catch (err) {
      console.error("Backfill error:", err);
    } finally {
      setBackfilling(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Email</Text>
            <Text style={styles.cardValue}>{user?.email}</Text>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.themeToggle}>
            <TouchableOpacity
              style={[styles.themeOption, mode === "dark" && styles.themeOptionActive]}
              onPress={() => setMode("dark")}
              activeOpacity={0.8}
            >
              <Text style={[styles.themeOptionText, mode === "dark" && styles.themeOptionTextActive]}>
                🌙 Dark
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeOption, mode === "light" && styles.themeOptionActive]}
              onPress={() => setMode("light")}
              activeOpacity={0.8}
            >
              <Text style={[styles.themeOptionText, mode === "light" && styles.themeOptionTextActive]}>
                ☀️ Light
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOOLS</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={handleBackfill}
            disabled={backfilling}
            activeOpacity={0.7}
          >
            {backfilling ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Text style={styles.cardTitle}>🔄 Backfill Embeddings</Text>
                <Text style={styles.cardDescription}>
                  Generate missing embeddings for notes that don't have them
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/recently-deleted")}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle}>🗑 Recently Deleted</Text>
            <Text style={styles.cardDescription}>
              View and restore deleted notes (auto-removed after 30 days)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Clipped v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      color: colors.textPrimary,
      fontSize: fontSize.hero,
      fontWeight: "800",
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLabel: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      marginBottom: spacing.xs,
    },
    cardValue: {
      color: colors.textPrimary,
      fontSize: fontSize.md,
      fontWeight: "600",
    },
    cardTitle: {
      color: colors.textPrimary,
      fontSize: fontSize.md,
      fontWeight: "700",
      marginBottom: spacing.xs,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      lineHeight: 20,
    },
    themeToggle: {
      flexDirection: "row",
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeOption: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: "center",
      borderRadius: radius.md,
    },
    themeOptionActive: {
      backgroundColor: colors.accent,
    },
    themeOptionText: {
      color: colors.textMuted,
      fontSize: fontSize.md,
      fontWeight: "700",
    },
    themeOptionTextActive: {
      color: "#FFFFFF",
    },
    signOutButton: {
      backgroundColor: colors.error + "15",
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.error + "30",
      marginTop: spacing.lg,
    },
    signOutText: {
      color: colors.error,
      fontSize: fontSize.md,
      fontWeight: "700",
    },
    version: {
      color: colors.textMuted,
      fontSize: fontSize.xs,
      textAlign: "center",
      marginTop: spacing.lg,
    },
  });
