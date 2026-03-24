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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import { backfillEmbeddings } from "../../lib/notes";
import { colors, fontSize, spacing, radius } from "../../lib/theme";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [backfilling, setBackfilling] = useState(false);

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

      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/(tabs)/review")}
          activeOpacity={0.7}
        >
          <Ionicons name="layers-outline" size={20} color={colors.swipeMerge} />
          <Text style={styles.quickLinkText}>Review Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => router.push("/(tabs)/vault")}
          activeOpacity={0.7}
        >
          <Ionicons name="library-outline" size={20} color={colors.swipeKeep} />
          <Text style={styles.quickLinkText}>Open Vault</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SETTINGS</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? "—"}</Text>
        </View>

        <TouchableOpacity
          style={[styles.card, { marginTop: spacing.sm }]}
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
                Generate missing embeddings for notes
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
  hero: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
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
  quickLinks: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickLink: {
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
  quickLinkText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  section: {
    marginBottom: spacing.md,
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
