import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth";
import { backfillEmbeddings } from "../../lib/notes";
import { colors, fontSize, spacing, radius } from "../../lib/theme";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [backfilling, setBackfilling] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const handleBackfill = async () => {
    if (!user) return;
    setBackfilling(true);
    try {
      const count = await backfillEmbeddings(user.id);
      Alert.alert("Done", `${count} note(s) had their embeddings generated.`);
    } catch (err) {
      Alert.alert("Error", "Backfill failed. Check your API key.");
    } finally {
      setBackfilling(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeToggle}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              theme === "dark" && styles.themeOptionActive,
            ]}
            onPress={() => setTheme("dark")}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "dark" && styles.themeOptionTextActive,
              ]}
            >
              🌙 Dark
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeOption,
              theme === "light" && styles.themeOptionActive,
            ]}
            onPress={() => {
              setTheme("light");
              Alert.alert(
                "Coming Soon",
                "Light mode is coming in a future update!"
              );
              setTheme("dark");
            }}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "light" && styles.themeOptionTextActive,
              ]}
            >
              ☀️ Light
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tools</Text>
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

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

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
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "600",
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
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  themeOptionTextActive: {
    color: colors.textPrimary,
  },
  signOutButton: {
    backgroundColor: colors.error + "20",
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error + "40",
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
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
